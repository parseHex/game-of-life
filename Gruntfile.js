const srcDir = 'src';
const buildDir = 'docs'; // for use with GitHub Pages (using 'docs' subfolder option)

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
        src: srcDir + '/js/App.js',
        dest: buildDir + '/js/bundle.js'
      }
    },
    copy: {
      css: {
        src: srcDir + '/css/style.css',
        dest: buildDir + '/css/style.css'
      },
      html: {
        src: srcDir + '/index.html',
        dest: buildDir + '/index.html'
      },
      resources: {
        files: [{
          cwd: srcDir + '/res',
          src: '**/*',
          dest: buildDir + '/res',
          expand: true
        }]
      }
    },
    uglify: {
      options: {
        mangle: true,
        compress: true
      },
      target: {
        src: buildDir + '/js/bundle.js',
        dest: buildDir + '/js/bundle.js'
      }
    },
    connect: {
      server: {
        options: {
          port: 8080,
          base: buildDir
        }
      }
    },
    watch: {
      html: {
        files: [srcDir + '/index.html'],
        tasks: ['copy:html']
      },
      css: {
        files: [srcDir + '/**/*.css'],
        tasks: ['copy:css'],
      },
      options: {
        spawn: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', ['browserify', 'uglify', 'copy']);
  grunt.registerTask('dev', ['connect:server', 'browserify', 'copy', 'watch']);
};
