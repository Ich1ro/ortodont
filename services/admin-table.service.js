const { MAX_BATCH_SIZE } = require("../constants")
const { DB } = require("../utils/db")
const { Logger } = require("../utils/logger")
const { error, ok, badRequest, unauthorized } = require("../utils/response")
const { paginationValidationResult } = require("../validators/pagination.validator")

exports.adminTablesPagination = async ({ practiceId, lastId, size, search, sortDir, sortBy }, role, tableName, tag, columns) => {
    try {
        if (role !== 0) {
            return unauthorized()
        }

        const result = paginationValidationResult(size, search, sortDir)
        if (result.invalid) {
            return badRequest(result.msg)
        }

        let _sortDir = sortDir ?? 'desc'
        let _sortBy = 'id' // Backend Sorting supports only Order By id for now

        let query = DB.pg
            .select(...columns ?? '*')
            .from(tableName)
            .where('practiceId', practiceId)

        lastId !== undefined && lastId !== null && (query = query.andWhere('id', _sortDir === 'asc' ? '>' : '<', lastId))
        search && (query = query.whereLike('name', `%${search}%`))

        const list = await query
            .orderBy(_sortBy, _sortDir)
            .limit(size)

        return ok({ list })

    } catch (err) {
        Logger.e(tag + " :" + err.message, err)
        return error()
    }
}

exports.adminTablesPatch = async ({ itemsToCreate, itemsToUpdate }, role, validatator, tableName, tag) => {
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
            const result = validatator(item)
            if (result.invalid) {
                return badRequest('Some of items were invalid. Error: ' + result.msg)
            }
        }

        for (let item of itemsToUpdate) {
            const result = validatator(item)
            if (result.invalid) {
                return badRequest('Some of items were invalid. Error: ' + result.msg)
            }
        }

        trx = await DB.pg.transaction()

        let created = []
        let updated = []
        if (itemsToCreate.length > 0) {
            created = await trx(tableName).insert(itemsToCreate, ['id'])
        }
        if (itemsToUpdate.length > 0) {
            for (let item of itemsToUpdate) {
                const newItem = { ...item }
                delete newItem.id
                await trx(tableName).where('id', item.id).update(newItem)
                updated.push(item.id)
            }
        }

        await trx.commit()

        return ok({ created, updated })

    } catch (err) {
        trx && (await trx.rollback())
        Logger.e(tag + " :" + err.message, err)
        return error()
    }
}

exports.adminTablesDelete = async ({ itemsIds }, role, tableName, tag) => {
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
            await trx(tableName).where('id', id).del()
            removed.push(id)
        }

        await trx.commit()

        return ok({ removed })

    } catch (err) {
        trx && (await trx.rollback())
        Logger.e(tag + " :" + err.message, err)
        return error()
    }
}
