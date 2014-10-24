var AdminApi = function (plz) {
  'use strict'; 
  
  require('./admin.user')(plz);
  require('./admin.article')(plz);

  return plz;
};

module.exports = AdminApi;
