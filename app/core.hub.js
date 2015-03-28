var CoreHub = function (config) {
  'use strict';

  if(!validConfiguration(config)) {
    throw new Error('Invalid configuration options'); 
  }

  var plz = require('./core.api')(config);

  function validConfiguration(options) {
    if(typeof options !== 'object' ||
       typeof options.database.default.uri !== 'string' ||
       typeof options.mailer.default !== 'object') {
      
      return false;
    }
    
    for(var module in options.modules) {
      if(options.modules.hasOwnProperty(module)) {
        if(options.modules[module] === false) {
          continue;
        }

        if(!validateModuleConfiguration(module, options)) {
          return false;
        }
      }
    }

    return true;
  }

  function validateModuleConfiguration(module, options) {
    switch(module) {
      case 'admin':
        if(typeof options.admin !== 'object' || 
           typeof options.admin.collection !== 'string' ||
           !options.admin.roles instanceof Array || 
           options.admin.roles.length <= 0) {

          return false;
        }
        break;
    }

    return true;
  }

  return plz;
};

module.exports = CoreHub;
