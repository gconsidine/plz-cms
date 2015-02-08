/**
* @memberof admin
* @namespace admin.account
*/
var AdminAccount = function (plz, database, mailer) {
  'use strict';
  
  database = database || require('./utility.database')(plz);
  mailer = mailer || require('./utility.mailer')(plz);

  plz = plz || {};
  plz.login = plz.login || {};
  plz.send = plz.send || {};
  plz.authorize = plz.authorize || {};
  plz.complete = plz.complete || {};
  plz.restrict = plz.restrict || {};
  plz.allow = plz.allow || {};

  var member = {};

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
  * @param {string} options.hash - The hash used for reset validation
  * @param {mail} callback
  */
  plz.send.reset = function (options, callback) {
    options.status = 'reset-pending';

    member.sendLink(options, function (error, result) {
      if(error) {
        callback(true, result);
        return;
      }

      callback(false, result);
    });
  };

  /**
  * Send an account activation link to a new user
  *
  * @memberof admin.account
  * @param {object} options
  * @param {object} options.user - A user object 
  * @param {string} options.subject - The subject of the email
  * @param {string} options.body - The message body of the email
  * @param {string} options.hash - The hash used to validate account activation
  * @param {mail} callback
  */
  plz.send.activation = function (options, callback) {
    options.status = 'activation-pending';

    member.sendLink(options, function (error, result) {
      if(error) {
        callback(true, result);
        return;
      }

      callback(false, result);
    });
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

  member.sendLink = function (options, callback) {
    var collectionName = plz.config.admin.collection;

    var query = {
      collectionName: collectionName, 
      criteria: { email: options.user.email },
      update: {
        $set: {
          status: options.status,
          modifiedAt: new Date().getTime(),
          tempAuth: options.hash
        }
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
          callback(true, 'Mail not sent');
          return;
        }

        callback(false, result);
      });
    });
  };

  member.authorize = function (options, callback) {
    var collectionName = plz.config.admin.collection;

    var query = {
      collectionName: collectionName,
      criteria: { 
        email: options.email,
        tempAuth: options.hash
      }
    };

    database.getDocument(query, function (error, result) {
      if(error) {
        callback(true, false);
        return;
      }

      if(result.length === 0) {
        callback(true, false);
        return;
      }

      callback(false, true);
    });
  };

  member.completeAction = function (options, callback) {
    if(!plz.validate.complexity(options.passwordNew)) {
      callback(true, 'Password does not meet the complexity requirements');
      return;
    }

    if(!plz.validate.match(options.passwordNew, options.passwordConfirm)) {
      callback(true, 'Passwords do not match');
      return;
    }

    var collectionName = plz.config.admin.collection;

    var query = {
      collectionName: collectionName,
      criteria: { email: options.email },
      update: {
        $set: {
          status: 'active',
          modifiedAt: new Date().getTime() / 1000
        }
      }
    };

    database.editDocument(query, function (error, result) {
      if(error) {
        callback(true, result);
        return;
      }

      callback(false, result);
    });
  };

  /**
  * Returns a user with a matching tempAuth hash, email, and status.  Alias for
  * authorize()
  *
  * @memberof admin.account
  * @param {object} options
  * @param {string} options.email - Email address of the user
  * @param {string} options.hash - The hash used to validate account activation
  * @param {authorize} callback
  */
  plz.authorize.reset =  member.authorize;

  /**
  * Returns a user with a matching tempAuth hash, email, and status. Alias for 
  * authorize().
  *
  * @memberof admin.account
  * @param {object} options
  * @param {string} options.email - Email address of the user
  * @param {string} options.hash - The hash used to validate account activation
  * @param {authorize} callback
  */
  plz.authorize.activation = member.authorize;

  /**
  * Finds the user with matching tempAuth hash, email, and status, and updates 
  * the user's password and status.  Passwords are validated for complexity and
  * status is set to 'active' when successful.
  *
  * @memberof admin.account
  * @param {object} options
  * @param {string} options.email - Email address of the user
  * @param {string} options.hash - The hash used to validate account activation
  * @param {string} options.passwordNew - New password set by user 
  * @param {string} options.passwordConfirm - New password repeated
  * @param {complete} callback
  */
  plz.complete.reset = member.completeAction; 

  /**
  * Finds the user with matching tempAuth hash, email, and status, and updates 
  * the user's password and status.  Passwords are validated for complexity and
  * status is set to 'active' when successful.
  *
  * @memberof admin.account
  * @param {object} options
  * @param {string} options.email - Email address of the user
  * @param {string} options.hash - The hash used to validate account activation
  * @param {string} options.passwordNew - New password set by user 
  * @param {string} options.passwordConfirm - New password repeated
  * @param {complete} callback
  */
  plz.complete.activation = member.completeAction; 

  return member;
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
