var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

function karmaStart()
{
  window.__karma__.start();
}

requirejs.config({
  baseUrl: './base/src',
  paths: {
      spec: '../spec'
  },
  deps: tests,
  callback: karmaStart
});

requirejs([], function() {
  $ = jQuery;
});