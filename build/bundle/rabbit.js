require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CustomMatchers = CustomMatchers;

var _geometry = require('./geometry.js');

function CustomMatchers(geometry) {

  geometry = geometry || new _geometry.Geometry();

  var toBePartOf = function toBePartOf(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected) {
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
        var result = match ? { pass: true } : { pass: false, message: 'Shape not part of' };
        return result;
      }
    };
  },
      toBeInsideTheAreaOf = function toBeInsideTheAreaOf(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected) {
        var smallShape = actual,
            bigShape = expected,
            bigShapeBBox = geometry.getBBox(bigShape),
            smallShapeBBox = geometry.getBBox(smallShape),
            center = { x: smallShapeBBox.x + smallShapeBBox.width / 2, y: smallShapeBBox.y + smallShapeBBox.height / 2 },
            isCenterInside = geometry.isPointInsideRectangle(center, bigShapeBBox),
            result = isCenterInside ? { pass: true } : { pass: false, message: 'Shape is not inside the area of' };
        return result;
      }
    };
  },
      toHaveTheSamePositionWith = function toHaveTheSamePositionWith(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected) {
        var actualBBox = geometry.getBBox(actual),
            expectedBBox = geometry.getBBox(expected),
            haveTheSamePosition = actualBBox.x === expectedBBox.x && actualBBox.y === expectedBBox.y,
            result = haveTheSamePosition ? { pass: true } : { pass: false, message: 'Shapes don`t have the same position' };
        return result;
      }
    };
  },
      toHaveTheSameSizeWith = function toHaveTheSameSizeWith(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected) {
        var actualBBox = geometry.getBBox(actual),
            expectedBBox = geometry.getBBox(expected),
            haveTheSameSize = actualBBox.width === expectedBBox.width && actualBBox.height === expectedBBox.height,
            result = haveTheSameSize ? { pass: true } : { pass: false, message: 'Shapes don`t have the same size' };
        return result;
      }
    };
  },
      toBeHorizontallyAlignWith = function toBeHorizontallyAlignWith(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected) {
        var actualBBox = geometry.getBBox(actual),
            expectedBBox = geometry.getBBox(expected),
            haveTheSameAlignment = actualBBox.y === expectedBBox.y,
            result = haveTheSameAlignment ? { pass: true } : { pass: false, message: 'Shapes don`t have the same horizontal position' };
        return result;
      }
    };
  },
      toBeVerticallyAlignWith = function toBeVerticallyAlignWith(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected) {
        var actualBBox = geometry.getBBox(actual),
            expectedBBox = geometry.getBBox(expected),
            haveTheSameAlignment = actualBBox.x === expectedBBox.x,
            result = haveTheSameAlignment ? { pass: true } : { pass: false, message: 'Shapes don`t have the same vertical position' };
        return result;
      }
    };
  };

  this.toBePartOf = toBePartOf;
  this.toBeInsideTheAreaOf = toBeInsideTheAreaOf;
  this.toHaveTheSamePositionWith = toHaveTheSamePositionWith;
  this.toHaveTheSameSizeWith = toHaveTheSameSizeWith;
  this.toBeHorizontallyAlignWith = toBeHorizontallyAlignWith;
  this.toBeVerticallyAlignWith = toBeVerticallyAlignWith;
}

},{"./geometry.js":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Geometry = Geometry;
function Geometry() {

  var that = this;

  var createNewCanvasCallState = function createNewCanvasCallState() {
    return {
      box: { x: NaN, y: NaN, width: NaN, height: NaN },
      transforms: [[]],
      shapesInPath: [],
      moveToLocation: { x: NaN, y: NaN },
      lineWidths: [1]
    };
  },
      pathFillShapeHandlers = {
    rect: function rect(state, shape) {
      var x = shape.x,
          y = shape.y,
          width = shape.width,
          height = shape.height,
          newBox = { x: x, y: y, width: width, height: height };
      state.box = union(state.box, newBox);
      return state;
    },
    arc: function arc(state, shape) {
      var cx = shape.cx,
          cy = shape.cy,
          rx = shape.rx,
          ry = shape.ry,
          newBox = { x: cx - rx, y: cy - ry, width: 2 * rx, height: 2 * ry };
      state.box = union(state.box, newBox);
      return state;
    }
  },
      pathStrokeShapeHandlers = {
    rect: function rect(state, shape) {
      var x = shape.x,
          y = shape.y,
          width = shape.width,
          height = shape.height,
          scaledLineWidth = state.lineWidth !== 1 ? state.lineWidth : 0,
          xScaledLineWidth = scaledLineWidth * state.transform.scale.x,
          yScaledLineWidth = scaledLineWidth * state.transform.scale.y,
          newBox = { x: x - xScaledLineWidth / 2, y: y - yScaledLineWidth / 2, width: width + xScaledLineWidth, height: height + yScaledLineWidth };
      state.box = union(state.box, newBox);
      return state;
    },
    arc: function arc(state, shape) {
      var cx = shape.cx,
          cy = shape.cy,
          rx = shape.rx,
          ry = shape.ry,
          scaledLineWidth = state.lineWidth !== 1 ? state.lineWidth : 0,
          xScaledLineWidth = scaledLineWidth * state.transform.scale.x,
          yScaledLineWidth = scaledLineWidth * state.transform.scale.y,
          newBox = { x: cx - rx - xScaledLineWidth / 2, y: cy - ry - yScaledLineWidth / 2, width: 2 * rx + xScaledLineWidth, height: 2 * ry + yScaledLineWidth };
      state.box = union(state.box, newBox);
      return state;
    },
    lineTo: function lineTo(state, shape) {
      var x1 = shape.x1,
          y1 = shape.y1,
          x2 = shape.x2,
          y2 = shape.y2,
          scaledLineWidth = getScaledWidthOfLine(x1, y1, x2, y2, state.transform.scale.x, state.transform.scale.y, state.lineWidth),
          rect = getRectAroundLine(x1, y1, x2, y2, scaledLineWidth !== 1 ? scaledLineWidth : 0),
          newBox = {
        x: Math.min(rect.x1, rect.x2, rect.x3, rect.x4),
        y: Math.min(rect.y1, rect.y2, rect.y3, rect.y4),
        width: Math.max(rect.x1, rect.x2, rect.x3, rect.x4) - Math.min(rect.x1, rect.x2, rect.x3, rect.x4),
        height: Math.max(rect.y1, rect.y2, rect.y3, rect.y4) - Math.min(rect.y1, rect.y2, rect.y3, rect.y4)
      };
      state.box = union(state.box, newBox);
      return state;
    }
  },
      canvasCallHandlers = {
    lineWidth: function lineWidth(state, call) {
      state.lineWidths[state.lineWidths.length - 1] = call.val;
      return state;
    },
    fillRect: function fillRect(state, call) {
      var x = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
          y = call.arguments[1] * state.transform.scale.y + state.transform.translate.y,
          width = call.arguments[2] * state.transform.scale.x,
          height = call.arguments[3] * state.transform.scale.y,
          newBox = { x: x, y: y, width: width, height: height };
      state.box = union(state.box, newBox);
      return state;
    },
    strokeRect: function strokeRect(state, call) {
      var x = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
          y = call.arguments[1] * state.transform.scale.y + state.transform.translate.y,
          width = call.arguments[2] * state.transform.scale.x,
          height = call.arguments[3] * state.transform.scale.y,
          scaledLineWidth = state.lineWidth !== 1 ? state.lineWidth : 0,
          xScaledLineWidth = scaledLineWidth * state.transform.scale.x,
          yScaledLineWidth = scaledLineWidth * state.transform.scale.y,
          newBox = { x: x - xScaledLineWidth / 2, y: y - yScaledLineWidth / 2, width: width + xScaledLineWidth, height: height + yScaledLineWidth };
      state.box = union(state.box, newBox);
      return state;
    },
    rect: function rect(state, call) {
      var x = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
          y = call.arguments[1] * state.transform.scale.y + state.transform.translate.y,
          width = call.arguments[2] * state.transform.scale.x,
          height = call.arguments[3] * state.transform.scale.y;
      state.shapesInPath.push({ type: 'rect', x: x, y: y, width: width, height: height });
      return state;
    },
    arc: function arc(state, call) {
      var cx = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
          cy = call.arguments[1] * state.transform.scale.y + state.transform.translate.y,
          rx = call.arguments[2] * state.transform.scale.x,
          ry = call.arguments[2] * state.transform.scale.y;
      state.shapesInPath.push({ type: 'arc', cx: cx, cy: cy, rx: rx, ry: ry });
      return state;
    },
    moveTo: function moveTo(state, call) {
      var x1 = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
          y1 = call.arguments[1] * state.transform.scale.y + state.transform.translate.y;
      state.moveToLocation = { x: x1, y: y1 };
      return state;
    },
    lineTo: function lineTo(state, call) {
      var x1 = state.moveToLocation.x,
          y1 = state.moveToLocation.y,
          x2 = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
          y2 = call.arguments[1] * state.transform.scale.y + state.transform.translate.y;
      state.shapesInPath.push({ type: 'lineTo', x1: x1, y1: y1, x2: x2, y2: y2 });
      return state;
    },
    save: function save(state, call) {
      state.transforms.push([]);
      state.lineWidths.push(lastElement(state.lineWidths));
      return state;
    },
    restore: function restore(state, call) {
      state.transforms.pop();
      state.lineWidths.pop();
      return state;
    },
    translate: function translate(state, call) {
      lastElement(state.transforms).push({ translate: { x: call.arguments[0], y: call.arguments[1] } });
      return state;
    },
    scale: function scale(state, call) {
      lastElement(state.transforms).push({ scale: { x: call.arguments[0], y: call.arguments[1] } });
      return state;
    },
    beginPath: function beginPath(state, call) {
      state.shapesInPath = [];
      return state;
    },
    fill: function fill(state, call) {
      return state.shapesInPath.reduce(function (state, shape) {
        var handler = getPathFillShapeHandler(shape);
        return handler(state, shape);
      }, state);
    },
    stroke: function stroke(state, call) {
      return state.shapesInPath.reduce(function (state, shape) {
        var handler = getPathStrokeShapeHandler(shape);
        return handler(state, shape);
      }, state);
    }
  },
      nullCanvasCallHandler = function nullCanvasCallHandler(state, call) {
    return state;
  },
      getCanvasCallHandler = function getCanvasCallHandler(call) {
    return canvasCallHandlers[call.method] || canvasCallHandlers[call.attr] || nullCanvasCallHandler;
  },
      getPathFillShapeHandler = function getPathFillShapeHandler(shape) {
    return pathFillShapeHandlers[shape.type];
  },
      getPathStrokeShapeHandler = function getPathStrokeShapeHandler(shape) {
    return pathStrokeShapeHandlers[shape.type];
  },
      preCanvasCallHandler = function preCanvasCallHandler(state) {
    state.transform = totalTransform(flatten(state.transforms));
    state.lineWidth = lastElement(state.lineWidths);
    return state;
  },
      getBBox = function getBBox(shape) {
    var state = createNewCanvasCallState();
    state = shape.reduce(function (state, call) {
      var handler = getCanvasCallHandler(call);
      return handler(preCanvasCallHandler(state), call);
    }, createNewCanvasCallState());
    return state.box;
  },
      flatten = function flatten(array) {
    return array.reduce(function (previousArray, currentArray) {
      return previousArray.concat(currentArray);
    }, []);
  },
      lastElement = function lastElement(array) {
    return array[array.length - 1];
  },
      firstTruthyOrZero = function firstTruthyOrZero(val1, val2) {
    if (val1 || val1 === 0) {
      return val1;
    }
    return val2;
  },
      union = function union(box1, box2) {
    box1 = {
      x: firstTruthyOrZero(box1.x, box2.x),
      y: firstTruthyOrZero(box1.y, box2.y),
      width: firstTruthyOrZero(box1.width, box2.width),
      height: firstTruthyOrZero(box1.height, box2.height)
    };
    box2 = {
      x: firstTruthyOrZero(box2.x, box1.x),
      y: firstTruthyOrZero(box2.y, box1.y),
      width: firstTruthyOrZero(box2.width, box1.width),
      height: firstTruthyOrZero(box2.height, box1.height)
    };
    var result = {
      x: Math.min(box1.x, box2.x),
      y: Math.min(box1.y, box2.y),
      width: Math.max(box1.width, box2.width, box1.x < box2.x ? box1.width + box2.width + (box2.x - (box1.x + box1.width)) : box1.width + box2.width + (box1.x - (box2.x + box2.width))),
      height: Math.max(box1.height, box2.height, box1.y < box2.y ? box1.height + box2.height + (box2.y - (box1.y + box1.height)) : box1.height + box2.height + (box1.y - (box2.y + box2.height)))
    };
    return result;
  },
      totalTransform = function totalTransform(transforms) {
    return transforms.map(function (value) {
      return {
        translate: value.translate || { x: 0, y: 0 },
        scale: value.scale || { x: 1, y: 1 }
      };
    }).reduce(function (previousValue, currentValue) {
      return {
        translate: {
          x: previousValue.translate.x + currentValue.translate.x * previousValue.scale.x,
          y: previousValue.translate.y + currentValue.translate.y * previousValue.scale.y
        },
        scale: {
          x: previousValue.scale.x * currentValue.scale.x,
          y: previousValue.scale.y * currentValue.scale.y
        }
      };
    }, { translate: { x: 0, y: 0 }, scale: { x: 1, y: 1 } });
  },
      getRectAroundLine = function getRectAroundLine(x1, y1, x2, y2, width) {
    var rect;
    if (x1 === y1 && x1 === x2 && x1 === y2) {
      rect = {
        x1: x1, y1: x1, x2: x1, y2: x1,
        x4: x1, y4: x1, x3: x1, y3: x1
      };
    } else {
      rect = getRectAroundLongLine(x1, y1, x2, y2, width);
    }
    return rect;
  },
      getRectAroundLongLine = function getRectAroundLongLine(x1, y1, x2, y2, width) {
    //  r = the radius or the given distance from a given point to the nearest corners of the rect
    //  a = the angle between the line and the horizontal axis
    //  b1, b2 = the angle between half the hight of the rectangle and the horizontal axis
    //
    //  In the following example the given line is horizontal, so a = 0.
    //  The given line is between the two @ symbols.
    //  The + symbols are the corners of rectangle to be determined.
    //  In order to find the b1 and b2 angles we have to add PI/2 and respectivly subtract PI/2.
    //  b1 is vertical and pointing upwords and b2 is also vertical but pointing downwords.
    //  Each corner is r or width / 2 far away from its corespondent line ending.
    //  So we know the distance (r), the starting points (x1, y1) and (x2, y2) and the (b1, b2) directions.
    //
    //  (x1,y1)                    (x2,y2)
    //      +------------------------+
    //      ^                        ^
    //      |                        |
    //      | b1                     | b1
    //      @========================@
    //      | b2                     | b2
    //      |                        |
    //      v                        v
    //      +------------------------+
    //  (x4,y4)                    (x3,y3)
    //

    var r = width / 2,
        a = Math.atan((y2 - y1) / (x2 - x1)),
        b1 = a + Math.PI / 2,
        b2 = a - Math.PI / 2,
        rx1 = r * Math.cos(b1) + x1,
        ry1 = r * Math.sin(b1) + y1,
        rx2 = r * Math.cos(b1) + x2,
        ry2 = r * Math.sin(b1) + y2,
        rx3 = r * Math.cos(b2) + x2,
        ry3 = r * Math.sin(b2) + y2,
        rx4 = r * Math.cos(b2) + x1,
        ry4 = r * Math.sin(b2) + y1;
    return {
      x1: rx1, y1: ry1, x2: rx2, y2: ry2,
      x4: rx4, y4: ry4, x3: rx3, y3: ry3
    };
  },
      getScaledWidthOfLine = function getScaledWidthOfLine(x1, y1, x2, y2, sx, sy, width) {
    //  The original points are not moved. Only the width will be scaled.
    //  The width of an horizontal line will be scaled with the sy ratio only.
    //  The width of a vertival line will be scaled with the sx ratio only.
    //  The width of an oblique line will be scaled with both the sx and sy
    //but proportional with the angle between the line and the x and y axes.
    //
    //                                                    .\
    //               .\  (x2,y2)                         ...\  (x2,y2)
    //              ...@                                .....@
    //             .../.\                              ...../.\
    //            .../...              sx             ...../...\
    //           .../...            +--->            ...../.....
    //          .../...             |               ...../.....
    //         .../...              |               \.../.....
    //         \./...               |                \./.....
    //          @...             sy v                 @.....
    //  (x1,y1)  \.                           (x1,y1)  \...
    //                                                  \.
    //
    var a = Math.atan((y2 - y1) / (x2 - x1)),
        sina = Math.sin(a),
        cosa = Math.cos(a),
        scaledWidth = width * Math.sqrt(sx * sx * sina * sina + sy * sy * cosa * cosa);
    return scaledWidth;
  },


  // http://stackoverflow.com/questions/2752725/finding-whether-a-point-lies-inside-a-rectangle-or-not
  isPointInsideRectangle = function isPointInsideRectangle(point, rectangle) {
    var segments = [{
      x1: rectangle.x,
      y1: rectangle.y,
      x2: rectangle.x + rectangle.width,
      y2: rectangle.y }, {
      x1: rectangle.x + rectangle.width,
      y1: rectangle.y,
      x2: rectangle.x + rectangle.width,
      y2: rectangle.y + rectangle.height }, {
      x1: rectangle.x + rectangle.width,
      y1: rectangle.y + rectangle.height,
      x2: rectangle.x,
      y2: rectangle.y + rectangle.height }, {
      x1: rectangle.x,
      y1: rectangle.y + rectangle.height,
      x2: rectangle.x,
      y2: rectangle.y
    }];

    var isInside = segments.map(function (segment) {
      var A = -(segment.y2 - segment.y1),
          B = segment.x2 - segment.x1,
          C = -(A * segment.x1 + B * segment.y1),
          D = A * point.x + B * point.y + C;
      return D;
    }).every(function (D) {
      return D > 0;
    });

    return isInside;
  };

  this.getBBox = getBBox;
  this.union = union;
  this.totalTransform = totalTransform;
  this.getRectAroundLine = getRectAroundLine;
  this.isPointInsideRectangle = isPointInsideRectangle;
}

},{}],"E:\\GitHub\\rabbit\\src\\rabbit.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Rabbit = Rabbit;

var _geometry = require('./geometry.js');

var _customMatchers = require('./customMatchers.js');

function Rabbit(geometry, matchers) {

  var that = this,
      geometry = geometry || new _geometry.Geometry(),
      matchers = matchers || new _customMatchers.CustomMatchers();

  var findAllShapesIgnoringArguments = function findAllShapesIgnoringArguments(shape, where) {
    var found = [],
        index = 0;
    do {
      index = that.findShapeIgnoringArguments(shape, where, index);
      if (index !== -1) {
        found.push(where.slice(index, index + shape.length));
        index += shape.length;
      }
    } while (index !== -1 && index < where.length);
    return found;
  },
      findShapeIgnoringArguments = function findShapeIgnoringArguments(shape, where, startIndex) {
    startIndex = startIndex || 0;
    var match = false,
        index = -1;
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
      removeShapes = function removeShapes(shapes, from) {
    var copy = from.slice(0, from.length);
    shapes.forEach(function (shape) {
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

},{"./customMatchers.js":1,"./geometry.js":2}]},{},["E:\\GitHub\\rabbit\\src\\rabbit.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGN1c3RvbU1hdGNoZXJzLmpzIiwic3JjXFxnZW9tZXRyeS5qcyIsInNyY1xccmFiYml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7O1FBS2dCLGMsR0FBQSxjOztBQUhoQjs7QUFHTyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0M7O0FBRXZDLGFBQVcsWUFBWSx3QkFBdkI7O0FBR0EsTUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBTyxxQkFBUCxFQUFpQztBQUNoRCxXQUFPO0FBQ0wsZUFBUyxpQkFBQyxNQUFELEVBQVMsUUFBVCxFQUFzQjtBQUM3QixZQUFJLFFBQVEsS0FBWjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxTQUFTLE1BQVQsR0FBa0IsT0FBTyxNQUE3QyxFQUFxRCxHQUFyRCxFQUEwRDtBQUN4RCxrQkFBUSxPQUFPLE1BQVAsR0FBZ0IsQ0FBeEI7QUFDQSxlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksT0FBTyxNQUEzQixFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxnQkFBSSxTQUFTLElBQUksQ0FBYixFQUFnQixNQUFoQixLQUEyQixPQUFPLENBQVAsRUFBVSxNQUF6QyxFQUFpRDtBQUMvQyxzQkFBUSxLQUFSO0FBQ0E7QUFDRDtBQUNGO0FBQ0QsY0FBSSxVQUFVLElBQWQsRUFBb0I7QUFDbEI7QUFDRDtBQUNGO0FBQ0QsWUFBSSxTQUFTLFFBQVEsRUFBQyxNQUFNLElBQVAsRUFBUixHQUF1QixFQUFDLE1BQU0sS0FBUCxFQUFjLFNBQVMsbUJBQXZCLEVBQXBDO0FBQ0EsZUFBTyxNQUFQO0FBQ0Q7QUFqQkksS0FBUDtBQW1CRCxHQXBCRDtBQUFBLE1Bc0JBLHNCQUFzQixTQUF0QixtQkFBc0IsQ0FBQyxJQUFELEVBQU8scUJBQVAsRUFBaUM7QUFDckQsV0FBTztBQUNMLGVBQVMsaUJBQUMsTUFBRCxFQUFTLFFBQVQsRUFBc0I7QUFDN0IsWUFBSSxhQUFhLE1BQWpCO0FBQUEsWUFDRSxXQUFXLFFBRGI7QUFBQSxZQUVFLGVBQWUsU0FBUyxPQUFULENBQWlCLFFBQWpCLENBRmpCO0FBQUEsWUFHRSxpQkFBaUIsU0FBUyxPQUFULENBQWlCLFVBQWpCLENBSG5CO0FBQUEsWUFJRSxTQUFTLEVBQUMsR0FBRyxlQUFlLENBQWYsR0FBbUIsZUFBZSxLQUFmLEdBQXVCLENBQTlDLEVBQWlELEdBQUcsZUFBZSxDQUFmLEdBQW1CLGVBQWUsTUFBZixHQUF3QixDQUEvRixFQUpYO0FBQUEsWUFLRSxpQkFBaUIsU0FBUyxzQkFBVCxDQUFnQyxNQUFoQyxFQUF3QyxZQUF4QyxDQUxuQjtBQUFBLFlBTUUsU0FBUyxpQkFBaUIsRUFBQyxNQUFNLElBQVAsRUFBakIsR0FBZ0MsRUFBQyxNQUFNLEtBQVAsRUFBYyxTQUFTLGlDQUF2QixFQU4zQztBQU9BLGVBQU8sTUFBUDtBQUNEO0FBVkksS0FBUDtBQVlELEdBbkNEO0FBQUEsTUFxQ0EsNEJBQTRCLFNBQTVCLHlCQUE0QixDQUFDLElBQUQsRUFBTyxxQkFBUCxFQUFpQztBQUMzRCxXQUFPO0FBQ0wsZUFBUyxpQkFBQyxNQUFELEVBQVMsUUFBVCxFQUFzQjtBQUM3QixZQUFJLGFBQWEsU0FBUyxPQUFULENBQWlCLE1BQWpCLENBQWpCO0FBQUEsWUFDRSxlQUFlLFNBQVMsT0FBVCxDQUFpQixRQUFqQixDQURqQjtBQUFBLFlBRUUsc0JBQXNCLFdBQVcsQ0FBWCxLQUFpQixhQUFhLENBQTlCLElBQW1DLFdBQVcsQ0FBWCxLQUFpQixhQUFhLENBRnpGO0FBQUEsWUFHRSxTQUFTLHNCQUFzQixFQUFDLE1BQU0sSUFBUCxFQUF0QixHQUFxQyxFQUFDLE1BQU0sS0FBUCxFQUFjLFNBQVMscUNBQXZCLEVBSGhEO0FBSUEsZUFBTyxNQUFQO0FBQ0Q7QUFQSSxLQUFQO0FBU0QsR0EvQ0Q7QUFBQSxNQWlEQSx3QkFBd0IsU0FBeEIscUJBQXdCLENBQUMsSUFBRCxFQUFPLHFCQUFQLEVBQWlDO0FBQ3ZELFdBQU87QUFDTCxlQUFTLGlCQUFDLE1BQUQsRUFBUyxRQUFULEVBQXNCO0FBQzdCLFlBQUksYUFBYSxTQUFTLE9BQVQsQ0FBaUIsTUFBakIsQ0FBakI7QUFBQSxZQUNFLGVBQWUsU0FBUyxPQUFULENBQWlCLFFBQWpCLENBRGpCO0FBQUEsWUFFRSxrQkFBa0IsV0FBVyxLQUFYLEtBQXFCLGFBQWEsS0FBbEMsSUFBMkMsV0FBVyxNQUFYLEtBQXNCLGFBQWEsTUFGbEc7QUFBQSxZQUdFLFNBQVMsa0JBQWtCLEVBQUMsTUFBTSxJQUFQLEVBQWxCLEdBQWlDLEVBQUMsTUFBTSxLQUFQLEVBQWMsU0FBUyxpQ0FBdkIsRUFINUM7QUFJQSxlQUFPLE1BQVA7QUFDRDtBQVBJLEtBQVA7QUFTRCxHQTNERDtBQUFBLE1BNkRBLDRCQUE0QixTQUE1Qix5QkFBNEIsQ0FBQyxJQUFELEVBQU8scUJBQVAsRUFBaUM7QUFDM0QsV0FBTztBQUNMLGVBQVMsaUJBQUMsTUFBRCxFQUFTLFFBQVQsRUFBc0I7QUFDN0IsWUFBSSxhQUFhLFNBQVMsT0FBVCxDQUFpQixNQUFqQixDQUFqQjtBQUFBLFlBQ0UsZUFBZSxTQUFTLE9BQVQsQ0FBaUIsUUFBakIsQ0FEakI7QUFBQSxZQUVFLHVCQUF1QixXQUFXLENBQVgsS0FBaUIsYUFBYSxDQUZ2RDtBQUFBLFlBR0UsU0FBUyx1QkFBdUIsRUFBQyxNQUFNLElBQVAsRUFBdkIsR0FBc0MsRUFBQyxNQUFNLEtBQVAsRUFBYyxTQUFTLGdEQUF2QixFQUhqRDtBQUlBLGVBQU8sTUFBUDtBQUNEO0FBUEksS0FBUDtBQVNELEdBdkVEO0FBQUEsTUF5RUEsMEJBQTBCLFNBQTFCLHVCQUEwQixDQUFDLElBQUQsRUFBTyxxQkFBUCxFQUFpQztBQUN6RCxXQUFPO0FBQ0wsZUFBUyxpQkFBQyxNQUFELEVBQVMsUUFBVCxFQUFzQjtBQUM3QixZQUFJLGFBQWEsU0FBUyxPQUFULENBQWlCLE1BQWpCLENBQWpCO0FBQUEsWUFDRSxlQUFlLFNBQVMsT0FBVCxDQUFpQixRQUFqQixDQURqQjtBQUFBLFlBRUUsdUJBQXVCLFdBQVcsQ0FBWCxLQUFpQixhQUFhLENBRnZEO0FBQUEsWUFHRSxTQUFTLHVCQUF1QixFQUFDLE1BQU0sSUFBUCxFQUF2QixHQUFzQyxFQUFDLE1BQU0sS0FBUCxFQUFjLFNBQVMsOENBQXZCLEVBSGpEO0FBSUEsZUFBTyxNQUFQO0FBQ0Q7QUFQSSxLQUFQO0FBU0QsR0FuRkQ7O0FBc0ZBLE9BQUssVUFBTCxHQUFrQixVQUFsQjtBQUNBLE9BQUssbUJBQUwsR0FBMkIsbUJBQTNCO0FBQ0EsT0FBSyx5QkFBTCxHQUFpQyx5QkFBakM7QUFDQSxPQUFLLHFCQUFMLEdBQTZCLHFCQUE3QjtBQUNBLE9BQUsseUJBQUwsR0FBaUMseUJBQWpDO0FBQ0EsT0FBSyx1QkFBTCxHQUErQix1QkFBL0I7QUFDRDs7O0FDdEdEOzs7OztRQUdnQixRLEdBQUEsUTtBQUFULFNBQVMsUUFBVCxHQUFvQjs7QUFFekIsTUFBSSxPQUFPLElBQVg7O0FBR0EsTUFBSSwyQkFBMkIsU0FBM0Isd0JBQTJCLEdBQU07QUFDbkMsV0FBTztBQUNMLFdBQUssRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBaUIsT0FBTyxHQUF4QixFQUE2QixRQUFRLEdBQXJDLEVBREE7QUFFTCxrQkFBWSxDQUFDLEVBQUQsQ0FGUDtBQUdMLG9CQUFjLEVBSFQ7QUFJTCxzQkFBZ0IsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFKWDtBQUtMLGtCQUFZLENBQUMsQ0FBRDtBQUxQLEtBQVA7QUFPRCxHQVJEO0FBQUEsTUFVQSx3QkFBd0I7QUFDdEIsVUFBTSxjQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWtCO0FBQ3RCLFVBQUksSUFBSSxNQUFNLENBQWQ7QUFBQSxVQUNFLElBQUksTUFBTSxDQURaO0FBQUEsVUFFRSxRQUFRLE1BQU0sS0FGaEI7QUFBQSxVQUdFLFNBQVMsTUFBTSxNQUhqQjtBQUFBLFVBSUUsU0FBUyxFQUFDLEdBQUcsQ0FBSixFQUFPLEdBQUcsQ0FBVixFQUFhLE9BQU8sS0FBcEIsRUFBMkIsUUFBUSxNQUFuQyxFQUpYO0FBS0EsWUFBTSxHQUFOLEdBQVksTUFBTSxNQUFNLEdBQVosRUFBaUIsTUFBakIsQ0FBWjtBQUNBLGFBQU8sS0FBUDtBQUNELEtBVHFCO0FBVXRCLFNBQUssYUFBQyxLQUFELEVBQVEsS0FBUixFQUFrQjtBQUNyQixVQUFJLEtBQUssTUFBTSxFQUFmO0FBQUEsVUFDRSxLQUFLLE1BQU0sRUFEYjtBQUFBLFVBRUUsS0FBSyxNQUFNLEVBRmI7QUFBQSxVQUdFLEtBQUssTUFBTSxFQUhiO0FBQUEsVUFJRSxTQUFTLEVBQUMsR0FBRyxLQUFLLEVBQVQsRUFBYSxHQUFHLEtBQUssRUFBckIsRUFBeUIsT0FBTyxJQUFJLEVBQXBDLEVBQXdDLFFBQVEsSUFBSSxFQUFwRCxFQUpYO0FBS0EsWUFBTSxHQUFOLEdBQVksTUFBTSxNQUFNLEdBQVosRUFBaUIsTUFBakIsQ0FBWjtBQUNBLGFBQU8sS0FBUDtBQUNEO0FBbEJxQixHQVZ4QjtBQUFBLE1BK0JBLDBCQUEwQjtBQUN4QixVQUFNLGNBQUMsS0FBRCxFQUFRLEtBQVIsRUFBa0I7QUFDdEIsVUFBSSxJQUFJLE1BQU0sQ0FBZDtBQUFBLFVBQ0UsSUFBSSxNQUFNLENBRFo7QUFBQSxVQUVFLFFBQVEsTUFBTSxLQUZoQjtBQUFBLFVBR0UsU0FBUyxNQUFNLE1BSGpCO0FBQUEsVUFJRSxrQkFBa0IsTUFBTSxTQUFOLEtBQW9CLENBQXBCLEdBQXdCLE1BQU0sU0FBOUIsR0FBMEMsQ0FKOUQ7QUFBQSxVQUtFLG1CQUFtQixrQkFBa0IsTUFBTSxTQUFOLENBQWdCLEtBQWhCLENBQXNCLENBTDdEO0FBQUEsVUFNRSxtQkFBbUIsa0JBQWtCLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQU43RDtBQUFBLFVBT0UsU0FBUyxFQUFDLEdBQUcsSUFBSSxtQkFBb0IsQ0FBNUIsRUFBK0IsR0FBRyxJQUFJLG1CQUFtQixDQUF6RCxFQUE0RCxPQUFPLFFBQVEsZ0JBQTNFLEVBQTZGLFFBQVEsU0FBUyxnQkFBOUcsRUFQWDtBQVFBLFlBQU0sR0FBTixHQUFZLE1BQU0sTUFBTSxHQUFaLEVBQWlCLE1BQWpCLENBQVo7QUFDQSxhQUFPLEtBQVA7QUFDRCxLQVp1QjtBQWF4QixTQUFLLGFBQUMsS0FBRCxFQUFRLEtBQVIsRUFBa0I7QUFDckIsVUFBSSxLQUFLLE1BQU0sRUFBZjtBQUFBLFVBQ0UsS0FBSyxNQUFNLEVBRGI7QUFBQSxVQUVFLEtBQUssTUFBTSxFQUZiO0FBQUEsVUFHRSxLQUFLLE1BQU0sRUFIYjtBQUFBLFVBSUUsa0JBQWtCLE1BQU0sU0FBTixLQUFvQixDQUFwQixHQUF3QixNQUFNLFNBQTlCLEdBQTBDLENBSjlEO0FBQUEsVUFLRSxtQkFBbUIsa0JBQWtCLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQUw3RDtBQUFBLFVBTUUsbUJBQW1CLGtCQUFrQixNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FON0Q7QUFBQSxVQU9FLFNBQVMsRUFBQyxHQUFHLEtBQUssRUFBTCxHQUFVLG1CQUFtQixDQUFqQyxFQUFvQyxHQUFHLEtBQUssRUFBTCxHQUFVLG1CQUFtQixDQUFwRSxFQUF1RSxPQUFPLElBQUksRUFBSixHQUFTLGdCQUF2RixFQUF5RyxRQUFRLElBQUksRUFBSixHQUFTLGdCQUExSCxFQVBYO0FBUUEsWUFBTSxHQUFOLEdBQVksTUFBTSxNQUFNLEdBQVosRUFBaUIsTUFBakIsQ0FBWjtBQUNBLGFBQU8sS0FBUDtBQUNELEtBeEJ1QjtBQXlCeEIsWUFBUSxnQkFBQyxLQUFELEVBQVEsS0FBUixFQUFrQjtBQUN4QixVQUFJLEtBQUssTUFBTSxFQUFmO0FBQUEsVUFDRSxLQUFLLE1BQU0sRUFEYjtBQUFBLFVBRUUsS0FBSyxNQUFNLEVBRmI7QUFBQSxVQUdFLEtBQUssTUFBTSxFQUhiO0FBQUEsVUFJRSxrQkFBa0IscUJBQXFCLEVBQXJCLEVBQXlCLEVBQXpCLEVBQTZCLEVBQTdCLEVBQWlDLEVBQWpDLEVBQXFDLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQUEzRCxFQUE4RCxNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBcEYsRUFBdUYsTUFBTSxTQUE3RixDQUpwQjtBQUFBLFVBS0UsT0FBTyxrQkFBa0IsRUFBbEIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEIsRUFBOUIsRUFBa0Msb0JBQW9CLENBQXBCLEdBQXdCLGVBQXhCLEdBQTBDLENBQTVFLENBTFQ7QUFBQSxVQU1FLFNBQVM7QUFDUCxXQUFHLEtBQUssR0FBTCxDQUFTLEtBQUssRUFBZCxFQUFrQixLQUFLLEVBQXZCLEVBQTJCLEtBQUssRUFBaEMsRUFBb0MsS0FBSyxFQUF6QyxDQURJO0FBRVAsV0FBRyxLQUFLLEdBQUwsQ0FBUyxLQUFLLEVBQWQsRUFBa0IsS0FBSyxFQUF2QixFQUEyQixLQUFLLEVBQWhDLEVBQW9DLEtBQUssRUFBekMsQ0FGSTtBQUdQLGVBQU8sS0FBSyxHQUFMLENBQVMsS0FBSyxFQUFkLEVBQWtCLEtBQUssRUFBdkIsRUFBMkIsS0FBSyxFQUFoQyxFQUFvQyxLQUFLLEVBQXpDLElBQStDLEtBQUssR0FBTCxDQUFTLEtBQUssRUFBZCxFQUFrQixLQUFLLEVBQXZCLEVBQTJCLEtBQUssRUFBaEMsRUFBb0MsS0FBSyxFQUF6QyxDQUgvQztBQUlQLGdCQUFRLEtBQUssR0FBTCxDQUFTLEtBQUssRUFBZCxFQUFrQixLQUFLLEVBQXZCLEVBQTJCLEtBQUssRUFBaEMsRUFBb0MsS0FBSyxFQUF6QyxJQUErQyxLQUFLLEdBQUwsQ0FBUyxLQUFLLEVBQWQsRUFBa0IsS0FBSyxFQUF2QixFQUEyQixLQUFLLEVBQWhDLEVBQW9DLEtBQUssRUFBekM7QUFKaEQsT0FOWDtBQVlBLFlBQU0sR0FBTixHQUFZLE1BQU0sTUFBTSxHQUFaLEVBQWlCLE1BQWpCLENBQVo7QUFDQSxhQUFPLEtBQVA7QUFDRDtBQXhDdUIsR0EvQjFCO0FBQUEsTUEwRUEscUJBQXFCO0FBQ25CLGVBQVcsbUJBQUMsS0FBRCxFQUFRLElBQVIsRUFBaUI7QUFDMUIsWUFBTSxVQUFOLENBQWlCLE1BQU0sVUFBTixDQUFpQixNQUFqQixHQUEwQixDQUEzQyxJQUFnRCxLQUFLLEdBQXJEO0FBQ0EsYUFBTyxLQUFQO0FBQ0QsS0FKa0I7QUFLbkIsY0FBVSxrQkFBQyxLQUFELEVBQVEsSUFBUixFQUFpQjtBQUN6QixVQUFJLElBQUksS0FBSyxTQUFMLENBQWUsQ0FBZixJQUFvQixNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBMUMsR0FBOEMsTUFBTSxTQUFOLENBQWdCLFNBQWhCLENBQTBCLENBQWhGO0FBQUEsVUFDRSxJQUFJLEtBQUssU0FBTCxDQUFlLENBQWYsSUFBb0IsTUFBTSxTQUFOLENBQWdCLEtBQWhCLENBQXNCLENBQTFDLEdBQThDLE1BQU0sU0FBTixDQUFnQixTQUFoQixDQUEwQixDQUQ5RTtBQUFBLFVBRUUsUUFBUSxLQUFLLFNBQUwsQ0FBZSxDQUFmLElBQW9CLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQUZwRDtBQUFBLFVBR0UsU0FBUyxLQUFLLFNBQUwsQ0FBZSxDQUFmLElBQW9CLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQUhyRDtBQUFBLFVBSUUsU0FBUyxFQUFDLEdBQUcsQ0FBSixFQUFPLEdBQUcsQ0FBVixFQUFhLE9BQU8sS0FBcEIsRUFBMkIsUUFBUSxNQUFuQyxFQUpYO0FBS0EsWUFBTSxHQUFOLEdBQVksTUFBTSxNQUFNLEdBQVosRUFBaUIsTUFBakIsQ0FBWjtBQUNBLGFBQU8sS0FBUDtBQUNELEtBYmtCO0FBY25CLGdCQUFZLG9CQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWlCO0FBQzNCLFVBQUksSUFBSSxLQUFLLFNBQUwsQ0FBZSxDQUFmLElBQW9CLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQUExQyxHQUE4QyxNQUFNLFNBQU4sQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBaEY7QUFBQSxVQUNFLElBQUksS0FBSyxTQUFMLENBQWUsQ0FBZixJQUFvQixNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBMUMsR0FBOEMsTUFBTSxTQUFOLENBQWdCLFNBQWhCLENBQTBCLENBRDlFO0FBQUEsVUFFRSxRQUFRLEtBQUssU0FBTCxDQUFlLENBQWYsSUFBb0IsTUFBTSxTQUFOLENBQWdCLEtBQWhCLENBQXNCLENBRnBEO0FBQUEsVUFHRSxTQUFTLEtBQUssU0FBTCxDQUFlLENBQWYsSUFBb0IsTUFBTSxTQUFOLENBQWdCLEtBQWhCLENBQXNCLENBSHJEO0FBQUEsVUFJRSxrQkFBa0IsTUFBTSxTQUFOLEtBQW9CLENBQXBCLEdBQXdCLE1BQU0sU0FBOUIsR0FBMEMsQ0FKOUQ7QUFBQSxVQUtFLG1CQUFtQixrQkFBa0IsTUFBTSxTQUFOLENBQWdCLEtBQWhCLENBQXNCLENBTDdEO0FBQUEsVUFNRSxtQkFBbUIsa0JBQWtCLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQU43RDtBQUFBLFVBT0UsU0FBUyxFQUFDLEdBQUcsSUFBSSxtQkFBbUIsQ0FBM0IsRUFBOEIsR0FBRyxJQUFJLG1CQUFtQixDQUF4RCxFQUEyRCxPQUFPLFFBQVEsZ0JBQTFFLEVBQTRGLFFBQVEsU0FBUyxnQkFBN0csRUFQWDtBQVFBLFlBQU0sR0FBTixHQUFZLE1BQU0sTUFBTSxHQUFaLEVBQWlCLE1BQWpCLENBQVo7QUFDQSxhQUFPLEtBQVA7QUFDRCxLQXpCa0I7QUEwQm5CLFVBQU0sY0FBQyxLQUFELEVBQVEsSUFBUixFQUFpQjtBQUNyQixVQUFJLElBQUksS0FBSyxTQUFMLENBQWUsQ0FBZixJQUFvQixNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBMUMsR0FBOEMsTUFBTSxTQUFOLENBQWdCLFNBQWhCLENBQTBCLENBQWhGO0FBQUEsVUFDRSxJQUFJLEtBQUssU0FBTCxDQUFlLENBQWYsSUFBb0IsTUFBTSxTQUFOLENBQWdCLEtBQWhCLENBQXNCLENBQTFDLEdBQThDLE1BQU0sU0FBTixDQUFnQixTQUFoQixDQUEwQixDQUQ5RTtBQUFBLFVBRUUsUUFBUSxLQUFLLFNBQUwsQ0FBZSxDQUFmLElBQW9CLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQUZwRDtBQUFBLFVBR0UsU0FBUyxLQUFLLFNBQUwsQ0FBZSxDQUFmLElBQW9CLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQUhyRDtBQUlBLFlBQU0sWUFBTixDQUFtQixJQUFuQixDQUF3QixFQUFDLE1BQU0sTUFBUCxFQUFlLEdBQUcsQ0FBbEIsRUFBcUIsR0FBRyxDQUF4QixFQUEyQixPQUFPLEtBQWxDLEVBQXlDLFFBQVEsTUFBakQsRUFBeEI7QUFDQSxhQUFPLEtBQVA7QUFDRCxLQWpDa0I7QUFrQ25CLFNBQUssYUFBQyxLQUFELEVBQVEsSUFBUixFQUFpQjtBQUNwQixVQUFJLEtBQUssS0FBSyxTQUFMLENBQWUsQ0FBZixJQUFvQixNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBMUMsR0FBOEMsTUFBTSxTQUFOLENBQWdCLFNBQWhCLENBQTBCLENBQWpGO0FBQUEsVUFDRSxLQUFLLEtBQUssU0FBTCxDQUFlLENBQWYsSUFBb0IsTUFBTSxTQUFOLENBQWdCLEtBQWhCLENBQXNCLENBQTFDLEdBQThDLE1BQU0sU0FBTixDQUFnQixTQUFoQixDQUEwQixDQUQvRTtBQUFBLFVBRUUsS0FBSyxLQUFLLFNBQUwsQ0FBZSxDQUFmLElBQW9CLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQUZqRDtBQUFBLFVBR0UsS0FBSyxLQUFLLFNBQUwsQ0FBZSxDQUFmLElBQW9CLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQUhqRDtBQUlBLFlBQU0sWUFBTixDQUFtQixJQUFuQixDQUF3QixFQUFDLE1BQU0sS0FBUCxFQUFjLElBQUksRUFBbEIsRUFBc0IsSUFBSSxFQUExQixFQUE4QixJQUFJLEVBQWxDLEVBQXNDLElBQUksRUFBMUMsRUFBeEI7QUFDQSxhQUFPLEtBQVA7QUFDRCxLQXpDa0I7QUEwQ25CLFlBQVEsZ0JBQUMsS0FBRCxFQUFRLElBQVIsRUFBaUI7QUFDdkIsVUFBSSxLQUFLLEtBQUssU0FBTCxDQUFlLENBQWYsSUFBb0IsTUFBTSxTQUFOLENBQWdCLEtBQWhCLENBQXNCLENBQTFDLEdBQThDLE1BQU0sU0FBTixDQUFnQixTQUFoQixDQUEwQixDQUFqRjtBQUFBLFVBQ0UsS0FBSyxLQUFLLFNBQUwsQ0FBZSxDQUFmLElBQW9CLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixDQUExQyxHQUE4QyxNQUFNLFNBQU4sQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FEL0U7QUFFQSxZQUFNLGNBQU4sR0FBdUIsRUFBQyxHQUFHLEVBQUosRUFBUSxHQUFHLEVBQVgsRUFBdkI7QUFDQSxhQUFPLEtBQVA7QUFDRCxLQS9Da0I7QUFnRG5CLFlBQVEsZ0JBQUMsS0FBRCxFQUFRLElBQVIsRUFBaUI7QUFDdkIsVUFBSSxLQUFLLE1BQU0sY0FBTixDQUFxQixDQUE5QjtBQUFBLFVBQ0UsS0FBSyxNQUFNLGNBQU4sQ0FBcUIsQ0FENUI7QUFBQSxVQUVFLEtBQUssS0FBSyxTQUFMLENBQWUsQ0FBZixJQUFvQixNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBMUMsR0FBOEMsTUFBTSxTQUFOLENBQWdCLFNBQWhCLENBQTBCLENBRi9FO0FBQUEsVUFHRSxLQUFLLEtBQUssU0FBTCxDQUFlLENBQWYsSUFBb0IsTUFBTSxTQUFOLENBQWdCLEtBQWhCLENBQXNCLENBQTFDLEdBQThDLE1BQU0sU0FBTixDQUFnQixTQUFoQixDQUEwQixDQUgvRTtBQUlBLFlBQU0sWUFBTixDQUFtQixJQUFuQixDQUF3QixFQUFDLE1BQU0sUUFBUCxFQUFpQixJQUFJLEVBQXJCLEVBQXlCLElBQUksRUFBN0IsRUFBaUMsSUFBSSxFQUFyQyxFQUF5QyxJQUFJLEVBQTdDLEVBQXhCO0FBQ0EsYUFBTyxLQUFQO0FBQ0QsS0F2RGtCO0FBd0RuQixVQUFNLGNBQUMsS0FBRCxFQUFRLElBQVIsRUFBaUI7QUFDckIsWUFBTSxVQUFOLENBQWlCLElBQWpCLENBQXNCLEVBQXRCO0FBQ0EsWUFBTSxVQUFOLENBQWlCLElBQWpCLENBQXNCLFlBQVksTUFBTSxVQUFsQixDQUF0QjtBQUNBLGFBQU8sS0FBUDtBQUNELEtBNURrQjtBQTZEbkIsYUFBUyxpQkFBQyxLQUFELEVBQVEsSUFBUixFQUFpQjtBQUN4QixZQUFNLFVBQU4sQ0FBaUIsR0FBakI7QUFDQSxZQUFNLFVBQU4sQ0FBaUIsR0FBakI7QUFDQSxhQUFPLEtBQVA7QUFDRCxLQWpFa0I7QUFrRW5CLGVBQVcsbUJBQUMsS0FBRCxFQUFRLElBQVIsRUFBaUI7QUFDMUIsa0JBQVksTUFBTSxVQUFsQixFQUNHLElBREgsQ0FDUSxFQUFDLFdBQVcsRUFBQyxHQUFHLEtBQUssU0FBTCxDQUFlLENBQWYsQ0FBSixFQUF1QixHQUFHLEtBQUssU0FBTCxDQUFlLENBQWYsQ0FBMUIsRUFBWixFQURSO0FBRUEsYUFBTyxLQUFQO0FBQ0QsS0F0RWtCO0FBdUVuQixXQUFPLGVBQUMsS0FBRCxFQUFRLElBQVIsRUFBaUI7QUFDdEIsa0JBQVksTUFBTSxVQUFsQixFQUNHLElBREgsQ0FDUSxFQUFDLE9BQU8sRUFBQyxHQUFHLEtBQUssU0FBTCxDQUFlLENBQWYsQ0FBSixFQUF1QixHQUFHLEtBQUssU0FBTCxDQUFlLENBQWYsQ0FBMUIsRUFBUixFQURSO0FBRUEsYUFBTyxLQUFQO0FBQ0QsS0EzRWtCO0FBNEVuQixlQUFXLG1CQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWlCO0FBQzFCLFlBQU0sWUFBTixHQUFxQixFQUFyQjtBQUNBLGFBQU8sS0FBUDtBQUNELEtBL0VrQjtBQWdGbkIsVUFBTSxjQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWlCO0FBQ3JCLGFBQU8sTUFBTSxZQUFOLENBQW1CLE1BQW5CLENBQTBCLFVBQUMsS0FBRCxFQUFRLEtBQVIsRUFBa0I7QUFDakQsWUFBSSxVQUFVLHdCQUF3QixLQUF4QixDQUFkO0FBQ0EsZUFBTyxRQUFRLEtBQVIsRUFBZSxLQUFmLENBQVA7QUFDRCxPQUhNLEVBR0osS0FISSxDQUFQO0FBSUQsS0FyRmtCO0FBc0ZuQixZQUFRLGdCQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWlCO0FBQ3ZCLGFBQU8sTUFBTSxZQUFOLENBQW1CLE1BQW5CLENBQTBCLFVBQUMsS0FBRCxFQUFRLEtBQVIsRUFBa0I7QUFDakQsWUFBSSxVQUFVLDBCQUEwQixLQUExQixDQUFkO0FBQ0EsZUFBTyxRQUFRLEtBQVIsRUFBZSxLQUFmLENBQVA7QUFDRCxPQUhNLEVBR0osS0FISSxDQUFQO0FBSUQ7QUEzRmtCLEdBMUVyQjtBQUFBLE1Bd0tBLHdCQUF3QixTQUF4QixxQkFBd0IsQ0FBQyxLQUFELEVBQVEsSUFBUixFQUFpQjtBQUN2QyxXQUFPLEtBQVA7QUFDRCxHQTFLRDtBQUFBLE1BNEtBLHVCQUF1QixTQUF2QixvQkFBdUIsQ0FBQyxJQUFELEVBQVU7QUFDL0IsV0FBTyxtQkFBbUIsS0FBSyxNQUF4QixLQUFtQyxtQkFBbUIsS0FBSyxJQUF4QixDQUFuQyxJQUFvRSxxQkFBM0U7QUFDRCxHQTlLRDtBQUFBLE1BZ0xBLDBCQUEwQixTQUExQix1QkFBMEIsQ0FBQyxLQUFELEVBQVc7QUFDbkMsV0FBTyxzQkFBc0IsTUFBTSxJQUE1QixDQUFQO0FBQ0QsR0FsTEQ7QUFBQSxNQW9MQSw0QkFBNEIsU0FBNUIseUJBQTRCLENBQUMsS0FBRCxFQUFXO0FBQ3JDLFdBQU8sd0JBQXdCLE1BQU0sSUFBOUIsQ0FBUDtBQUNELEdBdExEO0FBQUEsTUF3TEEsdUJBQXVCLFNBQXZCLG9CQUF1QixDQUFDLEtBQUQsRUFBVztBQUNoQyxVQUFNLFNBQU4sR0FBa0IsZUFBZSxRQUFRLE1BQU0sVUFBZCxDQUFmLENBQWxCO0FBQ0EsVUFBTSxTQUFOLEdBQWtCLFlBQVksTUFBTSxVQUFsQixDQUFsQjtBQUNBLFdBQU8sS0FBUDtBQUNELEdBNUxEO0FBQUEsTUE4TEEsVUFBVSxTQUFWLE9BQVUsQ0FBQyxLQUFELEVBQVc7QUFDbkIsUUFBSSxRQUFRLDBCQUFaO0FBQ0EsWUFBUSxNQUFNLE1BQU4sQ0FBYSxVQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWlCO0FBQ3BDLFVBQUksVUFBVSxxQkFBcUIsSUFBckIsQ0FBZDtBQUNBLGFBQU8sUUFBUSxxQkFBcUIsS0FBckIsQ0FBUixFQUFxQyxJQUFyQyxDQUFQO0FBQ0QsS0FITyxFQUdMLDBCQUhLLENBQVI7QUFJQSxXQUFPLE1BQU0sR0FBYjtBQUNELEdBck1EO0FBQUEsTUF1TUEsVUFBVSxTQUFWLE9BQVUsQ0FBQyxLQUFELEVBQVc7QUFDbkIsV0FBTyxNQUNKLE1BREksQ0FDRyxVQUFDLGFBQUQsRUFBZ0IsWUFBaEIsRUFBaUM7QUFDdkMsYUFBTyxjQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBUDtBQUNELEtBSEksRUFHRixFQUhFLENBQVA7QUFJRCxHQTVNRDtBQUFBLE1BOE1BLGNBQWMsU0FBZCxXQUFjLENBQUMsS0FBRCxFQUFXO0FBQ3ZCLFdBQU8sTUFBTSxNQUFNLE1BQU4sR0FBZSxDQUFyQixDQUFQO0FBQ0QsR0FoTkQ7QUFBQSxNQWtOQSxvQkFBb0IsU0FBcEIsaUJBQW9CLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBZTtBQUNqQyxRQUFJLFFBQVEsU0FBUyxDQUFyQixFQUF3QjtBQUN0QixhQUFPLElBQVA7QUFDRDtBQUNELFdBQU8sSUFBUDtBQUNELEdBdk5EO0FBQUEsTUF5TkEsUUFBUSxTQUFSLEtBQVEsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFnQjtBQUN0QixXQUFPO0FBQ0wsU0FBRyxrQkFBa0IsS0FBSyxDQUF2QixFQUEwQixLQUFLLENBQS9CLENBREU7QUFFTCxTQUFHLGtCQUFrQixLQUFLLENBQXZCLEVBQTBCLEtBQUssQ0FBL0IsQ0FGRTtBQUdMLGFBQU8sa0JBQWtCLEtBQUssS0FBdkIsRUFBOEIsS0FBSyxLQUFuQyxDQUhGO0FBSUwsY0FBUSxrQkFBa0IsS0FBSyxNQUF2QixFQUErQixLQUFLLE1BQXBDO0FBSkgsS0FBUDtBQU1BLFdBQU87QUFDTCxTQUFHLGtCQUFrQixLQUFLLENBQXZCLEVBQTBCLEtBQUssQ0FBL0IsQ0FERTtBQUVMLFNBQUcsa0JBQWtCLEtBQUssQ0FBdkIsRUFBMEIsS0FBSyxDQUEvQixDQUZFO0FBR0wsYUFBTyxrQkFBa0IsS0FBSyxLQUF2QixFQUE4QixLQUFLLEtBQW5DLENBSEY7QUFJTCxjQUFRLGtCQUFrQixLQUFLLE1BQXZCLEVBQStCLEtBQUssTUFBcEM7QUFKSCxLQUFQO0FBTUEsUUFBSSxTQUFTO0FBQ1gsU0FBRyxLQUFLLEdBQUwsQ0FBUyxLQUFLLENBQWQsRUFBaUIsS0FBSyxDQUF0QixDQURRO0FBRVgsU0FBRyxLQUFLLEdBQUwsQ0FBUyxLQUFLLENBQWQsRUFBaUIsS0FBSyxDQUF0QixDQUZRO0FBR1gsYUFBTyxLQUFLLEdBQUwsQ0FBUyxLQUFLLEtBQWQsRUFBcUIsS0FBSyxLQUExQixFQUFpQyxLQUFLLENBQUwsR0FBUyxLQUFLLENBQWQsR0FDcEMsS0FBSyxLQUFMLEdBQWEsS0FBSyxLQUFsQixJQUEyQixLQUFLLENBQUwsSUFBVSxLQUFLLENBQUwsR0FBUyxLQUFLLEtBQXhCLENBQTNCLENBRG9DLEdBRXBDLEtBQUssS0FBTCxHQUFhLEtBQUssS0FBbEIsSUFBMkIsS0FBSyxDQUFMLElBQVUsS0FBSyxDQUFMLEdBQVMsS0FBSyxLQUF4QixDQUEzQixDQUZHLENBSEk7QUFNWCxjQUFRLEtBQUssR0FBTCxDQUFTLEtBQUssTUFBZCxFQUFzQixLQUFLLE1BQTNCLEVBQW1DLEtBQUssQ0FBTCxHQUFTLEtBQUssQ0FBZCxHQUN2QyxLQUFLLE1BQUwsR0FBYyxLQUFLLE1BQW5CLElBQTZCLEtBQUssQ0FBTCxJQUFVLEtBQUssQ0FBTCxHQUFTLEtBQUssTUFBeEIsQ0FBN0IsQ0FEdUMsR0FFdkMsS0FBSyxNQUFMLEdBQWMsS0FBSyxNQUFuQixJQUE2QixLQUFLLENBQUwsSUFBVSxLQUFLLENBQUwsR0FBUyxLQUFLLE1BQXhCLENBQTdCLENBRkk7QUFORyxLQUFiO0FBVUEsV0FBTyxNQUFQO0FBQ0QsR0FqUEQ7QUFBQSxNQW1QQSxpQkFBaUIsU0FBakIsY0FBaUIsQ0FBQyxVQUFELEVBQWdCO0FBQy9CLFdBQU8sV0FDSixHQURJLENBQ0EsVUFBQyxLQUFELEVBQVc7QUFDZCxhQUFPO0FBQ0wsbUJBQVcsTUFBTSxTQUFOLElBQW1CLEVBQUMsR0FBRyxDQUFKLEVBQU8sR0FBRyxDQUFWLEVBRHpCO0FBRUwsZUFBTyxNQUFNLEtBQU4sSUFBZSxFQUFDLEdBQUcsQ0FBSixFQUFPLEdBQUcsQ0FBVjtBQUZqQixPQUFQO0FBSUQsS0FOSSxFQU9KLE1BUEksQ0FPRyxVQUFDLGFBQUQsRUFBZ0IsWUFBaEIsRUFBaUM7QUFDdkMsYUFBTztBQUNMLG1CQUFXO0FBQ1QsYUFBRyxjQUFjLFNBQWQsQ0FBd0IsQ0FBeEIsR0FBNEIsYUFBYSxTQUFiLENBQXVCLENBQXZCLEdBQTJCLGNBQWMsS0FBZCxDQUFvQixDQURyRTtBQUVULGFBQUcsY0FBYyxTQUFkLENBQXdCLENBQXhCLEdBQTRCLGFBQWEsU0FBYixDQUF1QixDQUF2QixHQUEyQixjQUFjLEtBQWQsQ0FBb0I7QUFGckUsU0FETjtBQUtMLGVBQU87QUFDTCxhQUFHLGNBQWMsS0FBZCxDQUFvQixDQUFwQixHQUF3QixhQUFhLEtBQWIsQ0FBbUIsQ0FEekM7QUFFTCxhQUFHLGNBQWMsS0FBZCxDQUFvQixDQUFwQixHQUF3QixhQUFhLEtBQWIsQ0FBbUI7QUFGekM7QUFMRixPQUFQO0FBVUQsS0FsQkksRUFrQkYsRUFBQyxXQUFXLEVBQUMsR0FBRyxDQUFKLEVBQU8sR0FBRyxDQUFWLEVBQVosRUFBMEIsT0FBTyxFQUFDLEdBQUcsQ0FBSixFQUFPLEdBQUcsQ0FBVixFQUFqQyxFQWxCRSxDQUFQO0FBbUJELEdBdlFEO0FBQUEsTUF5UUEsb0JBQW9CLFNBQXBCLGlCQUFvQixDQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWIsRUFBaUIsS0FBakIsRUFBMkI7QUFDN0MsUUFBSSxJQUFKO0FBQ0EsUUFBSSxPQUFPLEVBQVAsSUFBYSxPQUFPLEVBQXBCLElBQTBCLE9BQU8sRUFBckMsRUFBeUM7QUFDdkMsYUFBTztBQUNMLFlBQUksRUFEQyxFQUNHLElBQUksRUFEUCxFQUNZLElBQUksRUFEaEIsRUFDb0IsSUFBSSxFQUR4QjtBQUVMLFlBQUksRUFGQyxFQUVHLElBQUksRUFGUCxFQUVZLElBQUksRUFGaEIsRUFFb0IsSUFBSTtBQUZ4QixPQUFQO0FBSUQsS0FMRCxNQUtPO0FBQ0wsYUFBTyxzQkFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEIsRUFBOUIsRUFBa0MsRUFBbEMsRUFBc0MsS0FBdEMsQ0FBUDtBQUNEO0FBQ0QsV0FBTyxJQUFQO0FBQ0QsR0FwUkQ7QUFBQSxNQXNSQSx3QkFBd0IsU0FBeEIscUJBQXdCLENBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFULEVBQWEsRUFBYixFQUFpQixLQUFqQixFQUEyQjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBSSxJQUFJLFFBQVEsQ0FBaEI7QUFBQSxRQUNFLElBQUksS0FBSyxJQUFMLENBQVUsQ0FBQyxLQUFLLEVBQU4sS0FBYSxLQUFLLEVBQWxCLENBQVYsQ0FETjtBQUFBLFFBRUUsS0FBSyxJQUFJLEtBQUssRUFBTCxHQUFRLENBRm5CO0FBQUEsUUFHRSxLQUFLLElBQUksS0FBSyxFQUFMLEdBQVEsQ0FIbkI7QUFBQSxRQUlFLE1BQU0sSUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULENBQUosR0FBbUIsRUFKM0I7QUFBQSxRQUtFLE1BQU0sSUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULENBQUosR0FBbUIsRUFMM0I7QUFBQSxRQU1FLE1BQU0sSUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULENBQUosR0FBbUIsRUFOM0I7QUFBQSxRQU9FLE1BQU0sSUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULENBQUosR0FBbUIsRUFQM0I7QUFBQSxRQVFFLE1BQU0sSUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULENBQUosR0FBbUIsRUFSM0I7QUFBQSxRQVNFLE1BQU0sSUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULENBQUosR0FBbUIsRUFUM0I7QUFBQSxRQVVFLE1BQU0sSUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULENBQUosR0FBbUIsRUFWM0I7QUFBQSxRQVdFLE1BQU0sSUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULENBQUosR0FBbUIsRUFYM0I7QUFZQSxXQUFPO0FBQ0wsVUFBSSxHQURDLEVBQ0ksSUFBSSxHQURSLEVBQ2MsSUFBSSxHQURsQixFQUN1QixJQUFJLEdBRDNCO0FBRUwsVUFBSSxHQUZDLEVBRUksSUFBSSxHQUZSLEVBRWMsSUFBSSxHQUZsQixFQUV1QixJQUFJO0FBRjNCLEtBQVA7QUFJRCxHQWhVRDtBQUFBLE1Ba1VBLHVCQUF1QixTQUF2QixvQkFBdUIsQ0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLEVBQVQsRUFBYSxFQUFiLEVBQWlCLEVBQWpCLEVBQXFCLEVBQXJCLEVBQXlCLEtBQXpCLEVBQW1DO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBSSxJQUFJLEtBQUssSUFBTCxDQUFVLENBQUMsS0FBSyxFQUFOLEtBQWEsS0FBSyxFQUFsQixDQUFWLENBQVI7QUFBQSxRQUNFLE9BQU8sS0FBSyxHQUFMLENBQVMsQ0FBVCxDQURUO0FBQUEsUUFDc0IsT0FBTyxLQUFLLEdBQUwsQ0FBUyxDQUFULENBRDdCO0FBQUEsUUFFRSxjQUFjLFFBQVEsS0FBSyxJQUFMLENBQVUsS0FBRyxFQUFILEdBQVEsSUFBUixHQUFhLElBQWIsR0FBb0IsS0FBRyxFQUFILEdBQVEsSUFBUixHQUFhLElBQTNDLENBRnhCO0FBR0EsV0FBTyxXQUFQO0FBQ0QsR0ExVkQ7OztBQTRWQTtBQUNBLDJCQUF5QixTQUF6QixzQkFBeUIsQ0FBQyxLQUFELEVBQVEsU0FBUixFQUFzQjtBQUM3QyxRQUFJLFdBQVcsQ0FBQztBQUNkLFVBQUksVUFBVSxDQURBO0FBRWQsVUFBSSxVQUFVLENBRkE7QUFHZCxVQUFJLFVBQVUsQ0FBVixHQUFjLFVBQVUsS0FIZDtBQUlkLFVBQUksVUFBVSxDQUpBLEVBQUQsRUFJTTtBQUNuQixVQUFJLFVBQVUsQ0FBVixHQUFjLFVBQVUsS0FEVDtBQUVuQixVQUFJLFVBQVUsQ0FGSztBQUduQixVQUFJLFVBQVUsQ0FBVixHQUFjLFVBQVUsS0FIVDtBQUluQixVQUFJLFVBQVUsQ0FBVixHQUFjLFVBQVUsTUFKVCxFQUpOLEVBUXdCO0FBQ3JDLFVBQUksVUFBVSxDQUFWLEdBQWMsVUFBVSxLQURTO0FBRXJDLFVBQUksVUFBVSxDQUFWLEdBQWMsVUFBVSxNQUZTO0FBR3JDLFVBQUksVUFBVSxDQUh1QjtBQUlyQyxVQUFJLFVBQVUsQ0FBVixHQUFjLFVBQVUsTUFKUyxFQVJ4QixFQVl3QjtBQUNyQyxVQUFJLFVBQVUsQ0FEdUI7QUFFckMsVUFBSSxVQUFVLENBQVYsR0FBYyxVQUFVLE1BRlM7QUFHckMsVUFBSSxVQUFVLENBSHVCO0FBSXJDLFVBQUksVUFBVTtBQUp1QixLQVp4QixDQUFmOztBQW1CQSxRQUFJLFdBQVcsU0FBUyxHQUFULENBQWEsVUFBQyxPQUFELEVBQWE7QUFDdkMsVUFBSSxJQUFJLEVBQUUsUUFBUSxFQUFSLEdBQWEsUUFBUSxFQUF2QixDQUFSO0FBQUEsVUFDRSxJQUFJLFFBQVEsRUFBUixHQUFhLFFBQVEsRUFEM0I7QUFBQSxVQUVFLElBQUksRUFBRSxJQUFJLFFBQVEsRUFBWixHQUFpQixJQUFJLFFBQVEsRUFBL0IsQ0FGTjtBQUFBLFVBR0UsSUFBSSxJQUFJLE1BQU0sQ0FBVixHQUFjLElBQUksTUFBTSxDQUF4QixHQUE0QixDQUhsQztBQUlFLGFBQU8sQ0FBUDtBQUNILEtBTmMsRUFNWixLQU5ZLENBTU4sVUFBQyxDQUFELEVBQU87QUFDZCxhQUFPLElBQUksQ0FBWDtBQUNELEtBUmMsQ0FBZjs7QUFVQSxXQUFPLFFBQVA7QUFDRCxHQTVYRDs7QUErWEEsT0FBSyxPQUFMLEdBQWUsT0FBZjtBQUNBLE9BQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxPQUFLLGNBQUwsR0FBc0IsY0FBdEI7QUFDQSxPQUFLLGlCQUFMLEdBQXlCLGlCQUF6QjtBQUNBLE9BQUssc0JBQUwsR0FBOEIsc0JBQTlCO0FBRUQ7OztBQzdZRDs7Ozs7UUFNZ0IsTSxHQUFBLE07O0FBSmhCOztBQUNBOztBQUdPLFNBQVMsTUFBVCxDQUFnQixRQUFoQixFQUEwQixRQUExQixFQUFvQzs7QUFFekMsTUFBSSxPQUFPLElBQVg7QUFBQSxNQUNFLFdBQVcsWUFBWSx3QkFEekI7QUFBQSxNQUVFLFdBQVcsWUFBWSxvQ0FGekI7O0FBS0EsTUFBSSxpQ0FBaUMsU0FBakMsOEJBQWlDLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBa0I7QUFDckQsUUFBSSxRQUFRLEVBQVo7QUFBQSxRQUFnQixRQUFRLENBQXhCO0FBQ0EsT0FBRztBQUNELGNBQVEsS0FBSywwQkFBTCxDQUFnQyxLQUFoQyxFQUF1QyxLQUF2QyxFQUE4QyxLQUE5QyxDQUFSO0FBQ0EsVUFBSSxVQUFVLENBQUMsQ0FBZixFQUFrQjtBQUNoQixjQUFNLElBQU4sQ0FBVyxNQUFNLEtBQU4sQ0FBWSxLQUFaLEVBQW1CLFFBQVEsTUFBTSxNQUFqQyxDQUFYO0FBQ0EsaUJBQVMsTUFBTSxNQUFmO0FBQ0Q7QUFDRixLQU5ELFFBTVMsVUFBVSxDQUFDLENBQVgsSUFBZ0IsUUFBUSxNQUFNLE1BTnZDO0FBT0EsV0FBTyxLQUFQO0FBQ0QsR0FWRDtBQUFBLE1BWUEsNkJBQTZCLFNBQTdCLDBCQUE2QixDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsVUFBZixFQUE4QjtBQUN6RCxpQkFBYSxjQUFjLENBQTNCO0FBQ0EsUUFBSSxRQUFRLEtBQVo7QUFBQSxRQUFtQixRQUFRLENBQUMsQ0FBNUI7QUFDQSxTQUFLLElBQUksSUFBSSxVQUFiLEVBQXlCLEtBQUssTUFBTSxNQUFOLEdBQWUsTUFBTSxNQUFuRCxFQUEyRCxHQUEzRCxFQUFnRTtBQUM5RCxjQUFRLElBQVI7QUFDQSxXQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksTUFBTSxNQUExQixFQUFrQyxHQUFsQyxFQUF1QztBQUNyQyxZQUFJLE1BQU0sSUFBSSxDQUFWLEVBQWEsTUFBYixLQUF3QixNQUFNLENBQU4sRUFBUyxNQUFyQyxFQUE2QztBQUMzQyxrQkFBUSxLQUFSO0FBQ0E7QUFDRDtBQUNGO0FBQ0QsVUFBSSxVQUFVLElBQWQsRUFBb0I7QUFDbEIsZ0JBQVEsQ0FBUjtBQUNBO0FBQ0Q7QUFDRjtBQUNELFdBQU8sS0FBUDtBQUNELEdBN0JEO0FBQUEsTUErQkEsZUFBZSxTQUFmLFlBQWUsQ0FBQyxNQUFELEVBQVMsSUFBVCxFQUFrQjtBQUMvQixRQUFJLE9BQU8sS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLEtBQUssTUFBbkIsQ0FBWDtBQUNBLFdBQU8sT0FBUCxDQUFlLFVBQUMsS0FBRCxFQUFXO0FBQ3hCLFVBQUksUUFBUSxDQUFDLENBQWI7QUFDQSxTQUFHO0FBQ0QsZ0JBQVEsS0FBSywwQkFBTCxDQUFnQyxLQUFoQyxFQUF1QyxJQUF2QyxDQUFSO0FBQ0EsWUFBSSxVQUFVLENBQUMsQ0FBZixFQUFrQjtBQUNoQixlQUFLLE1BQUwsQ0FBWSxLQUFaLEVBQW1CLE1BQU0sTUFBekI7QUFDRDtBQUNGLE9BTEQsUUFLUyxVQUFVLENBQUMsQ0FMcEI7QUFNRCxLQVJEO0FBU0EsV0FBTyxJQUFQO0FBQ0QsR0EzQ0Q7O0FBOENBLE9BQUssT0FBTCxHQUFlLFNBQVMsT0FBeEI7QUFDQSxPQUFLLGNBQUwsR0FBc0IsUUFBdEI7QUFDQSxPQUFLLDhCQUFMLEdBQXNDLDhCQUF0QztBQUNBLE9BQUssMEJBQUwsR0FBa0MsMEJBQWxDO0FBQ0EsT0FBSyxZQUFMLEdBQW9CLFlBQXBCO0FBRUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cnkuanMnXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEN1c3RvbU1hdGNoZXJzKGdlb21ldHJ5KSB7XHJcblxyXG4gIGdlb21ldHJ5ID0gZ2VvbWV0cnkgfHwgbmV3IEdlb21ldHJ5KCk7XHJcblxyXG5cclxuICB2YXIgdG9CZVBhcnRPZiA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBleHBlY3RlZC5sZW5ndGggLSBhY3R1YWwubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIG1hdGNoID0gYWN0dWFsLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFjdHVhbC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoZXhwZWN0ZWRbaSArIGpdLm1ldGhvZCAhPT0gYWN0dWFsW2pdLm1ldGhvZCkge1xyXG4gICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChtYXRjaCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG1hdGNoID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGUgbm90IHBhcnQgb2YnfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9CZUluc2lkZVRoZUFyZWFPZiA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIHNtYWxsU2hhcGUgPSBhY3R1YWwsXHJcbiAgICAgICAgICBiaWdTaGFwZSA9IGV4cGVjdGVkLFxyXG4gICAgICAgICAgYmlnU2hhcGVCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChiaWdTaGFwZSksXHJcbiAgICAgICAgICBzbWFsbFNoYXBlQkJveCA9IGdlb21ldHJ5LmdldEJCb3goc21hbGxTaGFwZSksXHJcbiAgICAgICAgICBjZW50ZXIgPSB7eDogc21hbGxTaGFwZUJCb3gueCArIHNtYWxsU2hhcGVCQm94LndpZHRoIC8gMiwgeTogc21hbGxTaGFwZUJCb3gueSArIHNtYWxsU2hhcGVCQm94LmhlaWdodCAvIDJ9LFxyXG4gICAgICAgICAgaXNDZW50ZXJJbnNpZGUgPSBnZW9tZXRyeS5pc1BvaW50SW5zaWRlUmVjdGFuZ2xlKGNlbnRlciwgYmlnU2hhcGVCQm94KSxcclxuICAgICAgICAgIHJlc3VsdCA9IGlzQ2VudGVySW5zaWRlID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGUgaXMgbm90IGluc2lkZSB0aGUgYXJlYSBvZid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgYWN0dWFsQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYWN0dWFsKSxcclxuICAgICAgICAgIGV4cGVjdGVkQkJveCA9IGdlb21ldHJ5LmdldEJCb3goZXhwZWN0ZWQpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVQb3NpdGlvbiA9IGFjdHVhbEJCb3gueCA9PT0gZXhwZWN0ZWRCQm94LnggJiYgYWN0dWFsQkJveC55ID09PSBleHBlY3RlZEJCb3gueSxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lUG9zaXRpb24gPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZXMgZG9uYHQgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0hhdmVUaGVTYW1lU2l6ZVdpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZVNpemUgPSBhY3R1YWxCQm94LndpZHRoID09PSBleHBlY3RlZEJCb3gud2lkdGggJiYgYWN0dWFsQkJveC5oZWlnaHQgPT09IGV4cGVjdGVkQkJveC5oZWlnaHQsXHJcbiAgICAgICAgICByZXN1bHQgPSBoYXZlVGhlU2FtZVNpemUgPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZXMgZG9uYHQgaGF2ZSB0aGUgc2FtZSBzaXplJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZUFsaWdubWVudCA9IGFjdHVhbEJCb3gueSA9PT0gZXhwZWN0ZWRCQm94LnksXHJcbiAgICAgICAgICByZXN1bHQgPSBoYXZlVGhlU2FtZUFsaWdubWVudCA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIGhvcml6b250YWwgcG9zaXRpb24nfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9CZVZlcnRpY2FsbHlBbGlnbldpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZUFsaWdubWVudCA9IGFjdHVhbEJCb3gueCA9PT0gZXhwZWN0ZWRCQm94LngsXHJcbiAgICAgICAgICByZXN1bHQgPSBoYXZlVGhlU2FtZUFsaWdubWVudCA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIHZlcnRpY2FsIHBvc2l0aW9uJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLnRvQmVQYXJ0T2YgPSB0b0JlUGFydE9mO1xyXG4gIHRoaXMudG9CZUluc2lkZVRoZUFyZWFPZiA9IHRvQmVJbnNpZGVUaGVBcmVhT2Y7XHJcbiAgdGhpcy50b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoID0gdG9IYXZlVGhlU2FtZVBvc2l0aW9uV2l0aDtcclxuICB0aGlzLnRvSGF2ZVRoZVNhbWVTaXplV2l0aCA9IHRvSGF2ZVRoZVNhbWVTaXplV2l0aDtcclxuICB0aGlzLnRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGggPSB0b0JlSG9yaXpvbnRhbGx5QWxpZ25XaXRoO1xyXG4gIHRoaXMudG9CZVZlcnRpY2FsbHlBbGlnbldpdGggPSB0b0JlVmVydGljYWxseUFsaWduV2l0aDtcclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gR2VvbWV0cnkoKSB7XHJcblxyXG4gIHZhciB0aGF0ID0gdGhpcztcclxuXHJcblxyXG4gIHZhciBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUgPSAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBib3g6IHt4OiBOYU4sIHk6IE5hTiwgd2lkdGg6IE5hTiwgaGVpZ2h0OiBOYU59LFxyXG4gICAgICB0cmFuc2Zvcm1zOiBbW11dLFxyXG4gICAgICBzaGFwZXNJblBhdGg6IFtdLFxyXG4gICAgICBtb3ZlVG9Mb2NhdGlvbjoge3g6IE5hTiwgeTogTmFOfSxcclxuICAgICAgbGluZVdpZHRoczogWzFdXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIHBhdGhGaWxsU2hhcGVIYW5kbGVycyA9IHtcclxuICAgIHJlY3Q6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIHggPSBzaGFwZS54LFxyXG4gICAgICAgIHkgPSBzaGFwZS55LFxyXG4gICAgICAgIHdpZHRoID0gc2hhcGUud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0ID0gc2hhcGUuaGVpZ2h0LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IHNoYXBlLmN4LFxyXG4gICAgICAgIGN5ID0gc2hhcGUuY3ksXHJcbiAgICAgICAgcnggPSBzaGFwZS5yeCxcclxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiBjeCAtIHJ4LCB5OiBjeSAtIHJ5LCB3aWR0aDogMiAqIHJ4LCBoZWlnaHQ6IDIgKiByeX07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHBhdGhTdHJva2VTaGFwZUhhbmRsZXJzID0ge1xyXG4gICAgcmVjdDogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeCA9IHNoYXBlLngsXHJcbiAgICAgICAgeSA9IHNoYXBlLnksXHJcbiAgICAgICAgd2lkdGggPSBzaGFwZS53aWR0aCxcclxuICAgICAgICBoZWlnaHQgPSBzaGFwZS5oZWlnaHQsXHJcbiAgICAgICAgc2NhbGVkTGluZVdpZHRoID0gc3RhdGUubGluZVdpZHRoICE9PSAxID8gc3RhdGUubGluZVdpZHRoIDogMCxcclxuICAgICAgICB4U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgeVNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4IC0geFNjYWxlZExpbmVXaWR0aCAgLyAyLCB5OiB5IC0geVNjYWxlZExpbmVXaWR0aCAvIDIsIHdpZHRoOiB3aWR0aCArIHhTY2FsZWRMaW5lV2lkdGgsIGhlaWdodDogaGVpZ2h0ICsgeVNjYWxlZExpbmVXaWR0aH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyYzogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgY3ggPSBzaGFwZS5jeCxcclxuICAgICAgICBjeSA9IHNoYXBlLmN5LFxyXG4gICAgICAgIHJ4ID0gc2hhcGUucngsXHJcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIHhTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICB5U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IGN4IC0gcnggLSB4U2NhbGVkTGluZVdpZHRoIC8gMiwgeTogY3kgLSByeSAtIHlTY2FsZWRMaW5lV2lkdGggLyAyLCB3aWR0aDogMiAqIHJ4ICsgeFNjYWxlZExpbmVXaWR0aCwgaGVpZ2h0OiAyICogcnkgKyB5U2NhbGVkTGluZVdpZHRofTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgbGluZVRvOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciB4MSA9IHNoYXBlLngxLFxyXG4gICAgICAgIHkxID0gc2hhcGUueTEsXHJcbiAgICAgICAgeDIgPSBzaGFwZS54MixcclxuICAgICAgICB5MiA9IHNoYXBlLnkyLFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IGdldFNjYWxlZFdpZHRoT2ZMaW5lKHgxLCB5MSwgeDIsIHkyLCBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCwgc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksIHN0YXRlLmxpbmVXaWR0aCksXHJcbiAgICAgICAgcmVjdCA9IGdldFJlY3RBcm91bmRMaW5lKHgxLCB5MSwgeDIsIHkyLCBzY2FsZWRMaW5lV2lkdGggIT09IDEgPyBzY2FsZWRMaW5lV2lkdGggOiAwKSxcclxuICAgICAgICBuZXdCb3ggPSB7XHJcbiAgICAgICAgICB4OiBNYXRoLm1pbihyZWN0LngxLCByZWN0LngyLCByZWN0LngzLCByZWN0Lng0KSxcclxuICAgICAgICAgIHk6IE1hdGgubWluKHJlY3QueTEsIHJlY3QueTIsIHJlY3QueTMsIHJlY3QueTQpLFxyXG4gICAgICAgICAgd2lkdGg6IE1hdGgubWF4KHJlY3QueDEsIHJlY3QueDIsIHJlY3QueDMsIHJlY3QueDQpIC0gTWF0aC5taW4ocmVjdC54MSwgcmVjdC54MiwgcmVjdC54MywgcmVjdC54NCksXHJcbiAgICAgICAgICBoZWlnaHQ6IE1hdGgubWF4KHJlY3QueTEsIHJlY3QueTIsIHJlY3QueTMsIHJlY3QueTQpIC0gTWF0aC5taW4ocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NClcclxuICAgICAgICB9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBjYW52YXNDYWxsSGFuZGxlcnMgPSB7XHJcbiAgICBsaW5lV2lkdGg6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS5saW5lV2lkdGhzW3N0YXRlLmxpbmVXaWR0aHMubGVuZ3RoIC0gMV0gPSBjYWxsLnZhbDtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGZpbGxSZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc3Ryb2tlUmVjdDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICB3aWR0aCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgaGVpZ2h0ID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIHhTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICB5U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHggLSB4U2NhbGVkTGluZVdpZHRoIC8gMiwgeTogeSAtIHlTY2FsZWRMaW5lV2lkdGggLyAyLCB3aWR0aDogd2lkdGggKyB4U2NhbGVkTGluZVdpZHRoLCBoZWlnaHQ6IGhlaWdodCArIHlTY2FsZWRMaW5lV2lkdGh9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICByZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55O1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ3JlY3QnLCB4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmM6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgY3ggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIGN5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICByeCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgcnkgPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55O1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2FyYycsIGN4OiBjeCwgY3k6IGN5LCByeDogcngsIHJ5OiByeX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgbW92ZVRvOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHgxID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5MSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnk7XHJcbiAgICAgIHN0YXRlLm1vdmVUb0xvY2F0aW9uID0ge3g6IHgxLCB5OiB5MX07XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBsaW5lVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi54LFxyXG4gICAgICAgIHkxID0gc3RhdGUubW92ZVRvTG9jYXRpb24ueSxcclxuICAgICAgICB4MiA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeTIgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55O1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2xpbmVUbycsIHgxOiB4MSwgeTE6IHkxLCB4MjogeDIsIHkyOiB5Mn0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc2F2ZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLnRyYW5zZm9ybXMucHVzaChbXSk7XHJcbiAgICAgIHN0YXRlLmxpbmVXaWR0aHMucHVzaChsYXN0RWxlbWVudChzdGF0ZS5saW5lV2lkdGhzKSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICByZXN0b3JlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUudHJhbnNmb3Jtcy5wb3AoKTtcclxuICAgICAgc3RhdGUubGluZVdpZHRocy5wb3AoKTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHRyYW5zbGF0ZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIGxhc3RFbGVtZW50KHN0YXRlLnRyYW5zZm9ybXMpXHJcbiAgICAgICAgLnB1c2goe3RyYW5zbGF0ZToge3g6IGNhbGwuYXJndW1lbnRzWzBdLCB5OiBjYWxsLmFyZ3VtZW50c1sxXX19KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHNjYWxlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgbGFzdEVsZW1lbnQoc3RhdGUudHJhbnNmb3JtcylcclxuICAgICAgICAucHVzaCh7c2NhbGU6IHt4OiBjYWxsLmFyZ3VtZW50c1swXSwgeTogY2FsbC5hcmd1bWVudHNbMV19fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBiZWdpblBhdGg6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGggPSBbXTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGZpbGw6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICByZXR1cm4gc3RhdGUuc2hhcGVzSW5QYXRoLnJlZHVjZSgoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIgPSBnZXRQYXRoRmlsbFNoYXBlSGFuZGxlcihzaGFwZSk7XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZXIoc3RhdGUsIHNoYXBlKTtcclxuICAgICAgfSwgc3RhdGUpO1xyXG4gICAgfSxcclxuICAgIHN0cm9rZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHJldHVybiBzdGF0ZS5zaGFwZXNJblBhdGgucmVkdWNlKChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgICB2YXIgaGFuZGxlciA9IGdldFBhdGhTdHJva2VTaGFwZUhhbmRsZXIoc2hhcGUpO1xyXG4gICAgICAgIHJldHVybiBoYW5kbGVyKHN0YXRlLCBzaGFwZSk7XHJcbiAgICAgIH0sIHN0YXRlKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBudWxsQ2FudmFzQ2FsbEhhbmRsZXIgPSAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9LFxyXG5cclxuICBnZXRDYW52YXNDYWxsSGFuZGxlciA9IChjYWxsKSA9PiB7XHJcbiAgICByZXR1cm4gY2FudmFzQ2FsbEhhbmRsZXJzW2NhbGwubWV0aG9kXSB8fCBjYW52YXNDYWxsSGFuZGxlcnNbY2FsbC5hdHRyXSB8fCBudWxsQ2FudmFzQ2FsbEhhbmRsZXI7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aEZpbGxTaGFwZUhhbmRsZXIgPSAoc2hhcGUpID0+IHtcclxuICAgIHJldHVybiBwYXRoRmlsbFNoYXBlSGFuZGxlcnNbc2hhcGUudHlwZV07XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aFN0cm9rZVNoYXBlSGFuZGxlciA9IChzaGFwZSkgPT4ge1xyXG4gICAgcmV0dXJuIHBhdGhTdHJva2VTaGFwZUhhbmRsZXJzW3NoYXBlLnR5cGVdO1xyXG4gIH0sXHJcblxyXG4gIHByZUNhbnZhc0NhbGxIYW5kbGVyID0gKHN0YXRlKSA9PiB7XHJcbiAgICBzdGF0ZS50cmFuc2Zvcm0gPSB0b3RhbFRyYW5zZm9ybShmbGF0dGVuKHN0YXRlLnRyYW5zZm9ybXMpKTtcclxuICAgIHN0YXRlLmxpbmVXaWR0aCA9IGxhc3RFbGVtZW50KHN0YXRlLmxpbmVXaWR0aHMpO1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH0sXHJcblxyXG4gIGdldEJCb3ggPSAoc2hhcGUpID0+IHtcclxuICAgIHZhciBzdGF0ZSA9IGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSgpO1xyXG4gICAgc3RhdGUgPSBzaGFwZS5yZWR1Y2UoKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciBoYW5kbGVyID0gZ2V0Q2FudmFzQ2FsbEhhbmRsZXIoY2FsbCk7XHJcbiAgICAgIHJldHVybiBoYW5kbGVyKHByZUNhbnZhc0NhbGxIYW5kbGVyKHN0YXRlKSwgY2FsbCk7XHJcbiAgICB9LCBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUoKSk7XHJcbiAgICByZXR1cm4gc3RhdGUuYm94O1xyXG4gIH0sXHJcblxyXG4gIGZsYXR0ZW4gPSAoYXJyYXkpID0+IHtcclxuICAgIHJldHVybiBhcnJheVxyXG4gICAgICAucmVkdWNlKChwcmV2aW91c0FycmF5LCBjdXJyZW50QXJyYXkpID0+IHtcclxuICAgICAgICByZXR1cm4gcHJldmlvdXNBcnJheS5jb25jYXQoY3VycmVudEFycmF5KTtcclxuICAgICAgfSwgW10pO1xyXG4gIH0sXHJcblxyXG4gIGxhc3RFbGVtZW50ID0gKGFycmF5KSA9PiB7XHJcbiAgICByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XHJcbiAgfSxcclxuXHJcbiAgZmlyc3RUcnV0aHlPclplcm8gPSAodmFsMSwgdmFsMikgPT57XHJcbiAgICBpZiAodmFsMSB8fCB2YWwxID09PSAwKSB7XHJcbiAgICAgIHJldHVybiB2YWwxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbDI7XHJcbiAgfSxcclxuXHJcbiAgdW5pb24gPSAoYm94MSwgYm94MikgPT4ge1xyXG4gICAgYm94MSA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gxLndpZHRoLCBib3gyLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLmhlaWdodCwgYm94Mi5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgYm94MiA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94Mi54LCBib3gxLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLnksIGJveDEueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gyLndpZHRoLCBib3gxLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLmhlaWdodCwgYm94MS5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgeDogTWF0aC5taW4oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBNYXRoLm1pbihib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBNYXRoLm1heChib3gxLndpZHRoLCBib3gyLndpZHRoLCBib3gxLnggPCBib3gyLnhcclxuICAgICAgICA/IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDIueCAtIChib3gxLnggKyBib3gxLndpZHRoKSlcclxuICAgICAgICA6IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDEueCAtIChib3gyLnggKyBib3gyLndpZHRoKSkpLFxyXG4gICAgICBoZWlnaHQ6IE1hdGgubWF4KGJveDEuaGVpZ2h0LCBib3gyLmhlaWdodCwgYm94MS55IDwgYm94Mi55XHJcbiAgICAgICAgPyBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDIueSAtIChib3gxLnkgKyBib3gxLmhlaWdodCkpXHJcbiAgICAgICAgOiBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDEueSAtIChib3gyLnkgKyBib3gyLmhlaWdodCkpKVxyXG4gICAgfTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSxcclxuXHJcbiAgdG90YWxUcmFuc2Zvcm0gPSAodHJhbnNmb3JtcykgPT4ge1xyXG4gICAgcmV0dXJuIHRyYW5zZm9ybXNcclxuICAgICAgLm1hcCgodmFsdWUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHJhbnNsYXRlOiB2YWx1ZS50cmFuc2xhdGUgfHwge3g6IDAsIHk6IDB9LFxyXG4gICAgICAgICAgc2NhbGU6IHZhbHVlLnNjYWxlIHx8IHt4OiAxLCB5OiAxfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pXHJcbiAgICAgIC5yZWR1Y2UoKHByZXZpb3VzVmFsdWUsIGN1cnJlbnRWYWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0cmFuc2xhdGU6IHtcclxuICAgICAgICAgICAgeDogcHJldmlvdXNWYWx1ZS50cmFuc2xhdGUueCArIGN1cnJlbnRWYWx1ZS50cmFuc2xhdGUueCAqIHByZXZpb3VzVmFsdWUuc2NhbGUueCxcclxuICAgICAgICAgICAgeTogcHJldmlvdXNWYWx1ZS50cmFuc2xhdGUueSArIGN1cnJlbnRWYWx1ZS50cmFuc2xhdGUueSAqIHByZXZpb3VzVmFsdWUuc2NhbGUueVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNjYWxlOiB7XHJcbiAgICAgICAgICAgIHg6IHByZXZpb3VzVmFsdWUuc2NhbGUueCAqIGN1cnJlbnRWYWx1ZS5zY2FsZS54LFxyXG4gICAgICAgICAgICB5OiBwcmV2aW91c1ZhbHVlLnNjYWxlLnkgKiBjdXJyZW50VmFsdWUuc2NhbGUueVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sIHt0cmFuc2xhdGU6IHt4OiAwLCB5OiAwfSwgc2NhbGU6IHt4OiAxLCB5OiAxfX0pO1xyXG4gIH0sXHJcblxyXG4gIGdldFJlY3RBcm91bmRMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCB3aWR0aCkgPT4ge1xyXG4gICAgdmFyIHJlY3Q7XHJcbiAgICBpZiAoeDEgPT09IHkxICYmIHgxID09PSB4MiAmJiB4MSA9PT0geTIpIHtcclxuICAgICAgcmVjdCA9IHtcclxuICAgICAgICB4MTogeDEsIHkxOiB4MSwgIHgyOiB4MSwgeTI6IHgxLFxyXG4gICAgICAgIHg0OiB4MSwgeTQ6IHgxLCAgeDM6IHgxLCB5MzogeDFcclxuICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlY3QgPSBnZXRSZWN0QXJvdW5kTG9uZ0xpbmUoeDEsIHkxLCB4MiwgeTIsIHdpZHRoKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZWN0O1xyXG4gIH0sXHJcblxyXG4gIGdldFJlY3RBcm91bmRMb25nTGluZSA9ICh4MSwgeTEsIHgyLCB5Miwgd2lkdGgpID0+IHtcclxuICAgIC8vICByID0gdGhlIHJhZGl1cyBvciB0aGUgZ2l2ZW4gZGlzdGFuY2UgZnJvbSBhIGdpdmVuIHBvaW50IHRvIHRoZSBuZWFyZXN0IGNvcm5lcnMgb2YgdGhlIHJlY3RcclxuICAgIC8vICBhID0gdGhlIGFuZ2xlIGJldHdlZW4gdGhlIGxpbmUgYW5kIHRoZSBob3Jpem9udGFsIGF4aXNcclxuICAgIC8vICBiMSwgYjIgPSB0aGUgYW5nbGUgYmV0d2VlbiBoYWxmIHRoZSBoaWdodCBvZiB0aGUgcmVjdGFuZ2xlIGFuZCB0aGUgaG9yaXpvbnRhbCBheGlzXHJcbiAgICAvL1xyXG4gICAgLy8gIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSB0aGUgZ2l2ZW4gbGluZSBpcyBob3Jpem9udGFsLCBzbyBhID0gMC5cclxuICAgIC8vICBUaGUgZ2l2ZW4gbGluZSBpcyBiZXR3ZWVuIHRoZSB0d28gQCBzeW1ib2xzLlxyXG4gICAgLy8gIFRoZSArIHN5bWJvbHMgYXJlIHRoZSBjb3JuZXJzIG9mIHJlY3RhbmdsZSB0byBiZSBkZXRlcm1pbmVkLlxyXG4gICAgLy8gIEluIG9yZGVyIHRvIGZpbmQgdGhlIGIxIGFuZCBiMiBhbmdsZXMgd2UgaGF2ZSB0byBhZGQgUEkvMiBhbmQgcmVzcGVjdGl2bHkgc3VidHJhY3QgUEkvMi5cclxuICAgIC8vICBiMSBpcyB2ZXJ0aWNhbCBhbmQgcG9pbnRpbmcgdXB3b3JkcyBhbmQgYjIgaXMgYWxzbyB2ZXJ0aWNhbCBidXQgcG9pbnRpbmcgZG93bndvcmRzLlxyXG4gICAgLy8gIEVhY2ggY29ybmVyIGlzIHIgb3Igd2lkdGggLyAyIGZhciBhd2F5IGZyb20gaXRzIGNvcmVzcG9uZGVudCBsaW5lIGVuZGluZy5cclxuICAgIC8vICBTbyB3ZSBrbm93IHRoZSBkaXN0YW5jZSAociksIHRoZSBzdGFydGluZyBwb2ludHMgKHgxLCB5MSkgYW5kICh4MiwgeTIpIGFuZCB0aGUgKGIxLCBiMikgZGlyZWN0aW9ucy5cclxuICAgIC8vXHJcbiAgICAvLyAgKHgxLHkxKSAgICAgICAgICAgICAgICAgICAgKHgyLHkyKVxyXG4gICAgLy8gICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xyXG4gICAgLy8gICAgICBeICAgICAgICAgICAgICAgICAgICAgICAgXlxyXG4gICAgLy8gICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gICAgLy8gICAgICB8IGIxICAgICAgICAgICAgICAgICAgICAgfCBiMVxyXG4gICAgLy8gICAgICBAPT09PT09PT09PT09PT09PT09PT09PT09QFxyXG4gICAgLy8gICAgICB8IGIyICAgICAgICAgICAgICAgICAgICAgfCBiMlxyXG4gICAgLy8gICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gICAgLy8gICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgdlxyXG4gICAgLy8gICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xyXG4gICAgLy8gICh4NCx5NCkgICAgICAgICAgICAgICAgICAgICh4Myx5MylcclxuICAgIC8vXHJcblxyXG4gICAgdmFyIHIgPSB3aWR0aCAvIDIsXHJcbiAgICAgIGEgPSBNYXRoLmF0YW4oKHkyIC0geTEpIC8gKHgyIC0geDEpKSxcclxuICAgICAgYjEgPSBhICsgTWF0aC5QSS8yLFxyXG4gICAgICBiMiA9IGEgLSBNYXRoLlBJLzIsXHJcbiAgICAgIHJ4MSA9IHIgKiBNYXRoLmNvcyhiMSkgKyB4MSxcclxuICAgICAgcnkxID0gciAqIE1hdGguc2luKGIxKSArIHkxLFxyXG4gICAgICByeDIgPSByICogTWF0aC5jb3MoYjEpICsgeDIsXHJcbiAgICAgIHJ5MiA9IHIgKiBNYXRoLnNpbihiMSkgKyB5MixcclxuICAgICAgcngzID0gciAqIE1hdGguY29zKGIyKSArIHgyLFxyXG4gICAgICByeTMgPSByICogTWF0aC5zaW4oYjIpICsgeTIsXHJcbiAgICAgIHJ4NCA9IHIgKiBNYXRoLmNvcyhiMikgKyB4MSxcclxuICAgICAgcnk0ID0gciAqIE1hdGguc2luKGIyKSArIHkxO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDE6IHJ4MSwgeTE6IHJ5MSwgIHgyOiByeDIsIHkyOiByeTIsXHJcbiAgICAgIHg0OiByeDQsIHk0OiByeTQsICB4MzogcngzLCB5MzogcnkzXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIGdldFNjYWxlZFdpZHRoT2ZMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCBzeCwgc3ksIHdpZHRoKSA9PiB7XHJcbiAgICAvLyAgVGhlIG9yaWdpbmFsIHBvaW50cyBhcmUgbm90IG1vdmVkLiBPbmx5IHRoZSB3aWR0aCB3aWxsIGJlIHNjYWxlZC5cclxuICAgIC8vICBUaGUgd2lkdGggb2YgYW4gaG9yaXpvbnRhbCBsaW5lIHdpbGwgYmUgc2NhbGVkIHdpdGggdGhlIHN5IHJhdGlvIG9ubHkuXHJcbiAgICAvLyAgVGhlIHdpZHRoIG9mIGEgdmVydGl2YWwgbGluZSB3aWxsIGJlIHNjYWxlZCB3aXRoIHRoZSBzeCByYXRpbyBvbmx5LlxyXG4gICAgLy8gIFRoZSB3aWR0aCBvZiBhbiBvYmxpcXVlIGxpbmUgd2lsbCBiZSBzY2FsZWQgd2l0aCBib3RoIHRoZSBzeCBhbmQgc3lcclxuICAgIC8vYnV0IHByb3BvcnRpb25hbCB3aXRoIHRoZSBhbmdsZSBiZXR3ZWVuIHRoZSBsaW5lIGFuZCB0aGUgeCBhbmQgeSBheGVzLlxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cXFxyXG4gICAgLy8gICAgICAgICAgICAgICAuXFwgICh4Mix5MikgICAgICAgICAgICAgICAgICAgICAgICAgLi4uXFwgICh4Mix5MilcclxuICAgIC8vICAgICAgICAgICAgICAuLi5AICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4uLkBcclxuICAgIC8vICAgICAgICAgICAgIC4uLi8uXFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4uLi8uXFxcclxuICAgIC8vICAgICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICAgc3ggICAgICAgICAgICAgLi4uLi4vLi4uXFxcclxuICAgIC8vICAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgKy0tLT4gICAgICAgICAgICAuLi4uLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgLi4uLi4vLi4uLi5cclxuICAgIC8vICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgIFxcLi4uLy4uLi4uXHJcbiAgICAvLyAgICAgICAgIFxcLi8uLi4gICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgIFxcLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAgQC4uLiAgICAgICAgICAgICBzeSB2ICAgICAgICAgICAgICAgICBALi4uLi5cclxuICAgIC8vICAoeDEseTEpICBcXC4gICAgICAgICAgICAgICAgICAgICAgICAgICAoeDEseTEpICBcXC4uLlxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcLlxyXG4gICAgLy9cclxuICAgIHZhciBhID0gTWF0aC5hdGFuKCh5MiAtIHkxKSAvICh4MiAtIHgxKSksXHJcbiAgICAgIHNpbmEgPSBNYXRoLnNpbihhKSwgY29zYSA9IE1hdGguY29zKGEpLFxyXG4gICAgICBzY2FsZWRXaWR0aCA9IHdpZHRoICogTWF0aC5zcXJ0KHN4KnN4ICogc2luYSpzaW5hICsgc3kqc3kgKiBjb3NhKmNvc2EpO1xyXG4gICAgcmV0dXJuIHNjYWxlZFdpZHRoO1xyXG4gIH0sXHJcblxyXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjc1MjcyNS9maW5kaW5nLXdoZXRoZXItYS1wb2ludC1saWVzLWluc2lkZS1hLXJlY3RhbmdsZS1vci1ub3RcclxuICBpc1BvaW50SW5zaWRlUmVjdGFuZ2xlID0gKHBvaW50LCByZWN0YW5nbGUpID0+IHtcclxuICAgIHZhciBzZWdtZW50cyA9IFt7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSB9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHR9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodCxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0fSwge1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHQsXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55XHJcbiAgICB9XTtcclxuXHJcbiAgICB2YXIgaXNJbnNpZGUgPSBzZWdtZW50cy5tYXAoKHNlZ21lbnQpID0+IHtcclxuICAgICAgdmFyIEEgPSAtKHNlZ21lbnQueTIgLSBzZWdtZW50LnkxKSxcclxuICAgICAgICBCID0gc2VnbWVudC54MiAtIHNlZ21lbnQueDEsXHJcbiAgICAgICAgQyA9IC0oQSAqIHNlZ21lbnQueDEgKyBCICogc2VnbWVudC55MSksXHJcbiAgICAgICAgRCA9IEEgKiBwb2ludC54ICsgQiAqIHBvaW50LnkgKyBDO1xyXG4gICAgICAgIHJldHVybiBEO1xyXG4gICAgfSkuZXZlcnkoKEQpID0+IHtcclxuICAgICAgcmV0dXJuIEQgPiAwO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGlzSW5zaWRlO1xyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLmdldEJCb3ggPSBnZXRCQm94O1xyXG4gIHRoaXMudW5pb24gPSB1bmlvbjtcclxuICB0aGlzLnRvdGFsVHJhbnNmb3JtID0gdG90YWxUcmFuc2Zvcm07XHJcbiAgdGhpcy5nZXRSZWN0QXJvdW5kTGluZSA9IGdldFJlY3RBcm91bmRMaW5lO1xyXG4gIHRoaXMuaXNQb2ludEluc2lkZVJlY3RhbmdsZSA9IGlzUG9pbnRJbnNpZGVSZWN0YW5nbGU7XHJcblxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJ5LmpzJ1xyXG5pbXBvcnQgeyBDdXN0b21NYXRjaGVycyB9IGZyb20gJy4vY3VzdG9tTWF0Y2hlcnMuanMnXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFJhYmJpdChnZW9tZXRyeSwgbWF0Y2hlcnMpIHtcclxuXHJcbiAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgZ2VvbWV0cnkgPSBnZW9tZXRyeSB8fCBuZXcgR2VvbWV0cnkoKSxcclxuICAgIG1hdGNoZXJzID0gbWF0Y2hlcnMgfHwgbmV3IEN1c3RvbU1hdGNoZXJzKCk7XHJcblxyXG5cclxuICB2YXIgZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzID0gKHNoYXBlLCB3aGVyZSkgPT4ge1xyXG4gICAgdmFyIGZvdW5kID0gW10sIGluZGV4ID0gMDtcclxuICAgIGRvIHtcclxuICAgICAgaW5kZXggPSB0aGF0LmZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzKHNoYXBlLCB3aGVyZSwgaW5kZXgpO1xyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgZm91bmQucHVzaCh3aGVyZS5zbGljZShpbmRleCwgaW5kZXggKyBzaGFwZS5sZW5ndGgpKTtcclxuICAgICAgICBpbmRleCArPSBzaGFwZS5sZW5ndGg7XHJcbiAgICAgIH1cclxuICAgIH0gd2hpbGUgKGluZGV4ICE9PSAtMSAmJiBpbmRleCA8IHdoZXJlLmxlbmd0aCk7XHJcbiAgICByZXR1cm4gZm91bmQ7XHJcbiAgfSxcclxuXHJcbiAgZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMgPSAoc2hhcGUsIHdoZXJlLCBzdGFydEluZGV4KSA9PiB7XHJcbiAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCB8fCAwO1xyXG4gICAgdmFyIG1hdGNoID0gZmFsc2UsIGluZGV4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gc3RhcnRJbmRleDsgaSA8PSB3aGVyZS5sZW5ndGggLSBzaGFwZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBtYXRjaCA9IHRydWU7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2hhcGUubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBpZiAod2hlcmVbaSArIGpdLm1ldGhvZCAhPT0gc2hhcGVbal0ubWV0aG9kKSB7XHJcbiAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChtYXRjaCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGluZGV4O1xyXG4gIH0sXHJcblxyXG4gIHJlbW92ZVNoYXBlcyA9IChzaGFwZXMsIGZyb20pID0+IHtcclxuICAgIHZhciBjb3B5ID0gZnJvbS5zbGljZSgwLCBmcm9tLmxlbmd0aCk7XHJcbiAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcclxuICAgICAgdmFyIGluZGV4ID0gLTE7XHJcbiAgICAgIGRvIHtcclxuICAgICAgICBpbmRleCA9IHRoYXQuZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMoc2hhcGUsIGNvcHkpO1xyXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgIGNvcHkuc3BsaWNlKGluZGV4LCBzaGFwZS5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSB3aGlsZSAoaW5kZXggIT09IC0xKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvcHk7XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMuZ2V0QkJveCA9IGdlb21ldHJ5LmdldEJCb3g7XHJcbiAgdGhpcy5jdXN0b21NYXRjaGVycyA9IG1hdGNoZXJzO1xyXG4gIHRoaXMuZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzID0gZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzO1xyXG4gIHRoaXMuZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMgPSBmaW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cztcclxuICB0aGlzLnJlbW92ZVNoYXBlcyA9IHJlbW92ZVNoYXBlcztcclxuXHJcbn1cclxuIl19
