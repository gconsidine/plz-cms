/**
 * Contains CRUD actions that can be performed on a product from the merchant 
 * component.
 *
 * @memberof merchant
 * @namespace merchant.product
 */
var MerchantProduct = function (plz) {
  'use strict';

  var Utility = require('./utility.api')(plz),
      database = Utility.db;
 
  plz = plz || {},
  plz.get = plz.get || {};
  plz.create = plz.create || {};
  plz.edit = plz.edit || {};
  plz.remove = plz.remove || {};
  plz.add = plz.add || {};

  var _required = plz.config.merchant.product.required,
      _collectionName = plz.config.merchant.product.collection;

  /**
  * Creates a sellable product item with given options and inserts it into 
  * the database, if allowed.
  *
  * @memberof merchant.product
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.name - Unique id used in store listing and lookup
  * @param {currency} options.price - Amount to be listing and purchase
  * @param {string} options.description - Brief description used in store
  * @param {string} options.imageFile - Path to image of product
  * @param {string} options.visibility - public / private / privileged
  * @param {string} options.createdAt - Current timestamp upon successful 
  * insertion into database
  * @param {string} options.modifiedAt - Current timestamp upon successful 
  * insertion into database
  * @param {string} options.status -- draft/pending review/published
  * @param {product} callback
  *  (perhaps this should be simply errorDescription || null)
  */
  plz.create.product = function (options, callback) {
    checkRequiredOptions(options, function (error, result) {
      if(error) {
        callback(true, result);
        return;
      }

      var currentTimestamp = new Date().getTime() / 1000;

      options.revisionNumber = 0;
      options.createdAt = currentTimestamp;
      options.modifiedAt = currentTimestamp;
      options.status = 'created';

      var query = {
        collectionName: _collectionName,
        document: options,
        uniqueFields: {name: options.name}
      };

      database.createDocument(query, function(error, result){
        callback(error, result);
	    });
    });
  };

  /**
  * Fetches a product object matching the name specified in options
  *
  * @memberof merchant.product
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.name - Unique id used in product lookup
  * @param {product} callback
  */
  plz.get.product = function (options, callback) {
    var query = {
      collectionName: _collectionName
    };

    if(options.hasOwnProperty('_id')) {
      query.criteria = { _id: options._id };
    } else if (options.hasOwnProperty('label')) {
      query.criteria = {
        labels: { $in: [options.label] },
        status: { $ne: 'archived' }
      };
    } else if(options.hasOwnProperty('name')) {
      query.criteria = {name: options.name};
    } else {
      callback(true, 'Valid criteria field not present in options');
      return;
    }

    if(options.hasOwnProperty('limit')) {
      query.limit = options.limit;
    }

    database.getDocument(query, function (error, result) {
      callback(error, result);
    });
  };

  /**
  * Modifies the content of a product if it exists based on the criteria 
  * options passed as the first argument.
  *
  * @memberof merchant.product
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.name - Unique id used in product lookup
  * @param {string} options.modifications - Replacement content for product
  * @param {product} callback
  */
  plz.edit.product = function (options, callback) {
    if(typeof options.userName !== 'string' ||
       typeof options.modifications !== 'object') {
      callback(true, 'Required field not present in options');
      return;
    }

    var modifications = options.modifications;
    var currentTimestamp = new Date().getTime() / 1000;
    modifications.modifiedAt = currentTimestamp;

    var query = {
      collectionName: _collectionName
    };

    if (options.hasOwnProperty('_id')) {
      query.criteria = { _id: options._id };
    } else if(options.hasOwnProperty('name')) {
      query.criteria = { name: options.name };
    } else {
      callback(true, 'Valid criteria field not present in options');
      return;
    }

    database.getDocument(query, function (error, getResult) {
      if(error) {
        callback(true, 'Existing product matching criteria not found');
        return;
      }

      var productId = getResult._id;

      var oldProduct = getResult;
      oldProduct.status = "archived";
      delete oldProduct._id;
      modifications.revisionNumber = oldProduct.revisionNumber+1;

      var editQuery = {
        collectionName: _collectionName,
        criteria: { _id: productId },
        update: {
          $set: modifications
        }
      };

      database.editDocument(editQuery, function(error) {
        if (error) {
          callback(error, getResult);
          return;
        }

        var createQuery = {
          collectionName: _collectionName,
          document: oldProduct,
          uniqueFields: {
            name: oldProduct.name,
            revisionNumber: oldProduct.revisionNumber
          }
        };

        database.createDocument(createQuery, function(error, createResult){
          callback(error, createResult);
        });
      });
    });
  };

  /**
  * Deletes a product if it exists based on the criteria options passed as the
  * first argument.
  *
  * @memberof merchant.product
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.name - Unique id used in product lookup
  * @param {product} callback
  */
  plz.remove.product = function (options, callback) {
    if(typeof options.userName !== 'string'){
      callback(true, 'Required field not present in options');
      return;
    }

    var query = {
      collectionName: _collectionName,
      limit: '*'
    };

    if(options.hasOwnProperty('_id')) {
      query.criteria = { _id: options._id };
    } else if(options.hasOwnProperty('name')) {
      query.criteria = { name: options.name };
    } else {
      callback(true, 'Valid criteria field not present in options');
      return;
    }

    database.removeDocument(query, function(error, result) {
      callback(error, result);
    });
  };

  /**
  * Adds a product to the given target (e.g. cart) with the given quantity
  *
  * @memberof merchant.product
  * @param {object} options
  * @param {array} options.target - Container that product is added to
  * @param {string} options.name - Unique id used in product lookup
  * @param {number} options.quantity - Integer multiplier for product
  * @param {product} callback
  */
  plz.add.product = function (options, callback) {
    if(!plz.validate.typeAs('string', options.name)) {
      callback(true, 'Required fields\' types not valid in options');
      return;
    }
    if(typeof options.to !== 'object') {
      callback(true, 'Required fields\' types not valid in options');
      return;
    }
    var query = {
      collectionName: _collectionName,
      criteria: { name: options.name }
    };

    database.getDocument(query, function (error, result) {
      if (error)
      {
        callback(true, error);
        return;
      }
      if (options.to.hasOwnProperty(options.name)){
        options.to[options.name].quantity += options.quantity;
      }
      else{
        result.quantity = options.quantity;
        options.to[options.name] = result;
      }
      callback(false, options.to);
    });
  };

  function checkRequiredOptions(options, callback) {
    for(var field in _required) {
      if(_required.hasOwnProperty(field)) {
        if(typeof options[field] === 'undefined') {
          callback(true, 'Required field ' + field + ' not present in options');
          return;
        }

        if(!plz.validate.typeAs(_required[field], options[field])) {
          callback(true, 'Required fields\' types not valid in options');
          return;
        }
      }
    }

    callback(false);
  }

  return plz;
};

module.exports = MerchantProduct;

/**
* @callback product 
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - result from DB call upon success or a
* description string upon error
*/
