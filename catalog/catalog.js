

var examples = [

  function(ctx, sizeIndex) {
    ctx.beginPath();
    ctx.lineWidth = sizeIndex * 2 + 1;
    ctx.moveTo(10.5, 10.5);
    ctx.lineTo(30.5, 30.5);
    ctx.moveTo(35.5,  5.5);
    ctx.lineTo(15.5, 25.5);
    ctx.stroke();
  },

  function(ctx, sizeIndex) {
    ctx.beginPath();
    ctx.lineWidth = sizeIndex * 2 + 1;
    ctx.moveTo(10.5, 10.5);
    ctx.lineTo(30.5, 30.5);
    ctx.lineTo(30.5, 10.5);
    ctx.lineTo(10.5, 30.5);
    ctx.stroke();
  },

  function(ctx, sizeIndex) {
    ctx.beginPath();
    ctx.lineWidth = sizeIndex * 2 + 1;
    ctx.strokeRect(10.5, 10.5, 15, 15);
    ctx.strokeRect(30.5, 30.5,  5,  5);
    ctx.strokeRect(35.5,  5.5,  8,  8);
  },

  function(ctx, sizeIndex) {
    ctx.beginPath();
    ctx.lineWidth = sizeIndex * 2 + 1;
    ctx.strokeRect(5.5, 5.5, 15, 15);
    ctx.translate(5, 5);
    ctx.strokeRect(5.5, 5.5, 15, 15);
    ctx.translate(5, 5);
    ctx.strokeRect(5.5, 5.5, 15, 15);
  },

  function(ctx, sizeIndex) {
    ctx.beginPath();
    ctx.lineWidth = sizeIndex * 2 + 1;
    ctx.scale(sizeIndex + 1, sizeIndex + 1);
    ctx.arc(20, 20, 10, 2*Math.PI/4, 6*Math.PI/4);
    ctx.stroke();
  },

  function(ctx, sizeIndex) {
    ctx.beginPath();
    ctx.lineWidth = sizeIndex * 2 + 1;
    ctx.translate(0, 0);
    ctx.arc(20, 20, 10, 3*Math.PI/4, 7*Math.PI/4);
    ctx.stroke();
    ctx.beginPath();
    ctx.translate(5, 5);
    ctx.arc(20, 20, 10, 3*Math.PI/4, 7*Math.PI/4);
    ctx.stroke();
    ctx.beginPath();
    ctx.translate(5, 5);
    ctx.arc(20, 20, 10, 3*Math.PI/4, 7*Math.PI/4);
    ctx.stroke();
  },

];


function drawBBox(ctx) {
    var rabbit = new Rabbit(ctx),
      box = rabbit.getBBox(ctx.stack());
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
    ctx.strokeRect(box.x, box.y, box.width, box.height);
}


if (!Object.prototype.elementAt){
    Object.prototype.elementAt = function(index){
        return this[index];
    };
};

$(function() {

  examples.forEach(function(example, exampleIndex) {

    var examplePreview = $('#placeholder')
      .append('<textarea type="text" cols="55" rows="10" />')
      .find('textarea')
      .last()
      .elementAt(0);
    examplePreview.value = example.toString();

    [{width:  50, height:  50},
     {width: 100, height: 100},
     {width: 150, height: 150}
    ].forEach(function(size, sizeIndex) {

      var ctx = $('#placeholder')
        .append('<canvas width="' + size.width + '" height="' + size.height + '" style="margin: 5px;" />')
        .find('canvas')
        .last()
        .elementAt(0)
        .getContext('2d');

      example(ctx, sizeIndex);
      drawBBox(ctx);
    });

    $('#placeholder').append('<br />');
  });

});
