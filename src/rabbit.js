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
    var found = [], index = 0, styles, foundShape;
    do {
      index = findShape(shape, where, index, opt);
      if (index !== -1) {
        styles = collectStyles(where, index - 1);
        foundShape = where.slice(index, index + shape.length);
        found.push(foundShape.concat(styles));
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

  collectStyles = (stack, lastIndex) => {
    var styles = [], call;
    for(var i = 0; i <= lastIndex; i++) {
      call = stack[i];
      if (isStyle(call)) {
        styles.push(call);
      }
    }
    return styles;
  },

  isStyle = (call) => {
    var styleNames = ['lineWidth', 'strokeStyle'];
    return styleNames.indexOf(call.attr) !== -1 ? true : false;
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
