var CoreApi = function () {
  'use strict';

  var Validate = require('./core.validate'),
      Sanitize = require('./core.sanitize');
  
  var _plz = {};

  function registerModules(plz) {
    var modules = plz.config.modules;

    setDefaultApi(plz);
    
    for(var name in modules) {
      if(modules.hasOwnProperty(name)) {
        if(modules[name] === false) {
          continue;
        }

        switch(name) {
          case 'admin':
            registerApi(require('./admin.api')(_plz));
            break;
          case 'author':
            registerApi(require('./author.api')(_plz));
            break;
          case 'merchant':
            registerApi(require('./merchant.api')(_plz));
            break;
          case 'scout':
            registerApi(require('./scout.api')(_plz));
            break; 
        }
      }
    }

    return _plz;
  }

  function registerApi(module) {
    for(var verbCategory in module) {
      if(module.hasOwnProperty(verbCategory)) {
        if(_plz[verbCategory] === 'undefined') {
          _plz[verbCategory] = {}; 
        }

        for(var noun in module[verbCategory]) {
          if(module[verbCategory].hasOwnProperty(noun)) {
            _plz[verbCategory][noun] = module[verbCategory][noun];
          }
        }
      }
    }
  }

  function setDefaultApi(plz) {
    var action;

    _plz = plz;

    _plz.validate = _plz.validate || {};
    _plz.sanitize = _plz.sanitize || {};

    for(action in Validate) {
      if(Validate.hasOwnProperty(action)) {
        _plz.validate[action] = Validate[action];
      }
    }

    for(action in Sanitize) {
      if(Sanitize.hasOwnProperty(action)) {
        _plz.sanitize[action] = Sanitize[action];
      }
    }
  }
  
  return {
    registerModules: registerModules
  };
};

module.exports = CoreApi();
