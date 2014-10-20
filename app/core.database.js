/**
* @memberof core
* @namespace core.database
*/
var CoreDatabase = function (plz) {
  'use strict';

  var Mongo = require('mongodb').MongoClient;

  // QUESTION: Should these DB methods be exposed to the public plz API?
  //           If not, what is the preferred way to keep them private?
  plz = plz || {}; 
  plz.get = plz.get || {};
  plz.create = plz.create || {};
  plz.edit = plz.edit || {};
  plz.remove = plz.remove || {};

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

  /**
  * Opens a database connection, checks for existing entries with conflicts 
  * according to 'uniqueFields', and inserts the object into the specified
  * collection.
  *
  * @memberof core.database
  * @param {object} options
  * @param {string} options.collectionName
  * @param {object} options.entry
  * @param {object} options.uniqueFields
  * @param {database} callback
  */
  plz.create.dbentry = function (options, callback) {
    var requiredOptions = {
      collectionName: 'string',
      entry: 'object',
      uniqueFields: 'object'
    }; 
	for(var field in requiredOptions){
      if(typeof options[field] != requiredOptions[field]){
        database.close();
        callback(true, 'Required field ' + field + ' not present in options');
        return;
      }
    } 

    plz.get.database(function (error, database) {
      if(error) {
        database.close();
        callback(true, 'Cannot establish database connection');
        return;
      }

      var collection = database.collection(options.collectionName);
      collection.findOne(options.uniqueFields, function (error, result) {
        if(error) {
          database.close();
          callback(true, 'Database findOne error: ' + error);
          return;
        }

        if(result) {
          database.close();
          callback(true, 'Error: entry already exists');
          return;
        }

        collection.insertOne(options.entry, function (error, result) {
          if(error) {
            database.close();
            callback(true, 'Insert failed: ' + error);
            return;
          }

          database.close();
          callback(false, result);
        });
      });
    });
  };

  /**
  * Opens a database connection, checks for an existing entry matching 
  * criteria, and modifies the matching entry with the update command.
  *
  * @memberof core.database
  * @param {object} options
  * @param {string} options.collectionName
  * @param {object} options.criteria
  * @param {object} options.update
  * @param {database} callback
  */
  plz.edit.dbentry = function (options, callback) {
    var requiredOptions = {
      collectionName: 'string',
      criteria: 'object',
      update: 'object'
    }; 
	for(var field in requiredOptions){
      if(typeof options[field] != requiredOptions[field]){
        database.close();
        callback(true, 'Required field ' + field + ' not present in options');
        return;
      }
    } 
    plz.get.database(function (error, database) {
      if(error) {
        database.close();
        callback(true, 'Cannot establish database connection');
        return;
      }

      var collection = database.collection(options.collectionName);
      collection.findOneAndUpdate(options.criteria, options.update, 
        function (error, result) {
        if(error) {
          database.close();
          callback(true, 'Database findOneAndUpdate error: ' + error);
          return;
        }

        if(!result || result.value == null) {
          var message = 'Failed to find entry matching ';
          message += JSON.stringify(options.criteria);
          message += ' in ' + options.collectionName;
          database.close();
          callback(true, message);
          return;
        }

        database.close();
        callback(false, result);
      });
    });
  };

  /**
  * Opens a database connection, checks for an existing entry matching 
  * criteria, and passes the matching entry to the given callback
  *
  * @memberof core.database
  * @param {object} options
  * @param {string} options.collectionName
  * @param {object} options.criteria
  * @param {object} options.update
  * @param {database} callback
  */
  plz.get.dbentry = function (options, callback) {
    var requiredOptions = {
      collectionName: 'string',
      criteria: 'object'
    }; 
	for(var field in requiredOptions){
      if(typeof options[field] != requiredOptions[field]){
        database.close();
        callback(true, 'Required field ' + field + ' not present in options');
        return;
      }
    } 
    plz.get.database(function (error, database) {
      if(error) {
        database.close();
        callback(true, 'Cannot establish database connection');
        return;
      }

      var collection = database.collection(options.collectionName);
      collection.findOne(options.criteria, function (error, result) {
        if(error) {
          database.close();
          callback(true, 'Database findOne error: ' + error);
          return;
        }

        if(!result || result.matchedCount == 0) {
          var message = 'Failed to find entry matching ';
          message += JSON.stringify(options.criteria);
          message += ' in ' + options.collectionName;
          database.close();
          callback(true, message);
          return;
        }

        database.close();
        callback(false, result);
      });
    });
  };

  /**
  * Opens a database connection, checks for an existing entry matching 
  * criteria, and removes the matching entry from the specified collection
  *
  * @memberof core.database
  * @param {object} options
  * @param {string} options.collectionName
  * @param {object} options.criteria
  * @param {object} options.update
  * @param {database} callback
  */
  plz.remove.dbentry = function (options, callback) {
    var requiredOptions = {
      collectionName: 'string',
      criteria: 'object'
    }; 
	for(var field in requiredOptions){
      if(typeof options[field] != requiredOptions[field]){
        database.close();
        callback(true, 'Required field ' + field + ' not present in options');
        return;
      }
    }
    plz.get.database(function(error, database) {
      if(error) {
        database.close();
        callback(true, 'Cannot establish database connection');
        return;
      }

      var collection = database.collection(options.collectionName);
      collection.findOneAndDelete(options.criteria, function (error, result) {
        if(error) {
          database.close();
          callback(true, 'Remove failed: ' + error);
          return;
        }

        database.close();
        callback(false, result);
      });
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
