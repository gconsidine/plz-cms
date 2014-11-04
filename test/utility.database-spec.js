'use strict';

require('should');

var Tc = require('./test-config');

describe('utility.database | Private API', function () {
  describe('createDocument()', function () {

    before(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      db.getDatabase(function (error, database) {
        database.collection('test').count(function(error, count) {
          if(count >= 1) {
            database.collection('test').drop(function () {
              done();
            });
          } else {
            done();
          }
        });
      });
    });

    it('should fail when required fields are not present', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      var options = {
        collectionName: 'test',
      };

      db.createDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    it('should fail when database cannot connect', function(done) {
      var plz = require('../app/core.hub')(Tc.invalidDatabase),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      var options = {
        collectionName: 'test',
        document: { testField: 'testValue' },
        uniqueFields: { zanzibar: true }
      };

      db.createDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    after(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      db.getDatabase(function (error, database) {
        database.collection('test').drop(function () {
          done();
        });
      });
    });
  });

  describe('editDocument()', function () {

    before(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      db.getDatabase(function (error, database) {
        database.collection('test').count(function(error, count) {
          if(count >= 1) {
            database.collection('test').drop(function () {
              done();
            });
          } else {
            done();
          }
        });
      });
    });

    it('should fail when required fields are not present', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      var options = {
        collectionName: 'test',
      };

      db.editDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    it('should fail when database cannot connect', function(done) {
      var plz = require('../app/core.hub')(Tc.invalidDatabase),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      var options = {
        collectionName: 'test',
        document: { testField: 'testValue' },
        uniqueFields: { zanzibar: true }
      };

      db.editDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    after(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      db.getDatabase(function (error, database) {
        database.collection('test').drop(function () {
          done();
        });
      });
    });
  });

  describe('getDocument()', function () {

    before(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      db.getDatabase(function (error, database) {
        database.collection('test').count(function(error, count) {
          if(count >= 1) {
            database.collection('test').drop(function () {
              done();
            });
          } else {
            done();
          }
        });
      });
    });

    it('should fail when required fields are not present', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      var options = {
        collectionName: 'test',
      };

      db.getDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    it('should fail when database cannot connect', function(done) {
      var plz = require('../app/core.hub')(Tc.invalidDatabase),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      var options = {
        collectionName: 'test',
        document: { testField: 'testValue' },
        uniqueFields: { zanzibar: true }
      };

      db.getDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    after(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      db.getDatabase(function (error, database) {
        database.collection('test').drop(function () {
          done();
        });
      });
    });
  });

  describe('removeDocument()', function () {

    before(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      db.getDatabase(function (error, database) {
        database.collection('test').count(function(error, count) {
          if(count >= 1) {
            database.collection('test').drop(function () {
              done();
            });
          } else {
            done();
          }
        });
      });
    });

    it('should fail when required fields are not present', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      var options = {
        collectionName: 'test',
      };

      db.removeDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    it('should fail when an invalid limit is provided', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      var options = {
        collectionName: 'test',
        criteria: {name: 'zanzibar'},
        limit: -1000
      };

      db.removeDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    it('should fail when database cannot connect', function(done) {
      var plz = require('../app/core.hub')(Tc.invalidDatabase),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      var options = {
        collectionName: 'test',
        document: { testField: 'testValue' },
        uniqueFields: { zanzibar: true }
      };

      db.removeDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    after(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      db.getDatabase(function (error, database) {
        database.collection('test').drop(function () {
          done();
        });
      });
    });
  });

  describe('getDatabase()', function () {
    var plz = require('../app/core.hub')(Tc.validCoreConfig),
        Utility = require('../app/utility.api')(plz),
        db = Utility.db;

    it('should throw when invalid db name is supplied', function() {
      (function () {
        db.getDatabase(function () {}, 'banana');
      }).should.throw();
    });

    it('should fail when database cannot connect', function(done) {
      var plz = require('../app/core.hub')(Tc.invalidDatabase),
          Utility = require('../app/utility.api')(plz),
          db = Utility.db;

      db.getDatabase(function (error, db) {
        error.should.be.true; 
        db.should.be.type('string');
        done();
      });
    });
  });

});
