var AdminApi = function (plz) {
  'use strict'; 
  
  var User = require('./admin.user')(plz);

  return User;
};

module.exports = AdminApi;
