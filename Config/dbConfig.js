/**
 * Created by Navit
 */

'use strict';

var mongo = {
    //URI: process.env.MONGO_URI || 'mongodb://localhost/Supplychain_deakin',
    URI: process.env.MONGO_URI || "mongodb://dda_admin:UF1JIrpobK@52.42.15.246/dda_dev",
    port: 27017
};

module.exports = {
    mongo: mongo
};



