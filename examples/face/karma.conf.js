// Karma configuration
// Generated on Mon Sep 12 2016 21:41:40 GMT+0300 (GTB Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    // In order to serve the rabbit build files that are outside the default
    //current folder moving up to include those files as well.
    basePath: './../..',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['systemjs', 'jasmine-jquery', 'jasmine'],

    plugins: ['karma-systemjs', 'karma-jasmine-jquery', 'karma-jasmine', 'karma-jasmine-html-reporter', 'karma-firefox-launcher', 'karma-phantomjs-launcher'],

    // list of files / patterns to load in the browser
    // karma-systemjs will change the default behavior of karma, not all
    //patterns listed here will be included in the generated debug.html file
    files: [
      'examples/face/node_modules/Canteen/build/canteen.min.js',
      'examples/face/lib/mock-raf.js',

      // SystemJS can load any AMD, CommonJS or SystemJS format.
      // Can't use the bundle rabbit file directly because systemjs will find the require()
      //calls and try to load it as commonjs module and resolve its dependencies which are
      //embedded in the same file anyway. The local version of rabbit.js has the
      //require() calls replaced with REQUIRE().
      //'build/amd/*',
      //'build/commonjs/*',
      'build/systemjs/*',

      'examples/face/eye.js',
      'examples/face/mouth.js',
      'examples/face/face.js',
      'examples/face/face.spec.js'
    ],

    // list of files to exclude
    exclude: [],

    systemjs: {
      // Path to your SystemJS configuration file
      configFile: 'examples/face/system.conf.js',

      config: {
        transpiler: null,
        paths: {
          // These files will be included in the generated debug.html file
          'phantomjs-polyfill': 'examples/face/node_modules/phantomjs-polyfill-object-assign/object-assign-polyfill.js',
          'systemjs': 'examples/face/node_modules/systemjs/dist/*.js'
        },

        map: {
          //'rabbit': 'build/amd'
          //'rabbit': 'build/commonjs'
          'rabbit': 'build/systemjs'
        }
      },

      testFileSuffix: '.spec.js'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'kjhtml'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS', 'Firefox'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
