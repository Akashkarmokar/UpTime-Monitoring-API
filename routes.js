// Dependencies
const { notFoundHandler } = require('./handlers/routeHandler/notFoundHandler');
const { SampleHandler } = require('./handlers/routeHandler/sampleHandler');
const { UserHandler } = require('./handlers/routeHandler/userHandler');
const { tokenHandler } = require('./handlers/routeHandler/tokenHandler');

// Module Scaffolding
const routes = {
    sample: SampleHandler,
    notFound: notFoundHandler,
    user: UserHandler,
    token: tokenHandler,
};

// Export module
module.exports = routes;
