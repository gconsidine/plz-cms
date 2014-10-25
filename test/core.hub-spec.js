'use strict';

require('should');

var Tc = require('./test-config');

describe('core | Configuration', function () {
  var plz;

  it('should not accpet undefined options', function () {
    (function () {
      plz = require('../app/core.hub')();
    }).should.throw();
  });

  it('should not accept malformed options', function () {
    (function () {
      plz = require('../app/core.hub')(Tc.invalidCoreConfig);
    }).should.throw();
  });

  it('should accept valid options', function () {
    (function () {
      plz = require('../app/core.hub')(Tc.validCoreConfig);
    }).should.not.throw();
  });
});
