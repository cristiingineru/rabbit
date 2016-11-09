"use strict";

System.register([], function($__export, $__moduleContext) {
  
  function Mouth(ctx) {

    this.draw = function(opt) {
      opt = Object.assign({
        cx: 20,
        cy: 20,
        width: 30
      }, opt || {});

      var startAngle = 0 * Math.PI / 4,
        endAngle = 4 * Math.PI / 4;

      ctx.save();
      ctx.beginPath();
      ctx.arc(opt.cx, opt.cy, opt.width / 2, startAngle, endAngle);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();

      ctx.save();
      ctx.translate(opt.cx - opt.width / 2, opt.cy);
      ctx.beginPath();
      ctx.moveTo(-opt.width / 16, -opt.width / 16)
      ctx.lineTo(2 * opt.width / 16, 2 * opt.width / 16);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();

      ctx.save();
      ctx.translate(opt.cx + opt.width / 2, opt.cy);
      ctx.beginPath();
      ctx.moveTo(opt.width / 16, -opt.width / 16)
      ctx.lineTo(-2 * opt.width / 16, 2 * opt.width / 16);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }

    return this;
  }
  
  $__export('Mouth', Mouth);
});