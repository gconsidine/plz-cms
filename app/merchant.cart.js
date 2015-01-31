/**
 * Contains actions that can be performed related to the shopping cart
 * from the merchant component.
 *
 * @memberof merchant
 * @namespace merchant.product
 */
var MerchantCart = function (plz) {
  'use strict';

  var Utility = require('./utility.api')(plz),
      database = Utility.db;
 
  plz = plz || {},
  plz.get = plz.get || {};
  plz.edit = plz.edit || {};
  plz.remove = plz.remove || {};
  plz.add = plz.add || {};

  var _collectionName = plz.config.merchant.cart.collection;

  /**
  * Adds an item to the shopping cart corresonding to the specified
  * userid, with the given quantity
  *
  * @memberof merchant.product
  * @param {object} options
  * @param {array} options.customerId - Uniue id used in customer lookup
  * @param {string} options.productName - Unique id used in product lookup
  * @param {number} options.quantity - Integer multiplier for product
  * @param {product} callback
  */
  plz.add.cartItem = function (options, callback) {

    if(!plz.validate.typeAs('string', options.customerId)) {
      callback(true, 'options.customerId is not a valid string');
      return;
    }
    if(!plz.validate.typeAs('string', options.productName)) {
      callback(true, 'options.productName not a valid string');
      return;
    }
    var currentTimestamp = new Date().getTime() / 1000;

    //first check to see if it's the product exists
    var productQuery = {
      collectionName: plz.config.merchant.product.collection,
      criteria: { name: options.productName }
    };

    database.getDocument(productQuery, function (error, result) {
      if (error)
      {
        var errorString = "product matching " + options.productName;
        errorString += "does not exist in database";
        callback(true, errorString );
        return;
      }
      var query = {
        collectionName: _collectionName,
        criteria: {
          customerId: options.customerId,
          productName: result.name
        }
      };

      // now check to see if an existing cart item exists
      database.getDocument(query, function(error, getResult) {
        if (error) {
          options.modifiedAt = currentTimestamp;
          // does not exist, create a new one
          var createQuery = {
            collectionName: _collectionName,
            document: options,
            uniqueFields: {
              customerId: options.customerId,
              productName: options.productName
            }
          };

          //TODO: implement some sort of database cleanup mechanism so that
          //    the collection does not grow indefinitely.
          //    Tentavively set a maximum number of entries, and start
          //    removing the oldest entries when the max is reached
          database.createDocument(createQuery, function(error, createResult){
            callback(error, createResult);
          });
        }
        else {
          // already exists -- modify the quantity of existing cartItem
          var editQuery = {
            collectionName: _collectionName,
            criteria: { _id: getResult._id },
            update: {
              $set:{
                quantity: getResult.quantity + options.quantity,
                modifiedAt: currentTimestamp
              }
            }
          };
          database.editDocument(editQuery, function(error) {
            callback(error, getResult);
          });
        }
      });
    });
  };

  /**
  * Removes an item to the shopping cart corresonding to the specified
  * userid, with the given quantity
  *
  * @memberof merchant.product
  * @param {object} options
  * @param {array} options.customerId - Uniue id used in customer lookup
  * @param {string} options.productName - Unique id used in product lookup
  * @param {number} options.quantity - Integer multiplier for product
  * @param {product} callback
  */
  plz.remove.cartItem = function (options, callback) {

    if(!plz.validate.typeAs('string', options.customerId)) {
      callback(true, 'options.customerId is not a valid string');
      return;
    }
    if(!plz.validate.typeAs('string', options.productName)) {
      callback(true, 'options.productName not a valid string');
      return;
    }
    var query = {
      collectionName: _collectionName,
      criteria: {
        customerId : options.customerId,
        productName : options.productName
      }
    };

    database.getDocument(query, function(error, getResult) {
      if (error) {
        callback(true, error);
      }
      else {
        if (options.quantity === undefined ||
            options.quantity >= getResult.quantity) {
          database.removeDocument(query, function(error, result) {
             callback(error, result);
          });
        }
        else {
          var modifications = {
            quantity: getResult.quantity - options.quantity
          };
          var editQuery = {
            collectionName: _collectionName,
            criteria: { _id: getResult._id },
            update: {
              $set: modifications
            }
          };

          database.editDocument(editQuery, function(error) {
            callback(error, getResult);
          });
        }
      }
    });
  };

};

module.exports = MerchantCart;

/**
* @callback product 
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - result from DB call upon success or a
* description string upon error
*/
