/**
* @namespace core
*/
var CoreValidate = function (plz) {
  'use strict';

  var Validator = require('validator');

  plz = plz || {};
  plz.validate = plz.validate || {};

  plz.validate.email = function (address) {
    return Validator.isEmail(address);
  };

  plz.validate.match = function (one, two) {
    return Validator.equals(one, two);
  };

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

  plz.validate.number = function (value) {
    return typeof value === 'number' ? true : false;  
  };
  
  plz.validate.string = function (value) {
    return typeof value === 'string' ? true : false;
  };

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
      default:
        throw new Error('Unsupported validation type');
    }
  };
  
  return plz;
};

module.exports = CoreValidate;
