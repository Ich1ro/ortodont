exports.JWT_ACCESS_TIMEOUT = 600 // seconds
exports.JWT_REFRESH_TIMEOUT = '14 days'
exports.PASSWORD_SALT_ROUNDS = 10
exports.AVAILABLE_CARDS = ['visa', 'masterCard', 'americanExpress', 'discover']
exports.MAX_FILE_SIZE = 104857600
exports.ALLOWED_IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']
exports.ALLOWED_PDF_EXTENSIONS = ['.pdf']
exports.MAX_PAGINATION_SIZE = 1000
exports.MAX_BATCH_SIZE = 100
exports.MAX_SEARCH_TERM_LENGTH = 10000
exports.CODE_EXP = 15 * 6e4 // 15 minutes
exports.ENCRYPTION_ALGORITHM = 'aes-256-gcm'