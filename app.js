

jQuery = $;

function Eye(ctx) {

  this.draw = function (opt) {
    opt = Object.assign({
      cx: 0,
      cy: 0,
      width: 10,
      height: 5
    }, opt || {});

    var startAngle = 0,
      endAngle = 2 * Math.PI;

    if (opt.side === 'left') {
      startAngle = 3* Math.PI / 4;
      endAngle = 5 * Math.PI / 4;
    } else if (opt.side === 'right') {
      startAngle = 7 * Math.PI / 4;
      endAngle = 1 * Math.PI / 4;
    }

    if (opt.style === 'blurry') {
      ctx.setLineDash([1, 2]);
    } else {
      ctx.setLineDash([0, 1]);
    }
    ctx.beginPath();
    ctx.arc(opt.cx, opt.cy, 10, startAngle, endAngle);
    ctx.stroke();
    ctx.closePath();
  }

  return this;
}

function Face(ctx) {

  var eye1 = new Eye(ctx),
    eye2 = new Eye(ctx);

  this.draw = function (opt) {
    opt = Object.assign({
      x: 0,
      y: 0,
      width: 60,
      height: 100
    }, opt || {});
    if (opt.side === 'left') {
      eye1.draw({side: 'left'});
    }
    else if (opt.side === 'right') {
      eye2.draw({side: 'right'});
    } else {
      ctx.save();
      ctx.scale(0.75, 1);
      ctx.beginPath();
      ctx.arc(opt.x + opt.width / 2, opt.y + opt.height / 2, opt.height / 2, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();

      eye1.draw({
        cx: 1 * (opt.x + opt.width) / 4,
        cy: (opt.y + opt.width) / 2,
        width: opt.width / 4,
        height: opt.height / 8,
        style: opt.mood = opt.mood === 'drunk' ? 'blurry' : undefined
      });
      eye2.draw({
        cx: 3 * (opt.x + opt.width) / 4,
        cy: (opt.y + opt.width) / 2,
        width: opt.width / 4,
        height: opt.height / 8,
        style: opt.mood = opt.mood === 'drunk' ? 'blurry' : undefined
      });
    }

    return this;
  }
}
