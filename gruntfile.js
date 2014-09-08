module.exports = function (grunt) {
  'use strict';
  
  var _source = {
    app: ['app/*.js', 'index.js'],
    test: ['test/*Spec.js'],
    process: ['gruntfile.js']
  };

  _source.all = _source.app.concat(_source.app, _source.test, _source.process);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: true
      },
      all: _source.all
    },
    
    shell: {
      mocha: {
        command: 'npm test'
      }
    },

    watch: {
      all: {
        files: _source.all,
        tasks: ['jshint', 'shell:mocha']
      }
    },

    bump: {
      options : {
        files: ["package.json"],
        updateConfigs: [],
        commit: false,
        createTag: true,
        tagName: "v%VERSION%",
        tagMessage: "Version %VERSION%",
        push: false
      }
    }
    
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('default', [
    'jshint',
    'shell:mocha'
  ]);

};
