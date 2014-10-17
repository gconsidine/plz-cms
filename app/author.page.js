// author.page.js
// Contains CRUD actions that can be performed on a page from the author 
// component

var AuthorPage = function (plz) {
  'use strict';
  
  plz = plz || {},
  plz.get = plz.get || {};
  plz.create = plz.create || {};
  plz.publish = plz.publish || {};

  var _required = plz.config.author.page.required,
      _collectionName = plz.config.author.page.collection,
      _page;

  /**
  * Creates a page with given options and inserts it into the database, 
  * if allowed
  * options properties: authorName -- used to check permissions
  *                     pageTitle -- unique id used in page lookup
  *                     visibility -- public / private / privileged
  *                     contentType -- plain test / HTML / markdown
  *                     content -- string containing actual contents of page
  *                     createdAt -- current timestamp upon successful 
  *                                  insertion into database
  *                     modifiedAt -- current timestamp upon successful 
  *                                   insertion into database
  *                     status -- draft/pending review/published
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

      // check database for entry with duplicate title
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

          options.createdAt = currentTimestamp;
          options.modifiedAt = currentTimestamp;
          options.status = 'created';

          // insert into database
          _page.insertOne(options, function (error, result) {
            if(error) {
              callback(true, 'Insert failed');
              return;
            }

            // invoke callback with result
            callback(false, result);
          });
        });
	  });
    });
  };

  /**
  * Publishes a page matching title in options, making it publicly
  * available for reading/routing
  * options properties: publisherName -- used to check permissions
  *                     pageTitle -- unique id used in page lookup
  * callback parameters: errorFlag -- true/false
  *                      result -- result from DB insert upon success or 
  *                                description string upon error
  */
  plz.publish.page = function (options, callback) {
        //TODO: check permissions via plz.restritct.user
        //      check required fields
    if(typeof options.publisherName !== 'string' ||
       typeof options.pageTitle !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }

    plz.get.database(function (error, database) {
      _page = database.collection(_collectionName);

      var criteria = {pageTitle: options.pageTitle};
      var update = {$set:{visibility: "public"}};

      // update database entry 
      _page.updateOne(criteria, update, function(error, result){

		// invoke callback with result or error
        if(error) {
          callback(true, 'Edit failed: ' + error);
          return;
        }

        if(!result) {
          callback(true, 'Could not find page with title ' + options.pageTitle);
          return;
        }

        callback(false, result);

      });
    });
  };

  /**
  * Fetches a page object matching the title specified in options
  * options properties: publisherName -- used to check permissions
  *                     pageTitle -- unique id used in page lookup
  * callback parameters: errorFlag -- true/false
  *                      result -- result from DB insert upon success or 
  *                                description string upon error
  */
  plz.get.page = function (options, callback) {
    //TODO: check permissions via plz.restritct.user
    // check required fields
    if(typeof options.pageTitle !== 'string') {
      callback(true, 'Required field not present in options');
      return;
    }

    // fetch database entry 
    _page.findOne({pageTitle: options.pageTitle}, function(error, result){
      if (error)
      {
        var message = 'Failed to find entry matching ' + options.pageTitle;
        message += ' in ' + plz.config.author.page.collection;
        callback(true, message);
        return;
      }
      else
      {
        // invoke callback with result
        callback(false, result);
      }
    });
  };

  //edit
  //plz.edit.page = function (options, callback) {}

  //delete
  //plz.delete.page = function (options, callback) {}

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
