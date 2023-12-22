const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminPatients, getAdminPatientById } = require('../services/consult.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listAdminPatients({ user: req?.user, ...req?.query }), resp))
    .get('/:id', adminAuth, async (req, resp) => httpResponse(await getAdminPatientById({ user: req?.user, id: req?.params?.id }), resp))
    .post('/', adminAuth, async (req, resp) => httpResponse(await patchAdminLocations({ user: req?.user, ...req?.body }), resp))
    .delete('/:id', adminAuth, async (req, resp) => httpResponse(await deleteAdminLocations({ user: req?.user, id: req?.params?.id }), resp))

module.exports = router