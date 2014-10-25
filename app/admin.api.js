var AdminApi = function (plz) {
  'use strict'; 
  
  require('./admin.user')(plz);
  require('./admin.account')(plz);

  return plz;
};

module.exports = AdminApi;
