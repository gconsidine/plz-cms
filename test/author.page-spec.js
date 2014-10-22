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
        uri: 'mongodb://127.0.0.1:27017/test'
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
          userName: 'string',
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
          userName: 'string',
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
        uri: 'mongodb://127.0.0.1:27017/test'
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

  var _pageOptions = {
    userName: 'chahm',
    pageTitle: 'Simple plz-cms page',
    visibility: 'public',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft',
    contentType: 'text/plain',
    content: ''
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

        plz.create.page(_pageOptions, function (error) {
          error.should.be.false;

          pageTable.count(function(error, count) {
            count.should.equal(1);

            var findOptions = {pageTitle: _pageOptions.pageTitle};

            pageTable.findOne(findOptions, function (error, result) {
              for(var field in _pageOptions) {
                if(_pageOptions.hasOwnProperty(field) && field !== "_id") {
                  result[field].should.equal(_pageOptions[field]);
                }
              }
              done();
            });
          });
        });
      });

      it('should not insert a page that already exists', function(done) {

        plz.create.page(_pageOptions, function (error) {
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

    describe('plz.publish.page()', function () {
      before(function (done) {
        plz = require('../app/core.hub')(_validConfig);

        plz.get.database(function (error, database) {
          pageTable = database.collection(_validConfig.author.page.collection);
          plz.create.page(_pageOptions, function (error) {
            error.should.be.false;
            done();
          });
        });
      });

      it('should return error if required fields are missing', function(done) {
        var request = {
          options: 'invalid options',
        };

        plz.publish.page(request, function (error) {
          error.should.be.true;
          done();
        });
      });

      it('should publish a page with public visibility', function(done) {
        var request = {
          userName: 'chahm',
          pageTitle: 'Simple plz-cms page',
        };
        plz.publish.page(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;

          pageTable.findOne(request, function (error, result) {
            result.visibility.should.equal("public");
            done();
          });
        });
      });

      it('should return error if page does not exist', function(done) {
        var request = {
          userName: 'chahm',
          pageTitle: 'nonexistent page',
        };
        plz.publish.page(request, function (error, result) {
          error.should.be.true;
          result.should.not.be.empty;
          done();
        });
      });

      after(function (done) {
        pageTable.drop(function () {
          done();
        });
      });
    });

    describe('plz.get.page()', function () {
      before(function (done) {
        plz = require('../app/core.hub')(_validConfig);

        plz.get.database(function (error, database) {
          pageTable = database.collection(_validConfig.author.page.collection);
          plz.create.page(_pageOptions, function (error) {
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
          pageTitle: 'Simple plz-cms page',
        };
        plz.get.page(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          done();
        });
      });

      it('should return error if page does not exist', function(done) {
        var request = {
          userName: 'chahm',
          pageTitle: 'nonexistent page',
        };
        plz.get.page(request, function (error, result) {
          error.should.be.true;
          result.should.not.be.empty;
          done();
        });
      });

      after(function (done) {
        pageTable.drop(function () {
          done();
        });
      });
    });

    describe('plz.edit.page()', function () {
      before(function (done) {
        plz = require('../app/core.hub')(_validConfig);

        plz.get.database(function (error, database) {
          pageTable = database.collection(_validConfig.author.page.collection);
          plz.create.page(_pageOptions, function (error) {
            error.should.be.false;
            done();
          });
        });
      });

      it('should return error if required fields are missing', function(done) {
        var request = {
          options: 'invalid options',
        };

        plz.edit.page(request, function (error) {
          error.should.be.true;
          done();
        });
      });

      it('should modify a page with new content', function(done) {
        var request = {
          userName: 'chahm',
          pageTitle: 'Simple plz-cms page',
          content: 'new content'
        };
        plz.edit.page(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;

          pageTable.findOne(request, function (error, result) {
            result.content.should.equal(request.content);
            done();
          });
        });
      });

      it('should return error if page does not exist', function(done) {
        var request = {
          userName: 'chahm',
          pageTitle: 'nonexistent page',
        };
        plz.get.page(request, function (error, result) {
          error.should.be.true;
          result.should.not.be.empty;
          done();
        });
      });

      after(function (done) {
        pageTable.drop(function () {
          done();
        });
      });
    });

    describe('plz.remove.page()', function () {
      before(function (done) {
        plz = require('../app/core.hub')(_validConfig);

        plz.get.database(function (error, database) {
          pageTable = database.collection(_validConfig.author.page.collection);
          plz.create.page(_pageOptions, function (error) {
            error.should.be.false;
            done();
          });
        });
      });

      it('should return error if required fields are missing', function(done) {
        var request = {
          options: 'invalid options',
        };

        plz.remove.page(request, function (error) {
          error.should.be.true;
          done();
        });
      });

      it('should remove a page matching the given criteria', function(done) {
        var request = {
          userName: 'chahm',
          pageTitle: 'Simple plz-cms page'
        };

        plz.remove.page(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;

          pageTable.count(function(error, count) {
            count.should.equal(0);
            done();
          });
        });
      });

      it('should return error if page does not exist', function(done) {
        var request = {
          userName: 'chahm',
          pageTitle: 'nonexistent page',
        };
        plz.get.page(request, function (error, result) {
          error.should.be.true;
          result.should.not.be.empty;
          done();
        });
      });

      after(function (done) {
        pageTable.drop(function () {
          done();
        });
      });
    });
  });
}());
