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

describe('author.post | Public API', function () {
  var plz, post, postCollection, Utility, db;

  plz = require('../app/core.hub')(Tc.validAuthorConfig);
  Utility = require('../app/utility.api')(plz);
  db = Utility.db;

  describe('plz.create.post()', function () {

    before(function (done) {
      db.getDatabase(function (error, database) {
        post = Tc.validAuthorConfig.author.post.collection;
        postCollection = database.collection(post);

        postCollection.count(function(error, count) {
          if(count >= 1) {
            postCollection.drop(function () {
              done();
            });
          } else {
            done();
          }
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      plz.create.post(Tc.invalidPost, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should insert a post with required fields present', function(done) {
      plz.create.post(Tc.validPost, function (error) {
        error.should.be.false;

        postCollection.count(function(error, count) {
          count.should.equal(1);

          var findOptions = {postTitle: Tc.validPost.postTitle};

          postCollection.findOne(findOptions, function (error, result) {
            for(var field in Tc.validPost) {
              if(Tc.validPost.hasOwnProperty(field) && field !== "_id") {
                result[field].should.equal(Tc.validPost[field]);
              }
            }
            done();
          });
        });
      });
    });

    it('should not insert a post that already exists', function(done) {
      plz.create.post(Tc.validPost, function (error) {
        error.should.be.true;
        done();
      });
    });

    after(function (done) {
      postCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.publish.post()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        post = Tc.validAuthorConfig.author.post.collection;
        postCollection = database.collection(post);

        plz.create.post(Tc.validPost, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var request = {
        options: 'invalid options',
      };

      plz.publish.post(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should publish a post with public visibility', function(done) {
      var request = {
        userName: 'chahm',
        postTitle: 'Simple post',
      };

      plz.publish.post(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;

        postCollection.findOne(request, function (error, result) {
          result.visibility.should.equal("public");
          done();
        });
      });
    });

    it('should return error if post does not exist', function(done) {
      var request = {
        userName: 'chahm',
        postTitle: 'nonexistent post',
      };

      plz.publish.post(request, function (error, result) {
        error.should.be.true;
        result.should.not.be.empty;
        done();
      });
    });

    after(function (done) {
      postCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.get.post()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        post = Tc.validAuthorConfig.author.post.collection;
        postCollection = database.collection(post);

        plz.create.post(Tc.validPost, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var request = {
        options: 'invalid options',
      };

      plz.get.post(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should fetch a post with required fields present', function(done) {
      var request = {
        userName: 'chahm',
        postTitle: 'Simple post',
      };

      plz.get.post(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;
        done();
      });
    });

    it('should return error if post does not exist', function(done) {
      var request = {
        userName: 'chahm',
        postTitle: 'nonexistent post',
      };

      plz.get.post(request, function (error, result) {
        error.should.be.true;
        result.should.not.be.empty;
        done();
      });
    });

    after(function (done) {
      postCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.edit.post()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        post = Tc.validAuthorConfig.author.post.collection;
        postCollection = database.collection(post);

        plz.create.post(Tc.validPost, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var request = {
        options: 'invalid options',
      };

      plz.edit.post(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should modify a post with new content', function(done) {
      var request = {
        userName: 'chahm',
        postTitle: 'Simple post',
        content: 'new content'
      };

      plz.edit.post(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;

        postCollection.findOne(request, function (error, result) {
          result.content.should.equal(request.content);
          done();
        });
      });
    });

    it('should return error if post does not exist', function(done) {
      var request = {
        userName: 'chahm',
        postTitle: 'nonexistent post',
      };

      plz.get.post(request, function (error, result) {
        error.should.be.true;
        result.should.not.be.empty;
        done();
      });
    });

    after(function (done) {
      postCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.remove.post()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        post = Tc.validAuthorConfig.author.post.collection;
        postCollection = database.collection(post);

        plz.create.post(Tc.validPost, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var request = {
        options: 'invalid options',
      };

      plz.remove.post(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should remove a post matching the given criteria', function(done) {
      var request = {
        userName: 'chahm',
        postTitle: 'Simple post'
      };

      plz.remove.post(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;

        postCollection.count(function(error, count) {
          count.should.equal(0);
          done();
        });
      });
    });

    it('should remove all versions of a post if multiple exist', function(done){
      plz.create.post(Tc.validPost, function (error) {
        error.should.be.false;
        var editRequest = {
          userName: 'chahm',
          postTitle: 'Simple post',
          content: 'new content'
        };
        plz.edit.post(editRequest, function (error) {
          error.should.be.false;
          var removeRequest = {
            userName: 'chahm',
            postTitle: 'Simple post'
          };

          plz.remove.post(removeRequest, function (error, result) {
            error.should.be.false;
            result.should.not.be.empty;

            postCollection.count(function(error, count) {
              count.should.equal(0);
              done();
            });
          });
        });
      });
    });

    it('should return error if post does not exist', function(done) {
      var request = {
        userName: 'chahm',
        postTitle: 'nonexistent post',
      };

      plz.remove.post(request, function (error, result) {
        error.should.be.true;
        result.should.not.be.empty;
        done();
      });
    });

    after(function (done) {
      postCollection.drop(function () {
        done();
      });
    });
  });
});
