"use strict";

System.register([], function($__export, $__moduleContext) {

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
  
  $__export('Eye', Eye);
});