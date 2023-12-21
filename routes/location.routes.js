const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminLocations, patchAdminLocations, deleteAdminLocations } = require('../services/location.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listAdminLocations({ user: req?.user, ...req?.query }), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchAdminLocations({ user: req?.user, ...req?.body }), resp))
    .post('/delete', adminAuth, async (req, resp) => httpResponse(await deleteAdminLocations({ user: req?.user, ...req?.body }), resp))

module.exports = router