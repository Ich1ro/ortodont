exports.treatmentTypeValidationResult = (treatmentType) => {
    if (!treatmentType) {
        return { invalid: true, msg: 'Treatment Type entity was not provided' }
    }
    if (treatmentType.name === null ||
        treatmentType.name === undefined ||
        /^\s*$/.test(treatmentType.name) ||
        treatmentType.name.length < 1 ||
        treatmentType.name.length > 500) {
        return { invalid: true, msg: 'Treatment Type name is invalid' }
    }
    if (treatmentType.fee === null ||
        treatmentType.fee === undefined ||
        isNaN(treatmentType.fee)) {
        return { invalid: true, msg: 'Treatment Type fee is invalid' }
    }
    if (treatmentType.months === null ||
        treatmentType.months === undefined ||
        isNaN(treatmentType.months)) {
        return { invalid: true, msg: 'Treatment Type months is invalid' }
    }
    if (treatmentType.insMonths === null ||
        treatmentType.insMonths === undefined ||
        isNaN(treatmentType.insMonths)) {
        return { invalid: true, msg: 'Treatment Type insurance months is invalid' }
    }
    const allowedPhases = ['I', 'II']
    if (treatmentType.phase !== null &&
        !allowedPhases.includes(treatmentType.phase)) {
        return { invalid: true, msg: 'Treatment Type phase is invalid' }
    }

    return { invalid: false }
}
