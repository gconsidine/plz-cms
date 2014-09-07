module.exports = (function (options) {
  'use strict';

  var Hub = require('./app/Hub');

  return Hub.configure(options);
}());
