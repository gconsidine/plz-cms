/**
* @memberof admin
* @namespace admin.account
*/
var AdminAccount = function (plz) {
  'use strict';
  
  var Crypto = require('crypto');

  var Utility = require('./utility.api')(plz),
      database = Utility.db,
      mailer = Utility.mailer;

  plz = plz || {};
  plz.login = plz.login || {};
  plz.reset = plz.reset || {};
  plz.activate = plz.activate || {};
  plz.restrict = plz.restrict || {};
  plz.allow = plz.allow || {};

  /**
  * Returns the user if the login credentials match, otherwise a error is set 
  * to true and a string response is returned.
  * 
  * @memberof admin.account
  * @param {object} options
  * @param {string} options.email - A user's email address 
  * @param {string} options.password - The user's password as stored in the DB
  * @param {login} callback
  */
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

  /**
  * Send a password reset link to the email specified in the options providided 
  * the user already has an active account.  Email is sent from the default 
  * mailer set in the plz-cms configuration options.
  *
  * @memberof admin.account
  * @param {object} options
  * @param {object} options.email - A user's email address 
  * @param {string} options.subject - The subject of the email
  * @param {string} options.body - The message body of the email
  * @param {mail} callback
  */
  plz.reset.password = function (options, callback) {
    var collectionName = plz.config.admin.collection;

    var query = {
      collectionName: collectionName,
      criteria: { email: options.email }
    };

    database.getDocument(query, function (error, result) {
      if(error) {
        callback(true, result);
        return;
      }

      options.user = result;
      options.collectionName = collectionName;

      sendResetEmail(options, function (error, result) {
        if(error) {
          callback(true, result);
        }

        callback(false, result);
      });
    });
  };

  /**
  * Send an account activation link to a new user
  *
  * @memberof admin.account
  * @param {object} options
  * @param {object} options.email - A user's email address 
  * @param {string} options.subject - The subject of the email
  * @param {string} options.body - The message body of the email
  * @param {mail} callback
  */
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

  function createHash(string, callback) {
    var shasum = Crypto.createHash('sha256');
    shasum.update(string);
    var hash = shasum.digest('hex');

    callback(false, hash); 
  }

  function sendResetEmail(options, callback) {
    var resetString = options.user.password + new Date() + options.user.email;

    createHash(resetString, function (error, hash) {
      if(error) {
        callback(true, 'Unable to create reset hash.');
        return;
      }

      var query = {
        collectionName: options.collectionName, 
        criteria: { email: options.user.email },
        update: {
          status: 'reset-pending',
          modifiedAt: new Date().getTime() / 1000,
          resetHash: hash
        }
      };

      database.editDocument(query, function (error, result) {
        if(error) {
          callback(true, result);
          return;
        }

        var mailOptions = {
          to: options.user.email,
          subject: options.subject,
          body: options.body
        };
        
        mailer.sendMail(mailOptions, function (error, result) {
          if(error) {
            callback(true, result);
            return;
          }

          callback(false, result);
        });
      });
    });
  }
 
  return plz;
};

module.exports = AdminAccount;

/**
* @callback login
* @param {boolean} error - Indicating success/failure of the call
* @param {object|string} result - User document object if successful, otherwise
* a string response message.
*/

/**
* @callback access
* @param {boolean} error - Indicating success/failure of the call
* @param {boolean} result - true if the user is allowed, false if not.
*/
