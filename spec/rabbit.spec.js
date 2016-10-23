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

      it('should translate the box of an arc based on a previous scale', function () {
        var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
          xScale = 15, yScale = 16, xTranslate = 17, yTranslate = 18;
        ctx.scale(xScale, yScale);
        ctx.translate(xTranslate, yTranslate);
        ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe((cx - r + xTranslate) * xScale);
        expect(box.y).toBe((cy - r + yTranslate) * yScale);
        expect(box.width).toBe(2 * r * xScale);
        expect(box.height).toBe(2 * r * yScale);
      });

      it('should translate the box of an arc based on all previous scales', function () {
        var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
          xScale1 = 15, yScale1 = 16, xScale2 = 16, yScale2 = 17, xTranslate = 18, yTranslate = 19;
        ctx.scale(xScale1, yScale1);
        ctx.scale(xScale2, yScale2);
        ctx.translate(xTranslate, yTranslate);
        ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe((cx - r + xTranslate) * xScale1 * xScale2);
        expect(box.y).toBe((cy - r + yTranslate) * yScale1 * yScale2);
        expect(box.width).toBe(2 * r * xScale1 * xScale2);
        expect(box.height).toBe(2 * r * yScale1 * yScale2);
      });

      it('should translate the box of an arc multiple times based on all previous scales', function () {
        var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
          xScale1 = 15, yScale1 = 16, xScale2 = 16, yScale2 = 17,
          xTranslate1 = 18, yTranslate1 = 19, xTranslate2 = 20, yTranslate2 = 21;
        ctx.scale(xScale1, yScale1);
        ctx.translate(xTranslate1, yTranslate1);
        ctx.scale(xScale2, yScale2);
        ctx.translate(xTranslate2, yTranslate2);
        ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe(xTranslate1 * xScale1 + (cx - r + xTranslate2) * xScale1 * xScale2);
        expect(box.y).toBe(yTranslate1 * yScale1 + (cy - r + yTranslate2) * yScale1 * yScale2);
        expect(box.width).toBe(2 * r * xScale1 * xScale2);
        expect(box.height).toBe(2 * r * yScale1 * yScale2);
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

    describe('totalTransform', function() {

      it('[[]] => {xTranslate: 0, yTranslate: 0, xScale: 1, yScale: 1}', function() {
        var transforms = [[]];

        var result = rabbit.totalTransform(transforms);

        expect(result.xTranslate).toBe(0);
        expect(result.yTranslate).toBe(0);
        expect(result.xScale).toBe(1);
        expect(result.yScale).toBe(1);
      });

      it('[[t1]] => {xTranslate: t1.x, yTranslate: t1.y, xScale: 1, yScale: 1}', function() {
        var transforms = [[
          {xTranslate: 10, yTranslate: 11}
        ]];

        var result = rabbit.totalTransform(transforms);

        expect(result.xTranslate).toBe(10);
        expect(result.yTranslate).toBe(11);
        expect(result.xScale).toBe(1);
        expect(result.yScale).toBe(1);
      });

      it('[[t1, t2]] => {xTranslate: t1.x + t2.x, yTranslate: t1.y + t2.y, xScale: 1, yScale: 1}', function() {
        var transforms = [[
          {xTranslate: 10, yTranslate: 11},
          {xTranslate: 12, yTranslate: 13}
        ]];

        var result = rabbit.totalTransform(transforms);

        expect(result.xTranslate).toBe(10 + 12);
        expect(result.yTranslate).toBe(11 + 13);
        expect(result.xScale).toBe(1);
        expect(result.yScale).toBe(1);
      });

      it('[[s1]] => {xTranslate: 0, yTranslate: 0, xScale: s1.x, yScale: s1.y}', function() {
        var transforms = [[
          {xScale: 10, yScale: 11}
        ]];

        var result = rabbit.totalTransform(transforms);

        expect(result.xTranslate).toBe(0);
        expect(result.yTranslate).toBe(0);
        expect(result.xScale).toBe(10);
        expect(result.yScale).toBe(11);
      });

      it('[[s1, s2]] => {xTranslate: 0, yTranslate: 0, xScale: s1.x * s2.x, yScale: s1.y * s2.y}', function() {
        var transforms = [[
          {xScale: 10, yScale: 11},
          {xScale: 12, yScale: 13}
        ]];

        var result = rabbit.totalTransform(transforms);

        expect(result.xTranslate).toBe(0);
        expect(result.yTranslate).toBe(0);
        expect(result.xScale).toBe(10 * 12);
        expect(result.yScale).toBe(11 * 13);
      });

      it('[[t1, s1]] => {xTranslate: t1.x, yTranslate: t1.y, xScale: s1.x, yScale: s1.y}', function() {
        var transforms = [[
          {xTranslate: 10, yTranslate: 11},
          {xScale: 12, yScale: 13}
        ]];

        var result = rabbit.totalTransform(transforms);

        expect(result.xTranslate).toBe(10);
        expect(result.yTranslate).toBe(11);
        expect(result.xScale).toBe(12);
        expect(result.yScale).toBe(13);
      });

      it('[[s1, t1]] => {xTranslate: t1.x * s1.x, yTranslate: t1.y * s1.y, xScale: s1.x, yScale: s1.y}', function() {
        var transforms = [[
          {xScale: 10, yScale: 11},
          {xTranslate: 12, yTranslate: 13}
        ]];

        var result = rabbit.totalTransform(transforms);

        expect(result.xTranslate).toBe(12 * 10);
        expect(result.yTranslate).toBe(13 * 11);
        expect(result.xScale).toBe(10);
        expect(result.yScale).toBe(11);
      });

      it('[[s1, t1, s2]] => {xTranslate: t1.x * s1.x, yTranslate: t1.y * s1.y, xScale: s1.x * s2.x, yScale: s1.y * s2.y}', function() {
        var transforms = [[
          {xScale: 10, yScale: 11},
          {xTranslate: 12, yTranslate: 13},
          {xScale: 14, yScale: 15}
        ]];

        var result = rabbit.totalTransform(transforms);

        expect(result.xTranslate).toBe(12 * 10);
        expect(result.yTranslate).toBe(13 * 11);
        expect(result.xScale).toBe(10 * 14);
        expect(result.yScale).toBe(11 * 15);
      });

      it('[[s1, t1, s2, t2]] => {xTranslate: t1.x * s1.x + t2.x * s1.x * s2.x, yTranslate: t1.y * s1.y + t2.t * s1.y * s2.y, xScale: s1.x * s2.x, yScale: s1.y * s2.y}', function() {
        var transforms = [[
          {xScale: 10, yScale: 11},
          {xTranslate: 12, yTranslate: 13},
          {xScale: 14, yScale: 15},
          {xTranslate: 16, yTranslate: 17}
        ]];

        var result = rabbit.totalTransform(transforms);

        expect(result.xTranslate).toBe(12 * 10 + 16 * 10 * 14);
        expect(result.yTranslate).toBe(13 * 11 + 17 * 11 * 15);
        expect(result.xScale).toBe(10 * 14);
        expect(result.yScale).toBe(11 * 15);
      });

    });
});
