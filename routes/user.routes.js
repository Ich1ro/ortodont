const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminUsers, patchAdminUsers, deleteAdminUsers } = require('../services/user.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listAdminUsers(req?.query, req?.user?.role), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchAdminUsers(req?.body, req?.user), resp))
    .post('/delete', adminAuth, async (req, resp) => httpResponse(await deleteAdminUsers(req?.body, req?.user?.role), resp))

module.exports = router