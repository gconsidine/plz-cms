/**
* @memberof admin
* @namespace admin.account
*/
var AdminAccount = function (plz) {
  'use strict';

  var Utility = require('./utility.api')(plz),
      database = Utility.db,
      mailer = Utility.mailer;

  plz = plz || {};
  plz.login = plz.login || {};
  plz.reset = plz.reset || {};
  plz.activate = plz.activate || {};
  plz.restrict = plz.restrict || {};
  plz.allow = plz.allow || {};

  plz.login.user = function (options, callback) {
    var query = {
      collectionName: plz.config.admin.collection,
      criteria: options
    };

    database.getDocument(query, function (error, user) {
      if(error) {
        callback(true, user);
        return;
      }

      callback(false, user);
    });
  };

  plz.reset.password = function (options, callback) {
    console.log(options, callback, mailer);
  };

  plz.activate.user = function (options, callback) {
    console.log(options, callback, mailer);
  };

  /**
  * Returns a true result if a user's role is included in the roles provided in
  * the options object (whitelist).
  *
  * @memberof admin.account
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
  * @memberof admin.account
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
  
  return plz;
};

module.exports = AdminAccount;

/**
* @callback access
* @param {boolean} error - Indicating success/failure of the call
* @param {boolean} result - true if the user is allowed, false if not.
*/
