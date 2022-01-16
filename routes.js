// Dependencies
const { notFoundHandler } = require('./handlers/routeHandler/notFoundHandler');
const { SampleHandler } = require('./handlers/routeHandler/sampleHandler');

// Module Scaffolding
const routes = {
    sample: SampleHandler,
    notFound: notFoundHandler,
};

// Export module
module.exports = routes;
