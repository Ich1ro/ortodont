const { MAX_PAGINATION_SIZE, MAX_SEARCH_TERM_LENGTH } = require("../constants")

exports.paginationValidationResult = (size, search, sortDir) => {
    if (size === null || size === undefined || size <= 0 || size > MAX_PAGINATION_SIZE) {
        return { invalid: true, msg: 'Size is not valid' }
    }
    if (search && search.length > MAX_SEARCH_TERM_LENGTH) {
        return { invalid: true, msg: 'Search term is not valid' }
    }
    if (sortDir && (sortDir !== 'desc' || sortDir !== 'asc')) {
        return { invalid: true, msg: 'Sort Dir is not valid' }
    }

    return { invalid: false }
}