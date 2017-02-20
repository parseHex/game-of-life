'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        options: {
           transform: [['babelify', {presets: ['es2015']}]],
           watch: true,
           browserifyOptions: {
             debug: true
          }
        },
        src: 'src/js/App.js',
        dest: 'build/js/min.js'
      }
    },
    copy: {
      css: {
        src: 'src/css/style.css',
        dest: 'build/css/style.css'
      },
      html: {
        src: 'src/index.html',
        dest: 'build/index.html'
      }
    },
    connect: {
      server: {
        options: {
          port: 80,
          base: 'build'
        }
      }
    },
    watch: {
      html: {
        files: ['src/**/*.html'],
        tasks: ['copy:html']
      },
      css: {
        files: ['src/**/*.css'],
        tasks: ['copy:css'],
      },
      options: {
        spawn: true
      }
    }
  });
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', ['browserify', 'copy']);
  grunt.registerTask('dev', ['connect:server', 'browserify', 'copy', 'watch']);
};
