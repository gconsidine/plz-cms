(function () {
  'use strict';

  require('should');

  var plz = {
    config: {
      mailer: {
        default: {
          service: 'Gmail', 
          address: process.env.PLZ_MAIL_DEFAULT_ADDRESS,
          password: process.env.PLZ_MAIL_DEFAULT_PASSWORD
        }
      }
    }
  };

  require('../app/core.mailer.js')(plz);

  describe('core.mailer | Public API', function () {
    describe('plz.get.mailer()', function () {
      it('should contain an active mailer', function (done) {
        plz.get.mailer(function (error, transporter) {
          error.should.be.false;
          (typeof transporter === 'object').should.be.true;
          done();
        });
      });
    });
  });

}());
