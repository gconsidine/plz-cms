var UtilityApi = function (plz) {
  'use strict'; 
  
  var db = require('./utility.database')(plz),
      mailer = require('./utility.mailer')(plz);

  return {
    db: db,
    mailer: mailer
  };
};

module.exports = UtilityApi;
