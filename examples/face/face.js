"use strict";

jQuery = $;

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

function Face(ctx, window) {

  window = window || {requestAnimationFrame: function () {}};

  var mouth = new Mouth(ctx),
    eye1 = new Eye(ctx),
    eye2 = new Eye(ctx),
    newRafNeeded,
    animationInProgressId,
    shouldAnimate = function(opt) {
      return opt.mood === 'crazy';
    },
    clearCanvas = function(ctx) {
      if (ctx.canvas) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      else ctx.clearRect(0, 0, ctx.context.canvas.width, ctx.context.canvas.height);
    };

  this.draw = function (opt) {
    opt = Object.assign({
      x: 10,
      y: 10,
      width: 90,
      height: 100
    }, opt || {});
    newRafNeeded = shouldAnimate(opt);

    var step = function () {
      draw_core(opt);
      if (newRafNeeded) {
        animationInProgressId = window.requestAnimationFrame(step);
      }
    };
    step();

    return this;
  }

  var draw_core_state = {};

  var draw_core = function (opt) {

    clearCanvas(ctx);

    if (opt.side === 'left') {
      eye1.draw({side: 'left'});
    }
    else if (opt.side === 'right') {
      eye2.draw({side: 'right'});
    } else {

      var eye1YOffset = 0, eye2YOffset = 0;
      if (opt.mood === 'crazy') {
        if (draw_core_state.animationDirection === 'alpha') {
          draw_core_state.animationDistance += 0.5;
        } else if (draw_core_state.animationDirection === 'beta') {
          draw_core_state.animationDistance -= 0.5;
        } else {
          draw_core_state.animationDirection = 'alpha';
          draw_core_state.animationDistance = 0;
        }
        eye1YOffset = draw_core_state.animationDistance;
        eye2YOffset = -draw_core_state.animationDistance;
        if (draw_core_state.animationDistance ===  6) draw_core_state.animationDirection = 'beta';
        if (draw_core_state.animationDistance === -6) draw_core_state.animationDirection = 'alpha';
      }

      var scale = opt.width / opt.height;

      ctx.save();
      ctx.translate(opt.x + opt.width / 2, opt.y + opt.height / 2);
      ctx.scale(scale, 1);
      ctx.beginPath();
      ctx.arc(0, 0, opt.width / 2, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();

      mouth.draw({
        cx: opt.x + opt.width / 2,
        cy: opt.y + 10 * opt.height / 16,
        width: 7 * opt.width / 16
      });
      eye1.draw({
        cx: opt.x + 5 * opt.width / 16,
        cy: opt.y + 3 * opt.height / 8 + eye1YOffset,
        width: 2 * opt.width / 8,
        height: 2 * opt.height / 8,
        style: opt.mood === 'drunk' ? 'blurry' : undefined
      });
      eye2.draw({
        cx: opt.x + 11 * opt.width / 16,
        cy: opt.y + 3 * opt.height / 8 + eye2YOffset,
        width: 2 * opt.width / 8,
        height: 2 * opt.height / 8,
        style: opt.mood === 'drunk' ? 'blurry' : undefined
      });
    }
  }
}
