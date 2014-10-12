var AdminUser = function (plz) {
  'use strict';

  var _plz = plz,
      _db = _plz.get.database(),
      _roles = _plz.config.admin.roles,
      _required = _plz.config.admin.required,
      _user = _db.collection(_plz.config.admin.collection);

  var create = {};

  create.user = function (options, callback) {
    prepareUserCreation(options, function (error, result) {
      if(error) {
        callback(true, result);
        return;
      }

      _user.find({email: options.email}).toArray(function (error, result) {
        if(error || result.length >= 1) {
          callback(true, 'User already exists / Lookup failed');
          return;
        }

        _user.insert(options, function (error, result) {
          if(error) {
            callback(true, 'Insert failed');
            return;
          }

          callback(false, result);
        });
      });
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
    create: create
  };
};

module.exports = AdminUser;
