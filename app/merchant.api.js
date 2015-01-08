var MerchantApi = function (plz) {
  'use strict'; 
  
  plz = plz || {};

  require('./merchant.product')(plz);

  return plz;
};

module.exports = MerchantApi;
