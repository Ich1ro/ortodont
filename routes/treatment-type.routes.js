const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminTreatmentTypes, patchAdminTreatmentTypes, deleteAdminTreatmentTypes, getTreatmentTypesAddOns } = require('../services/treatment-type.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listAdminTreatmentTypes(req?.query, req?.user?.role), resp))
    .get('/add-ons', adminAuth, async (req, resp) => httpResponse(await getTreatmentTypesAddOns(req?.query), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchAdminTreatmentTypes(req?.body, req?.user?.role), resp))
    .post('/', adminAuth, async (req, resp) => httpResponse(await deleteAdminTreatmentTypes(req?.body, req?.user?.role), resp))

module.exports = router