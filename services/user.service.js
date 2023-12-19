const bcrypt = require('bcrypt')
const generator = require('generate-password')
const { PASSWORD_SALT_ROUNDS, CODE_EXP } = require("../constants")
const { DB } = require('../utils/db')
const { sendEmails } = require('../utils/email-sender')
const { Logger } = require('../utils/logger')
const { badRequest, notFound, ok, error } = require('../utils/response')
const { invalidEmail } = require('../validators/email.validator')
const { invalidPassword } = require('../validators/password.validator')
const { userValidationResult } = require('../validators/user.validator')
const { adminTablesPagination, adminTablesPatch, adminTablesDelete } = require("./admin-table.service")

exports.listAdminUsers = async ({ practiceId, lastId, size, search, sortDir, sortBy }, role) => {
    return await adminTablesPagination({ practiceId, lastId, size, search, sortDir, sortBy },
        role, 'User', 'services -> user.service -> listAdminUsers',
        ['id', 'practiceId', 'name', 'email', 'role', 'isActive', 'languageCulture'])
}

exports.patchMyProfile = async ({ user }) => {
    try {
        if (!user) {
            return badRequest('Invalid object was sent')
        }

        if (user.code === undefined || user.code === null) {
            return badRequest('Invalid credentials')
        }

        if (!invalidEmail(user.email)) {
            return badRequest('Invalid credentials')
        }

        if (password && !invalidPassword(user.password)) {
            return badRequest('Invalid credentials')
        }

        const userByEmailAndCode = (await DB.pg.select('codeExpiration').from('User').where('email', user.email).andWhere('code', user.code).first())[0]
        if (!userByEmailAndCode || Math.floor(new Date(userByEmailAndCode.codeExpiration).getTime() / 1e3) < Math.floor(new Date().getTime() / 1e3)) {
            return badRequest('Invalid credentials')
        }

        const userToSave = {
            email: user.email,
        }

        if (user.password) {
            const salt = bcrypt.genSaltSync(PASSWORD_SALT_ROUNDS)
            userToSave.password = bcrypt.hashSync(user.password, salt)
        }

        await DB.pg('User').where('id', user.id).update(userToSave)

        return ok()

    } catch (err) {
        Logger.e("services -> user.service -> patchMyProfile: " + err.message, err)
        return error()
    }
}

exports.sendConfirmationCode = async ({ user }) => {
    try {
        if (!user) {
            return badRequest('Invalid object was sent')
        }
        if (user.email) {
            if (!invalidEmail(user.email)) {
                return badRequest('Invalid credentials')
            }

            const userById = (await DB.pg.select('email').from('User').where('id', user.id).first())[0]
            if (!userById) {
                return notFound()
            }

            if (user.email !== userById.email) {
                const userByEmail = (await DB.pg.select().from('User').where('email', user.email).first())[0]
                if (userByEmail) {
                    return badRequest('User with this email is already exist')
                }
            }

            const code = generator.generate({ numbers: true, strict: true, length: 4 }).toUpperCase()
            const codeExpiration = new Date(new Date().getTime() + CODE_EXP).toISOString()

            await DB.pg('User').where('id', user.id).update({ code, codeExpiration })

            const emailToSend = {
                name: user.email,
                email: user.email,
                htmlContent: `<html><body>Hello, ${user.email}<br/> This is a confirmation code to verify your email address: ${code} It will expire in 15 minutes. <br/> Financial Consult Form <br/>`
            }

            await sendEmails([emailToSend], { name: 'Financial Consult Form', email: 'fcf@gmail.com' })
        }

        return ok()
    } catch (err) {
        Logger.e("services -> user.service -> sendConfirmationCode: " + err.message, err)
        return error()
    }
}

exports.patchAdminUsers = async ({ itemsToCreate, itemsToUpdate }, user) => {
    const passwordsToSend = [];

    if (itemsToCreate?.length !== undefined) {
        itemsToCreate.forEach(it => {
            const salt = bcrypt.genSaltSync(PASSWORD_SALT_ROUNDS)
            const password = '#' + generator.generate({ numbers: true, strict: true })
            it.password = bcrypt.hashSync(password, salt)

            if (!userValidationResult(it).invalid) {
                const htmlContent = `<html><body>Hello ${it.name},<br/> Your current password is ${password}. <br/> Kind regards, <br/> ${user?.name}`
                passwordsToSend.push({ name: it.name, email: it.email, htmlContent })
            }

            it.shouldResetPassword = true
        })
    }

    const result = await adminTablesPatch({ itemsToCreate, itemsToUpdate }, user?.role, userValidationResult, 'User',
        'services -> user.service -> patchAdminUsers')

    if (result.status === 200) {
        await sendEmails(passwordsToSend, { name: user?.name, email: user?.email })
    }

    return result
}

exports.deleteAdminUsers = async ({ itemsIds }, role) => {
    return await adminTablesDelete({ itemsIds }, role, 'User', 'services -> user.service -> deleteAdminUsers')
}