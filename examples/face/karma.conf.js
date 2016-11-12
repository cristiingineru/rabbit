// Karma configuration
// Generated on Mon Sep 12 2016 21:41:40 GMT+0300 (GTB Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['systemjs', 'jasmine-jquery', 'jasmine'],

    plugins: ['karma-systemjs', 'karma-jasmine-jquery', 'karma-jasmine', 'karma-jasmine-html-reporter', 'karma-firefox-launcher', 'karma-phantomjs-launcher'],

    // list of files / patterns to load in the browser
    files: [
      //'examples/face/lib/jquery.js',
      //'lib/mock-raf.js',
      //'node_modules/phantomjs-polyfill-object-assign/object-assign-polyfill.js',
      //'examples/face/node_modules/Canteen/build/canteen.min.js',
      //'../../build/bundle/rabbit.js',
      //{pattern: 'examples/face/node_modules/Canteen/build/canteen.min.js', included: false, served: true, watched: true, nocache: true},
      //'examples/face/node_modules/systemjs/dist/system.js',
      //{pattern: 'examples/face/node_modules/systemjs/dist/*', included: false, served: true, watched: true, nocache: true},
      //'examples/face/systemjs.conf.js',
      //{pattern: 'examples/face/*.js', included: false, served: true, watched: true, nocache: true},
      //{pattern: 'build/systemjs/*.js', included: false, served: true, watched: true, nocache: true}
      'node_modules/Canteen/build/canteen.min.js',
      'rabbit.js',
      'eye.js',
      'mouth.js',
      'face.js',
      'face.spec.js',
      'lib/mock-raf.js'
    ],

    // list of files to exclude
    exclude: [],

    systemjs: {
      // Path to your SystemJS configuration file
      configFile: 'system.conf.js',

      config: {
        transpiler: null,
        paths: {
          "systemjs": "node_modules/systemjs/dist/*.js"
        },
      },

      // Patterns for files that you want Karma to make available, but not loaded until a module requests them. eg. Third-party libraries.
      xserveFiles: [
        'node_modules/Canteen/build/canteen.min.js',
        'eye.js',
        'mouth.js',
        'face.js',
        'face.spec.js',
        'lib/mock-raf.js',
        'rabbit.js'
      ],

      meta: {
        'rabbit.js': { format: 'global', scriptLoad: true }
      },

      files: [
        //'lib/mock-raf.js',
        //'../../build/bundle/rabbit.js'
        '*.js'
      ],

      testFileSuffix: ".spec.js"
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
    browsers: ['PhantomJS'/*, 'Firefox'*/],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
