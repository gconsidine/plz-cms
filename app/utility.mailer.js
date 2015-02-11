/**
* @memberof utility
* @namespace utility.mailer
*/
var UtilityMailer = function (plz, NodeMailer) {
  'use strict';

  var nodeMailer = NodeMailer || require('nodemailer');

  var member = {};

  /**
  * Gets a transporter used to send mail based on the default mailer
  * configuration options sepcified.  A second parameter 'name' can optionally
  * be passed to specify a different mailer from the configuration.
  *
  * @memberof utility.mailer
  * @param {mailer} callback
  * @param {string=} - The name of a mailer from the configuration options.
  */
  member.getMailer = function (callback, name) {
    var mailer;

    if(name) {
      if(!plz.config.mailer[name]) {
        throw new Error('Mailer specified does not exist in configuration');
      }
      
      mailer = plz.config.mailer[name];
    } else {
      mailer = plz.config.mailer.default;
    }

    var transporter = nodeMailer.createTransport({
        service: mailer.service,
        auth: {
            user: mailer.address,
            pass: mailer.password
        }
    });

    callback(false, transporter);
  };

  member.sendMail = function (options, callback) {
    member.getMailer(function (error, transporter) {
      var from;

      if(options.name) {
        from = '<' + plz.config.mailer[options.name].user + '>';
      } else {
        from = '<' + plz.config.mailer.default.user + '>';
      }

      var mailOptions = {
        from: from,
        to: options.to,
        subject: options.subject,
        html: options.body
      };

      transporter.sendMail(mailOptions, function (error, result) {
        if(error) {
          callback(true, 'Email not sent');
          return;
        }

        callback(false, result);
      });

    }, options.name);
  };

  return member;
};

module.exports = UtilityMailer;

/**
* @callback mailer
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - A concise String message is returned on 
* error. A mailer (transporter) is returned on success.
*/
