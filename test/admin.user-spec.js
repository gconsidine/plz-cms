(function () {
  'use strict';

  require('should');

  var Hub = require('../app/core.hub');

  var _options = {
    modules: {
      admin: true
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

  var _invalidOptions = {
    modules: {
      admin: true
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

  describe('admin | Addtional configuration options', function () {

    it('should not accept undefined admin options', function () {
      (function () {
        Hub.configure(_invalidOptions, function () {});
      }).should.throw();
    });

    it('should accept properly defined admin options', function (done) {
      Hub.configure(_options, function (error, api) {
        error.should.be.false; 
        (typeof api === 'object').should.be.true;

        done();
      });
    });
  });

  describe('admin.user | create.user()', function () {
    var plz, user;

    before(function (done) {
      Hub.configure(_options, function(error, api) {
        plz = api;
        user = plz.get.database().collection('user');

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

    it('should insert a user with required fields present', function(done) {
      plz.create.user(document, function (error) {
        error.should.be.false;
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
      user.drop(function () {
        done();
      });
    });

  });

  describe('admin.user | get.user()', function () {
    var user, plz;

    before(function (done) {
      Hub.configure(_options, function(error, api) {
        plz = api;
        user = plz.get.database().collection('user');

        plz.create.user(document, function () {
          done();
        });
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
      user.drop(function () {
        done();
      });
    });
  });

 describe('admin.user | get.user()', function () {
    var user, plz;

    before(function (done) {
      Hub.configure(_options, function(error, api) {
        plz = api;
        user = plz.get.database().collection('user');

        plz.create.user(document, function () {
          done();
        });
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
      user.drop(function () {
        done();
      });
    });
  });

 describe('admin.user | remove.user()', function () {
    var user, plz;

    before(function (done) {
      Hub.configure(_options, function(error, api) {
        plz = api;
        user = plz.get.database().collection('user');

        plz.create.user(document, function () {
          done();
        });
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
      user.drop(function () {
        done();
      });
    });
  });

  describe('admin.user | edit.user()', function () {
    var user, plz;

    before(function (done) {
      Hub.configure(_options, function(error, api) {
        plz = api;
        user = plz.get.database().collection('user');

        plz.create.user(document, function () {
          done();
        });
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
      user.drop(function () {
        done();
      });
    });
  });

}());
