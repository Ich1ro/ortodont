const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminDiscounts, patchAdminDiscounts, deleteAdminDiscounts } = require('../services/discount.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listAdminDiscounts(req?.query, req?.user?.role), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchAdminDiscounts(req?.body, req?.user?.role), resp))
    .post('/delete', adminAuth, async (req, resp) => httpResponse(await deleteAdminDiscounts(req?.body, req?.user?.role), resp))

module.exports = router