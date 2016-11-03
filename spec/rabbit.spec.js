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

      describe('arc', function() {

        it('should not return the box of just an arc', function () {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

        it('should return the box of a stroked arc', function () {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(cx - r);
          expect(box.y).toBe(cy - r);
          expect(box.width).toBe(2 * r);
          expect(box.height).toBe(2 * r);
        });

        it('should not return the box of an arc after calling beginPath', function () {
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

        it('should return the box of a filled arc', function () {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toBe(cx - r);
          expect(box.y).toBe(cy - r);
          expect(box.width).toBe(2 * r);
          expect(box.height).toBe(2 * r);
        });

        it('should union the boxes of two filled arcs that are far from each other', function () {
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

        it('should translate the box of a filled arc', function () {
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

        it('should not translate the box of a filled arc after restoring', function () {
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

        it('should scale the box of a filled arc', function () {
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

        it('should not scale the box of a filled arc after restoring', function () {
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

        it('should translate the box of a filled arc based on a previous scale', function () {
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

        it('should translate the box of a filled arc based on all previous scales', function () {
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

        it('should translate the box of a filled arc multiple times based on all previous scales', function () {
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

        describe(namedShapeUnderTest, function() {

          it('should return the box of a ' + namedShapeUnderTest, function () {
            var x = 11, y = 12, width = 13, height = 14;
            ctx[testCase.shape](x, y, width, height);
            if (testCase.drawFunction) ctx[testCase.drawFunction]();

            var box = rabbit.getBBox(ctx.stack());

            expect(box.x).toBe(x);
            expect(box.y).toBe(y);
            expect(box.width).toBe(width);
            expect(box.height).toBe(height);
          });

          it('should union the boxes of two ' + namedShapeUnderTest + ' that are far from each other', function () {
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

          it('should translate the box of a ' + namedShapeUnderTest, function () {
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

          it('should not translate the box of a ' + namedShapeUnderTest + ' after restoring', function () {
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

          it('should scale the box of a ' + namedShapeUnderTest, function () {
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

          it('should not scale the box of a ' + namedShapeUnderTest + ' after restoring', function () {
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

          it('should translate the box of a ' + namedShapeUnderTest + ' based on a previous scale', function () {
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

          it('should translate the box of a ' + namedShapeUnderTest + ' based on all previous scales', function () {
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

          it('should translate the box of a ' + namedShapeUnderTest + ' multiple times based on all previous scales', function () {
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
            it('should return the box of a ' + namedShapeUnderTest + ' with lineWidth = 2', function() {
              var x = 11, y = 12, width = 13, height = 14, lineWidth = 2;
              ctx.lineWidth = lineWidth;
              ctx[testCase.shape](x, y, width, height);
              if (testCase.drawFunction) ctx[testCase.drawFunction]();

              var box = rabbit.getBBox(ctx.stack());

              expect(box.x).toBe(x - lineWidth / 2);
              expect(box.y).toBe(y - lineWidth / 2);
              expect(box.width).toBe(width + lineWidth / 2);
              expect(box.height).toBe(height + lineWidth / 2);
            });
          }

        });

      });


      describe('lineTo', function() {

        it('should not return the box of a stoked 1 point path given by moveTo', function () {
          var x = 10, y = 11;
          ctx.moveTo(x, y);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

        it('should not return the box of a stoked 2 points path given by 2 moveTo', function () {
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

        it('should not return the box of a stoked 1 point path given by lineTo', function () {
          var x = 10, y = 11;
          ctx.lineTo(x, y);
          ctx.stroke();

          var box = rabbit.getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

        it('should return the box of a stoked 2 points path', function () {
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

        it('should return the box of a stoked 3 points path', function () {
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

        it('should return the box of an oblique stoked 2 points path of width=1', function () {
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

        it('should return the box of a horizontal stoked 2 points path of width=2', function () {
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

        it('should return the box of a vertical stoked 3 points path of width=3', function () {
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

        it('should scale the box of a 2 points stroked path of width=2', function () {
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

        it('should not scale the box of a 2 points stroked path of width=2 after restoring', function () {
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

        it('should translate the box of a 2 points stroked path of width=2 based on a previous scale', function () {
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

        it('should return the rect of the widest line when the path is stroked multiple times with different widths', function () {
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


    describe('union', function() {

      /*

      ** How to read the following specs **

      Two rectangles that don't overlap have a projection on the x axis like this:

        +--------+
        |        |
        |        |    +-----------+
        |        |    |           |
        +--------+    |           |
                      |           |
                      +-----------+

        ----------    -------------


      Two rectangles that overlap have a projection on the y axis like this:

        +-----------------+
        |                 |
        |         +---------------+
        |         |       |       |
        +-----------------+       |
                  |               |
                  +---------------+

        ----------=========--------


        Legend:
          The projection of a single rectangle is marked with the --- signs.
          The overlapping section is marked with the ==== signs.
          The => sign is showing the projection of the bounding box of the rectangles.

        The same conventions are valid for the y axis as well but they will be rotated by 90 degrees clockwise.

      */

      [ {
          description: 'horizontal --- ---  =>  --------',
          box1: {x: 0, width: 3}, box2: {x: 5, width: 3},
          x: 0, width: 8
        }, {
          description: 'horizontal --- ---  =>  --------',
          box1: {x: 1, width: 3}, box2: {x: 5, width: 3},
          x: 1, width: 7
        }, {
          description: 'horizontal -------  =>  --------',
          box1: {x: 1, width: 5}, box2: {x: 5, width: 3},
          x: 1, width: 7
        }, {
          description: 'horizontal ----===  =>  --------',
          box1: {x: 1, width: 7}, box2: {x: 5, width: 3},
          x: 1, width: 7
        }, {
          description: 'horizontal --===--  =>  --------',
          box1: {x: 1, width: 7}, box2: {x: 3, width: 3},
          x: 1, width: 7
        }, {
          description: 'horizontal -===---  =>  --------',
          box1: {x: 1, width: 7}, box2: {x: 2, width: 3},
          x: 1, width: 7
        }, {
          description: 'horizontal ===----  =>  --------',
          box1: {x: 1, width: 7}, box2: {x: 1, width: 3},
          x: 1, width: 7
        }, {
          description: 'horizontal -==----  =>  --------',
          box1: {x: 2, width: 6}, box2: {x: 1, width: 3},
          x: 1, width: 7
        }, {
          description: 'horizontal -------  =>  --------',
          box1: {x: 4, width: 4}, box2: {x: 1, width: 3},
          x: 1, width: 7
        }, {
          description: 'horizontal --- ---  =>  --------',
          box1: {x: 5, width: 3}, box2: {x: 1, width: 3},
          x: 1, width: 7
        }, {
          description: 'horizontal --- ---  =>  --------',
          box1: {x: 5, width: 3}, box2: {x: 0, width: 3},
          x: 0, width: 8
        }
      ].forEach(function(testCase) {
        it(testCase.description, function() {

          var box = rabbit.union(testCase.box1, testCase.box2);

          expect(box.x).toBe(testCase.x);
          expect(box.width).toBe(testCase.width);
        });
      });

      [ {
          description: 'vertical --- ---  =>  --------',
          box1: {y: 0, height: 3}, box2: {y: 5, height: 3},
          y: 0, height: 8
        }, {
          description: 'vertical --- ---  =>  --------',
          box1: {y: 1, height: 3}, box2: {y: 5, height: 3},
          y: 1, height: 7
        }, {
          description: 'vertical -------  =>  --------',
          box1: {y: 1, height: 5}, box2: {y: 5, height: 3},
          y: 1, height: 7
        }, {
          description: 'vertical ----===  =>  --------',
          box1: {y: 1, height: 7}, box2: {y: 5, height: 3},
          y: 1, height: 7
        }, {
          description: 'vertical --===--  =>  --------',
          box1: {y: 1, height: 7}, box2: {y: 3, height: 3},
          y: 1, height: 7
        }, {
          description: 'vertical -===---  =>  --------',
          box1: {y: 1, height: 7}, box2: {y: 2, height: 3},
          y: 1, height: 7
        }, {
          description: 'vertical ===----  =>  --------',
          box1: {y: 1, height: 7}, box2: {y: 1, height: 3},
          y: 1, height: 7
        }, {
          description: 'vertical -==----  =>  --------',
          box1: {y: 2, height: 6}, box2: {y: 1, height: 3},
          y: 1, height: 7
        }, {
          description: 'vertical -------  =>  --------',
          box1: {y: 4, height: 4}, box2: {y: 1, height: 3},
          y: 1, height: 7
        }, {
          description: 'vertical --- ---  =>  --------',
          box1: {y: 5, height: 3}, box2: {y: 1, height: 3},
          y: 1, height: 7
        }, {
          description: 'vertical --- ---  =>  --------',
          box1: {y: 5, height: 3}, box2: {y: 0, height: 3},
          y: 0, height: 8
        }
      ].forEach(function(testCase) {
        it(testCase.description, function() {

          var box = rabbit.union(testCase.box1, testCase.box2);

          expect(box.y).toBe(testCase.y);
          expect(box.height).toBe(testCase.height);
        });
      });

    });


    describe('totalTransform', function() {

      it('[] => {translate: {x: 0, y: 0}, scale: {x: 1, y: 1}}', function() {
        var transforms = [];

        var result = rabbit.totalTransform(transforms);

        expect(result.translate.x).toBe(0);
        expect(result.translate.y).toBe(0);
        expect(result.scale.x).toBe(1);
        expect(result.scale.y).toBe(1);
      });

      it('[t1] => {translate: {x: t1.x, y: t1.y}, scale: {x: 1, y: 1}}', function() {
        var transforms = [
          {translate: {x: 10, y: 11}}
        ];

        var result = rabbit.totalTransform(transforms);

        expect(result.translate.x).toBe(10);
        expect(result.translate.y).toBe(11);
        expect(result.scale.x).toBe(1);
        expect(result.scale.y).toBe(1);
      });

      it('[t1, t2] => {translate: {x: t1.x + t2.x, y: t1.y + t2.y}, scale: {x: 1, y: 1}}', function() {
        var transforms = [
          {translate: {x: 10, y: 11}},
          {translate: {x: 12, y: 13}}
        ];

        var result = rabbit.totalTransform(transforms);

        expect(result.translate.x).toBe(10 + 12);
        expect(result.translate.y).toBe(11 + 13);
        expect(result.scale.x).toBe(1);
        expect(result.scale.y).toBe(1);
      });

      it('[s1] => {translate: {x: 0, y: 0}, scale: {x: s1.x, y: s1.y}}', function() {
        var transforms = [
          {scale: {x: 10, y: 11}}
        ];

        var result = rabbit.totalTransform(transforms);

        expect(result.translate.x).toBe(0);
        expect(result.translate.y).toBe(0);
        expect(result.scale.x).toBe(10);
        expect(result.scale.y).toBe(11);
      });

      it('[s1, s2] => {translate: {x: 0, y: 0}, scale: {x: s1.x * s2.x, y: s1.y * s2.y}}', function() {
        var transforms = [
          {scale: {x: 10, y: 11}},
          {scale: {x: 12, y: 13}}
        ];

        var result = rabbit.totalTransform(transforms);

        expect(result.translate.x).toBe(0);
        expect(result.translate.y).toBe(0);
        expect(result.scale.x).toBe(10 * 12);
        expect(result.scale.y).toBe(11 * 13);
      });

      it('[t1, s1] => {translate: {x: t1.x, y: t1.y}, scale: {x: s1.x, y: s1.y}}', function() {
        var transforms = [
          {translate: {x: 10, y: 11}},
          {scale: {x: 12, y: 13}}
        ];

        var result = rabbit.totalTransform(transforms);

        expect(result.translate.x).toBe(10);
        expect(result.translate.y).toBe(11);
        expect(result.scale.x).toBe(12);
        expect(result.scale.y).toBe(13);
      });

      it('[s1, t1] => {translate: {x: t1.x * s1.x, y: t1.y * s1.y}, scale: {x: s1.x, y: s1.y}}', function() {
        var transforms = [
          {scale: {x: 10, y: 11}},
          {translate: {x: 12, y: 13}}
        ];

        var result = rabbit.totalTransform(transforms);

        expect(result.translate.x).toBe(12 * 10);
        expect(result.translate.y).toBe(13 * 11);
        expect(result.scale.x).toBe(10);
        expect(result.scale.y).toBe(11);
      });

      it('[s1, t1, s2] => {translate: {x: t1.x * s1.x, y: t1.y * s1.y}, scale: {x: s1.x * s2.x, y: s1.y * s2.y}}', function() {
        var transforms = [
          {scale: {x: 10, y: 11}},
          {translate: {x: 12, y: 13}},
          {scale: {x: 14, y: 15}}
        ];

        var result = rabbit.totalTransform(transforms);

        expect(result.translate.x).toBe(12 * 10);
        expect(result.translate.y).toBe(13 * 11);
        expect(result.scale.x).toBe(10 * 14);
        expect(result.scale.y).toBe(11 * 15);
      });

      it('[s1, t1, s2, t2] => {translate: {x: t1.x * s1.x + t2.x * s1.x * s2.x, y: t1.y * s1.y + t2.t * s1.y * s2.y}, scale: {x: s1.x * s2.x, y: s1.y * s2.y}}', function() {
        var transforms = [
          {scale: {x: 10, y: 11}},
          {translate: {x: 12, y: 13}},
          {scale: {x: 14, y: 15}},
          {translate: {x: 16, y: 17}}
        ];

        var result = rabbit.totalTransform(transforms);

        expect(result.translate.x).toBe(12 * 10 + 16 * 10 * 14);
        expect(result.translate.y).toBe(13 * 11 + 17 * 11 * 15);
        expect(result.scale.x).toBe(10 * 14);
        expect(result.scale.y).toBe(11 * 15);
      });

    });


    describe('getRectAroundLine', function() {

      it('should return a rect with all the corners overlapping when the line has no length', function() {
        [0, 1, -1].forEach(function(value) {
          var width = 1;

          var rect = rabbit.getRectAroundLine(value, value, value, value, width);

          expect(rect.x1).toBe(value);
          expect(rect.y1).toBe(value);
          expect(rect.x2).toBe(value);
          expect(rect.y2).toBe(value);
          expect(rect.x3).toBe(value);
          expect(rect.y3).toBe(value);
          expect(rect.x4).toBe(value);
          expect(rect.y4).toBe(value);
        });
      });

      it('should return a rect overlapping the given line when the width is zero', function() {
        [ {x1:  0, y1:  0, x2: 10, y2:  0}, // horizontal
          {x1: -1, y1: -1, x2: 10, y2: -1},
          {x1: 10, y1: 20, x2: -1, y2: 20},
          {x1: 10, y1: 20, x2: 10, y2: 30}, // vertical
          {x1:  0, y1: 20, x2:  0, y2: -5},
          {x1:  0, y1:  0, x2: 10, y2:  0}, // oblique
          {x1: -1, y1: -1, x2: 10, y2: -1},
          {x1: 10, y1: 20, x2: -1, y2: 20}
        ].forEach(function(line) {
          var width = 0,
            x1 = line.x1, y1 = line.y1,
            x2 = line.x2, y2 = line.y2;

          var rect = rabbit.getRectAroundLine(x1, y1, x2, y2, width);

          expect(rect.x1).toBe(line.x1);
          expect(rect.y1).toBe(line.y1);
          expect(rect.x4).toBe(line.x1);
          expect(rect.y4).toBe(line.y1);
          expect(rect.x2).toBe(line.x2);
          expect(rect.y2).toBe(line.y2);
          expect(rect.x3).toBe(line.x2);
          expect(rect.y3).toBe(line.y2);
        });
      });

      it('should return a rect of the specified width around the given line', function() {
        [ {x1:  0, y1:  0, x2: 10, y2:  0},
          {x1: 10, y1:  2, x2:  5, y2:  2},
          {x1: -1, y1: -1, x2: 10, y2: -1},
          {x1: 10, y1: 20, x2: -1, y2: 20}
        ].forEach(function(line) {
          [1, 2, 3, 4, 5].forEach(function(width) {
            var epsilon = 0.0001,
              x1 = line.x1, y1 = line.y1,
              x2 = line.x2, y2 = line.y2;

            var rect = rabbit.getRectAroundLine(x1, y1, x2, y2, width);

            var m = (y2 - y1) / (x2 - x1),
              m1 = (rect.y2 - rect.y1) / (rect.x2 - rect.x1),
              m2 = (rect.y3 - rect.y2) / (rect.x3 - rect.x2),
              L = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)),
              l = width,
              L1 = Math.sqrt((rect.x2 - rect.x1) * (rect.x2 - rect.x1) + (rect.y2 - rect.y1) * (rect.y2 - rect.y1)),
              l1 = Math.sqrt((rect.x3 - rect.x2) * (rect.x3 - rect.x2) + (rect.y3 - rect.y2) * (rect.y3 - rect.y2)),
              L2 = Math.sqrt((rect.x4 - rect.x3) * (rect.x4 - rect.x3) + (rect.y4 - rect.y3) * (rect.y4 - rect.y3)),
              l2 = Math.sqrt((rect.x1 - rect.x4) * (rect.x1 - rect.x4) + (rect.y1 - rect.y4) * (rect.y1 - rect.y4));
            expect(m1).toBeCloseTo(m, epsilon); // parallel with the horizontal line
            expect(m2).toBe(-Infinity); // vertical
            expect(L1).toBeCloseTo(L, epsilon);
            expect(l1).toBeCloseTo(l, epsilon);
            expect(L2).toBeCloseTo(L, epsilon);
            expect(l2).toBeCloseTo(l, epsilon);
          });
        });
      });

      it('oblique line of a given width to be contained within a rect', function() {
        [ {x1:  1, y1:  1, x2: 10, y2: 20},
          {x1: 10, y1: 20, x2:  1, y2:  1},
          {x1: -1, y1: -1, x2: 10, y2: 20},
          {x1: 10, y1: 20, x2: -1, y2: -1}
        ].forEach(function(line) {
          [1, 2, 3, 4, 5].forEach(function(width) {
            var epsilon = 0.0001,
              x1 = line.x1, y1 = line.y1,
              x2 = line.x2, y2 = line.y2;

            var rect = rabbit.getRectAroundLine(x1, y1, x2, y2, width);

            var m = (y2 - y1) / (x2 - x1),
              m1 = (rect.y2 - rect.y1) / (rect.x2 - rect.x1),
              m2 = (rect.y3 - rect.y2) / (rect.x3 - rect.x2),
              L = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)),
              l = width,
              L1 = Math.sqrt((rect.x2 - rect.x1) * (rect.x2 - rect.x1) + (rect.y2 - rect.y1) * (rect.y2 - rect.y1)),
              l1 = Math.sqrt((rect.x3 - rect.x2) * (rect.x3 - rect.x2) + (rect.y3 - rect.y2) * (rect.y3 - rect.y2)),
              L2 = Math.sqrt((rect.x4 - rect.x3) * (rect.x4 - rect.x3) + (rect.y4 - rect.y3) * (rect.y4 - rect.y3)),
              l2 = Math.sqrt((rect.x1 - rect.x4) * (rect.x1 - rect.x4) + (rect.y1 - rect.y4) * (rect.y1 - rect.y4));
            expect(m1).toBeCloseTo(m, epsilon); // parallel with the oblique line
            expect(m2).toBeCloseTo(-1 / m1, epsilon); // PI/2 angle with oblique line
            expect(L1).toBeCloseTo(L, epsilon);
            expect(l1).toBeCloseTo(l, epsilon);
            expect(L2).toBeCloseTo(L, epsilon);
            expect(l2).toBeCloseTo(l, epsilon);
          });
        });
      });

    })

});
