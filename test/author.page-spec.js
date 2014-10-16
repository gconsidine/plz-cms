(function () {
  'use strict';

  require('should');

  var Hub = require('../app/core.hub');

  var _options = {
    modules: {
      admin: false,
      author: true
    },
    database: {
      default: {
        uri: process.env.PLZ_DB_DEFAULT + '/test'
      }
    },
    mailer: {
      default: {
        service: 'Gmail',
        address: process.env.PLZ_MAIL_DEFAULT_ADDRESS,
        password: process.env.PLZ_MAIL_DEFAULT_PASSWORD
      }
    },
    author: {
      modules: {
        page: true,
        article: true
      },
      page: {
        collection: 'page',
        required: {
          authorName: 'string',
          pageTitle: 'string',
          visibility: 'string',
          contentType: 'string',
          content: 'string',
          createdAt: 'number',
          modifiedAt: 'number',
          status: 'string'
        }
      },
      article: {
        collection: 'article',
        required: {
          authorName: 'string',
          parentPage: 'string',
          visibility: 'string',
          contentType: 'string',
          content: 'string',
          createdAt: 'number',
          modifiedAt: 'number',
          status: 'string'
        }
      }
    }
  };

  var _invalidOptions = {
    modules: {
      author: true
    },
    database: {
      default: {
        uri: process.env.PLZ_DB_DEFAULT + '/test'
      }
    },
    mailer: {
      default: {
        service: 'Gmail',
        address: process.env.PLZ_MAIL_DEFAULT_ADDRESS,
        password: process.env.PLZ_MAIL_DEFAULT_PASSWORD
      }
    }
  };

  describe('author | API configuration options', function () {

    it('should not accept undefined author options', function () {
      (function () {
        Hub.configure(_invalidOptions, function () {});
      }).should.throw();
    });

    it('should accept properly defined author options', function (done) {
      Hub.configure(_options, function (error, api) {
        error.should.be.false; 
        (typeof api === 'object').should.be.true;

        done();
      });
    });
  });

  describe('author.page | create.page()', function () {
    var plz,
        db,
        pageTable;

    before(function (done) {
      Hub.configure(_options, function(error, api) {
        plz = api;
        db = plz.get.database();
        pageTable = db.collection(_options.author.page.collection);

        pageTable.count(function(error, count) {
          if(count >= 1) {
            pageTable.drop(function () {
              done();
            });
          } else {
            done();
          }
        });
      });
    });

    it('should return an error if required fields are missing', function(done) {
      var page = {
        pageTitle: 'invalid options',
        createdAt: 3134999944,
        modifiedAt: 3134999944,
        status: 'draft'
      };

      plz.create.page(page, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should insert a page with required fields present', function(done) {
      var page = {
        authorName: 'chahm',
        pageTitle: 'Simple plz-cms page',
        visibility: 'public',
        createdAt: 3134999944,
        modifiedAt: 3134999944,
        status: 'draft',
        contentType: 'journal',
        content: ''
      };


      plz.create.page(page, function (error) {
        error.should.be.false;

        pageTable.count(function(error, count) {
          count.should.equal(1)
          pageTable.findOne({pageTitle: page.pageTitle}, function (error, result) {
            for(var field in page) {
              if(page.hasOwnProperty(field) && field != "_id") {
                result[field].should.equal(page[field]);
              }
            }
            done();
          });
		});
      });
    });

    it('should not insert a page that already exists', function(done) {
      var page = {
        authorName: 'chahm',
        pageTitle: 'Simple plz-cms page',
        visibility: 'public',
        createdAt: 3134999944,
        modifiedAt: 3134999944,
        status: 'draft',
        contentType: 'journal',
        content: ''
      };

      plz.create.page(page, function (error, result) {
        error.should.be.true;
        done();
      });
    });

    after(function (done) {
      pageTable.drop(function () {
        done();
      });
    });

  });

}());
