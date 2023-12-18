const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminLocations, patchAdminLocations, deleteAdminLocations } = require('../services/location.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listAdminLocations(req?.query, req?.user?.role), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchAdminLocations(req?.body, req?.user?.role), resp))
    .post('/delete', adminAuth, async (req, resp) => httpResponse(await deleteAdminLocations(req?.body, req?.user?.role), resp))

module.exports = router