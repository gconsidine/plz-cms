'use strict';

require('should');

var Tc = require('./test-config');

var plz = require('../app/core.hub')(Tc.validAdminConfig),
    database = require('../app/utility.database')(plz);

describe('admin.account | Public API', function () {
  describe('plz.login.user()', function () {
    before(function (done) {
      plz.create.user(Tc.validUser, function () {
        done();
      });
    });

    it('should callback an error if getDocument fails', function (done) {
      var mockDatabase = {};

      mockDatabase.getDocument = function (query, callback) {
        callback(true, 'Mock failure');
      };

      require('../app/admin.user')(plz, mockDatabase);

      var login = {
        email: 'sender@example.com',
        password: {
          current: 'someFakePass0',
          hash: 'none'
        }
      };
      plz.login.user(login, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        result.message.should.equal('Mock failure');
        done();
      });
    });

    it('should callback if options.password object is invalid', function (done) {
      var options = {
        password: 'so invalid.'
      };

      plz.login.user(options, function (error, result) {
        error.should.be.true;
        result.ok.should.not.be.ok;
        done();
      });
    });

    it('should return a user with matching email/password', function (done) {
      var login = {
        email: 'sender@example.com',
        password: {
          current: 'someFakePass0',
          hash: 'none'
        }
      };

      plz.login.user(login, function (error, result) {
        error.should.be.false;
        result.data[0].should.be.an.Object;
        (!result.data[0].password).should.be.true;
        done();
      });
    });

    it('should return a user with matching email/password hash', function (done) {
      var crypto = require('crypto');
      var password_sha256 = crypto.createHash('sha256')
                                  .update('someFakePass0')
                                  .digest('hex');
      var options = {
        criteria: {
          email: 'sender@example.com'
        },
        update: {
          password: password_sha256
        }
      };

      plz.edit.user(options, function (error, result) {
        error.should.be.false;
        result.should.not.equal(null);

        var login = {
          email: 'sender@example.com',
          password: {
            current: 'someFakePass0',
            hash: 'sha256'
          }
        };

        plz.login.user(login, function (error, result) {
          error.should.be.false;
          result.data[0].should.be.an.Object;
          (!result.data[0].password).should.be.true;
          done();
        });
      });
    });

    it('should callback an error if no match is found', function (done) {
      var login = {
        email: 'sender@example.com',
        password: {
          current: 'someWrongPass0',
          hash: 'none'
        }
      };

      plz.login.user(login, function (error, result) {
        error.should.be.false;
        result.ok.should.not.be.ok;
        done();
      });
    });

    afterEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
      database = require('../app/utility.database')(plz);
    });

    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
      });
    });
  });

  describe('plz.send.activation()', function () {
    before(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
    });

    it('should callback false and JSON on error', function (done) {
      var adminAccount = require('../app/admin.account')(plz);

      adminAccount.sendLink = function (options, callback) {
        callback(true, 'Mock Failure');
      };

      var options = {};

      plz.send.activation(options, function (error, result) {
        options.status.should.be.ok;
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });

    it('should callback true and JSON on send success', function (done) {
      var adminAccount = require('../app/admin.account')(plz);

      adminAccount.sendLink = function (options, callback) {
        callback(false, 'Mock Success');
      };

      var options = {};

      plz.send.activation(options, function (error, result) {
        options.status.should.be.ok;
        error.should.be.false;
        result.ok.should.be.true;
        done();
      });
    });
  });

  describe('plz.prep.reset()', function () {
    before(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
    });

    it('should callback false and JSON on reset failure', function (done) {
      require('../app/admin.account')(plz);

      plz.get = {
        user: function (options, callback) {
          callback(true, 'Mock failure');
        }
      };

      var options = {};

      plz.prep.reset(options, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should callback false and JSON if result is empty', function (done) {
      require('../app/admin.account')(plz);

      plz.get = {
        user: function (options, callback) {
          callback(false, {data: []});
        }
      };

      var options = {};

      plz.prep.reset(options, function (error, result) {
        result.ok.should.not.be.ok;
        error.should.be.false;
        done();
      });
    });

    it('should edit a user on successful get user operation', function (done) {
      require('../app/admin.account')(plz);

      var options = {};

      plz.get = {
        user: function (options, callback) {
          callback(false, {data: [{tempAuth: 'mockedTempAuth'}]});
        }
      };

      plz.edit = {
        user: function (options, callback) {
          callback(true, {ok: false});
        }
      };

      plz.prep.reset(options, function (error, result) {
        result.ok.should.be.false;
        error.should.be.true;
        done();
      });
    });

    it('should edit a user on successful get user operation', function (done) {
      require('../app/admin.account')(plz);

      var options = {};

      plz.get = {
        user: function (options, callback) {
          callback(false, {data: [{tempAuth: 'mockedTempAuth'}]});
        }
      };

      plz.edit = {
        user: function (options, callback) {
          callback(false, {ok: true});
        }
      };

      plz.prep.reset(options, function (error, result) {
        result.ok.should.be.true;
        error.should.be.false;
        done();
      });
    });

  });

  describe('plz.send.reset()', function () {
    before(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
    });

    it('should callback false and JSON on reset failure', function (done) {
      var adminAccount = require('../app/admin.account')(plz);

      adminAccount.sendLink = function (options, callback) {
        callback(true, 'Mock failure');
      };

      var options = {};

      plz.send.reset(options, function (error, result) {
        options.status.should.be.ok;
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });

    it('should callback true and JSON on reset success', function (done) {
      var adminAccount = require('../app/admin.account')(plz);

      adminAccount.sendLink = function (options, callback) {
        callback(false, 'Mock Success');
      };

      var options = {};

      plz.send.reset(options, function (error, result) {
        options.status.should.be.ok;
        error.should.be.false;
        result.ok.should.be.true;
        done();
      });
    });
  });

  describe('plz.restrict.user()', function () {
    before(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
    });

    it('should restrict user to any role not passed and return JSON on success', function (done) {
      var options = {
        user: {
          email: 'tingle@oldpseudoelf.com',
          role: 'map-maker'
        },
        roles: ['peasant', 'peon']
      };

      plz.restrict.user(options, function (error, result) {
        error.should.be.false;
        result.ok.should.be.true;
        done();
      });
    });

    it('should restrict user to any role not passed and return JSON on error', function (done) {
      var options = {
        user: {
          email: 'tingle@oldpseudoelf.com',
          role: 'map-maker'
        },
        roles: ['map-maker']
      };

      plz.restrict.user(options, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });
  });

  describe('plz.allow.user()', function () {
    before(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
    });

    it('should allow user within roles passed and return JSON on success', function (done) {
      var options = {
        user: {
          email: 'tingle@oldpseudoelf.com',
          role: 'map-maker'
        },
        roles: ['map-maker']
      };

      plz.allow.user(options, function (error, result) {
        error.should.be.false;
        result.ok.should.be.true;
        done();
      });
    });

    it('should allow user within roles passed and return JSON on error', function (done) {
      var options = {
        user: {
          email: 'tingle@oldpseudoelf.com',
          role: 'map-maker'
        },
        roles: ['actual-elves']
      };

      plz.allow.user(options, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });
  });
});

describe('admin.account | Private API', function () {
  var account, plz, mailer, mockMailer;

  describe('sendLink()', function () {
    beforeEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
      mailer = require('../app/utility.mailer')(plz);

      mockMailer = {};
    });

    it('should callback an error if user edit fails', function (done) {
      plz.edit.user = function (query, callback) {
        callback(true, { ok: false, message: 'mock failure', data: null });
      };

      account = require('../app/admin.account')(plz);

      var options = {
        user: {
          email: 'merlin@sonofamberandchaos.com',
        },
        status: 'pending',
        hash: 'aaaaaaaaaaddddddddddfffffffffffffff001233'
      };
      
      account.sendLink(options, function (error, result) {
        error.should.be.true;
        result.ok.should.not.be.ok;
        done();
      });
    });

    it('should callback an error if mailer fails', function (done) {
      plz.edit.user = function (query, callback) {
        callback(false, { ok: true, message: 'mock success', data: [] });
      };

      mockMailer.sendMail = function (options, callback) {
        callback(true, 'Mock mail Failure');
      };

      account = require('../app/admin.account')(plz, mockMailer);

      var options = {
        user: {
          email: 'merlin@sonofamberandchaos.com',
        },
        status: 'pending',
        hash: 'aaaaaaaaaaddddddddddfffffffffffffff001233'
      };
      
      account.sendLink(options, function (error, result) {
        error.should.be.true;
        result.should.be.a.String;
        done();
      });
    });

    it('should callback result if mailer succeeds', function (done) {
      plz.edit.user = function (query, callback) {
        callback(false, { ok: true, message: 'mock success', data: [] });
      };

      mockMailer.sendMail = function (options, callback) {
        callback(false, 'Mock mailer success');
      };

      account = require('../app/admin.account')(plz, mockMailer);

      var options = {
        user: {
          email: 'merlin@sonofamberandchaos.com',
        },
        status: 'pending',
        hash: 'aaaaaaaaaaddddddddddfffffffffffffff001233',
        subject: 'Hi, Corwin',
        body: '...Are you really my father or is it some elaborate plot?'
      };
      
      account.sendLink(options, function (error, result) {
        error.should.be.false;
        result.should.be.a.String;
        done();
      });
    });
  });

  describe('authorize()', function () {
    beforeEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
      account = require('../app/admin.account')(plz);
    });

    it('should callback an error if db getDocument fails', function (done) {
      plz.get.user = function (query, callback) {
        callback(true, {ok: false, message: 'mock failure', data: null });
      };

      var options = {
        email: 'merlin@sonofamberandchaos.com',
        tempAuth: 'aaaaaaaaaaddddddddddfffffffffffffff001233'
      };
      
      account.authorize(options, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });

    it('should callback not ok if result is empty', function (done) {
      plz.get.user = function (query, callback) {
        callback(false, {ok: false, message: 'mock empty result', data: [] });
      };

      var options = {
        email: 'merlin@sonofamberandchaos.com',
        tempAuth: 'aaaaaaaaaaddddddddddfffffffffffffff001233'
      };
      
      account.authorize(options, function (error, result) {
        error.should.be.false;
        result.ok.should.be.false;
        done();
      });
    });

    it('should callback success if result is present', function (done) {
      plz.get.user = function (query, callback) {
        callback(false, { ok: true, message: 'mock success', data: [{email: 'majora@mask.com'}] });
      };

      var options = {
        email: 'merlin@sonofamberandchaos.com',
        tempAuth: 'aaaaaaaaaaddddddddddfffffffffffffff001233'
      };
      
      account.authorize(options, function (error, result) {
        error.should.be.false;
        result.ok.should.be.true;
        done();
      });
    });

  });

  describe('completeAction()', function () {
    before(function (done) {
      var testUser = Tc.validUser;
      testUser.email = 'merlin@sonofamberandchaos.com';
      testUser.password = 'password';
      plz.create.user(testUser, function () {
        done();
      });
    });
    beforeEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
      account = require('../app/admin.account')(plz);
    });

    it('should callback an error if password options are invalid', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        password: ''
      };

      account.completeAction(options, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });

    it('should callback error if password is not complex', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        password: {
          new: 'password',
          confirm: 'password',
          hash: 'md5'
        }
      };

      account.completeAction(options, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });

    it('should callback error if passwords do not match', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        password: {
          new: 'passwordFa09f9f!',
          confirm: 'passwordOopsies',
          hash: 'sha256'
        }
      };

      account.completeAction(options, function (error, result) {
        error.should.be.false;
        result.ok.should.be.false;
        done();
      });
    });

    it('should hash complex and matching passwords', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        password: {
          new: 'SuperD00per0--#C0mplexIss!',
          confirm: 'SuperD00per0--#C0mplexIss!',
          hash: 'sha256'
        }
      };

      plz.edit.user = function (query, callback) {
        callback(false, query);
      };

      account.completeAction(options, function (error, result) {
        (/^[a-f0-9]{64}$/i.test(result.update.password)).should.be.true;
        done();
      });
    });

    it('should callback an error if database edit user fails', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        password: { 
          new: 'WAoS0Compl3x',
          confirm: 'WAoS0Compl3x',
          hash: 'none'
        }
      };

      plz.edit.user = function (query, callback) {
        callback(true, { ok: false, message: 'mock failure', data: null });
      };

      account.completeAction(options, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });
  });
});
