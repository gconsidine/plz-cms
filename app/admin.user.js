/**
* @memberof admin
* @namespace admin.user
*/
var AdminUser = function (plz, database, crypto) {
  'use strict';
  
  database = database || require('./utility.database')(plz);
  crypto = crypto || require('crypto');

  plz = plz || {};
  plz.create = plz.create || {};
  plz.get = plz.get || {};
  plz.edit = plz.edit || {};
  plz.remove = plz.remove || {};
  
  var member = {};

  /**
  * Creates a user only if the required fields specified in the configuration 
  * are present and if the user doesn't already exist.  The user's email must
  * be unique.
  *
  * @memberof admin.user
  * @param {object} options - Containing required fields for user creation
  * @param {user} callback
  */
  plz.create.user = function (options, callback) {
    member.prepareUserCreation(options, function (error, result) {
      if(error) {
        return callback(true, { ok: false, message: result, data: null });
      }

      options.createdAt = Date.now();
      options.status = options.status || 'unactivated';
      options.tempAuth = crypto.createHash('sha256').update(JSON.stringify(options)).digest('hex');
      
      var query = {
        collectionName: plz.config.admin.collection,
        document: options,
        uniqueFields: {email: options.email}
      };

      database.createDocument(query, function (error, result) {
        if(error) {
          return callback(true, { 
            ok: false, 
            message: 'Unable to create user. Please try again later.', 
            data: null 
          });
        }

        callback(false, { ok: true, message: 'User successfully created', data: result.ops });
      });
    });
  };

  /**
  * Returns an array of users matching the query options passed as the first
  * argument.
  *
  * @memberof admin.user
  * @param {object} options - The query constraints for your search.
  * @param {user} callback
  */
  plz.get.user = function (options, callback) {
    var query = {
      collectionName: plz.config.admin.collection,
      criteria: options
    };

    database.getDocument(query, function (error, result) {
      if(error) {
        return callback(true, { 
          ok: false, 
          message: 'Unable to fetch users. Please try again later.', 
          data: null 
        });
      }
      
      // Strip password from user before return to client.
      for(var i = 0; i < result.length; i++) {
        delete result[i].password;
      }

      callback(false, { ok: true, message: 'User(s) successfully fetched.', data: result });
    });
  };

  /**
  * Deletes a user if it exists based on the criteria options passed as the
  * first argument.
  *
  * @memberof admin.user
  * @param {object} options - The query constraints for your search.
  * @param {user} callback
  */
  plz.remove.user = function (options, callback) {
    var query = {
      collectionName: plz.config.admin.collection,
      criteria: options
    };

    database.removeDocument(query, function(error, result) {
      if(error) {
        return callback(true, { 
          ok: false, 
          message: 'Could not remove user.  Please try again later', 
          data: null 
        });
      }

      callback(false, { ok: true, message: 'User(s) successfully removed.', data: result });
    });
  };

  /**
  * Updates a user if it exists by matching against options.criteria property, 
  * then updating with the options.update property passed in the options 
  * object as the first argument.
  *
  * @memberof admin.user
  * @param {object} options - The query constraints for your search.
  * @param {user} callback
  */
  plz.edit.user = function (options, callback) {
    var query = {
      collectionName: plz.config.admin.collection,
      criteria: options.criteria,
      update: {
        $set: options.update
      }
    };

    database.editDocument(query, function(error, result) {
      if(error) {
        return callback(true, { 
          ok: false, 
          message: 'Could not edit user.  Please try again later.', 
          data: null
        });
      }

      callback(false, { ok: true, message: 'success', data: result });
    });
  };

  member.prepareUserCreation = function(options, callback) {
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
  };

  return member;
};

module.exports = AdminUser;

/**
* @callback user
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - A concise String message is returned on 
* error. A result object from Mongo is returned on success. 
*/


