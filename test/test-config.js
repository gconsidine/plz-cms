var TestConfig = function () {
  'use strict';
  
  var MONGO_URI = 'mongodb://127.0.0.1:27017/test';
 
  var validCoreConfig = {
    modules: {
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
        password: 'password',
        createdAt: 'number',
        modifiedAt: 'number',
        lastLogin: 'number',
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

  var validAuthorConfig = {
    modules: {
      admin: false,
      author: true
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
    author: {
      modules: {
        page: true,
        post: true
      },
      page: {
        collection: 'page',
        required: {
          userName: 'string',
          pageTitle: 'string',
          visibility: 'string',
          contentType: 'string',
          content: 'string',
          createdAt: 'number',
          modifiedAt: 'number',
          status: 'string'
        }
      },
      post: {
        collection: 'post',
        required: {
          userName: 'string',
          postTitle: 'string',
          visibility: 'string',
          contentType: 'string',
          content: 'string',
          createdAt: 'number',
          modifiedAt: 'number',
          status: 'string'
        }
      }
    }
  };

  var invalidAuthorConfig = {
    modules: {
      author: true
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

  var validPage = {
    userName: 'chahm',
    pageTitle: 'Simple plz-cms page',
    labels: ['mainmenu'],
    visibility: 'public',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft',
    contentType: 'text/plain',
    content: 'The text content'
  };

  var anotherValidPage = {
    userName: 'chahm',
    pageTitle: 'Another plz-cms page',
    labels: ['mainmenu'],
    visibility: 'public',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft',
    contentType: 'text/plain',
    content: 'Some different content'
  };

  var invalidPage = {
    pageTitle: 'invalid options',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft'
  };

  var validPost = {
    userName: 'chahm',
    postTitle: 'Simple post',
    labels: ['news'],
    visibility: 'public',
    createdAt: 3135000000,
    modifiedAt: 3135000000,
    status: 'draft',
    contentType: 'text/plain',
    content: 'some text'
  };

  var anotherValidPost = {
    userName: 'chahm',
    postTitle: 'Simple post 2',
    labels: ['news'],
    visibility: 'public',
    createdAt: 3135000000,
    modifiedAt: 3135000000,
    status: 'draft',
    contentType: 'text/plain',
    content: 'some more text'
  };

  var invalidPost = {
    postTitle: 'invalid options',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft'
  };

  var validUser = {
    name: 'greg',
    email: 'sender@example.com',
    password: 'someFakePass0',
    createdAt: 3134999944,
    modifiedAt: 3134999945,
    lastLogin: 0,
    status: 'created',
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
    validAuthorConfig: validAuthorConfig,
    invalidAuthorConfig: invalidAuthorConfig,
    validPage: validPage,
    anotherValidPage: anotherValidPage,
    invalidPage: invalidPage,
    validPost: validPost,
    anotherValidPost: anotherValidPost,
    invalidPost: invalidPost,
    validUser: validUser,
    invalidUser: invalidUser,
    invalidDatabase: invalidDatabase
  };
};

module.exports = TestConfig();
