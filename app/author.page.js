/**
 * Contains CRUD actions that can be performed on a page from the author 
 * component

 * @memberof author
 * @namespace author.page
 */

var AuthorPage = function (plz) {
  'use strict';
  
  plz = plz || {},
  plz.get = plz.get || {};
  plz.create = plz.create || {};
  plz.publish = plz.publish || {};
  plz.edit = plz.edit || {};
  plz.remove = plz.remove || {};

  var _required = plz.config.author.page.required,
      _collectionName = plz.config.author.page.collection,
      _page;

  /**
  * Creates a page with given options and inserts it into the database, 
  * if allowed
  * @memberof author.page
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.pageTitle - Unique id used in page lookup
  * @param {string} options.revisionNumber - To keep track of version info
  * @param {string} options.visibility - public / private / privileged
  * @param {string} options.contentType - plain test / HTML / markdown
  * @param {string} options.content - String containing actual contents of page
  * @param {string} options.createdAt - Current timestamp upon successful 
  *                                     insertion into database
  * @param {string} options.modifiedAt - Current timestamp upon successful 
  *                                      insertion into database
  * @param {string} options.status -- draft/pending review/published
  * @param {access} callback
  * callback parameters: errorFlag -- true/false
  *                      result -- result from DB insert upon success or 
  *                                description string upon error
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
        entry: options,
        uniqueFields: {pageTitle: options.pageTitle}
      }
      plz.create.dbentry(query, function(error, result){
        callback(error, result);
	  });
    });
  };

  /**
  * Publishes a page matching title in options, making it publicly
  * available for reading/routing
  * @memberof author.page
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.pageTitle - Unique id used in page lookup
  * callback parameters: errorFlag -- true/false
  *                      result -- result from DB insert upon success or 
  *                                description string upon error
  */
  plz.publish.page = function (options, callback) {
    //TODO: check permissions via plz.restritct.user
    if(typeof options.userName !== 'string' ||
       typeof options.pageTitle !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }

    // TODO: support search by _id
    //       If saving multiple revisions, get latest or check revisionNumber
    var query = {
      collectionName: _collectionName,
      criteria: {pageTitle: options.pageTitle},
      update:  {$set:{visibility: "public", status: "published"}}
    }
    plz.edit.dbentry(query, function(error, result){
      callback(error, result);
    });
  };

  /**
  * Fetches a page object matching the title specified in options
  * @memberof author.page
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.pageTitle - Unique id used in page lookup
  * callback parameters: errorFlag -- true/false
  *                      result -- result from DB fetch upon success or 
  *                                description string upon error
  */
  plz.get.page = function (options, callback) {
    //TODO: check permissions via plz.restritct.user
    if(typeof options.pageTitle !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }

    // TODO: support search by _id
    //       If saving multiple revisions, get latest or check revisionNumber
    var query = {
      collectionName: _collectionName,
      criteria: {pageTitle: options.pageTitle}
    }
    plz.get.dbentry(query, function (error, result) {
      callback(error, result);
    });
  };

  /**
  * Modifies the content of a page if it exists based on the criteria options 
  * passed as the first argument.
  * @memberof author.page
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.pageTitle - Unique id used in page lookup
  * @param {string} options.content - Replacement content for page
  * callback parameters: errorFlag -- true/false
  *                      result -- result from DB edit upon success or 
  *                                description string upon error
  */
  plz.edit.page = function (options, callback) {
    //  check required fields
    if(typeof options.userName !== 'string' ||
       typeof options.pageTitle !== 'string' ||
       typeof options.content !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }
    var currentTimestamp = new Date().getTime() / 1000;
    var query = {
      collectionName: _collectionName,
      criteria: {pageTitle: options.pageTitle},
      update: {
        $set:{
          content: options.content, 
          modifiedAt: currentTimestamp
        }
      }
    }
    plz.edit.dbentry(query, function(error, result){
      callback(error, result);
    });
  };

  /**
  * Deletes a page if it exists based on the criteria options passed as the
  * first argument.
  * @memberof author.page
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.pageTitle - Unique id used in page lookup
  * callback parameters: errorFlag -- true/false
  *                      result -- result from DB remove upon success or 
  *                                description string upon error
  */
  plz.remove.page = function (options, callback) {
    //  check required fields
    if(typeof options.userName !== 'string' ||
       typeof options.pageTitle !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }
    var query = {
      collectionName: _collectionName,
      criteria: {pageTitle: options.pageTitle}
    };
    plz.remove.dbentry(query, function(error, result) {
      callback(error, result);
    });
  };


  function checkRequiredOptions(options, callback) {
    for(var field in _required) {
      if(_required.hasOwnProperty(field)) {
        if(typeof options[field] === 'undefined') {
          callback(true, 'Required field not present in options');
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
