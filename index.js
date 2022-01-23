// Dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes'); // custom module where we handle request and response
const environments = require('./helpers/environments'); // custom module where we handle env variable and configuration

// app object
const app = {};

// Create Server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environments.port, () => {
        console.log(`Listening to port ${environments.port}`);
    });
};

// Handle request  and response
app.handleReqRes = handleReqRes; // import from handleReqRes custome module from helpers folder

app.createServer();
