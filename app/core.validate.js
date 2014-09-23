var CoreValidate = function () {
  'use strict';

  var Validator = require('validator');
  
  function email(address) {
    return Validator.isEmail(address);
  }

  function match(one, two) {
    return Validator.equals(one, two);
  }

  function complexity(password) {
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
  }

  function number(value) {
    return typeof value === 'number' ? true : false;  
  }
  
  function string(value) {
    return typeof value === 'string' ? true : false;
  }

  function asType(type, data) {
    switch(type) {
      case 'email':
        return email(data);
      case 'number':
        return number(data);
      case 'password':
        return complexity(data);
      case 'string':
        return string(data);
      default:
        throw new Error('Unsupported validation type');
    }
  }

  return {
    email: email,
    match: match,
    complexity: complexity,
    asType: asType,
    number: number,
    string: string
  };

};

module.exports = CoreValidate();
