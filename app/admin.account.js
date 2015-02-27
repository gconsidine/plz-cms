/**
* @memberof admin
* @namespace admin.account
*/
var AdminAccount = function (plz, database, mailer, crypto) {
  'use strict';
  
  database = database || require('./utility.database')(plz);
  mailer = mailer || require('./utility.mailer')(plz);
  crypto = crypto || require('crypto');

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
  * @param {object} options.password - Object containing information password details
  * @param {string} options.password.current - The user's current password
  * @param {string} options.password.hash - the string name of a Node.js (crypto) supported hashing 
  * algorithm.  Optionally, you may pass 'none' if you've hashed elsewhere before creation
  * originally.
  * @param {login} callback
  */
  plz.login.user = function (options, callback) {
    if(!options.password || !options.password.current || !options.password.hash) {
      callback(true, { ok: false, message: 'Invalid password options object', data: null });
      return;
    }

    var criteria = { 
      email: options.email,
      $or: [
        { status: 'active' },
        { status: 'reset-pending' }
      ]
    };

    if(options.password.hash === 'none') {
      criteria.password =  options.password.current;
    } else {
      criteria.password = crypto.createHash(options.password.hash)
                                .update(options.password.current)
                                .digest('hex');
    }

    var query = {
      collectionName: plz.config.admin.collection,
      criteria: criteria
    };

    database.getDocument(query, function (error, result) {
      if(error) {
        callback(true, { ok: false, message: result, data: null });
        return;
      }

      if(result.length === 0) {
        callback(false, { ok: false, message: 'Invalid credentials', data: null });
        return;
      }

      // Strip password and tempAuth from user before return to client.
      delete result[0].password;
      delete result[0].tempAuth;

      callback(false, { ok: true, message: 'success', data: result });
    });
  };

  /**
  * Send a password reset link to the email specified in the options provided 
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
  plz.send.reset = function (options, callback) {
    options.status = 'reset-pending';

    member.sendLink(options, function (error, result) {
      if(error) {
        callback(true, { ok: false, message: result, data: null });
        return;
      }

      callback(false, { ok: true, message: 'success', data: result });
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
  * @param {string} options.tempAuth - The hash used to validate account activation
  * @param {mail} callback
  */
  plz.send.activation = function (options, callback) {
    options.status = 'activation-pending';

    member.sendLink(options, function (error, result) {
      if(error) {
        callback(true, { ok: false, message: result, data: null });
        return;
      }

      callback(false, { ok: true, message: 'success', data: result });
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
      callback(true, { ok: false, message: 'User\'s role not permitted', data: null });
      return;
    }

    callback(false, { ok: true, message: 'success', data: null });
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
      callback(true, { ok: false, message: 'User\'s role not permitted', data: null });
      return;
    }

    callback(false, { ok: true, message: 'success', data: null });
  };

  member.sendLink = function (options, callback) {
    var collectionName = plz.config.admin.collection;

    var query = {
      collectionName: collectionName, 
      criteria: { email: options.user.email },
      update: {
        $set: {
          status: options.status,
          modifiedAt: Date.now()
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
        tempAuth: options.tempAuth
      }
    };

    database.getDocument(query, function (error, result) {
      if(error) {
        callback(true, { ok: false, message: result, data: null });
        return;
      }

      if(result.length === 0) {
        callback(false, { ok: false, message: 'Invalid credentials', data: null });
        return;
      }

      callback(false, { ok: true, message: 'success', data: result });
    });
  };

  member.completeAction = function (options, callback) {
    if(!options.password || !options.password.hash || !options.password.new) {
      callback(true, { ok: false, message: 'Invalid password options', data: null });
      return;
    }

    var collectionName = plz.config.admin.collection;

    var set = {
      status: 'active',
      modifiedAt: Date.now()
    };

    if(options.password.hash !== 'none') {
      if(!plz.validate.complexity(options.password.new)) {
        callback(true, { 
          ok: false, 
          message: 'Password does not meet the complexity requirements',
          data: null 
        });
        return;
      }

      if(!plz.validate.match(options.password.new, options.password.confirm)) {
        callback(false, { ok: false, message: 'Passwords do not match', data: null });
        return;
      }

      set.password = crypto.createHash(options.password.hash)
                           .update(options.password.new)
                           .digest('hex');
    } else {
      set.password = options.password.new;
    }

    var query = {
      collectionName: collectionName,
      criteria: { email: options.email, tempAuth: options.tempAuth },
      update: { $set: set }
    };

    database.editDocument(query, function (error, result) {
      if(error) {
        callback(true, { ok: false, message: result, data: null });
        return;
      }

      callback(false, { ok: true, message: 'success', data: result });
    });
  };

  /**
  * Returns a user with a matching tempAuth hash, email, and status.  Alias for
  * authorize()
  *
  * @memberof admin.account
  * @param {object} options
  * @param {string} options.email - Email address of the user
  * @param {string} options.tempAuth - The hash used to validate account activation
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
  * @param {string} options.tempAuth - The hash used to validate account activation
  * @param {authorize} callback
  */
  plz.authorize.activation = member.authorize;

  /**
  * Finds the user with matching tempAuth hash, email, and status, and updates 
  * the user's password and status.  Optionally, passwords are validated for complexity and
  * status is set to 'active' when successful.
  *
  * @memberof admin.account
  * @param {object} options
  * @param {string} options.email - Email address of the user
  * @param {string} options.hash - The hash used to validate account activation
  * @param {object} options.password - Object containing information password details
  * @param {string} options.password.new - New password to be set
  * @param {string} options.password.confirm - Same password for confirmation
  * @param {string} options.password.hash - the string name of a Node.js (crypto) supported hashing 
  * algorithm.  Optionally, you may pass 'none' if you've hashed elsewhere before passing it to
  * plz.  However, this will skip over password complexity and matching checks for obvious resaons
  * and take only the 'new' property of the password object.
  * @param {string=} options.password.salt - Optionally supply a salt
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
  * @param {object} options.password - Object containing information password details
  * @param {string} options.password.new - New password to be set
  * @param {string} options.password.confirm - Same password for confirmation
  * @param {string} options.password.hash - the string name of a Node.js (crypto) supported hashing 
  * algorithm.  Optionally, you may pass 'none' if you've hashed elsewhere before passing it to 
  * plz.  However, this will skip over password complexity and matching checks for obvious resaons
  * and take only the 'new' property of the password object.
  * @param {string=} options.password.salt - Optionally supply a salt
  * @param {complete} callback
  */
  plz.complete.activation = member.completeAction; 

  return member;
};

module.exports = AdminAccount;

/* TODO: Update callback documentation */

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
