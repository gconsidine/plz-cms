(function () {
  'use strict';

  var Should = require('should');

  describe('plz-cms | require("plz-cms")(); without options', function () {
    it('should throw an error', function (done) {
      try {
        require('../index')();
        Should.fail();
      } catch(error) {
        done();
      }
    });
  });

}());
