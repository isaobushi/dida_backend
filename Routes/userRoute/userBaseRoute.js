/**
 * Created by Navit on 15/11/16.
 */
var UniversalFunctions = require('../../Utils/UniversalFunctions');
var Controller = require('../../Controllers');
var Joi = require('joi');
var Config = require('../../Config');

var userRegister = {
    method: 'POST',
    path: '/api/user/register',
    handler: function (request, reply) {
        var payloadData = request.payload;
        if (!UniversalFunctions.verifyEmailFormat(payloadData.emailId)) {
            reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL_FORMAT));
        }
        else {
            Controller.UserBaseController.createUser(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        }
    },
    config: {
        description: 'Register a new user',
        tags: ['api', 'user'],
        validate: {
            payload: {
                firstName: Joi.string().regex(/^[a-zA-Z]+$/).trim().min(2).required(),
                lastName: Joi.string().regex(/^[a-zA-Z]+$/).trim().min(2).required(),
                emailId: Joi.string().required(),
                password: Joi.string().required().min(5),
                role: Joi.string().required().valid([Config.APP_CONSTANTS.DATABASE.USER_ROLES.CONSUMER, Config.APP_CONSTANTS.DATABASE.USER_ROLES.EXPORTER, Config.APP_CONSTANTS.DATABASE.USER_ROLES.FARMER, Config.APP_CONSTANTS.DATABASE.USER_ROLES.IMPORTER])
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
}

var login = {
    method: 'POST',
    path: '/api/user/login',
    handler: function (request, reply) {
        var payloadData = request.payload;
        if (!UniversalFunctions.verifyEmailFormat(payloadData.emailId)) {
            reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL_FORMAT));
        }
        else {
            Controller.UserBaseController.loginUser(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        }
    },
    config: {
        description: 'Login Via EmailId & Password For User',
        tags: ['api', 'user'],
        validate: {
            payload: {
                emailId: Joi.string().required(),
                password: Joi.string().required().min(5).trim()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var accessTokenLogin =
{
    /* *****************access token login****************** */
    method: 'POST',
    path: '/api/user/accessTokenLogin',
    handler: function (request, reply) {
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
        Controller.UserBaseController.accessTokenLogin(userData, function (err, data) {
            console.log('%%%%%%%%%%%%%%%', err, data)
            if (!err) {
                return reply(UniversalFunctions.sendSuccess(null, data));
            }
            else {
                return reply(UniversalFunctions.sendError(err));
            }
        });
    },
    config: {
        description: 'access token login',
        tags: ['api', 'user'],
        auth: 'UserAuth',
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }

}

var getProfile = {
    method: 'GET',
    path: '/api/user/getProfile',
    config: {
        description: 'get profile of user',
        auth: 'UserAuth',
        tags: ['api', 'user'],
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            if (userData && userData._id) {
                Controller.UserBaseController.getProfile(userData, function (error, success) {
                    if (error) {
                        reply(UniversalFunctions.sendError(error));
                    } else {
                        reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
            }
        },
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var changePassword =
{
    method: 'PUT',
    path: '/api/user/changePassword',
    handler: function (request, reply) {
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
        Controller.UserBaseController.changePassword(userData, request.payload, function (err, user) {
            if (!err) {
                return reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.PASSWORD_RESET, user));
            }
            else {
                return reply(UniversalFunctions.sendError(err));
            }
        });
    },
    config: {
        description: 'change Password',
        tags: ['api', 'customer'],
        auth: 'UserAuth',
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                oldPassword: Joi.string().required().min(4),
                newPassword: Joi.string().required().min(4)
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
}

var createItems =
{
    method: 'POST',
    path: '/api/crops/createItems',
    handler: function (request, reply) {
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
        var payloadData = request.payload;
        if (UniversalFunctions.validateString(payloadData.itemName, /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
            return reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.ITEM_NAME_ERROR));
        }
        else {
            Controller.UserBaseController.createItems(userData, payloadData, function (err, user) {
                if (!err) {
                    return reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.ITEM_SUCCESSFULLY_CREATED, user));
                }
                else {
                    return reply(UniversalFunctions.sendError(err));
                }
            });
        }
    },
    config: {
        description: 'create items by user',
        tags: ['api', 'customer'],
        auth: 'UserAuth',
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                itemName: Joi.string().required(),
                itemAmount: Joi.number().required(),
                price: Joi.number().required()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
}

var createItemRequest =
{
    method: 'POST',
    path: '/api/crops/createItemRequest',
    handler: function (request, reply) {
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
        var payloadData = request.payload;
        if (UniversalFunctions.validateString(payloadData.itemName, /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
            return reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.ITEM_NAME_ERROR));
        }
        else {
            Controller.UserBaseController.createItemRequest(userData, payloadData, function (err, user) {
                if (!err) {
                    return reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.ITEM_REQUEST_CREATED, user));
                }
                else {
                    return reply(UniversalFunctions.sendError(err));
                }
            });
        }
    },
    config: {
        description: 'create items request by user',
        tags: ['api', 'customer'],
        auth: 'UserAuth',
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                itemName: Joi.string().required(),
                itemAmount: Joi.number().required()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
}

var supplyItems =
{
    method: 'POST',
    path: '/api/crops/supplyItems',
    handler: function (request, reply) {
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
        var payloadData = request.payload;
        Controller.UserBaseController.supplyItems(userData, payloadData, function (err, user) {
            if (!err) {
                return reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.ITEM_REQUEST_SUPPLIED, user));
            }
            else {
                return reply(UniversalFunctions.sendError(err));
            }
        });
    },
    config: {
        description: 'supply items by user',
        tags: ['api', 'customer'],
        auth: 'UserAuth',
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                requestId: Joi.string().required()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
}

var buyItems =
{
    method: 'POST',
    path: '/api/crops/buyItems',
    handler: function (request, reply) {
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
        Controller.UserBaseController.buyItems(userData, function (err, user) {
            if (!err) {
                return reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.ITEM_REQUEST_SUPPLIED, user));
            }
            else {
                return reply(UniversalFunctions.sendError(err));
            }
        });
    },
    config: {
        description: 'buy items by user',
        tags: ['api', 'customer'],
        auth: 'UserAuth',
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
}

var getItemHistory = {
    method: 'GET',
    path: '/api/crops/getItemHistory/{itemId}',
    config: {
        description: 'get item history',
        tags: ['api', 'user'],
        handler: function (request, reply) {
            var payloadData = request.params;
            Controller.UserBaseController.getItemHistory(payloadData, function (error, success) {
                if (error) {
                    reply(UniversalFunctions.sendError(error));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
                }
            });
        },
        validate: {
            params: {
                itemId: Joi.string().required()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};
var getAllItem = {
    method: 'GET',
    path: '/api/crops/getAllItem',
    config: {
        description: 'get all items',
        tags: ['api', 'user'],
        handler: function (request, reply) {
            Controller.UserBaseController.getAllItem(function (error, success) {
                if (error) {
                    reply(UniversalFunctions.sendError(error));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
                }
            });
        },
        validate: {
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var getUserItem = {
    method: 'GET',
    path: '/api/crops/getUserItem',
    config: {
        description: 'get all user items',
        tags: ['api', 'user'],
        auth: 'UserAuth',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.UserBaseController.getUserItem(userData, function (error, success) {
                if (error) {
                    reply(UniversalFunctions.sendError(error));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
                }
            });
        },
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var getMarketRequest = {
    method: 'GET',
    path: '/api/crops/getMarketRequest',
    config: {
        description: 'get market request for user',
        tags: ['api', 'user'],
        auth: 'UserAuth',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.UserBaseController.getMarketRequest(userData, function (error, success) {
                if (error) {
                    reply(UniversalFunctions.sendError(error));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
                }
            });
        },
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var createBid =
{
    method: 'POST',
    path: '/api/crops/createBid',
    handler: function (request, reply) {
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
        var payloadData = request.payload;
        Controller.UserBaseController.createBid(userData, payloadData, function (err, user) {
            if (!err) {
                return reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.ITEM_REQUEST_SUPPLIED, user));
            }
            else {
                return reply(UniversalFunctions.sendError(err));
            }
        });
    },
    config: {
        description: 'create bid for user',
        tags: ['api', 'customer'],
        auth: 'UserAuth',
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                requestId: Joi.string().required(),
                amountOfItems: Joi.number().required(),
                priceOffered: Joi.number().required(),
                dateOfDelivery: Joi.date().required(),
                bidView: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.BID_VIEW.PUBLIC, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.BID_VIEW.PRIVATE])
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
}

var getMyRequest = {
    method: 'GET',
    path: '/api/crops/getMyRequest',
    config: {
        description: 'get request created',
        tags: ['api', 'user'],
        auth: 'UserAuth',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.UserBaseController.getMyRequest(userData, function (error, success) {
                if (error) {
                    reply(UniversalFunctions.sendError(error));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
                }
            });
        },
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var getMyBid = {
    method: 'GET',
    path: '/api/crops/getMyBid',
    config: {
        description: 'get bids offered by user',
        tags: ['api', 'user'],
        auth: 'UserAuth',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.UserBaseController.getMyBid(userData, function (error, success) {
                if (error) {
                    reply(UniversalFunctions.sendError(error));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
                }
            });
        },
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var getItemRequest = {
    method: 'GET',
    path: '/api/crops/getItemRequest/{requestId}',
    config: {
        description: 'get item request details for user',
        tags: ['api', 'user'],
        auth: 'UserAuth',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            var payloadData = request.params;
            Controller.UserBaseController.getItemRequest(userData, payloadData, function (error, success) {
                if (error) {
                    reply(UniversalFunctions.sendError(error));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
                }
            });
        },
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            params: {
                requestId: Joi.string().required()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
}

var UserBaseRoute =
    [
        userRegister,
        login,
        accessTokenLogin,
        getProfile,
        changePassword,
        createItems,
        //supplyItems,
        buyItems,
        getItemHistory,
        getAllItem,
        getUserItem,
        createItemRequest,
        getMarketRequest,
        createBid,
        getMyRequest,
        getMyBid,
        getItemRequest
    ]
module.exports = UserBaseRoute;