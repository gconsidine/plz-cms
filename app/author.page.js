/**
 * Contains CRUD actions that can be performed on a page from the author 
 * component.
 *
 * @memberof author
 * @namespace author.page
 */
var AuthorPage = function (plz) {
  'use strict';

  var Utility = require('./utility.api')(plz),
      database = Utility.db;
 
  plz = plz || {},
  plz.get = plz.get || {};
  plz.create = plz.create || {};
  plz.publish = plz.publish || {};
  plz.edit = plz.edit || {};
  plz.remove = plz.remove || {};

  var _required = plz.config.author.page.required,
      _collectionName = plz.config.author.page.collection;

  /**
  * Creates a page with given options and inserts it into the database, 
  * if allowed.
  *
  * @memberof author.page
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.pageTitle - Unique id used in page lookup
  * @param {string} options.revisionNumber - To keep track of version info
  * @param {string} options.visibility - public / private / privileged
  * @param {string} options.contentType - plain test / HTML / markdown
  * @param {string} options.content - String containing actual contents of page
  * @param {string} options.createdAt - Current timestamp upon successful 
  * insertion into database
  * @param {string} options.modifiedAt - Current timestamp upon successful 
  * insertion into database
  * @param {string} options.status -- draft/pending review/published
  * @param {page} callback
  *  (perhaps this should be simply errorDescription || null)
  */
  plz.create.page = function (options, callback) {
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
        uniqueFields: {pageTitle: options.pageTitle}
      };

      database.createDocument(query, function(error, result){
        callback(error, result);
	    });
    });
  };

  /**
  * Publishes a page matching title in options, making it publicly
  * available for reading/routing
  *
  * @memberof author.page
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.pageTitle - Unique id used in page lookup
  * @param {page} callback
  */
  plz.publish.page = function (options, callback) {
    if(typeof options.userName !== 'string'){ 
      callback(true, 'Required field not present in options');
      return;
    }

    var query = {
      collectionName: _collectionName,
      update:  {$set:{visibility: "public", status: "published"}}
    };

    if( options.hasOwnProperty('_id')) {
      query.criteria = { _id: options.id };
    } else if(options.hasOwnProperty('pageTitle')) {
      query.criteria = { pageTitle: options.pageTitle };
    } else {
      callback(true, 'Valid criteria field not present in options');
      return;
    }

    database.editDocument(query, function(error, result) {
      callback(error, result);
    });
  };

  /**
  * Fetches a page object matching the title specified in options
  *
  * @memberof author.page
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.pageTitle - Unique id used in page lookup
  * @param {page} callback
  */
  plz.get.page = function (options, callback) {
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
    } else if(options.hasOwnProperty('pageTitle')) {
      query.criteria = {pageTitle: options.pageTitle};
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
  * Modifies the content of a page if it exists based on the criteria options 
  * passed as the first argument.
  *
  * @memberof author.page
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.pageTitle - Unique id used in page lookup
  * @param {string} options.content - Replacement content for page
  * @param {page} callback
  */
  plz.edit.page = function (options, callback) {
    if(typeof options.userName !== 'string' ||
       typeof options.content !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }

    var currentTimestamp = new Date().getTime() / 1000;

    var query = {
      collectionName: _collectionName
    };

    if (options.hasOwnProperty('_id')) {
      query.criteria = { _id: options.id };
    } else if(options.hasOwnProperty('pageTitle')) {
      query.criteria = { pageTitle: options.pageTitle };
    } else {
      callback(true, 'Valid criteria field not present in options');
      return;
    }

    database.getDocument(query, function (error, getResult) {
      if(error) {
        callback(true, 'Existing page matching criteria not found');
        return;
      }

      var pageId = getResult._id;

      getResult._id = undefined;
      getResult.modifiedAt = currentTimestamp;
      getResult.revisionNumber++;
      getResult.content = options.content;

      var query = {
        collectionName: _collectionName,
        document: getResult,
        uniqueFields: {
          postTitle: getResult.postTitle,
          revisionNumber: getResult.revisionNumber
        }
      };

      database.createDocument(query, function(error, createResult){
        if (error) {
          callback(error, createResult);
          return;
        }

        var query = {
          collectionName: _collectionName,
          criteria: { _id: pageId },
          update: { $set:{ status: "archived" } }
        };

        database.editDocument(query, function(error) {
          callback(error, createResult);
        });
      });
    });
  };

  /**
  * Deletes a page if it exists based on the criteria options passed as the
  * first argument.
  *
  * @memberof author.page
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.pageTitle - Unique id used in page lookup
  * @param {page} callback
  */
  plz.remove.page = function (options, callback) {
    if(typeof options.userName !== 'string'){
      callback(true, 'Required field not present in options');
      return;
    }

    var query = {
      collectionName: _collectionName
    };

    if(options.hasOwnProperty('_id')) {
      query.criteria = { _id: options.id };
    } else if(options.hasOwnProperty('pageTitle')) {
      query.criteria = { pageTitle: options.pageTitle };
    } else {
      callback(true, 'Valid criteria field not present in options');
      return;
    }

    database.removeDocument(query, function(error, result) {
      callback(error, result);
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

module.exports = AuthorPage;

/**
* @callback page
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - result from DB call upon success or a
* description string upon error
*/
