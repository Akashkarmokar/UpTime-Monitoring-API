/**
 * Title : Not Found Handler
 * Description: It handle all about when server not found valid path from user.
 */
// Module Sacffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: '404 .... it is not found',
    });
};

// Export Module
module.exports = handler;
