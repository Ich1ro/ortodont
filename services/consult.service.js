const { MAX_PAGINATION_SIZE } = require("../constants")
const { DB } = require("../utils/db")
const { Logger } = require('../utils/logger')
const { error, unauthorized, notFound, ok } = require("../utils/response")
const { adminTablesPagination } = require("./admin-table.service")

//TODO: Filtering by status & location
exports.listAdminPatients = async ({ user, lastId, size, search, searchBy, sortDir, sortBy }) =>
    await adminTablesPagination({
        user, lastId, size, search, searchBy, sortDir, sortBy,
        tableName: 'Patient', columns: ['id', 'firstName', 'lastName', 'patientNumber', 'avatarBackground', 'status', 'createdAt'],
        tag: 'services -> consult.service -> listAdminPatients', allowStaff: true
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
            .andWhere('practiceId', user.practiceId)
            .first())[0]

        if (!userById) {
            return notFound()
        }

        const treatmentByIdList = await DB.pg('Treatment')
            .join('TreatmentType', 'Treatment.treatmentTypeId', '=', 'TreatmentType.id')
            .join('TreatmentAddon', 'TreatmentAddon.treatmentId', '=', 'Treatment.id')
            .join('AddOn', 'TreatmentAddon.addOnId', '=', 'AddOn.id')
            .select(DB.pg.raw(`TreatmentType.*, Treatment.id as treatmentId, Treatment.selected as selected, AddOn.name as addOnName, AddOn.fee as addOnFee, TreatmentAddon.id as treatmentAddonId, TreatmentAddon.required as required, TreatmentAddon.enabled as enabled`))
            .where('Treatment.patientId', id)
            .andWhere('TreatmentType.practiceId', user.practiceId)
            .orderBy('Treatment.id', 'desc')
            .limit(MAX_PAGINATION_SIZE)
        
        if (treatmentByIdList?.length > 0) {
            const result = treatmentByIdList.reduce((treatment, protoObject) => {
                treatment.id = protoObject.treatmentId
                treatment.treatmentTypeId = protoObject.id
                treatment.name = protoObject.name
                treatment.fee = protoObject.fee
                treatment.months = protoObject.months
                treatment.range = protoObject.range
                treatment.insMonths = protoObject.insMonths
                treatment.phase = protoObject.phase
                treatment.tennCare = protoObject.tennCare
                treatment.selected = protoObject.selected
                treatment.addOnsNumber = protoObject.addOnsNumber
                !treatment.addOns && (treatment.addOns = [])

                const { id, treatmentTypeId, name, fee, months, range, isnMonths, phase, tennCare, selected, addOnsNumber, ...curProto } = protoObject
                treatment.addOns.push(...curProto)
                return treatment
            })

            return ok({
                ...userById,
                treatments: result
            })
        } else {
            return ok({
                ...userById,
                treatments: []
            })
        }

    } catch (err) {
        Logger.e("services -> consult.service -> getAdminPatientById: " + err.message, err)
        return error()
    }
}
