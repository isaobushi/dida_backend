/**
 * Created by Navit on 15/11/16.
 */
var Service = require('../../Services');
var UniversalFunctions = require('../../Utils/UniversalFunctions');
var async = require('async');
var TokenManager = require('../../Lib/TokenManager');
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require('underscore');
//var redisClient = require("../../Utils/redisConnect").redisClient;


var createUser = function (payloadData, callback) {
    console.log('payload:', payloadData);
    var accessToken = null;
    var uniqueCode = null;
    var dataToSave = payloadData;
    console.log('payload Data:', payloadData);
    if (dataToSave.password)
        dataToSave.password = UniversalFunctions.CryptData(dataToSave.password);
    var customerData = null;
    var dataToUpdate = {};
    async.series([
        function (cb) {
            var query = {
                emailId: payloadData.emailId
            };
            Service.UserService.getUser(query, {}, {}, function (error, data) {
                if (error) {
                    cb(error);
                } else {
                    console.log(data, data.length);
                    if (data && data.length > 0) {
                        cb(ERROR.USER_ALREADY_REGISTERED)
                    } else {
                        cb(null);
                    }
                }
            });

        },
        function (cb) {
            //Insert Into DB
            dataToSave.registrationDate = new Date().toISOString();
            Service.UserService.createUser(dataToSave, function (err, customerDataFromDB) {
                console.log('hello', err, customerDataFromDB)
                if (err) {
                    cb(err)
                } else {
                    customerData = customerDataFromDB;
                    cb();
                }
            })
        },
        function (cb) {
            //Set Access Token
            if (customerData) {
                var tokenData = {
                    id: customerData._id,
                    type: payloadData.role
                };
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        accessToken = output && output.accessToken || null;
                        cb();
                    }
                })
            } else {
                cb(ERROR.IMP_ERROR)
            }
        },
        function (cb) {
            var criteria = {
                _id: customerData._id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (data && data[0]) {
                    customerData = data[0];
                    cb()
                }
                else cb(err)
            })
        }
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, {
                accessToken: accessToken,
                userDetails: UniversalFunctions.deleteUnnecessaryUserData(customerData)
            });
        }
    });
};


var loginUser = function (payloadData, callback) {
    var userFound = false;
    var accessToken = null;
    var successLogin = false;
    async.series([
        function (cb) {
            var query = {
                emailId: payloadData.emailId
            };
            Service.UserService.getUser(query, {}, {}, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    userFound = result && result[0] || null;
                    cb();
                }
            });

        },
        function (cb) {
            //validations
            if (!userFound) {
                cb(ERROR.USER_NOT_FOUND);
            } else {
                if (userFound && userFound.password != UniversalFunctions.CryptData(payloadData.password)) {
                    cb(ERROR.INCORRECT_PASSWORD);
                }
                else {
                    successLogin = true;
                    //console.log(userFound);
                    cb();
                }
            }
        },
        function (cb) {
            if (successLogin) {
                var tokenData = {
                    id: userFound._id,
                    type: userFound.role
                };
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        accessToken = output && output.accessToken || null;
                        cb();
                    }
                })
            } else {
                cb(ERROR.IMP_ERROR)
            }

        },
        function (cb) {
            var criteria = {
                _id: userFound._id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (data && data[0]) {
                    userFound = data[0];
                    cb()
                }
                else cb(err)
            })
        },
        function (cb) {
            var criteria = {
                ownerId: userFound._id
            }
            Service.CropService.getCrops(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    userFound.warehouse = data.length;
                    cb()
                }
            })
        }
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, {
                accessToken: accessToken,
                userDetails: UniversalFunctions.deleteUnnecessaryUserData(userFound)
            });
        }
    });
};


var accessTokenLogin = function (userData, callback) {
    var userdata = {};
    var userFound = null;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData.id

            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        userdata = data[0];
                        cb()
                    }
                }

            })
        },
        function (cb) {
            var criteria = {
                ownerId: userData.id
            }
            Service.CropService.getCrops(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    userdata.warehouse = data.length;
                    cb()
                }
            })
        }], function (err, user) {
            if (!err) callback(null, {
                accessToken: userdata.accessToken,
                userDetails: UniversalFunctions.deleteUnnecessaryUserData(userdata)
            });
            else callback(err);

        });
}

var getProfile = function (userData, callback) {
    var customerData;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData.id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        customerData = data[0];
                        cb()
                    }
                }

            })
        },
        function (cb) {
            var criteria = {
                ownerId: userData.id
            }
            Service.CropService.getCrops(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    customerData.warehouse = data.length;
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { userDetails: customerData })
    })
}

var changePassword = function (userData, payloadData, callbackRoute) {
    var costumerData;
    var oldPassword = UniversalFunctions.CryptData(payloadData.oldPassword);
    var newPassword = UniversalFunctions.CryptData(payloadData.newPassword);
    async.series([
        function (cb) {
            var criteria = {
                _id: userData.id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        costumerData = data[0];

                        if (costumerData.password == oldPassword && costumerData.password != newPassword) {
                            cb(null);
                        }
                        else if (costumerData.password != oldPassword) {
                            cb(ERROR.WRONG_PASSWORD)
                        }
                        else if (costumerData.password == newPassword) {
                            cb(ERROR.NOT_UPDATE)
                        }
                    }
                }

            })
        },
        function (callback) {
            var dataToUpdate = { $set: { 'password': newPassword } };
            var condition = { _id: userData.id };
            Service.UserService.updateUser(condition, dataToUpdate, {}, function (err, user) {
                console.log("customerData-------->>>" + JSON.stringify(user));
                if (err) {
                    callback(err);
                } else {
                    if (!user || user.length == 0) {
                        callback(ERROR.NOT_FOUND);
                    }
                    else {
                        callback(null);
                    }
                }
            });
        }
    ],
        function (error, result) {
            if (error) {
                return callbackRoute(error);
            } else {
                return callbackRoute(null);
            }
        });
}

var createItems = function (userData, payloadData, callback) {
    var customerData;
    var allItems = [];
    async.series([
        function (cb) {
            var criteria = {
                _id: userData.id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        customerData = data[0];
                        console.log(customerData);
                        if (customerData.role != "FARMER") {
                            cb(ERROR.ROLE_NOT_CORRECT);
                        }
                        else {
                            cb()
                        }
                    }
                }

            })
        },
        function (cb) {
            var itemDetails = {
                "ownerId": userData.id,
                "itemName": (payloadData.itemName).toUpperCase(),
                "creationDate": new Date().toISOString(),
                "price": payloadData.price,
                "state": customerData.role
            }
            for (var i = 0; i < payloadData.itemAmount; i++) {
                allItems.push(itemDetails);
            }
            cb()
        },
        function (cb) {
            console.log("!!!!!!!!!!!!!!!!!!!", allItems)
            if (allItems) {
                var taskInParallel = [];
                for (var key in allItems) {
                    (function (key) {
                        taskInParallel.push((function (key) {
                            return function (embeddedCB) {
                                //TODO
                                addCropTransaction(customerData, allItems[key], function (err, data) {
                                    if (err) embeddedCB(err)
                                    else embeddedCB()
                                })

                            }
                        })(key))
                    }(key));
                }
                async.parallel(taskInParallel, function (err, result) {
                    cb(null);
                });
            }
            else {
                cb()
            }
        },
        function(cb){
            redisClient.hgetall(userData.id.toString(), function (err, obj) {
                if (obj && obj.socketId) {
                    process.emit("itemCreated", {
                        socketId: obj.socketId
                    });
                    cb()
                }
                else cb()
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, {})
    })
}

var addCropTransaction = function (userData, itemdata, callback) {
    console.log(">>>>>>>>", userData, itemdata)
    async.series([
        function (cb) {
            Service.CropService.createCrops(itemdata, function (err, data) {
                if (err) cb(err)
                else {
                    console.log("Crop Data::::::", data);
                    itemdata = data;
                    cb()
                }
            })
        },
        function (cb) {
            var transaction = {
                ownerId: userData._id,
                supplierId: userData._id,
                currentTime: new Date().toISOString(),
                transactionType: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.TRANSACTION_TYPE.CREATE_ITEMS,
                itemExchanged: 1,
                itemId: itemdata._id,
                originalPrice: itemdata.price,
                boughtPrice: itemdata.price
            }
            Service.TransactionService.createTransaction(transaction, function (err, data) {
                if (err) cb(err)
                else {
                    console.log("Transaction data:::::", data);
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, {})
    })
}

var createItemRequest = function (userData, payloadData, callback) {
    var customerData;
    var supplierRole;
    var itemRequest;
    var supplierIds;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData._id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        customerData = data[0];
                        if (customerData.role == "FARMER") {
                            cb(ERROR.ROLE_NOT_CORRECT)
                        }
                        else cb()
                    }
                }

            })
        },
        function (cb) {
            itemRequest = {
                "ordererId": userData._id,
                "itemOrdered": (payloadData.itemName).toUpperCase(),
                "itemAmount": payloadData.itemAmount,
                "creationDate": new Date().toISOString(),
                "orderState": UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.ORDER_STATE.ORDER_REQUESTED,
                "ordererRole": userData.role,
            }
            Service.CropRequestService.createCropRequest(itemRequest, function (err, data) {
                if (err) cb(err)
                else {
                    console.log(data);
                    itemRequest = data;
                    cb()
                }
            })
        },
        function (cb) {
            var transaction = {
                ownerId: userData._id,
                currentTime: new Date().toISOString(),
                transactionType: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.TRANSACTION_TYPE.ORDER_ITEMS,
                itemExchanged: payloadData.itemAmount,
                requestId: itemRequest._id
            }
            Service.TransactionService.createTransaction(transaction, function (err, data) {
                if (err) cb(err)
                else cb()
            })
        },
        function(cb){
            redisClient.hgetall(userData._id.toString(), function (err, obj) {
                if (obj && obj.socketId) {
                    process.emit("itemRequestSelf", {
                        socketId: obj.socketId
                    });
                    cb()
                }
                else cb()
            })
        },
        function (cb) {
            var supplier;
            if (customerData.role == "CONSUMER") {
                supplier = "IMPORTER"
            }
            else if (customerData.role == "IMPORTER") {
                supplier = "EXPORTER"
            }
            else {
                supplier = "FARMER"
            }
            var query = {
                role: supplier
            }
            Service.UserService.getUser(query, { _id: 1 }, {}, function (err, data) {
                if (err) cb(err)
                else {
                    supplierIds = _.map(data, "_id");
                    cb()
                }
            })
        },
        function (cb) {
            console.log("!!!!!!!!!!!!!!!!!!!", supplierIds)
            if (supplierIds) {
                var taskInParallel = [];
                for (var key in supplierIds) {
                    (function (key) {
                        taskInParallel.push((function (key) {
                            return function (embeddedCB) {
                                //TODO
                                redisClient.hgetall(supplierIds[key].toString(), function (err, obj) {
                                    if (obj && obj.socketId) {
                                        process.emit("newItenRequest", {
                                            socketId: obj.socketId,
                                            requestId: itemRequest._id
                                        });
                                        embeddedCB()
                                    }
                                    else embeddedCB()
                                });
                            }
                        })(key))
                    }(key));
                }
                async.parallel(taskInParallel, function (err, result) {
                    cb(null);
                });
            }
            else {
                cb()
            }
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, {})
    })
}

var supplyItems = function (userData, payloadData, callback) {
    var customerData;
    var requestData;
    var cropData;
    async.series([
        function (cb) {
            var criteria = {
                "selector": {
                    _id: userData._id
                }

            }
            Service.UserService.getUser(criteria, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        customerData = data[0];
                        cb()
                    }
                }

            })
        },
        function (cb) {
            var criteria = {
                "selector": {
                    _id: payloadData.requestId
                }
            }
            Service.CropRequestService.getCropRequest(criteria, function (err, data) {
                if (err) cb(err)
                else {
                    if (data && data.length == 0) {
                        cb(ERROR.REQUEST_NOT_EXIST)
                    }
                    else if (data[0].suplierRole != customerData.role) {
                        cb(ERROR.ROLE_NOT_CORRECT)
                    }
                    else if (data[0].orderState == UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.ORDER_STATE.ORDER_COMPLETED) {
                        cb(ERROR.ORDER_ALREADY_SUPPLIED);
                    }
                    else {
                        requestData = data && data[0] || null;
                        cb()
                    }
                }
            })
        },
        function (cb) {
            var criteria = {
                "selector": {
                    "ownerId": customerData._id,
                    "itemName": requestData.itemOrdered
                }
            }
            Service.CropService.getCrops(criteria, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length < requestData.itemAmount) {
                        cb(ERROR.CROP_NUMBER_ERROR)
                    }
                    else {
                        cropData = data;
                        cb()
                    }
                }
            })
        },
        function (cb) {
            console.log("!!!!!!!!!!!!!!!!!!!", cropData)
            if (cropData) {
                var taskInParallel = [];
                for (var key in cropData) {
                    (function (key) {
                        taskInParallel.push((function (key) {
                            return function (embeddedCB) {
                                //TODO
                                if (key < requestData.itemAmount) {
                                    updateCropState(customerData, requestData, cropData[key], function (err, data) {
                                        if (err) embeddedCB(err)
                                        else embeddedCB()
                                    })
                                }
                                else embeddedCB()
                            }
                        })(key))
                    }(key));
                }
                async.parallel(taskInParallel, function (err, result) {
                    cb(null);
                });
            }
            else {
                cb()
            }
        },
        function (cb) {
            requestData.suplierId = customerData._id;
            requestData.orderState = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.ORDER_STATE.ORDER_COMPLETED;
            requestData.endDate = new Date().toISOString()

            Service.CropRequestService.updateCropRequest(requestData, function (err, data) {
                if (err) cb(err)
                else {
                    console.log("updated request data", data)
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, {})
    })
}

var updateCropState = function (userData, requestData, cropData, callback) {
    console.log(">>>>>>>>", userData, requestData, cropData)
    async.series([
        function (cb) {
            cropData.ownerId = requestData.ordererId;
            cropData.state = requestData.ordererRole
            Service.CropService.updateCrops(cropData, function (err, data) {
                if (err) cb(err)
                else {
                    console.log("updated crop data", data)
                    cb()
                }
            })
        },
        function (cb) {
            var transaction = {
                ownerId: requestData.ordererId,
                supplierId: userData._id,
                currentTime: new Date().toISOString(),
                transactionType: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.TRANSACTION_TYPE.SUPPLY_ITEMS,
                itemExchanged: 1,
                itemId: cropData._id,
                requestId: requestData._id
            }
            Service.TransactionService.createTransaction(transaction, function (err, data) {
                if (err) cb(err)
                else cb()
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, {})
    })
}

var buyItems = function (userData, callback) {
    var customerData;
    var supplierRole;
    var cropData;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData._id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        customerData = data[0];
                        if (customerData.role == "FARMER") {
                            cb(ERROR.ROLE_NOT_CORRECT)
                        }
                        else {
                            if (customerData.role == "CONSUMER") {
                                supplierRole = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.IMPORTER;
                            }
                            else if (customerData.role == "IMPORTER") {
                                supplierRole = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.EXPORTER;
                            }
                            else {
                                supplierRole = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.FARMER;
                            }
                            cb()
                        }
                    }
                }

            })
        },
        function (cb) {
            var criteria = {
                state: supplierRole
            }
            Service.CropService.getCrops(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    cropData = data;
                    if (cropData.length == 0) {
                        cb(ERROR.INSUFFICENT_CROPS)
                    }
                    cb()
                }
            })
        },
        function (cb) {
            console.log("!!!!!!!!!!!!!!!!!!!", cropData)
            if (cropData) {
                var taskInParallel = [];
                for (var key in cropData) {
                    (function (key) {
                        taskInParallel.push((function (key) {
                            return function (embeddedCB) {
                                //TODO
                                updateNewCropState(customerData, supplierRole, cropData[key], function (err, data) {
                                    if (err) embeddedCB(err)
                                    else embeddedCB()
                                })
                            }
                        })(key))
                    }(key));
                }
                async.parallel(taskInParallel, function (err, result) {
                    cb(null);
                });
            }
            else {
                cb()
            }
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, {})
    })
}

var updateNewCropState = function (userData, suplierRole, cropData, callback) {
    console.log(">>>>>>>>", userData, suplierRole, cropData)
    var previousOwner = cropData.ownerId;
    async.series([
        function (cb) {
            var dataToUpdate = { $set: { ownerId: userData._id, state: userData.role } }
            var condition = { _id: cropData._id }
            Service.CropService.updateCrops(condition, dataToUpdate, {}, function (err, data) {
                if (err) cb(err)
                else {
                    console.log("updated crop data", data)
                    cb()
                }
            })
        },
        function (cb) {
            var transaction = {
                ownerId: userData._id,
                supplierId: previousOwner,
                currentTime: new Date().toISOString(),
                transactionType: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.TRANSACTION_TYPE.BUY_ITEMS,
                itemExchanged: 1,
                itemId: cropData._id,
                originalPrice: cropData.price,
                boughtPrice: cropData.price
            }
            Service.TransactionService.createTransaction(transaction, function (err, data) {
                if (err) cb(err)
                else cb()
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, {})
    })
}

var getItemHistory = function (payloadData, callback) {
    var trasanctionData;
    var finalTransactionData = [];
    async.series([
        function (cb) {
            var criteria = {
                itemId: payloadData.itemId
            }
            var path = 'ownerId supplierId itemId';
            var select = 'firstName lastName role itemName price'
            var populate = {
                path: path,
                match: {},
                select: select,
                options: { lean: true }
            }
            var projection = {

            };
            Service.TransactionService.getPopulatedTransaction(criteria, projection, populate, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.NO_TRANSACTION)
                    else {
                        trasanctionData = data;
                        trasanctionData = _.sortBy(trasanctionData, "currentTime").reverse();
                        cb()
                    }
                }

            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { data: trasanctionData })
    })
}

var getAllItem = function (callback) {
    var itemData;
    var finalItemData = [];
    async.series([
        function (cb) {
            Service.CropService.getCrops({}, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    itemData = data;
                    itemData = _.sortBy(itemData, "creationDate").reverse();
                    cb(null);
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { itemData: itemData })
    })

}

var getUserItem = function (userData, callback) {
    var customerData;
    var cropData;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData.id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        customerData = data[0];
                        cb()
                    }
                }

            })
        },
        function (cb) {
            var criteria = {
                ownerId: userData._id
            }
            Service.CropService.getCrops(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    cropData = data;
                    cropData = _.sortBy(cropData, "creationDate").reverse();
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { cropData: cropData })
    })
}

var getMarketRequest = function (userData, callback) {
    var customerData;
    var cropRequest;
    var ordererRole = [];
    async.series([
        function (cb) {
            var criteria = {
                _id: userData.id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        customerData = data[0];
                        if (customerData.role == UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.FARMER) {
                            ordererRole.push(UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.EXPORTER);
                        }
                        else if (customerData.role == UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.EXPORTER) {
                            ordererRole.push(UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.IMPORTER);
                        }
                        else {
                            ordererRole.push(UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CONSUMER);
                        }
                        cb()
                    }
                }

            })
        },
        function (cb) {
            var criteria = {
                $and: [
                    { ordererRole: { $in: ordererRole } },
                    {
                        $or: [
                            { orderState: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.ORDER_STATE.ORDER_REQUESTED },
                            { orderState: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.ORDER_STATE.PARTIALLY_COMPLETED }
                        ]
                    }
                ]
            }
            var path = 'ordererId';
            var select = 'firstName lastName role'
            var populate = {
                path: path,
                match: {},
                select: select,
                options: { lean: true }
            }
            var projection = {

            };
            Service.CropRequestService.getPopulatedCropRequest(criteria, projection, populate, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    cropRequest = data;
                    cropRequest = _.sortBy(cropRequest, "creationDate").reverse();
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { cropRequest: cropRequest })
    })
}

var createBid = function (userData, payloadData, callback) {
    var customerData;
    var requestData;
    var bidData;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData.id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        customerData = data[0];
                        cb()
                    }
                }

            })
        },
        function (cb) {
            var criteria = {
                _id: payloadData.requestId
            }
            Service.CropRequestService.getCropRequest(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.REQUEST_NOT_EXIST)
                    else {
                        requestData = data[0];
                        cb()
                    }
                }
            })
        },
        function (cb) {
            var criteria = {
                requestId: payloadData.requestId,
                bidderId: userData.id
            }
            Service.RequestBiddingService.getRequestBidding(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length > 0) cb(ERROR.BID_ALREADY_EXIST)
                    else cb()
                }
            })
        },
        function (cb) {
            var bidToSubmit = {
                requestId: payloadData.requestId,
                bidderId: userData.id,
                amountOfItems: payloadData.amountOfItems,
                priceOffered: payloadData.priceOffered,
                dateOfDelivery: payloadData.dateOfDelivery,
                bidView: payloadData.bidView
            }
            Service.RequestBiddingService.createRequestBidding(bidToSubmit, function (err, data) {
                if (err) cb(err)
                else {
                    bidData = data;
                    cb()
                }
            })
        },
        function (cb) {
            redisClient.hgetall(requestData.ordererId.toString(), function (err, obj) {
                if (obj && obj.socketId) {
                    process.emit("newBidCreated", {
                        socketId: obj.socketId,
                        requestId: requestData._id
                    });
                    cb()
                }
                else cb()
            })
        },
        function (cb) {
            redisClient.hgetall(customerData._id.toString(), function (err, obj) {
                if (obj && obj.socketId) {
                    process.emit("bidCreatedSelf", {
                        socketId: obj.socketId,
                        requestId: requestData._id
                    });
                    cb()
                }
                else cb()
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { bidData: bidData })
    })
}

var getMyRequest = function (userData, callback) {
    var customerData;
    var requestData
    async.series([
        function (cb) {
            var criteria = {
                _id: userData.id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        customerData = data[0];
                        cb()
                    }
                }

            })
        },
        function (cb) {
            var criteria = {
                $and: [
                    {
                        ordererId: userData.id
                    },
                    {
                        $or: [
                            {
                                orderState: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.ORDER_STATE.ORDER_REQUESTED
                            },
                            {
                                orderState: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.ORDER_STATE.PARTIALLY_COMPLETED
                            }
                        ]
                    }
                ]

            }
            Service.CropRequestService.getCropRequest(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    requestData = data;
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { requestData: requestData })
    })
}

var getMyBid = function (userData, callback) {
    var customerData;
    var requestData
    async.series([
        function (cb) {
            var criteria = {
                _id: userData.id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        customerData = data[0];
                        cb()
                    }
                }

            })
        },
        function (cb) {
            var criteria = {
                bidderId: userData.id
            }
            var path = 'requestId';
            var select = ''
            var populate = {
                path: path,
                match: {},
                select: select,
                options: { lean: true }
            }
            var projection = {

            };
            Service.RequestBiddingService.getPopulatedRequestBidding(criteria, projection, populate, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    requestData = data;
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { requestData: requestData })
    })
}

var getItemRequest = function (userData, payloadData, callback) {
    var customerData;
    var requestData;
    var requestBids;
    var flag = false;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData.id
            }
            Service.UserService.getUser(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
                    else {
                        customerData = data[0];
                        cb()
                    }
                }

            })
        },
        function (cb) {
            var criteria = {
                _id: payloadData.requestId
            }
            var path = 'ordererId';
            var select = 'firstName lastName role'
            var populate = {
                path: path,
                match: {},
                select: select,
                options: { lean: true }
            }
            var projection = {

            };
            Service.CropRequestService.getPopulatedCropRequest(criteria, projection, populate, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.lenght == 0) cb(ERROR.REQUEST_NOT_EXIST)
                    else {
                        requestData = data[0];
                        console.log(">>>>>>>",requestData,flag);
                        if (userData.id == requestData.ordererId._id) {
                            flag = true;
                        }
                        else {
                            flag = false;
                        }
                        console.log("???????????",flag);
                        cb()
                    }
                }
            })
        },
        function (cb) {
            var criteria = {
                requestId: payloadData.requestId,
            }
            var path = 'bidderId';
            var select = 'firstName lastName role'
            var populate = {
                path: path,
                match: {},
                select: select,
                options: { lean: true }
            }
            var projection = {

            };
            Service.RequestBiddingService.getPopulatedRequestBidding(criteria, projection, populate, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    requestBids = data;
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { requestData: requestData, requestBids: requestBids, flag: flag })
    })
}

module.exports = {
    createUser: createUser,
    loginUser: loginUser,
    accessTokenLogin: accessTokenLogin,
    getProfile: getProfile,
    changePassword: changePassword,
    createItems: createItems,
    createItemRequest: createItemRequest,
    supplyItems: supplyItems,
    buyItems: buyItems,
    getItemHistory: getItemHistory,
    getAllItem: getAllItem,
    getUserItem: getUserItem,
    getMarketRequest: getMarketRequest,
    createBid: createBid,
    getMyRequest: getMyRequest,
    getMyBid: getMyBid,
    getItemRequest: getItemRequest
};