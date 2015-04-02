# plz-cms [![Build Status](https://travis-ci.org/gconsidine/plz-cms.svg)](https://travis-ci.org/gconsidine/plz-cms) [![Coverage Status](https://img.shields.io/coveralls/gconsidine/plz-cms.svg)](https://coveralls.io/r/gconsidine/plz-cms) [![Dependency Status](https://david-dm.org/gconsidine/plz-cms.svg)](https://david-dm.org/gconsidine/plz-cms) [![devDependency Status](https://david-dm.org/gconsidine/plz-cms/dev-status.svg)](https://david-dm.org/gconsidine/plz-cms#info=devDependencies)

**plz-cms** is a configurable CMS and e-commerce library intended to be used to expedite the development of a project within the context of your favorite Node.js framework.  Oftentimes it's just a wrapper for well-made projects within the community that aims to expose a consistent (if not slightly unconventional) interface through them.

When **plz-cms** is included in a project, it requires a configuration object to get started.  This will include information about which components you'll include, the database(s) you'll be using, email account(s), and optionally other values that will adjust how users, blogs, etc. are stored.

The API is partially inspired by the readability of APIs for BDD libraries.  Conventionally, objects are nouns.  In the case of this project, there is a single parent object `plz` and it contains verb categories like `create`, `get`, etc.  Properties of these verb categories are finally actions, the methods, that perform a given task.

In putting everything together you have a readable (albeit silly) API.  Now you can tell your application to please get a user like, "`plz.get.user()`".  This has the other advantage (if the previous thing can even be considered a true advantage) of making the API searchable by verb category.  If you've ever wondered, "What can I `create` with this library?", since **plz-cms** has a limited set of verb categories, you'll be able to quickly discover that you can `create`, users, pages, posts, etc.

### Heads Up

This project is still in the very early stages of development.  Development is planned in vertical slices starting with Core, then Admin, then Author, and on down the list.  Realistically, it won't be very useful until Author, and the components that come before it, are complete.  This documentation is also a work in progress.

### Configuration

* [Overview](https://github.com/gconsidine/plz-cms/wiki/Configuration)

### Components

* [Core](https://github.com/gconsidine/plz-cms/wiki/Core)
* [Admin](https://github.com/gconsidine/plz-cms/wiki/admin)
* Author
* Merchant
* Socialite
* Scout

### Guides

* Getting Started

### Examples

* [Cockpit (sample-server)](https://github.com/gconsidine/cockpit)

### Development

* Building
* Testing
* Contributing
* Style Guide
* Changelog
* Road Map

