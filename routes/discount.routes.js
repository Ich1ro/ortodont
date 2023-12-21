const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminDiscounts, patchAdminDiscounts, deleteAdminDiscounts } = require('../services/discount.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listAdminDiscounts({ user: req?.user, ...req?.query }), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchAdminDiscounts({ user: req?.user, ...req?.body }), resp))
    .post('/delete', adminAuth, async (req, resp) => httpResponse(await deleteAdminDiscounts({ user: req?.user, ...req?.body }), resp))

module.exports = router