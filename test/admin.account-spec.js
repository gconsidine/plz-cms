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

      require('../app/admin.account')(plz, mockDatabase);

      plz.login.user({}, function (error) {
        error.should.be.true;
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
        result.data[0].password.should.equal(login.password.current);
        done();
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
        error.should.be.true;
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
    var _user;

    before(function (done) {
      plz.create.user(Tc.validUser, function (error, result) {
        _user = result.data[0];
        done();
      });
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

    afterEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
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
      plz.create.user(Tc.validUser, function (error, result) {
        _user = result.data[0];
        done();
      });
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

    afterEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
    });

    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
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
  var account, plz, mailer, database, mockDatabase, mockMailer;

  describe('sendLink()', function () {
    beforeEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
      database = require('../app/utility.database')(plz);
      mailer = require('../app/utility.mailer')(plz);

      mockDatabase = {};
      mockMailer = {};
    });

    it('should callback an error if db editDocument fails', function (done) {
      mockDatabase.editDocument = function (query, callback) {
        callback(true, 'Mock failure');
      };

      account = require('../app/admin.account')(plz, mockDatabase);

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

    it('should callback an error if mailer fails', function (done) {
      mockDatabase.editDocument = function (query, callback) {
        callback(false, 'Mock DB Success');
      };

      mockMailer.sendMail = function (options, callback) {
        callback(true, 'Mock mail Failure');
      };

      account = require('../app/admin.account')(plz, mockDatabase);

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
      mockDatabase.editDocument = function (query, callback) {
        callback(false, 'Mock DB success');
      };

      mockMailer.sendMail = function (options, callback) {
        callback(false, 'Mock mailer success');
      };

      account = require('../app/admin.account')(plz, mockDatabase, mockMailer);

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
      database = require('../app/utility.database')(plz);
      mockDatabase = {};
    });

    it('should callback an error if db getDocument fails', function (done) {
      mockDatabase.getDocument = function (query, callback) {
        callback(true, 'mock failure');
      };

      account = require('../app/admin.account')(plz, mockDatabase);

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

    it('should callback an error if result is empty', function (done) {
      mockDatabase.getDocument = function (query, callback) {
        callback(true, []);
      };

      account = require('../app/admin.account')(plz, mockDatabase);

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

    it('should callback success if result is present', function (done) {
      mockDatabase.getDocument = function (query, callback) {
        callback(false, [{email: 'majora@mask.com'}]);
      };

      account = require('../app/admin.account')(plz, mockDatabase);

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
    beforeEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
      database = require('../app/utility.database')(plz);
      mockDatabase = {};
    });

    it('should callback an error if password options are invalid', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        password: ''
      };

      account = require('../app/admin.account')(plz);

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
          hash: 'none'
        }
      };

      account = require('../app/admin.account')(plz);

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
          new: 'password',
          confirm: 'passwordOopsies',
          hash: 'none'
        }
      };

      account = require('../app/admin.account')(plz);

      account.completeAction(options, function (error, result) {
        error.should.be.true;
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

      mockDatabase.editDocument = function (query, callback) {
        callback(false, query);
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      account.completeAction(options, function (error, result) {
        (/^[a-f0-9]{64}$/i.test(result.data.update.$set.password)).should.be.true;
        done();
      });
    });

    it('should callback an error if database editDocument fails', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        password: { 
          new: 'WAoS0Compl3x',
          confirm: 'WAoS0Compl3x',
          hash: 'none'
        }
      };

      mockDatabase.editDocument = function (query, callback) {
        callback(true, 'Mock failure');
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      account.completeAction(options, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });

    it('should callback an error if document was not edited', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        password: { 
          new: 'WAoS0Compl3x',
          confirm: 'WAoS0Compl3x',
          hash: 'none'
        }
      };

      mockDatabase.editDocument = function (query, callback) {
        callback(true, 'mock failure');
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      account.completeAction(options, function (error, result) {
        error.should.be.true;
        result.ok.should.be.false;
        done();
      });
    });

    it('should callback true if editDocument succeeds', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        password: { 
          new: 'WAoS0Compl3x',
          confirm: 'WAoS0Compl3x',
          hash: 'none'
        }
      };

      mockDatabase.editDocument = function (query, callback) {
        callback(false, {value: [{ email: 'brand@jelly.com'}], ok: 1 });
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      account.completeAction(options, function (error, result) {
        error.should.be.false;
        result.ok.should.be.true;
        done();
      });
    });
  });
});
