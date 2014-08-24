module.exports = function (grunt) {
  'use strict';
  
  var _source = {
    app: ['app/app*.js'],
    cli: ['app/cli*.js'],
    test: ['test/*spec.js'],
    process: ['gruntfile.js']
  };

  _source.all = _source.app.concat(_source.app, _source.cli, _source.test, 
                                   _source.process);

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


  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', [
    'jshint',
    'shell:mocha'
  ]);

};
