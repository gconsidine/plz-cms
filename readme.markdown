# plz-cms

  A Node.js module built to link together the following plz-cms components:

  * plz-admin 
  * plz-author
  * plz-scribe
  * plz-scout
  * plz-merchant

- - -
 
### plz-cms configuration

  `plz-cms.configure()` is required before use, and it accepts one 
  configuration object that takes the following form:

    {
      modules: {
        admin: true,
        author: false, // unused modules can be ommitted to the same effect
        scribe: false
      },
      database: { // Can accept multiple database connections
        default: process.env.PLZ_DATABASE_DEFAULT
      },
      mailer: { // Can accept multiple mailers
        activation: { 
          service: 'Gmail',
          address: process.env.PLZ_MAILER_ACTIVATION_ADDRESS,
          password: process.env.PLZ_MAILER_ACTIVATION_PASSWORD'
        }
      }
    }

### plz-admin configuration

  plz-admin configuration must be added to the object passed to 
  `plz-cms.configure()`, nested at the same level as modules, database, and 
  mailer.  It's required if admin in modules is set to true.

  admin: { 
    roles: ['admin', 'author'], // at least one string role is required
    collections: {
      users: {
        dateCreated: true, // required document fields
        email: true,
        password: true
      }
    }
  }

