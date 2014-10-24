/**
* @namespace utility
*/
var UtilityMailer = function (plz) {
  'use strict';

  var Mailer = require('nodemailer');

  /**
  * Gets a transporter used to send mail based on the default mailer
  * configuration options sepcified.  A second parameter 'name' can optionally
  * be passed to specify a different mailer from the configuration.
  *
  * @memberof utility
  * @param {mailer} callback
  * @param {string=} - The name of a mailer from the configuration options.
  */
  function getMailer (callback, name) {
    var mailer = plz.config.mailer.default;

    if(name) {
      if(!plz.config.mailer[name]) {
        throw new Error('Mailer specified does not exist in configuration');
      }
      
      mailer = plz.config.mailer[name];
    }

    var transporter = Mailer.createTransport({
        service: mailer.service,
        auth: {
            user: mailer.address,
            pass: mailer.password
        }
    });

    callback(false, transporter);
  }
  
  return {
    getMailer: getMailer
  };
};

module.exports = UtilityMailer;

/**
* @callback mailer
* @param {boolean} error - Indicating success/failure of the call
* @param {string|object} result - A concise String message is returned on 
* error. A mailer (transporter) is returned on success.
*/
