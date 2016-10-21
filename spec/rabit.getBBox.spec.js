/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

describe('getBBox', function () {
    'use strict';

    var rabbit, fixture, placeholder, ctx;

    beforeAll(function() {
      rabbit = new Rabbit();
      jasmine.addMatchers(rabbit.customMatchers);
    });

    beforeEach(function () {
      fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 300px">').find('#demo-container').get(0);

      placeholder = $('<canvas id="placeholder"  />');
      placeholder.appendTo(fixture);
      ctx = placeholder[0].getContext('2d');
    });

    it('empty canvas => {x: NaN, y: NaN, width: NaN, height: NaN}', function () {
        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toEqual(NaN);
        expect(box.y).toEqual(NaN);
        expect(box.width).toEqual(NaN);
        expect(box.height).toEqual(NaN);
    });

    it('.arc(cx, cy, r, sAngle, eAngle, counterclockwise) => {x: cx - r, y: cy - r, width: 2 * r, height: 2 * r}', function () {
      var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise;
      ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

      var box = rabbit.getBBox(ctx.stack());

      expect(box.x).toBe(cx - r);
      expect(box.y).toBe(cy - r);
      expect(box.width).toBe(2 * r);
      expect(box.height).toBe(2 * r);
    });

    it('.rect(x, y, width, height) => {x: x, y: y, width: width, height: height}', function () {
      var x = 11, y = 12, width = 13, height = 14;
      ctx.rect(x, y, width, height);

      var box = rabbit.getBBox(ctx.stack());

      expect(box.x).toBe(x);
      expect(box.y).toBe(y);
      expect(box.width).toBe(width);
      expect(box.height).toBe(height);
    });

    describe('a composed shape', function() {

      it('.rect(1, 0, 2, 0), .rect(5, 0, 3, 0) => {x: 1, y: 0, width: 7, height: 0}', function () {
        ctx.rect(1, 0, 2, 0);
        ctx.rect(5, 0, 3, 0);

        var box = rabbit.getBBox(ctx.stack());

        expect(box.x).toBe(1);
        expect(box.width).toBe(7);
      });

    });

});
