(function () {
  'use strict';

  var Should = require('should'),
      Hub = require('../app/Hub');
  
  var _validOptions = {
    modules: {
    },
    database: {
      default: {
        uri: process.env.PLZ_DATABASE_DEFAULT
      }
    },
    mailer: {
      default: {
        service: 'Gmail',
        address: process.env.PLZ_MAILER_DEFAULT_ADDRESS,
        password: process.env.PLZ_MAILER_ACTIVATION_PASSWORD
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

    it('should not accpet undefined options', function (done) {
      try {
        Hub.configure();
        Should.fail();
      } catch(error) {
        done();
      }
    });

    it('should not accept malformed options', function (done) {
      try {
        Hub.configure(_invalidOptions); 
        Should.fail();
      } catch(error) {
        done();
      }
    });

    it('should accept valid options', function (done) {
      try {
        Hub.configure(_validOptions);  
        Should.pass();
      } catch(error) {
        done();
      }
    });

  });

  describe('Hub | Hub-specific generated API', function () {
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
