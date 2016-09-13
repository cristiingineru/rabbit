

jQuery = $;

function Eye(ctx) {
  this.draw = function (opt) {
    var startAngle = 0,
      endAngle = 2 * Math.PI;

    if (opt && opt.side === 'left') {
      startAngle = 3* Math.PI / 4;
      endAngle = 5 * Math.PI / 4;
    } else if (opt && opt.side === 'right') {
      startAngle = 7 * Math.PI / 4;
      endAngle = 1 * Math.PI / 4;
    }

    ctx.beginPath();
    ctx.arc(0, 0 , 10, startAngle, endAngle);
    ctx.stroke();
  }
}

function Face(ctx) {

  var eye1 = new Eye(ctx),
    eye2 = new Eye(ctx);

  this.draw = function (opt) {
    if (opt && opt.side === 'left') {
      eye1.draw(opt);
    }
    else if (opt && opt.side === 'right') {
      eye2.draw(opt);
    } else {
      ctx.strokeRect(-10, -10, 20, 20);
      eye1.draw(opt);
      eye2.draw(opt);
    }
  }
}
