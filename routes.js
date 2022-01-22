// Dependencies
const { notFoundHandler } = require('./handlers/routeHandler/notFoundHandler');
const { SampleHandler } = require('./handlers/routeHandler/sampleHandler');
const { UserHandler } = require('./handlers/routeHandler/userHandler');
const { tokenHandler } = require('./handlers/routeHandler/tokenHandler');
const { checkHandler } = require('./handlers/routeHandler/checkHandler');
// Module Scaffolding
const routes = {
    sample: SampleHandler,
    notFound: notFoundHandler,
    user: UserHandler,
    token: tokenHandler,
    check: checkHandler,
};

// Export module
module.exports = routes;
