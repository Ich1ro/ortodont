const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { listAdminUsers, patchAdminUsers, deleteAdminUsers, patchMyProfile, sendConfirmationCode } = require('../services/user.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await listAdminUsers({ user: req?.user, ...req?.query }), resp))
    .patch('/', adminAuth, async (req, resp) => httpResponse(await patchAdminUsers({ user: req?.user, ...req?.body }), resp))
    .patch('/my-profile', adminAuth, async (req, resp) => httpResponse(await patchMyProfile({ practiceId: req?.user?.practiceId, ...req?.body }), resp))
    .post('/my-profile/send-code', adminAuth, async (req, resp) => httpResponse(await sendConfirmationCode({ practiceId: req?.user?.practiceId, ...req?.body }), resp))
    .post('/delete', adminAuth, async (req, resp) => httpResponse(await deleteAdminUsers({ user: req?.user, ...req?.body }), resp))

module.exports = router