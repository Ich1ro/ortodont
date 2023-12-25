const crypto = require('crypto')
const { ENCRYPTION_ALGORITHM } = require('../constants')

exports.encrypt = (str) => {
    if (!process.env.ENCRYPTION_KEY) {
        return { encrypted: '', iv: '', tag: '' }
    }
    const iv = crypto.randomBytes(12).toString('base64')
    const cipher = crypto.createCipheriv(
        ENCRYPTION_ALGORITHM,
        Buffer.from(process.env.ENCRYPTION_KEY, 'base64'),
        Buffer.from(iv, 'base64')
    )

    let ciphertext = cipher.update(str, 'utf8', 'base64')
    ciphertext += cipher.final('base64')

    const tag = cipher.getAuthTag().toString('base64')
    return { encrypted: ciphertext, iv, tag }
}

exports.decrypt = (encryptedStr, iv, tag) => {
    const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        Buffer.from(process.env.ENCRYPTION_KEY, 'base64'),
        Buffer.from(iv, 'base64')
    );

    decipher.setAuthTag(Buffer.from(tag, 'base64'));

    let plaintext = decipher.update(encryptedStr, 'base64', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
}