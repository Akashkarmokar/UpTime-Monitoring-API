// Dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes'); // custom module where we handle request and response
const environments = require('../helpers/environments'); // custom module where we handle env variable and configuration

// app object
const server = {};

// Create Server
server.createServer = () => {
    const createServerVar = http.createServer(server.handleReqRes);
    createServerVar.listen(environments.port, () => {
        console.log(`Listening to port ${environments.port}`);
    });
};

// Handle request  and response
server.handleReqRes = handleReqRes; // import from handleReqRes custome module from helpers folder

server.init = () => {
    server.createServer();
};

// Export module
module.exports = server;
