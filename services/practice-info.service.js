const { DB } = require("../utils/db")
const { Logger } = require('../utils/logger')
const { S3Manager } = require('../utils/s3')
const { badRequest, notFound, unauthorized, error, ok } = require("../utils/response")
const { invalidId } = require('../validators/id.validator')
const { practiceInfoValidationResult } = require("../validators/practice-info.validator")
const { ALLOWED_IMG_EXTENSIONS, MAX_FILE_SIZE } = require("../constants")
const { fileValidationResult } = require('../validators/file.validator')

exports.getAdminPracticeInfo = async ({ id }, role) => {
    try {
        if (role !== 0) {
            return unauthorized();
        }
        if (invalidId(id)) {
            return badRequest('Invalid request')
        }

        const practices = await DB.pg
            .select()
            .from('Practice')
            .where('id', id)
            .first()

        const practice = practices[0]
        if (!practice) {
            return notFound('Practice does not exist')
        }

        practice.logoUrl && (practice.logo = await S3Manager.get(practice.logoUrl))

        return ok(practice)

    } catch (err) {
        Logger.e('services -> practice-info.service -> getAdminPracticeInfo: ' + err.message, err)
        return error()
    }
}

exports.putAdminPracticeInfo = async (practiceInfo, role, file) => {
    try {
        if (role !== 0) {
            return unauthorized()
        }

        const result = practiceInfoValidationResult(practiceInfo)
        if (result.invalid) {
            return badRequest(result.msg)
        }

        const fileResult = fileValidationResult(file, MAX_FILE_SIZE, ALLOWED_IMG_EXTENSIONS)
        if (fileResult.invalid) {
            return badRequest(fileResult.msg)
        }

        let id = undefined;
        const actualPracticeInfo = (await DB.pg.select('Practice').where('id', practiceInfo.id).first())[0]
        practiceInfo.lastUpdated = new Date().toISOString()

        if (file) {
            actualPracticeInfo?.id && actualPracticeInfo.logoUrl && await S3Manager.delete(actualPracticeInfo.logoUrl)
            practiceInfo.logoUrl = await S3Manager.put('practice-info', file)
        }
        if (actualPracticeInfo) {
            const newPracticeInfo = { ...practiceInfo }
            delete newPracticeInfo.id
            await DB.pg('Practice').where('id', practiceInfo.id).update(newPracticeInfo)
            id = practiceInfo.id
        } else {
            const result = (await DB.pg('Practice').insert(practiceInfo, ['id']))[0]
            result && (id = result)
        }

        return ok({ id })

    } catch (err) {
        Logger.e('services -> practice-info.service -> putAdminPracticeInfo: ' + err.message, err)
        return error()
    }
}
