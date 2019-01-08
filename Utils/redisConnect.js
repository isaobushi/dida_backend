
var Config = require('../Config');
var redis = require('redis');

var redisClient = redis.createClient(Config.APP_CONSTANTS.SERVER.REDIS_PORT);
//Starting redis Server

redisClient.on('error', function (err) {
    console.log("Redis Connection Error : ", err);
    redisClient.on('connect', function () {
        console.log('Redis Connected');
    });
});

redisClient.on('ready', function () {
    console.log('redis is running');
});

/*
redisClient.on('connect', function() {
    console.log('Redis Connected');
});
*/

exports.redisClient = redisClient
