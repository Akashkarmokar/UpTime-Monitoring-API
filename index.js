// Dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes'); // custome module where we handle request and response
// app object
const app = {};

// configuration
app.config = {
    port: 3000,
};

// Create Server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(3000, () => {
        console.log(`Listening to port ${app.config.port}`);
    });
};

// Handle request  and response
app.handleReqRes = handleReqRes; // import from handleReqRes custome module from helpers folder

app.createServer();
