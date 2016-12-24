import { Geometry } from '../src/geometry.js'


describe('Geometry', () => {
    'use strict';

    var geometry;

    beforeAll(() => {
      geometry = new Geometry();
    });

    describe('union', () => {

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
      ].forEach((testCase) => {
        it(testCase.description, () => {

          var box = geometry.union(testCase.box1, testCase.box2);

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
      ].forEach((testCase) => {
        it(testCase.description, () => {

          var box = geometry.union(testCase.box1, testCase.box2);

          expect(box.y).toBe(testCase.y);
          expect(box.height).toBe(testCase.height);
        });
      });

    });


    describe('totalTransform', () => {

      it('[] => {translate: {x: 0, y: 0}, scale: {x: 1, y: 1}}', () => {
        var transforms = [];

        var result = geometry.totalTransform(transforms);

        expect(result.translate.x).toBe(0);
        expect(result.translate.y).toBe(0);
        expect(result.scale.x).toBe(1);
        expect(result.scale.y).toBe(1);
      });

      it('[t1] => {translate: {x: t1.x, y: t1.y}, scale: {x: 1, y: 1}}', () => {
        var transforms = [
          {translate: {x: 10, y: 11}}
        ];

        var result = geometry.totalTransform(transforms);

        expect(result.translate.x).toBe(10);
        expect(result.translate.y).toBe(11);
        expect(result.scale.x).toBe(1);
        expect(result.scale.y).toBe(1);
      });

      it('[t1, t2] => {translate: {x: t1.x + t2.x, y: t1.y + t2.y}, scale: {x: 1, y: 1}}', () => {
        var transforms = [
          {translate: {x: 10, y: 11}},
          {translate: {x: 12, y: 13}}
        ];

        var result = geometry.totalTransform(transforms);

        expect(result.translate.x).toBe(10 + 12);
        expect(result.translate.y).toBe(11 + 13);
        expect(result.scale.x).toBe(1);
        expect(result.scale.y).toBe(1);
      });

      it('[s1] => {translate: {x: 0, y: 0}, scale: {x: s1.x, y: s1.y}}', () => {
        var transforms = [
          {scale: {x: 10, y: 11}}
        ];

        var result = geometry.totalTransform(transforms);

        expect(result.translate.x).toBe(0);
        expect(result.translate.y).toBe(0);
        expect(result.scale.x).toBe(10);
        expect(result.scale.y).toBe(11);
      });

      it('[s1, s2] => {translate: {x: 0, y: 0}, scale: {x: s1.x * s2.x, y: s1.y * s2.y}}', () => {
        var transforms = [
          {scale: {x: 10, y: 11}},
          {scale: {x: 12, y: 13}}
        ];

        var result = geometry.totalTransform(transforms);

        expect(result.translate.x).toBe(0);
        expect(result.translate.y).toBe(0);
        expect(result.scale.x).toBe(10 * 12);
        expect(result.scale.y).toBe(11 * 13);
      });

      it('[t1, s1] => {translate: {x: t1.x, y: t1.y}, scale: {x: s1.x, y: s1.y}}', () => {
        var transforms = [
          {translate: {x: 10, y: 11}},
          {scale: {x: 12, y: 13}}
        ];

        var result = geometry.totalTransform(transforms);

        expect(result.translate.x).toBe(10);
        expect(result.translate.y).toBe(11);
        expect(result.scale.x).toBe(12);
        expect(result.scale.y).toBe(13);
      });

      it('[s1, t1] => {translate: {x: t1.x * s1.x, y: t1.y * s1.y}, scale: {x: s1.x, y: s1.y}}', () => {
        var transforms = [
          {scale: {x: 10, y: 11}},
          {translate: {x: 12, y: 13}}
        ];

        var result = geometry.totalTransform(transforms);

        expect(result.translate.x).toBe(12 * 10);
        expect(result.translate.y).toBe(13 * 11);
        expect(result.scale.x).toBe(10);
        expect(result.scale.y).toBe(11);
      });

      it('[s1, t1, s2] => {translate: {x: t1.x * s1.x, y: t1.y * s1.y}, scale: {x: s1.x * s2.x, y: s1.y * s2.y}}', () => {
        var transforms = [
          {scale: {x: 10, y: 11}},
          {translate: {x: 12, y: 13}},
          {scale: {x: 14, y: 15}}
        ];

        var result = geometry.totalTransform(transforms);

        expect(result.translate.x).toBe(12 * 10);
        expect(result.translate.y).toBe(13 * 11);
        expect(result.scale.x).toBe(10 * 14);
        expect(result.scale.y).toBe(11 * 15);
      });

      it('[s1, t1, s2, t2] => {translate: {x: t1.x * s1.x + t2.x * s1.x * s2.x, y: t1.y * s1.y + t2.t * s1.y * s2.y}, scale: {x: s1.x * s2.x, y: s1.y * s2.y}}', () => {
        var transforms = [
          {scale: {x: 10, y: 11}},
          {translate: {x: 12, y: 13}},
          {scale: {x: 14, y: 15}},
          {translate: {x: 16, y: 17}}
        ];

        var result = geometry.totalTransform(transforms);

        expect(result.translate.x).toBe(12 * 10 + 16 * 10 * 14);
        expect(result.translate.y).toBe(13 * 11 + 17 * 11 * 15);
        expect(result.scale.x).toBe(10 * 14);
        expect(result.scale.y).toBe(11 * 15);
      });

    });


    describe('getRectAroundLine', () => {

      it('should return a rect with all the corners overlapping when the line has no length', () => {
        [0, 1, -1].forEach((value) => {
          var width = 1;

          var rect = geometry.getRectAroundLine(value, value, value, value, width);

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

      it('should return a rect overlapping the given line when the width is zero', () => {
        [ {x1:  0, y1:  0, x2: 10, y2:  0}, // horizontal
          {x1: -1, y1: -1, x2: 10, y2: -1},
          {x1: 10, y1: 20, x2: -1, y2: 20},
          {x1: 10, y1: 20, x2: 10, y2: 30}, // vertical
          {x1:  0, y1: 20, x2:  0, y2: -5},
          {x1:  0, y1:  0, x2: 10, y2:  0}, // oblique
          {x1: -1, y1: -1, x2: 10, y2: -1},
          {x1: 10, y1: 20, x2: -1, y2: 20}
        ].forEach((line) => {
          var width = 0,
            x1 = line.x1, y1 = line.y1,
            x2 = line.x2, y2 = line.y2;

          var rect = geometry.getRectAroundLine(x1, y1, x2, y2, width);

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

      it('should return a rect of the specified width around the given line', () => {
        [ {x1:  0, y1:  0, x2: 10, y2:  0},
          {x1: 10, y1:  2, x2:  5, y2:  2},
          {x1: -1, y1: -1, x2: 10, y2: -1},
          {x1: 10, y1: 20, x2: -1, y2: 20}
        ].forEach((line) => {
          [1, 2, 3, 4, 5].forEach((width) => {
            var epsilon = 0.0001,
              x1 = line.x1, y1 = line.y1,
              x2 = line.x2, y2 = line.y2;

            var rect = geometry.getRectAroundLine(x1, y1, x2, y2, width);

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

      it('oblique line of a given width to be contained within a rect', () => {
        [ {x1:  1, y1:  1, x2: 10, y2: 20},
          {x1: 10, y1: 20, x2:  1, y2:  1},
          {x1: -1, y1: -1, x2: 10, y2: 20},
          {x1: 10, y1: 20, x2: -1, y2: -1}
        ].forEach((line) => {
          [1, 2, 3, 4, 5].forEach((width) => {
            var epsilon = 0.0001,
              x1 = line.x1, y1 = line.y1,
              x2 = line.x2, y2 = line.y2;

            var rect = geometry.getRectAroundLine(x1, y1, x2, y2, width);

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


    describe('getParallelsAroundSegment', () => {

      it('should return 2 horizontal segments when the given segment is horizontal', () => {
        var x1 = 10, y = 11, x2 = 20,
            d = 2;

        var lines = geometry.getParallelsAroundSegment(x1, y, x2, y, d);

        expect(lines.length).toBe(2);
        expect(Math.abs(lines[0].y1 - y)).toBe(d);
        expect(Math.abs(lines[0].y2 - y)).toBe(d);
        expect(Math.abs(lines[1].y1 - y)).toBe(d);
        expect(Math.abs(lines[1].y2 - y)).toBe(d);
      });

      it('should return 2 vertical segments when the given segment is vertical', () => {
        var x = 10, y1 = 11, y2 = 20,
            d = 2;

        var lines = geometry.getParallelsAroundSegment(x, y1, x, y2, d);

        expect(lines.length).toBe(2);
        expect(Math.abs(lines[0].x1 - x)).toBe(d);
        expect(Math.abs(lines[0].x2 - x)).toBe(d);
        expect(Math.abs(lines[1].x1 - x)).toBe(d);
        expect(Math.abs(lines[1].x2 - x)).toBe(d);
      });

      it('should return 2 oblique parallel segments when the given segment is oblique', () => {
        var x1 = 10, y1 = 11, x2 = 20, y2 = 21,
            d = 2;

        var lines = geometry.getParallelsAroundSegment(x1, y1, x2, y2, d);

        var m = (y2 - y1) / (x2 - x1),
          m0 = (lines[0].y2 - lines[0].y1) / (lines[0].x2 - lines[0].x1),
          m1 = (lines[1].y2 - lines[1].y1) / (lines[1].x2 - lines[1].x1);
        expect(lines.length).toBe(2);
        expect(m0).toBe(m);
        expect(m1).toBe(m);
      });

    });


    describe('getIntersectionOfTwoLines', () => {

      it('should return the intersection point', () => {
        var l1 = { x1: 1, y1: 10, x2: 2, y2: 12 },
            l2 = { x1: 1, y1: 12, x2: 2, y2: 10 };

        var p = geometry.getIntersectionOfTwoLines(l1, l2);

        expect(p.x).toBe(1.5);
        expect(p.y).toBe(11);
      });

      it('should return an undefined point when the lines are parallel', () => {
        var l1 = { x1: 1, y1: 10, x2: 2, y2: 12 },
            l2 = { x1: 2, y1: 12, x2: 3, y2: 14 };

        var p = geometry.getIntersectionOfTwoLines(l1, l2);

        expect(p.x).toEqual(NaN);
        expect(p.y).toEqual(NaN);
      });

    });


    describe('getAcuteAngleBetweenThreePoints', () => {

      it('should return the angle between 3 arbitrary lines', () => {
        var x1 = 0, y1 = 0,
            x2 = 8, y2 = 6,
            x3 = 8, y3 = 0;

        var a = geometry.getAcuteAngleBetweenThreePoints(x1, y1, x2, y2, x3, y3);

        expect(a).toBe(Math.atan(8 / 6));
      });

      it('should return PI/2 when the points describe 2 perpendicular lines', () => {
        var x1 = 0, y1 = 0,
            x2 = 8, y2 = 0,
            x3 = 8, y3 = 6;

        var a = geometry.getAcuteAngleBetweenThreePoints(x1, y1, x2, y2, x3, y3);

        expect(a).toBe(Math.PI / 2);
      });

      it('should return 0 when the first and the last points are the same', () => {
        var x1 = 0, y1 = 0,
            x2 = 1, y2 = 2,
            x3 = 0, y3 = 0;

        var a = geometry.getAcuteAngleBetweenThreePoints(x1, y1, x2, y2, x3, y3);

        expect(a).toEqual(0);
      });

    });


});
