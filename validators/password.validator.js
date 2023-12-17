/**
 * Password Validation
 * Min length: 8 symbols;
 * Max length: 16 symbols;
 * At least one special character;
 * At least one upper case letter;
 * At least one lower case letter;
 * At least one number;
 */

exports.invalidPassword = (password) => {
    return password === undefined || 
           password === null || 
           /^\s*$/.test(password) ||
           !/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/.test(password);
}
