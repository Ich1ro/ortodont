const { adminTablesPagination, adminTablesPatch, adminTablesDelete } = require("./admin-table.service")
const { discountValidationResult } = require("../validators/discount.validator")

exports.listAdminDiscounts = async ({ practiceId, lastId, size, search, sortDir, sortBy }, role) => {
    return await adminTablesPagination({ practiceId, lastId, size, search, sortDir, sortBy },
        role, 'Discount', 'services -> discount.service -> listAdminDiscounts')
}

exports.patchAdminDiscounts = async ({ itemsToCreate, itemsToUpdate }, role) => {
    return await adminTablesPatch({ itemsToCreate, itemsToUpdate }, role, discountValidationResult, 'Discount',
        'services -> discount.service -> patchAdminDiscounts')
}

exports.deleteAdminDiscounts = async ({ itemsIds }, role) => {
    return await adminTablesDelete({ itemsIds }, role, 'Discount', 'services -> discount.service -> deleteAdminDiscounts')
}