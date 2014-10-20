/**
 * Contains CRUD actions that can be performed on a page from the author 
 * component.
 *
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

      // check database for entry with duplicate title
      // note to self: move common db CRUD operations inside plz.db module
      // var query = {collection:plz.config.admin.collection,
      //              searchKey:email}
      //              entry:options}
      // plz.create.dbentry(query, function(error, result){});
      plz.get.database(function (error, database) {
        _page = database.collection(_collectionName);

        var query = {pageTitle: options.pageTitle};

        _page.findOne(query, function (error, result) {
          if(error) {
            callback(true, 'Lookup Failed');
            return;
          }

          if(result) {
            callback(true, 'Page already exists');
            return;
          }

          // update timestamps and status due to creation event
          var currentTimestamp = new Date().getTime() / 1000;

          options.revisionNumber = 0;
          options.createdAt = currentTimestamp;
          options.modifiedAt = currentTimestamp;
          options.status = 'created';

          _page.insertOne(options, function (error, result) {
            if(error) {
              callback(true, 'Insert failed');
              return;
            }

            callback(false, result);
          });
        });
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
    if(typeof options.userName !== 'string' ||
       typeof options.pageTitle !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }

    plz.get.database(function (error, database) {
      _page = database.collection(_collectionName);

      // TODO: support search by _id
      // If saving multiple revisions, get latest or check revisionNumber
      var criteria = {pageTitle: options.pageTitle};
      var update = {$set:{visibility: "public", status: "published"}};

      _page.updateOne(criteria, update, function(error, result){

        if(error) {
          callback(true, 'Edit failed: ' + error);
          return;
        }

        if(!result || result.matchedCount === 0 || result.modifiedCount === 0) {
          callback(true, 'Could not find page with title ' + options.pageTitle);
          return;
        }

        callback(false, result);
      });
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
    if(typeof options.pageTitle !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }

    plz.get.database(function (error, database) {
      _page = database.collection(_collectionName);

      _page.findOne({pageTitle: options.pageTitle}, function(error, result) {
        var message;

        if (error) {
          message = 'Failed to find entry matching ' + options.pageTitle;
          message += ' in ' + plz.config.author.page.collection;

          callback(true, message);
          return;
        } else {
          if (!result || result.matchedCount === 0 || 
              result.modifiedCount === 0){
            message = 'Could not find page with title ' + options.pageTitle;

            callback(true, message);
            return;
          }

          callback(false, result);
        }
      });
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
       typeof options.pageTitle !== 'string' ||
       typeof options.content !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }
    plz.get.database(function(error, database) {
      if(error) {
        callback(true, 'Cannot establish database connection');
        return;
      }

      _page = database.collection(_collectionName);

      var currentTimestamp = new Date().getTime() / 1000;
      var criteria = {pageTitle: options.pageTitle};
      var update = {
        $set:{
          content: options.content, 
          modifiedAt: currentTimestamp
        }
      };

      _page.findOneAndUpdate(criteria, update, function (error, result) {
        if(error) {
          callback(true, 'Edit failed');
          return;
        }

        if(!result) {
          callback(true, 'Page does not exist');
          return;
        }

        callback(false, result);
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
    if(typeof options.userName !== 'string' ||
       typeof options.pageTitle !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }
    plz.get.database(function(error, database) {
      if(error) {
        callback(true, 'Cannot establish database connection');
        return;
      }

      _page = database.collection(_collectionName);

      _page.findOneAndDelete(options, function (error, result) {
        if(error) {
          callback(true, 'Remove failed');
          return;
        }

        callback(false, result);
      });
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

/**
* @callback page
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - result from DB call upon success or a
* description string upon error
*/
