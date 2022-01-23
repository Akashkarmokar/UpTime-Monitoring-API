// Dependencies
const server = require('./lib/server');
const worker = require('./lib/worker');

// Module scaffolding
const app = {};

app.init = () => {
    // start the server
    server.init();
    // start the worker
    worker.init();
};

app.init();

// export the app
module.exports = app;
