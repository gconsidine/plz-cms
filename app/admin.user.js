/**
* @namespace admin
*/
var AdminUser = function (plz) {
  'use strict';
  
  var Utility = require('./utility.api')(plz),
      database = Utility.db;

  plz = plz || {};
  plz.create = plz.create || {};
  plz.get = plz.get || {};
  plz.edit = plz.edit || {};
  plz.remove = plz.remove || {};
  plz.restrict = plz.restrict || {};
  plz.allow = plz.allow || {};

  /**
  * Creates a user only if the required fields specified in the configuration 
  * are present and if the user doesn't already exist.  The user's email must
  * be unique.
  *
  * @memberof admin
  * @param {object} options - Containing required fields for user creation
  * @param {user} callback
  */
  plz.create.user = function (options, callback) {
    prepareUserCreation(options, function (error, result) {
      if(error) {
        callback(true, result);
        return;
      }
      
      var query = {
        collectionName: plz.config.admin.collection,
        document: options,
        uniqueFields: {email: options.email}
      };

      database.createDocument(query, function(error, result){
        callback(error, result);
      });
    });
  };

  /**
  * Returns a single user matching the query options passed as the first
  * argument.
  *
  * @memberof admin
  * @param {object} options - The query constraints for your search.
  * @param {user} callback
  */
  plz.get.user = function (options, callback) {
    var query = {
      collectionName: plz.config.admin.collection,
      criteria: options
    };

    database.getDocument(query, function (error, result) {
      callback(error, result);
    });
  };

  /**
  * Deletes a user if it exists based on the criteria options passed as the
  * first argument.
  *
  * @memberof admin
  * @param {object} options - The query constraints for your search.
  * @param {user} callback
  */
  plz.remove.user = function (options, callback) {
    var query = {
      collectionName: plz.config.admin.collection,
      criteria: options
    };

    database.removeDocument(query, function(error, result) {
      callback(error, result);
    });
  };

  /**
  * Updates a user if it exists by matching against options.criteria property, 
  * then updating with the options.update property passed in the options 
  * object as the first argument.
  *
  * @memberof admin
  * @param {object} options - The query constraints for your search.
  * @param {user} callback
  */
  plz.edit.user = function (options, callback) {
    var query = {
      collectionName: plz.config.admin.collection,
      criteria: options.criteria,
      update: options.update
    };

    database.editDocument(query, function(error, result){
      callback(error, result);
    });
  };

  /**
  * Returns a true result if a user's role is included in the roles provided in
  * the options object (whitelist).
  *
  * @memberof admin
  * @param {object} options
  * @param {object} options.user - The user given via plz.login.user
  * @param {array} options.roles - An array of roles that are allowed
  * @param {access} callback
  */
  plz.allow.user = function (options, callback) {
    if(options.roles.indexOf(options.user.role) === -1) {
      callback(false, false);
      return;
    }

    callback(false, true);
  };

  /**
  * Returns a true result if a user's role is **not** included in the roles 
  * provided in the options object (blacklist).
  *
  * @memberof admin
  * @param {object} options
  * @param {object} options.user - The user given via plz.login.user
  * @param {array} options.roles - An array of roles that are not allowed
  * @param {result} callback
  */
  plz.restrict.user = function (options, callback) {
    if(options.roles.indexOf(options.user.role) !== -1) {
      callback(false, false);
      return;
    }

    callback(false, true);
  };

  function prepareUserCreation(options, callback) {
    var roles = plz.config.admin.roles,
        required = plz.config.admin.required;

    if(!roles[options.role]) {
      callback(true, 'Required role not present in options');
      return;
    }

    for(var field in required) {
      if(required.hasOwnProperty(field)) {
        if(typeof options[field] === 'undefined') {
          callback(true, 'Required field not present in options');
          return;
        }

        if(!plz.validate.typeAs(required[field], options[field])) {
          callback(true, 'Required fields\' types not valid in options');
          return;
        }
      }
    }

    callback(false);
  }

  return plz;
};

module.exports = AdminUser;

/**
* @callback user
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - A concise String message is returned on 
* error. A result object from Mongo is returned on success. 
*/

/**
* @callback access
* @param {boolean} error - Indicating success/failure of the call
* @param {boolean} result - true if the user is allowed, false if not.
*/
