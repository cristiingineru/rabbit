"use strict";

import { Geometry } from './geometry.js'


export function CustomMatchers(geometry) {

  geometry = geometry || new Geometry();


  var toBePartOf = (util, customEqualityTesters) => {
    return {
      compare: (actual, expected) => {
        var match = false;
        for (var i = 0; i < expected.length - actual.length; i++) {
          match = actual.length > 0;
          for (var j = 0; j < actual.length; j++) {
            if (expected[i + j].method !== actual[j].method) {
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
      compare: (actual, expected) => {
        var smallShape = actual,
          bigShape = expected,
          bigShapeBBox = geometry.getBBox(bigShape),
          smallShapeBBox = geometry.getBBox(smallShape),
          center = {x: smallShapeBBox.x + smallShapeBBox.width / 2, y: smallShapeBBox.y + smallShapeBBox.height / 2},
          isCenterInside = geometry.isPointInsideRectangle(center, bigShapeBBox),
          result = isCenterInside ? {pass: true} : {pass: false, message: 'Shape is not inside the area of'};
        return result;
      }
    }
  },

  toHaveTheSamePositionWith = (util, customEqualityTesters) => {
    return {
      compare: (actual, expected) => {
        var actualBBox = geometry.getBBox(actual),
          expectedBBox = geometry.getBBox(expected),
          haveTheSamePosition = actualBBox.x === expectedBBox.x && actualBBox.y === expectedBBox.y,
          result = haveTheSamePosition ? {pass: true} : {pass: false, message: 'Shapes don`t have the same position'};
        return result;
      }
    }
  },

  toHaveTheSameSizeWith = (util, customEqualityTesters) => {
    return {
      compare: (actual, expected) => {
        var actualBBox = geometry.getBBox(actual),
          expectedBBox = geometry.getBBox(expected),
          haveTheSameSize = actualBBox.width === expectedBBox.width && actualBBox.height === expectedBBox.height,
          result = haveTheSameSize ? {pass: true} : {pass: false, message: 'Shapes don`t have the same size'};
        return result;
      }
    }
  },

  toBeHorizontallyAlignWith = (util, customEqualityTesters) => {
    return {
      compare: (actual, expected) => {
        var actualBBox = geometry.getBBox(actual),
          expectedBBox = geometry.getBBox(expected),
          haveTheSameAlignment = actualBBox.y === expectedBBox.y,
          result = haveTheSameAlignment ? {pass: true} : {pass: false, message: 'Shapes don`t have the same horizontal position'};
        return result;
      }
    }
  },

  toBeVerticallyAlignWith = (util, customEqualityTesters) => {
    return {
      compare: (actual, expected) => {
        var actualBBox = geometry.getBBox(actual),
          expectedBBox = geometry.getBBox(expected),
          haveTheSameAlignment = actualBBox.x === expectedBBox.x,
          result = haveTheSameAlignment ? {pass: true} : {pass: false, message: 'Shapes don`t have the same vertical position'};
        return result;
      }
    }
  };


  this.toBePartOf = toBePartOf;
  this.toBeInsideTheAreaOf = toBeInsideTheAreaOf;
  this.toHaveTheSamePositionWith = toHaveTheSamePositionWith;
  this.toHaveTheSameSizeWith = toHaveTheSameSizeWith;
  this.toBeHorizontallyAlignWith = toBeHorizontallyAlignWith;
  this.toBeVerticallyAlignWith = toBeVerticallyAlignWith;
}
