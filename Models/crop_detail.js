/**
 * Created by Navit on 15/11/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var crop = new Schema({
    ownerId:{type: Schema.ObjectId, ref: 'user'},
    itemName:{type: String, trim: true, required: true},
    creationDate:{type: Date, default: Date.now},
    price:{type: Number, trim: true, required: true},
    state:{type: String, trim: true, required: true}
});

module.exports = mongoose.model('crop', crop);