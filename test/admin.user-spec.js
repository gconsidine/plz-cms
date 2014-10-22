(function () {
  'use strict';

  require('should');

  var _validConfig = {
    modules: {
      admin: true
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
    admin: {
      collection: 'user',
      roles: {
        admin: true,
        user: true
      },
      required: {
        name: 'string',
        email: 'email',
        password: 'password',
        createdAt: 'number',
        modifiedAt: 'number',
        lastLogin: 'number',
        status: 'string'
      }
    }
  };

  var _invalidConfig = {
    modules: {
      admin: true
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

  var document = {
    name: 'greg',
    email: 'name@domain.com',
    password: 'someFakePass0',
    createdAt: 3134999944,
    modifiedAt: 3134999945,
    lastLogin: 0,
    status: 'created',
    role: 'admin'
  };

  describe('admin | Configuration', function () {
    it('should not accept undefined admin options', function () {
      (function () {
        require('../app/core.hub.js')(_invalidConfig);
      }).should.throw();
    });

    it('should accept properly defined admin options', function () {
      (function () {
        require('../app/core.hub.js')(_validConfig);
      }).should.not.throw();
    });
  });

  describe('admin.user | Public API', function () {
    var plz, user;

    describe('plz.create.user()', function () {

      before(function (done) {
        plz = require('../app/core.hub.js')(_validConfig);

        plz.get.database(function (error, database) {
          user = database.collection('user');
          user.count(function(error, count) {
            if(count >= 1) {
              user.drop(function () {
                done();
              });
            } else {
              done();
            }
          });
        });
      });

      it('should insert a user with required fields present', function(done) {
        plz.create.user(document, function (error) {
          error.should.be.false;
          done();
        });
      });

      it('should return error if required fields are missing', function(done) {
        var invalidDocument = {
          name: 'greg',
          password: 'someFakePass0',
          createdAt: 3134999944,
          status: 'created'
        };

        plz.create.user(invalidDocument, function (error) {
          error.should.be.true;
          done();
        });
      });


      it('should not insert a user that already exists', function(done) {
        plz.create.user(document, function (error) {
          error.should.be.true;
          done();
        });
      });

      after(function (done) {
        plz.get.database(function (error, database) {
          user = database.collection('user');
          user.drop(function () {
            done();
          });
        });
      });
    });

    describe('plz.get.user()', function () {
      before(function (done) {
        plz = require('../app/core.hub.js')(_validConfig);

        plz.create.user(document, function () {
          done();
        });
      });

      it('should find a user that exists', function (done) {
        plz.get.user({name: 'greg'}, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          done();
        });
      });

      it('should return error if user does not exist', function (done) {
        plz.get.user({name: 'zanzabar'}, function (error) {
          error.should.be.true;
          done();
        });
      });

      after(function (done) {
        plz.get.database(function (error, database) {
          var user = database.collection('user');
          user.drop(function () {
            done();
          });
        });
      });
    });

    describe('plz.remove.user()', function () {
      before(function (done) {
        plz = require('../app/core.hub.js')(_validConfig);

        plz.create.user(document, function () {
          done();
        });
      });

      it('should remove a user that exists', function (done) {
        plz.get.user({name: 'greg'}, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          done();
        });
      });

      it('should return error if user does not exist', function (done) {
        plz.get.user({name: 'doppio'}, function (error) {
          error.should.be.true;
          done();
        });
      });

      after(function (done) {
        plz.get.database(function (error, database) {
          var user = database.collection('user');
          user.drop(function () {
            done();
          });
        });
      });
    });

    describe('plz.edit.user()', function () {
      before(function (done) {
        plz = require('../app/core.hub.js')(_validConfig);

        plz.create.user(document, function () {
          done();
        });
      });

      it('should edit a user that exists', function (done) {
        var options = {
          criteria: {
            name: 'greg'
          },
          update: {
            name: 'doppio'
          }
        };

        plz.get.user({name: 'greg'}, function (error, result) {
          error.should.be.false;
          result.name.should.equal('greg');

          plz.edit.user(options, function (error, result) {
            error.should.be.false;
            result.should.not.be.empty;

            plz.get.user({name: 'doppio'}, function (error, result) {
              result.name.should.equal('doppio');
              done();
            });
          });
        });
      });

      it('should return error if user does not exist', function (done) {
        plz.get.user({name: 'greg'}, function (error) {
          error.should.be.true;
          done();
        });
      });

      after(function (done) {
        plz.get.database(function (error, database) {
          var user = database.collection('user');
          user.drop(function () {
            done();
          });
        });
      });
    });

    describe('plz.restrict.user()', function () {
      var user;

      before(function (done) {
        plz = require('../app/core.hub.js')(_validConfig);

        plz.create.user(document, function (error, result) {
          user = result.ops[0];
          done();
        });
      });

      it('should return true if a user has access', function (done) {
        var options = {
          user: user,
          roles: ['peasant', 'peon']
        };

        plz.restrict.user(options, function (error, access) {
          error.should.be.false;
          access.should.be.true;
          done();
        });
      });

      it('should return false if a user does not have access', function (done) {
        var options = {
          user: user,
          roles: ['admin']
        };

        plz.restrict.user(options, function (error, access) {
          error.should.be.false;
          access.should.be.false;
          done();
        });
      });

      after(function (done) {
        plz.get.database(function (error, database) {
          var user = database.collection('user');
          user.drop(function () {
            done();
          });
        });
      });
    });

    describe('plz.allow.user()', function () {
      var user;

      before(function (done) {
        plz = require('../app/core.hub.js')(_validConfig);

        plz.create.user(document, function (error, result) {
          user = result.ops[0];
          done();
        });
      });

      it('should return true if a user has access', function (done) {
        var options = {
          user: user,
          roles: ['admin']
        };

        plz.allow.user(options, function (error, access) {
          error.should.be.false;
          access.should.be.true;
          done();
        });
      });

      it('should return false if a user does not have access', function (done) {
        var options = {
          user: user,
          roles: ['super-admin']
        };

        plz.allow.user(options, function (error, access) {
          error.should.be.false;
          access.should.be.false;
          done();
        });
      });

      after(function (done) {
        plz.get.database(function (error, database) {
          var user = database.collection('user');
          user.drop(function () {
            done();
          });
        });
      });
    });
  });
}());

