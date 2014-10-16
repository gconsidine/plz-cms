// author.article.js
// Contains CRUD actions that can be performed on an article from the author component

var AuthorArticle = function (plz) {
  'use strict';

  var _plz = plz || {},
      _db = _plz.get.database(),
      _modules = _plz.config.author.modules,
      _required = _plz.config.author.required,
      _article = _db.collection(_plz.config.author.article.collection);

  _plz.create = _plz.create || {};

  _plz.create.article = function (options, callback) {
        //TODO: check permissions via plz.restrict.user
        //      check required fields
        //      check database for duplicate title
        //      insert into database
        //      invoke callback with result
  };


  return _plz;
};

module.exports = AuthorArticle;
