var CoreApi = function (config) {
  'use strict';

  var plz = {};

  plz.config = config || {};

  require('./core.validate')(plz),
  require('./core.sanitize')(plz);
  require('./core.database')(plz);
  require('./core.mailer')(plz);

  if(plz.config.modules.admin) {
    require('./admin.api')(plz);
  }

  if(plz.config.modules.author) {
    require('./author.api')(plz);
  }

  if(plz.config.modules.merchant) {
    require('./merchant.api')(plz);
  }

  if(plz.config.modules.scout) {
    require('./scout.api')(plz);
  }
  
  return plz;
};

module.exports = CoreApi;
