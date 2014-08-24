(function () {
  'use strict';

  require('should');

  var Fs = require('fs'),
      Path = require('path'),
      Parse = require('../app/cli.parse')(__dirname);
  
  var _shorthand = {
    "configuration": {
      "database":     "MongoDB",
      "databaseName": "roleplayDatabase",
      "store":        true,
      "storeType":    "Redis",
      "storeName":    "roleplayStore",
      "https":        false,
      "explict":      false,
      "shorthand":    true
    },

    "roles": ["super-admin", "admin", "author"],

    "access": {
      "/": {
        "read": ["ALL"]
      },
      "/api/v1/***": {
        "CRUD": ["ALL"]
      },
      "/api/v1/user": {
        "CRUD": [0, 1]
      },
      "/api/v1/admin": {
        "create": [0],
        "read":   [0, 1],
        "update": [0],
        "delete": [0]
      }
    }
  };

  var _longhand = {
    "configuration": {
      "database":     "MongoDB",
      "databaseName": "roleplayDatabase",
      "store":        true,
      "storeType":    "Redis",
      "storeName":    "roleplayStore",
      "https":        false,
      "explict":      false,
      "shorthand":    false
    },

    "roles": ["super-admin", "admin", "author"],

    "access": {
      "/": {
        "read": ["ALL"]
      },
      "/api/v1/***": {
        "CRUD": ["ALL"]
      },
      "/api/v1/user": {
        "CRUD": ["super-admin", "admin"]
      },
      "/api/v1/admin": {
        "create": ["super-admin"],
        "read":   ["super-admin", "admin"],
        "update": ["super-admin"],
        "delete": ["super-admin"]
      }
    }
  };
  
  describe('cli.parse | roleplay.json location:', function () {
    var path = __dirname + '/roleplay.json',
        content = JSON.stringify(_longhand),
        options = { encoding: 'utf-8' };
       
    before(function (done) {
      Fs.writeFileSync(path, content, options, function () {});
      done();
    });
   
    it('should find roleplay.json', function (done) {
      Parse.getLocation(function (filename, error) {
        error.should.be.false;
        filename.should.be.exactly(Path.join(__dirname, 'roleplay.json'));
        done();
      });
    });
    
    it('should get contents of roleplay.json', function (done) {
      Parse.getJsonContent(function (data, error) {
        error.should.be.false;
        data.should.be.json;
        done();
      });
    });

    after(function () {
      Fs.unlinkSync(path);
    });

  });

  describe('cli.parse | roleplay.json normalization:', function () {
    var path = __dirname + '/roleplay.json',
        longContent = JSON.stringify(_longhand),
        shortContent = JSON.stringify(_shorthand),
        content = [longContent, shortContent],
        options = { encoding: 'utf-8' },
        longhandJson,
        shorthandJson,
        i = 0;

    beforeEach(function () {
      Fs.writeFileSync(path, content[i], options, function () {});
      i++;
    });
    

    it('should normalize longhand JSON', function (done) {
      Parse.normalizeJson(function (json, error) {
        error.should.be.not.ok;
        json.should.be.type('object');
        longhandJson = json;  
        done();
      });
    });

    it('should normalize shorthand JSON', function (done) {
      Parse.normalizeJson(function (json, error) {
        error.should.be.false;
        json.should.be.type('object');
        shorthandJson = json;  
        done();
      });
    });

    it('should verify normalized content is equal', function () {
      var short = JSON.stringify(shorthandJson.access),
          long = JSON.stringify(longhandJson.access);

      shorthandJson.should.be.an.Object;
      longhandJson.should.be.an.Object;
      
      short.length.should.be.exactly(long.length);
    });

    after(function () {
      Fs.unlinkSync(path);
    });

  });

}());
