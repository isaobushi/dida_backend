var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var requestbidding = new Schema({
    requestId: { type: Schema.ObjectId, ref: 'croprequest', required: true },
    bidderId: { type: Schema.ObjectId, ref: 'user', required: true },
    amountOfItems: { type: Number, required: true },
    priceOffered: { type: Number, required: true },
    dateOfDelivery: { type: Date },
    creationDate: { type: Date, default: Date.now },
    updatedDate: { type: Date },
    bidStatus: {
        type: String, enum: [
            Config.APP_CONSTANTS.DATABASE.BID_STATUS.PENDING,
            Config.APP_CONSTANTS.DATABASE.BID_STATUS.APPROVED,
            Config.APP_CONSTANTS.DATABASE.BID_STATUS.REJECTED
        ],
        default: Config.APP_CONSTANTS.DATABASE.BID_STATUS.PENDING
    },
    bidView: {
        type: String, enum: [
            Config.APP_CONSTANTS.DATABASE.BID_VIEW.PUBLIC,
            Config.APP_CONSTANTS.DATABASE.BID_VIEW.PRIVATE
        ]
    }
});

module.exports = mongoose.model('requestbidding', requestbidding);