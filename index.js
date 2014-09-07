var Index = function (options) {
  'use strict';

  if(options === 'undefined') {
    throw new Error([
      'Configuration options must be supplied when requiring plz-cms',
      'Example: `var plz = require("plz-cms")(options);`',
      '`options` reference: https://github.com/gconsidine/plz-cms'
    ].join('\n'));
  }

  var Hub = require('./app/Hub');

  return Hub.configure(options);
};

module.exports = Index;
