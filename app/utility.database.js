/**
* @memberof utility
* @namespace utility.database
*/
var UtilityDatabase = function (plz) {
  'use strict';

  var Mongo = require('mongodb').MongoClient;

  var member = {}; 
  member.db;

  /**
  * Opens a database connection, checks for existing documents with conflicts 
  * according to 'uniqueFields', and inserts the document into the specified
  * collection.
  *
  * @memberof utility.database
  * @param {object} options
  * @param {string} options.collectionName
  * @param {object} options.document
  * @param {object} options.uniqueFields
  * @param {database} callback
  */
  member.createDocument = function (options, callback) {
    member.getDatabase(function (error, database) {
      if(error) {
        callback(true, 'Cannot establish database connection');
        return;
      }

      var collection = database.collection(options.collectionName);
      
      collection.findOne(options.uniqueFields, function (error, result) {
        if(error) {
          callback(true, 'Database findOne error: ' + error);
          return;
        }

        if(result) {
          callback(true, 'Error: document already exists');
          return;
        }

        collection.insertOne(options.document, function (error, result) {
          if(error) {
            callback(true, 'Insert failed: ' + error);
            return;
          }

          callback(false, result);
        });
      });
    });
  };

  /**
  * Opens a database connection, checks for an existing document matching 
  * criteria, and modifies the matching document with the update command.
  *
  * @memberof utility.database
  * @param {object} options
  * @param {string} options.collectionName
  * @param {object} options.criteria
  * @param {object} options.update
  * @param {database} callback
  */
  member.editDocument = function(options, callback) {
    member.getDatabase(function (error, database) {
      if(error) {
        callback(true, 'Cannot establish database connection');
        return;
      }

      var collection = database.collection(options.collectionName);

      collection.findOneAndUpdate(options.criteria, options.update, function (error, result) {
        if(error) {
          callback(true, 'Edit document failed');
          return;
        }

        if(!result.ok || result.value === null) {
          callback(true, 'No documents affected by edit operation');
          return;
        }

        callback(false, result.lastErrorObject);
      });
    });
  };

  /**
  * Opens a database connection, checks for an existing document matching 
  * criteria, and passes the matching document to the given callback
  *
  * @memberof utility.database
  * @param {object} options
  * @param {string} options.collectionName
  * @param {object} options.criteria
  * @param {object} options.limit
  * @param {database} callback
  */
  member.getDocument = function (options, callback) {
    member.getDatabase(function (error, database) {
      if(error) {
        callback(true, 'Cannot establish database connection');
        return;
      }

      var collection = database.collection(options.collectionName);
      var findCursor;

      if(!options.criteria && !options.limit) {
        findCursor = collection.find();
      } else if(!options.criteria && options.limit) {
        findCursor = collection.find().limit(options.limit);
      } else if(!options.limit) {
        findCursor = collection.find(options.criteria);
      } else {
        findCursor = collection.find(options.criteria).limit(options.limit);
      }

      findCursor.toArray(function(error, result) {
        if(error) {
          callback(true, 'Cannot find document');
          return;
        }
        
        callback(false, result);
      });
    });
  };

  /**
  * Opens a database connection, checks for an existing document matching 
  * criteria, and removes the matching document from the specified collection
  *
  * @memberof utility.database
  * @param {object} options
  * @param {string} options.collectionName
  * @param {object} options.criteria
  * @param {database} callback
  */
  member.removeDocument = function (options, callback) {
    member.getDatabase(function(error, database) {
      if(error) {
        callback(true, 'Cannot establish database connection');
        return;
      }

      var collection = database.collection(options.collectionName);
      
      collection.remove(options.criteria, {w: 1}, function (error, result) {
        if(error) {
          callback(true, 'Database error: cannot remove document');
          return;
        }

        if(!result.result.ok || result.result.n === 0) {
          callback(true, 'No existing documents affected by remove');
          return;
        }

        callback(false, result.result);
      });
    });
  };

  // TODO: rename to getConnection()
  member.getDatabase = function (callback, name) {
    if (member.db !== undefined) {
      callback(false, member.db);
      return;
    }

    var uri = plz.config.database.default.uri;

    if(name) {
      if(!plz.config.database[name]) {
        throw new Error('Database URI does not exist in configuration');
      }

      uri = plz.config.database[name].uri;
    }

    Mongo.connect(uri, function (error, database) {
      if(error) { 
        callback(true, 'invalid database URI / cannot connect'); 
        return; 
      }

      member.db = member.db || database;
      callback(false, member.db);
    });
  };

  return member;
};

module.exports = UtilityDatabase;

/**
* @callback database
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - A concise String message is returned on 
* error. The database is returned on success.
*/
