var ParseSpec = function () {
  
  var FileSystem = require('fs');
  var Parse = require('../app/cli.parse');

  var _json;

  function generateJson(type) {
    switch(type) {
      case 'shorthand-true':
        _json = generateShorthandTrue();
        break;
      case 'shorthand-false':
        _json = generateShorthandFalse();
        break;
    }
  }

  function generateShorthandFalse() {
    return {
      "configuration": {
        "database":     "MongoDB"
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
          "CRUD": ["ALL"],
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
  }

  function generateShorthandTrue() {
    return {
      "configuration": {
        "database":     "MongoDB"
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
          "CRUD": ["ALL"],
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
  }

};

module.exports = ParseSpec;
