# plz-cms

A Node.js module built as a hub for the following plz-cms components:

  * [plz-admin](https://github.com/gconsidine/plz-cms/wiki/admin)
  * [plz-author](https://github.com/gconsidine/plz-cms/wiki/author)
  * [plz-merchant](https://github.com/gconsidine/plz-cms/wiki/merchant)
  * [plz-scout](https://github.com/gconsidine/plz-cms/wiki/scout)

Browse the components above to see how the plz-cms API can be extended when
included in a configuration.

- - -
 
### Configuration

  When plz-cms is require()'d for use, a single member function is exposed: 
  `configure(options, callback);` Configuration options are supplied in the 
  following form:

    {
      components: {
        admin: false,
        author: false, // unused modules can be ommitted to the same effect
      },
      database: {  // Can accept multiple database connections...
        default: { // ...but must have a default Mongo connection
          uri: process.env.PLZ_DATABASE_DEFAULT
        }
      },
      mailer: {    // Can accept multiple mailers ...
        default: { // ...but must have a default gmail address
          service: 'Gmail',
          address: process.env.PLZ_MAILER_ACTIVATION_ADDRESS,
          password: process.env.PLZ_MAILER_ACTIVATION_PASSWORD'
        }
      }
    }

  What components you choose determines the properties of the configuration 
  options passed and the API at your disposal.

### Basic Usage

  Here's a basic configuration including the *Admin* component:

    var options = {
      modules: {
        admin: true
      },
      database: {
        default: {
          uri: process.env.PLZ_DB_DEFAULT + '/test'
        }
      },
      mailer: {
        default: {
          service: 'Gmail',
          address: process.env.PLZ_MAIL_DEFAULT_ADDRESS,
          password: process.env.PLZ_MAIL_DEFAULT_PASSWORD
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

    var plzCms = require('plz-cms'),
        plz;

    plzCms.configure(options, function (error, api) {
      plz = api
    });

    plz.validate.typeAs('string', 'success'); // true

### API

  plz-cms takes on the API structure of `plz`, followed by a verb category 
  (e.g. validate, sanitize, create), followed by an actor a or a descriptor 
  (user, typeAs, string, number).  
  
  The goal is to make the API consistent, concise, and read more like a request
  to a human for a thing or an action.

  *Please validate this string* becomes `plz.validate.string()`


