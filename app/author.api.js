var AuthorApi = function (plz) {
  'use strict'; 
  
  plz = plz || {};

  require('./author.page')(plz);
  require('./author.post')(plz);

  return plz;
};

module.exports = AuthorApi;
