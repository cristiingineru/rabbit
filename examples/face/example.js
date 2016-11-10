"use strict";

var Face;

var examples = [

  function(ctx) {
    var face = new Face(ctx);
    face.draw({
      width: 150,
      height: 150
    });
  },

  function(ctx) {
    var face = new Face(ctx);
    face.draw({
      mood: 'drunk',
      width: 150,
      height: 150
    });
  },

  function(ctx) {
    var face = new Face(ctx, window);
    face.draw({
      mood: 'crazy',
      width: 150,
      height: 150
    });
  },

];


System.import('face.js').then(function(imports) {
  Face = imports.Face;

  examples.forEach(function(example, index) {

    var canvases = $('#placeholder')
        .append('<canvas width="200" height="200" style="margin: 10px;" />')
        .find('canvas'),
      lastCreatedCanvas = canvases[canvases.length - 1],
      ctx = lastCreatedCanvas.getContext('2d');

    example(ctx);
  });

});
