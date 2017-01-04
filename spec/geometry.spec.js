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

      it('should return an undefined point when the given lines are parallel', () => {
        var l1 = { x1: 1, y1: 10, x2: 2, y2: 12 },
            l2 = { x1: 2, y1: 12, x2: 3, y2: 14 };

        [
          {l1: l1, l2: l2},
          {l1: l2, l2: l1}
        ].forEach((tc) => {
          var p = geometry.getIntersectionOfTwoLines(l1, l2);

          expect(p.x).toEqual(NaN);
          expect(p.y).toEqual(NaN);
        });
      });

      it('should return the intersection point of two arbitrary lines', () => {
        var l1 = { x1: 1, y1: 10, x2: 2, y2: 12 },
            l2 = { x1: 1, y1: 12, x2: 2, y2: 10 };

        [
          {l1: l1, l2: l2},
          {l1: l2, l2: l1}
        ].forEach((tc) => {
          var p = geometry.getIntersectionOfTwoLines(l1, l2);

          expect(p.x).toBe(1.5);
          expect(p.y).toBe(11);
        });
      });

      it('should return the intersection point of two perpendicular lines', () => {
        var l1 = { x1: 17, y1:  1, x2: 17, y2:  5 },
            l2 = { x1: 20, y1:  8, x2: 30, y2:  8 };

        [
          {l1: l1, l2: l2},
          {l1: l2, l2: l1}
        ].forEach((tc) => {
          var p = geometry.getIntersectionOfTwoLines(tc.l1, tc.l2);

          expect(p.x).toBe(17);
          expect(p.y).toBe(8);
        });
      });

    });


    describe('getAngleBetweenThreePoints', () => {

      it('should return PI/2 when the points describe 2 perpendicular lines', () => {
        var x1 = 0, y1 = 0,
            x2 = 8, y2 = 0,
            x3 = 8, y3 = 6;

        var a = geometry.getAngleBetweenThreePoints(x1, y1, x2, y2, x3, y3);

        expect(a).toBe(Math.PI / 2);
      });

      it('should return 0 when the first and the last points are the same', () => {
        var x1 = 0, y1 = 0,
            x2 = 1, y2 = 2,
            x3 = 0, y3 = 0;

        var a = geometry.getAngleBetweenThreePoints(x1, y1, x2, y2, x3, y3);

        expect(a).toEqual(0);
      });

      it('should return the angle between 3 arbitrary points', () => {

        //  The next test cases are based on a triangle of this shape.
        //  All the angles of the given triangle will be measured and then
        //the angle from the top will be splitted in half and quarters.
        //To make the math simpler it is assumed that splitting the base segment
        //in half is making the opposite angle half as well - this is false,
        //but the error is small when the angle is small too.
        //
        //            (2,8)
        //              ^
        //             / \
        //            /   \
        //           /     \
        //          /       \
        //         -----------
        //      (0,0)       (4,0)
        //

        var baseAngle = 1.3258176636680326,
            upperAngle = Math.PI - 2 * baseAngle;

        [
          {x1: 2, y1: 8, x2: 0, y2: 0, x3: 4, y3: 0, a: baseAngle},
          {x1: 4, y1: 0, x2: 0, y2: 0, x3: 2, y3: 8, a: baseAngle},

          {x1: 2, y1: 8, x2: 4, y2: 0, x3: 0, y3: 0, a: baseAngle},
          {x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 8, a: baseAngle},

          {x1: 0, y1: 0, x2: 2, y2: 8, x3: 4, y3: 0, a: upperAngle},
          {x1: 4, y1: 0, x2: 2, y2: 8, x3: 0, y3: 0, a: upperAngle},

          {x1: 0, y1: 0, x2: 2, y2: 8, x3: 1, y3: 0, a: 0.25 * upperAngle},
          {x1: 0, y1: 0, x2: 2, y2: 8, x3: 2, y3: 0, a: 0.5 * upperAngle},
          {x1: 0, y1: 0, x2: 2, y2: 8, x3: 3, y3: 0, a: 0.75 * upperAngle},

          {x1: 1, y1: 0, x2: 2, y2: 8, x3: 2, y3: 0, a: 0.25 * upperAngle},
          {x1: 1, y1: 0, x2: 2, y2: 8, x3: 3, y3: 0, a: 0.5 * upperAngle},
          {x1: 1, y1: 0, x2: 2, y2: 8, x3: 4, y3: 0, a: 0.75 * upperAngle},

          {x1: 2, y1: 0, x2: 2, y2: 8, x3: 3, y3: 0, a: 0.25 * upperAngle},
          {x1: 2, y1: 0, x2: 2, y2: 8, x3: 4, y3: 0, a: 0.5 * upperAngle},

          {x1: 3, y1: 0, x2: 2, y2: 8, x3: 4, y3: 0, a: 0.25 * upperAngle}
        ].forEach((tc) => {

          var a = geometry.getAngleBetweenThreePoints(tc.x1, tc.y1, tc.x2, tc.y2, tc.x3, tc.y3);

          // Gross aproximation to compensate the aproximate angle specified in the test case.
          // The 0.5, 1.5 and 2 factors are introducing errors,
          //but small enough as long as the angle is small.
          expect(a).toBeCloseTo(tc.a, 2);
        });
      });

    });


    describe('getTheCenterOfTheCorner', () => {

      it('should return undefined center of the circle describing the corner for a zero angle', () => {
        var x0 = 1, y0 = 1, x1 = 10, y1 = 1, x2 = -1, y2 = 1, r = 2;

        var c = geometry.getTheCenterOfTheCorner(x0, y0, x1, y1, x2, y2, r);

        expect(c.x).toEqual(NaN);
        expect(c.y).toEqual(NaN);
      });

      it('should return undefined center of the circle describing the corner for a straight angle', () => {
        var x0 = 1, y0 = 1, x1 = 10, y1 = 1, x2 = 20, y2 = 1, r = 2;

        var c = geometry.getTheCenterOfTheCorner(x0, y0, x1, y1, x2, y2, r);

        expect(c.x).toEqual(NaN);
        expect(c.y).toEqual(NaN);
      });

      it('should return the center of the circle describing the corner for an acute angle and a small radius', () => {
        var x0 = 8, y0 = 10, x1 = 17, y1 = 10, x2 = 9, y2 = 15, r = 2;

        var c = geometry.getTheCenterOfTheCorner(x0, y0, x1, y1, x2, y2, r);

        expect(c.x).toBeGreaterThan(x0);
        expect(c.x).toBeLessThan(x1);
        expect(c.x).toBeGreaterThan(x2);
        expect(c.y).toBeGreaterThan(y0);
        expect(c.y).toBeGreaterThan(y1);
        expect(c.y).toBeLessThan(y2);
      });

      it('should return the center of the circle describing the corner for an acute angle and a great radius', () => {
        var x0 = 8, y0 = 10, x1 = 17, y1 = 10, x2 = 9, y2 = 15, r = 4;

        var c = geometry.getTheCenterOfTheCorner(x0, y0, x1, y1, x2, y2, r);

        expect(c.x).toBeLessThan(x0);
        expect(c.x).toBeLessThan(x1);
        expect(c.x).toBeLessThan(x2);
        expect(c.y).toBeGreaterThan(y0);
        expect(c.y).toBeGreaterThan(y1);
        expect(c.y).toBeLessThan(y2);
      });

      it('should return the center of the circle describing the corner for an optuse angle and a small radius', () => {
        var x0 = -10, y0 = 0, x1 = 10, y1 = 5, x2 = 10, y2 = 0, r = 2;

        var c = geometry.getTheCenterOfTheCorner(x0, y0, x1, y1, x2, y2, r);

        expect(c.x).toBeGreaterThan(x0);
        expect(c.x).toBeLessThan(x2);
        expect(c.y).toBeGreaterThan(y0);
        expect(c.y).toBeLessThan(y1);
        expect(c.y).toBeGreaterThan(y2);
      });

      it('should return the center of the circle describing the corner for an optuse angle and a great radius', () => {
        var x0 = -10, y0 = 0, x1 = 10, y1 = 5, x2 = 10, y2 = 0, r = 8;

        var c = geometry.getTheCenterOfTheCorner(x0, y0, x1, y1, x2, y2, r);

        expect(c.x).toBeGreaterThan(x0);
        expect(c.x).toBeLessThan(x2);
        expect(c.y).toBeLessThan(y0);
        expect(c.y).toBeLessThan(y1);
        expect(c.y).toBeLessThan(y2);
      });

    });


    describe('getTheFootOfThePerpendicular', () => {

      it('should return the foot of the perpendicular from a point to an oblique line', () => {
        [
          // m = 1
          {x1: 10, y1: 11, x2: 12, y2: 13, cx: 12, cy: 11},
          {x1: 10, y1: 11, x2: 12, y2: 13, cx: 10, cy: 13},
          {x1: 12, y1: 13, x2: 10, y2: 11, cx: 12, cy: 11},
          {x1: 12, y1: 13, x2: 10, y2: 11, cx: 10, cy: 13},

          // m = -1
          {x1: 10, y1: 13, x2: 12, y2: 11, cx: 10, cy: 11},
          {x1: 10, y1: 13, x2: 12, y2: 11, cx: 12, cy: 13},
          {x1: 12, y1: 11, x2: 10, y2: 13, cx: 10, cy: 11},
          {x1: 12, y1: 11, x2: 10, y2: 13, cx: 12, cy: 13}
        ].forEach((tc) => {
            var p = geometry.getTheFootOfThePerpendicular(tc.x1, tc.y1, tc.x2, tc.y2, tc.cx, tc.cy);

            // reusing the same foot
            expect(p.x).toBe(11);
            expect(p.y).toBe(12);
          });
      });

      it('should return the foot of the perpendicular from a point to an horizontal line', () => {
        [
          // m = 0
          {x1: -1, y1: 1, x2: 10, y2: 1, cx:  50, cy:  6, px:  50, py: 1},
          {x1: -1, y1: 1, x2: 10, y2: 1, cx: -50, cy: -6, px: -50, py: 1}
        ].forEach((tc) => {
            var p = geometry.getTheFootOfThePerpendicular(tc.x1, tc.y1, tc.x2, tc.y2, tc.cx, tc.cy);

            expect(p.x).toBe(tc.px);
            expect(p.y).toBe(tc.py);
          });
      });

      it('should return the foot of the perpendicular from a point to a vertical line', () => {
        [
          // m = Infinity
          {x1: -1, y1:  1, x2: -1, y2: 10, cx:  50, cy:  6, px:  -1, py: 6},
          {x1: -1, y1:  1, x2: -1, y2: 10, cx: -50, cy:  6, px:  -1, py: 6},
          {x1: -1, y1: 10, x2: -1, y2:  1, cx:  50, cy:  6, px:  -1, py: 6},
          {x1: -1, y1: 10, x2: -1, y2:  1, cx: -50, cy:  6, px:  -1, py: 6}
        ].forEach((tc) => {
            var p = geometry.getTheFootOfThePerpendicular(tc.x1, tc.y1, tc.x2, tc.y2, tc.cx, tc.cy);

            expect(p.x).toBe(tc.px);
            expect(p.y).toBe(tc.py);
          });
      });

      it('should return the point when the line is given by the same point twice', () => {
        [
          // m = NaN
          {x1: 1, y1:  2, x2: 1, y2: 2, cx: 10, cy: 11}
        ].forEach((tc) => {
            var p = geometry.getTheFootOfThePerpendicular(tc.x1, tc.y1, tc.x2, tc.y2, tc.cx, tc.cy);

            expect(p.x).toEqual(NaN);
            expect(p.y).toEqual(NaN);
          });
      });

    });


    describe('xyToArcAngle', () => {

      it('should return undefined angle when the center of the circle and the point are the same', () => {
          var cx = 10, cy = 11, x = 10, y = 11;

          var a = geometry.xyToArcAngle(cx, cy, x, y);

          expect(a).toEqual(NaN);
      });

      it('should return the angle given by a center of a circle and an arbitrary point', () => {
        var r = 2;

          [
            {cx: 10, cy: 11, x: 12, y: 11, a: 0 * Math.PI / 4},
            {cx: 10, cy: 11, x: 12, y: 13, a: 1 * Math.PI / 4},
            {cx: 10, cy: 11, x: 10, y: 13, a: 2 * Math.PI / 4},
            {cx: 10, cy: 11, x:  8, y: 13, a: 3 * Math.PI / 4},
            {cx: 10, cy: 11, x:  8, y: 11, a: 4 * Math.PI / 4},
            {cx: 10, cy: 11, x:  8, y:  9, a: 5 * Math.PI / 4},
            {cx: 10, cy: 11, x: 10, y:  9, a: 6 * Math.PI / 4},
            {cx: 10, cy: 11, x: 12, y:  9, a: 7 * Math.PI / 4},

            {cx: 10, cy: 11, x: 10 + r             , y: 11                 , a: 0 * Math.PI / 6},
            {cx: 10, cy: 11, x: 10 + r*Math.sqrt(3), y: 11 + r             , a: 1 * Math.PI / 6},
            {cx: 10, cy: 11, x: 10 + r             , y: 11 + r*Math.sqrt(3), a: 2 * Math.PI / 6},
            {cx: 10, cy: 11, x: 10                 , y: 11 + r             , a: 3 * Math.PI / 6},
            {cx: 10, cy: 11, x: 10 - r             , y: 11 + r*Math.sqrt(3), a: 4 * Math.PI / 6},
            {cx: 10, cy: 11, x: 10 - r*Math.sqrt(3), y: 11 + r             , a: 5 * Math.PI / 6},
            {cx: 10, cy: 11, x: 10 - r             , y: 11                 , a: 6 * Math.PI / 6},
            {cx: 10, cy: 11, x: 10 - r*Math.sqrt(3), y: 11 - r             , a: 7 * Math.PI / 6},
            {cx: 10, cy: 11, x: 10 - r             , y: 11 - r*Math.sqrt(3), a: 8 * Math.PI / 6}
          ].forEach((tc) => {
            var a = geometry.xyToArcAngle(tc.cx, tc.cy, tc.x, tc.y);

            expect(a).toBeCloseTo(tc.a, 8);
          });
      });

    });


    describe('scaledRadius', () => {

      it('should return the scaled radius when the x and y scales are the same', () => {
        [
          {r: 1, sx: 1, sy: 1, a: 0*Math.PI/6},
          {r: 1, sx: 1, sy: 1, a: 1*Math.PI/6},
          {r: 1, sx: 2, sy: 2, a: 2*Math.PI/6},
          {r: 3, sx: 3, sy: 3, a: 3*Math.PI/6},
          {r: 2, sx: 2, sy: 2, a: 4*Math.PI/6},
          {r: 1, sx: 3, sy: 3, a: 5*Math.PI/6},
          {r: 2, sx: 3, sy: 3, a: 6*Math.PI/6},
          {r: 3, sx: 3, sy: 3, a: 7*Math.PI/6},
          {r: 4, sx: 3, sy: 3, a: 8*Math.PI/6},
          {r: 5, sx: 3, sy: 3, a: 9*Math.PI/6}
        ].forEach((tc) => {
          var d = geometry.scaledRadius(tc.r, tc.sx, tc.sy, tc.a);

          expect(d).toBeCloseTo(tc.r * tc.sx, 8);
          expect(d).toBeCloseTo(tc.r * tc.sy, 8);
        });
      });

      it('should return the scaled radius with sx only for a = 0 or PI', () => {
        [
          {r: 1, sx: 1, sy: 11, a: 0*Math.PI/2},
          {r: 1, sx: 1, sy: 11, a: 2*Math.PI/2},
          {r: 1, sx: 2, sy: 22, a: 4*Math.PI/2},
          {r: 3, sx: 3, sy: 33, a: 6*Math.PI/2},
          {r: 2, sx: 2, sy: 22, a: 8*Math.PI/2}
        ].forEach((tc) => {
          var d = geometry.scaledRadius(tc.r, tc.sx, tc.sy, tc.a);

          expect(d).toBeCloseTo(tc.r * tc.sx, 8);
        });
      });

      it('should return the scaled radius with sy only for a = PI/2 or 3*PI/2', () => {
        [
          {r: 1, sx: 1, sy: 11, a: 1*Math.PI/2},
          {r: 1, sx: 1, sy: 11, a: 3*Math.PI/2},
          {r: 1, sx: 2, sy: 22, a: 5*Math.PI/2},
          {r: 3, sx: 3, sy: 33, a: 7*Math.PI/2},
          {r: 2, sx: 2, sy: 22, a: 9*Math.PI/2}
        ].forEach((tc) => {
          var d = geometry.scaledRadius(tc.r, tc.sx, tc.sy, tc.a);

          expect(d).toBeCloseTo(tc.r * tc.sy, 8);
        });
      });

      it('should return the scaled radius with sx and sy depending on the angle', () => {
        [
          //{r: 1, sx: 1, sy: 1, a: 0*Math.PI/6},
          {r: 1, sx: 1, sy: 11, a: 1*Math.PI/6},
          {r: 1, sx: 2, sy: 22, a: 2*Math.PI/6},
          //{r: 3, sx: 3, sy: 3, a: 3*Math.PI/6},
          {r: 2, sx: 2, sy: 22, a: 4*Math.PI/6},
          {r: 1, sx: 3, sy: 33, a: 5*Math.PI/6},
          //{r: 1, sx: 3, sy: 3, a: 6*Math.PI/6},
          {r: 1, sx: 3, sy: 33, a: 7*Math.PI/6},
          {r: 1, sx: 3, sy: 33, a: 8*Math.PI/6},
          //{r: 1, sx: 3, sy: 3, a: 9*Math.PI/6}
        ].forEach((tc) => {
          var d = geometry.scaledRadius(tc.r, tc.sx, tc.sy, tc.a);

          expect(tc.sx).toBeLessThan(tc.sy);
          expect(d).toBeGreaterThan(tc.r * tc.sx);
          expect(d).toBeLessThan(tc.r * tc.sy);
        });
      });

    });


    describe('decomposeArcTo', () => {

      it('should return only a valid end point when the points are the same or the (x0, y0) is not specified', () => {
        [
          {x0: 10, y0:  5, x1: 10, y1:  5, x2: 10, y2:  5, r: 3},
          {x0: 10, y0: 10, x1: 10, y1: 10, x2: 10, y2: 10, r: 3},
          {x0: NaN, y0: NaN, x1: 11, y1: 12, x2: 13, y2: 14, r: 3}
        ].forEach((tc) => {

          var arcTo = geometry.decomposeArcTo(tc.x0, tc.y0, tc.x1, tc.y1, tc.x2, tc.y2, tc.r);

          expect(arcTo.line).toBeFalsy();

          expect(arcTo.arc).toBeFalsy();

          expect(arcTo.point.x).toBe(tc.x1);
          expect(arcTo.point.y).toBe(tc.y1);
        });
      });

      it('should return only a valid line from (x0, y0) to (x1, y1) and an end point when the points are collinear', () => {
        [
          {x0: 10, y0:  5, x1: 20, y1:  5, x2: 30, y2:  5, r: 3},
          {x0: 10, y0:  5, x1: 10, y1: 15, x2: 10, y2: 20, r: 3},
          {x0: 10, y0: 11, x1: 20, y1: 21, x2: 30, y2: 31, r: 3}
        ].forEach((tc) => {

          var arcTo = geometry.decomposeArcTo(tc.x0, tc.y0, tc.x1, tc.y1, tc.x2, tc.y2, tc.r);

          expect(arcTo.line.x1).toBe(tc.x0);
          expect(arcTo.line.y1).toBe(tc.y0);
          expect(arcTo.line.x2).toBe(tc.x1);
          expect(arcTo.line.y2).toBe(tc.y1);

          expect(arcTo.arc).toBeFalsy();

          expect(arcTo.point.x).toBe(tc.x1);
          expect(arcTo.point.y).toBe(tc.y1);
        });
      });

      it('should return a valid line, an arc and an end point for a 90 degrees corner', () => {
        var r = 3;

        [
          {// └
            x0: 20, y0: 0, x1: 20, y1: 5, x2: 30, y2: 5, r: r,
            linex1: +0, liney1: +0, linex2: +0, liney2: -r,
            arcx: +r, arcy: -r, arcsAngle: 1 * Math.PI / 2, arceAngle: 2 * Math.PI / 2,
            pointx: +r, pointy: +0
          },
          { // ┐
            x0: 10, y0: 5, x1: 20, y1: 5, x2: 20, y2: 30, r: r,
            linex1: +0, liney1: +0, linex2: -r, liney2: +0,
            arcx: -r, arcy: +r, arcsAngle: 0 * Math.PI / 2, arceAngle: 3 * Math.PI / 2,
            pointx: +0, pointy: +r
          }
        ].forEach((tc) => {

          var arcTo = geometry.decomposeArcTo(tc.x0, tc.y0, tc.x1, tc.y1, tc.x2, tc.y2, tc.r);

          expect(arcTo.line.x1).toBe(tc.x0 + tc.linex1);
          expect(arcTo.line.y1).toBe(tc.y0 + tc.liney1);
          expect(arcTo.line.x2).toBe(tc.x1 + tc.linex2);
          expect(arcTo.line.y2).toBe(tc.y1 + tc.liney2);

          expect(arcTo.arc.x).toBe(tc.x1 + tc.arcx);
          expect(arcTo.arc.y).toBe(tc.y1 + tc.arcy);
          expect(arcTo.arc.r).toBe(tc.r);
          expect(arcTo.arc.sAngle % (2*Math.PI)).toBeCloseTo(tc.arcsAngle, 8);
          expect(arcTo.arc.eAngle % (2*Math.PI)).toBeCloseTo(tc.arceAngle, 8);
          expect(arcTo.arc.counterclockwise).toBe(false);

          //the order of the angles is also important
          expect(arcTo.arc.sAngle).toBeLessThan(arcTo.arc.eAngle);

          expect(arcTo.point.x).toBe(tc.x1 + tc.pointx);
          expect(arcTo.point.y).toBe(tc.y1 + tc.pointy);
        });
      });

    });

});
