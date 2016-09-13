/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

describe('Face', function () {
    'use strict';

    var placeholder, ctx, face;

    beforeEach(function () {
        var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<canvas id="placeholder" style="width: 100%;height: 100%" />');
        placeholder.appendTo(fixture);
        ctx = placeholder[0].getContext('2d');
        face = new Face(ctx);
    });

    afterEach(function () {
        $('#demo-container').empty();
    });

    it('should have 2 eyes', function () {
        face.draw();

        var eyes = circles(ctx.stack());

        expect(eyes.length).toBe(2);
    });

    function circles(stack) {
      return stack.filter(function(element) {
        var angleOfFullCircle = +(2 * Math.PI).toFixed(3);
        return element.method === 'arc' && (element.arguments[4] - element.arguments[3] === angleOfFullCircle);
      })
    }
});
