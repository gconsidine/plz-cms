var AdminUser = function (plz) {
  'use strict';

  /*
  var _plz = plz,
      _roles = plz.config.admin.roles,
  */
  var _required = plz.config.admin.required;

  var create = {};

  create.user = function (options, callback) {
    createUserCheck(options, function (error, result) {
      if(error) {
        throw new Error(result);
      }

      callback(result);
    });
  };

  function createUserCheck(options, callback) {
    for(var field in _required) {
      if(_required.hasOwnProperty(field)) {
        if(!options[field]) {
          callback(true, 'Required field not present in options');
        }

      }
    }
  }

};

module.exports = AdminUser;
