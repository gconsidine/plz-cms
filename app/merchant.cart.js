/**
 * Contains actions that can be performed related to the shopping cart
 * from the merchant component.
 *
 * @memberof merchant
 * @namespace merchant.cart
 */
var MerchantCart = function (plz, database) {
  'use strict';

  database = database || require('./utility.database')(plz);
 
  plz = plz || {},
  plz.get = plz.get || {};
  plz.edit = plz.edit || {};
  plz.remove = plz.remove || {};
  plz.add = plz.add || {};

  var member = {
    collectionName: plz.config.merchant.cart.collection
  };

  /**
  * Adds an item to the shopping cart corresonding to the specified
  * userid, with the given quantity
  *
  * @memberof merchant.cart
  * @param {object} options
  * @param {array} options.customerId - Uniue id used in customer lookup
  * @param {string} options.productName - Unique id used in product lookup
  * @param {number} options.quantity - Integer multiplier for product
  * @param {cart} callback
  */
  plz.add.cartItem = function (options, callback) {

    if(!plz.validate.typeAs('string', options.customerId)) {
      callback(true, { ok: false, message: 'options.customerId is not a valid string', data: null});
      return;
    }
    if(!plz.validate.typeAs('string', options.productName)) {
      callback(true, { ok: false, message: 'options.productName not a valid string', data: null});
      return;
    }
    var currentTimestamp = Date.now();

    //first check to see if the product exists
    var productQuery = {
      collectionName: plz.config.merchant.product.collection,
      criteria: { name: options.productName }
    };

    database.getDocument(productQuery, function (error, result) {
      if(error || result.length === 0) {
        var errorString = "product matching " + options.productName;
        errorString += " does not exist in database";
        callback(true, { ok: false, message: errorString, data: null} );
        return;
      }
      var query = {
        collectionName: member.collectionName,
        criteria: {
          customerId: options.customerId,
          productName: options.productName
        }
      };

      // now check to see if an existing cart item exists
      database.getDocument(query, function(error, getResult) {
        if(error) {
          callback(true, { ok: false, message: getResult, data: null});
        }
        else if(getResult.length === 0) {
          options.createdAt = currentTimestamp;
          options.modifiedAt = currentTimestamp;
          // does not exist, create a new one
          var createQuery = {
            collectionName: member.collectionName,
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
            var result_object = {
              ok: !error,
              message: error ? createResult : 'success',
              data: error ? null : createResult.ops
            };
            callback(error, result_object);
          });
        }
        else {
          // already exists -- modify the quantity of existing cartItem
          var editQuery = {
            collectionName: member.collectionName,
            criteria: { _id: getResult[0]._id },
            update: {
              $set:{
                quantity: getResult[0].quantity + options.quantity,
                modifiedAt: currentTimestamp
              }
            }
          };
          database.editDocument(editQuery, function(error, result) {
            var result_object = {
              ok: !error,
              message: error ? result : 'success',
              data: error ? null : result.ops
            };
      callback(error, result_object);

          });
        }
      });
    });
  };

  /**
  * Removes an item to the shopping cart corresonding to the specified
  * userid, with the given quantity
  *
  * @memberof merchant.cart
  * @param {object} options
  * @param {array} options.customerId - Uniue id used in customer lookup
  * @param {string} options.productName - Unique id used in product lookup
  * @param {number} options.quantity - Integer multiplier for product
  * @param {cart} callback
  */
  plz.remove.cartItem = function (options, callback) {

    if(!plz.validate.typeAs('string', options.customerId)) {
      callback(true, { ok: false, message: 'options.customerId is not a valid string', data: null});
      return;
    }
    if(!plz.validate.typeAs('string', options.productName)) {
      callback(true, { ok: false, message: 'options.productName not a valid string', data: null});
      return;
    }
    var query = {
      collectionName: member.collectionName,
      criteria: {
        customerId : options.customerId,
        productName : options.productName
      }
    };

    database.getDocument(query, function(error, getResult) {
      if(error || getResult.length === 0) {
        callback(true, { ok: false, message: getResult, data: null});
      }
      else {
        if(options.quantity === undefined ||
            options.quantity >= getResult[0].quantity) {
          database.removeDocument(query, function(error, result) {
            var result_object = {
              ok: !error,
              message: error ? result : 'success',
              data: error ? null : result.ops
            };
            callback(error, result_object);
          });
        }
        else {
          var modifications = {
            quantity: getResult[0].quantity - options.quantity
          };
          var editQuery = {
            collectionName: member.collectionName,
            criteria: { _id: getResult[0]._id },
            update: {
              $set: modifications
            }
          };

          database.editDocument(editQuery, function(error, result) {
            var result_object = {
              ok: !error,
              message: error ? result : 'success',
              data: error ? null : result.ops
            };
            callback(error, result_object);
          });
        }
      }
    });
  };

  /**
  * Gets all items in the cart corresonding to the specified userid
  *
  * @memberof merchant.cart
  * @param {object} options
  * @param {array} options.customerId - Uniue id used in customer lookup
  * @param {cart} callback
  */
  plz.get.cart = function (options, callback) {

    if(!plz.validate.typeAs('string', options.customerId)) {
      callback(true, { ok: false, message: 'options.customerId is not a valid string', data: null});
      return;
    }
    var query = {
      collectionName: member.collectionName,
      criteria: {
        customerId : options.customerId
      }
    };

    database.getDocument(query, function(error, getResult) {
      if(error) {
        callback(true, { ok: false, message: getResult, data: null});
      }
      else {
        callback(false, { ok: true, message: null, data: getResult});
      }
    });
  };

  /**
  * Removes the cart and all cart entries corresponding to the specified userid
  *
  * @memberof merchant.cart
  * @param {object} options
  * @param {array} options.customerId - Uniue id used in customer lookup
  * @param {cart} callback
  */
  plz.remove.cart = function (options, callback) {

    if(!plz.validate.typeAs('string', options.customerId)) {
      callback(true, { ok: false, message: 'options.customerId is not a valid string', data: null});
      return;
    }
    var query = {
      collectionName: member.collectionName,
      limit: '*',
      criteria: {
        customerId : options.customerId
      }
    };
    database.removeDocument(query, function(error, getResult) {
      if(error) {
        callback(true, { ok: false, message: getResult, data: null});
      }
      else {
        callback(false, { ok: true, message: null, data: getResult});
      }
    });
  };

  /**
  * Calculates the subtotal from all items present in the cart
  *
  * @memberof merchant.cart
  * @param {object} options
  * @param {array} options.customerId - Uniue id used in customer lookup
  * @param {cart} callback
  */
  plz.get.cartSubtotal = function (options, callback) {

    if(!plz.validate.typeAs('string', options.customerId)) {
      callback(true, { ok: false, message: 'options.customerId is not a valid string', data: null});
      return;
    }
    var query = {
      collectionName: member.collectionName,
      criteria: {
        customerId : options.customerId
      }
    };
    var subtotal = 0;
    var numProductsAdded = 0;
    database.getDocument(query, function(error, getResult) {
      if(error) {
        callback(true, { ok: false, message:getResult, data: null });
        return;
      }
      else if(getResult.length === 0) {
        callback(false, { ok: true, message: null, data:0 });
      }
      else {
        var addProductPrice = function(product, callback){
          var productQuery = {
            collectionName: plz.config.merchant.product.collection,
            criteria: { name: product.productName }
          };
          database.getDocument(productQuery, function (error, productResult) {
            if(!error && productResult.length > 0) {
              var price = parseFloat(productResult[0].price.replace(/^\$/,''));
              subtotal += price * product.quantity;
            }
            numProductsAdded++;
            if(numProductsAdded === getResult.length){
              callback(false, { ok: true, message: null, data: subtotal });
            }
          });
        };
        for(var index = 0; index < getResult.length; index++) {
          addProductPrice(getResult[index], callback);
        }
      }
    });
  };
  return member;
};

module.exports = MerchantCart;

/**
* @callback product 
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - result from DB call upon success or a
* description string upon error
*/
