/**
 * Title : Sample Handler
 * Description: It handle all about 'sample' path.
 */
// Module Sacffolding
const handler = {};

handler.SampleHandler = (requestProperties, callback) => {
    callback(200, {
        message: 'It is sample url',
    });
};

// Export Module
module.exports = handler;
