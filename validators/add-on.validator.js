exports.addOnValidationResult = (addOn) => {
    if (!addOn) {
        return { invalid: true, msg: 'Add-On entity was not provided' }
    }
    if (addOn.name === null ||
        addOn.name === undefined ||
        /^\s*$/.test(addOn.name) ||
        addOn.name.length < 1 ||
        addOn.name.length > 500) {
        return { invalid: true, msg: 'Add-On name is invalid' }
    }
    if (addOn.fee === null ||
        addOn.fee === undefined ||
        isNaN(addOn.fee)) {
        return { invalid: true, msg: 'Add-On fee is invalid' }
    }

    return { invalid: false }
}
