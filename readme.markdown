# plz-cms

A Node.js module built as a hub for the following plz-cms components:

  * [plz-admin](https://github.com/gconsidine/plz-admin)
  * [plz-author](https://github.com/gconsidine/plz-author)
  * [plz-merchant](https://github.com/gconsidine/plz-merchant)
  * [plz-scout](https://github.com/gconsidine/plz-scout)

Browse the modules above to see how the plz-cms API can be extended when
included in a configuration.

- - -
 
### Configuration

  when plz-cms is require()'d for use, a single member function is exposed: 
  `configure(options, callback);` Configuration options are supplied in the 
  following form:

    {
      modules: {
        admin: true,
        author: false, // unused modules can be ommitted to the same effect
        scribe: false
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

### Basic Usage

  coming soon...


### API

  coming soon...
