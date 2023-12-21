const { addOnValidationResult } = require("../validators/add-on.validator")
const { adminTablesPagination, adminTablesPatch, adminTablesDelete } = require("./admin-table.service")

exports.listAdminAddOns = async ({ user, lastId, size, search, searchBy, sortDir, sortBy }) => 
    await adminTablesPagination({ user, lastId, size, search, searchBy, sortDir, sortBy, tableName: 'AddOn', tag: 'services -> add-on.service -> listAdminAddOns' })

exports.patchAdminAddOns = async ({ user, itemsToCreate, itemsToUpdate }) =>
    await adminTablesPatch({ user, itemsToCreate, itemsToUpdate, validatator: addOnValidationResult, tableName: 'AddOn', tag: 'services -> add-on.service -> patchAdminAddOns'})

exports.deleteAdminAddOns = async ({ user, itemsIds }) =>
    await adminTablesDelete({ user, itemsIds, tableName: 'AddOn', tag: 'services -> add-on.service -> deleteAdminAddOns' })