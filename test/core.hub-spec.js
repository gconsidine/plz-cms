(function () {
  'use strict';

  require('should');

  var _validConfig = {
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
        plz = require('../app/core.hub.js')();
      }).should.throw();
    });

    it('should not accept malformed options', function () {
      (function () {
        plz = require('../app/core.hub.js')(_invalidConfig);
      }).should.throw();
    });

    it('should accept valid options', function () {
      (function () {
        plz = require('../app/core.hub.js')(_validConfig);
      }).should.not.throw();
    });
  });

}());
