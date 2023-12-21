const { DB } = require("../utils/db")
const { Logger } = require('../utils/logger')
const { adminTablesPagination } = require("./admin-table.service")

exports.listAdminPatients = async ({ user, lastId, size, search, searchBy, sortDir, sortBy }) =>
    await adminTablesPagination({
        user, lastId, size, search, searchBy, sortDir, sortBy,
        tableName: 'Patient', columns: ['id', 'firstName', 'lastName', 'patientNumber', 'avatarBackground', 'status', 'createdAt'],
        tag: 'services -> consult.service -> listAdminPatients', allowStaff: true
    })

