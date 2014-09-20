(function () {
  'use strict';

  require('should');

  var Hub = require('../app/core.hub');
  
  var _validOptions = {
    modules: {
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

  var _invalidOptions = {
    modules: {
    }, 
    database: {
      notDefault: 'mongo://'
    },
    mailer: {
    }
  };

  describe('Hub | configure()', function () {
    it('should not accpet undefined options', function () {
      (function () {
        Hub.configure();
      }).should.throw();
    });

    it('should not accept malformed options', function () {
      (function () {
        Hub.configure(_invalidOptions);
      }).should.throw();
    });

    it('should accept valid options', function (done) {
      Hub.configure(_validOptions, function (error, api) {
        error.should.be.false; 
        (typeof api === 'object').should.be.true;

        done();
      });
    });
  });

  describe('Hub | Generated API', function () {
    var plz;

    before(function (done) {
      Hub.configure(_validOptions, function (error, api) {
        plz = api;
        done();
      });  
    });

    it('should have correct verb-category objects available', function () {
      (typeof plz.get === 'object').should.be.true;
    });

    it('should have all methods associated with verb-categories', function () {
      (typeof plz.get.mailer === 'function').should.be.true;
      (typeof plz.get.database === 'function').should.be.true;
    });

    it('should contain an active database connection', function () {
      (typeof plz.get.database() === 'object').should.be.true;
    });

    it('should contain an active mailer', function () {
      (typeof plz.get.mailer() === 'object').should.be.true;
    });
  });

}());
