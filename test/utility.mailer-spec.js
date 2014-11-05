'use strict';

require('should');

var Tc = require('./test-config');

describe('utility.mailer | Private API', function () {

  describe('getMailer()', function () {
    var plz = require('../app/core.hub')(Tc.validCoreConfig),
        Utility = require('../app/utility.api')(plz),
        mailer = Utility.mailer;

    it('should throw an error when undefined mailer is used', function() {
      (function () {
        mailer.getMailer(function () {}, 'banana');
      }).should.throw();
    });

    it('should get a defined non-default mailer', function(done) {
      mailer.getMailer(function (error, transporter) {
        error.should.be.false;
        transporter.should.be.type('object');
        done();
      }, 'other');
    });
  });

  describe('sendMail()', function () {
    var plz = require('../app/core.hub')(Tc.validCoreConfig),
        Utility = require('../app/utility.api')(plz),
        mailer = Utility.mailer;

    it('should be able to reference non-default mailer', function(done) {
      var options = {
        name: 'other'
      };

      mailer.sendMail(options, function (error, result) {
        error.should.be.true;
        result.should.be.type('string');
        done();
      });
    });
  });

});
