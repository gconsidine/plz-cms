// author.article.js
// Contains CRUD actions that can be performed on an article from the author 
// component

var AuthorArticle = function (plz) {
  'use strict';

  plz = plz || {},
  plz.create = plz.create || {};

  /*
  _modules = plz.config.author.modules,
  _required = plz.config.author.required,
  _article = _db.collection(_plz.config.author.article.collection);

  plz.create.article = function (options, callback) {
    //TODO: check permissions via plz.restrict.user
    //      check required fields
    //      check database for duplicate title
    //      insert into database
    //      invoke callback with result
  };
  */

  return plz;
};

module.exports = AuthorArticle;
