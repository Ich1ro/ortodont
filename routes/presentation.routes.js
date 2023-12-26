const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listTreatments, getTreatmentById, patchTreatment, share, accept, postSignedContract } = require('../services/presentation.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listTreatments({ user: req?.user, patientId: req?.query?.patientId }), resp))
    .get('/:id', adminAuth, async (req, resp) => httpResponse(await getTreatmentById({ user: req?.user, id: req?.params?.id }), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchTreatment({ user: req?.user, ...req?.body }), resp))
    .post('/share', adminAuth, async (req, resp) => httpResponse(await share({ user: req?.user, shareItem: req?.body, origin: req.protocol + '://' + req.get('host') }), resp))
    .post('/accept', adminAuth, async (req, resp) => httpResponse(await accept({ user: req?.user, treatmentId: req?.query?.treatmentId, patientId: req?.query?.patientId }), resp))
    .post('/signed-contract', adminAuth, async (req, resp) => httpResponse(await postSignedContract({ user: req?.user, file: req?.file, patientId: req?.query?.patientId }), resp))

module.exports = router