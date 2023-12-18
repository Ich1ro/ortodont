exports.discountValidationResult = (discount) => {
    if (!discount) {
        return { invalid: true, msg: 'Discount entity was not provided' }
    }
    if (discount.name === null ||
        discount.name === undefined ||
        /^\s*$/.test(discount.name) ||
        discount.name.length < 1 ||
        discount.name.length > 500) {
        return { invalid: true, msg: 'Discount name is invalid' }
    }
    if (discount.percentage === null ||
        discount.percentage === undefined ||
        isNaN(discount.percentage) ||
        discount.percentage < 0 ||
        discount.percentage > 100) {
        return { invalid: true, msg: 'Discount percentage is invalid' }
    }

    return { invalid: false }
}
