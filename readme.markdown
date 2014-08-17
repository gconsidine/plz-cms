# Roleplay

  A Node.js authorization and access module built for Seamus

- - -
 
### Overview

- - -

### Installation

- - -

### configuration

  Create a `roleplay.json` file and insert it into your project's root 
  directory.  Here's an example:

    {
      "configuration": {
        "database":     "MongoDB"
        "databaseName": "roleplayDatabase",
        "store":        true,
        "storeType":    "Redis",
        "storeName":    "roleplayStore",
        "https":        false,
        "explict":      false
      },

      "roles": ["super-admin", "admin", "author"],

      "access": {
        "/": {
          "read":   ["super-admin", "admin", "author"]
        },
        "/api/v1/***": {
          "create": ["super-admin"],
          "read":   ["super-admin"],
          "update": ["super-admin"],
          "delete": ["super-admin"]
        },
        "/api/v1/user": {
          "create": ["super-admin", "admin"],
          "read":   ["super-admin", "admin"],
          "update": ["super-admin", "admin"],
          "delete": ["super-admin", "admin"]
        }
      }
    }

#### "configuration" property

  Configuration consists of several required properties, and several optional 
  properties with default values.

  **Required** properties:
  
  `database: "MongoDB"` 

  The *type* of database you're using.  As of now, only MongoDB is supported.

  `databaseName: "roleplayDatabase"`

  The name of database in which a roleplay collection or table will be created.

  `explicit: false`

  When set to `false`, the user is assumed to have access to any route that 
  isn't explicitly defined in access.

  When set to `true`, the user is assumed to have **no** access to any route 
  that isn't explicitly defined in access.

  **Optional** properties:

  `https: false`

  If set to `true`, all non-HTTPS checks will be denied

  `store: true`

  If set to `true`, permissions will be loaded into a store on app start for 
  quick permissions checking.

  `storeType: "Redis"`

  Redis is currently the only supported store.

  `storeName: "roleplayStore"`

  The name of the store that Roleplay will use.


#### "roles" property
  
  Roles are listed hierarchically in an array, with index roles[0] as the most 
  privileged user, and roles[roles.length - 1] being the least privileged user.
  An arbitrary number of roles are supported, and role names can be any string.

  Roles exist to provide sanity checks upon user creation and to denote access 
  more concisely.

#### "access" property

  Property names represent the route in which you're assigning CRUD permissions 
  to particular roles.  Suppose the following routes exist:
  
    /user
    /user/billing
    /user/billing/profile
    /user/account
    /user/account/profile
 
  Properties within access (routes) can be formed in the following ways:

  Level 3: Explicit

    /user
    /user/billing
    /user/billing/profile
    /user/account
    /user/account/profile

  Level 2: `*`
      
    /user/* 

  Matches `/user`, `/user/billing`, `user/account`, and any other valid 
  basename after `/user/`

  Level 1: `**`
    
    /user/**/profile

  Matches `/user/billing/profile`, `/user/account/profile`, and any other route 
  with valid URL characters between `/user` and `/profile`

  Level 0: `***`

    /user/***

  Matches `/user`, `/user/billing`, `/user/billing/profile/`, `/user/account`, 
  `/user/account/profile`, and any other route that begins with `/user`.

  Roleplay will first search for the most explicit match for a given user's 
  role and route.  This means, you can define broad access without as much 
  repetition.  For example, you can start by giving all of your roles broad 
  access, then partitioning off more exclusive routes for higher-level roles.  
  Here's an example API:

    /* Start with broad API route access for all users */

    "/api/v1/***": {
      "create": ["super-admin", "admin", "author"],
      "read":   ["super-admin", "admin", "author"],
      "update": ["super-admin", "admin", "author"],
      "delete": ["super-admin", "admin", "author"]
    },

    /* 
     * Assign permissions for `super-admin` and `admin` -- less explicit routes
     * will be ignored.
     */

    "/api/v1/admin: {
      "create": ["super-admin"],
      "read":   ["super-admin", "admin"],
      "update": ["super-admin"],
      "delete": ["super-admin"],
    }
       
- - -

#### Usage

- - -

#### Building
