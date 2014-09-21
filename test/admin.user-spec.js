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
      roles: ['user', 'admin'],
      required: {
        name: 'string',
        email: 'email',
        password: 'password',
        createdAt: 'datetime',
        modifiedAt: 'datetime',
        lastLogin: 'datetime',
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

  describe('admin.user | should validate required fields', function () {
    var plz;

    before(function (done) {
      Hub.configure(_options, function(error, api) {
        plz = api;
        done();
      });
    });

  });

}());
