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

    placeholder = $('<canvas id="placeholderActual"  /><canvas id="placeholderExpected"  />');
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
    });

    it('should fail when actual is empty and expected is not empty', () => {
      ctxE.strokeRect(10, 20, 30, 40);

      var result = toBePartOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
    });

    it('should fail when actual is not empty and expected is empty', () => {
      ctxA.strokeRect(10, 20, 30, 40);

      var result = toBePartOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
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
    });

    it('should not ignore the value of an attribute change when specified so', () => {
      ctxA.lineWidth = 2;
      ctxE.lineWidth = 3;

      var result = toBePartOf(ctxA.stack(), ctxE.stack(), {ignoreArguments: false});

      expect(result.pass).toBe(false);
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

    it('should use zero decimal precision by default when comparing the number values', () => {
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
    });

    it('should fail when actual is empty and expected is not empty', () => {
      ctxE.strokeRect(10, 20, 30, 40);

      var result = toBeInsideTheAreaOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
    });

    it('should fail when actual is not empty and expected is empty', () => {
      ctxA.strokeRect(10, 20, 30, 40);

      var result = toBeInsideTheAreaOf(ctxA.stack(), ctxE.stack());

      expect(result.pass).toBe(false);
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
    });
  });

});
