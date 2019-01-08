/**
 * Created by Navit on 15/11/16.
 */
'use strict';

var Models = require('../Models');


var updateRequestBidding = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.RequestBidding.findOneAndUpdate(criteria, dataToSet, options, callback);
};
//Insert User in DB
var createRequestBidding = function (objToSave, callback) {
    new Models.RequestBidding(objToSave).save(callback)
};
//Delete User in DB
var deleteRequestBidding = function (criteria, callback) {
    Models.RequestBidding.findOneAndRemove(criteria, callback);
};

//Get Users from DB
var getRequestBidding = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.RequestBidding.find(criteria, projection, options, callback);
};
var getPopulatedRequestBidding = function (criteria, projection, populate,sortOptions,setOptions,callback)
{
    console.log("dao........",criteria, projection, populate)
    Models.RequestBidding.find(criteria).select(projection).populate(populate).sort(sortOptions).exec(function(err, result){
        callback(err, result);
    });
};
 

module.exports = {
    updateRequestBidding: updateRequestBidding,
    createRequestBidding: createRequestBidding,
    deleteRequestBidding: deleteRequestBidding,
    getRequestBidding:getRequestBidding,
    getPopulatedRequestBidding:getPopulatedRequestBidding
};