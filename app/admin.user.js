var AdminUser = function (plz) {
  'use strict';

  var _plz = plz,
      _db = _plz.get.database(),
      _roles = _plz.config.admin.roles,
      _required = _plz.config.admin.required,
      _user = _db.collection(_plz.config.admin.collection);

  var create = {},
      get = {},
      edit = {},
      remove = {};

  /**
  * Creates a user only if the required fields specified in the configuration 
  * are present and if the user doesn't already exist.  The user's email must
  * be unique.
  */
  create.user = function (options, callback) {
    prepareUserCreation(options, function (error, result) {
      if(error) {
        callback(true, result);
        return;
      }

      _user.findOne({email: options.email}, function (error, result) {
        if(error) {
          callback(true, 'Lookup failed');
          return;
        }

        if(result) {
          callback(true, 'User already exists');
          return;
        }

        _user.insertOne(options, function (error, result) {
          if(error) {
            callback(true, 'Insert failed');
            return;
          }

          callback(false, result);
        });
      });
    });
  };

  /**
  * Returns a single user matching the query options passed as the first
  * argument.
  */
  get.user = function (options, callback) {
    _user.findOne(options, function (error, result) {
      if(error) {
        callback(true, 'Lookup failed');
        return;
      }

      if(!result) {
        callback(true, 'User does not exist');
        return;
      }

      callback(false, result);
    });
  };

  /**
  * Deletes a user if it exists based on the criteria options passed as the
  * first argument.
  */
  remove.user = function (options, callback) {
    _user.findOneAndRemove(options, function (error, result) {
      if(error) {
        callback(true, 'Remove failed');
        return;
      }

      callback(false, result);
    });
  };

  /**
  * Updates a user if it exists by matching against options.criteria property, 
  * then updating with the options.update property passed in the options 
  * object as the first argument.
  */
  edit.user = function (options, callback) {
    _user.findOneAndUpdate(options.criteria, options.update, 
      function (error, result) {
      if(error) {
        callback(true, 'Edit failed');
        return;
      }

      if(!result) {
        callback(true, 'User does not exist');
        return;
      }

      callback(false, result);
    });
  };

  function prepareUserCreation(options, callback) {
    if(!_roles[options.role]) {
      callback(true, 'Required role not present in options');
      return;
    }

    for(var field in _required) {
      if(_required.hasOwnProperty(field)) {
        if(typeof options[field] === 'undefined') {
          callback(true, 'Required field not present in options');
          return;
        }

        if(!_plz.validate.typeAs(_required[field], options[field])) {
          callback(true, 'Required fields\' types not valid in options');
          return;
        }
      }
    }

    callback(false);
  }

  return {
    create: create,
    get: get,
    edit: edit,
    remove: remove
  };
};

module.exports = AdminUser;
