var config = function () {
  'use strict';

  var mongo = require('mongodb'),
      mailer = require('nodemailer'),
      validator = require('validator');
  
  function connectToDatabase(uri, callback) {
    mongo.connect(uri, function (error, database) {
      if(error) {
        callback(true);
      } else {
        callback(false, database);
      }
    });
  }

  function getMailer(options, callback) {
    var mailer;

    if(validator.isEmail(options.senderEmail)) {
      try {
        mailer = mailer.createTransport({
          service: 'Gmail',
          auth: {
            user: options.senderEmail,
            pass: options.senderPassword
          }
        });

        callback(false, mailer);
      } catch(e) {
        callback(true, null);
      }
    } else {
      callback(false, null);
    }
  }

  return {
    connectToDatabase: connectToDatabase,
    getMailer: getMailer
  };

};

module.exports = config;
