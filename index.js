#!/usr/bin/env node

var Parser = require('./app/cli.parse')();

Parser.normalizeJson(function (json, error) { 
  if(error) {
    console.log('file not found')
  } else {
    console.log(JSON.stringify(json));
  }
});

