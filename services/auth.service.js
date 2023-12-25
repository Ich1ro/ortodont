const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { DB } = require("../utils/db")
const { Logger } = require('../utils/logger')
const { badRequest, notFound, ok, error, unauthorized } = require('../utils/response')
const { invalidEmail } = require("../validators/email.validator")
const { invalidPassword } = require("../validators/password.validator")
const { JWT_ACCESS_TIMEOUT, JWT_REFRESH_TIMEOUT, PASSWORD_SALT_ROUNDS } = require('../constants')
const { decrypt } = require('../utils/aes')

exports.adminLogin = async ({ email, password }) => {
    try {
        if (invalidEmail(email)) {
            Logger.i('User email is invalid: ' + email)
            return unauthorized()
        }
        if (invalidPassword(password)) {
            Logger.i('User password is invalid for: ' + email)
            return unauthorized()
        }

        const user = (await DB.pg
            .column(['email', 'password', 'role', 'shouldResetPassword', 'languageCulture', 'isActive', 'practiceId'])
            .select()
            .from('User')
            .where('email', email)
            .first())[0]

        if (!user || !user.isActive) {
            delete user.password
            Logger.i('User is not found by email: ' + email)
            return unauthorized()
        }

        delete user.isActive
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            delete user.password
            Logger.i('User password does not match their current one for: ' + JSON.stringify(user))
            return unauthorized()
        }

        delete user.password
        const accessToken = jwt.sign({ user }, process.env.JWT_SECRET_ACCESS, { expiresIn: JWT_ACCESS_TIMEOUT })
        const refreshToken = jwt.sign({ user }, process.env.JWT_SECRET_REFRESH, { expiresIn: JWT_REFRESH_TIMEOUT })

        delete user.practiceId
        return ok({ accessToken, refreshToken, user })
    } catch (err) {
        Logger.e('services -> auth.service -> adminLogin: ' + err.message, err)
        return error()
    }
}

exports.login = async (p, id, patientData) => {
    try {
        if (p === null || p === undefined || id === null || id === undefined) {
            Logger.i('Query parameters are null or undefined')
            return unauthorized()
        }
        if (patientData.lastName === undefined || patientData.lastName === null) {
            Logger.i('Patient last name is null or undefined: ' + id)
            return unauthorized()
        }
        if (patientData.patientNumber === undefined || patientData.patientNumber === null) {
            Logger.i('Patient patient number is null or undefined: ' + id)
            return unauthorized()
        }

        const patient = (await DB.pg('PatientAes')
            .join('Patient', 'PatientAes.patientId', '=', 'Patient.id')
            .select(DB.pg.raw(`PatientAes.*, Patient.patientNumber as patientNumber, Patient.email as email, Patient.practiceId as practiceId, Patient.lastName as lastName`))
            .where('Patient.id', id)
            .first())[0]

        if (!patient) {
            Logger.i('Patient is not found by id: ' + id)
            return unauthorized()
        }

        if (patient.iv === null || patient.tag === null) {
            Logger.i('Cipher components absent for patient: ' + id)
            return unauthorized()
        }
        
        const decrypted = decrypt(p, patient.iv, patient.tag)
        if (!decrypted) {
            Logger.i('Patient info decryption failed: ' + id)
            return unauthorized()
        }

        const decryptedObj = JSON.parse(decrypted)
        if (decryptedObj.lastName !== patient.lastName || decryptedObj.patientNumber !== patient.patientNumber) {
            Logger.i('Decrypted patient info discrepancy for patient: ' + decrypted)
            return unauthorized()
        }
        if (decryptedObj.lastName !== patientData.lastName || decryptedObj.patientNumber !== patientData.patientNumber) {
            Logger.i('Decrypted patient info discrepancy for patient rquest body. Decrypted: ' + decrypted + " | Patient request body: " + JSON.stringify(patientData))
            return unauthorized()
        }

        const patientForToken = {
            id: patient.id,
            patientNumber: patient.patientNumber,
            email: patient.email,
            role: 2,
            practiceId: patient.practiceId
        }

        const accessToken = jwt.sign({ user: patientForToken }, process.env.JWT_SECRET_ACCESS, { expiresIn: JWT_ACCESS_TIMEOUT })
        const refreshToken = jwt.sign({ user: patientForToken }, process.env.JWT_SECRET_REFRESH, { expiresIn: JWT_REFRESH_TIMEOUT })

        return ok({ accessToken, refreshToken, user })

    } catch (err) {
        Logger.e('services -> auth.service -> login: ' + err.message, err)
        return error()
    }
}

exports.resetPassword = async (authUser, { email, oldPassword, newPassword }) => {
    try {
        if (!authUser || authUser.role === 2) {
            return unauthorized()
        }
        if (invalidEmail(email)) {
            return badRequest('Invalid credentials')
        }
        if (invalidPassword(oldPassword) || invalidPassword(newPassword)) {
            return badRequest('Invalid credentials')
        }

        const user = (await DB.pg
            .column(['email', 'password', 'isActive', 'shouldResetPassword'])
            .select()
            .from('User')
            .where('email', email)
            .first())[0]

        if (!user || !user.isActive) {
            return notFound('User was not found')
        }

        if (!user.shouldResetPassword) {
            return badRequest('User was not prompted to reset password')
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
        if (!isPasswordValid) {
            return badRequest('Invalid old password')
        }

        const salt = await bcrypt.genSalt(PASSWORD_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        await DB.pg('User')
            .where('email', email)
            .update({ password: hashedPassword, shouldResetPassword: false })

        return ok();

    } catch (err) {
        Logger.e('services -> auth.service -> resetPassword: ' + err.message, err)
        return error()
    }
}

exports.refresh = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH)
        const accessToken = jwt.sign({ user: decoded.user }, process.env.JWT_SECRET_ACCESS, { expiresIn: JWT_ACCESS_TIMEOUT })

        return ok({ accessToken, user: decoded.user })

    } catch (err) {
        Logger.e('services -> auth.service -> refresh: ' + err.message, err)
        return error()
    }
}
