const { MAX_PAGINATION_SIZE } = require("../constants")
const { DB } = require("../utils/db")
const { Logger } = require('../utils/logger')
const { error, unauthorized, notFound, ok, badRequest } = require("../utils/response")

exports.listTreatments = async ({ user, patientId }) => {
    try {
        if (!user) {
            return unauthorized()
        }

        const patient = user.role === 2 ? user.id : patientId

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
