(function () {
  'use strict';

  require('should');

  var Hub = require('../app/Hub');
  
  var _validOptions = {
    modules: {
    },
    database: {
      default: {
        uri: process.env.PLZ_DB_DEFAULT
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

    it('should accept valid options', function () {
      (function () {
        Hub.configure(_validOptions);
      }).should.not.throw();
    });

  });

  describe('Hub | Hub-specific generated API', function () {
   var plz;

   before(function (done) {
     plz = Hub.configure(_validOptions);  
     done();
   });

   it('is a placeholder', function () {
     true.should.be.true;
   });
  });

  describe('Hub | plz-admin-specific generated API', function () {
    it('is a placeholder', function () {
     true.should.be.true;
    });
  });

  describe('Hub | Combined APIs', function () {
    it('is a placeholder', function () {
     true.should.be.true;
    });
  });
 
}());
