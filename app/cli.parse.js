var Parse = function () {
  'use strict';

  var Fs = require('fs'),
      Path = require('path');

  var _startingPath = Path.dirname(__filename),
      _currentPath = _startingPath,
      _depth = 0;


  function getJson(callback) {
    getLocation(function (filename, error) {
      if(error) {
        callback(null, true);     
      } else {

        var options = {
          encoding: 'utf-8' 
        };

        Fs.readFile(filename, options, function (error, data) {
          if(error) {
            callback(null, true);
          } else {
            callback(data, false);
          }
        });

      }
    });
  }

  function normalizeJson(callback) {
    getJson(function (file, error) {
      if(error) {
        callback(null, true);
      } else {
        var json = JSON.parse(file);

        if(json.shorthand) {
          json = inflateShorthand(json);        
        } else {
          json = inflateLonghand(json);
        }
        
        callback(json, false);
      }
    });
  }

  function inflateShorthand(json) {
    for(var route in json.access) {
      
    }
  }

  function inflateLonghand(json) {
    for(var route in json.access) {
      if(json.access[route].CRUD) {

        if(json.access[route].CRUD[0] === 'ALL') {
          json.access[route].create = json.roles;
          json.access[route].update = json.roles;
          json.access[route].read = json.roles;
          json.access[route].delete = json.roles;
        } else {
          json.access[route].create = json.access[route].CRUD;
          json.access[route].update = json.access[route].CRUD;
          json.access[route].read = json.access[route].CRUD;
          json.access[route].delete = json.access[route].CRUD;
        }

        delete json.access[route].CRUD;

      } else {

        if(!json.access[route].create) {
          json.access[route].create = [];
        } else {
          if(json.access[route].create[0] === 'All') {
            json.access[route].create = json.roles;
          }
        }

        if(!json.access[route].read) {
          json.access[route].read = [];
        } else {
          if(json.access[route].read[0] === 'ALL') {
            json.access[route].read = json.roles;
          }
        }

        if(!json.access[route].update) {
          json.access[route].update = [];
        } else {
          if(json.access[route].update[0] === 'ALL') {
            json.access[route].update = json.roles;
          }
        }

        if(!json.access[route].delete) {
          json.access[route].delete = [];
        } else {
          if(json.access[route].delete[0] === 'ALL') {
            json.access[route].delete = json.roles;
          }
        }

      }
    }

    return json;
  }

  function getLocation(callback) {
    if(_depth !== 0) {
      _currentPath = _currentPath.substring(0, _currentPath.lastIndexOf('/'));
    }

    locateJson(function (filename, error) {
      if(error && _currentPath === '') {
        callback(null, true);
      } else if(error) {
        _depth++;
        getLocation(callback);
      } else {
        callback(filename, false);
      }
    });
  }

  function locateJson(callback) {
    var location = Path.join(_currentPath, 'roleplay.json');

    Fs.exists(location, function (exists) {
      if(exists) {
        callback(location, false);
      } else {
        callback(null, true); 
      }
    });
  }

  return {
    getLocation: getLocation,
    getJson: getJson,
    normalizeJson: normalizeJson
  };

};

module.exports = Parse;
