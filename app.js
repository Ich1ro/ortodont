const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const multer = require('multer');
const upload = multer();

dotenv.config();

/* Cors Policy */
//TODO

/* Rate Limiter */
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    max: 200,
    standardHeaders: true
});
app.use(limiter);

/* Body Parser */
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.single('file'));

/* Custom Routes */

/* End Custom Routes */

app.listen(process.env.PORT || 8081);
console.log('App is runing');
