const { addOnValidationResult } = require("../validators/add-on.validator")
const { adminTablesPagination, adminTablesPatch, adminTablesDelete } = require("./admin-table.service")

exports.listAdminAddOns = async ({ practiceId, lastId, size, search, sortDir, sortBy }, role) => {
    return await adminTablesPagination({ practiceId, lastId, size, search, sortDir, sortBy },
        role, 'AddOn', 'services -> add-on.service -> listAdminAddOns')
}

exports.patchAdminAddOns = async ({ itemsToCreate, itemsToUpdate }, role) => {
    return await adminTablesPatch({ itemsToCreate, itemsToUpdate }, role, addOnValidationResult, 'AddOn',
        'services -> discount.service -> patchAdminAddOns')
}

exports.deleteAdminAddOns = async ({ itemsIds }, role) => {
    return await adminTablesDelete({ itemsIds }, role, 'AddOn', 'services -> discount.service -> deleteAdminAddOns')
}