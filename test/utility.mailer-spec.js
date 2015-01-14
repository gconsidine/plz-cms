'use strict';

require('should');

describe('utility.mailer | Private API', function () {
  var mailer, plz;

  // Mock configuration
  plz = {
    config: {
      mailer: {
        default: {
          service: 'fake',
          address: 'name@example.com',
          password: 'fakePassword'
        },
        other: {
          service: 'fake',
          address: 'name2@example.com',
          password: 'fakePassword'
        }
      }
    }
  };

  describe('getMailer()', function () {
    mailer = require('../app/utility.mailer')(plz);

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
    var nodeMailer = require('nodemailer');

    it('should be able to reference mailer and fail', function(done) {
      nodeMailer.createTransport = function () {
        function sendMail(options, callback) {
          callback(true, 'mocked failure'); 
        }

        return {
          sendMail: sendMail
        };
      };

      mailer = require('../app/utility.mailer')(plz, nodeMailer);

      var options = {
        name: 'other'
      };

      mailer.sendMail(options, function (error, result) {
        error.should.be.true;
        result.should.be.type('string');
        done();
      });
    });

    it('should be able to reference mailer and send', function(done) {
      nodeMailer.createTransport = function () {
        function sendMail(options, callback) {
          callback(false, 'mocked success'); 
        }

        return {
          sendMail: sendMail
        };
      };

      mailer = require('../app/utility.mailer')(plz, nodeMailer);

      var options = {
        name: 'other'
      };

      mailer.sendMail(options, function (error, result) {
        error.should.be.false;
        result.should.be.type('string');
        result.should.equal('mocked success');
        done();
      });
    });

  });

});
