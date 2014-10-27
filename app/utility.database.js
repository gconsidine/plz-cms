/**
* @memberof utility
* @namespace utility.database
*/
var UtilityDatabase = function (plz) {
  'use strict';

  var Mongo = require('mongodb').MongoClient;

  var db;

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
  function createDocument(options, callback) {
    var requiredOptions = {
      collectionName: 'string',
      document: 'object',
      uniqueFields: 'object'
    }; 

	  for(var field in requiredOptions){
      if(typeof options[field] !== requiredOptions[field]){
        callback(true, 'Required field ' + field + ' not present in options');
        return;
      }
    } 

    getDatabase(function (error, database) {
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
  }

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
  function editDocument(options, callback) {
    var requiredOptions = {
      collectionName: 'string',
      criteria: 'object',
      update: 'object'
    }; 

	  for(var field in requiredOptions){
      if(typeof options[field] !== requiredOptions[field]){
        callback(true, 'Required field ' + field + ' not present in options');
        return;
      }
    } 

    getDatabase(function (error, database) {
      if(error) {
        callback(true, 'Cannot establish database connection');
        return;
      }

      var collection = database.collection(options.collectionName);

      collection.findOneAndUpdate(options.criteria, options.update, 
        function (error, result) {
        if(error) {
          callback(true, 'Database findOneAndUpdate error: ' + error);
          return;
        }

        if(!result || result.value === null) {
          var message = [
            'Failed to find document matching',
            JSON.stringify(options.criteria),
            'in ' + options.collectionName
          ].join(' ');

          callback(true, message);
          return;
        }

        callback(false, result);
      });
    });
  }

  /**
  * Opens a database connection, checks for an existing document matching 
  * criteria, and passes the matching document to the given callback
  *
  * @memberof utility.database
  * @param {object} options
  * @param {string} options.collectionName
  * @param {object} options.criteria
  * @param {object} options.update
  * @param {database} callback
  */
  function getDocument(options, callback) {
    var requiredOptions = {
      collectionName: 'string',
      criteria: 'object'
    }; 

	  for(var field in requiredOptions){
      if(typeof options[field] !== requiredOptions[field]){
        callback(true, 'Required field ' + field + ' not present in options');
        return;
      }
    } 

    getDatabase(function (error, database) {
      if(error) {
        callback(true, 'Cannot establish database connection');
        return;
      }

      var collection = database.collection(options.collectionName);

      collection.findOne(options.criteria, function (error, result) {
        if(error) {
          callback(true, 'Database findOne error: ' + error);
          return;
        }

        if(!result || result.matchedCount === 0) {
          var message = [
            'Failed to find document matching',
             JSON.stringify(options.criteria),
             'in ' + options.collectionName
          ].join(' ');

          callback(true, message);
          return;
        }

        callback(false, result);
      });
    });
  }

  /**
  * Opens a database connection, checks for an existing document matching 
  * criteria, and removes the matching document from the specified collection
  *
  * @memberof utility.database
  * @param {object} options
  * @param {string} options.collectionName
  * @param {object} options.criteria
  * @param {object} options.update
  * @param {database} callback
  */
  function removeDocument(options, callback) {
    var requiredOptions = {
      collectionName: 'string',
      criteria: 'object'
    }; 

	  for(var field in requiredOptions){
      if(typeof options[field] !== requiredOptions[field]){
        callback(true, 'Required field ' + field + ' not present in options');
        return;
      }
    }

    getDatabase(function(error, database) {
      if(error) {
        callback(true, 'Cannot establish database connection');
        return;
      }

      var collection = database.collection(options.collectionName);

      // Default: find and delete only one document
      if (!options.hasOwnProperty('limit') || options.limit === 1) {
        collection.findOneAndDelete(options.criteria, function (error, result) {
          if(error) {
            callback(true, 'Remove failed: ' + error);
            return;
          }

          callback(false, result);
        });
      }
      else if (options.limit === '*' || options.limit > 0){
        // find and remove all matching entries
        // I couldn't find an atomic bulk find and delete
        collection.find(options.criteria).toArray(function(error, docs) {
          if(error) {
            callback(true, 'Remove failed: ' + error);
            return;
          }
          if(docs.length === 0){
            var message = [
              'Failed to find document matching',
              JSON.stringify(options.criteria),
              'in ' + options.collectionName
            ].join(' ');
            callback(true, message);
            return;
          }

          var limit = options.limit;
          if (limit === '*'){
            limit = docs.length;
          }
          var removedDocs = [];
          var removedCallback = function(error, result){
            if(error) {
              if (removedDocs.length === 0) {
                callback(true, 'Remove failed: ' + error);
                return;
              }
              else{
                callback(false, removedDocs);
                return;
              }
            }
            else{
              removedDocs.push(result);
              if (removedDocs.length >= limit) {
                callback(false, removedDocs);
                return;
              }
            }
          };
          for (var findIndex = 0; findIndex < limit; findIndex++)
          {
            var criteria = { _id: docs[findIndex]._id };
            collection.findOneAndDelete(criteria, removedCallback);
          }
        });
      }
      else{
        callback(true, 'Invalid value for limit: ' + options.limit);
      }
    });
  }

  function getDatabase(callback, name) {
    if (db !== undefined) {
      callback(false, db);
      return;
    }

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

      db = db || database;
      callback(false, database);
    });
  }

  return {
    getDatabase: getDatabase,
    getDocument: getDocument,
    createDocument: createDocument,
    editDocument: editDocument,
    removeDocument: removeDocument
  };
};

module.exports = UtilityDatabase;

/**
* @callback database
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - A concise String message is returned on 
* error. The database is returned on success.
*/
