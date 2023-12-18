const { adminTablesPagination, adminTablesPatch, adminTablesDelete } = require("./admin-table.service")
const { locationValidationResult } = require("../validators/location.validator")

exports.listAdminLocations = async ({ practiceId, lastId, size, search, sortDir, sortBy }, role) => {
    return await adminTablesPagination({ practiceId, lastId, size, search, sortDir, sortBy },
        role, 'Location', 'services -> location.service -> listAdminLocations')
}

exports.patchAdminLocations = async ({ itemsToCreate, itemsToUpdate }, role) => {
    return await adminTablesPatch({ itemsToCreate, itemsToUpdate }, role, locationValidationResult, 'Location',
        'services -> location.service -> patchAdminLocations')
}

exports.deleteAdminLocations = async ({ itemsIds }, role) => {
    return await adminTablesDelete({ itemsIds }, role, 'Location', 'services -> location.service -> deleteAdminLocations')
}