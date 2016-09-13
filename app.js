

jQuery = $;

function Eye(ctx) {
  this.draw = function () {
    ctx.beginPath();
    ctx.arc(100, 75 , 50, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function Face(ctx) {
  var eye1 = new Eye(ctx),
    eye2 = new Eye(ctx);
  this.draw = function () {
    eye1.draw();
    eye2.draw();
  }
}
