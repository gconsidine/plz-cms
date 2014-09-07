var Hub = function () {
  'use strict';

  var Mongo = require('mongodb').MongoClient,
      Mailer = require('nodemailer'),
      Api = require('./ApiGenerator');

  var _databases = {},
      _mailers = {};
  
  function configure(options) { 
    var api;

    setDatabases(options.database);
    setTransporters(options.mailer);
    
    api = Api.registerModules(options.modules);

    api.get = api.get || {};

    api.get.mailer = getMailer;
    api.get.database = getDatabase;

    return api;
  }

  function setDatabases(databases) {
    for(var name in databases) {
      if(databases.hasOwnProperty(name)) {
        setDatabase(name, databases[name].uri);
      }
    }
  }

  function setDatabase(name, uri) {
    Mongo.connect(uri, function (error, database) {
      if(error) {
        console.log('DB connection error'); 
        return;
      }

      addDatabase(name, database);
    });
  }

  function addDatabase(name, database) {
    _databases[name] = database; 
  }

  function getDatabase(name) {
    if(name !== 'undefined') {
      return _databases.default;
    }

    return _databases[name];
  }

  function setTransporters(transporters) {
    for(var name in transporters) {
      if(transporters.hasOwnProperty(name)) {
        setTransporter(name, transporters[name]);
      }
    }
  }

  function setTransporter(name, config) {
    var transporter = Mailer.createTransport({
        service: config.service,
        auth: {
            user: config.email,
            pass: config.password
        }
    });
    
    addTransporter(name, transporter);
  }

  function addTransporter(name, transporter) {
    _mailers[name] = transporter;
  }

  function getMailer(name) {
    if(name !== 'undefined') {
      return _mailers.default;
    }
    
    return _mailers[name];
  }

  return {
    configure: configure
  };
};

module.exports = Hub();
