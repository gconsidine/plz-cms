'use strict';

require('should');

var Tc = require('./test-config');

describe('utility.database | Private API', function () {
  describe('createDocument()', function () {

    before(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

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

    it('should fail when database cannot connect', function(done) {
      var plz = require('../app/core.hub')(Tc.invalidDatabase),
          db = require('../app/utility.database')(plz);

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

    it('should fail when uniqueFields is invalid', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        document: { testField: 'testValue' },
        uniqueFields: [ {$blah:''} ]
      };

      db.createDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    it('should fail when document has existing _id', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        document: { testField: 'testValue' },
        uniqueFields: { zanzibar: true }
      };

      db.createDocument(options, function (error, result) {
        error.should.be.false; 
        options.document._id = result.insertedId;
        db.createDocument(options, function (error, result) {
          error.should.be.true; 
          result.should.be.type('string');
          done();
        });
      });
    });

    after(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

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
          db = require('../app/utility.database')(plz);

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

    it('should fail when database cannot connect', function(done) {
      var plz = require('../app/core.hub')(Tc.invalidDatabase),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        criteria: { testField: 'testValue' },
        update: { zanzibar: true }
      };

      db.editDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    it('should fail with invalid criteria', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        criteria: [ {$blah:''} ],
        update: { zanzibar: true }
      };

      db.editDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    it('should return error when no documents were affected', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        criteria: { testField: 'stValue' },
        update: { zanzibar: true }
      };

      db.editDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    after(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

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
          db = require('../app/utility.database')(plz);

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

    it('should fail when database cannot connect', function(done) {
      var plz = require('../app/core.hub')(Tc.invalidDatabase),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        criteria: { testField: 'testValue' },
      };

      db.getDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    it('should return empty array when no documents match', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        criteria: { testField: 'testValue' },
      };

      db.getDocument(options, function (error, result) {
        error.should.be.false; 
        result.should.eql([]);
        done();
      });
    });

    it('should fail with invalid criteria', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        criteria: [ {$blah:''} ],
      };

      db.getDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    it('should find everything if no criteria or limit set', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test'
      };

      db.getDocument(options, function (error, result) {
        error.should.be.false; 
        result.should.be.eql([]);
        done();
      });
    });

    it('should find everything based on criteria and limit', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        criteria: { testField: 'testValue' },
        limit: 1
      };

      db.getDocument(options, function (error, result) {
        error.should.be.false; 
        result.should.be.eql([]);
        done();
      });
    });

    it('should find everything without criteria and with a set limit', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        limit: 1
      };

      db.getDocument(options, function (error, result) {
        error.should.be.false; 
        result.should.be.eql([]);
        done();
      });
    });

    after(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

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
          db = require('../app/utility.database')(plz);

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

    it('should fail when database cannot connect', function(done) {
      var plz = require('../app/core.hub')(Tc.invalidDatabase),
          db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        criteria: { testField: 'testValue' }
      };

      db.removeDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    it('should callback error when remove fails', function(done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig);
      var db = require('../app/utility.database')(plz);

      var options = {
        collectionName: 'test',
        criteria: { testField: 'testValue' }
      };

      db.getDatabase = function (callback) {
        var mockDatabase = {
          collection: function () {
            return {
              remove: function(selector, options, callback) {
                callback(true, 'Mocked failure');
              }
            };
          }
        };

        callback(false, mockDatabase);
      };

      db.removeDocument(options, function (error, result) {
        error.should.be.true; 
        result.should.be.type('string');
        done();
      });
    });

    after(function (done) {
      var plz = require('../app/core.hub')(Tc.validCoreConfig),
          db = require('../app/utility.database')(plz);

      db.getDatabase(function (error, database) {
        database.collection('test').drop(function () {
          done();
        });
      });
    });
  });

  describe('getDatabase()', function () {
    var plz = require('../app/core.hub')(Tc.validCoreConfig),
        db = require('../app/utility.database')(plz);

    it('should throw when invalid db name is supplied', function() {
      (function () {
        db.getDatabase(function () {}, 'banana');
      }).should.throw();
    });

    it('should be able to get other databases from the config', function(done) {
      db.getDatabase(function (error, db) {
        error.should.be.false; 
        db.should.be.type('object');
        done();
      }, 'other');
    });

    it('should fail when database cannot connect', function(done) {
      var plz = require('../app/core.hub')(Tc.invalidDatabase),
          db = require('../app/utility.database')(plz);

      db.getDatabase(function (error, db) {
        error.should.be.true; 
        db.should.be.type('string');
        done();
      });
    });
  });

});
