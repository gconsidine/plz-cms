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

  var validAdminConfig = {
    modules: {
      admin: true
    },
    database: {
      default: {
        uri: MONGO_URI
      }
    },
    mailer: {
      default: {
        service: '',
        address: 'sender@example.com',
        password: ''
      }
    },
    admin: {
      collection: 'user',
      roles: {
        admin: true,
        user: true
      },
      required: {
        name: 'string',
        email: 'email',
        status: 'string'
      }
    }
  };

  var invalidAdminConfig = {
    modules: {
      admin: true
    },
    database: {
      default: {
        uri: MONGO_URI
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

  var validUser = {
    name: 'greg',
    email: 'sender@example.com',
    password: 'someFakePass0',
    createdAt: 3134999944,
    modifiedAt: 3134999945,
    lastLogin: 0,
    status: 'active',
    role: 'admin'
  };

  var invalidUser = {
    name: 'greg',
    email: 'sender@exmaple.com',
    password: 'someFakePass0',
    createdAt: 3134999944,
    modifiedAt: 3134999945,
    role: 'admin'
  };
  
  return {
    validCoreConfig: validCoreConfig,
    invalidCoreConfig: invalidCoreConfig,
    validAdminConfig: validAdminConfig,
    invalidAdminConfig: invalidAdminConfig,
    validUser: validUser,
    invalidUser: invalidUser,
    invalidDatabase: invalidDatabase
  };
};

module.exports = TestConfig();
