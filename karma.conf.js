// Karma configuration
// Generated on Mon Sep 12 2016 21:41:40 GMT+0300 (GTB Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine-jquery', 'jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/Canteen/build/canteen.min.js',
      'lib/jquery.js',
      'node_modules/karma-jasmine-jquery/lib/jasmine-jquery.js',
      'lib/mock-raf.js',
      'node_modules/phantomjs-polyfill-object-assign/object-assign-polyfill.js',
      //'node_modules/requirejs-babel/es6.js',
      //'node_modules/requirejs-babel/babel-5.8.34.min.js',
      'node_modules/requirejs/require.js',
      //'src/*.js',
      'requirejs.conf.js',
      //'spec/*.spec.js',
      //'examples/face/face.js',
      //'examples/face/*.spec.js'
      {pattern: 'src/*.js', included: false, served: true, watched: false, nocache: true},
      {pattern: 'spec/*.spec.js', included: false, served: true, watched: false, nocache: true},
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
        return file.originalPath; //.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    },

    xpreprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'src/*.js': ['coverage'],
      'spec/*.spec.js': ['coverage'],
      'examples/face/face.js': ['coverage'],
      'examples/face/*.spec.js': ['coverage']
    },

    coverageReporter: {
      type : 'lcov',
      dir : 'coverage/'
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
    //browsers: ['Chrome'],
    browsers: ['PhantomJS', 'Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
