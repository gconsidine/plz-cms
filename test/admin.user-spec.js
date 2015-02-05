'use strict';

require('should');

var Tc = require('./test-config');

describe('admin | Configuration', function () {
  it('should not accept undefined admin options', function () {
    (function () {
      require('../app/core.hub')(Tc.invalidAdminConfig);
    }).should.throw();
  });

  it('should accept properly defined admin options', function () {
    (function () {
      require('../app/core.hub')(Tc.validAdminConfig);
    }).should.not.throw();
  });
});

describe('admin.user | Public API', function () {
  var plz, Utility, db;

  plz = require('../app/core.hub')(Tc.validAdminConfig);
  Utility = require('../app/utility.api')(plz);
  db = Utility.db;

  describe('plz.create.user()', function () {

    before(function (done) {
      db.getDatabase(function (error, database) {
        database.collection('user').count(function(error, count) {
          if(count >= 1) {
            database.collection('user').drop(function () {
              done();
            });
          } else {
            done();
          }
        });
      });
    });

    it('should insert a user with required fields present', function(done) {
      plz.create.user(Tc.validUser, function (error) {
        error.should.be.false;
        done();
      });
    });

    it('should return error if required fields are missing', function(done) {
      plz.create.user(Tc.invalidUser, function (error) {
        error.should.be.true;
        done();
      });
    });


    it('should not insert a user that already exists', function(done) {
      plz.create.user(Tc.validUser, function (error) {
        error.should.be.true;
        done();
      });
    });

    after(function (done) {
      db.getDatabase(function (error, database) {
        database.collection('user').drop(function () {
          done();
        });
      });
    });

  });

  describe('plz.get.user()', function () {

    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAdminConfig);

      plz.create.user(Tc.validUser, function () {
        done();
      });
    });

    it('should find a user that exists', function (done) {
      plz.get.user({name: 'greg'}, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;
        done();
      });
    });

    it('should return an empty array if user does not exist', function (done) {
      plz.get.user({name: 'zanzabar'}, function (error, result) {
        error.should.be.false;
        result.should.be.eql([]);
        done();
      });
    });

    after(function (done) {
      db.getDatabase(function (error, database) {
        database.collection('user').drop(function () {
          done();
        });
      });
    });

  });

  describe('plz.remove.user()', function () {

    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAdminConfig);

      plz.create.user(Tc.validUser, function () {
        done();
      });
    });

    it('should remove a user that exists', function (done) {
      plz.remove.user({name: 'greg'}, function (error, res) {
        error.should.be.false;
        res.result.n.should.equal(1);
        done();
      });
    });

    it('should return error if user does not exist', function (done) {
      plz.remove.user({name: 'doppio'}, function (error, res) {
        error.should.be.false;
        res.result.n.should.equal(0);
        done();
      });
    });

    after(function (done) {
      db.getDatabase(function (error, database) {
        database.collection('user').drop(function () {
          done();
        });
      });
    });

  });

  describe('plz.edit.user()', function () {

    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAdminConfig);

      plz.create.user(Tc.validUser, function () {
        done();
      });
    });

    it('should edit a user that exists', function (done) {
      var options = {
        criteria: {
          name: 'greg'
        },
        update: {
          name: 'doppio'
        }
      };

      plz.get.user({name: 'greg'}, function (error, result) {
        error.should.be.false;
        result[0].name.should.equal('greg');

        plz.edit.user(options, function (error, result) {
          error.should.be.false;
          result.lastErrorObject.updatedExisting.should.be.true;

          plz.get.user({name: 'doppio'}, function (error, result) {
            result[0].name.should.equal('doppio');
            done();
          });
        });
      });
    });

    it('should return an empty result if user does not exist', function (done) {
      plz.get.user({name: 'greg'}, function (error, result) {
        error.should.be.false;
        result.should.eql([]);
        done();
      });
    });

    after(function (done) {
      db.getDatabase(function (error, database) {
        database.collection('user').drop(function () {
          done();
        });
      });
    });

  });

  describe('plz.restrict.user()', function () {
    var user;

    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAdminConfig);

      plz.create.user(Tc.validUser, function (error, result) {
        user = result.ops[0];
        done();
      });
    });

    it('should return true if a user has access', function (done) {
      var options = {
        user: user,
        roles: ['peasant', 'peon']
      };

      plz.restrict.user(options, function (error, access) {
        error.should.be.false;
        access.should.be.true;
        done();
      });
    });

    it('should return false if a user does not have access', function (done) {
      var options = {
        user: user,
        roles: ['admin']
      };

      plz.restrict.user(options, function (error, access) {
        error.should.be.false;
        access.should.be.false;
        done();
      });
    });

    after(function (done) {
      db.getDatabase(function (error, database) {
        database.collection('user').drop(function () {
          done();
        });
      });
    });

  });

  describe('plz.allow.user()', function () {
    var user;

    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAdminConfig);

      plz.create.user(Tc.validUser, function (error, result) {
        user = result.ops[0];
        done();
      });
    });

    it('should return true if a user has access', function (done) {
      var options = {
        user: user,
        roles: ['admin']
      };

      plz.allow.user(options, function (error, access) {
        error.should.be.false;
        access.should.be.true;
        done();
      });
    });

    it('should return false if a user does not have access', function (done) {
      var options = {
        user: user,
        roles: ['super-admin']
      };

      plz.allow.user(options, function (error, access) {
        error.should.be.false;
        access.should.be.false;
        done();
      });
    });

    after(function (done) {
      db.getDatabase(function (error, database) {
        database.collection('user').drop(function () {
          done();
        });
      });
    });

  });

});

