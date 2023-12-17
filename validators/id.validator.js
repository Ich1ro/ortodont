/**
 * Postgres UUID v4 validation
 */
exports.invalidId = (id) => {
    return id === undefined || 
           id === null || 
           !/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(id)
}