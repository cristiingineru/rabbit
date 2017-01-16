/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

import { Rabbit } from '../src/rabbit.js'
import '../node_modules/Canteen/build/canteen.min'


describe('Rabbit', () => {
    'use strict';

    var findAllShapesIgnoringArguments;

    beforeAll(() => {
      findAllShapesIgnoringArguments = (new Rabbit()).findAllShapesIgnoringArguments;
    });

    describe('findAllShapesIgnoringArguments', () => {

      var fixture, placeholder, ctxS, ctxW, stackS, stackW;

      beforeEach(() => {
        fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 300px">').find('#demo-container').get(0);

        placeholder = $('<canvas id="placeholderActual" /><canvas id="placeholderExpected" />');
        placeholder.appendTo(fixture);
        ctxS = placeholder[0].getContext('2d');
        ctxW = placeholder[1].getContext('2d');
        stackS = null;
        stackW = null;
      });

      it('should return an empty array when any or both of the shapes are empty, null or undefined', () => {
        [
          {stackS: null, stackW: null},
          {stackS: null, stackW: []},
          {stackS: [], stackW: null},
          {stackS: [], stackW: []},
          {stackS: ['garbage'], stackW: []},
          {stackS: [], stackW: ['garbage']},
          {stackS: undefined, stackW: undefined},
          {stackS: undefined, stackW: []},
          {stackS: [], stackW: undefined},
          {stackS: undefined, stackW: undefined},
          {stackS: undefined, stackW: null},
          {stackS: null, stackW: undefined},
        ].forEach((tc) => {
          var result = findAllShapesIgnoringArguments(tc.stackS, tc.stackW);

          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBe(0);
        });
      });

    });

});
