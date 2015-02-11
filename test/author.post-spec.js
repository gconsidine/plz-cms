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
  var post, postCollection;

  var plz = require('../app/core.hub')(Tc.validAuthorConfig),
      db = require('../app/utility.database')(plz);

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

          var findOptions = {title: Tc.validPost.title};

          postCollection.findOne(findOptions, function (error, result) {
            for(var field in Tc.validPost) {
              if(Tc.validPost.hasOwnProperty(field) && field !== "_id") {
                if(result[field] instanceof Array){
                  var arrayString = result[field].toString();
                  arrayString.should.equal(Tc.validPost[field].toString());
                }
                else{
                  result[field].should.equal(Tc.validPost[field]);
                }
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
      var invalidRequest = {
        options: 'invalid options',
      };

      plz.publish.post(invalidRequest, function (error) {
        error.should.be.true;

        var requestWithoutCriteria = {
          userName: 'chahm',
        };
        plz.publish.post(requestWithoutCriteria, function (error) {
          error.should.be.true;
          done();
        });
      });
    });

    it('should publish a post by namewith public visibility', function(done) {
      var request = {
        userName: 'chahm',
        title: 'Simple post',
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

    it('should publish a post by id with public visibility', function(done) {
      plz.create.post(Tc.anotherValidPost, function (error, result) {
        error.should.be.false;
        var request = {
          userName: 'chahm',
          _id: result.insertedId
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
    });

    it('should return null if post does not exist', function(done) {
      var request = {
        userName: 'chahm',
        title: 'nonexistent post',
      };

      plz.publish.post(request, function (error, result) {
        error.should.be.false;
        (result.value === null).should.be.true;
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

    it('should fetch a post using title', function(done) {
      var request = {
        userName: 'chahm',
        title: 'Simple post',
      };

      plz.get.post(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;
        done();
      });
    });

    it('should fetch a post using _id', function(done) {
      plz.create.post(Tc.anotherValidPost, function (error, result) {
        error.should.be.false;
        var request = {
          _id: result.insertedId
        };
        plz.get.post(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          done();
        });
      });
    });

    it('should fetch multiple posts using label', function(done) {
      Tc.anotherValidPost.title = 'post 3';
      Tc.anotherValidPost._id = undefined;
      plz.create.post(Tc.anotherValidPost, function (error) {
        error.should.be.false;
        var request = { label: 'news' };

        plz.get.post(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          result.length.should.equal(3);
          done();
        });
      });
    });

    it('should not fetch more posts than specified limit', function(done) {
      var request = {
        label: 'news',
        limit: 2
      };

      plz.get.post(request, function (error, result) {
        error.should.be.false;
        result.length.should.equal(2);
        done();
      });
    });

    it('should not fetch previous revisions using label', function(done) {
      var editRequest = {
        userName: 'chahm',
        title: 'Simple post',
        content: 'new content'
      };

      plz.edit.post(editRequest, function (error) {
        error.should.be.false;
        var getRequest = { label: 'news' };

        plz.get.post(getRequest, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          result.length.should.equal(3);
          done();
        });
      });
    });

    it('should return empty array if post does not exist', function(done) {
      var request = {
        userName: 'chahm',
        title: 'nonexistent post',
      };

      plz.get.post(request, function (error, result) {
        error.should.be.false;
        result.should.eql([]);
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
    var mockDatabase = {};

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
      var invalidRequest = {
        options: 'invalid options',
      };

      plz.edit.post(invalidRequest, function (error) {
        error.should.be.true;
        var requestWithoutCriteria = {
          userName: 'chahm',
        };
        plz.edit.post(requestWithoutCriteria, function (error) {
          error.should.be.true;
          done();
        });
      });
    });

    it('should callback error if no id or title is present', function(done) {
      var options = {
        userName: 'Corwin',
        content: 'Prince of Amber'
      };

      plz.edit.post(options, function (error, result) {
        error.should.be.true;
        result.should.be.a.String;
        done();
      });
    });

    it('should callback error if getDocument fails', function(done) {
      mockDatabase.getDocument = function (query, callback) {
        callback(true, 'Mock failure');
      };

      require('../app/author.post')(plz, mockDatabase);

      var options = {
        userName: 'Corwin',
        content: 'Prince of Amber',
        _id: '0001'
      };

      plz.edit.post(options, function (error, result) {
        error.should.be.true;
        result.should.be.a.String;
        done();
      });
    });

    it('should callback error if editDocument fails', function(done) {
      mockDatabase.getDocument = function (query, callback) {
        callback(false, [{_id: '0001', status: 'something', revisionNumber: 1}]);
      };

      mockDatabase.editDocument = function (query, callback) {
        callback(true, 'Mock failure');
      };

      require('../app/author.post')(plz, mockDatabase);

      var options = {
        userName: 'Corwin',
        content: 'Prince of Amber',
        _id: '0001'
      };

      plz.edit.post(options, function (error, result) {
        error.should.be.true;
        result[0].status.should.equal('archived');
        result[0].revisionNumber.should.equal(1);
        done();
      });
    });

    it('should modify a post by name with new content', function(done) {
      var request = {
        userName: 'chahm',
        title: 'Simple post',
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

    it('should modify a post by id with new content', function(done) {
      plz.create.post(Tc.anotherValidPost, function (error, result) {
        error.should.be.false;
        var request = {
          userName: 'chahm',
          _id: result.insertedId,
          content: 'more new content'
        };
        plz.edit.post(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;

          var findRequest = {_id : request._id};
          postCollection.findOne(findRequest, function (error, result) {
            result.content.should.equal(request.content);
            done();
          });
        });
      });
    });

    it('should return empty array if post does not exist', function(done) {
      var request = {
        userName: 'chahm',
        title: 'nonexistent post',
      };

      plz.get.post(request, function (error, result) {
        error.should.be.false;
        result.should.eql([]);
        done();
      });
    });

    afterEach(function () {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);
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
      var invalidRequest = {
        options: 'invalid options',
      };

      plz.remove.post(invalidRequest, function (error) {
        error.should.be.true;
        var requestWithoutCriteria = {
          userName: 'chahm',
        };
        plz.remove.post(requestWithoutCriteria, function (error) {
          error.should.be.true;
          done();
        });
      });
    });

    it('should remove a post matching the given title', function(done) {
      var request = {
        userName: 'chahm',
        title: 'Simple post'
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

    it('should remove a post matching the given _id', function(done) {
      plz.create.post(Tc.anotherValidPost, function (error, result) {
        error.should.be.false;
        var request = {
          userName: 'chahm',
          _id: result.insertedId
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
    });

    it('should remove all versions of a post if multiple exist', function(done){
      plz.create.post(Tc.validPost, function (error) {
        error.should.be.false;
        var editRequest = {
          userName: 'chahm',
          title: 'Simple post',
          content: 'new content'
        };
        plz.edit.post(editRequest, function (error) {
          error.should.be.false;
          var removeRequest = {
            userName: 'chahm',
            title: 'Simple post'
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

    it('should affect nothing if post does not exist', function(done) {
      var request = {
        userName: 'chahm',
        title: 'nonexistent post',
      };

      plz.remove.post(request, function (error, response) {
        error.should.be.false;
        response.result.n.should.equal(0);
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

describe('author.post | Private API', function () {
  var author, plz;

  describe('checkRequiredOptions()', function () {
    beforeEach(function () {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);
    });

    it('should callback an error if required field\'s type is not valid', function (done) {
      author = require('../app/author.post')(plz);

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

