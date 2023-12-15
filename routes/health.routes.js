const express = require('express')
const router = express.Router()

router
    .get('/check', async (_, resp) => resp.sendStatus(200))

module.exports = router