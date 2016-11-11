
SystemJS.config({
  baseURL: '/base/examples/face',
  map: {
    canteen: '/base/examples/face/node_modules/Canteen/build/canteen.min.js'
  }
});

System.import('canteen').then(function() {
System.import('face.spec.js').then(function(imports) {
  window.__karma__.start();
});
});
