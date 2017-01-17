"use strict";

import { Geometry } from './geometry.js'
import { CustomMatchers } from './customMatchers.js'
import { Comparators } from './comparators.js'


export function Rabbit(geometry, matchers, comparators) {

  geometry = geometry || new Geometry();
  matchers = matchers || new CustomMatchers();
  comparators = comparators || new Comparators();


  var findShapes = (shape, where, opt) => {
    opt = Object.assign({
      ignoreArguments: true,
      precision: 0
    }, opt || {});
    var found = [], index = 0;
    do {
      index = findShape(shape, where, index, opt);
      if (index !== -1) {
        found.push(where.slice(index, index + shape.length));
        index += shape.length;
      }
    } while (index !== -1 && index < where.length);
    return found;
  },

  findShape = (shape, where, startIndex, opt) => {
    startIndex = startIndex || 0;
    var match = false, index = -1;
    if (Array.isArray(shape) && shape.length > 0 && Array.isArray(where) && where.length > 0) {
      for (var i = startIndex; i <= where.length - shape.length; i++) {
        match = true;
        for (var j = 0; j < shape.length; j++) {
          if (!comparators.sameCalls(where[i + j], shape[j], opt.ignoreArguments, opt.precision)) {
            match = false;
            break;
          }
        }
        if (match === true) {
          index = i;
          break;
        }
      }
    }
    return index;
  },

  removeShapes = (shapes, from) => {
    var copy = from.slice(0, from.length);
    shapes.forEach((shape) => {
      var index = -1;
      do {
        index = findShape(shape, copy);
        if (index !== -1) {
          copy.splice(index, shape.length);
        }
      } while (index !== -1);
    });
    return copy;
  };


  this.getBBox = geometry.getBBox;
  this.customMatchers = matchers;
  this.findShapes = findShapes;
  this.removeShapes = removeShapes;

}
