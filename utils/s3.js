const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3")
const { v4 } = require('uuid')
const path = require('path')
const { Logger } = require("./logger")

exports.S3Manager = class S3 {
    static _instance

    /**
     * @returns {S3Client} S3 Client
     */
    static instance() {
        if (this._instance === undefined) {
            const config = {
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY,
                    secretAccessKey: process.env.AWS_SECRET_KEY,
                }
            }

            this._instance = new S3Client(config)
        }

        return this._instance
    }

    static async get(key) {
        try {
            const result = await this.instance().send(new GetObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: key,
            }))

            const bytes = await result.Body.transformToByteArray()
            const base64 = Buffer.from(bytes).toString('base64')
            const extension = path.extname(key).toLowerCase().replace('.', '')
            return `data:image/${extension};base64, ${base64}`
        } catch (err) {
            Logger.e('utils -> S3 -> get: ' + err.message, err)
            return ''
        }
    }

    static async img(key) {
        try {
            const result = await this.instance().send(new GetObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: key,
            }))

            if (result.$metadata.httpStatusCode !== 200) {
                return {
                    status: result.$metadata.httpStatusCode
                }
            }

            const bytes = await result.Body.transformToByteArray()
            const base64 = Buffer.from(bytes, 'base64')
            const extension = path.extname(key).toLowerCase().replace('.', '')
            return {
                status: 200,
                type: `image/${extension}`,
                img: base64
            }
        } catch (err) {
            Logger.e('utils -> S3 -> img: ' + err.message, err)
            return null
        }
    }

    static async put(folder, file) {
        try {
            const newImgKey = folder + '/' + v4() + path.extname(file.originalname).toLowerCase()
            await this.instance().send(new PutObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: newImgKey,
                Body: file.buffer
            }))

            return newImgKey
        } catch (err) {
            Logger.e('utils -> S3 -> put: ' + err.message, err)
            return ''
        }
    }

    static async delete(key) {
        try {
            await this.instance().send(new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: key,
            }))
        } catch (err) {
            Logger.e('utils -> S3 -> delete: ' + err.message, err)
        }
    }
}
