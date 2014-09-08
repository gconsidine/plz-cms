module.exports = function (options) {
  'use strict';

  if(!options) {
    throw new Error([
      'Configuration options must be supplied when requiring plz-cms',
      'Example: var plz = require("plz-cms")(options);'
    ].join('\n'));
  }

  var Hub = require('./app/Hub');

  return Hub.configure(options);
};
