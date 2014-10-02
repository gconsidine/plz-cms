var AdminUser = function (plz) {
  'use strict';

  var _plz = plz,
      _db = _plz.get.database(),
      _roles = _plz.config.admin.roles,
      _required = _plz.config.admin.required,
      _collection = _plz.config.admin.collection;

  var create = {};

  create.user = function (options, callback) {
    prepareUserCreation(options, function (error, result) {
      if(error) {
        callback(true, result);
        return;
      }

      // TODO: Insert only if email is unique
      _db.collection(_collection).insert(options, function (error, result) {
        if(error) {
          callback(true, 'Insert failed');
          return;
        }

        callback(false, result);
      });
    });
  };

  function prepareUserCreation(options, callback) {
    confirmCollectionExists(function (error, result) {
      if(error) {
        callback(true, result);
        return;
      }

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
    });
  }

  function confirmCollectionExists(callback) {
    if(_db[_collection]) {
      callback(false, 'Collection exists');
      return;
    }

    _db.createCollection(_collection, function (error, result) {
      if(error) {
        callback(true, 'Cannot create collection');
        return;
      }

      callback(false, result);
    });
  }

  return {
    create: create
  };
};

module.exports = AdminUser;
