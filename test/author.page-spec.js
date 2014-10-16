(function () {
  'use strict';

  require('should');

  var _validConfig = {
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

  var _invalidConfig = {
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

  describe('author | Configuration', function () {
    it('should not accept undefined author options', function () {
      (function () {
        require('../app/core.hub')(_invalidConfig);
      }).should.throw();
    });

    it('should accept properly defined author options', function () {
      (function () {
        require('../app/core.hub')(_validConfig);
      }).should.not.throw();
    });
  });

  describe('author.page | Public API', function () {
    var plz,
        pageTable;

    describe('plz.create.page()', function () {

      before(function (done) {
        plz = require('../app/core.hub')(_validConfig);

        plz.get.database(function (error, database) {
          pageTable = database.collection(_validConfig.author.page.collection);

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

      it('should return error if required fields are missing', function(done) {
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
            count.should.equal(1);

            var options = {pageTitle: page.pageTitle};

            pageTable.findOne(options, function (error, result) {
              for(var field in page) {
                if(page.hasOwnProperty(field) && field !== "_id") {
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

        plz.create.page(page, function (error) {
          error.should.be.true;
          done();
        });
      });

      after(function (done) {
        plz.get.database(function (error, database) {
          pageTable = database.collection(_validConfig.author.page.collection);

          pageTable.drop(function () {
            done();
          });
        });
      });
    });
  });
}());
