// author.page.js
// Contains CRUD actions that can be performed on a page from the author component

var AuthorPage = function (plz) {
  'use strict';

  var ObjectID = require('mongodb').ObjectID;
  var _plz = plz || {},
      _db = _plz.get.database(),
      _modules = _plz.config.author.modules,
      _required = _plz.config.author.page.required,
      _page = _db.collection(_plz.config.author.page.collection);

  _plz.create = _plz.create || {};

  /**
  * Creates a page with given options and inserts it into the database, if allowed
  * options properties: authorName -- used to check permissions
  *                     pageTitle -- unique id used in page lookup
  *                     visibility -- public / private / privileged
  *                     contentType -- plain test / HTML / markdown
  *                     content -- string containing actual contents of page
  *                     createdAt -- current timestamp upon successful insertion into database
  *                     modifiedAt -- current timestamp upon successful insertion into database
  *                     status -- draft/pending review/published
  * callback parameters: errorFlag -- true/false
  *                      result -- result from DB insert upon success or description string upon error
  *  (perhaps this should be simply errorDescription || null)
  */
  _plz.create.page = function (options, callback) {
        //TODO: check permissions via plz.restrict.user
        //      check required fields
    checkRequiredOptions(options, function (error, result) {
      if(error) {
        callback(true, result);
        return;
      }

      //      check database for entry with duplicate title
      _page.findOne({pageTitle: options.pageTitle}, function (error, result) {
        if(error) {
          callback(true, 'Failed to find entry matching ' + options.pageTitle + ' in ' + _plz.config.author.page.collection);
          return;
        }

        if(result) {
          callback(true, 'Page with title ' + options.pageTitle + ' already exists');
          return;
        }

        //      update timestamps and status due to creation event
        var currentTimestamp = new Date().getTime()/1000;
        options.createdAt = currentTimestamp;
        options.modifiedAt = currentTimestamp;
        options.status = 'created';

        //      insert into database
        _page.insertOne(options, function (error, result) {
          if(error) {
            callback(true, 'Insert failed: ' + error);
            return;
          }



		//		invoke callback with result
          callback(false, result);
        });
      });
	});

  };

  _plz.publish = _plz.publish || {};

  _plz.publish.page = function (options, callback) {
        //TODO: check permissions via plz.restritct.user
        //      check required fields
        //      check database for page name
        //      update database entry 
		//		invoke callback with result
  };

  _plz.get = _plz.get || {};

  _plz.get.page = function (options, callback) {
        //TODO: check permissions via plz.restritct.user
        //      check required fields
        //      check database for page name
        //      fetch database entry 
		//		invoke callback with result
  };

  //edit
  //delete
  var checkRequiredOptions = function(options, callback) {
    for(var field in _required) {
      if(_required.hasOwnProperty(field)) {
        if(typeof options[field] === 'undefined') {
          callback(true, 'Required field not present in options');
          return;
        }

        if(!_plz.validate.typeAs(_required[field], options[field])) {
          callback(true, 'Required fields\' types not valid in options');
          return;
        }
      }
    }
    callback(false);
  }


  return _plz;
};

module.exports = AuthorPage;
