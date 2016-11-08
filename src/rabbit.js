"use strict";

import { Geometry } from 'geometry';
import { CustomMatchers } from 'customMatchers';


export function Rabbit(geometry, matchers) {

  var that = this,
    geometry = geometry || new Geometry(),
    matchers = matchers || new CustomMatchers();


  var findAllShapesIgnoringArguments = function(shape, where) {
    var found = [], index = 0;
    do {
      index = that.findShapeIgnoringArguments(shape, where, index);
      if (index !== -1) {
        found.push(where.slice(index, index + shape.length));
        index += shape.length;
      }
    } while (index !== -1 && index < where.length);
    return found;
  },

  findShapeIgnoringArguments = function(shape, where, startIndex) {
    startIndex = startIndex || 0;
    var match = false, index = -1;
    for (var i = startIndex; i <= where.length - shape.length; i++) {
      match = true;
      for (var j = 0; j < shape.length; j++) {
        if (where[i + j].method !== shape[j].method) {
          match = false;
          break;
        }
      }
      if (match === true) {
        index = i;
        break;
      }
    }
    return index;
  },

  removeShapes = function(shapes, from) {
    var copy = from.slice(0, from.length);
    shapes.forEach(function(shape) {
      var index = -1;
      do {
        index = that.findShapeIgnoringArguments(shape, copy);
        if (index !== -1) {
          copy.splice(index, shape.length);
        }
      } while (index !== -1);
    });
    return copy;
  };


  this.getBBox = geometry.getBBox;
  this.customMatchers = matchers;
  this.findAllShapesIgnoringArguments = findAllShapesIgnoringArguments;
  this.findShapeIgnoringArguments = findShapeIgnoringArguments;
  this.removeShapes = removeShapes;

}
