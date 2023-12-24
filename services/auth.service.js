const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { DB } = require("../utils/db")
const { Logger } = require('../utils/logger')
const { badRequest, notFound, ok, error } = require('../utils/response')
const { invalidEmail } = require("../validators/email.validator")
const { invalidPassword } = require("../validators/password.validator")
const { JWT_ACCESS_TIMEOUT, JWT_REFRESH_TIMEOUT, PASSWORD_SALT_ROUNDS } = require('../constants')
//TODO: Add BP login logic to the current auth
exports.adminLogin = async ({ email, password }) => {
    try {
        if (invalidEmail(email)) {
            return badRequest('Invalid credentials')
        }
        if (invalidPassword(password)) {
            return badRequest('Invalid credentials')
        }

        const users = await DB.pg
            .column(['email', 'password', 'role', 'shouldResetPassword', 'languageCulture', 'isActive', 'practiceId'])
            .select()
            .from('User')
            .where('email', email)
            .first()

        if (users === undefined || users === null || users.length === 0) {
            return notFound('User was not found');
        }

        const user = users[0]
        if (!user.isActive) {
            return notFound('User was not found')
        }

        delete user.isActive
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return badRequest('Invalid credentials')
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

exports.resetPassword = async ({ email, oldPassword, newPassword }) => {
    try {
        if (invalidEmail(email)) {
            return badRequest('Invalid credentials')
        }
        if (invalidPassword(oldPassword) || invalidPassword(newPassword)) {
            return badRequest('Invalid credentials')
        }

        const users = await DB.pg
            .column(['email', 'password', 'isActive', 'shouldResetPassword'])
            .select()
            .from('User')
            .where('email', email)
            .first()

        if (users === undefined || users === null || users.length === 0) {
            return notFound('User was not found')
        }

        const user = users[0]
        if (!user.isActive) {
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

exports.adminRefresh = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH)
        const accessToken = jwt.sign({ user: decoded.user }, process.env.JWT_SECRET_ACCESS, { expiresIn: JWT_ACCESS_TIMEOUT })

        return ok({ accessToken, user: decoded.user })

    } catch (err) {
        Logger.e('services -> auth.service -> adminRefresh: ' + err.message, err)
        return error()
    }
}
