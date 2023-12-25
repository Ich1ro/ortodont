const { invalidEmail } = require("./email.validator")

exports.shareItemValidationResult = (shareItem) => {
    if (!shareItem) {
        return { invalid: true, msg: 'Share item entity was not provided' }
    }
    if (shareItem.patientId === null || shareItem.patientId === undefined) {
        return { invalid: true, msg: 'Patient id was not provided' }
    }
    if (!shareItem.emails || !shareItem.emails?.length || shareItem.emails?.length === 0) {
        return { invalid: true, msg: 'Patient list of emails was not provided' }
    }
    for(let email of shareItem.emails) {
        if (invalidEmail(email)) {
            return { invalid: true, msg: 'On of the provided emails is invalid' }
        }
    }

    return { invalid: false }
}