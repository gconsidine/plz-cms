// author.api.js
// API entry-point for the author component
// Contains general CMS functionality including: article creation, commenting, 
// archiving, etc.

var AuthorApi = function (plz) {
  'use strict'; 
  
  plz = plz || {};
  var modules = plz.config.author.modules;

  if(modules.page){
    require('./author.page')(plz);
  }
  if(modules.post){
    require('./author.post')(plz);
  }

// TODO: implement other content types
//  var comment = require('./author.comment')(_plz);
//  var media = require('./author.media')(_plz);

  return plz;
};

module.exports = AuthorApi;
