const { adminTablesPagination, adminTablesPatch, adminTablesDelete } = require("./admin-table.service")
const { locationValidationResult } = require("../validators/location.validator")

exports.listAdminLocations = async ({ user, lastId, size, search, searchBy, sortDir, sortBy }) =>
    await adminTablesPagination({ user, lastId, size, search, searchBy, sortDir, sortBy, tableName: 'Location', tag: 'services -> location.service -> listAdminLocations' })

exports.patchAdminLocations = async ({ user, itemsToCreate, itemsToUpdate }) =>
    await adminTablesPatch({ user, itemsToCreate, itemsToUpdate, validatator: locationValidationResult, tableName: 'Location', tag: 'services -> location.service -> patchAdminLocations' })

exports.deleteAdminLocations = async ({ user, itemsIds }) =>
    await adminTablesDelete({ user, itemsIds, tableName: 'Location', tag: 'services -> location.service -> deleteAdminLocations' })