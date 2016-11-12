var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
  baseUrl: './base/src',
  paths: {
      spec: '../spec'
  },
  deps: tests,
  callback: window.__karma__.start
});

requirejs([], function() {
  $ = jQuery;
});
