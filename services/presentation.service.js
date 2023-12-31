const { MAX_PAGINATION_SIZE, MAX_FILE_SIZE, ALLOWED_PDF_EXTENSIONS } = require("../constants")
const { DB } = require("../utils/db")
const { Logger } = require('../utils/logger')
const { error, unauthorized, notFound, ok, badRequest } = require("../utils/response")
const { invalidEmail } = require("../validators/email.validator")
const { shareItemValidationResult } = require("../validators/share-item.validator")
const { encrypt } = require("../utils/aes")
const { sendEmails } = require("../utils/email-sender")
const { fileValidationResult } = require("../validators/file.validator")
const { S3Manager } = require("../utils/s3")

exports.listTreatments = async ({ user, patientId }) => {
    try {
        if (!user) {
            return unauthorized()
        }

        const patient = user.role === 2 ? user.id : patientId
        if (patient === null || patient === undefined) {
            return badRequest('Patient id parameter is null or undefined')
        }

        const treatments = (await DB.pg('Treatment')
            .join('TreatmentType', 'Treatment.treatmentTypeId', '=', 'TreatmentType.id')
            .select(DB.pg.raw(`Treatment.*, TreatmentType.name as name, TreatmentType.fee as fee`))
            .where('Treatment.patientId', patient)
            .andWhere('TreatmentType.practiceId', practiceId)
            .orderBy('Treatment.id', 'desc')
            .limit(MAX_PAGINATION_SIZE))

        return ok(treatments)
    } catch (err) {
        Logger.e("services -> peresentation.service -> listTreatments: " + err.message, err)
        return error()
    }
}

exports.getTreatmentById = async ({ user, id }) => {
    try {
        if (!user) {
            return unauthorized()
        }

        const treatment = (await DB.pg('Treatment')
            .join('TreatmentType', 'Treatment.treatmentTypeId', '=', 'TreatmentType.id')
            .select(DB.pg.raw(`TreatmentType.*, Treatment.id as treatmentId`))
            .where('Treatment.id', id)
            .andWhere('TreatmentType.practiceId', user.practiceId)
            .first())

        if (!treatment) {
            return notFound()
        }

        const addOns = await DB.pg('TreatmentAddon')
            .join('AddOn', 'TreatmentAddon.addOnId', '=', 'AddOn.id')
            .select(DB.pg.raw(`AddOn.*, TreatmentAddon.id as treatmentAddonId, TreatmentAddon.treatmentId as treatmentId, TreatmentAddon.required as required, TreatmentAddon.enabled as enabled`))
            .where('TreatmentAddon.treatmentId', treatment.id)
            .orderBy('TreatmentAddon.id', 'desc')
            .limit(MAX_PAGINATION_SIZE)

        treatment.addOns = addOns

        return ok(treatment)

    } catch (err) {
        Logger.e("services -> peresentation.service -> getTreatmentById: " + err.message, err)
        return error()
    }
}

exports.patchTreatment = async ({ user, item }) => {
    let trx = undefined
    try {
        if (!user) {
            return unauthorized()
        }

        const patient = user.role === 2 ? user.id : item.patientId

        if (item?.id === null || item?.id === undefined) {
            return badRequest('Treatment entity is invalid')
        }

        if (item.downPaymentSlider !== undefined && item.downPaymentSlider !== null && (item.downPaymentSlider < 0 || item.downPaymentSlider > 400)) {
            return badRequest('Treatment Down Payment Slider value exceeds limit')
        }

        if (item.monthlyPaymentSlider !== undefined && item.monthlyPaymentSlider !== null && (item.monthlyPaymentSlider < 0 || item.monthlyPaymentSlider > 100)) {
            return badRequest('Treatment Down Payment Slider value exceeds limit')
        }

        const patchItem = {}
        item.downPaymentSlider !== undefined && item.downPaymentSlider !== null && (patchItem.downPaymentSlider = item.downPaymentSlider)
        item.monthlyPaymentSlider !== undefined && item.monthlyPaymentSlider !== null && (patchItem.monthlyPaymentSlider = item.monthlyPaymentSlider)

        trx = await DB.pg.transaction()

        const updatedIds = await trx('Patient').where('id', patient).andWhere('practiceId', user.practiceId).update(patchItem, ['id'])
        if (updatedIds?.length > 0) {
            if (item.selectedTreatmentId) {
                await trx('Treatment').where('id', item.selectedTreatmentId).update({ selected: true })
            }
            if (item.optionalAddOns?.length > 0) {
                for (let addOn of item.optionalAddOns) {
                    await trx('TreatmentAddon').where('id', addOn.id).andWhere('required', false).update({ enabled: addOn.enabled ?? false })
                }
            }
        }

        await trx.commit()

        return ok(item)

    } catch (err) {
        trx && (await trx.rollback())
        Logger.e("services -> peresentation.service -> patchTreatment: " + err.message, err)
        return error()
    }
}

exports.share = async ({ user, shareItem, origin }) => {
    try {
        if (!user || user.role === 2) {
            return unauthorized()
        }
        const result = shareItemValidationResult(shareItem)
        if (result.invalid) {
            return badRequest(result.msg)
        }

        const patient = (await DB.pg
            .column('id', 'firstName', 'lastName', 'email', 'patientNumber')
            .select()
            .from('Patient')
            .where('id', shareItem.patientId)
            .andWhere('practiceId', user.practiceId)
            .andWhere('status', 0)
            .first())[0]

        if (!patient) {
            return notFound()
        }
        if (invalidEmail(patient.email)) {
            return badRequest('Cannot share presentation due to invalid patient email')
        }

        const patientObj = {
            id: patient.id,
            lastName: patient.lastName,
            patientNumber: patient.patientNumber
        }

        const patientStr = JSON.stringify(patientObj)
        const encrypted = encrypt(patientStr)

        const encryptedData = (await DB.pg.select().from('PatientAes').where('patientId', patientObj.id).first())[0]
        if (!encryptedData) {
            await DB.pg('PatientAes').insert({
                patientId: patientObj.id,
                iv: encrypted.iv,
                tag: encrypted.tag
            })
        }

        const secureLink = origin + '/login/?p=' + encrypted.encrypted + '&id=' + patient.id
        const emailsToSend = shareItem.emails.map(email => {
            return {
                name: email,
                email: email,
                htmlContent: `<html><body>Hello, ${user.email}<br/> This is a link to the presentation of your treatment plan: ${secureLink} Please, use this link to login. <br/> Financial Consult Form <br/>`
            }
        })

        await sendEmails(emailsToSend, { name: 'Financial Consult Form', email: 'fcf@gmail.com' }) //TODO: the same

        await DB.pg('Patient').where('id', shareItem.patientId).update({ status: 1 })

        return ok(shareItem)

    } catch (err) {
        Logger.e("services -> peresentation.service -> share: " + err.message, err)
        return error()
    }
}

exports.accept = async ({ user, treatmentId, patientId }) => {
    try {
        if (!user) {
            return unauthorized()
        }

        const patient = user.role === 2 ? user.id : patientId
        if (patient === null || patient === undefined) {
            return badRequest('Patient id parameter is null or undefined')
        }

        if (treatmentId === null || treatmentId === undefined) {
            return badRequest('Treatment id parameter is null or undefined')
        }

        const patientDb = (await DB.pg
            .column('status', 'id')
            .select()
            .from('Patient')
            .where('patientId', patient)
            .andWhere('practiceId', user.practiceId)
            .first())[0]

        if (!patientDb) {
            return notFound()
        }

        if (patientDb.status !== 0) {
            return badRequest('Actual patient status must be 0')
        }

        await DB.pg('Treatment').where('id', treatmentId).andWhere('patientId', patient).update({ accepted: true })

        return ok()

    } catch (err) {
        Logger.e("services -> peresentation.service -> accept: " + err.message, err)
        return error()
    }
}

// TODO: Build contract pdf document for GET (pdf viewer or downloading)

exports.postSignedContract = async ({ user, file, patientId }) => {
    try {
        if (!user) {
            return unauthorized()
        }

        const patient = user.role === 2 ? user.id : patientId
        if (patient === null || patient === undefined) {
            return badRequest('Patient id parameter is null or undefined')
        }

        const fileResult = fileValidationResult(file, MAX_FILE_SIZE, ALLOWED_PDF_EXTENSIONS)
        if (fileResult.invalid) {
            return badRequest(fileResult.msg)
        }

        const patientDb = (await DB.pg
            .column('status', 'id')
            .select()
            .from('Patient')
            .where('patientId', patient)
            .andWhere('practiceId', user.practiceId)
            .first())[0]

        if (!patientDb) {
            return notFound()
        }

        if (patientDb.status !== 1) {
            return badRequest('Actual patient status must be 1')
        }

        const pdfUrl = await S3Manager.put('contracts', file)
        if (!pdfUrl) {
            return error()
        }

        await DB.pg('Patient').where('id', patient).update({ contractUrl: pdfUrl, status: 2 })

        return ok()

    } catch (err) {
        Logger.e("services -> peresentation.service -> postSignedContract: " + err.message, err)
        return error()
    }
}

