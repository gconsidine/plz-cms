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

  function unixTime() {
  }

  function number() {
  }
  
  function string() {
  }

  function asType(type, data) {
    console.log(data);
    switch(type) {
      case 'unixTime':
        break;
      case 'email':
        break;
      case 'number':
        break;
      case 'password':
        break;
      case 'string':
        break;
    }
  }

  return {
    email: email,
    match: match,
    complexity: complexity,
    asType: asType,
    unixTime: unixTime,
    number: number,
    string: string
  };

};

module.exports = CoreValidate();
