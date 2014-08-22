module.exports = function (grunt) {
  'use strict';
  
  var _source = {
    app: ['app/app*.js'],
    cli: ['app/cli*.js'],
    test: ['test/*spec.js'],
    process: ['gruntfile.js']
  };

  _source.all = _source.app.concat(_source.cli, _source.test, _source.process);

  grunt.initConfig({

    pkg: grunt.file.readJSON("package.json"),

    jshint: {
      all: _source.all
    },

    watch: {
      all: {
        files: _source.all,
        tasks: ['jshint:all']
      }
    }

  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", [
    'jshint:all'
  ]);

};
