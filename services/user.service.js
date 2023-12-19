const bcrypt = require('bcrypt')
const generator = require('generate-password')
const { RESET_PASSWORD_EXP, PASSWORD_SALT_ROUNDS } = require("../constants")
const { DB } = require('../utils/db')
const { sendEmails } = require('../utils/email-sender')
const { badRequest, notFound, ok } = require('../utils/response')
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
    if (user.email && !invalidEmail(user.email)) {
        return badRequest('Invalid login or password')
    }

    if (user.oldPassword && user.newPassword && (invalidPassword(user.oldPassword) || invalidPassword(user.newPassword))) {
        return badRequest('Invalid login or password')
    }

    const _user = (await DB.pg.select().from('User').where('id', user.id).first())[0]
    if (!_user || !_user.isActive) {
        return notFound()
    }

    const objToSave = {}

    if (user.email) {
        const __user = (await DB.pg.select().from('User').where('email', user.email).first())[0]
        if (__user) {
            return badRequest('User with this email is already exist')
        }
        objToSave.email = email
    }

    if (user.oldPassword && user.newPassword) {
        const isPasswordValid = await bcrypt.compare(user.oldPassword, _user.password)
        if (!isPasswordValid) {
            return badRequest('Invalid old password')
        }

        const salt = await bcrypt.genSalt(PASSWORD_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(user.newPassword, salt)

        objToSave.password = hashedPassword
        objToSave.shouldResetPassword = false
    }

    await DB.pg('User')
        .where('id', user.id)
        .update(objToSave)

    return ok();
}

exports.patchAdminUsers = async ({ itemsToCreate, itemsToUpdate }, user) => {
    let passwordExpiration = new Date()
    passwordExpiration.setDate(passwordExpiration.getDate() + RESET_PASSWORD_EXP)

    const passwordsToSend = [];

    if (itemsToCreate?.length !== undefined) {
        itemsToCreate.forEach(it => {
            it.resetPasswordExpiration = passwordExpiration.toISOString()

            const salt = bcrypt.genSaltSync(PASSWORD_SALT_ROUNDS)
            const password = '#' + generator.generate({ numbers: true, strict: true })
            it.password = bcrypt.hashSync(password, salt)

            if (!userValidationResult(it).invalid) {
                const htmlContent = `<html><body>Hello ${it.name},<br/> Your current password is ${password}. This is one-time password. You must change it within 1 day. <br/> Kind regards, <br/> ${user?.name}`
                passwordsToSend.push({ name: it.name, email: it.email, htmlContent })
            }
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