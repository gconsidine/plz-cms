//author.api.js
//API entry-point for the author component
// Contains general CMS functionality including: article creation, commenting, archiving, etc.

var AuthorApi = function (plz) {
  'use strict'; 
  
  require('./author.page')(plz);
  require('./author.article')(plz);

// TODO: implement other content types
//  var comment = require('./author.comment')(_plz);
//  var media = require('./author.media')(_plz);

  return plz;
};

module.exports = AuthorApi;
