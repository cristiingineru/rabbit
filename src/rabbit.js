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
      precision: 0,
      comparator: undefined
    }, opt || {});
    var found = [], index = 0, header, foundShape;
    do {
      index = findShape(shape, where, index, opt);
      if (index !== -1) {
        header = collectHeader(where, index - 1);
        foundShape = where.slice(index, index + shape.length);
        found.push(header.concat(foundShape));
        index += shape.length;
      }
    } while (index !== -1 && index < where.length);
    return found;
  },

  findShape = (shape, where, startIndex, opt) => {
    startIndex = startIndex || 0;
    opt = opt || {};
    var match = false,
        index = -1,
        defaultComparator = comparators.sameCalls,
        comparator = opt.comparator || defaultComparator;
    if (Array.isArray(shape) && shape.length > 0 && Array.isArray(where) && where.length > 0) {
      for (var i = startIndex; i <= where.length - shape.length; i++) {
        match = true;
        for (var j = 0; j < shape.length; j++) {
          if (!comparator(shape[j], where[i + j], opt, defaultComparator)) {
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

  collectHeader = (stack, lastIndex) => {
    var styles = [], call;
    for(var i = 0; i <= lastIndex; i++) {
      call = stack[i];
      if (isStyle(call) || isTransform(call)) {
        styles.push(call);
      }
    }
    return styles;
  },

  isStyle = (call) => {
    var styleNames = [
      'fillStyle', 'strokeStyle', 'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY',
      'lineCap', 'lineJoin', 'lineWidth', 'miterLimit',
      'font', 'textAlign', 'textBaseline',
      'globalAlpha', 'globalCompositeOperation'
    ];
    return styleNames.indexOf(call.attr) !== -1 ? true : false;
  },

  isTransform = (call) => {
    var transformNames = [
      'scale', 'translate', 'rotate', 'transform', 'setTransform',
      'save', 'restore'
    ];
    return transformNames.indexOf(call.method) !== -1 ? true : false;
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
