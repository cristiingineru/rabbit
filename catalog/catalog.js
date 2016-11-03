

var examples = [

  function(ctx, sizeIndex) {
    ctx.beginPath();
    ctx.lineWidth = sizeIndex*2 + 1;
    ctx.scale(sizeIndex+1, sizeIndex+1);
    ctx.moveTo(10.5, 10.5);
    ctx.lineTo(30.5, 30.5);
    ctx.moveTo(35.5,  5.5);
    ctx.lineTo(15.5, 25.5);
    ctx.stroke();
  },

  function(ctx, sizeIndex) {
    ctx.scale(sizeIndex+1, sizeIndex+1);
    ctx.beginPath();
    ctx.moveTo(25.5,  5.5);
    ctx.lineTo(25.5, 45.5);
    ctx.lineWidth = 20;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.lineWidth = 15;
    ctx.strokeStyle = 'yellow';
    ctx.stroke();
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'purple';
    ctx.stroke();
  },

  function(ctx, sizeIndex) {
    ctx.scale(sizeIndex*1.1+0.5, sizeIndex*1.1+0.5);
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.moveTo( 5.5, 10.5);
    ctx.lineTo( 5.5, 20.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.moveTo(10.5, 10.5);
    ctx.lineTo(20.5, 10.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.moveTo(25.5, 10.5);
    ctx.lineTo(35.5, 10.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.moveTo(45.5, 20.5);
    ctx.lineTo(30.5, 45.5);
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
    ctx.lineWidth = 1;
    ctx.translate(0, 0);
    ctx.arc(15, 15, 10, 7*Math.PI/8, 13*Math.PI/8);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.translate(5, 5);
    ctx.scale(1.2, 1.2);
    ctx.arc(15, 15, 10, 7*Math.PI/8, 13*Math.PI/8);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.translate(5, 5);
    ctx.scale(1.2, 1.2);
    ctx.arc(15, 15, 10, 0*Math.PI/4, 16*Math.PI/8);
    ctx.stroke();
  },

  function(ctx, sizeIndex) {
    var rectWidth = 30;
    var rectHeight = 20;
    var rectX = 5;
    var rectY = 5;
    var cornerRadius = 7;
    ctx.scale(1+sizeIndex*0.2, 1+sizeIndex*0.2);
    ctx.beginPath();
    ctx.moveTo(rectX, rectY);
    ctx.lineTo(rectX+rectWidth-cornerRadius, rectY);
    ctx.arcTo(rectX+rectWidth, rectY,
      rectX+rectWidth, rectY+cornerRadius,
      cornerRadius);
    ctx.lineTo(rectX+rectWidth, rectY+rectHeight);
    ctx.lineWidth = 3 * sizeIndex + 1;
    ctx.stroke();
  },

];


function drawBBox(ctx) {
    var rabbit = new Rabbit(ctx),
      box = rabbit.getBBox(ctx.stack());
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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