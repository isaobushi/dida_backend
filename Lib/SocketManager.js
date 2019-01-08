var UniversalFunctions = require('../Utils/UniversalFunctions');
var Service = require('../Services');
var TokenManager = require('./TokenManager');
var async = require('async');
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
//var redisClient = require("../Utils/redisConnect").redisClient;
var io;

function getKeyByValue(object, value) {
    for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
            if (object[prop] === value)
                return prop;
        }
    }
}

exports.connectSocket = function (server) {
    io = require('socket.io').listen(server.listener);

    console.log("socket server started");

    io.on('connection', function (socket) {
        console.log("connection established: ", socket.id);
        socket.emit('message', { message: { type: 'connection', statusCode: 200, statusMessage: 'WELCOME TO DEAKIN SUPPLY CHAIN', data: "" } });
        socket.on('worldstate', function () {
            console.log(">>>>>>>>> world state recieved");
            getWorldState(function (err, data) {
                io.in(socket.id).emit('message', { message: { type: 'worldstate', statusCode: 200, statusMessage: 'Success', data: data.worldState } })
            })
        })
        socket.on('authenticate', function (userToken) {
            console.log(">>>>>>> authenticate request for user");
            authenticateUser(userToken, socket,function (err, data) {
                if (err) io.in(socket.id).emit('message', { message: { type: 'INCORRECT_ACCESSTOKEN', statusCode: 403, statusMessage: 'Incorrect AccessToken', data: {} } })
                else io.in(socket.id).emit('message', { message: { type: 'authenticate', statusCode: 200, statusMessage: 'Success', data: data } })

            })
        })
        socket.on('recieve',function(){
            console.log(">>>>>>>>>>recieved back call",socket.id);
        })

    })
}

process.on("newItenRequest", function (data) {
    //Emit socket method when an image has been added on mobile device of same user.
    console.log("newItenRequest : ", data);
    io.in(data.socketId).emit('message', { message: { type: 'newItenRequest', statusCode: 200, statusMessage: 'Success', data: data } })
});

process.on("newBidCreated", function (data) {
    //Emit socket method when an image has been added on mobile device of same user.
    console.log("newBidCreated : ", data);
    io.in(data.socketId).emit('message', { message: { type: 'newBidCreated', statusCode: 200, statusMessage: 'Success', data: data } })
});

process.on("bidCreatedSelf", function (data) {
    //Emit socket method when an image has been added on mobile device of same user.
    console.log("bidCreatedSelf : ", data);
    io.in(data.socketId).emit('message', { message: { type: 'bidCreatedSelf', statusCode: 200, statusMessage: 'Success', data: data } })
});

process.on("itemCreated", function (data) {
    //Emit socket method when an image has been added on mobile device of same user.
    console.log("itemCreated : ", data);
    io.in(data.socketId).emit('message', { message: { type: 'itemCreated', statusCode: 200, statusMessage: 'Success', data: data } })
});
process.on("itemRequestSelf", function (data) {
    //Emit socket method when an image has been added on mobile device of same user.
    console.log("itemRequestSelf : ", data);
    io.in(data.socketId).emit('message', { message: { type: 'itemRequestSelf', statusCode: 200, statusMessage: 'Success', data: data } })
});

function authenticate(auth_token, callback) {
    TokenManager.verifyToken(auth_token, function (err, data) {
        if (err) callback(ERROR.INCORRECT_ACCESSTOKEN)
        else callback(null, data);
    })
}

function authenticateUser(userToken, socket, callback) {
    var userData;
    var saveObj;
    async.series([
        function (cb) {
            authenticate(userToken, function (err, data) {
                if (err) cb(err)
                else {
                    userData = data.userData
                    cb()
                }
            })
        },
        function (cb) {
            redisClient.hgetall(userData.id.toString(), function (err, obj) {
                if (obj) {
                    saveObj = obj;
                    saveObj.socketId = socket.id;
                    saveObj.userId = userData.id;
                }
                else {
                    saveObj = {
                        socketId: socket.id,
                        userId: userData.id
                    }
                }
                redisClient.hmset(userData.id.toString(), saveObj);
                cb()
            });
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { redisData: saveObj })
    })
}


function getWorldState(callback) {
    var worldState = {
        consumed: Math.floor(Math.random() * 100) + 1,
        produced: Math.floor(Math.random() * 100) + 1
    };
    async.series([
        function (cb) {
            var criteria = {
                state: "FARMER"
            }
            Service.CropService.getCrops(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    worldState.farmer = data.length;
                    cb()
                }
            })
        },
        function (cb) {
            var criteria = {
                state: "EXPORTER"
            }
            Service.CropService.getCrops(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    worldState.exporter = data.length;
                    cb()
                }
            })
        },
        function (cb) {
            var criteria = {
                state: "IMPORTER"
            }
            Service.CropService.getCrops(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    worldState.importer = data.length;
                    cb()
                }
            })
        },
        function (cb) {
            var criteria = {
                state: "CONSUMER"
            }
            Service.CropService.getCrops(criteria, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    worldState.consumer = data.length;
                    worldState.world = worldState.farmer + worldState.exporter + worldState.importer + worldState.consumer;
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { worldState: worldState })
    })
}