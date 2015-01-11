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

  var validMerchantConfig = {
    modules: {
      admin: false,
      author: false,
      merchant: true
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
    merchant: {
      product: {
        collection: 'product',
        required: {
          userName: 'string',
          name: 'string',
          price: 'currency',
          imageFile: 'string',
          description: 'string',
          visibility: 'string',
          createdAt: 'number',
          modifiedAt: 'number',
          status: 'string'
        }
      },
    }
  };

  var invalidMerchantConfig = {
    modules: {
      merchant: true
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
  }
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
  
  var validProduct = {
    userName: 'chahm',
    name: 'Acme 16-oz Claw Hammer',
    labels: ['tools'],
    price: '$9.99',
    imageFile: 'images/acme/claw_hammer.png',
    description: '* Acme\'s most popular hammer\n' +
      '* Excellent durability\n' +
      '* Comfortable grip',
    visibility: 'public',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft'
  };

  var anotherValidProduct = {
    userName: 'chahm',
    name: 'Acme Phillips Screwdriver',
    labels: ['tools'],
    price: '$8.99',
    imageFile: 'images/acme/phillips_screwdriver.png',
    description: '* Acme\'s most popular screwdriver\n' +
      '* Comfortable grip allows maximum torque',
    visibility: 'public',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft'
  };

  var invalidProduct = {
    name: 'invalid product'
  }

  return {
    validCoreConfig: validCoreConfig,
    invalidCoreConfig: invalidCoreConfig,
    validAdminConfig: validAdminConfig,
    invalidAdminConfig: invalidAdminConfig,
    validAuthorConfig: validAuthorConfig,
    invalidAuthorConfig: invalidAuthorConfig,
    validMerchantConfig: validMerchantConfig,
    invalidMerchantConfig: invalidMerchantConfig,
    validPage: validPage,
    anotherValidPage: anotherValidPage,
    invalidPage: invalidPage,
    validPost: validPost,
    anotherValidPost: anotherValidPost,
    invalidPost: invalidPost,
    validUser: validUser,
    invalidUser: invalidUser,
    validProduct: validProduct,
    anotherValidProduct: anotherValidProduct,
    invalidProduct: invalidProduct,
    invalidDatabase: invalidDatabase
  };
};

module.exports = TestConfig();
