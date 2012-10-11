/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */',
      dt: '<%= grunt.template.today("yyyymmddHHMMss") %>'
    },
    lint: {
      js: [
        'grunt.js',
        'client/js/components/**/*.js',
        'client/js/config/**/*.js',
        'client/js/controllers/**/*.js',
        'client/js/models/**/*.js',
        'client/js/modules/**/*.js',
        'client/js/utils/**/*.js',
        'client/js/views/**/*.js',
        'client/js/*.js'
      ],
      grunt: [
        'grunt.js'
      ]
    },
    concat: {
      css: {
        src: ['client/assets/css/normalize.css', 'client/assets/css/font-awesome-custom.css', 'client/assets/css/global.css'],
        dest: 'release/<%= meta.dt %>/assets/css/all.css'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    mincss: {
      compress: {
        files: {
          'release/<%= meta.dt %>/assets/css/all.min.css': ['release/<%= meta.dt %>/assets/css/all.css']
        }
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {}
    },
    uglify: {},
    copy: {
      release: {
        files: {
          "release/<%= meta.dt %>/assets/images/" : "client/assets/images/**",
          "release/<%= meta.dt %>/assets/font/fontawesome-custom/" : "client/assets/font/fontawesome-custom/**",
          "release/<%= meta.dt %>/index.html" : "client/index.html"
        }
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint concat min');

  // Load tasks from grunt-contrib
  grunt.loadNpmTasks('grunt-contrib');

  // Release task
  grunt.registerTask('release', 'lint:grunt concat:css mincss:compress copy:release');

};
