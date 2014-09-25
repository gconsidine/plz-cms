var AdminUser = function (plz) {
  'use strict';

  var _plz = plz,
      _db = _plz.get.database(),
      _roles = plz.config.admin.roles,
      _required = plz.config.admin.required;

  var create = {};

  create.user = function (options, callback) {
    createUserCheck(options, function (error, result) {
      if(error) {
        callback(true, result);
      }

      _db.users.insert(options, function (error, records) {
        if(error) {
          callback(true, 'Insert failed');
        }

        callback(false, records);
      });
    });
  };

  function createUserCheck(options, callback) {
    if(!_roles[options.role]) {
      callback(true, 'Required role not present in options');
      return;
    }

    for(var field in _required) {
      if(_required.hasOwnProperty(field)) {
        if(!options[field]) {
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
