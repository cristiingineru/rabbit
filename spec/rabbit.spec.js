/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

import { Geometry } from '../src/geometry.js'
import { Rabbit } from '../src/rabbit.js'
import '../node_modules/Canteen/build/canteen.min'


describe('Rabbit', () => {
    'use strict';

    var rabbit;

    beforeAll(() => {
      rabbit = new Rabbit();
    });

    describe('getBBox', () => {

      var fixture, placeholder, ctx;

      beforeEach(() => {
        fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 300px">').find('#demo-container').get(0);

        placeholder = $('<canvas id="placeholder"  />');
        placeholder.appendTo(fixture);
        ctx = placeholder[0].getContext('2d');
      });

      it('should return {x: NaN, y: NaN, width: NaN, height: NaN} for an empty canvas', () => {
          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
      });

      it('should return {x: NaN, y: NaN, width: NaN, height: NaN} when using unsupported canvas functions', () => {
          ctx.bezierCurveTo(1, 2, 3, 4, 5, 6);

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
      });

      describe('stroked arc', () => {

        it('should not return the box of just an arc', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

        it('should return the box of a stroked arc', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(cx - r);
          expect(box.y).toBe(cy - r);
          expect(box.width).toBe(2 * r);
          expect(box.height).toBe(2 * r);
        });

        it('should not return the box of an arc after calling beginPath', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.beginPath();
          ctx.fill();
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

        it('should return the box of a stroked arc width lineWidth = 2', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
            lineWidth = 2;
          ctx.lineWidth = lineWidth;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(cx - r - lineWidth / 2);
          expect(box.y).toBe(cy - r - lineWidth / 2);
          expect(box.width).toBe(2 * r + lineWidth);
          expect(box.height).toBe(2 * r + lineWidth);
        });

        it('should return the box of a scaled stroked arc width lineWidth = 2', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
            xScale = 14, yScale = 15, lineWidth = 2;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.scale(xScale, yScale);
          ctx.lineWidth = lineWidth;
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(cx - r - lineWidth / 2 * xScale);
          expect(box.y).toBe(cy - r - lineWidth / 2 * yScale);
          expect(box.width).toBe(2 * r + lineWidth * xScale);
          expect(box.height).toBe(2 * r + lineWidth * yScale);
        });

        it('should use a previouse lineWidth after restoring', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
            lineWidth1 = 11, lineWidth2 = 22, lineWidth3 = 33, lineWidth4 = 44;

          ctx.lineWidth = lineWidth1;
          ctx.save();
          ctx.lineWidth = lineWidth2;
          ctx.save();
          ctx.lineWidth = lineWidth3;
          ctx.save();
          ctx.lineWidth = lineWidth4;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.restore();
          ctx.restore();
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(cx - r - lineWidth2 / 2);
          expect(box.y).toBe(cy - r - lineWidth2 / 2);
          expect(box.width).toBe(2 * r + lineWidth2);
          expect(box.height).toBe(2 * r + lineWidth2);
        });

      });


      describe('filled arc', () => {

        it('should return the box of a filled arc', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(cx - r);
          expect(box.y).toBe(cy - r);
          expect(box.width).toBe(2 * r);
          expect(box.height).toBe(2 * r);
        });

        it('should union the boxes of two filled arcs that are far from each other', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
            toRightShift = 40, toBottomShift = 50;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.arc(cx + toRightShift, cy + toBottomShift, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(cx - r);
          expect(box.y).toBe(cy - r);
          expect(box.width).toBe(2 * r + toRightShift);
          expect(box.height).toBe(2 * r + toBottomShift);
        });

        it('should translate the box of a filled arc', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
            xTranslate = 15, yTranslate = 16;
          ctx.translate(xTranslate, yTranslate);
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(cx - r + xTranslate);
          expect(box.y).toBe(cy - r + yTranslate);
          expect(box.width).toBe(2 * r);
          expect(box.height).toBe(2 * r);
        });

        it('should not translate the box of a filled arc after restoring', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
            xTranslate = 15, yTranslate = 16;
          ctx.save();
          ctx.translate(xTranslate, yTranslate);
          ctx.restore();
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(cx - r);
          expect(box.y).toBe(cy - r);
          expect(box.width).toBe(2 * r);
          expect(box.height).toBe(2 * r);
        });

        it('should scale the box of a filled arc', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
            xScale = 15, yScale = 16;
          ctx.scale(xScale, yScale);
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe((cx - r) * xScale);
          expect(box.y).toBe((cy - r) * yScale);
          expect(box.width).toBe(2 * r * xScale);
          expect(box.height).toBe(2 * r * yScale);
        });

        it('should not scale the box of a filled arc after restoring', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
            xScale = 15, yScale = 16;
          ctx.save();
          ctx.scale(xScale, yScale);
          ctx.restore();
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(cx - r);
          expect(box.y).toBe(cy - r);
          expect(box.width).toBe(2 * r);
          expect(box.height).toBe(2 * r);
        });

        it('should translate the box of a filled arc based on a previous scale', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
            xScale = 15, yScale = 16, xTranslate = 17, yTranslate = 18;
          ctx.scale(xScale, yScale);
          ctx.translate(xTranslate, yTranslate);
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe((cx - r + xTranslate) * xScale);
          expect(box.y).toBe((cy - r + yTranslate) * yScale);
          expect(box.width).toBe(2 * r * xScale);
          expect(box.height).toBe(2 * r * yScale);
        });

        it('should translate the box of a filled arc based on all previous scales', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
            xScale1 = 15, yScale1 = 16, xScale2 = 16, yScale2 = 17, xTranslate = 18, yTranslate = 19;
          ctx.scale(xScale1, yScale1);
          ctx.scale(xScale2, yScale2);
          ctx.translate(xTranslate, yTranslate);
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe((cx - r + xTranslate) * xScale1 * xScale2);
          expect(box.y).toBe((cy - r + yTranslate) * yScale1 * yScale2);
          expect(box.width).toBe(2 * r * xScale1 * xScale2);
          expect(box.height).toBe(2 * r * yScale1 * yScale2);
        });

        it('should translate the box of a filled arc multiple times based on all previous scales', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise,
            xScale1 = 15, yScale1 = 16, xScale2 = 16, yScale2 = 17,
            xTranslate1 = 18, yTranslate1 = 19, xTranslate2 = 20, yTranslate2 = 21;
          ctx.scale(xScale1, yScale1);
          ctx.translate(xTranslate1, yTranslate1);
          ctx.scale(xScale2, yScale2);
          ctx.translate(xTranslate2, yTranslate2);
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(xTranslate1 * xScale1 + (cx - r + xTranslate2) * xScale1 * xScale2);
          expect(box.y).toBe(yTranslate1 * yScale1 + (cy - r + yTranslate2) * yScale1 * yScale2);
          expect(box.width).toBe(2 * r * xScale1 * xScale2);
          expect(box.height).toBe(2 * r * yScale1 * yScale2);
        });

      });


      [ {shape: 'rect', drawFunction: 'fill'},
        {shape: 'rect', drawFunction: 'stroke'},
        {shape: 'fillRect', drawFunction: undefined},
        {shape: 'strokeRect', drawFunction: undefined}
      ].forEach(function(testCase) {

        var namedShapeUnderTest = testCase.drawFunction
          ? testCase.drawFunction + (testCase.drawFunction.slice(-1) === 'e' ? 'd ' : 'ed ') + testCase.shape
          : testCase.shape,
          mustTestLineWidth = testCase.shape === 'strokeRect' || (testCase.shape === 'rect' && testCase.drawFunction === 'stroke');

        describe(namedShapeUnderTest, () => {

          it('should return the box of a ' + namedShapeUnderTest, () => {
            var x = 11, y = 12, width = 13, height = 14;
            ctx[testCase.shape](x, y, width, height);
            if (testCase.drawFunction) ctx[testCase.drawFunction]();

            var box = rabbit.getBBox(ctx.stack());

            expect(box.x).toBe(x);
            expect(box.y).toBe(y);
            expect(box.width).toBe(width);
            expect(box.height).toBe(height);
          });

          it('should union the boxes of two ' + namedShapeUnderTest + ' that are far from each other', () => {
            var x = 11, y = 12, width = 13, height = 14,
              toRightShift = 40, toBottomShift = 50;
            ctx[testCase.shape](x, y, width, height);
            ctx[testCase.shape](x + toRightShift, y + toBottomShift, width, height);
            if (testCase.drawFunction) ctx[testCase.drawFunction]();

            var box = rabbit.getBBox(ctx.stack());

            expect(box.x).toBe(x);
            expect(box.y).toBe(y);
            expect(box.width).toBe(width + toRightShift);
            expect(box.height).toBe(height + toBottomShift);
          });

          it('should translate the box of a ' + namedShapeUnderTest, () => {
            var x = 11, y = 12, width = 13, height = 14,
              xTranslate = 15, yTranslate = 16;
            ctx.translate(xTranslate, yTranslate);
            ctx[testCase.shape](x, y, width, height);
            if (testCase.drawFunction) ctx[testCase.drawFunction]();

            var box = rabbit.getBBox(ctx.stack());

            expect(box.x).toBe(x + xTranslate);
            expect(box.y).toBe(y + yTranslate);
            expect(box.width).toBe(width);
            expect(box.height).toBe(height);
          });

          it('should not translate the box of a ' + namedShapeUnderTest + ' after restoring', () => {
            var x = 11, y = 12, width = 13, height = 14,
              xTranslate = 15, yTranslate = 16;
            ctx.save();
            ctx.translate(xTranslate, yTranslate);
            ctx.restore();
            ctx[testCase.shape](x, y, width, height);
            if (testCase.drawFunction) ctx[testCase.drawFunction]();

            var box = rabbit.getBBox(ctx.stack());

            expect(box.x).toBe(x);
            expect(box.y).toBe(y);
            expect(box.width).toBe(width);
            expect(box.height).toBe(height);
          });

          it('should scale the box of a ' + namedShapeUnderTest, () => {
            var x = 11, y = 12, width = 13, height = 14,
              xScale = 15, yScale = 16;
            ctx.scale(xScale, yScale);
            ctx[testCase.shape](x, y, width, height);
            if (testCase.drawFunction) ctx[testCase.drawFunction]();

            var box = rabbit.getBBox(ctx.stack());

            expect(box.x).toBe(x * xScale);
            expect(box.y).toBe(y * yScale);
            expect(box.width).toBe(width * xScale);
            expect(box.height).toBe(height * yScale);
          });

          it('should not scale the box of a ' + namedShapeUnderTest + ' after restoring', () => {
            var x = 11, y = 12, width = 13, height = 14,
              xScale = 15, yScale = 16;
            ctx.save();
            ctx.scale(xScale, yScale);
            ctx.restore();
            ctx[testCase.shape](x, y, width, height);
            if (testCase.drawFunction) ctx[testCase.drawFunction]();

            var box = rabbit.getBBox(ctx.stack());

            expect(box.x).toBe(x);
            expect(box.y).toBe(y);
            expect(box.width).toBe(width);
            expect(box.height).toBe(height);
          });

          it('should translate the box of a ' + namedShapeUnderTest + ' based on a previous scale', () => {
            var x = 11, y = 12, width = 13, height = 14,
              xScale = 15, yScale = 16, xTranslate = 17, yTranslate = 18;
            ctx.scale(xScale, yScale);
            ctx.translate(xTranslate, yTranslate);
            ctx[testCase.shape](x, y, width, height);
            if (testCase.drawFunction) ctx[testCase.drawFunction]();

            var box = rabbit.getBBox(ctx.stack());

            expect(box.x).toBe((x + xTranslate) * xScale);
            expect(box.y).toBe((y + yTranslate) * yScale);
            expect(box.width).toBe(width * xScale);
            expect(box.height).toBe(height * yScale);
          });

          it('should translate the box of a ' + namedShapeUnderTest + ' based on all previous scales', () => {
            var x = 11, y = 12, width = 13, height = 14,
              xScale1 = 15, yScale1 = 16, xScale2 = 17, yScale2 = 18,
              xTranslate = 19, yTranslate = 20;
            ctx.scale(xScale1, yScale1);
            ctx.scale(xScale2, yScale2);
            ctx.translate(xTranslate, yTranslate);
            ctx[testCase.shape](x, y, width, height);
            if (testCase.drawFunction) ctx[testCase.drawFunction]();

            var box = rabbit.getBBox(ctx.stack());

            expect(box.x).toBe((x + xTranslate) * xScale1 * xScale2);
            expect(box.y).toBe((y + yTranslate) * yScale1 * yScale2);
            expect(box.width).toBe(width * xScale1 * xScale2);
            expect(box.height).toBe(height * yScale1 * yScale2);
          });

          it('should translate the box of a ' + namedShapeUnderTest + ' multiple times based on all previous scales', () => {
            var x = 11, y = 12, width = 13, height = 14,
              xScale1 = 15, yScale1 = 16, xScale2 = 17, yScale2 = 18,
              xTranslate1 = 19, yTranslate1 = 20, xTranslate2 = 21, yTranslate2 = 22;
            ctx.scale(xScale1, yScale1);
            ctx.translate(xTranslate1, yTranslate1);
            ctx.scale(xScale2, yScale2);
            ctx.translate(xTranslate2, yTranslate2);
            ctx[testCase.shape](x, y, width, height);
            if (testCase.drawFunction) ctx[testCase.drawFunction]();

            var box = rabbit.getBBox(ctx.stack());

            expect(box.x).toBe(xTranslate1 * xScale1 + (x + xTranslate2) * xScale1 * xScale2);
            expect(box.y).toBe(yTranslate1 * yScale1 + (y + yTranslate2) * yScale1 * yScale2);
            expect(box.width).toBe(width * xScale1 * xScale2);
            expect(box.height).toBe(height * yScale1 * yScale2);
          });

          if(mustTestLineWidth) {
            it('should return the box of a ' + namedShapeUnderTest + ' with lineWidth = 2', () => {
              var x = 11, y = 12, width = 13, height = 14, lineWidth = 2;
              ctx.lineWidth = lineWidth;
              ctx[testCase.shape](x, y, width, height);
              if (testCase.drawFunction) ctx[testCase.drawFunction]();

              var box = rabbit.getBBox(ctx.stack());

              expect(box.x).toBe(x - lineWidth / 2);
              expect(box.y).toBe(y - lineWidth / 2);
              expect(box.width).toBe(width + lineWidth);
              expect(box.height).toBe(height + lineWidth);
            });

            it('should return the box of a scaled ' + namedShapeUnderTest + ' with lineWidth = 3', () => {
              var x = 11, y = 12, width = 13, height = 14, lineWidth = 2,
                xScale = 15, yScale = 16;
              ctx.lineWidth = lineWidth;
              ctx.scale(xScale, yScale);
              ctx[testCase.shape](x, y, width, height);
              if (testCase.drawFunction) ctx[testCase.drawFunction]();

              var box = rabbit.getBBox(ctx.stack());

              expect(box.x).toBe((x - lineWidth / 2) * xScale);
              expect(box.y).toBe((y - lineWidth / 2) * yScale);
              expect(box.width).toBe((width + lineWidth) * xScale);
              expect(box.height).toBe((height + lineWidth) * yScale);
            });
          }

        });

      });


      describe('moveTo', () => {

        it('should not return the box of a stoked 1 point path given by moveTo', () => {
          var x = 10, y = 11;
          ctx.moveTo(x, y);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

        it('should not return the box of a stoked 2 points path given by 2 moveTo', () => {
          var x1 = 10, y1 = 11, x2 = 12, y2 = 13;
          ctx.moveTo(x1, y1);
          ctx.moveTo(x2, y2);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

      });


      describe('arcTo', () => {

        it('should not return the box of a stoked arcTo without a call to moveTo first', () => {
          var x1 = 10, y1 = 11, x2 = 10, y2 = 20, r = 0.2;
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

        it('should return the box of a stoked arcTo that contains an arc only', () => {
          var x0 = 7, y0 = 0, x1 = 5, y1 = 0, x2 = 5, y2 = 2, r = 2;
          ctx.moveTo(x0, y0);
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(5);
          expect(box.y).toBe(0);
          expect(box.width).toBe(4);
          expect(box.height).toBe(4);
        });

        it('should return the box of a stoked arcTo that contains an arc and a line', () => {
          var x0 = 11, y0 = 0, x1 = 5, y1 = 0, x2 = 5, y2 = 2, r = 2;
          ctx.moveTo(x0, y0);
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(5);
          expect(box.y).toBe(0);
          expect(box.width).toBe(6);
          expect(box.height).toBe(4);
        });

      });


      describe('lineTo', () => {

        it('should not return the box of a stoked 1 point path given by lineTo', () => {
          var x = 10, y = 11;
          ctx.lineTo(x, y);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

        it('should return the box of a stoked 2 points path', () => {
          var x1 = 10, y1 = 11, x2 = 12, y2 = 13;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          var minX = Math.min(x1, x2),
            minY = Math.min(y1, y2),
            maxX = Math.max(x1, x2),
            maxY = Math.max(y1, y2);
          expect(box.x).toEqual(minX);
          expect(box.y).toEqual(minY);
          expect(box.width).toEqual(maxX - minX);
          expect(box.height).toEqual(maxY - minY);
        });

        it('should return the box of a stoked 3 points path', () => {
          var x1 = 10, y1 = 11, x2 = 12, y2 = 13, x3 = 14, y3 = 15;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x3, y3);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          var minX = Math.min(x1, x2, x3),
            minY = Math.min(y1, y2, y3),
            maxX = Math.max(x1, x2, x3),
            maxY = Math.max(y1, y2, y3);
          expect(box.x).toEqual(minX);
          expect(box.y).toEqual(minY);
          expect(box.width).toEqual(maxX - minX);
          expect(box.height).toEqual(maxY - minY);
        });

        it('should return the box of an oblique stoked 2 points path of width=1', () => {
          var width = 1,
            x1 = 10, y1 = 11, x2 = 12, y2 = 13;
          ctx.lineWidth = width;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          var minX = Math.min(x1, x2),
            minY = Math.min(y1, y2),
            maxX = Math.max(x1, x2),
            maxY = Math.max(y1, y2);
          expect(box.x).toEqual(minX);
          expect(box.y).toEqual(minY);
          expect(box.width).toEqual(maxX - minX);
          expect(box.height).toEqual(maxY - minY);
        });

        it('should return the box of a horizontal stoked 2 points path of width=2', () => {
          var width = 2,
            x1 = 10, y1 = 11, x2 = 20, y2 = 11;
          ctx.lineWidth = width;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          var minX = Math.min(x1, x2),
            minY = Math.min(y1, y2),
            maxX = Math.max(x1, x2),
            maxY = Math.max(y1, y2);
          expect(box.x).toEqual(minX);
          expect(box.y).toEqual(minY - width / 2);
          expect(box.width).toEqual(maxX - minX);
          expect(box.height).toEqual(maxY - minY + width);
        });

        it('should return the box of a vertical stoked 3 points path of width=3', () => {
          var width = 3,
            x1 = 10, y1 = 11, x2 = 10, y2 = 22;
          ctx.lineWidth = width;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          var minX = Math.min(x1, x2),
            minY = Math.min(y1, y2),
            maxX = Math.max(x1, x2),
            maxY = Math.max(y1, y2);
          expect(box.x).toEqual(minX - width / 2);
          expect(box.y).toEqual(minY);
          expect(box.width).toEqual(maxX - minX + width);
          expect(box.height).toEqual(maxY - minY);
        });

        it('should scale the box of a 2 points stroked path of width=2', () => {
          var width = 2,
            x1 = 10, y1 = 11, x2 = 20, y2 = 11,
            xScale = 20, yScale = 21;
          ctx.lineWidth = width;
          ctx.scale(xScale, yScale);
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          var minX = Math.min(x1, x2),
            minY = Math.min(y1, y2),
            maxX = Math.max(x1, x2),
            maxY = Math.max(y1, y2);
          expect(box.x).toEqual(minX * xScale);
          expect(box.y).toEqual((minY - width / 2) * yScale);
          expect(box.width).toEqual((maxX - minX) * xScale);
          expect(box.height).toEqual((maxY - minY + width) * yScale);
        });

        it('should not scale the box of a 2 points stroked path of width=2 after restoring', () => {
          var width = 2,
            x1 = 10, y1 = 11, x2 = 20, y2 = y1,
            xScale = 20, yScale = 21;
          ctx.lineWidth = width;
          ctx.save();
          ctx.scale(xScale, yScale);
          ctx.restore();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          var minX = Math.min(x1, x2),
            minY = Math.min(y1, y2),
            maxX = Math.max(x1, x2),
            maxY = Math.max(y1, y2);
          expect(box.x).toEqual(minX);
          expect(box.y).toEqual(minY - width / 2);
          expect(box.width).toEqual(maxX - minX);
          expect(box.height).toEqual(maxY - minY + width);
        });

        it('should translate the box of a 2 points stroked path of width=2 based on a previous scale', () => {
          var width = 2,
            x1 = 10, y1 = 11, x2 = 15, y2 = y1,
            xScale = 20, yScale = 21, xTranslate = 22, yTranslate = 23;
          ctx.lineWidth = width;
          ctx.scale(xScale, yScale);
          ctx.translate(xTranslate, yTranslate);
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          var minX = Math.min(x1, x2),
            minY = Math.min(y1, y2),
            maxX = Math.max(x1, x2),
            maxY = Math.max(y1, y2);
          expect(box.x).toEqual((minX + xTranslate) * xScale);
          expect(box.y).toEqual((minY - width / 2 + yTranslate) * yScale);
          expect(box.width).toEqual((maxX - minX) * xScale);
          expect(box.height).toEqual((maxY - minY + width) * yScale);
        });

        it('should return the rect of the widest line when the path is stroked multiple times with different widths', () => {
          var width = 2,
            x1 = 10, y1 = 11, y2 = 33,
            xScale = 20, yScale = 21,
            width1 = 20, width2 = 15, width3 = 10;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y2);
            ctx.lineWidth = 20;
            ctx.strokeStyle = 'red';
            ctx.stroke();
            ctx.lineWidth = 15;
            ctx.strokeStyle = 'yellow';
            ctx.stroke();
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'purple';
            ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          var maxWidth = Math.max(width1, width2, width3);
          expect(box.x).toEqual(x1 - maxWidth / 2);
          expect(box.y).toEqual(y1);
          expect(box.width).toEqual(maxWidth);
          expect(box.height).toEqual(y2 - y1);
        });

      });

      // tests for each path shape that it moves the cursor position!!

    });

});
