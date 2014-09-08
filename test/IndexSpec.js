(function () {
  'use strict';

  var should = require('should');

  describe('plz-cms | require("plz-cms")(); without options', function () {
    it('should throw an error', function (done) {
      try {
        require('../index')();
        should.fail();
      } catch(error) {
        done();
      }
    });
  });

}());
