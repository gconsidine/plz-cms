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
  var plz = require('../app/core.hub')(Tc.validAdminConfig),
      db = require('../app/utility.database')(plz);

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

        // password should be stripped from user before return to client.
        for(var i = 0; i < result.length; i++) {
          result[i].password.hasOwnProperty('password').should.be.false;
        }

        done();
      });
    });

    it('should return an empty array if user does not exist', function (done) {
      plz.get.user({name: 'zanzabar'}, function (error, result) {
        error.should.be.false;
        result.data.should.be.eql([]);
        done();
      });
    });

    it('should callback error JSON if database fails', function (done) {
      var database = {
        getDocument: function (query, callback) { 
          callback(true, { ok: false, message: 'Mocked Failure', data: null });
        }
      };

      require('../app/admin.user')(plz, database); 

      plz.get.user({name: 'zanzabar'}, function (error, result) {
        error.should.be.true;
        result.should.be.an.Object;
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
      plz.remove.user({name: 'greg'}, function (error, result) {
        error.should.be.false;
        result.data.ok.should.equal(1);
        result.data.n.should.equal(1);
        done();
      });
    });

    it('should return error if user does not exist', function (done) {
      plz.remove.user({name: 'doppio'}, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        (result.data === null).should.be.true;
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
        result.data[0].name.should.equal('greg');

        plz.edit.user(options, function (error, result) {
          error.should.be.false;
          result.data.updatedExisting.should.be.true;
          result.data.n.should.be.equal(1);

          plz.get.user({name: 'doppio'}, function (error, result) {
            result.data[0].name.should.equal('doppio');
            done();
          });
        });
      });
    });

    it('should return an error result if user does not exist', function (done) {
      plz.edit.user({email: 'majora@maskshop.com'}, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        (result.data === null).should.be.true;
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

describe('admin.user | Private API', function () {
  var plz = {
    config: {
      admin: {
        roles: {
          user: true
        },
        required: {
          email: 'string'
        }
      }
    },
  };

  var adminUser = require('../app/admin.user')(plz);

  describe('prepareUserCreation()', function () {
    it('should callback an error if required role is not present', function (done) {
      var options = {
        role: 'prince-of-amber'
      };

      adminUser.prepareUserCreation(options, function (error, message) {
        error.should.be.true;
        message.should.be.a.String;
        done();
      });
    });

    it('should callback an error if required type is not valid', function (done) {
      var options = {
        role: 'user',
        email: 1000
      };

      // Mock validation
      plz.validate = {
        typeAs: function () { return false; }
      };

      adminUser.prepareUserCreation(options, function (error, message) {
        error.should.be.true;
        message.should.be.a.String;
        done();
      });
    });
  });
});
