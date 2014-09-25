var AdminApi = function (plz) {
  'use strict'; 

  var User = require('./admin.user')(plz);

  // TODO: temporary return API
  return User;
};

module.exports = AdminApi;
