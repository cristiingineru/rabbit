// Karma configuration
// Generated on Mon Sep 12 2016 21:41:40 GMT+0300 (GTB Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine-jquery', 'jasmine', 'requirejs'],

    // list of files / patterns to load in the browser
    files: [
      'lib/mock-raf.js',
      'node_modules/phantomjs-polyfill-object-assign/object-assign-polyfill.js',

      // This has to be loaded with requirejs
      {pattern: 'node_modules/Canteen/build/canteen.min.js', included: false, served: true, watched: true, nocache: true},

      // Here is the entry point for testing
      'requirejs.conf.js',

      // The next pairs are a workaround to allow them being requested
      //by requirejs and being preprocessed by babel.
      'src/*.js',
      {pattern: 'src/*.js', included: false, served: true, watched: true, nocache: true},
      'spec/*.spec.js',
      {pattern: 'spec/*.spec.js', included: false, served: true, watched: true, nocache: true},
    ],

    // list of files to exclude
    exclude: [],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'kjhtml', 'coverage'],

    preprocessors: {
      'src/*.js': ['babel'],
      'spec/*.spec.js': ['babel'],
      'examples/face/face.js': ['babel'],
      'examples/face/*.spec.js': ['babel']
    },

    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline'
      },
      filename: function (file) {
        return file.originalPath;
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    },

    coverageReporter: {
      type : 'lcov',
      dir : 'coverage/'
    },

    xpreprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      //'src/*.js': ['coverage'],
      //'spec/*.spec.js': ['coverage'],
      //'examples/face/face.js': ['coverage'],
      //'examples/face/*.spec.js': ['coverage']
      'src/*.js': ['babel', 'coverage'],
      'spec/*.spec.js': ['babel', 'coverage'],
      'examples/face/face.js': ['babel', 'coverage'],
      'examples/face/*.spec.js': ['babel', 'coverage']
    },

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
