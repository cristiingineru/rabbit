"use strict";

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


if (!Object.prototype.elementAt){
    Object.prototype.elementAt = function(index){
        return this[index];
    };
};

$(function() {

  examples.forEach(function(example, index) {

    var ctx = $('#placeholder')
      .append('<canvas width="200" height="200" style="margin: 10px;" />')
      .find('canvas')
      .last()
      .elementAt(0)
      .getContext('2d');

    example(ctx);
  });

});
