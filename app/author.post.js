/**
 * Contains CRUD actions that can be performed on a post from the author 
 * component.
 *
 * @namespace author
 */
var AuthorPost = function (plz) {
  'use strict';

  var Utility = require('./utility.api')(plz),
      database = Utility.db;
 
  plz = plz || {},
  plz.get = plz.get || {};
  plz.create = plz.create || {};
  plz.publish = plz.publish || {};
  plz.edit = plz.edit || {};
  plz.remove = plz.remove || {};

  var _required = plz.config.author.post.required,
      _collectionName = plz.config.author.post.collection;

  /**
  * Creates a post with given options and inserts it into the database, 
  * if allowed.
  *
  * @memberof author
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.postTitle - Unique id used in post lookup
  * @param {string} options.revisionNumber - To keep track of version info
  * @param {array} options.labels - One or more searchable tags or categories
  * @param {string} options.visibility - public / private / privileged
  * @param {string} options.contentType - plain test / HTML / markdown
  * @param {string} options.content - String containing actual contents of post
  * @param {string} options.createdAt - Current timestamp upon successful 
  * insertion into database
  * @param {string} options.modifiedAt - Current timestamp upon successful 
  * insertion into database
  * @param {string} options.status -- draft/pending review/published
  * @param {post} callback
  */
  plz.create.post = function (options, callback) {
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
        uniqueFields: {postTitle: options.postTitle}
      };

      database.createDocument(query, function(error, result){
        callback(error, result);
      });
    });
  };

  /**
  * Publishes a post matching title or _id in options, making it publicly
  * available for reading/routing
  *
  * @memberof author
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options._id - Unique id from db used in post lookup
  * @param {string} options.postTitle - Optional string used for post lookup
  * in case _id is not provided
  * @param {post} callback
  */
  plz.publish.post = function (options, callback) {
    if(typeof options.userName !== 'string' ||
       typeof options.postTitle !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }

    // TODO: support search by _id
    //       If saving multiple revisions, get latest or check revisionNumber
    var query = {
      collectionName: _collectionName,
      criteria: {postTitle: options.postTitle},
      update:  {$set:{visibility: "public", status: "published"}}
    };

    if ( options.hasOwnProperty('_id') )
    {
      query.criteria = { _id: options.id };
    }

    database.editDocument(query, function(error, result){
      callback(error, result);
    });
  };

  /**
  * Fetches a post object matching the title specified in options
  *
  * @memberof author
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options._id - Unique id from db used in post lookup
  * @param {string} options.postTitle - Optional string used for post lookup
  * in case _id is not provided
  * @param {post} callback
  */
  plz.get.post = function (options, callback) {
    if(typeof options.postTitle !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }

    // TODO: support search by _id
    //       If saving multiple revisions, get latest or check revisionNumber
    var query = {
      collectionName: _collectionName,
      criteria: {postTitle: options.postTitle}
    };

    if ( options.hasOwnProperty('_id') )
    {
      query.criteria = { _id: options.id };
    }

    database.getDocument(query, function (error, result) {
      callback(error, result);
    });
  };

  /**
  * Modifies the content of a post if it exists based on the criteria options 
  * passed as the first argument.
  *
  * @memberof author
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.postTitle - Unique id used in post lookup
  * @param {string} options.content - Replacement content for post
  * @param {post} callback
  */
  plz.edit.post = function (options, callback) {
    if(typeof options.userName !== 'string' ||
       typeof options.postTitle !== 'string' ||
       typeof options.content !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }

    var currentTimestamp = new Date().getTime() / 1000;

    var query = {
      collectionName: _collectionName,
      criteria: {postTitle: options.postTitle}
    };

    if ( options.hasOwnProperty('_id') )
    {
      query.criteria = { _id: options.id };
    }

    database.getDocument(query, function (error, getResult) {
      if (error)
      {
        callback(true, 'Existing post matching criteria not found');
        return;
      }
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
        callback(error, createResult);
      });
    });
  };

  /**
  * Deletes a post if it exists based on the criteria options passed as the
  * first argument.
  *
  * @memberof author
  * @param {object} options
  * @param {string} options.userName - Used to check permissions
  * @param {string} options.postTitle - Unique id used in post lookup
  * @param {post} callback
  */
  plz.remove.post = function (options, callback) {
    if(typeof options.userName !== 'string' ||
       typeof options.postTitle !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }

    var query = {
      collectionName: _collectionName,
      criteria: {postTitle: options.postTitle},
      limit: '*'
    };

    if ( options.hasOwnProperty('_id') )
    {
      query.criteria = { _id: options.id };
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

module.exports = AuthorPost;

/**
* @callback post
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - result from DB call upon success or a
* description string upon error
*/
