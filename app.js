const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cors = require('cors')
const app = express()
const multer = require('multer')
const upload = multer()
const { getCors } = require('./utils/cors')
const { Logger } = require('./utils/logger')
const { DB } = require('./utils/db')

dotenv.config()

/* Cors Policy */
app.use(cors(getCors()))

/* Rate Limiter */
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
    max: process.env.RATE_LIMIT || 200,
    standardHeaders: true
});
app.use(limiter)

/* Body Parser */
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(upload.single('file'))

/* Custom Routes */

const health = require('./routes/health.routes')
app.use('/api/health', health)

const auth = require('./routes/auth.routes')
app.use('/api/auth', auth)

const practiceInfo = require('./routes/practice-info.routes')
app.use('/api/practice-info', practiceInfo)

const addOns = require('./routes/add-on.routes')
app.use('/api/add-ons', addOns)

const treatmentTypes = require('./routes/treatment-type.routes')
app.use('/api/treatment-types', treatmentTypes)

const discounts = require('./routes/discount.routes')
app.use('/api/discounts', discounts)

const locations = require('./routes/location.routes')
app.use('/api/locations', locations)

const users = require('./routes/user.routes')
app.use('/api/users', users)

const consult = require('./routes/consult.routes')
app.use('/api/consult', consult)

const presentation = require('./routes/presentation.routes')
app.use('/api/presentation', presentation)

/* End Custom Routes */

try {
    //DB.init()
    app.listen(process.env.PORT || 8080, () => {
        Logger.i('app.js -> Application Has Been Started')
    });
} catch (error) {
    Logger.e('app.js: ' + error.message, error)
}
