/**
 * Contains CRUD actions that can be performed on a product from the merchant 
 * component.
 *
 * @memberof merchant
 * @namespace merchant.product
 */
var MerchantProduct = function (plz, database) {
  'use strict';

  database = database || require('./utility.database')(plz);
 
  plz = plz || {},
  plz.get = plz.get || {};
  plz.create = plz.create || {};
  plz.edit = plz.edit || {};
  plz.remove = plz.remove || {};
  plz.add = plz.add || {};

  var member = {
    required: plz.config.merchant.product.required,
    collectionName: plz.config.merchant.product.collection
  };

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
    member.checkRequiredOptions(options, function (error, result) {
      if(error) {
        callback(true, { ok: false, message: result, data: null });
        return;
      }

      var currentTimestamp = Date.now();

      options.revisionNumber = 0;
      options.createdAt = currentTimestamp;
      options.modifiedAt = currentTimestamp;
      options.status = 'created';

      var query = {
        collectionName: member.collectionName,
        document: options,
        uniqueFields: {name: options.name}
      };

      database.createDocument(query, function(error, result){
        if(error) {
          callback(error, { ok: false, message: result, data: null });
          return;
        }

        callback(false, { ok: true, message: 'success', data: result.ops });
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
      collectionName: member.collectionName
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
      callback(true, { ok: false, message: 'Valid criteria not present in options', data: null });
      return;
    }

    if(options.hasOwnProperty('limit')) {
      query.limit = options.limit;
    }

    database.getDocument(query, function (error, result) {
      if(error || result.length === 0) {
        var errmsg = 'Existing product matching criteria not found';
        callback(true, { ok: false, message: errmsg, data: null});
        return;
      }

      callback(false, { ok: true, message: 'success', data: result });

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
      callback(true, { ok: false, message: 'Required field not present in options', data: null });

      return;
    }

    var modifications = options.modifications;
    var currentTimestamp = Date.now();
    modifications.modifiedAt = currentTimestamp;

    var query = {
      collectionName: member.collectionName
    };

    if (options.hasOwnProperty('_id')) {
      query.criteria = { _id: options._id };
    } else if(options.hasOwnProperty('name')) {
      query.criteria = { name: options.name };
    } else {
      callback(true, { ok: false, message: 'Valid criteria not present in options', data: null });
      return;
    }

    database.getDocument(query, function (error, getResult) {
      if(error || getResult.length === 0) {
        var errmsg = 'Existing product matching criteria not found';
        callback(true, { ok: false, message: errmsg, data: null});
        return;
      }

      var productId = getResult[0]._id;

      var oldProduct = getResult[0];
      oldProduct.status = "archived";
      delete oldProduct._id;
      modifications.revisionNumber = oldProduct.revisionNumber+1;

      var editQuery = {
        collectionName: member.collectionName,
        criteria: { _id: productId },
        update: {
          $set: modifications
        }
      };

      database.editDocument(editQuery, function(error) {
        if(error) {
          callback(true, { ok: false, message: 'Database error in edit attempt', data: null});
          return;
        }

        var createQuery = {
          collectionName: member.collectionName,
          document: oldProduct,
          uniqueFields: {
            name: oldProduct.name,
            revisionNumber: oldProduct.revisionNumber
          }
        };

        database.createDocument(createQuery, function(error, createResult){
          var result_object = {
            ok: !error,
            message: error ? createResult : 'success',
            data: error ? null : createResult.ops
          };
          callback(error, result_object);
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
      collectionName: member.collectionName,
    };

    if(options.hasOwnProperty('_id')) {
      query.criteria = { _id: options._id };
    } else if(options.hasOwnProperty('name')) {
      query.criteria = { name: options.name };
    } else {
      callback(true, { ok: false, message: 'Valid criteria not present in options', data: null });
      return;
    }

    database.removeDocument(query, function(error, result) {
      var result_object = {
        ok: !error,
        message: error ? result : 'success',
        data: error ? null : result.ops
      };
      callback(error, result_object);
    });
  };

  member.checkRequiredOptions = function(options, callback) {
    for(var field in member.required) {
      if(member.required.hasOwnProperty(field)) {
        if(typeof options[field] === 'undefined') {
          callback(true, 'Required field ' + field + ' not present in options');
          return;
        }

        if(!plz.validate.typeAs(member.required[field], options[field])) {
          callback(true, 'Required fields\' types not valid in options');
          return;
        }
      }
    }

    callback(false);
  };

  return member;
};

module.exports = MerchantProduct;

/**
* @callback product 
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - result from DB call upon success or a
* description string upon error
*/
