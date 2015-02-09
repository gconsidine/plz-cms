var MerchantApi = function (plz) {
  'use strict'; 
  
  plz = plz || {};

  require('./merchant.product')(plz);
  require('./merchant.cart')(plz);
  require('./merchant.charge')(plz);

  return plz;
};

module.exports = MerchantApi;
