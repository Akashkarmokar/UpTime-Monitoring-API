/**
 * Title : User Handler
 * Description: It handle all about 'user' path.
 */
// Dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJson } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

// Module Sacffolding
const handler = {};

handler.UserHandler = (requestProperties, callback) => {
    const acceptedMethod = ['get', 'post', 'put', 'delete'];
    if (acceptedMethod.indexOf(requestProperties.method) > -1) {
        handler.users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {});
    }
};

handler.users = {}; // it contain coressponding function

/*
    User send data from body
    Required data : First name, Last Name, Phone, Password, tosAgreement
    {
        "firstName":"Akash",
        "lastName":"kmk",
        "phone": "01911111111",
        "password":"abcd",
        "tosAgreement":true
    }
*/
handler.users.post = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.body.firstName === 'string'
        && requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName.trim()
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string'
        && requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName.trim()
            : false;

    const phone =
        typeof requestProperties.body.phone === 'string'
        && requestProperties.body.phone.trim().length > 0
            ? requestProperties.body.phone.trim()
            : false;

    const password =
        typeof requestProperties.body.password === 'string'
        && requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password.trim()
            : false;

    const tosAgreement =
        typeof requestProperties.body.tosAgreement === 'boolean'
        && requestProperties.body.tosAgreement
            ? requestProperties.body.tosAgreement
            : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user doesn't already exist
        data.read('users', phone, (err, user) => {
            if (err) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                // store the user to db
                data.create('users', phone, userObject, (createErr) => {
                    if (!createErr) {
                        callback(200, {
                            message: 'User was created successfully',
                        });
                    } else {
                        callback(500, {
                            error: 'Could not create user',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was a problem in server side',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

/*
    User get method.
    phone number is required
    as query string.
    Ex: http://localhost:3000/token?phone=01911111111
    And
    token as meta data from header
    ex: token:7ruv7ygl8fmo3af982k6
 */
handler.users.get = (requestProperties, Rescallback) => {
    // check the phone number is valid
    const phone =
        typeof requestProperties.queryStrinObj.phone === 'string'
        && requestProperties.queryStrinObj.phone.trim().length === 11
            ? requestProperties.queryStrinObj.phone.trim()
            : false;
    if (phone) {
        // verify token
        const tokenId =
            typeof requestProperties.headersObj.token === 'string'
                ? requestProperties.headersObj.token
                : false;
        tokenHandler.tokens.verify(tokenId, phone, (token) => {
            if (token) {
                // look up the user
                data.read('users', phone, (err, userData) => {
                    const finalUserData = { ...parseJson(userData) };
                    if (!err && finalUserData) {
                        delete finalUserData.password;
                        Rescallback(200, { finalUserData });
                    } else {
                        Rescallback(404, {
                            error: 'Requested User not found',
                        });
                    }
                });
            } else {
                Rescallback(403, {
                    error: 'Authentication failure',
                });
            }
        });
    } else {
        Rescallback(404, {
            error: 'Requested User not found',
        });
    }
};

/*
    User put method
    User send his/her update data as payload / body
    ex:
    {
        "firstName": "hello",
        "lastName": "kmk",
        "phone": "01911111111",
        "password":"abcd"
    }

 */
handler.users.put = (requestProperties, Rescallback) => {
    const firstName =
        typeof requestProperties.body.firstName === 'string'
        && requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName.trim()
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string'
        && requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName.trim()
            : false;

    const phone =
        typeof requestProperties.body.phone === 'string'
        && requestProperties.body.phone.trim().length > 0
            ? requestProperties.body.phone.trim()
            : false;

    const password =
        typeof requestProperties.body.password === 'string'
        && requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password.trim()
            : false;

    if (phone) {
        if (firstName || lastName || password) {
            // verify token
            const tokenId =
                typeof requestProperties.headersObj.token === 'string'
                    ? requestProperties.headersObj.token
                    : false;
            tokenHandler.tokens.verify(tokenId, phone, (token) => {
                if (token) {
                    // lookup the user in our db
                    data.read('users', phone, (readErr, userOrgData) => {
                        const userData = { ...parseJson(userOrgData) };
                        if (!readErr && userData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }
                            // store to db
                            data.update('users', phone, userData, (updateErr) => {
                                if (!updateErr) {
                                    Rescallback(200, {
                                        message: 'User was updated successfully!',
                                    });
                                } else {
                                    Rescallback(500, {
                                        error: 'There was a problem in server side',
                                    });
                                }
                            });
                        } else {
                            Rescallback(400, {
                                error: 'you have a problem in your request',
                            });
                        }
                    });
                } else {
                    Rescallback(403, {
                        error: 'Authentication failure',
                    });
                }
            });
        } else {
            Rescallback(400, {
                error: 'you have a problem in your request',
            });
        }
    } else {
        Rescallback(400, {
            eroor: 'Invalid phone number,please try again',
        });
    }
};
/*
    User delete method
    User send his/her phone number as query string with phone property
    and token as mete taka with token property
    Ex: http://localhost:3000/user?phone=01911111111
    And
    token as meta data from header
    ex: token:7ruv7ygl8fmo3af982k6

 */
handler.users.delete = (requestProperties, Rescallback) => {
    // check the phone number is valid
    const phone =
        typeof requestProperties.queryStrinObj.phone === 'string'
        && requestProperties.queryStrinObj.phone.trim().length > 0
            ? requestProperties.queryStrinObj.phone.trim()
            : false;

    if (phone) {
        // verify token
        const tokenId =
            typeof requestProperties.headersObj.token === 'string'
                ? requestProperties.headersObj.token
                : false;
        tokenHandler.tokens.verify(tokenId, phone, (token) => {
            if (token) {
                // lookup the user
                data.read('users', phone, (readErr, userData) => {
                    if (!readErr && userData) {
                        data.delete('users', phone, (deleteErr) => {
                            if (!deleteErr) {
                                Rescallback(200, {
                                    message: 'User was successfully deleted!',
                                });
                            } else {
                                Rescallback(500, {
                                    error: 'There was a server side error!',
                                });
                            }
                        });
                    } else {
                        Rescallback(400, {
                            error: 'There was a problem in your request',
                        });
                    }
                });
            } else {
                Rescallback(403, {
                    error: 'Authentication failure',
                });
            }
        });
    } else {
        Rescallback(400, {
            error: 'There was a problem in your request',
        });
    }
};

// Export Module
module.exports = handler;
