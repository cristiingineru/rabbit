/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

describe('rabbit', function () {
    'use strict';

    var rabbit;

    beforeAll(function() {
      rabbit = new Rabbit();
    });

    describe('getBBox', function() {

      var fixture, placeholder, ctx;

    beforeEach(function () {
      fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 300px">').find('#demo-container').get(0);

      placeholder = $('<canvas id="placeholder"  />');
      placeholder.appendTo(fixture);
      ctx = placeholder[0].getContext('2d');
    });

      it('should return {x: NaN, y: NaN, width: NaN, height: NaN} for an empty canvas', function () {
          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
      });

      it('should return the box of an arc', function () {
        var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise;
        ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe(cx - r);
        expect(box.y).toBe(cy - r);
        expect(box.width).toBe(2 * r);
        expect(box.height).toBe(2 * r);
      });

      it('should union the boxes of two arcs that are far from each other', function () {
        var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
          toRightShift = 40, toBottomShift = 50;
        ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
        ctx.arc(cx + toRightShift, cy + toBottomShift, r, sAngle, eAngle, counterclockwise);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe(cx - r);
        expect(box.y).toBe(cy - r);
        expect(box.width).toBe(2 * r + toRightShift);
        expect(box.height).toBe(2 * r + toBottomShift);
      });

      it('should translate the box of an arc', function () {
        var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
          xTranslate = 15, yTranslate = 16;
        ctx.translate(xTranslate, yTranslate);
        ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe(cx - r + xTranslate);
        expect(box.y).toBe(cy - r + yTranslate);
        expect(box.width).toBe(2 * r);
        expect(box.height).toBe(2 * r);
      });

      it('should not translate the box of an arc after restoring', function () {
        var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
          xTranslate = 15, yTranslate = 16;
        ctx.save();
        ctx.translate(xTranslate, yTranslate);
        ctx.restore();
        ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe(cx - r);
        expect(box.y).toBe(cy - r);
        expect(box.width).toBe(2 * r);
        expect(box.height).toBe(2 * r);
      });

      it('should scale the box of an arc', function () {
        var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
          xScale = 15, yScale = 16;
        ctx.scale(xScale, yScale);
        ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe((cx - r) * xScale);
        expect(box.y).toBe((cy - r) * yScale);
        expect(box.width).toBe(2 * r * xScale);
        expect(box.height).toBe(2 * r * yScale);
      });

      it('should not scale the box of an arc after restoring', function () {
        var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
          xScale = 15, yScale = 16;
        ctx.save();
        ctx.scale(xScale, yScale);
        ctx.restore();
        ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe(cx - r);
        expect(box.y).toBe(cy - r);
        expect(box.width).toBe(2 * r);
        expect(box.height).toBe(2 * r);
      });

      it('should return the box of a rect', function () {
        var x = 11, y = 12, width = 13, height = 14;
        ctx.rect(x, y, width, height);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe(x);
        expect(box.y).toBe(y);
        expect(box.width).toBe(width);
        expect(box.height).toBe(height);
      });

      it('should union the boxes of two rects that are far from each other', function () {
        var x = 11, y = 12, width = 13, height = 14,
          toRightShift = 40, toBottomShift = 50;
        ctx.rect(x, y, width, height);
        ctx.rect(x + toRightShift, y + toBottomShift, width, height);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe(x);
        expect(box.y).toBe(y);
        expect(box.width).toBe(width + toRightShift);
        expect(box.height).toBe(height + toBottomShift);
      });

      it('should translate the box of a rect', function () {
        var x = 11, y = 12, width = 13, height = 14,
          xTranslate = 15, yTranslate = 16;
        ctx.translate(xTranslate, yTranslate);
        ctx.rect(x, y, width, height);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe(x + xTranslate);
        expect(box.y).toBe(y + yTranslate);
        expect(box.width).toBe(width);
        expect(box.height).toBe(height);
      });

      it('should not translate the box of a rect after restoring', function () {
        var x = 11, y = 12, width = 13, height = 14,
          xTranslate = 15, yTranslate = 16;
        ctx.save();
        ctx.translate(xTranslate, yTranslate);
        ctx.restore();
        ctx.rect(x, y, width, height);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe(x);
        expect(box.y).toBe(y);
        expect(box.width).toBe(width);
        expect(box.height).toBe(height);
      });
    });

    describe('union', function() {

      it('horizontal --- ---  =>  --------', function () {
        var box1 = {x: 1, width: 3},
          box2 = {x: 5, width: 3};

        var box = rabbit.union(box1, box2);

        expect(box.x).toBe(1);
        expect(box.width).toBe(7);
      });

      it('horizontal -------  =>  --------', function () {
        var box1 = {x: 1, width: 5},
          box2 = {x: 5, width: 3};

        var box = rabbit.union(box1, box2);

        expect(box.x).toBe(1);
        expect(box.width).toBe(7);
      });

      it('horizontal ----===  =>  --------', function () {
        var box1 = {x: 1, width: 7},
          box2 = {x: 5, width: 3};

        var box = rabbit.union(box1, box2);

        expect(box.x).toBe(1);
        expect(box.width).toBe(7);
      });

      it('horizontal --===--  =>  --------', function () {
        var box1 = {x: 1, width: 7},
          box2 = {x: 3, width: 3};

        var box = rabbit.union(box1, box2);

        expect(box.x).toBe(1);
        expect(box.width).toBe(7);
      });

      it('horizontal -===---  =>  --------', function () {
        var box1 = {x: 1, width: 7},
          box2 = {x: 2, width: 3};

        var box = rabbit.union(box1, box2);

        expect(box.x).toBe(1);
        expect(box.width).toBe(7);
      });

      it('horizontal ===----  =>  --------', function () {
        var box1 = {x: 1, width: 7},
          box2 = {x: 1, width: 3};

        var box = rabbit.union(box1, box2);

        expect(box.x).toBe(1);
        expect(box.width).toBe(7);
      });

      it('horizontal -==----  =>  --------', function () {
        var box1 = {x: 2, width: 6},
          box2 = {x: 1, width: 3};

        var box = rabbit.union(box1, box2);

        expect(box.x).toBe(1);
        expect(box.width).toBe(7);
      });

      it('horizontal -------  =>  --------', function () {
        var box1 = {x: 4, width: 4},
          box2 = {x: 1, width: 3};

        var box = rabbit.union(box1, box2);

        expect(box.x).toBe(1);
        expect(box.width).toBe(7);
      });

      it('horizontal --- ---  =>  --------', function () {
        var box1 = {x: 5, width: 3},
          box2 = {x: 1, width: 3};

        var box = rabbit.union(box1, box2);

        expect(box.x).toBe(1);
        expect(box.width).toBe(7);
      });

      it('vertical --- ---  =>  --------', function () {
        var box1 = {y: 1, height: 3},
          box2 = {y: 5, height: 3};

        var box = rabbit.union(box1, box2);

        expect(box.y).toBe(1);
        expect(box.height).toBe(7);
      });

      it('vertical -------  =>  --------', function () {
        var box1 = {y: 1, height: 5},
          box2 = {y: 5, height: 3};

        var box = rabbit.union(box1, box2);

        expect(box.y).toBe(1);
        expect(box.height).toBe(7);
      });

      it('vertical ----===  =>  --------', function () {
        var box1 = {y: 1, height: 7},
          box2 = {y: 5, height: 3};

        var box = rabbit.union(box1, box2);

        expect(box.y).toBe(1);
        expect(box.height).toBe(7);
      });

      it('vertical --===--  =>  --------', function () {
        var box1 = {y: 1, height: 7},
          box2 = {y: 3, height: 3};

        var box = rabbit.union(box1, box2);

        expect(box.y).toBe(1);
        expect(box.height).toBe(7);
      });

      it('vertical -===---  =>  --------', function () {
        var box1 = {y: 1, height: 7},
          box2 = {y: 2, height: 3};

        var box = rabbit.union(box1, box2);

        expect(box.y).toBe(1);
        expect(box.height).toBe(7);
      });

      it('vertical ===----  =>  --------', function () {
        var box1 = {y: 1, height: 7},
          box2 = {y: 1, height: 3};

        var box = rabbit.union(box1, box2);

        expect(box.y).toBe(1);
        expect(box.height).toBe(7);
      });

      it('vertical -==----  =>  --------', function () {
        var box1 = {y: 2, height: 6},
          box2 = {y: 1, height: 3};

        var box = rabbit.union(box1, box2);

        expect(box.y).toBe(1);
        expect(box.height).toBe(7);
      });

      it('vertical -------  =>  --------', function () {
        var box1 = {y: 4, height: 4},
          box2 = {y: 1, height: 3};

        var box = rabbit.union(box1, box2);

        expect(box.y).toBe(1);
        expect(box.height).toBe(7);
      });

      it('vertical --- ---  =>  --------', function () {
        var box1 = {y: 5, height: 3},
          box2 = {y: 1, height: 3};

        var box = rabbit.union(box1, box2);

        expect(box.y).toBe(1);
        expect(box.height).toBe(7);
      });

    });

});
