module.exports = function (grunt) {
  'use strict';
  
  var _source = {
    app: ['app/*.js', 'index.js'],
    test: ['test/*-spec.js'],
    process: ['gruntfile.js']
  };

  var _docPath = 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template';

  _source.all = _source.app.concat(_source.app, _source.test, _source.process);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: true
      },
      all: _source.all
    },

    jsdoc: {
      dist: {
        src: ['app/*'],
        options: {
          destination: 'doc',
          template: _docPath,
          configure : 'jsdoc.json'
        }
      }
    },
    
    shell: {
      test: {
        command: 'mocha'
      },
      testCoverage: {
        command: [
          'node_modules/.bin/jscover app app-cov',
          'mv app app-orig',
          'mv app-cov app',
          'node_modules/.bin/mocha -R mocha-lcov-reporter > coverage-temp.lcov',
          'rm -rf app',
          'mv app-orig app'
        ].join('&&')
      },
      fixCoveragePaths: {
        command: [
          "sed 's,SF:,SF:app/,' coverage-temp.lcov > coverage.lcov",
          'rm coverage-temp.lcov',
        ].join('&&')
      }
    },

    coveralls: {
      options: {
        force: true
      },
      app: {
        src: 'coverage.lcov'
      }
    },

    watch: {
      dev: {
        files: _source.all,
        tasks: ['jshint', 'shell:test']
      },
      doc: {
        files: _source.all,
        tasks: ['jshint', 'jsdoc']
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
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('default', [
    'jshint',
    'shell:test'
  ]);

  grunt.registerTask('full-build', [
    'jshint',
    'shell:test',
    'shell:testCoverage',
    'shell:fixCoveragePaths',
    'coveralls'
  ]);
};
