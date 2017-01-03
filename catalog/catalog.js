"use strict";

var rabbit,
  examples = [

`//inputs: ctx, sizeIndex;
ctx.beginPath();
ctx.lineWidth = sizeIndex*2 + 1;
ctx.scale(sizeIndex+1, sizeIndex+1);
ctx.moveTo(10.5, 10.5);
ctx.lineTo(30.5, 30.5);
ctx.moveTo(35.5,  5.5);
ctx.lineTo(15.5, 25.5);
ctx.stroke();
`,

`//inputs: ctx, sizeIndex;
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
`,

`//inputs: ctx, sizeIndex;
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
`,

`//inputs: ctx, sizeIndex;
ctx.beginPath();
ctx.lineWidth = sizeIndex * 2 + 1;
ctx.moveTo(10.5, 10.5);
ctx.lineTo(30.5, 30.5);
ctx.lineTo(30.5, 10.5);
ctx.lineTo(10.5, 30.5);
ctx.stroke();
`,

`//inputs: ctx, sizeIndex;
ctx.beginPath();
ctx.lineWidth = sizeIndex * 2 + 1;
ctx.strokeRect(10.5, 10.5, 15, 15);
ctx.strokeRect(30.5, 30.5,  5,  5);
ctx.strokeRect(35.5,  5.5,  8,  8);
`,

`//inputs: ctx, sizeIndex;
ctx.beginPath();
ctx.lineWidth = sizeIndex * 2 + 1;
ctx.strokeRect(5.5, 5.5, 15, 15);
ctx.translate(5, 5);
ctx.strokeRect(5.5, 5.5, 15, 15);
ctx.translate(5, 5);
ctx.strokeRect(5.5, 5.5, 15, 15);
`,

`//inputs: ctx, sizeIndex;
ctx.beginPath();
ctx.lineWidth = sizeIndex * 2 + 1;
ctx.scale(sizeIndex + 1, sizeIndex + 1);
ctx.arc(20, 20, 10, 2*Math.PI/4, 6*Math.PI/4);
ctx.stroke();
`,

`//inputs: ctx, sizeIndex;
ctx.scale(sizeIndex*0.3 + 1, sizeIndex*0.3 + 1);
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
ctx.arc(15, 15, 8, 0*Math.PI/4, 16*Math.PI/8);
ctx.stroke();
`,

`//inputs: ctx, sizeIndex;
var x0=35, y0=9, x1=8, y1=9, x2=8, y2=22, r=10;
ctx.scale(sizeIndex + 1, sizeIndex + 1);
ctx.moveTo(x0, y0);
ctx.arcTo(x1, y1, x2, y2, r);
ctx.strokeStyle = 'yellow';
ctx.lineWidth = 12;
ctx.stroke();
ctx.strokeStyle = 'black';
ctx.lineWidth = 4;
ctx.stroke();
`

];


function drawBBox(ctx, rabbit) {
  var box = rabbit.getBBox(ctx.stack());
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
  ctx.strokeRect(box.x, box.y, box.width, box.height);
}

function createTextAreasWithExamples()
{
  examples.forEach(function(example, exampleIndex) {
    var examplePreviews = $('#placeholder')
      .append('<textarea type="text" cols="55" rows="10" class="code"/>')
      .find('textarea'),
      examplePreview = examplePreviews[examplePreviews.length - 1];
    examplePreview.value = example.toString();
  });
}

function runExamples() {
  $('.demo').remove();
  $('.demoBreak').remove();
  $('.code').each(function(exampleIndex, textArea) {

    var textArea = $(textArea),
      lastSibling = textArea;

    [{width:  50, height:  50},
     {width: 100, height: 100},
     {width: 150, height: 150}
    ].forEach(function(size, sizeIndex) {

      lastSibling.after('<canvas class="demo" width="' + size.width + '" height="' + size.height + '" style="margin: 5px;" />');
      var canvases = textArea.parent().find('canvas'),
        lastCreatedCanvas = canvases[canvases.length - 1],
        ctx = lastCreatedCanvas.getContext('2d');
      lastSibling = $(lastCreatedCanvas);

      eval(textArea.val());
      drawBBox(ctx, rabbit);
    });

    lastSibling.after('<br class="demoBreak" />');
  });
}


requirejs.config({
  baseUrl: '../build/amd',
  paths: {
    lib: '../../lib'
  }
});


requirejs(['lib/domReady', 'lib/canteen.min', '../build/amd/rabbit.js'], function(domReady, Canteen, RabbitModule) {

  rabbit = new RabbitModule.Rabbit();

  createTextAreasWithExamples();
  runExamples();

});
