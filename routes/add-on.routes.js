const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminAddOns, patchAdminAddOns, deleteAdminAddOns } = require('../services/add-on.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listAdminAddOns({ user: req?.user, ...req?.query }), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchAdminAddOns({ user: req?.user, ...req?.body }), resp))
    .post('/delete', adminAuth, async (req, resp) => httpResponse(await deleteAdminAddOns({ user: req?.user, ...req?.body }), resp))

module.exports = router