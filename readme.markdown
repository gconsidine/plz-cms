# plz-cms [![Build Status](https://travis-ci.org/gconsidine/plz-cms.svg)](https://travis-ci.org/gconsidine/plz-cms) [![Coverage Status](https://img.shields.io/coveralls/gconsidine/plz-cms.svg)](https://coveralls.io/r/gconsidine/plz-cms) [![Dependency Status](https://david-dm.org/gconsidine/plz-cms.svg)](https://david-dm.org/gconsidine/plz-cms) [![devDependency Status](https://david-dm.org/gconsidine/plz-cms/dev-status.svg)](https://david-dm.org/gconsidine/plz-cms#info=devDependencies)


A Node.js module built as a hub for the following plz-cms components:

  * [admin](https://github.com/gconsidine/plz-cms/wiki/admin)
  * [author](https://github.com/gconsidine/plz-cms/wiki/author)
  * [merchant](https://github.com/gconsidine/plz-cms/wiki/merchant)
  * [scout](https://github.com/gconsidine/plz-cms/wiki/scout)
  * [socialite](https://github.com/gconsidine/plz-cms/wiki/socialite)

Browse the components above to see how the plz-cms API can be extended when
included in a configuration.

- - -
 
### Configuration

  When plz-cms is require()'d for use, a configuration object should be passed
  to the module, as in `var plz = require('plz-cms')(config);` -- Here are 
  basic configuration options for the core component of plz-cms:

    {
      components: {
        admin: false,
        author: false // unused modules can be ommitted to the same effect
      },
      database: {  // Can accept multiple database connections...
        default: { // ...but must have a default Mongo connection
          uri: <your_mongo_uri_here>
        }
      },
      mailer: {    // Can accept multiple mailers ...
        default: { // ...but must have a default address
          service: 'Gmail', // only Gmail supported for now
          address: <your_email_address>,
          password: <your_email_password>
        }
      }
    }

  What components you choose determines the properties of the configuration 
  options passed and the API at your disposal.

### Basic Usage

  Here's a basic configuration including just the *Admin* component:

    var config = {
      modules: {
        admin: true
      },
      database: {
        default: {
          uri: mongodb://localhost:27017/plz-test'
        }
      },
      mailer: {
        default: {
          service: 'Gmail',
          address: name@domain.tld,
          password: some-password
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

    var plz = require('plz-cms')(config);
    
    plz.validate.typeAs('string', 'success'); // true

### API

  plz-cms takes on the API structure of `plz`, followed by a verb category 
  (e.g. validate, sanitize, create), followed by an actor or a descriptor 
  (user, typeAs, string, number).  
  
  The goal is to make the API consistent, concise, and read more like a request
  to a human for a thing or an action.

  *"Please create a user"* becomes `plz.create.user(options, callback)`


