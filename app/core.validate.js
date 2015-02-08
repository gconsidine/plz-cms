/**
* Validation methods used throughout please. Mostly it's a wrapper for the
* validator project here: https://github.com/chriso/validator.js
* 
* @memberof core
* @namespace core.validate
*/
var CoreValidate = function (plz) {
  'use strict';

  var Validator = require('validator');

  plz = plz || {};
  plz.validate = plz.validate || {};

  /**
  * Validates an email address against a regular expression and returns true or
  * false depending on success.
  * 
  * @memberof core.validate
  * @param {string} address - The email address in need of validation
  * @return {boolean} true if input pattern matches email, false otherwise.
  */
  plz.validate.email = function (address) {
    return Validator.isEmail(address);
  };

  /**
  * Validates matching strings and returns true or false depending on success.
  * Useful for password new/confirm password comparison.
  * 
  * @memberof core.validate
  * @param {string} one - Any string to compare to the second argument 
  * @param {string} two - Compared to the first argument
  * @return {boolean} true if there's a match, false otherwise.
  */
  plz.validate.match = function (one, two) {
    return Validator.equals(one, two);
  };

  /**
  * Validates what is commonly accepted as a 'complex' password.  A string 
  * containing upper and lower case letters, and at least one number or 
  * special character.  Minimum of 8 characters in length.
  * 
  * @memberof core.validate
  * @param {string} password - Password tested for complexity
  * @return {boolean} true if input is complex
  */
  plz.validate.complexity = function (password) {
    var hasUpperCase = /[A-Z]/g,
        hasLowerCase = /[a-z]/g,
        hasNumber = /[0-9]/g,
        hasSpecialCharacter = /[`~!@#$%^&*()_\-+={}[\]\|:;"'<>,.?\/]/g;
    
    if(hasUpperCase.test(password) && hasLowerCase.test(password) &&
       (hasNumber.test(password) || hasSpecialCharacter.test(password)) &&
       password.length >= 8) {
      
      return true;
    } else {
      return false;
    }
  };

  /**
  * Verifies the type of the value as a number.
  * 
  * @memberof core.validate
  * @param {number} value - Value to check the type of 
  * @return {boolean} true if input is a number
  */
  plz.validate.number = function (value) {
    return typeof value === 'number' ? true : false;  
  };

  /**
  * Verifies the type of the value as a string.
  * 
  * @memberof core.validate
  * @param {number} value - Value to check the type of 
  * @return {boolean} true if input is a string
  */
  plz.validate.string = function (value) {
    return typeof value === 'string' ? true : false;
  };

  /**
  * Validate by type passed as the first argument.
  * 
  * @memberof core.validate
  * @param {string} value - Check validity as this type
  * @param {number} value - Check the type of this value
  * @return {boolean} true if validation as type is a success, false otherwise.
  */
  plz.validate.typeAs = function (type, data) {
    switch(type) {
      case 'email':
        return plz.validate.email(data);
      case 'number':
        return plz.validate.number(data);
      case 'password':
        return plz.validate.complexity(data);
      case 'string':
        return plz.validate.string(data);
    }

    return false;
  };
  
  return plz;
};

module.exports = CoreValidate;
