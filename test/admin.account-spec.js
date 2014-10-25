'use strict';

require('should');

var Tc = require('./test-config');

describe('admin.account | Public API', function () {
  var plz = require('../app/core.hub')(Tc.validAdminConfig),
      Utility = require('../app/utility.api')(plz),
      database = Utility.db;

  describe('plz.login.user()', function () {
    before(function (done) {
      plz.create.user(Tc.validUser, function () {
        done();
      });
    });
     
    it('should return a user with matching email/password', function (done) {
      var login = {
        email: 'name@domain.com',
        password: 'someFakePass0'
      };

      plz.login.user(login, function (error, result) {
        error.should.be.false;
        result.should.be.type('object');
        done();
      });
    });

    it('should return an error for criteria without a match', function (done) {
      var login = {
        email: 'name@domain.com',
        password: 'someWrongPass0'
      };

      plz.login.user(login, function (error, result) {
        error.should.be.true;
        result.should.be.type('string');
        done();
      });
    });

    after(function (done) {
      database.getDatabase(function (error, database) {
        database.collection('user').drop(function () { done(); });
      });
    });

  });

});

