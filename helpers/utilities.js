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

// Export module
module.exports = utilities;
