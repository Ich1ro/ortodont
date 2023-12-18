const bcrypt = require('bcrypt')
const generator = require('generate-password')
const { RESET_PASSWORD_EXP, PASSWORD_SALT_ROUNDS } = require("../constants")
const { sendEmails } = require('../utils/email-sender')
const { userValidationResult } = require('../validators/user.validator')
const { adminTablesPagination, adminTablesPatch, adminTablesDelete } = require("./admin-table.service")

exports.listAdminUsers = async ({ practiceId, lastId, size, search, sortDir, sortBy }, role) => {
    return await adminTablesPagination({ practiceId, lastId, size, search, sortDir, sortBy },
        role, 'User', 'services -> user.service -> listAdminUsers',
        ['id', 'practiceId', 'name', 'email', 'role', 'isActive', 'languageCulture'])
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