exports.Logger = class Logger {
    static i(msg) {
        console.log('-----------------------------')
        console.log('INFO: ' + msg)
        console.log('-----------------------------')
    }

    static e(msg, details) {
        console.log('-----------------------------')
        console.log('ERROR: ' + msg)
        console.log(details)
        console.log('-----------------------------')
    }
}