// Karma configuration
// Generated on Mon Sep 12 2016 21:41:40 GMT+0300 (GTB Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../..',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine-jquery', 'jasmine'],

    // list of files / patterns to load in the browser
    files: [
      //'examples/face/lib/jquery.js',
      'examples/face/lib/mock-raf.js',
      //'node_modules/phantomjs-polyfill-object-assign/object-assign-polyfill.js',
      //'examples/face/node_modules/Canteen/build/canteen.min.js',
      'build/bundle/*.js',
      {pattern: 'examples/face/node_modules/Canteen/build/canteen.min.js', included: false, served: true, watched: true, nocache: true},
      'examples/face/node_modules/systemjs/dist/system.js',
      //{pattern: 'examples/face/node_modules/systemjs/dist/*', included: false, served: true, watched: true, nocache: true},
      'examples/face/systemjs.conf.js',
      {pattern: 'examples/face/*.js', included: false, served: true, watched: true, nocache: true},
      //{pattern: 'build/systemjs/*.js', included: false, served: true, watched: true, nocache: true}
    ],

    // list of files to exclude
    exclude: [],

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
