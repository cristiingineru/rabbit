requirejs.config({
  baseUrl: './base/src',
  paths: {
      spec: '../spec'
  }
});

requirejs([
  'rabbit',
  'spec/rabbit.spec',
  'spec/geometry.spec'
], function(geometry, rabbit) {
  console.log('yey');
});