const { MAX_BATCH_SIZE } = require("../constants")
const { DB } = require("../utils/db")
const { Logger } = require("../utils/logger")
const { error, ok, badRequest, unauthorized } = require("../utils/response")
const { paginationValidationResult } = require("../validators/pagination.validator")

/**
 * Generic Function To Paginate Through Admin Tables
 * @param {{
 *  user: { email: string, role: number, shouldResetPassword: boolean, languageCulture: string, practiceId: string },
 *  lastId: number,
 *  size: number,
 *  search: string,
 *  searchBy: string,
 *  sortDir: ['desc', 'asc'],
 *  sortBy: string,
 *  tableName: string,
 *  columns: string[],
 *  tag: string,
 *  allowStaff: boolean
 * }} request
 *  
 * @returns { Promise } 
 */
exports.adminTablesPagination = async (request) => {
    const { user, lastId, size, search, searchBy, sortDir, sortBy, tableName, columns, tag, allowStaff } = request
    try {
        if (!user || (!allowStaff && user.role !== 0)) {
            return unauthorized()
        }

        const result = paginationValidationResult(size, search, sortDir)
        if (result.invalid) {
            return badRequest(result.msg)
        }

        let _sortDir = sortDir ?? 'desc'
        let _sortBy = sortBy ?? 'id' // Proper Backend Sorting supports only Order By id for now

        let query = DB.pg
            .select(...columns ?? '*')
            .from(tableName)
            .where('practiceId', user.practiceId)

        lastId !== undefined && lastId !== null && (query = query.andWhere('id', _sortDir === 'asc' ? '>' : '<', lastId))

        let _searchBy = searchBy ?? 'name'
        search && (query = query.whereLike(_searchBy, `%${search}%`))

        const list = await query
            .orderBy(_sortBy, _sortDir)
            .limit(size)

        return ok({ list })

    } catch (err) {
        Logger.e(tag + " :" + err.message, err)
        return error()
    }
}

/**
 * Generic Function To Patch Data To Admin Tables
 * @param {{
*  user: { email: string, role: number, shouldResetPassword: boolean, languageCulture: string, practiceId: string },
*  itemsToCreate: any[],
*  itemsToUpdate: any[],
*  validatator: (item: any) => ({ invalid: boolean, msg: string | null }),
*  tableName: string,
*  tag: string,
*  allowStaff: boolean
* }} request
*  
* @returns { Promise } 
*/
exports.adminTablesPatch = async (request) => {
    let trx = undefined
    const { user, itemsToCreate, itemsToUpdate, validatator, tableName, tag, allowStaff } = request
    try {
        if (!user || (!allowStaff && user.role !== 0)) {
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
            item.practiceId = user.practiceId
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
                await trx(tableName).where('id', item.id).andWhere('practiceId', user.practiceId).update(newItem)
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

/**
 * Generic Function To Delete Data From Admin Tables
 * @param {{
*  user: { email: string, role: number, shouldResetPassword: boolean, languageCulture: string, practiceId: string },
*  itemsIds: number[],
*  tableName: string,
*  tag: string,
*  allowStaff: boolean
* }} request
*  
* @returns { Promise } 
*/
exports.adminTablesDelete = async (request) => {
    let trx = undefined
    const { user, itemsIds, tableName, tag, allowStaff } = request
    try {
        if (!user || (!allowStaff && user.role !== 0)) {
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
            await trx(tableName).where('id', id).andWhere('practiceId', user.practiceId).del()
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
