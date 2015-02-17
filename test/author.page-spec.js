'use strict';

require('should');

var Tc = require('./test-config');

describe('author | Configuration', function () {
  it('should not accept undefined author options', function () {
    (function () {
      require('../app/core.hub')(Tc.invalidAuthorConfig);
    }).should.throw();
  });

  it('should accept properly defined author options', function () {
    (function () {
      require('../app/core.hub')(Tc.validAuthorConfig);
    }).should.not.throw();
  });
});

describe('author.page | Public API', function () {
  var page, pageCollection;

  var plz = require('../app/core.hub')(Tc.validAuthorConfig),
      db = require('../app/utility.database')(plz);

  describe('plz.create.page()', function () {

    before(function (done) {
      db.getDatabase(function (error, database) {
        page = Tc.validAuthorConfig.author.page.collection;
        pageCollection = database.collection(page);
        
        pageCollection.count(function(error, count) {
          if(count >= 1) {
            pageCollection.drop(function () {
              done();
            });
          } else {
            done();
          }
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      plz.create.page(Tc.invalidPage, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should insert a page with required fields present', function(done) {
      var beforeCreateDate = new Date();
      plz.create.page(Tc.validPage, function (error) {
        error.should.be.false;

        pageCollection.count(function(error, count) {
          count.should.equal(1);
          var findOptions = {title: Tc.validPage.title};

          pageCollection.findOne(findOptions, function (error, result) {
            for(var field in Tc.validPage) {
              if(Tc.validPage.hasOwnProperty(field) && field !== "_id") {
                if(result[field] instanceof Array){
                  var arrayString = result[field].toString();
                  arrayString.should.equal(Tc.validPage[field].toString());
                }
                else if(typeof result[field] === 'object'){
                  result[field].toString().should.equal(Tc.validPage[field].toString());
                }
                else{
                  result[field].should.equal(Tc.validPage[field]);
                }
              }
            }
            var afterCreateDate = new Date();
            (result.createdAt >= beforeCreateDate).should.be.true;
            (result.createdAt <= afterCreateDate).should.be.true;
            done();
          });
        });
      });
    });

    it('should not insert a page that already exists', function(done) {
      plz.create.page(Tc.validPage, function (error) {
        error.should.be.true;
        done();
      });
    });

    after(function (done) {
      pageCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.publish.page()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        page = Tc.validAuthorConfig.author.page.collection;
        pageCollection = database.collection(page);

        plz.create.page(Tc.validPage, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var invalidRequest = {
        options: 'invalid options',
      };

      plz.publish.page(invalidRequest, function (error) {
        error.should.be.true;

        var requestWithoutCriteria = {
          userName: 'chahm',
        };
        plz.publish.page(requestWithoutCriteria, function (error) {
          error.should.be.true;
          done();
        });
      });
    });

    it('should publish a page by name with public visibility', function(done) {
      var request = {
        userName: 'chahm',
        title: 'Simple plz-cms page',
      };

      plz.publish.page(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;

        pageCollection.findOne(request, function (error, result) {
          result.visibility.should.equal("public");
          done();
        });
      });
    });

    it('should publish a page by id with public visibility', function(done) {
      plz.create.page(Tc.anotherValidPage, function (error, result) {
        error.should.be.false;
        var request = {
          userName: 'chahm',
          _id: result.data[0]._id
        };

        plz.publish.page(request, function (error, result) {
          error.should.be.false;
          result.ok.should.be.true;
          result.data.updatedExisting.should.be.true;
          result.data.n.should.equal(1);

          pageCollection.findOne(request, function (error, result) {
            result.visibility.should.equal("public");
            done();
          });
        });
      });
    });

    it('should return a null result if page does not exist', function(done) {
      var request = {
        userName: 'chahm',
        title: 'nonexistent page',
      };

      plz.publish.page(request, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        (result.data === null).should.be.true;
        done();
      });
    });

    after(function (done) {
      pageCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.get.page()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        page = Tc.validAuthorConfig.author.page.collection;
        pageCollection = database.collection(page);

        plz.create.page(Tc.validPage, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var request = {
        options: 'invalid options',
      };

      plz.get.page(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should fetch a page with required fields present', function(done) {
      var request = {
        userName: 'chahm',
        title: 'Simple plz-cms page',
      };

      plz.get.page(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;
        done();
      });
    });

    it('should fetch a page using _id', function(done) {
      plz.create.page(Tc.anotherValidPage, function (error, result) {
        error.should.be.false;
        var request = {
          _id: result.insertedId
        };
        plz.get.page(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          done();
        });
      });
    });

    it('should fetch multiple pages using label', function(done) {
      Tc.anotherValidPage.title = 'page 3';
      Tc.anotherValidPage._id = undefined;

      plz.create.page(Tc.anotherValidPage, function (error) {
        error.should.be.false;

        var request = {
          label: 'mainmenu'
        };

        plz.get.page(request, function (error, result) {
          error.should.be.false;
          result.data.should.not.be.empty;
          result.data.length.should.equal(3);
          done();
        });
      });
    });

    it('should not fetch more pages than specified limit', function(done) {
      var request = {
        label: 'mainmenu',
        limit: 2
      };
      plz.get.page(request, function (error, result) {
        error.should.be.false;
        result.data.should.not.be.empty;
        result.data.length.should.equal(request.limit);
        done();
      });
    });

    it('should not fetch previous revisions using label', function(done) {
      var editRequest = {
        userName: 'chahm',
        title: 'Simple plz-cms page',
        content: 'new content'
      };

      plz.edit.page(editRequest, function (error, result) {
        error.should.be.false;
        result.data.should.not.be.empty;

        var getRequest = { label: 'mainmenu' };

        plz.get.page(getRequest, function (error, result) {
          error.should.be.false;
          result.data.should.not.be.empty;
          result.data.length.should.equal(3);
          done();
        });
      });
    });

    it('should return empty array if page does not exist', function(done) {
      var request = {
        userName: 'chahm',
        title: 'nonexistent page',
      };

      plz.get.page(request, function (error, result) {
        error.should.be.false;
        result.data.should.eql([]);
        done();
      });
    });

    it('should callback error and return if database fails', function(done) {
      var mockDatabase = {
        getDocument: function (query, callback) {
          callback(true, { ok: false, message: 'Mock failure', data: null });
        }
      };

      var request = {
        userName: 'chahm',
        title: 'nonexistent post',
      };

      require('../app/author.page')(plz, mockDatabase);

      plz.get.page(request, function (error, result) {
        error.should.be.true;
        result.should.be.an.Object;
        done();
      });
    });

    after(function (done) {
      pageCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.edit.page()', function () {
    var mockDatabase = {};

    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        page = Tc.validAuthorConfig.author.page.collection;
        pageCollection = database.collection(page);

        plz.create.page(Tc.validPage, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var invalidRequest = {
        options: 'invalid options',
      };

      plz.edit.page(invalidRequest, function (error) {
        error.should.be.true;

        var requestWithoutCriteria = {
          userName: 'chahm',
        };

        plz.edit.page(requestWithoutCriteria, function (error) {
          error.should.be.true;
          done();
        });
      });
    });

    it('should callback error if no id or criteria is present', function(done) {
      var options = {
        userName: 'Corwin',
        content: 'Prince of Amber'
      };

      plz.edit.page(options, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });

    it('should callback error if getDatabase fails', function(done) {
      mockDatabase.getDocument = function (query, callback) {
        callback(true, 'Mock failure');
      };

      require('../app/author.page')(plz, mockDatabase);

      var options = {
        userName: 'Corwin',
        content: 'Prince of Amber',
        _id: '0001'
      };

      plz.edit.page(options, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });

    it('should callback error if editDocument fails', function(done) {
      mockDatabase.getDocument = function (query, callback) {
        callback(false, [{_id: '0001', status: 'something', revisionNumber: 1}]);
      };

      mockDatabase.editDocument = function (query, callback) {
        callback(true, { ok: false, message: 'error', result: null });
      };

      require('../app/author.page')(plz, mockDatabase);

      var options = {
        userName: 'Corwin',
        content: 'Prince of Amber',
        _id: '0001'
      };

      plz.edit.page(options, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });

    it('should modify a page by name with new content', function(done) {
      var request = {
        userName: 'chahm',
        title: 'Simple plz-cms page',
        content: 'new content'
      };

      plz.edit.page(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;

        pageCollection.findOne(request, function (error, result) {
          result.content.should.equal(request.content);
          done();
        });
      });
    });

    it('should modify a page by id with new content', function(done) {
      plz.create.page(Tc.anotherValidPage, function (error, result) {
        error.should.be.false;
        var request = {
          userName: 'chahm',
          _id: result.data[0]._id,
          content: 'more new content'
        };

        plz.edit.page(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;

          var findRequest = {_id : request._id};
          pageCollection.findOne(findRequest, function (error, result) {
            result.content.should.equal(request.content);
            done();
          });
        });
      });
    });

    it('should return empty array if page does not exist', function(done) {
      var request = {
        userName: 'chahm',
        title: 'nonexistent page',
      };

      plz.get.page(request, function (error, result) {
        error.should.be.false;
        result.data.should.eql([]);
        done();
      });
    });

    it('should callback an error and return if database fails', function(done) {
      var mockDatabase = {};

      mockDatabase.getDocument = function (query, callback) {
        callback(false, [{_id: '0001', status: 'something', revisionNumber: 1}]);
      };

      mockDatabase.editDocument = function (query, callback) {
        callback(false, { ok: true, message: 'Mock Success', data: {} });
      };

      mockDatabase.createDocument = function (query, callback) {
        callback(true, { ok: false, message: 'Mock failure', data: null });
      };

      require('../app/author.page')(plz, mockDatabase);

      var request = {
        userName: 'chahm',
        title: 'a page',
        content: 'blah blah blah...',
      };

      plz.edit.page(request, function (error, result) {
        error.should.be.true;
        result.should.be.an.Object;
        done();
      });
    });

    afterEach(function () {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);
    });

    after(function (done) {
      pageCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.remove.page()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        page = Tc.validAuthorConfig.author.page.collection;
        pageCollection = database.collection(page);

        plz.create.page(Tc.validPage, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var invalidRequest = {
        options: 'invalid options',
      };

      plz.remove.page(invalidRequest, function (error) {
        error.should.be.true;
        var requestWithoutCriteria = {
          userName: 'chahm',
        };
        plz.remove.page(requestWithoutCriteria, function (error) {
          error.should.be.true;
          done();
        });
      });
    });

    it('should remove a page matching the given title', function(done) {
      var request = {
        userName: 'chahm',
        title: 'Simple plz-cms page'
      };

      plz.remove.page(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;

        pageCollection.count(function(error, count) {
          count.should.equal(0);
          done();
        });
      });
    });

    it('should remove a page matching the given _id', function(done) {
      plz.create.page(Tc.anotherValidPage, function (error, result) {
        error.should.be.false;
        var request = {
          userName: 'chahm',
          _id: result.data[0]._id
        };
        plz.remove.page(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;

          pageCollection.count(function(error, count) {
            count.should.equal(0);
            done();
          });
        });
      });
    });

    it('should return empty array if page does not exist', function(done) {
      var request = {
        userName: 'chahm',
        title: 'nonexistent page',
      };

      plz.get.page(request, function (error, result) {
        error.should.be.false;
        result.data.should.eql([]);
        done();
      });
    });

    it('should callback an error and return if database fails', function(done) {
      var mockDatabase = {};

      mockDatabase.removeDocument = function (query, callback) {
        callback(true, { ok: false, message: 'Mock failure', data: null });
      };

      require('../app/author.page')(plz, mockDatabase);

      var request = {
        userName: 'chahm',
        title: 'nonexistent post',
      };

      plz.remove.page(request, function (error, result) {
        error.should.be.true;
        result.should.be.an.Object;
        done();
      });
    });

    after(function (done) {
      pageCollection.drop(function () {
        done();
      });
    });
  });
});

describe('author.page | Private API', function () {
  var author, plz;

  describe('checkRequiredOptions()', function () {
    beforeEach(function () {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);
    });

    it('should callback an error if required field\'s type is not valid', function (done) {
      author = require('../app/author.page')(plz);

      var options = {
        userName: 'Mario',
        title: 'Donkey Kong',
        visibility: 'banana',
        content: 'more whatever',
        contentType: 'whatever',
        createdAt: 111111111,
        modifiedAt: 222222222,
        status: 9000
      };

      author.checkRequiredOptions(options, function (error, result) {
        error.should.be.true;
        result.should.be.a.String;
        done();
      });
    });
  });
});

