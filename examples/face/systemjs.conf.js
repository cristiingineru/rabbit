
SystemJS.config({
  baseURL: '/base/examples/face',
  //defaultExtension: 'js',
  map: {
    canteen: '/base/examples/face/node_modules/Canteen/build/canteen.min.js',
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

System.import('canteen').then(function() {
System.import('face.spec.js').then(function(imports) {
  window.__karma__.start();
});
});
