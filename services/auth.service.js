const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { DB } = require("../utils/db")
const { Logger } = require('../utils/logger')
const { badRequest, notFound, ok, error } = require('../utils/response')
const { invalidEmail } = require("../validators/email.validator")
const { invalidPassword } = require("../validators/password.validator")
const { JWT_ACCESS_TIMEOUT, JWT_REFRESH_TIMEOUT, PASSWORD_SALT_ROUNDS } = require('../constants')

exports.adminLogin = async ({ email, password }) => {
    try {
        if (invalidEmail(email)) {
            return badRequest('Invalid login or password')
        }
        if (invalidPassword(password)) {
            return badRequest('Invalid login or password')
        }

        const users = await DB.pg
            .select(['email', 'password', 'role', 'shouldResetPassword', 'languageCulture', 'isActive'])
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
            return badRequest('Invalid login or password')
        }

        const accessToken = jwt.sign({ user }, process.env.JWT_SECRET_ACCESS, { expiresIn: JWT_ACCESS_TIMEOUT })
        const refreshToken = jwt.sign({ user }, process.env.JWT_SECRET_REFRESH, { expiresIn: JWT_REFRESH_TIMEOUT })

        return ok({ accessToken, refreshToken, user })
    } catch (err) {
        Logger.e('services -> auth.service -> adminLogin: ' + err.message, err)
        return error()
    }
}

exports.resetPassword = async ({ email, oldPassword, newPassword }) => {
    try {
        if (invalidEmail(email)) {
            return badRequest('Invalid login or password')
        }
        if (invalidPassword(oldPassword) || invalidPassword(newPassword)) {
            return badRequest('Invalid login or password')
        }

        const users = await DB.pg
            .select(['email', 'password', 'isActive'])
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

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
        if (!isPasswordValid) {
            return badRequest('Invalid old password')
        }

        const salt = await bcrypt.genSalt(PASSWORD_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        await DB.pg('User')
            .where({ email })
            .update({ password: hashedPassword })

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
