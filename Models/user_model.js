/**
 * Created by Navit on 15/11/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var user = new Schema({
    firstName: {type: String, trim: true, required: true},
    lastName: {type: String, trim: true, required: true},
    emailId: {type: String, trim: true, required: true},
    accessToken: {type: String, trim: true, index: true, unique: true, sparse: true},
    password: {type: String},
    role: {type: String, enum: [
        Config.APP_CONSTANTS.DATABASE.USER_ROLES.FARMER,
        Config.APP_CONSTANTS.DATABASE.USER_ROLES.EXPORTER,
        Config.APP_CONSTANTS.DATABASE.USER_ROLES.IMPORTER,
        Config.APP_CONSTANTS.DATABASE.USER_ROLES.CONSUMER
    ]},
    registrationDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('user', user);