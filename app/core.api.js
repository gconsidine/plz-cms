var CoreApi = function (config) {
  'use strict';

  var plz = {};

  plz.config = config || {};

  require('./core.validate')(plz),
  require('./core.sanitize')(plz);

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

  if(plz.config.modules.socialite) {
    require('./sociallite.api')(plz);
  }
 
  return plz;
};

module.exports = CoreApi;
