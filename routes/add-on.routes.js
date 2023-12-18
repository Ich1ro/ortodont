const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminAddOns, patchAdminAddOns, deleteAdminAddOns } = require('../services/add-on.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listAdminAddOns(req?.query, req?.user?.role), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchAdminAddOns(req?.body, req?.user?.role), resp))
    .post('/delete', adminAuth, async (req, resp) => httpResponse(await deleteAdminAddOns(req?.body, req?.user?.role), resp))

module.exports = router