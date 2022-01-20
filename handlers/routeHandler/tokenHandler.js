/**
 * Title :Token Handler
 * Description: It handle all staff about token route
 */

// Dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { createRandomString } = require('../../helpers/utilities');
const { parseJson } = require('../../helpers/utilities');
// Module Scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, resCallback) => {
    const acceptedMethod = ['get', 'post', 'put', 'delete'];
    if (acceptedMethod.indexOf(requestProperties.method) > -1) {
        handler.tokens[requestProperties.method](requestProperties, resCallback);
    } else {
        resCallback(405, { error: 'It is here' });
    }
};

// tokens corresponding function are here,
// which call from tokenHandler function
handler.tokens = {};

// token handler for post method
handler.tokens.post = (requestProperties, resCallback) => {
    const phone =        typeof requestProperties.body.phone === 'string'
        && requestProperties.body.phone.trim().length == 11
            ? requestProperties.body.phone.trim()
            : false;

    const password =        typeof requestProperties.body.password === 'string'
        && requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password.trim()
            : false;
    console.log(`${phone} -- ${password}`);
    if (phone && password) {
        // cross check phone number (mean: user valid or not)
        data.read('users', phone, (readErr, userData) => {
            if (!readErr) {
                const haspassword = hash(password);
                if (haspassword === parseJson(userData).password) {
                    // here everything is fine . now we can create token
                    const tokenId = createRandomString(20);
                    const expires = Date.now() + 60 * 60 * 1000;
                    const tokenObject = {
                        phone,
                        tokenId,
                        expires,
                    };
                    // store the token
                    data.create('tokens', tokenId, tokenObject, (createErr) => {
                        if (!createErr) {
                            resCallback(200, tokenObject);
                        } else {
                            resCallback(500, {
                                error: 'There was a problem in server side!',
                            });
                        }
                    });
                } else {
                    resCallback(400, {
                        error: 'Password is not valid',
                    });
                }
            } else {
                resCallback(404, {
                    error: 'Your request is not valid, may user not registered!',
                });
            }
        });
    } else {
        resCallback(400, {
            error: 'You have a problem in your request',
        });
    }
};

// token handler for get method
handler.tokens.get = (requestProperties, resCallback) => {
    // check the tokenId number is valid
    const tokenId =
        typeof requestProperties.queryStrinObj.tokenId === 'string'
        && requestProperties.queryStrinObj.tokenId.trim().length === 20
            ? requestProperties.queryStrinObj.tokenId
            : false;

    if (tokenId) {
        // look up the tooken
        data.read('tokens', tokenId, (err, tokenData) => {
            const token = { ...parseJson(tokenData) };
            if (!err && token) {
                resCallback(200, token);
            } else {
                resCallback(404, {
                    error: 'Requested token not  found',
                });
            }
        });
    } else {
        resCallback(404, {
            error: 'Requested token not + found',
        });
    }
};

// token handler for put method
handler.tokens.put = (requestProperties, resCallback) => {};

// token handler for delete method
handler.tokens.delete = (requestProperties, resCallback) => {};

// Export module
module.exports = handler;
