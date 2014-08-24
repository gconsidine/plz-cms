#!/usr/bin/env node

var Parser = require('./app/cli.parse')(__dirname);

Parser.getLocation(function (json, error) { 
  if(error) {
    console.log('file not found')
  } else {
    console.log(Parser._currentPath);
    console.log(JSON.stringify(json));
  }
});

Parser.getJsonContent(function (json, error) { 
  if(error) {
    console.log('file not found')
  } else {
    console.log(Parser._currentPath);
    console.log(JSON.stringify(json));
  }
});


