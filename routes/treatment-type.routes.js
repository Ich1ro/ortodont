const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminTreatmentTypes, patchAdminTreatmentTypes, deleteAdminTreatmentTypes, getTreatmentTypesAddOns } = require('../services/treatment-type.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listAdminTreatmentTypes({ user: req?.user, ...req?.query }), resp))
    .get('/add-ons', adminAuth, async (req, resp) => httpResponse(await getTreatmentTypesAddOns({ practiceId: req?.user?.practiceId, treatmentTypeId: req?.query?.treatmentTypeId }), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchAdminTreatmentTypes({ user: req?.user, ...req?.body }), resp))
    .post('/delete', adminAuth, async (req, resp) => httpResponse(await deleteAdminTreatmentTypes({ user: req?.user, ...req?.body }), resp))

module.exports = router