"use strict";

var Eye, Mouth, Face;

var examples = [

  function(ctx) {
    var eye = new Eye(ctx);
    eye.draw({
      cx: ctx.canvas.width / 2,
      cy: ctx.canvas.height / 2,
      width: ctx.canvas.width,
      height: ctx.canvas.height
    });
  },

  function(ctx) {
    var eye = new Eye(ctx);
    eye.draw({
      style: 'blurry',
      cx: ctx.canvas.width / 2,
      cy: ctx.canvas.height / 2,
      width: ctx.canvas.width,
      height: ctx.canvas.height
    });
  },

  function(ctx) {
    var mouth = new Mouth(ctx);
    mouth.draw({
      cx: ctx.canvas.width / 2,
      cy: ctx.canvas.height / 2,
      width: ctx.canvas.width
    });
  },

  function(ctx) {
    var face = new Face(ctx);
    face.draw({
      width: ctx.canvas.width,
      height: ctx.canvas.height
    });
  },

  function(ctx) {
    var face = new Face(ctx);
    face.draw({
      mood: 'drunk',
      width: ctx.canvas.width,
      height: ctx.canvas.height
    });
  },

  function(ctx) {
    var face = new Face(ctx, window);
    face.draw({
      mood: 'crazy',
      width: ctx.canvas.width,
      height: ctx.canvas.height
    });
  },

  function(ctx) {
    var face = new Face(ctx, window);
    face.draw({
      mood: 'crazy',
      width: 3 * ctx.canvas.width / 4,
      height: ctx.canvas.height
    });
  },

  function(ctx) {
    var face = new Face(ctx, window);
    face.draw({
      mood: 'crazy',
      width: 2 * ctx.canvas.width / 4,
      height: ctx.canvas.height
    });
  }

];


System.import('eye.js').then(function(imports) {
  Eye = imports.Eye;
System.import('mouth.js').then(function(imports) {
  Mouth = imports.Mouth;
System.import('face.js').then(function(imports) {
  Face = imports.Face;

  examples.forEach(function(example, index) {

    [{width:  50, height:  50},
     {width: 100, height: 100},
     {width: 150, height: 150}
    ].forEach(function(size) {

      var canvases = $('#placeholder')
          .append('<canvas width="' + size.width + '" height="' + size.height + '" style="margin: 5px;" />')
          .find('canvas'),
        lastCreatedCanvas = canvases[canvases.length - 1],
        ctx = lastCreatedCanvas.getContext('2d');

      example(ctx);
    });

    $('#placeholder').append('<br />');
  });

});
});
});