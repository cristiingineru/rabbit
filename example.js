

var examples = [

  function(ctx) {
    var face = new Face(ctx);
    face.draw();
  },

  function(ctx) {
    var face = new Face(ctx);
    face.draw({mood: 'drunk'});
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
