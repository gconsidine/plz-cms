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
      case 'author':
        if(typeof options.author !== 'object' ||
           !options.author.modules instanceof Array ||
           options.author.modules.length <= 0) {

          return false;
        }

        for(module in options.author.modules) {
          if(options.author.modules.hasOwnProperty(module) &&
             options.author.modules[module] === true)
          {
            var c = options.author[module].collection;
            if (typeof c !== 'string')
            {
              return false;
            }
          }
        }

        break;
      case 'merchant':
        break;
      case 'scout':
        break;
      case 'socialite':
        break;
    }

    return true;
  }

  return plz;
};

module.exports = CoreHub;
