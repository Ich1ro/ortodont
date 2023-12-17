const express = require('express')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const { getAdminPracticeInfo, putAdminPracticeInfo } = require('../services/practice-info.service')
const router = express.Router()

router
    .get('/', adminAuth, async (req, resp) => httpResponse(await getAdminPracticeInfo(req?.query), resp))
    .put('/', adminAuth, async (req, resp) => httpResponse(await putAdminPracticeInfo(req?.body, req?.user?.role, req?.file), resp))

module.exports = router
