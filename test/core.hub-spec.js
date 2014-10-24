(function () {
  'use strict';

  require('should');

  var _validConfig = {
    modules: {
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

  var _invalidConfig = {
    modules: {
    }, 
    database: {
      notDefault: 'mongo://'
    },
    mailer: {
    }
  };

  describe('core | Configuration', function () {
    var plz;

    it('should not accpet undefined options', function () {
      (function () {
        plz = require('../app/core.hub')();
      }).should.throw();
    });

    it('should not accept malformed options', function () {
      (function () {
        plz = require('../app/core.hub')(_invalidConfig);
      }).should.throw();
    });

    it('should accept valid options', function () {
      (function () {
        plz = require('../app/core.hub')(_validConfig);
      }).should.not.throw();
    });
  });

}());
