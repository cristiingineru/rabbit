

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
      ctx.setLineDash([1, 0]);
    }

    var scale = opt.width / opt.height;
    ctx.save();
    ctx.translate(opt.cx, opt.cy);
    ctx.scale(scale, 1);
    ctx.beginPath();
    ctx.arc(0, 0, opt.width / 2, startAngle, endAngle);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  return this;
}

function Face(ctx) {

  var eye1 = new Eye(ctx),
    eye2 = new Eye(ctx);

  this.draw = function (opt) {
    opt = Object.assign({
      x: 10,
      y: 10,
      width: 90,
      height: 100
    }, opt || {});
    if (opt.side === 'left') {
      eye1.draw({side: 'left'});
    }
    else if (opt.side === 'right') {
      eye2.draw({side: 'right'});
    } else {
      var scale = opt.width / opt.height;

      ctx.save();
      ctx.translate(opt.x + opt.width / 2, opt.y + opt.height / 2);
      ctx.scale(scale, 1);
      ctx.beginPath();
      ctx.arc(0, 0, opt.width / 2, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();

      eye1.draw({
        cx: opt.x + 1 * opt.width / 4,
        cy: opt.y + opt.height / 2,
        width: 1.5 * opt.width / 8,
        height: opt.height / 8,
        style: opt.mood === 'drunk' ? 'blurry' : undefined
      });
      eye2.draw({
        cx: opt.x + 3 * opt.width / 4,
        cy: opt.y + opt.height / 2,
        width: 1.5 * opt.width / 8,
        height: opt.height / 8,
        style: opt.mood === 'drunk' ? 'blurry' : undefined
      });
    }

    return this;
  }
}
