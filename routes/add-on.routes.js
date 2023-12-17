const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminAddOns, patchAdminAddOns, deleteAdminAddOns } = require('../services/add-on.service')
const router = express.Router()

router
    .get('/', adminAuth, (req, resp) => httpResponse(listAdminAddOns(req?.query, req?.user?.role), resp))
    .patch('/', adminAuth, (req, resp) => httpResponse(patchAdminAddOns(req?.body, req?.user?.role), resp))
    .post('/', adminAuth, (req, resp) => httpResponse(deleteAdminAddOns(req?.body, req?.user?.role), resp))

module.exports = router