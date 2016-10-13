

var examples = [

  function(ctx) {
    var face = new Face(ctx);
    face.draw();
  },

  function(ctx) {
    var face = new Face(ctx);
    face.draw({mood: 'drunk'});
  },

  function(ctx) {
    var face = new Face(ctx, window);
    face.draw({mood: 'crazy'});
  }

];


if (!Object.prototype.elementAt){
    Object.prototype.elementAt = function(index){
        return this[index];
    };
};

$(function() {
  examples.forEach(function(example, index) {
    var ctx = $('#placeholder')
      .append('<canvas />')
      .find('canvas')
      .elementAt(index)
      .getContext('2d');
    example(ctx);
  })
});
