var cfenv = require("cfenv");
var Config = require('./Config');

var cloudant;

var vcapLocal;
try {
  vcapLocal = require('./vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);


// Load the Cloudant library.
var Cloudant = require('@cloudant/cloudant');
if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {

  // Initialize database with credentials
  if (appEnv.services['cloudantNoSQLDB']) {
    // CF service named 'cloudantNoSQLDB'
    cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
  } else {
     // user-provided service with 'cloudant' in its name
     cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
  }
} else if (process.env.CLOUDANT_URL){
  cloudant = Cloudant(process.env.CLOUDANT_URL);
}
if(cloudant) {
  //database name
  var dbName = Config.APP_CONSTANTS.SERVER.CLOUDANT_DBNAME;
  for(var i=0;i<dbName.length;i++){
  // Create a new "mydb" database.
  cloudant.db.create(dbName[i], function(err, data) {
    if(!err) //err if database doesn't already exists
      console.log("Created database");
  });
  }
}

var CLOUDANT_TERMS = {
  CLOUDANT:cloudant
}

exports.CLOUDANT_TERMS = CLOUDANT_TERMS;
