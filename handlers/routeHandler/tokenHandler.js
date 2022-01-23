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

/*
    Token Handler for post method
    User send 11 digit phone and password as a payload / body
    {
        "phone":"01911111111",
        "password":"abcd"
    }
 */
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

/*
    Token Handler for get method.
    when user wants to know about token details
    User send tokenId as query string
    ex: http://localhost:3000/token?tokenId =
 */
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

/*
    Token Handler put method.
    when user wants to update token expire time
    User send tokenId and extend as payload/body
    {
        "tokenId":"7ruv7ygl8fmo3af982k6",
        "extend":true
    }
 */
handler.tokens.put = (requestProperties, resCallback) => {
    const tokenId =
        typeof requestProperties.body.tokenId === 'string' &&
        requestProperties.body.tokenId.trim().length === 20
            ? requestProperties.body.tokenId.trim()
            : false;

    const extend =
        typeof requestProperties.body.extend === 'boolean' &&
        requestProperties.body.extend === true;

    if (tokenId && extend) {
        data.read('tokens', tokenId, (readErr, tokenData) => {
            const tokenObj = parseJson(tokenData);
            if (tokenObj.expires > Date.now()) {
                tokenObj.expires = Date.now() + 60 * 60 * 1000;
                // store the updated token
                data.update('tokens', tokenId, tokenObj, (updateErr) => {
                    if (!updateErr) {
                        resCallback(200, {
                            message: 'Token updated successfully',
                        });
                    } else {
                        resCallback(500, {
                            error: 'There was a server side error',
                        });
                    }
                });
            } else {
                resCallback(400, {
                    error: 'Token already expired',
                });
            }
        });
    } else {
        resCallback(400, {
            error: 'There was a problem in your request',
        });
    }
};

/*
    Token Handler delete method.
    when user wants to delete token
    User send tokenId as query string
    Ex; http://localhost:3000/token?tokenId=7ruv7ygl8fmo3af982k6
 */
handler.tokens.delete = (requestProperties, resCallback) => {
    // check the phone number is valid
    const tokenId =        typeof requestProperties.queryStrinObj.tokenId === 'string' &&
        requestProperties.queryStrinObj.tokenId.trim().length === 20
            ? requestProperties.queryStrinObj.tokenId.trim()
            : false;
    if (tokenId) {
        // look up the user
        data.read('tokens', tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                data.delete('tokens', tokenId, (deleteErr) => {
                    if (!deleteErr) {
                        resCallback(200, {
                            error: 'Token was successfully deleted',
                        });
                    } else {
                        resCallback(500, {
                            error: 'There was a server side problem',
                        });
                    }
                });
            } else {
                resCallback(500, {
                    error: 'There was a server side problem',
                });
            }
        });
    } else {
        resCallback(404, {
            error: 'Requested token not found',
        });
    }
};

// token verify function
handler.tokens.verify = (tokenId, phone, callback) => {
    // console.log(`${tokenId}---${phone}`);
    data.read('tokens', tokenId, (err, tokenData) => {
        if (!err && tokenData) {
            console.log('bbb');
            if (parseJson(tokenData).phone === phone && parseJson(tokenData).expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};
// Export module
module.exports = handler;
