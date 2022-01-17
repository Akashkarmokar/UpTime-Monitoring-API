// Module Scaffolding
const environments = {};

// Staging environments
environments.staging = {
    port: 3000,
    envName: 'staging',
};

// production environments
environments.production = {
    port: 5000,
    envName: 'production',
};

// Select which environment is passed
const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

//  making corresponding environment object
const environmentToExport =
    typeof environments[currentEnv] === 'object' ? environments[currentEnv] : environments.staging;

// Export module
module.exports = environmentToExport;
