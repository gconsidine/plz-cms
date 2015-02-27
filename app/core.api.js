var CoreApi = function (config) {
  'use strict';

  var plz = {};

  plz.config = config || {};

  require('./core.validate')(plz),
  require('./core.sanitize')(plz);

  return plz;
};

module.exports = CoreApi;
