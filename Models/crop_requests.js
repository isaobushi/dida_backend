/**
 * Created by Navit on 15/11/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var croprequest = new Schema({
    ordererId: { type: Schema.ObjectId, ref: 'user' },
    itemOrdered: { type: String, trim: true, required: true },
    itemAmount: { type: Number },
    creationDate: { type: Date, default: Date.now },
    orderState: {
        type: String, enum: [
            Config.APP_CONSTANTS.DATABASE.ORDER_STATE.ORDER_REQUESTED,
            Config.APP_CONSTANTS.DATABASE.ORDER_STATE.PARTIALLY_COMPLETED,
            Config.APP_CONSTANTS.DATABASE.ORDER_STATE.ORDER_COMPLETED
        ]
    },
    endDate: { type: Date },
    ordererRole: {
        type: String, enum: [
            Config.APP_CONSTANTS.DATABASE.USER_ROLES.FARMER,
            Config.APP_CONSTANTS.DATABASE.USER_ROLES.EXPORTER,
            Config.APP_CONSTANTS.DATABASE.USER_ROLES.IMPORTER,
            Config.APP_CONSTANTS.DATABASE.USER_ROLES.CONSUMER
        ]
    },
    suplierId: { type: Schema.ObjectId, ref: 'user' },
    itemsSupplied: { type: Number }
});

module.exports = mongoose.model('croprequest', croprequest);