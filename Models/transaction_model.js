/**
 * Created by Navit on 15/11/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var transaction = new Schema({
    ownerId:{type: Schema.ObjectId, ref: 'user'},
    supplierId:{type: Schema.ObjectId, ref: 'user'},
    currentTime:{type: Date, default: Date.now},
    transactionType:{type: String, enum: [
        Config.APP_CONSTANTS.DATABASE.TRANSACTION_TYPE.CREATE_ITEMS,
        Config.APP_CONSTANTS.DATABASE.TRANSACTION_TYPE.ORDER_ITEMS,
        Config.APP_CONSTANTS.DATABASE.TRANSACTION_TYPE.BUY_ITEMS,
        Config.APP_CONSTANTS.DATABASE.TRANSACTION_TYPE.SUPPLY_ITEMS
    ]},
    itemExchanged:{type: Number},
    itemId:{type: Schema.ObjectId, ref: 'crop'},
    requestId:{type: Schema.ObjectId, ref: 'croprequest'},
    originalPrice:{type:Number},
    boughtPrice:{type:Number}
});

module.exports = mongoose.model('transaction', transaction);