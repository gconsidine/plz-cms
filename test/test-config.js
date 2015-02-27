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
      page: {
        collection: 'page',
        required: {
          userName: 'string',
          title: 'string',
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
          title: 'string',
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
    title: 'Simple plz-cms page',
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
    title: 'Another plz-cms page',
    labels: ['mainmenu'],
    visibility: 'public',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft',
    contentType: 'text/plain',
    content: 'Some different content'
  };

  var invalidPage = {
    title: 'invalid options',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft'
  };

  var validPost = {
    userName: 'chahm',
    title: 'Simple post',
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
    title: 'Simple post 2',
    labels: ['news'],
    visibility: 'public',
    createdAt: 3135000000,
    modifiedAt: 3135000000,
    status: 'draft',
    contentType: 'text/plain',
    content: 'some more text'
  };

  var invalidPost = {
    title: 'invalid options',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft'
  };

  return {
    validCoreConfig: validCoreConfig,
    invalidCoreConfig: invalidCoreConfig,
    validAuthorConfig: validAuthorConfig,
    invalidAuthorConfig: invalidAuthorConfig,
    validPage: validPage,
    anotherValidPage: anotherValidPage,
    invalidPage: invalidPage,
    validPost: validPost,
    anotherValidPost: anotherValidPost,
    invalidPost: invalidPost,
    invalidDatabase: invalidDatabase
  };
};

module.exports = TestConfig();
