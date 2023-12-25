const jwt = require('jsonwebtoken')
const { JWT_ACCESS_TIMEOUT } = require('../constants')

// Auth for all users*
exports.adminAuth = (req, resp, next) => {
    const accessToken = req.headers['Authorization']
    const refreshToken = req.cookies['RefreshToken']

    if (!accessToken && !refreshToken) {
        return resp.status(401).send('Access Denied')
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_ACCESS)
        req.user = decoded.user
        next()
    } catch (error) {
        if (!refreshToken) {
            return resp.status(401).send('Access Denied')
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH)
            const accessToken = jwt.sign({ user: decoded.user }, process.env.JWT_SECRET_ACCESS, { expiresIn: JWT_ACCESS_TIMEOUT })

            resp
                .cookie('RefreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' })
                .header('Authorization', accessToken)
                .send(decoded.user)
        } catch (error) {
            return resp.status(400).send('Access Denied')
        }
    }
}
