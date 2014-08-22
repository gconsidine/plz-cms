var Parse = function () {
  'use strict';

  var Fs = require('fs'),
      Path = require('path');
  
  var ROLEPLAY_JSON = 'roleplay.json';

  var _startingPath = Path.dirname(__filename),
      _currentPath = _startingPath,
      _depth = 0;
  
  function roleplayJson(callback) {
    normalizeJson(function (roleplayJson, error) {
      if(error) {
        callback(null, error);
      } else {
        callback(roleplayJson, error);
      }
    });
  }

  function getJsonContent(callback) {
    getLocation(function (filename, error) {
      if(error) {
        callback(null, error);     
      } else {

        var options = {
          encoding: 'utf-8' 
        };

        Fs.readFile(filename, options, function (error, data) {
          if(error) {
            callback(null, error);
          } else {
            callback(data, error);
          }
        });

      }
    });
  }

  function normalizeJson(callback) {
    getJsonContent(function (file, error) {
      if(error) {
        callback(null, error);
      } else {
        var json = JSON.parse(file);

        if(json.configuration.shorthand) {
          json = inflateShorthand(json);        
        } else {
          json = inflateLonghand(json);
        }
        
        callback(json, error);
      }
    });
  }

  function inflateShorthand(json) {
    var tempRoles,
        roleIndex,
        i;

    for(var route in json.access) {
      if(json.access[route].CRUD) {

        if(json.access[route].CRUD[0] === 'ALL') {
          json.access[route].create = json.roles;
          json.access[route].update = json.roles;
          json.access[route].read = json.roles;
          json.access[route].delete = json.roles;
        } else {

          tempRoles = [];
          for(i = 0; i < json.access[route].CRUD.length; i++) {
            roleIndex = json.access[route].CRUD[i];
            tempRoles.push(json.roles[roleIndex]);
          }

          json.access[route].create = tempRoles;
          json.access[route].update = tempRoles;
          json.access[route].read = tempRoles;
          json.access[route].delete = tempRoles;
        } 

        delete json.access[route].CRUD;

      } else {

        if(!json.access[route].create) {
          json.access[route].create = [];
        }
        if(!json.access[route].read) {
          json.access[route].read = [];
        }
        if(!json.access[route].update) {
          json.access[route].update = [];
        }
        if(!json.access[route].delete) {
          json.access[route].delete = [];
        }

        for(var action in json.access[route]) {
          if(json.access[route][action][0] === 'ALL') {
            json.access[route][action] = json.roles;
          } else {

            tempRoles = [];
            for(i = 0; i < json.access[route][action].length; i++) {
              roleIndex = json.access[route][action][i];
              tempRoles.push(json.roles[roleIndex]);
            }

            json.access[route][action] = tempRoles;
          }
        }

      }
    }

    return json;
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
        }
        if(!json.access[route].read) {
          json.access[route].read = [];
        }
        if(!json.access[route].update) {
          json.access[route].update = [];
        }
        if(!json.access[route].delete) {
          json.access[route].delete = [];
        }

        for(var action in json.access[route]) {
          if(json.access[route][action][0] === 'All') {
            json.access[route][action] = json.roles;
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
        callback(null, error);
      } else if(error) {
        _depth++;
        getLocation(callback);
      } else {
        callback(filename, error);
      }
    });
  }

  function locateJson(callback) {
    var location = Path.join(_currentPath, ROLEPLAY_JSON);

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
    getJsonContent: getJsonContent,
    normalizeJson: normalizeJson,
    roleplayJson: roleplayJson
  };

};

module.exports = Parse;
