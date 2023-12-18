const { isValidPhoneNumber } = require("libphonenumber-js")

exports.locationValidationResult = (location) => {
    if (!location) {
        return { invalid: true, msg: 'Location entity was not provided' }
    }
    if (location.name === null ||
        location.name === undefined ||
        /^\s*$/.test(location.name) ||
        location.name.length < 1 ||
        location.name.length > 500) {
        return { invalid: true, msg: 'Location name is invalid' }
    }
    if (location.address === null ||
        location.address === undefined ||
        /^\s*$/.test(location.address) ||
        location.address.length < 1 ||
        location.address.length > 5000) {
        return { invalid: true, msg: 'Location address is invalid' }
    }
    if (location.phone === null ||
        location.phone === undefined ||
        /^\s*$/.test(location.phone) ||
        !isValidPhoneNumber(location.phone)) {
        return { invalid: true, msg: 'Location phone number is invalid' }
    }
    if (location.pid === null ||
        location.pid === undefined ||
        /^\s*$/.test(location.pid)) {
        return { invalid: true, msg: 'Location PID number is invalid' }
    }

    return { invalid: false }
}
