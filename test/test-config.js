var TestConfig = function () {
  'use strict';
  
  var MONGO_URI = 'mongodb://127.0.0.1:27017/test';
 
  var validCoreConfig = {
    modules: {
    },
    database: {
      default: {
        uri: MONGO_URI
      },
      other: {
        uri: MONGO_URI
      }
    },
    mailer: {
      default: {
        service: '',
        address: 'sender@example.com',
        password: '' 
      },
      other: {
        service: '',
        address: 'other@example.com',
        password: '' 
      }
    }
  };

  var invalidCoreConfig = {
    modules: {
    }, 
    database: {
      notDefault: 'mongo://'
    },
    mailer: {
    }
  };

  var invalidDatabase = {
    modules: {
    },
    database: {
      default: {
        uri: 'mongodb://127.1.1.1:1111/test'
      }
    },
    mailer: {
      default: {
        service: '',
        address: 'sender@example.com',
        password: ''
      }
    }
  };

 
  return {
    validCoreConfig: validCoreConfig,
    invalidCoreConfig: invalidCoreConfig,
    invalidDatabase: invalidDatabase
  };
};

module.exports = TestConfig();
