/**
* @memberof core
* @namespace core.database
*/
var CoreDatabase = function (plz) {
  'use strict';

  var Mongo = require('mongodb').MongoClient;

  plz = plz || {}; 
  plz.get = plz.get || {};

  /**
  * Opens a MongoDB connection and calls the callback with a status and the
  * database connection.  The database used by default is the default 
  * connection specified in the original configuration options.  Otherwise,
  * the name given of a different database from the configuration options
  * can be supplied as an optional second parameter.
  *
  * @memberof core.database
  * @param {database} callback
  * @param {string=} - The name of a database connection from the configuration
  * options.
  */
  plz.get.database = function (callback, name) {
    var uri = plz.config.database.default.uri;

    if(name) {
      if(!plz.config.database[name]) {
        throw new Error('Database URI does not exist in configuration');
      }

      uri = plz.config.database[name];
    }

    Mongo.connect(uri, function (error, database) {
      if(error) { 
        callback(true, 'invalid database URI / cannot connect'); 
        return; 
      }

      callback(false, database);
    });
  };

  return plz;
};

module.exports = CoreDatabase;

/**
* @callback database
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - A concise String message is returned on 
* error. The database is returned on success.
*/
