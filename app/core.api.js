var CoreApi = function () {
  'use strict';

  var Validate = require('./core.validate'),
      Sanitize = require('./core.sanitize');
  
  var _api = {};

  function registerModules(config, api) {
    var modules = config.modules;

    setDefaultApi(api);
    
    for(var name in modules) {
      if(modules.hasOwnProperty(name)) {
        if(modules[name] === false) {
          continue;
        }

        switch(name) {
          case 'admin':
            registerApi(require('./admin.api')(config, _api));
            break;
          case 'author':
            registerApi(require('./author.api')(config, _api));
            break;
          case 'merchant':
            registerApi(require('./merchant.api')(config, _api));
            break;
          case 'scout':
            registerApi(require('./scout.api')(config, _api));
            break; 
        }
      }
    }

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

  function setDefaultApi(api) {
    var action;

    _api = api;

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

module.exports = CoreApi();
