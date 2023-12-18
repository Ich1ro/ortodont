const { MAX_BATCH_SIZE } = require("../constants")
const { DB } = require("../utils/db")
const { Logger } = require("../utils/logger")
const { error, unauthorized, ok } = require("../utils/response")
const { treatmentTypeValidationResult } = require("../validators/treatment-type.validator")
const { adminTablesPagination } = require("./admin-table.service")

exports.listAdminTreatmentTypes = async ({ practiceId, lastId, size, search, sortDir, sortBy }, role) => {
    return await adminTablesPagination({ practiceId, lastId, size, search, sortDir, sortBy}, 
        role, 'TreatmentType', 'services -> add-on.service -> listAdminAddOns')
}

exports.getTreatmentTypesAddOns = async ({ treatmentTypeId }) => {
    try {
        const list = await DB.pg
            .select()
            .from('AddOn')
            .where('treatmentId', treatmentTypeId)
        
        return ok({ list })
    } catch (err) {
        Logger.e('services -> add-on.service -> getTreatmentTypesAddOns: ' + err.message, err)
        return error()
    }
}

exports.patchAdminTreatmentTypes = async ({ itemsToCreate, itemsToUpdate }, role) => {
    let trx = undefined
    try {
        if (role !== 0) {
            return unauthorized()
        }

        if (itemsToCreate?.length === undefined || itemsToUpdate?.length === undefined) {
            return badRequest('Invalid objects were provided')
        }

        if (itemsToCreate.length > MAX_BATCH_SIZE || itemsToUpdate.length > MAX_BATCH_SIZE) {
            return badRequest('Limit exceeded')
        }

        for (let item of itemsToCreate) {
            delete item.id
            const result = treatmentTypeValidationResult(item)
            if (result.invalid) {
                return badRequest('Some of treatment types were invalid. Error: ' + result.msg)
            }
        }

        for (let item of itemsToUpdate) {
            const result = treatmentTypeValidationResult(item)
            if (result.invalid) {
                return badRequest('Some of treatment were invalid. Error: ' + result.msg)
            }
        }

        trx = await DB.pg.transaction()

        let created = []
        let updated = []
        if (itemsToCreate.length > 0) {
            for (let item of itemsToCreate) {
                const addOnIds = item.addOnIds
                delete item.addOnIds

                const id = (await trx('TreatmentType').insert(item, ['id']))[0]
                if (addOnIds?.length > 0) {
                    for (let addOnId of addOnIds) {
                        await trx('AddOn').where('id', addOnId).update('treatmentId', id)
                    }
                }
                created.push(id)
            }

        }
        if (itemsToUpdate.length > 0) {
            for (let item of itemsToUpdate) {
                const newTreatmentType = { ...item }
                const addOnIds = item.addOnIds
                const removedAddOnIds = item.removedAddOnIds

                delete newTreatmentType.id
                delete newTreatmentType.addOnIds
                delete newTreatmentType.removedAddOnIds

                await trx('AddOn').where('id', item.id).update(newTreatmentType)

                if (addOnIds?.length > 0) {
                    for (let addOnId of addOnIds) {
                        await trx('AddOn').where('id', addOnId).update('treatmentId', item.id)
                    }
                }

                if (removedAddOnIds?.length > 0) {
                    for (let addOnId of removedAddOnIds) {
                        await trx('AddOn').where('id', addOnId).update('treatmentId', null)
                    }
                }

                updated.push(item.id)
            }
        }

        await trx.commit()

        return ok({ created, updated })

    } catch (err) {
        trx && (await trx.rollback())
        Logger.e('services -> add-on.service -> patchAdminTreatmentTypes: ' + err.message, err)
        return error()
    }
}

exports.deleteAdminTreatmentTypes = async ({ itemsIds }, role) => {
    let trx = undefined
    try {
        if (role !== 0) {
            return unauthorized()
        }

        if (itemsIds?.length === undefined || itemsIds?.length === undefined) {
            return badRequest('Invalid objects were provided')
        }

        if (itemsIds.length > MAX_BATCH_SIZE) {
            return badRequest('Limit exceeded')
        }

        trx = await DB.pg.transaction()

        let removed = []
        for (let id of itemsIds) {
            await trx('TreatmentType').where('id', id).del()
            await trx('AddOn').where('treatmentId', id).update('treatmentId', null)
            removed.push(id)
        }

        await trx.commit()

        return ok({ removed })

    } catch (err) {
        trx && (await trx.rollback())
        Logger.e('services -> add-on.service -> deleteAdminTreatmentTypes: ' + err.message, err)
        return error()
    }
}