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
      config: [
        'grunt.js',
        'package.json'
      ]
    },
    concat: {
      css: {
        src: ['client/assets/css/normalize.css', 'client/assets/css/font-awesome-custom.css', 'client/assets/css/global.css'],
        dest: 'release/<%= meta.dt %>/assets/css/all.css'
      }
    },
    mincss: {
      compress: {
        files: {
          'release/<%= meta.dt %>/assets/css/all.css': ['release/<%= meta.dt %>/assets/css/all.css']
        }
      }
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
        browser: true,
        smarttabs: true
      },
      globals: {
        define: true,
        require: true
      }
    },
    copy: {
      release: {
        files: {
          "release/<%= meta.dt %>/assets/images/" : "client/assets/images/**",
          "release/<%= meta.dt %>/assets/font/fontawesome-custom/" : "client/assets/font/fontawesome-custom/**",
          "release/<%= meta.dt %>/index.html" : "client/index.html",
          "release/<%= meta.dt %>/.htaccess" : "client/.htaccess"
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: "client/js/",
          dir: "release/<%= meta.dt %>/js/",
          modules: [
              {
                  name: "main",
                  // Parts of the app are dynamically loaded, and
                  // are not automatically included by the r.js optimizer.
                  // Specify these modules explicitly, so that they are
                  // included in the generated build file (main.js).
                  include: [
                      // Core modules
                      "modules/user",
                      "modules/canvas",
                      "modules/router",
                      // Flaco MVC library
                      "lib/flaco/model",
                      "lib/flaco/controller",
                      "lib/flaco/view",
                      // Application m/v/c files
                      "models/channel",
                      "models/nowandnext",
                      "models/search",
                      "models/grid",
                      "controllers/nowandnext",
                      "controllers/search",
                      "controllers/grid",
                      "views/nowandnext",
                      "views/search",
                      "views/grid"
                  ]
              }
          ]
        }
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint:config');

  // Load tasks from grunt-contrib
  grunt.loadNpmTasks('grunt-contrib');

  // Release task
  grunt.registerTask('release', 'lint:config concat:css mincss:compress copy:release requirejs');

};
