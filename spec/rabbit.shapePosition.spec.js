/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

describe('shapePosition', function () {
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


    it('.arc(cx, cy, r, sAngle, eAngle, counterclockwise) => {x: cx - r, y: cy - r}', function () {
        var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise;
        ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

        var pos = rabbit.shapePosition(ctx.stack());

        expect(pos.x).toBe(cx - r);
        expect(pos.y).toBe(cy - r);
    });

    it('.rect(x, y, width, height) => {x: x, y: y}', function () {
        var x = 11, y = 12, width = 13, height = 14;
        ctx.rect(x, y, width, height);

        var pos = rabbit.shapePosition(ctx.stack());

        expect(pos.x).toBe(x);
        expect(pos.y).toBe(y);
    });

});
