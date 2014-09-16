(function () {
  'use strict';

  require('should');

  var Validate = require('../app/Validate');

  describe('Validate | All validation member functions', function () {
    it('should validate common email formats', function () {
      var i;

      var valid = [
        'first@domain.tld',
        'first.last@domain.tld',
        'first.last@sub.domain.tld',
        'first.last@sub.domain.tld',
        "!#$%&'*+-/=?^_`{|}~@wtf.tld"
      ];

      var invalid = [
        'first..last@domain.tld',
        'first.last@domain..tld',
        'not.even.email',
        'too@many@ats.com'
      ];

      for(i = 0; i < valid.length; i++) {
        Validate.email(valid[i]).should.be.true;
      }

      for(i = 0; i < invalid.length; i++) {
        Validate.email(invalid[i]).should.be.false;
      }
    });

    it('should validate both arguments are equal', function () {
      var i;
       
      var valid = [
        ['valid', 'valid'],
        ['Valid', 'Valid'],
        ['0932', '0932'],
        [123, 123],
        ['123valid', '123valid']
      ];

      var invalid = [
        [1234, 123],
        [123, 124],
        ['0123', '123'],
        ['invalid', 'INVALID'],
        ['01invalid', '01INVALID']
      ];

      for(i = 0; i < valid.length; i++) {
        Validate.match(valid[i][0], valid[i][1]).should.be.true;
      }

      for(i = 0; i < invalid.length; i++) {
        Validate.match(invalid[i][0], invalid[i][1]).should.be.false;
      }
    });

    it('should validate string (password) complexity', function () {
      var i;

      var complex = [
        'UPPERlower1',
        'UPPERlower!',
        'UPPERlower1!',
        'xxxxxxX1'
      ];

      var notComplex = [
        'UPPERlower',
        'lower!@#',
        'UPPER!@#',
        'lower123',
        'UPPER123',
        'xxxxxX1',
        '!@#$%^&*',
        'password',
        'passwor',
      ];

      for(i = 0; i < complex.length; i++) {
        Validate.complexity(complex[i], complex[i]).should.be.true;
      }

      for(i = 0; i < notComplex.length; i++) {
        Validate.complexity(notComplex[i], notComplex[i]).should.be.false;
      }
    });
  });
}());
