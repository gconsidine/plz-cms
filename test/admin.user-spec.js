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
    var plz;

    before(function (done) {
      Hub.configure(_options, function(error, api) {
        plz = api;
        done();
      });
    });

    it('should return an error if required fields are missing', function(done) {
      var user = {
        name: 'greg',
        email: 'name@domain.com',
        password: 'someFakePass0',
        createdAt: 3134999944,
        modifiedAt: 3134999944,
        lastLogin: 0,
        status: 'created'
      };

      plz.create.user(user, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should insert a user with required fields present', function(done) {
      var user = {
        name: 'greg',
        email: 'name@domain.com',
        password: 'someFakePass0',
        createdAt: 3134999944,
        modifiedAt: 3134999944,
        lastLogin: 0,
        status: 'created',
        role: 'admin'
      };

      plz.create.user(user, function (error) {
        error.should.be.false;
        done();
      });
    });

  });

}());
