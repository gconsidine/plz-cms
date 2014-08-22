var ParseSpec = function () {
  
  var FileSystem = require('fs');

  var Parse = require('../app/cli.parse');

  var _json;

  function generateJson(type) {
    switch(type) {
      case 'shorthand-true':
        _json = generateShorthandTrue();
        break;
      case 'shorthand-false':
        _json = generateShorthandFalse();
        break;
    }
  }

  function generateShorthandFalse() {
  }

  function generateShorthandTrue() {
  }

};

module.exports = ParseSpec;
