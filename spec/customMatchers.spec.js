import { CustomMatchers } from '../src/customMatchers.js'
import '../node_modules/Canteen/build/canteen.min'

describe('customMatchers', () => {
  'use strict';

  var customMatchers;

  beforeAll(() => {
    customMatchers = new CustomMatchers();
  });

  var fixture, placeholder, ctxA, ctxE;

  var resetCanvas = (ctx) => {
    ctx.clearRect(0, 0, ctx.context.canvas.width, ctx.context.canvas.height);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.beginPath();
    ctx.clear();
  };

  beforeEach(() => {
    fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 300px">').find('#demo-container').get(0);

    placeholder = $('<canvas id="placeholderActual" /><canvas id="placeholderExpected" />');
    placeholder.appendTo(fixture);
    ctxA = placeholder[0].getContext('2d');
    ctxE = placeholder[1].getContext('2d');
  });


  describe('toBePartOf', () => {

    var toBePartOf;

    beforeAll(() => {
      toBePartOf = customMatchers.toBePartOf().compare;
    });

    it('should fail when actual and expected are empty', () => {
      var result = toBePartOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is empty and expected is not empty', () => {
      ctxE.strokeRect(10, 20, 30, 40);

      var result = toBePartOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is not empty and expected is empty', () => {
      ctxA.strokeRect(10, 20, 30, 40);

      var result = toBePartOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should ignore the arguments of a call by default', () => {
      ctxA.strokeRect(10, 20, 30, 40);
      ctxE.strokeRect(11, 22, 33, 44);

      var result = toBePartOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(true);
    });

    it('should ignore the value of an attribute change by default', () => {
      ctxA.lineWidth = 2;
      ctxE.lineWidth = 3;

      var result = toBePartOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(true);
    });

    it('should ignore the arguments of a call when specified so', () => {
      ctxA.strokeRect(10, 20, 30, 40);
      ctxE.strokeRect(11, 22, 33, 44);

      var result = toBePartOf(ctxA.stack(), ctxE.stack(), {ignoreArguments: true});

      expect(result.pass).toBe(true);
    });

    it('should ignore the value of an attribute change when specified so', () => {
      ctxA.lineWidth = 2;
      ctxE.lineWidth = 3;

      var result = toBePartOf(ctxA.stack(), ctxE.stack(), {ignoreArguments: true});

      expect(result.pass).toBe(true);
    });

    it('should not ignore the arguments of a call when specified so', () => {
      ctxA.strokeRect(10, 20, 30, 40);
      ctxE.strokeRect(11, 22, 33, 44);

      var result = toBePartOf(ctxA.stack(), ctxE.stack(), {ignoreArguments: false});

      expect(result.pass).toBe(false);
      expect(result.message).toContain('comparing the arguments');
    });

    it('should not ignore the value of an attribute change when specified so', () => {
      ctxA.lineWidth = 2;
      ctxE.lineWidth = 3;

      var result = toBePartOf(ctxA.stack(), ctxE.stack(), {ignoreArguments: false});

      expect(result.pass).toBe(false);
      expect(result.message).toContain('comparing the arguments');
    });

    it('should use the specified precision when comparing the number values of the argument calls', () => {
      ctxA.strokeRect(10.001, 20.002, 30.003, 40.004);
      ctxE.strokeRect(10.002, 20.003, 30.004, 40.002);

      var result = toBePartOf(ctxA.stack(), ctxE.stack(), {
        ignoreArguments: false,
        precision: 2});

      expect(result.pass).toBe(true);
    });

    it('should use the specified precision when comparing the number values of the attributes', () => {
      ctxA.lineWidth = 2.001;
      ctxE.lineWidth = 2.002;

      var result = toBePartOf(ctxA.stack(), ctxE.stack(), {
        ignoreArguments: false,
        precision: 2});

      expect(result.pass).toBe(true);
    });

    it('should use zero decimal precision by default when comparing the numeric values', () => {
      ctxA.lineWidth = 2.8;
      ctxA.strokeRect(10.2, 20.3, 30.4, 40.2);
      ctxE.lineWidth = 2.7;
      ctxE.strokeRect(10.1, 20.2, 30.3, 40.4);

      var result = toBePartOf(ctxA.stack(), ctxE.stack(), {
        ignoreArguments: false});

      expect(result.pass).toBe(true);
    });

  });

  describe('toBeInsideTheAreaOf', () => {

    var toBeInsideTheAreaOf;

    beforeAll(() => {
      toBeInsideTheAreaOf = customMatchers.toBeInsideTheAreaOf().compare;
    });

    it('should fail when actual and expected are empty', () => {
      var result = toBeInsideTheAreaOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is empty and expected is not empty', () => {
      ctxE.strokeRect(10, 20, 30, 40);

      var result = toBeInsideTheAreaOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is not empty and expected is empty', () => {
      ctxA.strokeRect(10, 20, 30, 40);

      var result = toBeInsideTheAreaOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should pass when the actual is inside the bounding box of the expected', () => {
      ctxA.strokeRect(1, 1, 3, 3);
      ctxE.strokeRect(0, 0, 6, 6);

      var result = toBeInsideTheAreaOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(true);
    });

    it('should pass when box of the actual is the same with the box of the expected', () => {
      ctxA.strokeRect(1, 1, 3, 3);
      ctxE.strokeRect(1, 1, 3, 3);

      var result = toBeInsideTheAreaOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(true);
    });

    it('should fail if any of corners of the actual is outside the bounding box of the expected', () => {
      ctxE.strokeRect(0, 0, 6, 6);

      [
        {x:  1, y:  1, width: 3, height: 6},
        {x:  1, y:  1, width: 6, height: 3},
        {x:  1, y: -1, width: 3, height: 5},
        {x: -1, y:  1, width: 5, height: 3}
      ].forEach((tc) => {
        resetCanvas(ctxA);
        ctxA.strokeRect(tc.x, tc.y, tc.width, tc.height);

        var result = toBeInsideTheAreaOf(ctxA.stack(), ctxE.stack());

        expect(result.pass).toBe(false);
        expect(result.message).toContain('corners');
        expect(result.message).toContain(tc.x);
        expect(result.message).toContain(tc.y);
        expect(result.message).toContain(tc.width);
        expect(result.message).toContain(tc.height);
        expect(result.message).toContain(0);
        expect(result.message).toContain(0);
        expect(result.message).toContain(6);
        expect(result.message).toContain(6);
      });
    });

    it('should pass if the center of the actual is inside the bounding box of the expected when specified so', () => {
      ctxE.strokeRect(0, 0, 6, 6);

      [
        {x:  1, y:  1, width: 3, height: 6},
        {x:  1, y:  1, width: 6, height: 3},
        {x:  1, y: -1, width: 3, height: 5},
        {x: -1, y:  1, width: 5, height: 3}
      ].forEach((tc) => {
        resetCanvas(ctxA);
        ctxA.strokeRect(tc.x, tc.y, tc.width, tc.height);

        var result = toBeInsideTheAreaOf(ctxA.stack(), ctxE.stack(), {checkTheCenterOnly: true});

        expect(result.pass).toBe(true);
      });
    });

    it('should fail when the center of the actual is outside the bounding box of the expected', () => {
      ctxA.strokeRect(2, 3, 8, 9);
      ctxE.strokeRect(1, 1, 3, 3);

      var result = toBeInsideTheAreaOf(ctxA.stack(), ctxE.stack(), {checkTheCenterOnly: true});

      expect(result.pass).toBe(false);
      expect(result.message).toContain('center');
      expect(result.message).toContain(1);
      expect(result.message).toContain(3);
      expect(result.message).toContain(8);
      expect(result.message).toContain(9);
      expect(result.message).toContain(1);
      expect(result.message).toContain(1);
      expect(result.message).toContain(3);
      expect(result.message).toContain(3);
    });
  });

  describe('toHaveTheSamePositionWith', () => {

    var toHaveTheSamePositionWith;

    beforeAll(() => {
      toHaveTheSamePositionWith = customMatchers.toHaveTheSamePositionWith().compare;
    });

    it('should fail when actual and expected are empty', () => {
      var result = toHaveTheSamePositionWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is empty and expected is not empty', () => {
      ctxE.strokeRect(10, 20, 30, 40);

      var result = toHaveTheSamePositionWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is not empty and expected is empty', () => {
      ctxA.strokeRect(10, 20, 30, 40);

      var result = toHaveTheSamePositionWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should pass when the x and y of the bounding box of the actual are the same with the x and y of the expected', () => {
      ctxA.strokeRect(10, 20, 30, 40);
      ctxE.strokeRect(10, 20, 50, 60);

      var result = toHaveTheSamePositionWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(true);
    });

    it('should fail when the x of the bounding box of the actual is not the same with the x of the expected', () => {
      ctxA.strokeRect(10, 20, 30, 40);
      ctxE.strokeRect(11, 20, 50, 60);

      var result = toHaveTheSamePositionWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('x');
      expect(result.message).toContain(10);
      expect(result.message).toContain(11);
    });

    it('should fail when the y of the bounding box of the actual is not the same with the y of the expected', () => {
      ctxA.strokeRect(10, 20, 30, 40);
      ctxE.strokeRect(10, 21, 50, 60);

      var result = toHaveTheSamePositionWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('y');
      expect(result.message).toContain(20);
      expect(result.message).toContain(21);
    });

    it('should fail when the x and y of the bounding box of the actual are not the same with the x and y of the expected', () => {
      ctxA.strokeRect(11, 20, 30, 40);
      ctxE.strokeRect(10, 21, 50, 60);

      var result = toHaveTheSamePositionWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('x');
      expect(result.message).toContain(11);
      expect(result.message).toContain(10);
      expect(result.message).toContain('y');
      expect(result.message).toContain(20);
      expect(result.message).toContain(21);
    });

    it('should use the specified precision when comparing the x and y', () => {
      ctxA.strokeRect(10.001, 20.008, 30, 40);
      ctxE.strokeRect(10.002, 20.009, 50, 60);

      var result = toHaveTheSamePositionWith(ctxA.stack(), ctxE.stack(), {precision: 2});

      expect(result.pass).toBe(true);
    });

    it('should use zero decimal precision by default when comparing the x and y', () => {
      ctxA.strokeRect(10.1, 20.8, 30, 40);
      ctxE.strokeRect(10.2, 20.9, 50, 60);

      var result = toHaveTheSamePositionWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(true);
    });

  });

  describe('toHaveTheSameSizeWith', () => {

    var toHaveTheSameSizeWith;

    beforeAll(() => {
      toHaveTheSameSizeWith = customMatchers.toHaveTheSameSizeWith().compare;
    });

    it('should fail when actual and expected are empty', () => {
      var result = toHaveTheSameSizeWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is empty and expected is not empty', () => {
      ctxE.strokeRect(10, 20, 30, 40);

      var result = toHaveTheSameSizeWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is not empty and expected is empty', () => {
      ctxA.strokeRect(10, 20, 30, 40);

      var result = toHaveTheSameSizeWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should pass when the width and height of the bounding box of the actual are the same with the width and height of the expected', () => {
      ctxA.strokeRect(10, 20, 30, 40);
      ctxE.strokeRect(50, 60, 30, 40);

      var result = toHaveTheSameSizeWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(true);
    });

    it('should fail when the width of the bounding box of the actual is not the same with the width of the expected', () => {
      ctxA.strokeRect(10, 20, 31, 40);
      ctxE.strokeRect(50, 60, 30, 40);

      var result = toHaveTheSameSizeWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('width');
      expect(result.message).toContain(30);
      expect(result.message).toContain(31);
    });

    it('should fail when the height of the bounding box of the actual is not the same with the height of the expected', () => {
      ctxA.strokeRect(10, 20, 30, 41);
      ctxE.strokeRect(50, 60, 30, 40);

      var result = toHaveTheSameSizeWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('height');
      expect(result.message).toContain(40);
      expect(result.message).toContain(41);
    });

    it('should fail when the width and height of the bounding box of the actual are not the same with the width and height of the expected', () => {
      ctxA.strokeRect(10, 20, 30, 41);
      ctxE.strokeRect(50, 60, 31, 40);

      var result = toHaveTheSameSizeWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('width');
      expect(result.message).toContain(30);
      expect(result.message).toContain(31);
      expect(result.message).toContain('height');
      expect(result.message).toContain(41);
      expect(result.message).toContain(40);
    });

    it('should use the specified precision when comparing the width and height', () => {
      ctxA.strokeRect(10, 20, 30.001, 40.008);
      ctxE.strokeRect(50, 60, 30.002, 40.009);

      var result = toHaveTheSameSizeWith(ctxA.stack(), ctxE.stack(), {precision: 2});

      expect(result.pass).toBe(true);
    });

    it('should use zero decimal precision by default when comparing the width and height', () => {
      ctxA.strokeRect(10, 20, 30.1, 40.8);
      ctxE.strokeRect(50, 60, 30.2, 40.9);

      var result = toHaveTheSameSizeWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(true);
    });

  });

  describe('toBeHorizontallyAlignWith', () => {

    var toBeHorizontallyAlignWith;

    beforeAll(() => {
      toBeHorizontallyAlignWith = customMatchers.toBeHorizontallyAlignWith().compare;
    });

    it('should fail when actual and expected are empty', () => {
      var result = toBeHorizontallyAlignWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is empty and expected is not empty', () => {
      ctxE.strokeRect(10, 20, 30, 40);

      var result = toBeHorizontallyAlignWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is not empty and expected is empty', () => {
      ctxA.strokeRect(10, 20, 30, 40);

      var result = toBeHorizontallyAlignWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should pass when the top of the bounding box of the actual and expected are the same', () => {
      ctxA.strokeRect(10, 20, 30, 40);
      ctxE.strokeRect(50, 20, 70, 80);

      var result = toBeHorizontallyAlignWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(true);
    });

    it('should fail when the top of the bounding box of the actual and expected are not the same', () => {
      ctxA.strokeRect(10, 20, 30, 40);
      ctxE.strokeRect(50, 21, 70, 80);

      var result = toBeHorizontallyAlignWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('horizontal');
      expect(result.message).toContain('top');
      expect(result.message).toContain(20);
      expect(result.message).toContain(21);
    });

    it('should use the specified precision when comparing the horizontal positions', () => {
      ctxA.strokeRect(10, 20.001, 30, 40);
      ctxE.strokeRect(50, 20.002, 70, 80);

      var result = toBeHorizontallyAlignWith(ctxA.stack(), ctxE.stack(), {precision: 2});

      expect(result.pass).toBe(true);
    });

    it('should use zero decimal precision by default when comparing the horizontal positions', () => {
      ctxA.strokeRect(10, 20.1, 30, 40);
      ctxE.strokeRect(50, 20.2, 70, 80);

      var result = toBeHorizontallyAlignWith(ctxA.stack(), ctxE.stack(), {compare: 'top'});

      expect(result.pass).toBe(true);
    });

    it('should pass when the centers of the bounding box of the actual and expected are the same and requested to compare the centers', () => {
      ctxA.strokeRect(10, 20, 30, 80);
      ctxE.strokeRect(50, 40, 70, 60);

      var result = toBeHorizontallyAlignWith(ctxA.stack(), ctxE.stack(), {compare: 'center'});

      expect(result.pass).toBe(true);
    });

    it('should fail when the centers of the bounding box of the actual and expected are not the same and requested to compare the centers', () => {
      ctxA.strokeRect(10, 20, 30, 80);
      ctxE.strokeRect(50, 40, 70, 61);

      var result = toBeHorizontallyAlignWith(ctxA.stack(), ctxE.stack(), {compare: 'center'});

      expect(result.pass).toBe(false);
      expect(result.message).toContain('horizontal');
      expect(result.message).toContain('center');
      expect(result.message).toContain(50);
      expect(result.message).toContain(50.5);
    });

    it('should pass when the bottoms of the bounding box of the actual and expected are the same and requested to compare the bottoms', () => {
      ctxA.strokeRect(10, 20, 50, 30);
      ctxE.strokeRect(20, 10, 40, 40);

      var result = toBeHorizontallyAlignWith(ctxA.stack(), ctxE.stack(), {compare: 'bottom'});

      expect(result.pass).toBe(true);
    });

    it('should fail when the bottoms of the bounding box of the actual and expected are not the same and requested to compare the bottoms', () => {
      ctxA.strokeRect(10, 20, 50, 30);
      ctxE.strokeRect(20, 10, 40, 41);

      var result = toBeHorizontallyAlignWith(ctxA.stack(), ctxE.stack(), {compare: 'bottom'});

      expect(result.pass).toBe(false);
      expect(result.message).toContain('horizontal');
      expect(result.message).toContain('bottom');
      expect(result.message).toContain(50);
      expect(result.message).toContain(51);
    });

  });

  describe('toBeVerticallyAlignWith', () => {

    var toBeVerticallyAlignWith;

    beforeAll(() => {
      toBeVerticallyAlignWith = customMatchers.toBeVerticallyAlignWith().compare;
    });

    it('should fail when actual and expected are empty', () => {
      var result = toBeVerticallyAlignWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is empty and expected is not empty', () => {
      ctxE.strokeRect(10, 20, 30, 40);

      var result = toBeVerticallyAlignWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should fail when actual is not empty and expected is empty', () => {
      ctxA.strokeRect(10, 20, 30, 40);

      var result = toBeVerticallyAlignWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should pass when the left of the bounding box of the actual and expected are the same', () => {
      ctxA.strokeRect(10, 20, 30, 40);
      ctxE.strokeRect(10, 60, 70, 80);

      var result = toBeVerticallyAlignWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(true);
    });

    it('should fail when the left of the bounding box of the actual and expected are not the same', () => {
      ctxA.strokeRect(10, 20, 30, 40);
      ctxE.strokeRect(11, 60, 70, 80);

      var result = toBeVerticallyAlignWith(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
      expect(result.message).toContain('vertical');
      expect(result.message).toContain('left');
      expect(result.message).toContain(10);
      expect(result.message).toContain(11);
    });

    it('should use the specified precision when comparing the vertical positions', () => {
      ctxA.strokeRect(10.001, 20, 30, 40);
      ctxE.strokeRect(10.002, 60, 70, 80);

      var result = toBeVerticallyAlignWith(ctxA.stack(), ctxE.stack(), {precision: 2});

      expect(result.pass).toBe(true);
    });

    it('should use zero decimal precision by default when comparing the vertical positions', () => {
      ctxA.strokeRect(10.1, 20, 30, 40);
      ctxE.strokeRect(10.2, 60, 70, 80);

      var result = toBeVerticallyAlignWith(ctxA.stack(), ctxE.stack(), {compare: 'left'});

      expect(result.pass).toBe(true);
    });

    it('should pass when the centers of the bounding box of the actual and expected are the same and requested to compare the centers', () => {
      ctxA.strokeRect(20, 20, 40, 40);
      ctxE.strokeRect(10, 60, 50, 80);

      var result = toBeVerticallyAlignWith(ctxA.stack(), ctxE.stack(), {compare: 'center'});

      expect(result.pass).toBe(true);
    });

    it('should fail when the centers of the bounding box of the actual and expected are not the same and requested to compare the centers', () => {
      ctxA.strokeRect(20, 20, 40, 40);
      ctxE.strokeRect(10, 60, 51, 80);

      var result = toBeVerticallyAlignWith(ctxA.stack(), ctxE.stack(), {compare: 'center'});

      expect(result.pass).toBe(false);
      expect(result.message).toContain('vertical');
      expect(result.message).toContain('center');
      expect(result.message).toContain(30);
      expect(result.message).toContain(30.5);
    });

    it('should pass when the rights of the bounding box of the actual and expected are the same and requested to compare the rights', () => {
      ctxA.strokeRect(10, 20, 40, 40);
      ctxE.strokeRect(30, 60, 20, 80);

      var result = toBeVerticallyAlignWith(ctxA.stack(), ctxE.stack(), {compare: 'right'});

      expect(result.pass).toBe(true);
    });

    it('should fail when the rights of the bounding box of the actual and expected are not the same and requested to compare the rights', () => {
      ctxA.strokeRect(10, 20, 40, 40);
      ctxE.strokeRect(30, 60, 21, 80);

      var result = toBeVerticallyAlignWith(ctxA.stack(), ctxE.stack(), {compare: 'right'});

      expect(result.pass).toBe(false);
      expect(result.message).toContain('vertical');
      expect(result.message).toContain('right');
      expect(result.message).toContain(50);
      expect(result.message).toContain(51);
    });

  });

});
