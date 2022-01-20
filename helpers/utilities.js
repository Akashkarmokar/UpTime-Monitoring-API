// Dependencies
const crypto = require('crypto');
const environments = require('./environments');
// Module Sacffolding
const utilities = {};

// parse json to object
utilities.parseJson = (jsonString) => {
    let output;
    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }

    return output;
};

// Hash string
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', environments.secretKey).update(str).digest('hex');
        return hash;
    }
    return false;
};
// create random string
utilities.createRandomString = (lenOfStr) => {
    let len = lenOfStr;
    len = typeof len === 'number' && len > 0 ? len : false;

    if (len) {
        const possibleChar = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let finalStr = '';
        for (let i = 1; i <= len; i += 1) {
            const randomChar = possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
            finalStr += randomChar;
        }
        return finalStr;
    }
    return false;
};
// Export module
module.exports = utilities;
