const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listTreatments, getTreatmentById, patchTreatment } = require('../services/presentation.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listTreatments({ user: req?.user, ...req?.query }), resp))
    .get('/:id', adminAuth, async (req, resp) => httpResponse(await getTreatmentById({ user: req?.user, id: req?.params?.id }), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchTreatment({ user: req?.user, ...req?.body }), resp))

module.exports = router