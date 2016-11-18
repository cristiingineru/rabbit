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
          match = true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGN1c3RvbU1hdGNoZXJzLmpzIiwic3JjXFxnZW9tZXRyeS5qcyIsInNyY1xccmFiYml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7O1FBS2dCLGMsR0FBQSxjOztBQUhoQjs7QUFHTyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0M7O0FBRXZDLGFBQVcsWUFBWSx3QkFBdkI7O0FBR0EsTUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFVLElBQVYsRUFBZ0IscUJBQWhCLEVBQXVDO0FBQ3RELFdBQU87QUFDTCxlQUFTLGlCQUFVLE1BQVYsRUFBa0IsUUFBbEIsRUFBNEI7QUFDbkMsWUFBSSxRQUFRLEtBQVo7QUFDQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksU0FBUyxNQUFULEdBQWtCLE9BQU8sTUFBN0MsRUFBcUQsR0FBckQsRUFBMEQ7QUFDeEQsa0JBQVEsSUFBUjtBQUNBLGVBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxPQUFPLE1BQTNCLEVBQW1DLEdBQW5DLEVBQXdDO0FBQ3RDLGdCQUFJLFNBQVMsSUFBSSxDQUFiLEVBQWdCLE1BQWhCLEtBQTJCLE9BQU8sQ0FBUCxFQUFVLE1BQXpDLEVBQWlEO0FBQy9DLHNCQUFRLEtBQVI7QUFDQTtBQUNEO0FBQ0Y7QUFDRCxjQUFJLFVBQVUsSUFBZCxFQUFvQjtBQUNsQjtBQUNEO0FBQ0Y7QUFDRCxZQUFJLFNBQVMsUUFBUSxFQUFDLE1BQU0sSUFBUCxFQUFSLEdBQXVCLEVBQUMsTUFBTSxLQUFQLEVBQWMsU0FBUyxtQkFBdkIsRUFBcEM7QUFDQSxlQUFPLE1BQVA7QUFDRDtBQWpCSSxLQUFQO0FBbUJELEdBcEJEO0FBQUEsTUFzQkEsc0JBQXNCLFNBQXRCLG1CQUFzQixDQUFVLElBQVYsRUFBZ0IscUJBQWhCLEVBQXVDO0FBQzNELFdBQU87QUFDTCxlQUFTLGlCQUFVLE1BQVYsRUFB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TUFBTSxDQUFOLEVBQVMsTUFBckMsRUFBNkM7QUFDM0Msa0JBQVEsS0FBUjtBQUNBO0FBQ0Q7QUFDRjtBQUNELFVBQUksVUFBVSxJQUFkLEVBQW9CO0FBQ2xCLGdCQUFRLENBQVI7QUFDQTtBQUNEO0FBQ0Y7QUFDRCxXQUFPLEtBQVA7QUFDRCxHQTdCRDtBQUFBLE1BK0JBLGVBQWUsU0FBZixZQUFlLENBQVMsTUFBVCxFQUFpQixJQUFqQixFQUF1QjtBQUNwQyxRQUFJLE9BQU8sS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLEtBQUssTUFBbkIsQ0FBWDtBQUNBLFdBQU8sT0FBUCxDQUFlLFVBQVMsS0FBVCxFQUFnQjtBQUM3QixVQUFJLFFBQVEsQ0FBQyxDQUFiO0FBQ0EsU0FBRztBQUNELGdCQUFRLEtBQUssMEJBQUwsQ0FBZ0MsS0FBaEMsRUFBdUMsSUFBdkMsQ0FBUjtBQUNBLFlBQUksVUFBVSxDQUFDLENBQWYsRUFBa0I7QUFDaEIsZUFBSyxNQUFMLENBQVksS0FBWixFQUFtQixNQUFNLE1BQXpCO0FBQ0Q7QUFDRixPQUxELFFBS1MsVUFBVSxDQUFDLENBTHBCO0FBTUQsS0FSRDtBQVNBLFdBQU8sSUFBUDtBQUNELEdBM0NEOztBQThDQSxPQUFLLE9BQUwsR0FBZSxTQUFTLE9BQXhCO0FBQ0EsT0FBSyxjQUFMLEdBQXNCLFFBQXRCO0FBQ0EsT0FBSyw4QkFBTCxHQUFzQyw4QkFBdEM7QUFDQSxPQUFLLDBCQUFMLEdBQWtDLDBCQUFsQztBQUNBLE9BQUssWUFBTCxHQUFvQixZQUFwQjtBQUVEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJ5LmpzJ1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBDdXN0b21NYXRjaGVycyhnZW9tZXRyeSkge1xyXG5cclxuICBnZW9tZXRyeSA9IGdlb21ldHJ5IHx8IG5ldyBHZW9tZXRyeSgpO1xyXG5cclxuXHJcbiAgdmFyIHRvQmVQYXJ0T2YgPSBmdW5jdGlvbiAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCkge1xyXG4gICAgICAgIHZhciBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXhwZWN0ZWQubGVuZ3RoIC0gYWN0dWFsLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBtYXRjaCA9IHRydWU7XHJcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFjdHVhbC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoZXhwZWN0ZWRbaSArIGpdLm1ldGhvZCAhPT0gYWN0dWFsW2pdLm1ldGhvZCkge1xyXG4gICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChtYXRjaCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG1hdGNoID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGUgbm90IHBhcnQgb2YnfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9CZUluc2lkZVRoZUFyZWFPZiA9IGZ1bmN0aW9uICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IGZ1bmN0aW9uIChhY3R1YWwsIGV4cGVjdGVkKSB7XHJcbiAgICAgICAgdmFyIHNtYWxsU2hhcGUgPSBhY3R1YWwsXHJcbiAgICAgICAgICBiaWdTaGFwZSA9IGV4cGVjdGVkLFxyXG4gICAgICAgICAgYmlnU2hhcGVCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChiaWdTaGFwZSksXHJcbiAgICAgICAgICBzbWFsbFNoYXBlQkJveCA9IGdlb21ldHJ5LmdldEJCb3goc21hbGxTaGFwZSksXHJcbiAgICAgICAgICBjZW50ZXIgPSB7eDogc21hbGxTaGFwZUJCb3gueCArIHNtYWxsU2hhcGVCQm94LndpZHRoIC8gMiwgeTogc21hbGxTaGFwZUJCb3gueSArIHNtYWxsU2hhcGVCQm94LmhlaWdodCAvIDJ9LFxyXG4gICAgICAgICAgaXNDZW50ZXJJbnNpZGUgPSBnZW9tZXRyeS5pc1BvaW50SW5zaWRlUmVjdGFuZ2xlKGNlbnRlciwgYmlnU2hhcGVCQm94KSxcclxuICAgICAgICAgIHJlc3VsdCA9IGlzQ2VudGVySW5zaWRlID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGUgaXMgbm90IGluc2lkZSB0aGUgYXJlYSBvZid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoID0gZnVuY3Rpb24gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogZnVuY3Rpb24gKGFjdHVhbCwgZXhwZWN0ZWQpIHtcclxuICAgICAgICB2YXIgYWN0dWFsQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYWN0dWFsKSxcclxuICAgICAgICAgIGV4cGVjdGVkQkJveCA9IGdlb21ldHJ5LmdldEJCb3goZXhwZWN0ZWQpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVQb3NpdGlvbiA9IGFjdHVhbEJCb3gueCA9PT0gZXhwZWN0ZWRCQm94LnggJiYgYWN0dWFsQkJveC55ID09PSBleHBlY3RlZEJCb3gueSxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lUG9zaXRpb24gPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZXMgZG9uYHQgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0hhdmVUaGVTYW1lU2l6ZVdpdGggPSBmdW5jdGlvbiAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCkge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZVNpemUgPSBhY3R1YWxCQm94LndpZHRoID09PSBleHBlY3RlZEJCb3gud2lkdGggJiYgYWN0dWFsQkJveC5oZWlnaHQgPT09IGV4cGVjdGVkQkJveC5oZWlnaHQsXHJcbiAgICAgICAgICByZXN1bHQgPSBoYXZlVGhlU2FtZVNpemUgPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZXMgZG9uYHQgaGF2ZSB0aGUgc2FtZSBzaXplJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGggPSBmdW5jdGlvbiAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCkge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZUFsaWdubWVudCA9IGFjdHVhbEJCb3gueSA9PT0gZXhwZWN0ZWRCQm94LnksXHJcbiAgICAgICAgICByZXN1bHQgPSBoYXZlVGhlU2FtZUFsaWdubWVudCA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIGhvcml6b250YWwgcG9zaXRpb24nfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9CZVZlcnRpY2FsbHlBbGlnbldpdGggPSBmdW5jdGlvbiAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCkge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZUFsaWdubWVudCA9IGFjdHVhbEJCb3gueCA9PT0gZXhwZWN0ZWRCQm94LngsXHJcbiAgICAgICAgICByZXN1bHQgPSBoYXZlVGhlU2FtZUFsaWdubWVudCA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIHZlcnRpY2FsIHBvc2l0aW9uJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLnRvQmVQYXJ0T2YgPSB0b0JlUGFydE9mO1xyXG4gIHRoaXMudG9CZUluc2lkZVRoZUFyZWFPZiA9IHRvQmVJbnNpZGVUaGVBcmVhT2Y7XHJcbiAgdGhpcy50b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoID0gdG9IYXZlVGhlU2FtZVBvc2l0aW9uV2l0aDtcclxuICB0aGlzLnRvSGF2ZVRoZVNhbWVTaXplV2l0aCA9IHRvSGF2ZVRoZVNhbWVTaXplV2l0aDtcclxuICB0aGlzLnRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGggPSB0b0JlSG9yaXpvbnRhbGx5QWxpZ25XaXRoO1xyXG4gIHRoaXMudG9CZVZlcnRpY2FsbHlBbGlnbldpdGggPSB0b0JlVmVydGljYWxseUFsaWduV2l0aDtcclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gR2VvbWV0cnkoKSB7XHJcblxyXG4gIHZhciB0aGF0ID0gdGhpcztcclxuXHJcblxyXG4gIHZhciBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUgPSAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBib3g6IHt4OiBOYU4sIHk6IE5hTiwgd2lkdGg6IE5hTiwgaGVpZ2h0OiBOYU59LFxyXG4gICAgICB0cmFuc2Zvcm1zOiBbW11dLFxyXG4gICAgICBzaGFwZXNJblBhdGg6IFtdLFxyXG4gICAgICBtb3ZlVG9Mb2NhdGlvbjoge3g6IE5hTiwgeTogTmFOfSxcclxuICAgICAgbGluZVdpZHRoczogWzFdXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIHBhdGhGaWxsU2hhcGVIYW5kbGVycyA9IHtcclxuICAgIHJlY3Q6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIHggPSBzaGFwZS54LFxyXG4gICAgICAgIHkgPSBzaGFwZS55LFxyXG4gICAgICAgIHdpZHRoID0gc2hhcGUud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0ID0gc2hhcGUuaGVpZ2h0LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IHNoYXBlLmN4LFxyXG4gICAgICAgIGN5ID0gc2hhcGUuY3ksXHJcbiAgICAgICAgcnggPSBzaGFwZS5yeCxcclxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiBjeCAtIHJ4LCB5OiBjeSAtIHJ5LCB3aWR0aDogMiAqIHJ4LCBoZWlnaHQ6IDIgKiByeX07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHBhdGhTdHJva2VTaGFwZUhhbmRsZXJzID0ge1xyXG4gICAgcmVjdDogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeCA9IHNoYXBlLngsXHJcbiAgICAgICAgeSA9IHNoYXBlLnksXHJcbiAgICAgICAgd2lkdGggPSBzaGFwZS53aWR0aCxcclxuICAgICAgICBoZWlnaHQgPSBzaGFwZS5oZWlnaHQsXHJcbiAgICAgICAgc2NhbGVkTGluZVdpZHRoID0gc3RhdGUubGluZVdpZHRoICE9PSAxID8gc3RhdGUubGluZVdpZHRoIDogMCxcclxuICAgICAgICB4U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgeVNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4IC0geFNjYWxlZExpbmVXaWR0aCAgLyAyLCB5OiB5IC0geVNjYWxlZExpbmVXaWR0aCAvIDIsIHdpZHRoOiB3aWR0aCArIHhTY2FsZWRMaW5lV2lkdGgsIGhlaWdodDogaGVpZ2h0ICsgeVNjYWxlZExpbmVXaWR0aH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyYzogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgY3ggPSBzaGFwZS5jeCxcclxuICAgICAgICBjeSA9IHNoYXBlLmN5LFxyXG4gICAgICAgIHJ4ID0gc2hhcGUucngsXHJcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIHhTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICB5U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IGN4IC0gcnggLSB4U2NhbGVkTGluZVdpZHRoIC8gMiwgeTogY3kgLSByeSAtIHlTY2FsZWRMaW5lV2lkdGggLyAyLCB3aWR0aDogMiAqIHJ4ICsgeFNjYWxlZExpbmVXaWR0aCwgaGVpZ2h0OiAyICogcnkgKyB5U2NhbGVkTGluZVdpZHRofTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgbGluZVRvOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciB4MSA9IHNoYXBlLngxLFxyXG4gICAgICAgIHkxID0gc2hhcGUueTEsXHJcbiAgICAgICAgeDIgPSBzaGFwZS54MixcclxuICAgICAgICB5MiA9IHNoYXBlLnkyLFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IGdldFNjYWxlZFdpZHRoT2ZMaW5lKHgxLCB5MSwgeDIsIHkyLCBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCwgc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksIHN0YXRlLmxpbmVXaWR0aCksXHJcbiAgICAgICAgcmVjdCA9IGdldFJlY3RBcm91bmRMaW5lKHgxLCB5MSwgeDIsIHkyLCBzY2FsZWRMaW5lV2lkdGggIT09IDEgPyBzY2FsZWRMaW5lV2lkdGggOiAwKSxcclxuICAgICAgICBuZXdCb3ggPSB7XHJcbiAgICAgICAgICB4OiBNYXRoLm1pbihyZWN0LngxLCByZWN0LngyLCByZWN0LngzLCByZWN0Lng0KSxcclxuICAgICAgICAgIHk6IE1hdGgubWluKHJlY3QueTEsIHJlY3QueTIsIHJlY3QueTMsIHJlY3QueTQpLFxyXG4gICAgICAgICAgd2lkdGg6IE1hdGgubWF4KHJlY3QueDEsIHJlY3QueDIsIHJlY3QueDMsIHJlY3QueDQpIC0gTWF0aC5taW4ocmVjdC54MSwgcmVjdC54MiwgcmVjdC54MywgcmVjdC54NCksXHJcbiAgICAgICAgICBoZWlnaHQ6IE1hdGgubWF4KHJlY3QueTEsIHJlY3QueTIsIHJlY3QueTMsIHJlY3QueTQpIC0gTWF0aC5taW4ocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NClcclxuICAgICAgICB9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBjYW52YXNDYWxsSGFuZGxlcnMgPSB7XHJcbiAgICBsaW5lV2lkdGg6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS5saW5lV2lkdGhzW3N0YXRlLmxpbmVXaWR0aHMubGVuZ3RoIC0gMV0gPSBjYWxsLnZhbDtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGZpbGxSZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc3Ryb2tlUmVjdDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICB3aWR0aCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgaGVpZ2h0ID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIHhTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICB5U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHggLSB4U2NhbGVkTGluZVdpZHRoIC8gMiwgeTogeSAtIHlTY2FsZWRMaW5lV2lkdGggLyAyLCB3aWR0aDogd2lkdGggKyB4U2NhbGVkTGluZVdpZHRoLCBoZWlnaHQ6IGhlaWdodCArIHlTY2FsZWRMaW5lV2lkdGh9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICByZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55O1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ3JlY3QnLCB4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmM6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgY3ggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIGN5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICByeCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgcnkgPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55O1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2FyYycsIGN4OiBjeCwgY3k6IGN5LCByeDogcngsIHJ5OiByeX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgbW92ZVRvOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHgxID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5MSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnk7XHJcbiAgICAgIHN0YXRlLm1vdmVUb0xvY2F0aW9uID0ge3g6IHgxLCB5OiB5MX07XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBsaW5lVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi54LFxyXG4gICAgICAgIHkxID0gc3RhdGUubW92ZVRvTG9jYXRpb24ueSxcclxuICAgICAgICB4MiA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeTIgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55O1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2xpbmVUbycsIHgxOiB4MSwgeTE6IHkxLCB4MjogeDIsIHkyOiB5Mn0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc2F2ZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLnRyYW5zZm9ybXMucHVzaChbXSk7XHJcbiAgICAgIHN0YXRlLmxpbmVXaWR0aHMucHVzaChsYXN0RWxlbWVudChzdGF0ZS5saW5lV2lkdGhzKSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICByZXN0b3JlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUudHJhbnNmb3Jtcy5wb3AoKTtcclxuICAgICAgc3RhdGUubGluZVdpZHRocy5wb3AoKTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHRyYW5zbGF0ZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIGxhc3RFbGVtZW50KHN0YXRlLnRyYW5zZm9ybXMpXHJcbiAgICAgICAgLnB1c2goe3RyYW5zbGF0ZToge3g6IGNhbGwuYXJndW1lbnRzWzBdLCB5OiBjYWxsLmFyZ3VtZW50c1sxXX19KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHNjYWxlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgbGFzdEVsZW1lbnQoc3RhdGUudHJhbnNmb3JtcylcclxuICAgICAgICAucHVzaCh7c2NhbGU6IHt4OiBjYWxsLmFyZ3VtZW50c1swXSwgeTogY2FsbC5hcmd1bWVudHNbMV19fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBiZWdpblBhdGg6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGggPSBbXTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGZpbGw6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICByZXR1cm4gc3RhdGUuc2hhcGVzSW5QYXRoLnJlZHVjZSgoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIgPSBnZXRQYXRoRmlsbFNoYXBlSGFuZGxlcihzaGFwZSk7XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZXIoc3RhdGUsIHNoYXBlKTtcclxuICAgICAgfSwgc3RhdGUpO1xyXG4gICAgfSxcclxuICAgIHN0cm9rZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHJldHVybiBzdGF0ZS5zaGFwZXNJblBhdGgucmVkdWNlKChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgICB2YXIgaGFuZGxlciA9IGdldFBhdGhTdHJva2VTaGFwZUhhbmRsZXIoc2hhcGUpO1xyXG4gICAgICAgIHJldHVybiBoYW5kbGVyKHN0YXRlLCBzaGFwZSk7XHJcbiAgICAgIH0sIHN0YXRlKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBudWxsQ2FudmFzQ2FsbEhhbmRsZXIgPSAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9LFxyXG5cclxuICBnZXRDYW52YXNDYWxsSGFuZGxlciA9IChjYWxsKSA9PiB7XHJcbiAgICByZXR1cm4gY2FudmFzQ2FsbEhhbmRsZXJzW2NhbGwubWV0aG9kXSB8fCBjYW52YXNDYWxsSGFuZGxlcnNbY2FsbC5hdHRyXSB8fCBudWxsQ2FudmFzQ2FsbEhhbmRsZXI7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aEZpbGxTaGFwZUhhbmRsZXIgPSAoc2hhcGUpID0+IHtcclxuICAgIHJldHVybiBwYXRoRmlsbFNoYXBlSGFuZGxlcnNbc2hhcGUudHlwZV07XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aFN0cm9rZVNoYXBlSGFuZGxlciA9IChzaGFwZSkgPT4ge1xyXG4gICAgcmV0dXJuIHBhdGhTdHJva2VTaGFwZUhhbmRsZXJzW3NoYXBlLnR5cGVdO1xyXG4gIH0sXHJcblxyXG4gIHByZUNhbnZhc0NhbGxIYW5kbGVyID0gKHN0YXRlKSA9PiB7XHJcbiAgICBzdGF0ZS50cmFuc2Zvcm0gPSB0b3RhbFRyYW5zZm9ybShmbGF0dGVuKHN0YXRlLnRyYW5zZm9ybXMpKTtcclxuICAgIHN0YXRlLmxpbmVXaWR0aCA9IGxhc3RFbGVtZW50KHN0YXRlLmxpbmVXaWR0aHMpO1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH0sXHJcblxyXG4gIGdldEJCb3ggPSAoc2hhcGUpID0+IHtcclxuICAgIHZhciBzdGF0ZSA9IGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSgpO1xyXG4gICAgc3RhdGUgPSBzaGFwZS5yZWR1Y2UoKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciBoYW5kbGVyID0gZ2V0Q2FudmFzQ2FsbEhhbmRsZXIoY2FsbCk7XHJcbiAgICAgIHJldHVybiBoYW5kbGVyKHByZUNhbnZhc0NhbGxIYW5kbGVyKHN0YXRlKSwgY2FsbCk7XHJcbiAgICB9LCBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUoKSk7XHJcbiAgICByZXR1cm4gc3RhdGUuYm94O1xyXG4gIH0sXHJcbiAgXHJcbiAgZmxhdHRlbiA9IGZ1bmN0aW9uKGFycmF5KSB7XHJcbiAgICByZXR1cm4gYXJyYXlcclxuICAgICAgLnJlZHVjZShmdW5jdGlvbihwcmV2aW91c0FycmF5LCBjdXJyZW50QXJyYXkpIHtcclxuICAgICAgICByZXR1cm4gcHJldmlvdXNBcnJheS5jb25jYXQoY3VycmVudEFycmF5KTtcclxuICAgICAgfSwgW10pO1xyXG4gIH0sXHJcbiAgICAgIFxyXG4gIGxhc3RFbGVtZW50ID0gZnVuY3Rpb24oYXJyYXkpIHtcclxuICAgIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcclxuICB9LFxyXG5cclxuICBmaXJzdFRydXRoeU9yWmVybyA9IGZ1bmN0aW9uKHZhbDEsIHZhbDIpe1xyXG4gICAgaWYgKHZhbDEgfHwgdmFsMSA9PT0gMCkge1xyXG4gICAgICByZXR1cm4gdmFsMTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWwyO1xyXG4gIH0sXHJcblxyXG4gIHVuaW9uID0gZnVuY3Rpb24oYm94MSwgYm94Mikge1xyXG4gICAgYm94MSA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gxLndpZHRoLCBib3gyLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLmhlaWdodCwgYm94Mi5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgYm94MiA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94Mi54LCBib3gxLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLnksIGJveDEueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gyLndpZHRoLCBib3gxLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLmhlaWdodCwgYm94MS5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgeDogTWF0aC5taW4oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBNYXRoLm1pbihib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBNYXRoLm1heChib3gxLndpZHRoLCBib3gyLndpZHRoLCBib3gxLnggPCBib3gyLnhcclxuICAgICAgICA/IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDIueCAtIChib3gxLnggKyBib3gxLndpZHRoKSlcclxuICAgICAgICA6IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDEueCAtIChib3gyLnggKyBib3gyLndpZHRoKSkpLFxyXG4gICAgICBoZWlnaHQ6IE1hdGgubWF4KGJveDEuaGVpZ2h0LCBib3gyLmhlaWdodCwgYm94MS55IDwgYm94Mi55XHJcbiAgICAgICAgPyBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDIueSAtIChib3gxLnkgKyBib3gxLmhlaWdodCkpXHJcbiAgICAgICAgOiBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDEueSAtIChib3gyLnkgKyBib3gyLmhlaWdodCkpKVxyXG4gICAgfTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSxcclxuXHJcbiAgdG90YWxUcmFuc2Zvcm0gPSBmdW5jdGlvbih0cmFuc2Zvcm1zKSB7XHJcbiAgICByZXR1cm4gdHJhbnNmb3Jtc1xyXG4gICAgICAubWFwKGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRyYW5zbGF0ZTogdmFsdWUudHJhbnNsYXRlIHx8IHt4OiAwLCB5OiAwfSxcclxuICAgICAgICAgIHNjYWxlOiB2YWx1ZS5zY2FsZSB8fCB7eDogMSwgeTogMX1cclxuICAgICAgICB9O1xyXG4gICAgICB9KVxyXG4gICAgICAucmVkdWNlKGZ1bmN0aW9uKHByZXZpb3VzVmFsdWUsIGN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0cmFuc2xhdGU6IHtcclxuICAgICAgICAgICAgeDogcHJldmlvdXNWYWx1ZS50cmFuc2xhdGUueCArIGN1cnJlbnRWYWx1ZS50cmFuc2xhdGUueCAqIHByZXZpb3VzVmFsdWUuc2NhbGUueCxcclxuICAgICAgICAgICAgeTogcHJldmlvdXNWYWx1ZS50cmFuc2xhdGUueSArIGN1cnJlbnRWYWx1ZS50cmFuc2xhdGUueSAqIHByZXZpb3VzVmFsdWUuc2NhbGUueVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNjYWxlOiB7XHJcbiAgICAgICAgICAgIHg6IHByZXZpb3VzVmFsdWUuc2NhbGUueCAqIGN1cnJlbnRWYWx1ZS5zY2FsZS54LFxyXG4gICAgICAgICAgICB5OiBwcmV2aW91c1ZhbHVlLnNjYWxlLnkgKiBjdXJyZW50VmFsdWUuc2NhbGUueVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sIHt0cmFuc2xhdGU6IHt4OiAwLCB5OiAwfSwgc2NhbGU6IHt4OiAxLCB5OiAxfX0pO1xyXG4gIH0sXHJcblxyXG4gIGdldFJlY3RBcm91bmRMaW5lID0gZnVuY3Rpb24oeDEsIHkxLCB4MiwgeTIsIHdpZHRoKSB7XHJcbiAgICB2YXIgcmVjdDtcclxuICAgIGlmICh4MSA9PT0geTEgJiYgeDEgPT09IHgyICYmIHgxID09PSB5Mikge1xyXG4gICAgICByZWN0ID0ge1xyXG4gICAgICAgIHgxOiB4MSwgeTE6IHgxLCAgeDI6IHgxLCB5MjogeDEsXHJcbiAgICAgICAgeDQ6IHgxLCB5NDogeDEsICB4MzogeDEsIHkzOiB4MVxyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVjdCA9IGdldFJlY3RBcm91bmRMb25nTGluZSh4MSwgeTEsIHgyLCB5Miwgd2lkdGgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlY3Q7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UmVjdEFyb3VuZExvbmdMaW5lID0gZnVuY3Rpb24oeDEsIHkxLCB4MiwgeTIsIHdpZHRoKSB7XHJcbiAgICAvLyAgciA9IHRoZSByYWRpdXMgb3IgdGhlIGdpdmVuIGRpc3RhbmNlIGZyb20gYSBnaXZlbiBwb2ludCB0byB0aGUgbmVhcmVzdCBjb3JuZXJzIG9mIHRoZSByZWN0XHJcbiAgICAvLyAgYSA9IHRoZSBhbmdsZSBiZXR3ZWVuIHRoZSBsaW5lIGFuZCB0aGUgaG9yaXpvbnRhbCBheGlzXHJcbiAgICAvLyAgYjEsIGIyID0gdGhlIGFuZ2xlIGJldHdlZW4gaGFsZiB0aGUgaGlnaHQgb2YgdGhlIHJlY3RhbmdsZSBhbmQgdGhlIGhvcml6b250YWwgYXhpc1xyXG4gICAgLy9cclxuICAgIC8vICBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUgdGhlIGdpdmVuIGxpbmUgaXMgaG9yaXpvbnRhbCwgc28gYSA9IDAuXHJcbiAgICAvLyAgVGhlIGdpdmVuIGxpbmUgaXMgYmV0d2VlbiB0aGUgdHdvIEAgc3ltYm9scy5cclxuICAgIC8vICBUaGUgKyBzeW1ib2xzIGFyZSB0aGUgY29ybmVycyBvZiByZWN0YW5nbGUgdG8gYmUgZGV0ZXJtaW5lZC5cclxuICAgIC8vICBJbiBvcmRlciB0byBmaW5kIHRoZSBiMSBhbmQgYjIgYW5nbGVzIHdlIGhhdmUgdG8gYWRkIFBJLzIgYW5kIHJlc3BlY3Rpdmx5IHN1YnRyYWN0IFBJLzIuXHJcbiAgICAvLyAgYjEgaXMgdmVydGljYWwgYW5kIHBvaW50aW5nIHVwd29yZHMgYW5kIGIyIGlzIGFsc28gdmVydGljYWwgYnV0IHBvaW50aW5nIGRvd253b3Jkcy5cclxuICAgIC8vICBFYWNoIGNvcm5lciBpcyByIG9yIHdpZHRoIC8gMiBmYXIgYXdheSBmcm9tIGl0cyBjb3Jlc3BvbmRlbnQgbGluZSBlbmRpbmcuXHJcbiAgICAvLyAgU28gd2Uga25vdyB0aGUgZGlzdGFuY2UgKHIpLCB0aGUgc3RhcnRpbmcgcG9pbnRzICh4MSwgeTEpIGFuZCAoeDIsIHkyKSBhbmQgdGhlIChiMSwgYjIpIGRpcmVjdGlvbnMuXHJcbiAgICAvL1xyXG4gICAgLy8gICh4MSx5MSkgICAgICAgICAgICAgICAgICAgICh4Mix5MilcclxuICAgIC8vICAgICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcclxuICAgIC8vICAgICAgXiAgICAgICAgICAgICAgICAgICAgICAgIF5cclxuICAgIC8vICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICAgIC8vICAgICAgfCBiMSAgICAgICAgICAgICAgICAgICAgIHwgYjFcclxuICAgIC8vICAgICAgQD09PT09PT09PT09PT09PT09PT09PT09PUBcclxuICAgIC8vICAgICAgfCBiMiAgICAgICAgICAgICAgICAgICAgIHwgYjJcclxuICAgIC8vICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICAgIC8vICAgICAgdiAgICAgICAgICAgICAgICAgICAgICAgIHZcclxuICAgIC8vICAgICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcclxuICAgIC8vICAoeDQseTQpICAgICAgICAgICAgICAgICAgICAoeDMseTMpXHJcbiAgICAvL1xyXG5cclxuICAgIHZhciByID0gd2lkdGggLyAyLFxyXG4gICAgICBhID0gTWF0aC5hdGFuKCh5MiAtIHkxKSAvICh4MiAtIHgxKSksXHJcbiAgICAgIGIxID0gYSArIE1hdGguUEkvMixcclxuICAgICAgYjIgPSBhIC0gTWF0aC5QSS8yLFxyXG4gICAgICByeDEgPSByICogTWF0aC5jb3MoYjEpICsgeDEsXHJcbiAgICAgIHJ5MSA9IHIgKiBNYXRoLnNpbihiMSkgKyB5MSxcclxuICAgICAgcngyID0gciAqIE1hdGguY29zKGIxKSArIHgyLFxyXG4gICAgICByeTIgPSByICogTWF0aC5zaW4oYjEpICsgeTIsXHJcbiAgICAgIHJ4MyA9IHIgKiBNYXRoLmNvcyhiMikgKyB4MixcclxuICAgICAgcnkzID0gciAqIE1hdGguc2luKGIyKSArIHkyLFxyXG4gICAgICByeDQgPSByICogTWF0aC5jb3MoYjIpICsgeDEsXHJcbiAgICAgIHJ5NCA9IHIgKiBNYXRoLnNpbihiMikgKyB5MTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHgxOiByeDEsIHkxOiByeTEsICB4MjogcngyLCB5MjogcnkyLFxyXG4gICAgICB4NDogcng0LCB5NDogcnk0LCAgeDM6IHJ4MywgeTM6IHJ5M1xyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBnZXRTY2FsZWRXaWR0aE9mTGluZSA9IGZ1bmN0aW9uKHgxLCB5MSwgeDIsIHkyLCBzeCwgc3ksIHdpZHRoKSB7XHJcbiAgICAvLyAgVGhlIG9yaWdpbmFsIHBvaW50cyBhcmUgbm90IG1vdmVkLiBPbmx5IHRoZSB3aWR0aCB3aWxsIGJlIHNjYWxlZC5cclxuICAgIC8vICBUaGUgd2lkdGggb2YgYW4gaG9yaXpvbnRhbCBsaW5lIHdpbGwgYmUgc2NhbGVkIHdpdGggdGhlIHN5IHJhdGlvIG9ubHkuXHJcbiAgICAvLyAgVGhlIHdpZHRoIG9mIGEgdmVydGl2YWwgbGluZSB3aWxsIGJlIHNjYWxlZCB3aXRoIHRoZSBzeCByYXRpbyBvbmx5LlxyXG4gICAgLy8gIFRoZSB3aWR0aCBvZiBhbiBvYmxpcXVlIGxpbmUgd2lsbCBiZSBzY2FsZWQgd2l0aCBib3RoIHRoZSBzeCBhbmQgc3lcclxuICAgIC8vYnV0IHByb3BvcnRpb25hbCB3aXRoIHRoZSBhbmdsZSBiZXR3ZWVuIHRoZSBsaW5lIGFuZCB0aGUgeCBhbmQgeSBheGVzLlxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cXFxyXG4gICAgLy8gICAgICAgICAgICAgICAuXFwgICh4Mix5MikgICAgICAgICAgICAgICAgICAgICAgICAgLi4uXFwgICh4Mix5MilcclxuICAgIC8vICAgICAgICAgICAgICAuLi5AICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4uLkBcclxuICAgIC8vICAgICAgICAgICAgIC4uLi8uXFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4uLi8uXFxcclxuICAgIC8vICAgICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICAgc3ggICAgICAgICAgICAgLi4uLi4vLi4uXFxcclxuICAgIC8vICAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgKy0tLT4gICAgICAgICAgICAuLi4uLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgLi4uLi4vLi4uLi5cclxuICAgIC8vICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgIFxcLi4uLy4uLi4uXHJcbiAgICAvLyAgICAgICAgIFxcLi8uLi4gICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgIFxcLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAgQC4uLiAgICAgICAgICAgICBzeSB2ICAgICAgICAgICAgICAgICBALi4uLi5cclxuICAgIC8vICAoeDEseTEpICBcXC4gICAgICAgICAgICAgICAgICAgICAgICAgICAoeDEseTEpICBcXC4uLlxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcLlxyXG4gICAgLy9cclxuICAgIHZhciBhID0gTWF0aC5hdGFuKCh5MiAtIHkxKSAvICh4MiAtIHgxKSksXHJcbiAgICAgIHNpbmEgPSBNYXRoLnNpbihhKSwgY29zYSA9IE1hdGguY29zKGEpLFxyXG4gICAgICBzY2FsZWRXaWR0aCA9IHdpZHRoICogTWF0aC5zcXJ0KHN4KnN4ICogc2luYSpzaW5hICsgc3kqc3kgKiBjb3NhKmNvc2EpO1xyXG4gICAgcmV0dXJuIHNjYWxlZFdpZHRoO1xyXG4gIH0sXHJcblxyXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjc1MjcyNS9maW5kaW5nLXdoZXRoZXItYS1wb2ludC1saWVzLWluc2lkZS1hLXJlY3RhbmdsZS1vci1ub3RcclxuICBpc1BvaW50SW5zaWRlUmVjdGFuZ2xlID0gZnVuY3Rpb24ocG9pbnQsIHJlY3RhbmdsZSkge1xyXG4gICAgdmFyIHNlZ21lbnRzID0gW3tcclxuICAgICAgeDE6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MTogcmVjdGFuZ2xlLnksXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55IH0sIHtcclxuICAgICAgeDE6IHJlY3RhbmdsZS54ICsgcmVjdGFuZ2xlLndpZHRoLFxyXG4gICAgICB5MTogcmVjdGFuZ2xlLnksXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodH0sIHtcclxuICAgICAgeDE6IHJlY3RhbmdsZS54ICsgcmVjdGFuZ2xlLndpZHRoLFxyXG4gICAgICB5MTogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHR9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodCxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnlcclxuICAgIH1dO1xyXG5cclxuICAgIHZhciBpc0luc2lkZSA9IHNlZ21lbnRzLm1hcChmdW5jdGlvbihzZWdtZW50KSB7XHJcbiAgICAgIHZhciBBID0gLShzZWdtZW50LnkyIC0gc2VnbWVudC55MSksXHJcbiAgICAgICAgQiA9IHNlZ21lbnQueDIgLSBzZWdtZW50LngxLFxyXG4gICAgICAgIEMgPSAtKEEgKiBzZWdtZW50LngxICsgQiAqIHNlZ21lbnQueTEpLFxyXG4gICAgICAgIEQgPSBBICogcG9pbnQueCArIEIgKiBwb2ludC55ICsgQztcclxuICAgICAgICByZXR1cm4gRDtcclxuICAgIH0pLmV2ZXJ5KGZ1bmN0aW9uKEQpIHtcclxuICAgICAgcmV0dXJuIEQgPiAwO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGlzSW5zaWRlO1xyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLmdldEJCb3ggPSBnZXRCQm94O1xyXG4gIHRoaXMudW5pb24gPSB1bmlvbjtcclxuICB0aGlzLnRvdGFsVHJhbnNmb3JtID0gdG90YWxUcmFuc2Zvcm07XHJcbiAgdGhpcy5nZXRSZWN0QXJvdW5kTGluZSA9IGdldFJlY3RBcm91bmRMaW5lO1xyXG4gIHRoaXMuaXNQb2ludEluc2lkZVJlY3RhbmdsZSA9IGlzUG9pbnRJbnNpZGVSZWN0YW5nbGU7XHJcblxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJ5LmpzJ1xyXG5pbXBvcnQgeyBDdXN0b21NYXRjaGVycyB9IGZyb20gJy4vY3VzdG9tTWF0Y2hlcnMuanMnXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFJhYmJpdChnZW9tZXRyeSwgbWF0Y2hlcnMpIHtcclxuXHJcbiAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgZ2VvbWV0cnkgPSBnZW9tZXRyeSB8fCBuZXcgR2VvbWV0cnkoKSxcclxuICAgIG1hdGNoZXJzID0gbWF0Y2hlcnMgfHwgbmV3IEN1c3RvbU1hdGNoZXJzKCk7XHJcblxyXG5cclxuICB2YXIgZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzID0gZnVuY3Rpb24oc2hhcGUsIHdoZXJlKSB7XHJcbiAgICB2YXIgZm91bmQgPSBbXSwgaW5kZXggPSAwO1xyXG4gICAgZG8ge1xyXG4gICAgICBpbmRleCA9IHRoYXQuZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMoc2hhcGUsIHdoZXJlLCBpbmRleCk7XHJcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICBmb3VuZC5wdXNoKHdoZXJlLnNsaWNlKGluZGV4LCBpbmRleCArIHNoYXBlLmxlbmd0aCkpO1xyXG4gICAgICAgIGluZGV4ICs9IHNoYXBlLmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgfSB3aGlsZSAoaW5kZXggIT09IC0xICYmIGluZGV4IDwgd2hlcmUubGVuZ3RoKTtcclxuICAgIHJldHVybiBmb3VuZDtcclxuICB9LFxyXG5cclxuICBmaW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyA9IGZ1bmN0aW9uKHNoYXBlLCB3aGVyZSwgc3RhcnRJbmRleCkge1xyXG4gICAgc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXggfHwgMDtcclxuICAgIHZhciBtYXRjaCA9IGZhbHNlLCBpbmRleCA9IC0xO1xyXG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXg7IGkgPD0gd2hlcmUubGVuZ3RoIC0gc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbWF0Y2ggPSB0cnVlO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNoYXBlLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgaWYgKHdoZXJlW2kgKyBqXS5tZXRob2QgIT09IHNoYXBlW2pdLm1ldGhvZCkge1xyXG4gICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAobWF0Y2ggPT09IHRydWUpIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpbmRleDtcclxuICB9LFxyXG5cclxuICByZW1vdmVTaGFwZXMgPSBmdW5jdGlvbihzaGFwZXMsIGZyb20pIHtcclxuICAgIHZhciBjb3B5ID0gZnJvbS5zbGljZSgwLCBmcm9tLmxlbmd0aCk7XHJcbiAgICBzaGFwZXMuZm9yRWFjaChmdW5jdGlvbihzaGFwZSkge1xyXG4gICAgICB2YXIgaW5kZXggPSAtMTtcclxuICAgICAgZG8ge1xyXG4gICAgICAgIGluZGV4ID0gdGhhdC5maW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyhzaGFwZSwgY29weSk7XHJcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgY29weS5zcGxpY2UoaW5kZXgsIHNoYXBlLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IHdoaWxlIChpbmRleCAhPT0gLTEpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY29weTtcclxuICB9O1xyXG5cclxuXHJcbiAgdGhpcy5nZXRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveDtcclxuICB0aGlzLmN1c3RvbU1hdGNoZXJzID0gbWF0Y2hlcnM7XHJcbiAgdGhpcy5maW5kQWxsU2hhcGVzSWdub3JpbmdBcmd1bWVudHMgPSBmaW5kQWxsU2hhcGVzSWdub3JpbmdBcmd1bWVudHM7XHJcbiAgdGhpcy5maW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyA9IGZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzO1xyXG4gIHRoaXMucmVtb3ZlU2hhcGVzID0gcmVtb3ZlU2hhcGVzO1xyXG5cclxufVxyXG4iXX0=
