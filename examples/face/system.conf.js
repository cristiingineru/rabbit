
System.config({
  baseURL: '.',

  transpiler: null,

  paths: {
    'systemjs': '/node_modules/systemjs/dist/system.js'
  },

  map: {
    canteen: '/node_modules/Canteen/build/canteen.min.js'
  }
});

//System.import('canteen').then(function() {
//System.import('face.spec.js').then(function(imports) {
//  window.__karma__.start();
//});
//});
