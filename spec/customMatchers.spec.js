import { CustomMatchers } from '../src/customMatchers.js'
import '../node_modules/Canteen/build/canteen.min'

describe('customMatchers', () => {
  'use strict';

  var customMatchers;

  beforeAll(() => {
    customMatchers = new CustomMatchers();
  });

  var fixture, placeholder, ctxA, ctxE;

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

  });


});
