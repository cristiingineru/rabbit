/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

import { Rabbit } from '../src/rabbit.js'
import '../node_modules/Canteen/build/canteen.min'


describe('Rabbit', () => {
    'use strict';

    var findShapes;

    beforeAll(() => {
      findShapes = (new Rabbit()).findShapes;
    });

    describe('findShapes', () => {

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
          var result = findShapes(tc.stackS, tc.stackW);

          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBe(0);
        });
      });

      it('should ignore the arguments of the calls and attributes by default', () => {
        ctxS.lineWidth = 10;
        ctxS.strokeRect(10, 20, 30, 40);

        ctxW.lineWidth = 12;
        ctxW.strokeRect(12, 22, 32, 42);

        var result = findShapes(ctxS.stack(), ctxW.stack());

        expect(result.length).toBe(1);
      });

      it('should ignore the arguments of the calls and attributes when requested so', () => {
        ctxS.lineWidth = 10;
        ctxS.strokeRect(10, 20, 30, 40);

        ctxW.lineWidth = 12;
        ctxW.strokeRect(12, 22, 32, 42);

        var result = findShapes(ctxS.stack(), ctxW.stack(), {ignoreArguments: true});

        expect(result.length).toBe(1);
      });

      it('should not ignore the arguments of the calls and attributes when requested so', () => {
        ctxS.lineWidth = 10;
        ctxS.strokeRect(10, 20, 30, 40);

        ctxW.lineWidth = 12;
        ctxW.strokeRect(12, 22, 32, 42);

        var result = findShapes(ctxS.stack(), ctxW.stack(), {ignoreArguments: false});

        expect(result.length).toBe(0);
      });

      it('should use the specified precision when comparing the arguments of the calls and attributes', () => {
        ctxS.lineWidth = 10.002;
        ctxS.strokeRect(10.008, 20.003, 30.006, 40.003);

        ctxW.lineWidth = 10.001;
        ctxW.strokeRect(10.007, 20.004, 30.007, 40.001);

        var result = findShapes(ctxS.stack(), ctxW.stack(), {ignoreArguments: false, precision: 2});

        expect(result.length).toBe(1);
      });

      it('should use zero decimal precision when comparing the arguments of the calls and attributes', () => {
        ctxS.lineWidth = 10.2;
        ctxS.strokeRect(10.8, 20.3, 30.6, 40.3);

        ctxW.lineWidth = 10.1;
        ctxW.strokeRect(10.7, 20.4, 30.7, 40.1);

        var result = findShapes(ctxS.stack(), ctxW.stack(), {ignoreArguments: false});

        expect(result.length).toBe(1);
      });

      it('should return all previouse styles set before the found shape', () => {
        ctxS.strokeRect(10, 20, 30, 40);

        ctxW.strokeStyle = '#0000AA';
        ctxW.lineWidth = 12;
        ctxW.strokeRect(10, 20, 30, 40);

        var result = findShapes(ctxS.stack(), ctxW.stack());

        expect(result.length).toBe(1);
        expect(result[0].length).toBe(3);
      });


    });

});
