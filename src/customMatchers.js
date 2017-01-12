"use strict";

import { Geometry } from './geometry.js'


export function CustomMatchers(geometry) {

  geometry = geometry || new Geometry();


  var toBePartOf = (util, customEqualityTesters) => {
    return {
      compare: (actual, expected, opt) => {
        opt = Object.assign({
          ignoreArguments: true,
          precision: 0
        }, opt || {});
        var match = false;
        for (var i = 0; i < expected.length - actual.length + 1; i++) {
          match = actual.length > 0;
          for (var j = 0; j < actual.length; j++) {
            if (!sameCalls(expected[i + j], actual[j], opt.ignoreArguments, opt.precision)) {
              match = false;
              break;
            }
          }
          if (match === true) {
            break;
          }
        }
        var result = match ? {pass: true} : {pass: false, message: 'Shape not part of'};
        return result;
      }
    }
  },

  toBeInsideTheAreaOf = (util, customEqualityTesters) => {
    return {
      compare: (actual, expected, opt) => {
        opt = Object.assign({
          checkTheCenterOnly: false
        }, opt || {});
        var validArguments = actual && actual.length > 0 && expected && expected.length > 0,
          smallShape = actual,
          bigShape = expected,
          bigShapeBBox = geometry.getBBox(bigShape),
          smallShapeBBox = geometry.getBBox(smallShape),
          smallShapeCorners = cornersOfABox(smallShapeBBox),
          isAnyCornerOutside = smallShapeCorners
            .reduce((prev, corner) => prev |= !geometry.isPointInsideRectangle(corner, bigShapeBBox), false),
          center = {x: smallShapeBBox.x + smallShapeBBox.width / 2, y: smallShapeBBox.y + smallShapeBBox.height / 2},
          isCenterInside = geometry.isPointInsideRectangle(center, bigShapeBBox),
          what = opt.checkTheCenterOnly ? 'center' : 'corners',
          result = !validArguments
            ? {pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected}
            : (!isAnyCornerOutside || (opt.checkTheCenterOnly && isCenterInside)
              ? {pass: true}
              : {pass: false, message: 'The ' + what + ' of the ' + JSON.stringify(smallShapeBBox) + ' not inside ' + JSON.stringify(bigShapeBBox)});
        return result;
      }
    }
  },

  toHaveTheSamePositionWith = (util, customEqualityTesters) => {
    return {
      compare: (actual, expected, opt) => {
        opt = Object.assign({
          precision: 0
        }, opt || {});
        var validArguments = actual && actual.length > 0 && expected && expected.length > 0,
          actualBBox = geometry.getBBox(actual),
          expectedBBox = geometry.getBBox(expected),
          haveTheSameX = sameValues(actualBBox.x, expectedBBox.x, opt.precision),
          haveTheSameY = sameValues(actualBBox.y, expectedBBox.y, opt.precision),
          haveTheSamePosition = haveTheSameX && haveTheSameY,
          result = !validArguments
            ? {pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected}
            : (haveTheSamePosition
              ? {pass: true}
              : (!haveTheSameX && !haveTheSameY
                ? {pass: false, message: 'Not the same x and y: ' + actualBBox.x + 'x' + actualBBox.y + ' vs. ' + expectedBBox.x + 'x' + expectedBBox.y + ' comparing with precision: ' + opt.precision}
                : (!haveTheSameX
                  ? {pass: false, message: 'Not the same x: ' + actualBBox.x + ' vs. ' + expectedBBox.x + ' comparing with precision: ' + opt.precision}
                  : {pass: false, message: 'Not the same y: ' + actualBBox.y + ' vs. ' + expectedBBox.y + ' comparing with precision: ' + opt.precision})));
        return result;
      }
    }
  },

  toHaveTheSameSizeWith = (util, customEqualityTesters) => {
    return {
      compare: (actual, expected, opt) => {
        opt = Object.assign({
          precision: 0
        }, opt || {});
        var validArguments = actual && actual.length > 0 && expected && expected.length > 0,
          actualBBox = geometry.getBBox(actual),
          expectedBBox = geometry.getBBox(expected),
          haveTheSameWidth = sameValues(actualBBox.width, expectedBBox.width, opt.precision),
          haveTheSameHeight = sameValues(actualBBox.height, expectedBBox.height, opt.precision),
          haveTheSameSizes = haveTheSameWidth && haveTheSameHeight,
          result = !validArguments
            ? {pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected}
            : (haveTheSameSizes
              ? {pass: true}
              : (!haveTheSameWidth && !haveTheSameHeight
                ? {pass: false, message: 'Not the same width and height: ' + actualBBox.width + 'x' + actualBBox.height + ' vs. ' + expectedBBox.width + 'x' + expectedBBox.height + ' comparing with precision: ' + opt.precision}
                : (!haveTheSameWidth
                  ? {pass: false, message: 'Not the same width: ' + actualBBox.width + ' vs. ' + expectedBBox.width + ' comparing with precision: ' + opt.precision}
                  : {pass: false, message: 'Not the same height: ' + actualBBox.height + ' vs. ' + expectedBBox.height + ' comparing with precision: ' + opt.precision})));
        return result;
      }
    }
  },

  toBeHorizontallyAlignWith = (util, customEqualityTesters) => {
    return {
      compare: (actual, expected, opt) => {
        opt = Object.assign({
          compare: 'top',
          precision: 0
        }, opt || {});
        var validArguments = actual && actual.length > 0 && expected && expected.length > 0,
          actualBBox = geometry.getBBox(actual),
          expectedBBox = geometry.getBBox(expected),
          y1 = opt.compare === 'top'
            ? actualBBox.y
            : (opt.compare === 'bottom'
              ? actualBBox.y + actualBBox.height
              : (actualBBox.y + actualBBox.height) / 2),
          y2 = opt.compare === 'top'
            ? expectedBBox.y
            : (opt.compare === 'bottom'
              ? expectedBBox.y + expectedBBox.height
              : (expectedBBox.y + expectedBBox.height) / 2),
          haveTheSameAlignment = sameValues(y1, y2),
          result = !validArguments
            ? {pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected}
            : (haveTheSameAlignment
              ? {pass: true}
              : {pass: false, message: 'Not the same horizontal ' + opt.compare + ' alignment: ' + y1 + ' and ' + y2 + ' comparing with precision: ' + opt.precision});
        return result;
      }
    }
  },

  toBeVerticallyAlignWith = (util, customEqualityTesters) => {
    return {
      compare: (actual, expected, opt) => {
        opt = Object.assign({
          compare: 'left',
          precision: 0
        }, opt || {});
        var validArguments = actual && actual.length > 0 && expected && expected.length > 0,
          actualBBox = geometry.getBBox(actual),
          expectedBBox = geometry.getBBox(expected),
          x1 = opt.compare === 'left'
            ? actualBBox.x
            : (opt.compare === 'right'
              ? actualBBox.x + actualBBox.width
              : (actualBBox.x + actualBBox.width) / 2),
          x2 = opt.compare === 'left'
            ? expectedBBox.x
            : (opt.compare === 'right'
              ? expectedBBox.x + expectedBBox.width
              : (expectedBBox.x + expectedBBox.width) / 2),
          haveTheSameAlignment = sameValues(x1, x2),
          result = !validArguments
            ? {pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected}
            : (haveTheSameAlignment
              ? {pass: true}
              : {pass: false, message: 'Not the same vertical ' + opt.compare + ' alignment: ' + x1 + ' and ' + x2 + ' comparing with precision: ' + opt.precision});
        return result;
      }
    }
  },

  sameValues = (val1, val2, precision) => {
    var same = false;
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      same = val1.toFixed(precision) === val2.toFixed(precision);
    } else {
      same = val1 == val2;
    }
    return same;
  },

  sameCalls = (call1, call2, ignoreArguments, precision) => {
    var same;
    if ((call1.method && call2.method) || (call1.attr && call2.attr)) {
      if (ignoreArguments) {
        same = true;
      } else {
        if (call1.attr) {
          same = sameValues(call1.val, call2.val, precision);
        } else {
          same = call1.arguments.length === call2.arguments.length;
          same &= call1.arguments.reduce(
            (prev, arg, index) => prev && sameValues(arg, call2.arguments[index], precision),
            true);
        }
      }
    }
    return same;
  },

  cornersOfABox = (box) => {
    return [
      {x: box.x, y: box.y},
      {x: box.x + box.width, y: box.y},
      {x: box.x + box.width, y: box.y + box.height},
      {x: box.x, y: box.y + box.height}
    ];
  };


  this.toBePartOf = toBePartOf;
  this.toBeInsideTheAreaOf = toBeInsideTheAreaOf;
  this.toHaveTheSamePositionWith = toHaveTheSamePositionWith;
  this.toHaveTheSameSizeWith = toHaveTheSameSizeWith;
  this.toBeHorizontallyAlignWith = toBeHorizontallyAlignWith;
  this.toBeVerticallyAlignWith = toBeVerticallyAlignWith;
}
