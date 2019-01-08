/**
 * Created by Navit on 15/11/16.
 */
'use strict';

var Models = require('../Models');


var updateCropRequest = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.CropRequest.findOneAndUpdate(criteria, dataToSet, options, callback);
};
//Insert User in DB
var createCropRequest = function (objToSave, callback) {
    new Models.CropRequest(objToSave).save(callback)
};
//Delete User in DB
var deleteCropRequest = function (criteria, callback) {
    Models.CropRequest.findOneAndRemove(criteria, callback);
};

//Get Users from DB
var getCropRequest = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.CropRequest.find(criteria, projection, options, callback);
};
var getPopulatedCropRequest = function (criteria, projection, populate,sortOptions,setOptions,callback)
{
    console.log("dao........",criteria, projection, populate)
    Models.CropRequest.find(criteria).select(projection).populate(populate).sort(sortOptions).exec(function(err, result){
        callback(err, result);
    });
};


module.exports = {
    updateCropRequest: updateCropRequest,
    createCropRequest: createCropRequest,
    deleteCropRequest: deleteCropRequest,
    getCropRequest:getCropRequest,
    getPopulatedCropRequest:getPopulatedCropRequest
};