/**
 * Title : User Handler
 * Description: It handle all about 'user' path.
 */
// Dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJson } = require('../../helpers/utilities');

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

handler.users.post = (requestProperties, callback) => {
    const firstName =        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName.trim()
            : false;

    const lastName =        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName.trim()
            : false;

    const phone =        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length > 0
            ? requestProperties.body.phone.trim()
            : false;

    const password =        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password.trim()
            : false;

    const tosAgreement =        typeof requestProperties.body.tosAgreement === 'boolean' &&
        requestProperties.body.tosAgreement
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
// todo : authentication required features not added yet
handler.users.get = (requestProperties, Rescallback) => {
    // check the phone number is valid
    const phone =        typeof requestProperties.queryStrinObj.phone === 'string' &&
        requestProperties.queryStrinObj.phone.trim().length > 0
            ? requestProperties.queryStrinObj.phone.trim()
            : false;
    if (phone) {
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
        Rescallback(404, {
            error: 'Requested User not found',
        });
    }
};
// todo : authentication required features not added yet
handler.users.put = (requestProperties, Rescallback) => {
    const firstName =        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName.trim()
            : false;

    const lastName =        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName.trim()
            : false;

    const phone =        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length > 0
            ? requestProperties.body.phone.trim()
            : false;

    const password =        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password.trim()
            : false;

    if (phone) {
        if (firstName || lastName || password) {
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
// todo : authentication required features not added yet
handler.users.delete = (requestProperties, Rescallback) => {
    // check the phone number is valid
    const phone =        typeof requestProperties.queryStrinObj.phone === 'string' &&
        requestProperties.queryStrinObj.phone.trim().length > 0
            ? requestProperties.queryStrinObj.phone.trim()
            : false;

    if (phone) {
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
        Rescallback(400, {
            error: 'There was a problem in your request',
        });
    }
};

// Export Module
module.exports = handler;
