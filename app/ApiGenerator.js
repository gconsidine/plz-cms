var ApiGenerator = function () {
  'use strict';
  
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
          case 'scribe':
            registerApi(require('plz-scribe'));
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
  
  return {
    registerModules: registerModules
  };
};

module.exports = ApiGenerator();
