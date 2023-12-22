const { MAX_PAGINATION_SIZE } = require("../constants")
const { DB } = require("../utils/db")
const { Logger } = require('../utils/logger')
const { error, unauthorized, notFound, ok, badRequest } = require("../utils/response")
const { patientValidationResult } = require("../validators/patient.validator")
const { adminTablesPagination } = require("./admin-table.service")


exports.listAdminPatients = async ({ user, lastId, size, search, searchBy, sortDir, sortBy, locationId, status }) =>
    await adminTablesPagination({
        user, lastId, size, search, searchBy, sortDir, sortBy,
        tableName: 'Patient', columns: ['id', 'firstName', 'lastName', 'patientNumber', 'avatarBackground', 'status', 'createdAt'],
        tag: 'services -> consult.service -> listAdminPatients', allowStaff: true,
        extraFilter: (query => {
            if (locationId !== undefined && locationId !== null) {
                query = query.andWhere('locationId', locationId)
            }
            if (status !== undefined && status !== null) {
                const statuses = status.split(',').map(it => parseInt(it)).filter(it => it >= 0 && it <= 5)
                query = query.whereIn('status', statuses)
            } else {
                query = query.whereIn('status', [0, 1, 2, 3, 4])
            }
        })
    })

exports.getAdminPatientById = async ({ user, id }) => {
    try {
        if (!user) {
            return unauthorized()
        }

        const userById = (await DB.pg('Patient')
            .join('Location', 'Patient.locationId', '=', 'Location.id')
            .join('Discount', 'Patient.discountId', '=', 'Discount.id')
            .select(DB.pg.raw(`Patient.*, Location.name as locationName, Discount.name as discountName`))
            .where('id', id)
            .andWhere('Patient.practiceId', user.practiceId)
            .first())[0]

        if (!userById) {
            return notFound()
        }

        const treatmentsById = await DB.pg('Treatment')
            .join('TreatmentType', 'Treatment.treatmentTypeId', '=', 'TreatmentType.id')
            .select(DB.pg.raw(`TreatmentType.*, Treatment.id as treatmentId, Treatment.selected as selected`))
            .where('Treatment.patientId', id)
            .andWhere('TreatmentType.practiceId', user.practiceId)
            .orderBy('Treatment.id', 'desc')
            .limit(MAX_PAGINATION_SIZE)

        const treatmentDict = new Map()
        for (let treatment of treatmentsById) {
            treatmentDict[treatment.treatmentId] = treatment
        }

        const treatmentIds = Array.from(treatmentDict.keys())
        const addOnsByTreatmentIds = await DB.pg('TreatmentAddon')
            .join('AddOn', 'TreatmentAddon.addOnId', '=', 'AddOn.id')
            .select(DB.pg.raw(`AddOn.*, TreatmentAddon.id as treatmentAddonId, TreatmentAddon.treatmentId as treatmentId, TreatmentAddon.required as required, TreatmentAddon.enabled as enabled`))
            .whereIn('TreatmentAddon.treatmentId', treatmentIds)
            .orderBy('TreatmentAddon.id', 'desc')
            .limit(MAX_PAGINATION_SIZE)

        for (let addOn of addOnsByTreatmentIds) {
            if (addOn?.treatmentId !== null || addOn?.treatmentId !== undefined) {
                if (!treatmentDict[addOn.treatmentId].addOns) {
                    treatmentDict[addOn.treatmentId].addOns = []
                }

                treatmentDict[addOn.treatmentId].addOns.push(addOn)
            }
        }

        const patient = userById
        patient.treatments = Array.from(treatmentDict.values())

        return ok(patient)

    } catch (err) {
        Logger.e("services -> consult.service -> getAdminPatientById: " + err.message, err)
        return error()
    }
}

exports.postAdminPatient = async ({ user, patient }) => {
    let trx = undefined
    try {
        if (!user) {
            return unauthorized()
        }

        const result = patientValidationResult(patient)
        if (result.invalid) {
            return badRequest(result.msg)
        }

        const isUpdate = patient.id !== null && patient.id !== undefined
        if (isUpdate) {
            const patientById = (await DB.pg.column('patientNumber').select().from('Patient').where('id', patient.id).first())[0]
            if (!patientById) {
                return notFound()
            }
            if (patient.patientNumber !== patientById.patientNumber) {
                const patientByPatientNumber = (await DB.pg.column('patientNumber').select().from('Patient').where('patientNumber', patient.patientNumber).first())[0]
                if (patientByPatientNumber) {
                    return badRequest('Patient with the provided Doplhin Number already exists')
                }
            }
        }
        else {
            const patientByPatientNumber = (await DB.pg.column('patientNumber').select().from('Patient').where('patientNumber', patient.patientNumber).first())[0]
            if (patientByPatientNumber) {
                return badRequest('Patient with the provided Doplhin Number already exists')
            }
        }

        trx = await DB.pg.transaction()

        patient.practiceId = user.practiceId
        const newPatient = {...patient}
        delete newPatient.treatments

        let patientIds = isUpdate ? [patient.id] : []
        if (isUpdate) {
            await trx('Patient').where('id', patient.id).andWhere('practiceId', user.practiceId).update(newPatient)
            await trx('Treatment').where('patientId', patient.id).del()
        } else {
            const createdPatientIds = await trx('Patient').insert(newPatient, ['id'])
            if (createdPatientIds === null || createdPatientIds === undefined || createdPatientIds.length === 0) {
                await trx.rollback()
                Logger.e("services -> consult.service -> postAdminPatient: Result of item creation is null or undefined")
                error()
            }
            patientIds = createdPatientIds
        }
       
        if (patient.treatments?.length > 0) {
            const treatmentDict = new Map()
            const newTreatments = []
            for (let treatment of patient.treatments) {
                treatment.patientId = patientIds[0]
                treatment.selected = false
                treatmentDict[treatment.treatmentTypeId] = treatment

                const newTreatment = {...treatment}
                delete newTreatment.addOns
                newTreatments.push(newTreatment)
            }

            const createdTreatments = await trx('Treatment')
                .returning(['id', 'treatmentTypeId'])
                .insert(newTreatments)

            if (createdTreatments === null || createdTreatments === undefined || createdTreatments.length !== treatmentDict.size) {
                await trx.rollback()
                Logger.e("services -> consult.service -> postAdminPatient: Result of item creation is null or undefined")
                error()
            }

            let addOnsToAdd = []
            for (let createdTreatment of createdTreatments) {
                const curAddOns = treatmentDict[createdTreatment.treatmentTypeId]?.addOns
                if (curAddOns?.length > 0) {
                    curAddOns.forEach(it => it.treatmentId = createdTreatment.id)
                    addOnsToAdd = addOnsToAdd.concat(curAddOns)
                }
            }

            addOnsToAdd.length > 0 && await trx('TreatmentAddon').insert(addOnsToAdd)
        }

        await trx.commit()
        return ok(patient)

    } catch (err) {
        trx && (await trx.rollback())
        Logger.e("services -> consult.service -> postAdminPatient: " + err.message, err)
        return error()
    }
}

exports.deleteAdminPatient = async ({ user, id }) => {
    try {
        if (!user) {
            return unauthorized()
        }
        if (id === null || id === undefined) {
            return badRequest('Patient Id was not provided')
        }

        await DB.pg('Patient').where('id', id).andWhere('practiceId', user.practiceId).del()

        return ok({ id })

    } catch (err) {
        Logger.e("services -> consult.service -> deleteAdminPatient: " + err.message, err)
        return error()
    }
}
