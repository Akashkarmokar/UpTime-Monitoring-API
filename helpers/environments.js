// Module Scaffolding
const environments = {};

// Staging environments
environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'adfahfwraf',
    maxChecks: 5,
    twilio: {
        fromPhone: '+16203158963',
        accountSid: 'AC9c2f9f1a6ecdab3ab0f289ea1432927a',
        authToken: 'f90911139d8f9d38d2fa553a61051dff',
    },
};

// production environments
environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'addfddfwee',
    maxChecks: 5,
    twilio: {
        fromPhone: '+16203158963',
        accountSid: 'AC9c2f9f1a6ecdab3ab0f289ea1432927a',
        authToken: 'f90911139d8f9d38d2fa553a61051dff',
    },
};

// Select which environment is passed
const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

//  making corresponding environment object
const environmentToExport =    typeof environments[currentEnv] === 'object' ? environments[currentEnv] : environments.staging;

// Export module
module.exports = environmentToExport;
