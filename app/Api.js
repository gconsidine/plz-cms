var Api = function () {
  'use strict';

  var Validate = require('./Validate'),
      Sanitize = require('./Sanitize');
  
  var _api = {};

  function registerModules(modules) {
    for(var name in modules) {
      if(modules.hasOwnProperty(name)) {
        if(modules[name] === false) {
          continue;
        }

        switch(name) {
          case 'admin':
            registerApi(require('plz-admin'));
            break;
          case 'author':
            registerApi(require('plz-author'));
            break;
          case 'merchant':
            registerApi(require('plz-merchant'));
            break;
          case 'scout':
            registerApi(require('plz-scout'));
            break; 
        }
      }
    }

    setDefaultApi();

    return _api;
  }

  function registerApi(plzModule) {
    for(var verbCategory in plzModule) {
      if(plzModule.hasOwnProperty(verbCategory)) {
        if(_api[verbCategory] === 'undefined') {
          _api[verbCategory] = {}; 
        }

        for(var noun in plzModule[verbCategory]) {
          if(plzModule[verbCategory].hasOwnProperty(noun)) {
            _api[verbCategory][noun] = plzModule[verbCategory][noun];
          }
        }
      }
    }
  }

  function setDefaultApi() {
    var action;

    _api.validate = _api.validate || {};
    _api.sanitize = _api.sanitize || {};

    for(action in Validate) {
      if(Validate.hasOwnProperty(action)) {
        _api.validate[action] = Validate[action];
      }
    }

    for(action in Sanitize) {
      if(Sanitize.hasOwnProperty(action)) {
        _api.sanitize[action] = Sanitize[action];
      }
    }
  }
  
  return {
    registerModules: registerModules
  };
};

module.exports = Api();
