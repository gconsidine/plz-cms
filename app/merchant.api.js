var MerchantApi = function (plz) {
  'use strict'; 
  
  plz = plz || {};

  require('./merchant.product')(plz);
  require('./merchant.cart')(plz);

  return plz;
};

module.exports = MerchantApi;
