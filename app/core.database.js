var CoreDatabase = function (plz) {
  'use strict';

  var Mongo = require('mongodb').MongoClient;

  var _uri = plz.config.database.default.uri;

  plz = plz || {}; 
  plz.get = plz.get || {};
  plz.set = plz.set || {};

  plz.get.database = function (callback) {
    Mongo.connect(_uri, function (error, database) {
      if(error) { 
        callback(true, 'invalid database URI / cannot connect'); 
        return; 
      }

      callback(false, database);
    });
  };

  plz.set.database = function (name) {
    if(!plz.config.database[name]) {
      throw new Error('Database URI does not exist in configuration');
    }

    _uri = plz.config.database[name].uri;
  };

  return plz;
};

module.exports = CoreDatabase;
