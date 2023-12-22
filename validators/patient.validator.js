exports.patientValidationResult = (patient) => {
    if (!patient) {
        return { invalid: true, msg: 'Patient entity was not provided' }
    }
    if (patient.firstName === null ||
        patient.firstName === undefined ||
        /^\s*$/.test(patient.firstName) ||
        patient.firstName.length < 1 ||
        patient.firstName.length > 500) {
        return { invalid: true, msg: 'First name is invalid' }
    }
    if (patient.lastName === null ||
        patient.lastName === undefined ||
        /^\s*$/.test(patient.lastName) ||
        patient.lastName.length < 1 ||
        patient.lastName.length > 500) {
        return { invalid: true, msg: 'Last name is invalid' }
    }
    if (patient.patientNumber === null ||
        patient.patientNumber === undefined ||
        /^\s*$/.test(patient.patientNumber) ||
        patient.patientNumber.length < 1 ||
        patient.patientNumber.length > 50) {
        return { invalid: true, msg: 'Patient number is invalid' }
    }

    return { invalid: false }
}
