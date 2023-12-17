const express = require('express')
const { adminLogin, adminRefresh, resetPassword } = require('../services/auth.service')
const { httpResponse } = require('../utils/response')
const { adminAuth } = require('../middlewares/admin-auth.middleware')
const router = express.Router()

router
    .post('/admin-login', async (req, resp) => {
        const result = await adminLogin(req?.body);
        if (result.status !== 200) {
            return httpResponse(result, resp);
        } else {
            resp
                .cookie('RefreshToken', result.data.refreshToken, { httpOnly: true, sameSite: 'strict' })
                .header('Authorization', result.data.accessToken)
                .send(result.data.user);
        }
    })
    .post('/admin-refresh', async (req, resp) => {
        const refreshToken = req?.cookies['RefreshToken'];
        if (!refreshToken) {
            return resp.status(401).send('Access Denied');
        }

        const result = await adminRefresh(refreshToken);
        if (result.status !== 200) {
            return httpResponse(result, resp);
        } else {
            resp
                .header('Authorization', result.data.accessToken)
                .send(result.data.user);
        }
    })
    .post('/reset-password', adminAuth, async (req, resp) => httpResponse(await resetPassword(req?.body), resp))

module.exports = router