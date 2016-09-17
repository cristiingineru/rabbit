/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

describe('Face', function () {
    'use strict';

    var fixture, placeholder, ctx, face;

    beforeEach(function () {
      jasmine.addMatchers(customMatchers);

      fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 300px">').find('#demo-container').get(0);

      placeholder = $('<canvas id="placeholder"  />');
      placeholder.appendTo(fixture);
      ctx = placeholder[0].getContext('2d');
      face = new Face(ctx);
    });

    afterEach(function () {
        $('#demo-container').empty();
    });

    it('should have 2 eyes of the same size', function () {
        face.draw();

        var eyes = circles(ctx.stack());

        expect(eyes.length).toBe(2);
        expect(radius(eyes[0])).toBe(radius(eyes[1]));
    });

    it('should have the eyes aligned', function () {
        face.draw();

        var eyes = circles(ctx.stack());

        expect(eyes.length).toBe(2);
        expect(position(eyes[0]).cy).toEqual(position(eyes[1]).cy);
    });

    it('should contain the eyes inside it`s area', function () {
        face.draw();

        var eyes = circles(ctx.stack());
        var area = rectangles(ctx.stack())[0];

        eyes.forEach(function(eye) {
          var point = {x: eye.arguments[0], y: eye.arguments[1]},
            rectangle = {x: area.arguments[0], y: area.arguments[1], width: area.arguments[2], height: area.arguments[3]};
          expect(isPointInsideRectangle(point, rectangle)).toBe(true);
        });
    });

    ['left', 'right'].forEach(function (side) {
      it('should have 1 eye when looked from a ' + side, function () {
          face.draw({side: side});

          var eyes = arcs(ctx.stack());

          expect(eyes.length).toBe(1);
      });
    });

    it('should render blurry eye when drunk', function () {
      face.draw({mood: 'drunk'});
      var drunkFace = ctx.stack();

      var eyeCtx = newCtx();
      var eye = new Eye(eyeCtx);
      eye.draw({style: 'blurry'});
      var blurryEye = eyeCtx.stack({style: 'blurry'});

      expect(blurryEye).toBeInWhileIgnoringArguments(drunkFace);
    });

    var customMatchers = {
      toBeInWhileIgnoringArguments: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            var match = false;
            for (var i = 0; i < expected.length - actual.length; i++) {
              match = true;
              for (var j = 0; j < actual.length; j++) {
                if (expected[i + j].method !== actual[j].method) {
                  match = false;
                  break;
                }
              }
              if (match === true) {
                break;
              }
            }
            var result = match ? {pass: true} : {pass: false, message: 'Array not included'};
            return result;
          }
        }
      }
    };

    function circles(stack) {
      return stack.filter(function(element) {
        var angleOfFullCircle = +(2 * Math.PI).toFixed(3);
        return element.method === 'arc' && (element.arguments[4] - element.arguments[3] === angleOfFullCircle);
      })
    }

    function arcs(stack) {
      return stack.filter(function(element) {
        var angleOfFullCircle = +(2 * Math.PI).toFixed(3);
        return element.method === 'arc' && (element.arguments[4] - element.arguments[3] < angleOfFullCircle);
      })
    }

    function rectangles(stack) {
      return stack.filter(function(element) {
        return element.method === 'strokeRect';
      })
    }

    function radius(circle) {
      return circle.arguments[2];
    }

    function position(circle) {
      return {cx: circle.arguments[0], cy: circle.arguments[1]};
    }

    // http://stackoverflow.com/questions/2752725/finding-whether-a-point-lies-inside-a-rectangle-or-not
    function isPointInsideRectangle(point, rectangle) {
      var segments = [{
        x1: rectangle.x,
        y1: rectangle.y,
        x2: rectangle.x + rectangle.width,
        y2: rectangle.y }, {
        x1: rectangle.x + rectangle.width,
        y1: rectangle.y,
        x2: rectangle.x + rectangle.width,
        y2: rectangle.y + rectangle.height}, {
        x1: rectangle.x + rectangle.width,
        y1: rectangle.y + rectangle.height,
        x2: rectangle.x,
        y2: rectangle.y + rectangle.height}, {
        x1: rectangle.x,
        y1: rectangle.y + rectangle.height,
        x2: rectangle.x,
        y2: rectangle.y
        }];

      var isInside = segments.map(function(segment) {
        var A = -(segment.y2 - segment.y1),
          B = segment.x2 - segment.x1,
          C = -(A * segment.x1 + B * segment.y1),
          D = A * point.x + B * point.y + C;
          return D;
      }).some(function(D) {
        return D > 0;
      });

      return isInside;
    }

    function newCtx() {
      var placeholder = $('<canvas />');
      placeholder.appendTo(fixture);
      var ctx = placeholder[0].getContext('2d');
      return ctx;
    }
});
