const { AVAILABLE_CARDS } = require("../constants")
const { isValidPhoneNumber } = require('libphonenumber-js')

exports.practiceInfoValidationResult = (practiceInfo) => {
    if (!practiceInfo) {
        return { invalid: true, msg: 'Practice info entity was not provided' }
    }
    if (practiceInfo.name === null ||
        practiceInfo.name === undefined ||
        /^\s*$/.test(practiceInfo.name) ||
        practiceInfo.name.length < 1 ||
        practiceInfo.name.length > 500) {
        return { invalid: true, msg: 'Practice info name is invalid' }
    }
    if (practiceInfo.tagLine === null ||
        practiceInfo.tagLine === undefined ||
        /^\s*$/.test(practiceInfo.tagLine) ||
        practiceInfo.tagLine.length < 1 ||
        practiceInfo.tagLine.length > 5000) {
        return { invalid: true, msg: 'Practice info Tag Line is invalid' }
    }
    if (practiceInfo.creditCards === null ||
        practiceInfo.creditCards === undefined ||
        practiceInfo.creditCards.length === 0) {
        return { invalid: true, msg: 'At least one credit card should be accessible in the Practice' }
    }
    for (let card of practiceInfo.creditCards) {
        if (!AVAILABLE_CARDS.includes(card)) {
            return { invalid: true, msg: 'At least one credit card is not allowed to be added to the Practice' }
        }
    }
    if (practiceInfo.oid === null ||
        practiceInfo.oid === undefined ||
        /^\s*$/.test(practiceInfo.oid)) {
        return { invalid: true, msg: 'Practice info OID is invalid' }
    }
    if (practiceInfo.phones === null ||
        practiceInfo.phones === undefined ||
        practiceInfo.phones.length === 0) {
        return { invalid: true, msg: 'At least one phone number should be accessible in the Practice' }
    }
    for (let phone of practiceInfo.phones) {
        if (!isValidPhoneNumber(phone)) {
            return { invalid: true, msg: 'At least one phone number is invalid' }
        }
    }
    if (practiceInfo.webSite && /^\s*$/.test(practiceInfo.webSite)) {
        return { invalid: true, msg: 'Practice info Web Site is invalid' }
    }
    if (practiceInfo.maxPayoutDiscount < 0 || practiceInfo.maxPayoutDiscount > 100) {
        return { invalid: true, msg: 'Practice info Max Payout Discount should be greater or equals 0 and less or equals 100' }
    }
    if (practiceInfo.payoutDiscountBeginsAt < 0 || practiceInfo.payoutDiscountBeginsAt > 100) {
        return { invalid: true, msg: 'Practice info Payout Discount Begins At should be greater or equals 0 and less or equals 100' }
    }
    if (practiceInfo.maxAprForExtendedPayoutTime < 0 || practiceInfo.maxAprForExtendedPayoutTime > 100) {
        return { invalid: true, msg: 'Practice info Max Apr For Extended Payout Time should be greater or equals 0 and less or equals 100' }
    }
    if (practiceInfo.maxExtendedPayoutTime < 0 || practiceInfo.maxExtendedPayoutTime > 100) {
        return { invalid: true, msg: 'Practice info Max Extended Payout Time should be greater or equals 0 and less or equals 100' }
    }
    if (practiceInfo.creditFromPrevContract < 0 || practiceInfo.creditFromPrevContract > 100) {
        return { invalid: true, msg: 'Practice info Credit From Prev Contract should be greater or equals 0 and less or equals 100' }
    }

    return { invalid: false }
}