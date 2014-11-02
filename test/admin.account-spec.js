'use strict';

require('should');

var Tc = require('./test-config');
var Crypto = require('crypto');

var plz = require('../app/core.hub')(Tc.validAdminConfig),
    Utility = require('../app/utility.api')(plz),
    database = Utility.db;

describe('admin.account | Public API', function () {
  describe('plz.login.user()', function () {
    before(function (done) {
      plz.create.user(Tc.validUser, function () {
        done();
      });
    });
     
    it('should return a user with matching email/password', function (done) {
      var login = {
        email: 'sender@example.com',
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
        email: 'sender@example.com',
        password: 'someWrongPass0'
      };

      plz.login.user(login, function (error, result) {
        error.should.be.true;
        result.should.be.type('string');
        done();
      });
    });

    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
      });
    });
  });

  describe('plz.send.activation()', function () {
    var Crypto = require('crypto');
    var _user;

    before(function (done) {
      plz.create.user(Tc.validUser, function (error, user) {
        _user = user.ops[0];
        done();
      });
    });

    it('should prepare a user for activation via email', function (done) {
      var hash = Crypto.createHash('sha256');
      hash.update('#|');
      hash = hash.digest('hex');

      var options = {
        user: _user,
        subject: 'Activation Link',
        body: '<p>activation hash: ' + hash + '</p>',
        hash: hash
      };

      /*
      * NOTE: Mailing is not tested, only modifications made to the user in 
      * preparation for sending.
      */
      plz.send.activation(options, function (error, result) {
        error.should.be.true;
        result.should.eql('Mail not sent');
       
        plz.get.user({email: options.user.email}, function (error, result) {
          error.should.be.false;
          result.tempAuth.should.eql(hash);
          result.status.should.eql('activation-pending');

          done();
        });
      });
    });

    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
      });
    });
  });

  describe('plz.send.reset()', function () {
    var _user;

    before(function (done) {
      plz.create.user(Tc.validUser, function (error, user) {
        _user = user.ops[0];
        done();
      });
    });

    it('should prepare a user for password reset via email', function (done) {
      var hash = Crypto.createHash('sha256');
      hash.update('#|');
      hash = hash.digest('hex');

      var options = {
        user: _user,
        subject: 'Activation Link',
        body: '<p>activation hash: ' + hash + '</p>',
        hash: hash
      };

      /*
      * Note: Mailing is not tested, only modifications made to the user in 
      * preparation for sending.
      */
      plz.send.reset(options, function (error, result) {
        error.should.be.true;
        result.should.eql('Mail not sent');
       
        plz.get.user({email: options.user.email}, function (error, result) {
          error.should.be.false;
          result.tempAuth.should.eql(hash);
          result.status.should.eql('reset-pending');

          done();
        });
      });
    });

    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
      });
    });
  });

  describe('plz.authorize.activation()', function () {
    var _user;

    before(function (done) {
      plz.create.user(Tc.validUser, function (error, result) {
        _user = result.ops[0];

        var hash = Crypto.createHash('sha256');
        hash.update('#|');
        hash = hash.digest('hex');

        var options = {
          user: _user,
          subject: 'Activation Link',
          body: '<p>activation hash: ' + hash + '</p>',
          hash: hash
        };

        plz.send.activation(options, function () {
          plz.get.user({email: options.user.email}, function (error, user) {
            _user = user;
            done();
          });
        });
      });
    });

    it('should return true if activation hash is valid', function (done) {
      var options = {
        email: _user.email,
        hash: _user.tempAuth
      };

      plz.authorize.activation(options, function (error, result) {
        error.should.be.false;
        result.should.be.true;
        done();
      });
    });

    it('should return false if activation hash is invalid', function (done) {
      var options = {
        email: _user.email,
        hash: '0000000000000001111abcdef'
      };

      plz.authorize.activation(options, function (error, result) {
        error.should.be.true;
        result.should.be.false;
        done();
      });
    });

    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
      });
    });
  });

  describe('plz.authorize.reset()', function () {
    var _user;

    before(function (done) {
      plz.create.user(Tc.validUser, function (error, result) {
        _user = result.ops[0];

        var hash = Crypto.createHash('sha256');
        hash.update('#|');
        hash = hash.digest('hex');

        var options = {
          user: _user,
          subject: 'Activation Link',
          body: '<p>activation hash: ' + hash + '</p>',
          hash: hash
        };

        plz.send.reset(options, function () {
          plz.get.user({email: options.user.email}, function (error, user) {
            _user = user;
            done();
          });
        });
      });
    });

    it('should return true if activation hash is valid', function (done) {
      var options = {
        email: _user.email,
        hash: _user.tempAuth
      };

      plz.authorize.reset(options, function (error, result) {
        error.should.be.false;
        result.should.be.true;
        done();
      });
    });

    it('should return false if activation hash is invalid', function (done) {
      var options = {
        email: _user.email,
        hash: '0000000000000001111abcdef'
      };

      plz.authorize.activation(options, function (error, result) {
        error.should.be.true;
        result.should.be.false;
        done();
      });
    });    

    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
      });
    });
  });

  describe('plz.complete.activation()', function () {
    var _user,
        _options;

    before(function (done) {
      plz.create.user(Tc.validUser, function (error, result) {
        _user = result.ops[0];

        var hash = Crypto.createHash('sha256');
        hash.update('#|');
        hash = hash.digest('hex');

        _options = {
          user: _user,
          subject: 'Activation Link',
          body: '<p>activation hash: ' + hash + '</p>',
          hash: hash
        };

        plz.send.reset(_options, function () {
          plz.get.user({email: _options.user.email}, function (error, user) {
            _user = user;
            done();
          });
        });
      });
    });

    it('should reject non-matching passwords', function (done) {
      _options = {
        email: 'sender@example.com',
        passwordNew: 'someFakePass0',
        passwordConfirm: 'someFakePass1',
        hash: _user.tempAuth
      };

      plz.complete.activation(_options, function (error, result) {
        error.should.be.true;    
        result.should.be.type('string');

        done();
      });
    });

    it('should reject non-complex passwords', function (done) {
      _options = {
        email: 'sender@example.com',
        passwordNew: 'password',
        passwordConfirm: 'password',
        hash: _user.tempAuth
      };

      plz.complete.activation(_options, function (error, result) {
        error.should.be.true;    
        result.should.be.type('string');

        done();
      });
    });

    it('should set a user as activated and update password', function (done) {
       _options = {
        email: 'sender@example.com',
        passwordNew: 'someFakePass0',
        passwordConfirm: 'someFakePass0',
        hash: _user.tempAuth
      };

      plz.complete.activation(_options, function (error, result) {
        error.should.be.false;    
        result.should.be.type('object');

        done();
      });
    
    });

    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
      });
    });
  });

  describe('plz.complete.reset()', function () {
    var _user,
        _options;

    before(function (done) {
      plz.create.user(Tc.validUser, function (error, result) {
        _user = result.ops[0];

        var hash = Crypto.createHash('sha256');
        hash.update('#|');
        hash = hash.digest('hex');

        _options = {
          user: _user,
          subject: 'Activation Link',
          body: '<p>activation hash: ' + hash + '</p>',
          hash: hash
        };

        plz.send.reset(_options, function () {
          plz.get.user({email: _options.user.email}, function (error, user) {
            _user = user;
            done();
          });
        });
      });
    });

    it('should reject non-matching passwords', function (done) {
      _options = {
        email: 'sender@example.com',
        passwordNew: 'someFakePass0',
        passwordConfirm: 'someFakePass1',
        hash: _user.tempAuth
      };

      plz.complete.reset(_options, function (error, result) {
        error.should.be.true;    
        result.should.be.type('string');

        done();
      });
    });

    it('should reject non-complex passwords', function (done) {
      _options = {
        email: 'sender@example.com',
        passwordNew: 'password',
        passwordConfirm: 'password',
        hash: _user.tempAuth
      };

      plz.complete.reset(_options, function (error, result) {
        error.should.be.true;    
        result.should.be.type('string');

        done();
      });
    });

    it('should revert user status to active and update password', 
      function (done) {
       _options = {
        email: 'sender@example.com',
        passwordNew: 'someFakePass0',
        passwordConfirm: 'someFakePass0',
        hash: _user.tempAuth
      };

      plz.complete.reset(_options, function (error, result) {
        error.should.be.false;    
        result.should.be.type('object');

        done();
      });
    });
    
    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
      });
    });
  });
});
