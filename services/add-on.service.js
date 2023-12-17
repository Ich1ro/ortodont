const { MAX_BATCH_SIZE } = require("../constants")
const { DB } = require("../utils/db")
const { Logger } = require('../utils/logger')
const { badRequest, unauthorized, error, ok } = require("../utils/response")
const { addOnValidationResult } = require("../validators/add-on.validator")
const { paginationValidationResult } = require("../validators/pagination.validator")

exports.listAdminAddOns = async ({ practiceId, lastId, size, search, sortDir, sortBy }, role) => {
    try {
        if (role !== 0) {
            return unauthorized()
        }

        const result = paginationValidationResult(lastId, size, search, sortDir)
        if (result.invalid) {
            return badRequest(result.msg)
        }

        let _sortDir = sortDir ?? 'desc'
        let _sortBy = sortBy ? `id,${sortBy}` : 'id,name'

        let query = DB.pg
            .select()
            .where('practiceId', practiceId)
            .andWhere('id', _sortDir === 'asc' ? '>' : '<', lastId);

        search && (query = query.whereLike(`%${search}%`))

        var list = await query
            .orderBy(_sortBy, _sortDir)
            .limit(size)

        return ok({ list })

    } catch (err) {
        Logger.e('services -> add-on.service -> listAdminAddOns: ' + err.message, err)
        return error()
    }
}

exports.patchAdminAddOns = async ({ addOnsToCreate, addOnsToUpdate }, role) => {
    let trx = undefined
    try {
        if (role !== 0) {
            return unauthorized()
        }

        if (addOnsToCreate?.length === undefined || addOnsToUpdate?.length === undefined) {
            return badRequest('Invalid objects were provided')
        }

        if (addOnsToCreate.length > MAX_BATCH_SIZE || addOnsToUpdate.length > MAX_BATCH_SIZE) {
            return badRequest('Limit exceeded')
        }

        for (let addOn of addOnsToCreate) {
            delete addOn.id
            const result = addOnValidationResult(addOn)
            if (result.invalid) {
                return badRequest('Some of add-ons where invalid. Error: ' + result.msg)
            }
        }

        for (let addOn of addOnsToUpdate) {
            const result = addOnValidationResult(addOn)
            if (result.invalid) {
                return badRequest('Some of add-ons where invalid. Error: ' + result.msg)
            }
        }

        trx = await DB.pg.transaction()

        let created = []
        let updated = []
        if (addOnsToCreate.length > 0) {
            created = await trx('AddOn').insert(addOnsToCreate, ['id'])
        }
        if (addOnsToUpdate.length > 0) {
            for (let addOn of addOnsToUpdate) {
                const newAddOn = { ...addOn }
                delete newAddOn.id
                await trx('AddOn').where('id', addOn.id).update(newAddOn)
                updated.push(addOn.id)
            }
        }

        await trx.commit()

        return ok({ created, updated })

    } catch (err) {
        trx && (await trx.rollback())
        Logger.e('services -> add-on.service -> patchAdminRoles: ' + err.message, err)
        return error()
    }
}

exports.deleteAdminAddOns = async ({ addOnIds }, role) => {
    let trx = undefined
    try {
        if (role !== 0) {
            return unauthorized()
        }

        if (addOnIds?.length === undefined || addOnIds?.length === undefined) {
            return badRequest('Invalid objects were provided')
        }

        if (addOnIds.length > MAX_BATCH_SIZE) {
            return badRequest('Limit exceeded')
        }

        trx = await DB.pg.transaction()

        let removed = []
        for (let id of addOnIds) {
            await trx('AddOn').where('id', id).del()
            removed.push(id)
        }

        await trx.commit()

        return ok({ removed })

    } catch (err) {
        trx && (await trx.rollback())
        Logger.e('services -> add-on.service -> deleteAdminAddOns: ' + err.message, err)
        return error()
    }
}