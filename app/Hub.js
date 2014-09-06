var Hub = function () {
  'use strict';

  var Mongo = require('mongodb'),
      Mailer = require('nodemailer'),
      Api = require('./ApiGenerator');

  var _databases = {},
      _transporters = {},
      _activeDatabase,
      _activeMailer;
  
  function configure(options) { 
    var api;

    setDatabases(options.database);
    setTransporters(options.mailer);
 
    api = Api.registerModules(options.modules);
    api.get.mailer = getMailer;
    api.set.mailer = setTransporter;
    api.get.database = getDatabase;
    api.set.database = setDatabase;

    return api;
  }

  function setDatabases(databases) {
    for(var name in databases) {
      if(databases.hasOwnProperty(name)) {
        setDatabase(name, databases[name]);
      }
    }
  }

  function setDatabase(name, uri) {
    if(uri !== 'undefined') {
      Mongo.connect(uri, function (error, database) {
        if(error) {
          console.log('DB connection error'); 
          return;
        }

        addDatabase(name, database);

        if(name === 'default') {
          _activeDatabase = database;
        }
      });
    } else {
      _activeDatabase = getDatabase(name);
    }
  }

  function addDatabase(name, database) {
    _databases[name] = database; 
  }

  function getDatabase(name) {
    if(name !== 'undefined') {
      _activeDatabase = _databases[name];
    }

    return _activeDatabase;
  }

  function setTransporters(transporters) {
    for(var name in transporters) {
      if(transporters.hasOwnProperty(name)) {
        setTransporter(name, transporters[name]);
      }
    }
  }

  function setTransporter(name, config) {
    if(config !== 'undefined') {
      var transporter = Mailer.createTransport({
          service: config.service,
          auth: {
              user: config.email,
              pass: config.password
          }
      });
      
      addTransporter(name, transporter);

      if(name === 'default') {
        _activeMailer = transporter;
      }
    } else {
      _activeMailer = getMailer(name);
    }
  }

  function addTransporter(name, transporter) {
    _transporters[name] = transporter;
  }

  function getMailer(name) {
    if(name !== 'undefined') {
      _activeMailer = _transporters[name];
    }
    
    return _activeMailer;
  }

  return {
    configure: configure
  };
};

module.exports = Hub();
