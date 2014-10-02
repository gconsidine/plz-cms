(function () {
  'use strict';

  require('should');

  var Validate = require('../app/core.validate');

  describe('core.validate | All validation methods', function () {
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
 
    it('should validate number types', function () {
      var i;

      var valid = [-1, 0, 1, 0.01, 1.00, 0x1A4, 2e4, 2.3e4];
      var invalid = ['-1', '0', '0.01', [], {}, true];

      for(i = 0; i < valid.length; i++) {
        Validate.number(valid[i]).should.be.true;
      }

      for(i = 0; i < invalid.length; i++) {
        Validate.number(invalid[i]).should.be.false;
      }

    });

    it('should validate string types', function () {
      var i;

      var valid = ['h', 'HI', '1', '-1', '0x1a4', '0000'];
      var invalid = [-1, 1.0, {}, [], false];

      for(i = 0; i < valid.length; i++) {
        Validate.string(valid[i]).should.be.true;
      }

      for(i = 0; i < invalid.length; i++) {
        Validate.string(invalid[i]).should.be.false;
      }
    });
    
    it('should validate based on given type string', function () {
      var cases = {
        email: 'name@domain.com',
        number: 1,
        string: 'hello',
        password: 'abc123XYZ!'
      };

      for(var type in cases) {
        if(cases.hasOwnProperty(type)) {
          Validate.typeAs(type, cases[type]).should.be.true;
        }
      }

      (function () {
        Validate.typeAs('sith', '?');
      }).should.throw.error;

    });

  });
}());
