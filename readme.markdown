# roleplay

  A Node.js role creation and authorization module

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
        "explict":      false,
        "shorthand":    false
      },

      "roles": ["super-admin", "admin", "author"],

      "access": {
        "/": {
          "read": ["ALL"]
        },
        "/api/v1/***": {
          "CRUD": ["ALL"],
        },
        "/api/v1/user": {
          "CRUD": ["super-admin", "admin"]
        },
        "/api/v1/admin": {
          "create": ["super-admin"],
          "read":   ["super-admin", "admin"],
          "update": ["super-admin"],
          "delete": ["super-admin"]
        }
      }
    }

#### configuration property:

  Configuration consists of several required properties, and several optional 
  properties with default values.

  **Required**:
  
  `database: <string> // Currently, only MongoDB is supported`  

  `databaseName: <string> // Where your collection will be created`

    /*
     * When set to `false`, the user is assumed to have access to any route 
     * that isn't explicitly defined in access.
     *
     * When set to `true`, the user is assumed to have **no** access to any 
     * route that isn't explicitly defined in access.
     */

    explicit: <boolean> 

    /*
     * When set to true, CRUD access can be listed as role index e.g. 
     * "create": [0, 1, 2], 
     */

    shorthand: <boolean>

  **Optional**:

  `https: <boolean> // If true, all non-HTTPS checks will be denied`

    /*
     * A store can be used to load your permissions into memory for fast 
     * checking on app start.  Not using a store is discouraged
     */

    store: <boolean>

  `storeType: "Redis" // Currently, only Redis is supported`

  `storeName: "roleplayStore" // The name of the store Roleplay will use`

#### roles property
  
  Roles are listed hierarchically in an array, with roles[0] as the most 
  privileged user, and roles[roles.length - 1] being the least privileged user.
  An arbitrary number of roles are supported, and role names can be any string.

  Roles exist to provide sanity checks upon user creation and to denote access 
  more concisely.

#### access property

  Property names represent the route in which you're assigning CRUD permissions 
  to particular roles.  Suppose the following routes exist:
  
    /user
    /user/billing
    /user/billing/profile
    /user/account
    /user/account/profile
 
  Access routes can be formed in the following ways:

  No wildcards (most explicit):

    /user
    /user/billing
    /user/billing/profile
    /user/account
    /user/account/profile

  `*`:
      
    /user/* 

  Matches `/user`, `/user/billing`, `user/account`, and any other valid 
  basename after `/user/`

  `**`:
    
    /user/**/profile

  Matches `/user/billing/profile`, `/user/account/profile`, and any other route 
  with valid URL characters between `/user` and `/profile`

  `***` (least explicit):

    /user/***

  Matches `/user`, `/user/billing`, `/user/billing/profile/`, `/user/account`, 
  `/user/account/profile`, and any other route that begins with `/user/`.

  Roleplay will first search for the most explicit match for a given user's 
  role and route.  This means you can define broad access without as much 
  repetition.  For example, you can start by giving all of your roles broad 
  access, then partitioning off more exclusive routes for higher-level roles.  
  Here are some example routes:

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

  Here's the same example using the `shorthand: true` configuration property 
  and the more concise `CRUD` property within routes:

    "/api/v1/***": {
      "CRUD": [0, 1, 2]
    },

    "/api/v1/admin: {
      "create": [0],
      "read":   [0, 1],
      "update": [0],
      "delete": [0],
    }

  Use `CRUD` if `create`, `read`, `update`, and `delete` all share the same 
  roles.

  Regardless of whether `explicit` is set to `true` or `false`, for any missing
  `create`s, `read`s, `update`s, and `delete`s within an access route are 
  assumed to be non-existant and denied as a result. This can be useful if 
  there's any area of the site that is read-only to all roles.

    "/": {
      "read": [0, 1, 2]
    }

  Lastly, whether the `shorthand` is set to `true` or `false`, the string 
  `"ALL"` may be passed to an access route's property/properties to set access 
  for all roles more concisely

    "/": {
      "read": ["ALL"]
    }
       
- - -

#### Usage

- - -

#### Building
