// Dependencies
const data = require('../../lib/data');
const { parseJson, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');
// Module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, resCallback) => {
    const acceptedMethod = ['get', 'post', 'put', 'delete'];
    if (acceptedMethod.indexOf(requestProperties.method) > -1) {
        handler.checks[requestProperties.method](requestProperties, resCallback);
    } else {
        resCallback(405, {});
    }
};
handler.checks = {};

/*
    User send data from body
    Required data : protocol,url,method,successCodes,timeoutSeconds as payload / body
    And token as headerObject / Meta Data
    {
        "protocol":"http",
        "url":"google.com",
        "method":"GET",
        "successCodes":[200,201,301],
        "timeoutSeconds":2
    }
*/
handler.checks.post = (requestProperties, resCallback) => {
    // validate inputs

    const protocol =        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;
    if (protocol && url && method && successCodes && timeoutSeconds) {
        const tokenId =
            typeof requestProperties.headersObj.token === 'string'
                ? requestProperties.headersObj.token
                : false;
        // lookup the user phone by reading the token
        data.read('tokens', tokenId, (readErr, tokenData) => {
            if (!readErr && tokenData) {
                const userPhone = parseJson(tokenData).phone;
                // look up the user data
                data.read('users', userPhone, (userReadErr, userData) => {
                    if (!userReadErr && userData) {
                        tokenHandler.tokens.verify(tokenId, userPhone, (tokenIsOk) => {
                            if (tokenIsOk) {
                                const userObj = parseJson(userData);
                                const userChecks =
                                    typeof userObj.checks === 'object' &&
                                    userObj.checks instanceof Array
                                        ? userObj.checks
                                        : [];
                                if (userChecks.length < maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObj = {
                                        id: checkId,
                                        phone: userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutseconds: timeoutSeconds,
                                    };
                                    // save the object
                                    data.create('checks', checkId, checkObj, (createErr) => {
                                        if (!createErr) {
                                            // add check id to the user's object
                                            userObj.checks = userChecks;
                                            userObj.checks.push(checkId);

                                            // save the new user data
                                            data.update(
                                                'users',
                                                userPhone,
                                                userObj,
                                                (updateErr) => {
                                                    if (!updateErr) {
                                                        // Return the data about the new check
                                                        resCallback(200, checkObj);
                                                    } else {
                                                        resCallback(500, {
                                                            error: 'There was a problem in the server side!',
                                                        });
                                                    }
                                                },
                                            );
                                        } else {
                                            resCallback(500, {
                                                error: 'There was a server side error!',
                                            });
                                        }
                                    });
                                } else {
                                    resCallback(401, {
                                        error: 'User has already reached max check limit!',
                                    });
                                }
                            } else {
                                resCallback(403, {
                                    error: 'Authentication problem!',
                                });
                            }
                        });
                    } else {
                        resCallback(403, {
                            error: 'Authentication Problem',
                        });
                    }
                });
            } else {
                resCallback(403, {
                    error: 'Authentication problem!',
                });
            }
        });
    } else {
        resCallback(400, {
            error: 'You have a problem in your request',
        });
    }
};

// get method
handler.checks.get = (requestProperties, resCallback) => {
    const checkId =
        typeof requestProperties.queryStrinObj.checkId === 'string' &&
        requestProperties.queryStrinObj.checkId.trim().length === 20
            ? requestProperties.queryStrinObj.checkId
            : false;

    if (checkId) {
        // lookup the check id
        data.read('checks', checkId, (readErr, checkData) => {
            if (!readErr && checkData) {
                // sanitize token
                const token =
                    typeof requestProperties.headersObj.token === 'string' &&
                    requestProperties.headersObj.token.trim().length === 20
                        ? requestProperties.headersObj.token.trim()
                        : false;
                // check token valid or not
                const userPhone = parseJson(checkData).phone;
                tokenHandler.tokens.verify(token, userPhone, (isTokenValid) => {
                    if (isTokenValid) {
                        resCallback(200, parseJson(checkData));
                    } else {
                        resCallback(403, {
                            error: 'Authentication failure,Your token is not valid!',
                        });
                    }
                });
            } else {
                resCallback(400, {
                    error: 'Your check-id is not match in data base!',
                });
            }
        });
    } else {
        resCallback(400, {
            error: 'Your check id is in wrong format!',
        });
    }
};

// put method
handler.checks.put = (requestProperties, resCallback) => {
    const checkId =
        typeof requestProperties.body.checkId === 'string' &&
        requestProperties.body.checkId.trim().length === 20
            ? requestProperties.body.checkId
            : false;

    const protocol =        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;

    if (checkId) {
        if (protocol || url || method || successCodes) {
            data.read('checks', checkId, (checkErr, checkData) => {
                if ((!checkErr, checkData)) {
                    const checkDataObj = parseJson(checkData);
                    const token =
                        typeof requestProperties.headersObj.token === 'string' &&
                        requestProperties.headersObj.token.trim().length === 20
                            ? requestProperties.headersObj.token.trim()
                            : false;
                    tokenHandler.tokens.verify(token, checkDataObj.phone, (isTokenValid) => {
                        if (isTokenValid) {
                            if (protocol) {
                                checkDataObj.protocol = protocol;
                            }
                            if (url) {
                                checkDataObj.url = url;
                            }
                            if (method) {
                                checkDataObj.method = method;
                            }
                            if (successCodes) {
                                checkDataObj.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkDataObj.timeoutSeconds = timeoutSeconds;
                            }
                            // store the checkObj
                            data.update('checks', checkId, checkDataObj, (updateErr) => {
                                if (!updateErr) {
                                    resCallback(200);
                                } else {
                                    resCallback(500, {
                                        error: 'There was a problem to update data to Server!',
                                    });
                                }
                            });
                        } else {
                            resCallback(403, {
                                error: 'Authentication problem, your token is not valid!',
                            });
                        }
                    });
                } else {
                    resCallback(500, {
                        error: 'There was a server side problem, to check from db!',
                    });
                }
            });
        } else {
            resCallback(400, {
                error: 'You must provide one field to update!',
            });
        }
    } else {
        resCallback(400, {
            error: 'Your check id is not valid!',
        });
    }
};

// delete method
handler.checks.delete = (requestProperties, resCallback) => {
    const checkId =
        typeof requestProperties.queryStrinObj.checkId === 'string' &&
        requestProperties.queryStrinObj.checkId.trim().length === 20
            ? requestProperties.queryStrinObj.checkId.trim()
            : false;

    if (checkId) {
        // look up the check
        data.read('checks', checkId, (checkErr, checkData) => {
            if (!checkErr && checkData) {
                // we need token from user's header/meta data
                const token =                    typeof requestProperties.headersObj.token === 'string' &&
                    requestProperties.headersObj.token.trim().length === 20
                        ? requestProperties.headersObj.token.trim()
                        : false;
                // verify token is expired or not
                tokenHandler.tokens.verify(token, parseJson(checkData).phone, (isTokenValid) => {
                    if (isTokenValid) {
                        data.delete('checks', checkId, (deleteErr) => {
                            if (!deleteErr) {
                                data.read(
                                    'users',
                                    parseJson(checkData).phone,
                                    (readErr, userData) => {
                                        if (!readErr && userData) {
                                            const userObj = parseJson(userData);
                                            const userChecks =                                                typeof userObj.checks === 'object'
                                                && userObj.checks instanceof Array
                                                    ? userObj.checks
                                                    : false;

                                            // Remove the deleted check's instance from user's checks
                                            const checkPosition = userChecks.indexOf(id);
                                            if (checkPosition > -1) {
                                                userChecks.splice(checkPosition, 1);
                                                // resave the user data
                                                userObj.checks = userChecks;
                                                data.update(
                                                    'users',
                                                    userObj.phone,
                                                    userObj,
                                                    (updateErr) => {
                                                        if (!updateErr) {
                                                            resCallback(200);
                                                        } else {
                                                            resCallback(500, {
                                                                error: 'There was a server side error!',
                                                            });
                                                        }
                                                    },
                                                );
                                            } else {
                                                resCallback(500, {
                                                    error: 'The check id that you are trying to remove is not found in user!',
                                                });
                                            }
                                        } else {
                                            resCallback(500, {
                                                error: 'Server side problem!',
                                            });
                                        }
                                    },
                                );
                            } else {
                                resCallback(500, {
                                    error: 'Server Side error.You can report us about your problem !',
                                });
                            }
                        });
                    } else {
                        resCallback(403, {
                            error: 'Authentication problem . Token is expired or token is not valid!',
                        });
                    }
                });
            } else {
                resCallback(403, {
                    error: 'Does not match your check id',
                });
            }
        });
    } else {
        resCallback(403, {
            error: 'Your check id is in wrong format,length must be in 20!',
        });
    }
};
// Export Module
module.exports = handler;
