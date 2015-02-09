var CoreApi = function (config) {
  'use strict';

  var plz = {};

  plz.config = config || {};

  require('./core.validate')(plz),
  require('./core.sanitize')(plz);

  if(plz.config.modules.admin) {
    require('./admin.user')(plz);
    require('./admin.account')(plz);
  }

  if(plz.config.modules.author) {
    require('./author.page')(plz);
    require('./author.post')(plz);
  }

  if(plz.config.modules.merchant) {
    require('./merchant.api')(plz);
  }

  return plz;
};

module.exports = CoreApi;
