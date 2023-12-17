const path = require('path')

exports.fileValidationResult = (file, maxFileSize, allowedExtensions) => {
    if (!file) {
        return { invalid: false }
    }
    if (file.size > maxFileSize) {
        return { invalid: true, msg: 'File size should be less than 100 MB' }
    }
    if (!allowedExtensions.includes(path.extname(file.originalname ?? '')?.toLowerCase())) {
        return { invalid: true, msg: 'File Extenstions should be the following: ' + allowedExtensions.join(', ') }
    }

    return { invalid: false }
}