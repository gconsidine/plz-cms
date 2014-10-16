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

  /*
  plz.publish.page = function (options, callback) {
        //TODO: check permissions via plz.restritct.user
        //      check required fields
        //      check database for page name
        //      update database entry 
		//		invoke callback with result
  };


  plz.get.page = function (options, callback) {
        //TODO: check permissions via plz.restritct.user
        //      check required fields
        //      check database for page name
        //      fetch database entry 
		//		invoke callback with result
  };
  */

  //edit
  //delete
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
