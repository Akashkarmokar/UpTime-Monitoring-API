// Dependencies
const { notFoundHandler } = require('./handlers/routeHandler/notFoundHandler');
const { SampleHandler } = require('./handlers/routeHandler/sampleHandler');
const { UserHandler } = require('./handlers/routeHandler/userHandler');

// Module Scaffolding
const routes = {
    sample: SampleHandler,
    notFound: notFoundHandler,
    user: UserHandler,
};

// Export module
module.exports = routes;
