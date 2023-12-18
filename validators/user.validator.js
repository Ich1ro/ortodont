const { invalidEmail } = require("./email.validator")

exports.userValidationResult = (user) => {
    if (!user) {
        return { invalid: true, msg: 'User entity was not provided' }
    }
    if (user.name === null ||
        user.name === undefined ||
        /^\s*$/.test(user.name) ||
        user.name.length < 1 ||
        user.name.length > 1000) {
        return { invalid: true, msg: 'User name is invalid' }
    }
    const allowedRoles = [
        0,// Admin
        1 // TC (Staff)
    ]
    if (user.role === null ||
        user.role === undefined ||
        !allowedRoles.includes(user.role)) {
        return { invalid: true, msg: 'User role is invalid' }
    }
    if (invalidEmail(user.email)) {
        return { invalid: true, msg: 'User email is invalid' }
    }
}
