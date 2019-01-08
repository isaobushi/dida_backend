/**
 * Created by Navit on 15/11/16.
 */
'use strict';

var Models = require('../Models');


var updateCrops = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.CropDetails.findOneAndUpdate(criteria, dataToSet, options, callback);
};
//Insert User in DB
var createCrops = function (objToSave, callback) {
    new Models.CropDetails(objToSave).save(callback)
};
//Delete User in DB
var deleteCrops = function (criteria, callback) {
    Models.CropDetails.findOneAndRemove(criteria, callback);
};

//Get Users from DB
var getCrops = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.CropDetails.find(criteria, projection, options, callback);
};
var getPopulatedCrops = function (criteria, projection, populate,sortOptions,setOptions,callback)
{
    console.log("dao........",criteria, projection, populate)
    Models.CropDetails.find(criteria).select(projection).populate(populate).sort(sortOptions).exec(function(err, result){
        callback(err, result);
    });
};


module.exports = {
    updateCrops: updateCrops,
    createCrops: createCrops,
    deleteCrops: deleteCrops,
    getCrops:getCrops,
    getPopulatedCrops:getPopulatedCrops
};