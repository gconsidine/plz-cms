var CoreMailer = function (plz) {
  'use strict';

  var Mailer = require('nodemailer');

  plz = plz || {};
  plz.get = plz.get || {};
  plz.set = plz.set || {};

  var _mailer = plz.config.mailer.default;

  plz.get.mailer = function (callback) {
    var transporter = Mailer.createTransport({
        service: _mailer.service,
        auth: {
            user: _mailer.address,
            pass: _mailer.password
        }
    });

    callback(false, transporter);
  };

  plz.set.mailer = function (name) {
    if(!plz.config.mailer[name]) {
      throw new Error('Database URI does not exist in configuration');
    }

    _mailer = plz.config.mailer[name];
  };

  
  return plz;
};

module.exports = CoreMailer;
