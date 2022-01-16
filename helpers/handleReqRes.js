// Dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder'); // taking StringDecoder class only
const routes = require('../routes');

// Module Scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
    // request handle
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStrinObj = parsedUrl.query;
    const headersObj = req.headers; // get req headers/meta-data

    // creating RequestProperties Object
    const requestProperties = {
        parsedUrl,
        path,
        trimedPath,
        method,
        queryStrinObj,
        headersObj,
    };

    let reqBody = ''; // request Body or payload

    // String decoder object . It helps us to decode buffer with StringDecoder object
    const reqBodyDecoder = new StringDecoder('utf-8');

    // choosing valid Handler to handle user define url
    const choosenHandler = routes[trimedPath] ? routes[trimedPath] : routes.notFound;
    choosenHandler(requestProperties, (statusCode, payload) => {
        const finalStatusCode = typeof statusCode === 'number' ? statusCode : 500;
        let finalPayload = typeof payload === 'object' ? payload : {};
        finalPayload = JSON.stringify(finalPayload);
        // return final response
        res.writeHead(finalStatusCode);
        res.end(finalPayload);
    });

    // listening request object's data event
    req.on('data', (buffer) => {
        reqBody += reqBodyDecoder.write(buffer);
    });

    // listening request object's end event . it will be call when stramming is ended
    req.on('end', () => {
        reqBody += reqBodyDecoder.end();
        // console.log(reqBody);
    });
};

// export module
module.exports = handler;
