/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

import { Geometry } from '../src/geometry.js'
import '../node_modules/Canteen/build/canteen.min'


describe('Geometry', () => {
    'use strict';

    var getBBox,
        resetCanvas = (ctx) => {
          ctx.clearRect(0, 0, ctx.context.canvas.width, ctx.context.canvas.height);
          ctx.setTransform(1,0,0,1,0,0);
          ctx.beginPath();
          ctx.clear();
        };

    beforeAll(() => {
      getBBox = (new Geometry()).getBBox;
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
          var box = getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
      });

      it('should return {x: NaN, y: NaN, width: NaN, height: NaN} when using unsupported canvas functions', () => {
          ctx.bezierCurveTo(1, 2, 3, 4, 5, 6);

          var box = getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
      });

      describe('stroked arc', () => {

        it('should not return the box of just an arc', () => {
          var cx = 11, cy = 12, r = 13, sAngle, eAngle, counterclockwise;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);

          var box = getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

        it('should return the box of a stroked 2*PI arc', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.stroke();

          var box = getBBox(ctx.stack({decimalPoints: 20}));

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

          var box = getBBox(ctx.stack({decimalPoints: 20}));

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

        it('should return the box of a stroked 2*PI arc width lineWidth = 2', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise,
            lineWidth = 2;
          ctx.lineWidth = lineWidth;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.stroke();

          var box = getBBox(ctx.stack({decimalPoints: 20}));

          expect(box.x).toBe(cx - r - lineWidth / 2);
          expect(box.y).toBe(cy - r - lineWidth / 2);
          expect(box.width).toBe(2 * r + lineWidth);
          expect(box.height).toBe(2 * r + lineWidth);
        });

        it('should return the box of a scaled stroked arc width lineWidth = 2', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise,
            xScale = 2, yScale = 3, lineWidth = 2;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.scale(xScale, yScale);
          ctx.lineWidth = lineWidth;
          ctx.stroke();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(cx - r - lineWidth / 2 * xScale);
          expect(box.y).toBe(cy - r - lineWidth / 2 * yScale);
          expect(box.width).toBeCloseTo(2 * r + lineWidth * xScale, 2);
          expect(box.height).toBeCloseTo(2 * r + lineWidth * yScale, 2);
        });

        it('should use a previouse lineWidth after restoring', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise,
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

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(cx - r - lineWidth2 / 2);
          expect(box.y).toBe(cy - r - lineWidth2 / 2);
          expect(box.width).toBe(2 * r + lineWidth2);
          expect(box.height).toBe(2 * r + lineWidth2);
        });

        it('should return an undefined box when the angle is zero or almost zero (different counterclockwise)', () => {
          var cx = 10, cy = 20, r = 7;

          [{
            cx: cx, cy: cy, r: r, sAngle: 0, eAngle: 0, counterclockwise: false,
            box: {x: cx - r, y: cy - r, width: 2*r, height: 2*r}
          }, {
            cx: cx, cy: cy, r: r, sAngle: Math.PI/2, eAngle: Math.PI/2, counterclockwise: false,
            box: {x: cx - r, y: cy - r, width: 2*r, height: 2*r}
          }, {
            cx: cx, cy: cy, r: r, sAngle: 0, eAngle: 4*Math.PI/2, counterclockwise: true,
            box: {x: cx - r, y: cy - r, width: 2*r, height: 2*r}
          }].forEach((tc) => {
            ctx.clear();
            ctx.arc(tc.cx, tc.cy, tc.r, tc.sAngle, tc.eAngle, tc.counterclockwise);
            ctx.stroke();

            var box = getBBox(ctx.stack({decimalPoints: 20}));

            expect(box.x).toEqual(NaN);
            expect(box.y).toEqual(NaN);
            expect(box.width).toEqual(NaN);
            expect(box.height).toEqual(NaN);
          });
        });

        it('should return the box of a stroked arc segment (different counterclockwise)', () => {
          var cx = 10, cy = 20, r = 7;

          [{
            cx: cx, cy: cy, r: r, sAngle: 0, eAngle: 2*Math.PI, counterclockwise: false,
            box: {x: cx - r, y: cy - r, width: 2*r, height: 2*r}
          }, {
            cx: cx, cy: cy, r: r, sAngle: 0, eAngle: Math.PI, counterclockwise: false,
            box: {x: cx - r, y: cy, width: 2*r, height: r}
          }, {
            cx: cx, cy: cy, r: r, sAngle: 0, eAngle: Math.PI, counterclockwise: true,
            box: {x: cx - r, y: cy - r, width: 2*r, height: r}
          }, {
            cx: cx, cy: cy, r: r, sAngle: Math.PI/2, eAngle: Math.PI, counterclockwise: false,
            box: {x: cx - r, y: cy, width: r, height: r}
          }, {
            cx: cx, cy: cy, r: r, sAngle: Math.PI/2, eAngle: Math.PI, counterclockwise: true,
            box: {x: cx - r, y: cy - r, width: 2*r, height: 2*r}
          }].forEach((tc) => {
            ctx.clear();
            ctx.arc(tc.cx, tc.cy, tc.r, tc.sAngle, tc.eAngle, tc.counterclockwise);
            ctx.stroke();

            var box = getBBox(ctx.stack({decimalPoints: 20}));

            expect(box.x).toBeCloseTo(tc.box.x, 8);
            expect(box.y).toBeCloseTo(tc.box.y, 8);
            expect(box.width).toBeCloseTo(tc.box.width, 8);
            expect(box.height).toBeCloseTo(tc.box.height, 8);
          });
        });

        it('should return the box of a scaled stroked arc segment (different counterclockwise)', () => {
          var w = 1, sx = 2, sy = 3,
              cx = 10, cy = 20, r = 7;

          [{
            sx: sx, sy: sy,
            cx: cx, cy: cy, r: r, sAngle: 0, eAngle: 2*Math.PI, counterclockwise: false,
            box: {x: (cx - r - w/2)*sx, y: (cy - r - w/2)*sy, width: (2*r + w)*sx, height: (2*r+w)*sy}
          }, {
            sx: sx, sy: sy,
            cx: cx, cy: cy, r: r, sAngle: 0, eAngle: Math.PI, counterclockwise: false,
            box: {x: (cx - r - w/2)*sx, y: (cy)*sy, width: (2*r + w)*sx, height: (r + w/2)*sy}
          }, {
            sx: sx, sy: sy,
            cx: cx, cy: cy, r: r, sAngle: 0, eAngle: Math.PI, counterclockwise: true,
            box: {x: (cx - r - w/2)*sx, y: (cy - r - w/2)*sy, width: (2*r + w)*sx, height: (r + w/2)*sy}
          }, {
            sx: sx, sy: sy,
            cx: cx, cy: cy, r: r, sAngle: Math.PI/2, eAngle: Math.PI, counterclockwise: false,
            box: {x: (cx - r - w/2)*sx, y: (cy)*sy, width: (r + w/2)*sx, height: (r + w/2)*sy}
          }, {
            sx: sx, sy: sy,
            cx: cx, cy: cy, r: r, sAngle: Math.PI/2, eAngle: Math.PI, counterclockwise: true,
            box: {x: (cx - r - w/2)*sx, y: (cy - r - w/2)*sy, width: (2*r + w)*sx, height: (2*r + w)*sy}
          }].forEach((tc) => {
            resetCanvas(ctx);
            ctx.scale(tc.sx, tc.sy);
            ctx.lineWidth = w;
            ctx.arc(tc.cx, tc.cy, tc.r, tc.sAngle, tc.eAngle, tc.counterclockwise);
            ctx.stroke();

            var box = getBBox(ctx.stack({decimalPoints: 20}));

            expect(box.x).toBeCloseTo(tc.box.x, 8);
            expect(box.y).toBeCloseTo(tc.box.y, 8);
            expect(box.width).toBeCloseTo(tc.box.width, 8);
            expect(box.height).toBeCloseTo(tc.box.height, 8);
          });
        });

      });


      describe('filled arc', () => {

        it('should return the box of a filled arc', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise = false;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(cx - r);
          expect(box.y).toBe(cy - r);
          expect(box.width).toBe(2 * r);
          expect(box.height).toBe(2 * r);
        });

        it('should union the boxes of two filled arcs that are far from each other', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise = false,
            toRightShift = 40, toBottomShift = 50;
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.arc(cx + toRightShift, cy + toBottomShift, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(cx - r);
          expect(box.y).toBe(cy - r);
          expect(box.width).toBe(2 * r + toRightShift);
          expect(box.height).toBe(2 * r + toBottomShift);
        });

        it('should translate the box of a filled arc', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise = false,
            xTranslate = 15, yTranslate = 16;
          ctx.translate(xTranslate, yTranslate);
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(cx - r + xTranslate);
          expect(box.y).toBe(cy - r + yTranslate);
          expect(box.width).toBe(2 * r);
          expect(box.height).toBe(2 * r);
        });

        it('should not translate the box of a filled arc after restoring', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise = false,
            xTranslate = 15, yTranslate = 16;
          ctx.save();
          ctx.translate(xTranslate, yTranslate);
          ctx.restore();
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(cx - r);
          expect(box.y).toBe(cy - r);
          expect(box.width).toBe(2 * r);
          expect(box.height).toBe(2 * r);
        });

        it('should scale the box of a filled arc', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise = false,
            xScale = 15, yScale = 16;
          ctx.scale(xScale, yScale);
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = getBBox(ctx.stack({decimalPoints: 20}));

          expect(box.x).toBe((cx - r) * xScale);
          expect(box.y).toBe((cy - r) * yScale);
          expect(box.width).toBe(2 * r * xScale);
          expect(box.height).toBe(2 * r * yScale);
        });

        it('should not scale the box of a filled arc after restoring', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise = false,
            xScale = 15, yScale = 16;
          ctx.save();
          ctx.scale(xScale, yScale);
          ctx.restore();
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(cx - r);
          expect(box.y).toBe(cy - r);
          expect(box.width).toBe(2 * r);
          expect(box.height).toBe(2 * r);
        });

        it('should translate the box of a filled arc based on a previous scale', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise = false,
            xScale = 15, yScale = 16, xTranslate = 17, yTranslate = 18;
          ctx.scale(xScale, yScale);
          ctx.translate(xTranslate, yTranslate);
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = getBBox(ctx.stack({decimalPoints: 20}));

          expect(box.x).toBe((cx - r + xTranslate) * xScale);
          expect(box.y).toBe((cy - r + yTranslate) * yScale);
          expect(box.width).toBe(2 * r * xScale);
          expect(box.height).toBe(2 * r * yScale);
        });

        it('should translate the box of a filled arc based on all previous scales', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise = false,
            xScale1 = 15, yScale1 = 16, xScale2 = 16, yScale2 = 17, xTranslate = 18, yTranslate = 19;
          ctx.scale(xScale1, yScale1);
          ctx.scale(xScale2, yScale2);
          ctx.translate(xTranslate, yTranslate);
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = getBBox(ctx.stack({decimalPoints: 20}));

          expect(box.x).toBe((cx - r + xTranslate) * xScale1 * xScale2);
          expect(box.y).toBe((cy - r + yTranslate) * yScale1 * yScale2);
          expect(box.width).toBe(2 * r * xScale1 * xScale2);
          expect(box.height).toBe(2 * r * yScale1 * yScale2);
        });

        it('should translate the box of a filled arc multiple times based on all previous scales', () => {
          var cx = 11, cy = 12, r = 13, sAngle = 0, eAngle = 2*Math.PI, counterclockwise = false,
            xScale1 = 15, yScale1 = 16, xScale2 = 16, yScale2 = 17,
            xTranslate1 = 18, yTranslate1 = 19, xTranslate2 = 20, yTranslate2 = 21;
          ctx.scale(xScale1, yScale1);
          ctx.translate(xTranslate1, yTranslate1);
          ctx.scale(xScale2, yScale2);
          ctx.translate(xTranslate2, yTranslate2);
          ctx.arc(cx, cy, r, sAngle, eAngle, counterclockwise);
          ctx.fill();

          var box = getBBox(ctx.stack({decimalPoints: 20}));

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

            var box = getBBox(ctx.stack());

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

            var box = getBBox(ctx.stack());

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

            var box = getBBox(ctx.stack());

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

            var box = getBBox(ctx.stack());

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

            var box = getBBox(ctx.stack());

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

            var box = getBBox(ctx.stack());

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

            var box = getBBox(ctx.stack());

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

            var box = getBBox(ctx.stack());

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

            var box = getBBox(ctx.stack());

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

              var box = getBBox(ctx.stack());

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

              var box = getBBox(ctx.stack());

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

          var box = getBBox(ctx.stack());

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

          var box = getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

      });


      describe('lineTo', () => {

        it('should not return the box of a stoked 1 point path given by lineTo', () => {
          var x = 10, y = 11;
          ctx.lineTo(x, y);
          ctx.stroke();

          var box = getBBox(ctx.stack());

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

          var box = getBBox(ctx.stack());

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

          var box = getBBox(ctx.stack());

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

          var box = getBBox(ctx.stack());

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

          var box = getBBox(ctx.stack());

          var minX = Math.min(x1, x2),
            minY = Math.min(y1, y2),
            maxX = Math.max(x1, x2),
            maxY = Math.max(y1, y2);
          expect(box.x).toEqual(minX);
          expect(box.y).toEqual(minY - width / 2);
          expect(box.width).toEqual(maxX - minX);
          expect(box.height).toEqual(maxY - minY + width);
        });

        it('should return the box of a vertical stoked 2 points path of width=3', () => {
          var width = 3,
            x1 = 10, y1 = 11, x2 = 10, y2 = 22;
          ctx.lineWidth = width;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          var box = getBBox(ctx.stack());

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

          var box = getBBox(ctx.stack());

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

          var box = getBBox(ctx.stack());

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

          var box = getBBox(ctx.stack());

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

          var box = getBBox(ctx.stack());

          var maxWidth = Math.max(width1, width2, width3);
          expect(box.x).toEqual(x1 - maxWidth / 2);
          expect(box.y).toEqual(y1);
          expect(box.width).toEqual(maxWidth);
          expect(box.height).toEqual(y2 - y1);
        });

      });


      describe('arcTo', () => {

        it('should not return the box of a stoked arcTo without a call to moveTo first', () => {
          var x0 = 7, y0 = 0, x1 = 5, y1 = 0, x2 = 5, y2 = 2, r = 2;
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.stroke();

          var box = getBBox(ctx.stack());

          expect(box.x).toEqual(NaN);
          expect(box.y).toEqual(NaN);
          expect(box.width).toEqual(NaN);
          expect(box.height).toEqual(NaN);
        });

        it('should move the cursor for the next draw instruction even when there is nothing to draw because the cursor was not previously initialized', () => {
          var x0 = 7, y0 = 0, x1 = 5, y1 = 0, x2 = 5, y2 = 2, r = 2;
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.lineTo(6, 1);
          ctx.stroke();

          var box = getBBox(ctx.stack());

          expect(box.x).toEqual(5);
          expect(box.y).toEqual(0);
          expect(box.width).toEqual(1);
          expect(box.height).toEqual(1);
        });

        it('should return the box of a stoked arcTo that contains an arc only', () => {
          var x0 = 7, y0 = 0, x1 = 5, y1 = 0, x2 = 5, y2 = 2, r = 2;
          ctx.moveTo(x0, y0);
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.stroke();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(5);
          expect(box.y).toBe(0);
          expect(box.width).toBeCloseTo(2, 8);
          expect(box.height).toBeCloseTo(2, 8);
        });

        it('should move the cursor for the next draw instruction for a stoked arcTo that contains an arc only', () => {
          var x0 = 7, y0 = 0, x1 = 5, y1 = 0, x2 = 5, y2 = 2, r = 2;
          ctx.moveTo(x0, y0);
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.lineTo(3, 4);
          ctx.stroke();

          var box = getBBox(ctx.stack());

          expect(box.x).toEqual(3);
          expect(box.y).toEqual(0);
          expect(box.width).toBeCloseTo(4);
          expect(box.height).toBeCloseTo(4);
        });

        it('should return the box of a stoked arcTo that contains an arc and a line', () => {
          var x0 = 11, y0 = 0, x1 = 5, y1 = 0, x2 = 5, y2 = 2, r = 2;
          ctx.moveTo(x0, y0);
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.stroke();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(5);
          expect(box.y).toBe(0);
          expect(box.width).toBeCloseTo(6);
          expect(box.height).toBeCloseTo(2);
        });

        it('should move the cursor for the next draw instruction for a stoked arcTo that contains an arc and a line', () => {
          var x0 = 11, y0 = 0, x1 = 5, y1 = 0, x2 = 5, y2 = 2, r = 2;
          ctx.moveTo(x0, y0);
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.lineTo(3, 4);
          ctx.stroke();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(3);
          expect(box.y).toBe(0);
          expect(box.width).toBeCloseTo(8);
          expect(box.height).toBeCloseTo(4);
        });

        it('should return the box of a stoked arcTo with lineWidth=4', () => {
          var x0 = 11, y0 = 0, x1 = 5, y1 = 0, x2 = 5, y2 = 2, r = 2;
          ctx.moveTo(x0, y0);
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.lineWidth = 4;
          ctx.stroke();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(3);
          expect(box.y).toBe(-2);
          expect(box.width).toBe(8);
          expect(box.height).toBe(4);
        });

        it('should return the box of a translated stoked arcTo with lineWidth=4', () => {
          var x0 = 11, y0 = 0, x1 = 5, y1 = 0, x2 = 5, y2 = 2, r = 2,
              tx = 10, ty = 11;
          ctx.translate(tx, ty);
          ctx.moveTo(x0, y0);
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.lineWidth = 4;
          ctx.stroke();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(3 + tx);
          expect(box.y).toBe(-2 + ty);
          expect(box.width).toBe(8);
          expect(box.height).toBe(4);
        });

        it('should return the box of a scaled stoked arcTo with lineWidth=4', () => {
          var x0 = 11, y0 = 0, x1 = 5, y1 = 0, x2 = 5, y2 = 2, r = 2,
              sx = 2, sy = 2,
              lineWidth = 4;
          ctx.scale(sx, sy);
          ctx.moveTo(x0, y0);
          ctx.arcTo(x1, y1, x2, y2, r);
          ctx.lineWidth = lineWidth;
          ctx.stroke();

          var box = getBBox(ctx.stack());

          expect(box.x).toBe(x1*sx - lineWidth*sx/2);
          expect(box.y).toBe(y0*sy - lineWidth*sy/2);
          expect(box.width).toBe(r*sx + lineWidth*sx/2 + 8);
          expect(box.height).toBe(r*sy + lineWidth*sy/2);
        });

      });

      // tests for each path shape that it moves the cursor position!!

    });

});
