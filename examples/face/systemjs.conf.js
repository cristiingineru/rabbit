
SystemJS.config({
  baseURL: '/base/examples/face',
  //defaultExtension: 'js',
  map: {
    jquery: '/base/examples/lib/jquery',
    x: '/base/build/systemjs'
  },
  packages: {
    xyz: {
      main: '../../../build/systemjs/rabbit.js',
      baseURL: '../../../build/systemjs',
      map: {
        x: '../../../build/systemjs'
      }
    }
  }
});

System.import('face.spec.js').then(function(imports) {
  window.__karma__.start();
});