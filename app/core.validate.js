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

  return {
    email: email,
    match: match,
    complexity: complexity
  };

};

module.exports = CoreValidate();
