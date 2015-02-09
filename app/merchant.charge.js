/**
 * Contains CRUD actions that can be performed on a charge from the merchant
 * component. Uses the Stripe API to perform credit card transactions
 *
 * @memberof merchant
 * @namespace merchant.charge
 */
var MerchantCharge = function (plz, database) {
  'use strict';

  database = database || require('./utility.database')(plz);

  plz = plz || {},
  plz.get = plz.get || {};
  plz.create = plz.create || {};
  plz.edit = plz.edit || {};
  plz.remove = plz.remove || {};

  var member = {
    collectionName: plz.config.merchant.charge.collection
  };

  if (plz.config.merchant.charge.api === 'stripe') {
    member.paymentApi = require('stripe')(plz.config.merchant.charge.api_key);
  }

  /**
  * Submits a payment request to the payment API with the given card info
  * and stores the result in the database
  *
  * @memberof merchant.charge
  * @param {object} options
  * @param {number} options.amount - Total amount to be charged to the card
  * @param {string} options.currency - Three-letter ISO currency code
  * @param {string} options.card
  * @param {string} options.description - Brief description used in store
  * @param {string} options.createdAt - Current timestamp upon successful
  * insertion into database
  * @param {string} options.status -- pending/paid/refunded
  * @param {charge} callback
  *  (perhaps this should be simply errorDescription || null)
  */
  plz.create.charge = function (options, callback) {
    member.paymentApi.charges.create(options, function(error, result) {
      if (error) {
        callback(true, result);
        return;
      }
      result.createdAt = new Date().getTime();
      result.status = 'pending';
      var query = {
        collectionName: member.collectionName,
        document: result,
        uniqueFields: {id: result.id}
      };

      database.createDocument(query, function(error, result){
        callback(error, result);
      });
    });
  };
  return member;
};

module.exports = MerchantCharge;

/**
* @callback charge
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - result from DB call upon success or a
* description string upon error
*/

