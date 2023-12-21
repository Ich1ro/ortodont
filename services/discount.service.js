const { discountValidationResult } = require("../validators/discount.validator")
const { adminTablesPagination, adminTablesPatch, adminTablesDelete } = require("./admin-table.service")

exports.listAdminDiscounts = async ({ user, lastId, size, search, searchBy, sortDir, sortBy }) =>
    await adminTablesPagination({ user, lastId, size, search, searchBy, sortDir, sortBy, tableName: 'Discount', tag: 'services -> discount.service -> listAdminDiscounts' })

exports.patchAdminDiscounts = async ({ user, itemsToCreate, itemsToUpdate }) =>
    await adminTablesPatch({ user, itemsToCreate, itemsToUpdate, validatator: discountValidationResult, tableName: 'Discount', tag: 'services -> discount.service -> patchAdminDiscounts' })

exports.deleteAdminDiscounts = async ({ user, itemsIds }) =>
    await adminTablesDelete({ user, itemsIds, tableName: 'Discount', tag: 'services -> discount.service -> deleteAdminDiscounts' })