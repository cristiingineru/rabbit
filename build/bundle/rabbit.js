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

  var that = this,
      EPSILON = Number.EPSILON || 2.220446049250313e-16,
      PI = Math.PI,
      sin = Math.sin,
      cos = Math.cos;

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
          r = shape.r,
          sx = shape.sx,
          sy = shape.sy,
          sAngle = shape.sAngle,
          eAngle = shape.eAngle,
          counterclockwise = shape.counterclockwise,
          arcPoints = relevantArcPoints(cx, cy, r, sAngle, eAngle, counterclockwise),
          arcAngles = arcPoints.map(function (p) {
        return p.a;
      }),
          scaledArcPoints = arcAngles.map(function (a) {
        var sr = scaledRadius(r, sx, sy, a);
        return { x: cx + sr * cos(a), y: cy + sr * sin(a) };
      }),
          newBox = boxPoints(scaledArcPoints);
      if (!isNaN(cx) && !isNaN(cy) && arcPoints.length > 1) {
        state.box = union(state.box, newBox);
      }
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
          r = shape.r,
          sx = shape.sx,
          sy = shape.sy,
          sAngle = shape.sAngle,
          eAngle = shape.eAngle,
          counterclockwise = shape.counterclockwise,
          arcPoints = relevantArcPoints(cx, cy, r, sAngle, eAngle, counterclockwise),
          arcAngles = arcPoints.map(function (p) {
        return p.a;
      }),
          scaledArcPoints = arcAngles.map(function (a) {
        var sr = scaledRadius(r, sx, sy, a);
        return { x: cx + sr * cos(a), y: cy + sr * sin(a) };
      }),
          newBox = boxPoints(scaledArcPoints);
      if (!isNaN(cx) && !isNaN(cy) && arcPoints.length > 1) {
        state.box = union(state.box, newBox);
      }
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
          r = call.arguments[2],
          sx = state.transform.scale.x,
          sy = state.transform.scale.y,
          sAngle = call.arguments[3],
          eAngle = call.arguments[4],
          counterclockwise = call.arguments[5] || false;
      state.shapesInPath.push({ type: 'arc', cx: cx, cy: cy, r: r, sx: sx, sy: sy, sAngle: sAngle, eAngle: eAngle, counterclockwise: counterclockwise });
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
    arcTo: function arcTo(state, call) {
      var x0 = state.moveToLocation.x,
          y0 = state.moveToLocation.y,
          x1 = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
          y1 = call.arguments[1] * state.transform.scale.y + state.transform.translate.y,
          x2 = call.arguments[2] * state.transform.scale.x + state.transform.translate.x,
          y2 = call.arguments[3] * state.transform.scale.y + state.transform.translate.y,
          r = call.arguments[4],
          sx = state.transform.scale.x,
          sy = state.transform.scale.y,
          decomposition = decomposeArcTo(x0, y0, x1, y1, x2, y2, r, sx, sy);
      if (decomposition.line) {
        state.shapesInPath.push({ type: 'lineTo', x1: decomposition.line.x1, y1: decomposition.line.y1, x2: decomposition.line.x2, y2: decomposition.line.y2 });
      }
      if (decomposition.arc) {
        state.shapesInPath.push({ type: 'arc', cx: decomposition.arc.x, cy: decomposition.arc.y, r: r, sx: sx, sy: sy, sAngle: decomposition.arc.sAngle, eAngle: decomposition.arc.eAngle, counterclockwise: decomposition.arc.counterclockwise });
      }
      state.moveToLocation = { x: decomposition.point.x, y: decomposition.point.y };
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
      for (var i = 0; i < state.shapesInPath.length; i++) {
        var shape = state.shapesInPath[i],
            handler = getPathStrokeShapeHandler(shape);
        state = handler(state, shape);
      }
      return state;
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
      boxPoints = function boxPoints(points) {
    var xes = points.map(function (p) {
      return p.x;
    }),
        yes = points.map(function (p) {
      return p.y;
    }),
        minX = Math.min.apply(null, xes),
        maxX = Math.max.apply(null, xes),
        minY = Math.min.apply(null, yes),
        maxY = Math.max.apply(null, yes),
        box = { x: NaN, y: NaN, width: NaN, height: NaN };
    if (minX !== +Infinity && maxX !== -Infinity && minY !== +Infinity && maxY !== -Infinity) {
      box = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    }
    return box;
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
      getParallelsAroundSegment = function getParallelsAroundSegment(x1, y1, x2, y2, distance) {
    var rect = getRectAroundLongLine(x1, y1, x2, y2, 2 * distance);
    return [{ x1: rect.x1, y1: rect.y1, x2: rect.x2, y2: rect.y2 }, { x1: rect.x4, y1: rect.y4, x2: rect.x3, y2: rect.y3 }];
  },
      getIntersectionOfTwoLines = function getIntersectionOfTwoLines(l1, l2) {
    var a1 = l1.y2 - l1.y1,
        b1 = l1.x1 - l1.x2,
        c1 = l1.x2 * l1.y1 - l1.x1 * l1.y2,
        a2 = l2.y2 - l2.y1,
        b2 = l2.x1 - l2.x2,
        c2 = l2.x2 * l2.y1 - l2.x1 * l2.y2,
        x = (c2 * b1 - c1 * b2) / (a1 * b2 - a2 * b1),
        y = l2.y1 === l2.y2 ? l2.y1 : (-c1 - a1 * x) / b1;
    return { x: x, y: y };
  },
      getDistanceBetweenTwoPoints = function getDistanceBetweenTwoPoints(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  },
      getAngleBetweenThreePoints = function getAngleBetweenThreePoints(x1, y1, x2, y2, x3, y3) {
    var a = getDistanceBetweenTwoPoints(x1, y1, x2, y2),
        b = getDistanceBetweenTwoPoints(x2, y2, x3, y3),
        c = getDistanceBetweenTwoPoints(x3, y3, x1, y1),
        cosC = (a * a + b * b - c * c) / (2 * a * b),
        C = Math.acos(cosC);
    return C;
  },
      permuteLines = function permuteLines(alphaLines, betaLines) {
    var permutations = [];
    alphaLines.forEach(function (alphaLine) {
      betaLines.forEach(function (betaLine) {
        permutations.push({ alpha: alphaLine, beta: betaLine });
      });
    });
    return permutations;
  },
      almostEqual = function almostEqual(a, b) {
    // gross approximation to cover the flot and trigonometric precision
    return a === b || Math.abs(a - b) < 20 * EPSILON;
  },
      isCenterInBetween = function isCenterInBetween(cx, cy, x0, y0, x1, y1, x2, y2) {
    var a = getAngleBetweenThreePoints(x2, y2, x1, y1, x0, y0),
        a1 = getAngleBetweenThreePoints(cx, cy, x1, y1, x0, y0),
        a2 = getAngleBetweenThreePoints(cx, cy, x1, y1, x2, y2);
    return almostEqual(a, a1 + a2) && a1 + a2 <= Math.PI;
  },
      getTheCenterOfTheCorner = function getTheCenterOfTheCorner(x0, y0, x1, y1, x2, y2, distance, sx, sy) {
    //
    //                                    d  d
    //                                  '  /  '
    //                                 '  /  '
    //   alpha line 0    -------------'--/--'---------
    //                               '  /  '             d
    //     given line    ===P==========P==============
    //                             '  /  '               d
    //   alpha line 1    ---------C--/--'-------------
    //                           '  /  '
    //                          '  /  '
    //                         '  P  '
    //                        '  /  '
    //
    //     beta lines 0 & 1 with one of the given line inbetween
    //
    //
    //  P = the given P0, P1, P2 points
    //
    //  d = the given distance / radius of the circle
    //
    //  C = the center of the circle/corner to be determined

    var d1 = getScaledWidthOfLine(x0, y0, x1, y1, sx, sy, distance),
        d2 = getScaledWidthOfLine(x1, y1, x2, y2, sx, sy, distance),
        alphaLines = getParallelsAroundSegment(x0, y0, x1, y1, d1),
        betaLines = getParallelsAroundSegment(x1, y1, x2, y2, d2),
        permutations = permuteLines(alphaLines, betaLines),
        intersections = permutations.map(function (p) {
      return getIntersectionOfTwoLines(p.alpha, p.beta);
    }),
        center = intersections.filter(function (i) {
      return isCenterInBetween(i.x, i.y, x0, y0, x1, y1, x2, y2);
    })[0];

    return center || { x: NaN, y: NaN };
  },
      getTheFootOfThePerpendicular = function getTheFootOfThePerpendicular(x1, y1, x2, y2, cx, cy) {
    var m = (y2 - y1) / (x2 - x1),
        cm = -1 / m,
        C = y1 * (x2 - x1) - x1 * (y2 - y1),
        x = (C - (x2 - x1) * (cy - cm * cx)) / (cm * (x2 - x1) + y1 - y2),
        y = cm * (x - cx) + cy;
    return m === 0 // horizontal
    ? { x: cx, y: y1 } : m === Infinity // vertical
    ? { x: x1, y: cy } : { x: x, y: y };
  },
      xyToArcAngle = function xyToArcAngle(cx, cy, x, y) {
    var horizontalX = cx + 1,
        horizontalY = cy,
        a = Math.abs(getAngleBetweenThreePoints(x, y, cx, cy, horizontalX, horizontalY));
    if (y < cy) {
      //third & forth quadrants
      a = Math.PI + Math.PI - a;
    }
    return a;
  },
      scaledRadius = function scaledRadius(r, sx, sy, a) {
    var na = a % (2 * PI); //normalized angle
    if (sx === sy) {
      return r * sx;
    } else if (almostEqual(na, 0) || almostEqual(na, PI)) {
      return r * sx;
    } else if (almostEqual(na, PI / 2) || almostEqual(na, 3 * PI / 2)) {
      return r * sy;
    } else if (na < 1 * PI / 2) {
      var aa = na; //adjusted angle
      return r * (sx * (PI / 2 - aa) / (PI / 2) + sy * aa / (PI / 2));
    } else if (na < 2 * PI / 2) {
      var aa = na - 1 * PI / 2; //adjusted angle
      return r * (sx * aa / (PI / 2) + sy * (PI / 2 - aa) / (PI / 2));
    } else if (na < 3 * PI / 2) {
      var aa = na - 2 * PI / 2; //adjusted angle
      return r * (sx * (PI / 2 - aa) / (PI / 2) + sy * aa / (PI / 2));
    } else if (na < 4 * PI / 2) {
      var aa = na - 3 * PI / 2; //adjusted angle
      return r * (sx * aa / (PI / 2) + sy * (PI / 2 - aa) / (PI / 2));
    }
  },
      collinear = function collinear(x0, y0, x1, y1, x2, y2) {
    var m1 = (y1 - y0) / (x1 - x0),
        m2 = (y2 - y1) / (x2 - x1);
    return almostEqual(m1, m2);
  },
      decomposeArcTo = function decomposeArcTo(x0, y0, x1, y1, x2, y2, r, sx, sy) {
    var decomposition = {
      point: { x: x1, y: y1 }
    };
    if (collinear(x0, y0, x1, y1, x2, y2)) {
      decomposition.line = { x1: x0, y1: y0, x2: x1, y2: y1 };
    } else if (!isNaN(x0) && !isNaN(y0)) {
      var center = getTheCenterOfTheCorner(x0, y0, x1, y1, x2, y2, r, sx, sy),
          foot1 = getTheFootOfThePerpendicular(x0, y0, x1, y1, center.x, center.y),
          foot2 = getTheFootOfThePerpendicular(x1, y1, x2, y2, center.x, center.y),
          angleFoot1 = xyToArcAngle(center.x, center.y, foot1.x, foot1.y),
          angleFoot2 = xyToArcAngle(center.x, center.y, foot2.x, foot2.y),
          sAngle = Math.abs(angleFoot2 - angleFoot1) < Math.PI ? angleFoot2 : angleFoot1,
          eAngle = Math.abs(angleFoot2 - angleFoot1) < Math.PI ? angleFoot1 : angleFoot2;
      if (sAngle > eAngle) {
        var temp = sAngle;
        sAngle = eAngle;
        eAngle = temp + 2 * PI;
      }
      if (!isNaN(center.x) && !isNaN(center.y)) {
        if (!almostEqual(getDistanceBetweenTwoPoints(x0, y0, foot1.x, foot1.y), 0)) {
          decomposition.line = { x1: x0, y1: y0, x2: foot1.x, y2: foot1.y };
        }
        decomposition.arc = { x: center.x, y: center.y, r: r, sAngle: sAngle, eAngle: eAngle, counterclockwise: false };
        decomposition.point = { x: foot2.x, y: foot2.y };
      }
    }
    return decomposition;
  },
      relevantArcPoints = function relevantArcPoints(cx, cy, r, sAngle, eAngle, counterclockwise) {
    var points = [],
        relevantPoints = [];
    points.push({ x: cx + r * cos(sAngle), y: cy + r * sin(sAngle), a: sAngle });
    points.push({ x: cx + r * cos(eAngle), y: cy + r * sin(eAngle), a: eAngle });
    if (counterclockwise) {
      var temp = sAngle;
      sAngle = eAngle;
      eAngle = sAngle + 2 * PI;
    }
    [1 * PI / 2, 2 * PI / 2, 3 * PI / 2, 4 * PI / 2].forEach(function (a) {
      if (eAngle > a && a > sAngle) {
        points.push({ x: cx + r * cos(a), y: cy + r * sin(a), a: a });
      }
    });

    //removing the duplicated points
    relevantPoints.push(points.pop());
    while (points.length > 0) {
      var point = points.pop(),
          found = relevantPoints.find(function (p) {
        return almostEqual(point.x, p.x) && almostEqual(point.y, p.y);
      });
      if (!found) {
        relevantPoints.push(point);
      }
    }

    return relevantPoints;
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
  this.getParallelsAroundSegment = getParallelsAroundSegment;
  this.getIntersectionOfTwoLines = getIntersectionOfTwoLines;
  this.getAngleBetweenThreePoints = getAngleBetweenThreePoints;
  this.getTheCenterOfTheCorner = getTheCenterOfTheCorner;
  this.getTheFootOfThePerpendicular = getTheFootOfThePerpendicular;
  this.xyToArcAngle = xyToArcAngle;
  this.scaledRadius = scaledRadius;
  this.decomposeArcTo = decomposeArcTo;
  this.isPointInsideRectangle = isPointInsideRectangle;
}

},{}],"C:\\GitHub\\rabbit\\src\\rabbit.js":[function(require,module,exports){
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

},{"./customMatchers.js":1,"./geometry.js":2}]},{},["C:\\GitHub\\rabbit\\src\\rabbit.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGN1c3RvbU1hdGNoZXJzLmpzIiwic3JjXFxnZW9tZXRyeS5qcyIsInNyY1xccmFiYml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7O1FBS2dCLGMsR0FBQSxjOztBQUhoQjs7QUFHTyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0M7O0FBRXZDLGFBQVcsWUFBWSx3QkFBdkI7O0FBR0EsTUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBTyxxQkFBUCxFQUFpQztBQUNoRCxXQUFPO0FBQ0wsZUFBUyxpQkFBQyxNQUFELEVBQVMsUUFBVCxFQUFzQjtBQUM3QixZQUFJLFFBQVEsS0FBWjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxTQUFTLE1BQVQsR0FBa0IsT0FBTyxNQUE3QyxFQUFxRCxHQUFyRCxFQUEwRDtBQUN4RCxrQkFBUSxPQUFPLE1BQVAsR0FBZ0IsQ0FBeEI7QUFDQSxlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksT0FBTyxNQUEzQixFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxnQkFBSSxTQUFTLElBQUksQ0FBYixFQUFnQixNQUFoQixLQUEyQixPQUFPLENBQVAsRUFBVSxNQUF6QyxFQUFpRDtBQUMvQyxzQkFBUSxLQUFSO0FBQ0E7QUFDRDtBQUNGO0FBQ0QsY0FBSSxVQUFVLElBQWQsRUFBb0I7QUFDbEI7QUFDRDtBQUNGO0FBQ0QsWUFBSSxTQUFTLFFBQVEsRUFBQyxNQUFNLElBQVAsRUFBUixHQUF1QixFQUFDLE1BQU0sS0FBUCxFQUFjLFNBQVMsbUJBQXZCLEVBQXBDO0FBQ0EsZUFBTyxNQUFQO0FBQ0Q7QUFqQkksS0FBUDtBQW1CRCxHQXBCRDtBQUFBLE1Bc0JBLHNCQUFzQixTQUF0QixtQkFBc0IsQ0FBQyxJQUFELEVBQU8scUJBQVAsRUFBaUM7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UyxJQUFULEVBQWtCO0FBQy9CLFFBQUksT0FBTyxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsS0FBSyxNQUFuQixDQUFYO0FBQ0EsV0FBTyxPQUFQLENBQWUsVUFBQyxLQUFELEVBQVc7QUFDeEIsVUFBSSxRQUFRLENBQUMsQ0FBYjtBQUNBLFNBQUc7QUFDRCxnQkFBUSxLQUFLLDBCQUFMLENBQWdDLEtBQWhDLEVBQXVDLElBQXZDLENBQVI7QUFDQSxZQUFJLFVBQVUsQ0FBQyxDQUFmLEVBQWtCO0FBQ2hCLGVBQUssTUFBTCxDQUFZLEtBQVosRUFBbUIsTUFBTSxNQUF6QjtBQUNEO0FBQ0YsT0FMRCxRQUtTLFVBQVUsQ0FBQyxDQUxwQjtBQU1ELEtBUkQ7QUFTQSxXQUFPLElBQVA7QUFDRCxHQTNDRDs7QUE4Q0EsT0FBSyxPQUFMLEdBQWUsU0FBUyxPQUF4QjtBQUNBLE9BQUssY0FBTCxHQUFzQixRQUF0QjtBQUNBLE9BQUssOEJBQUwsR0FBc0MsOEJBQXRDO0FBQ0EsT0FBSywwQkFBTCxHQUFrQywwQkFBbEM7QUFDQSxPQUFLLFlBQUwsR0FBb0IsWUFBcEI7QUFFRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyeS5qcydcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQ3VzdG9tTWF0Y2hlcnMoZ2VvbWV0cnkpIHtcclxuXHJcbiAgZ2VvbWV0cnkgPSBnZW9tZXRyeSB8fCBuZXcgR2VvbWV0cnkoKTtcclxuXHJcblxyXG4gIHZhciB0b0JlUGFydE9mID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aCAtIGFjdHVhbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgbWF0Y2ggPSBhY3R1YWwubGVuZ3RoID4gMDtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYWN0dWFsLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmIChleHBlY3RlZFtpICsgal0ubWV0aG9kICE9PSBhY3R1YWxbal0ubWV0aG9kKSB7XHJcbiAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKG1hdGNoID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVzdWx0ID0gbWF0Y2ggPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZSBub3QgcGFydCBvZid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlSW5zaWRlVGhlQXJlYU9mID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgc21hbGxTaGFwZSA9IGFjdHVhbCxcclxuICAgICAgICAgIGJpZ1NoYXBlID0gZXhwZWN0ZWQsXHJcbiAgICAgICAgICBiaWdTaGFwZUJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGJpZ1NoYXBlKSxcclxuICAgICAgICAgIHNtYWxsU2hhcGVCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChzbWFsbFNoYXBlKSxcclxuICAgICAgICAgIGNlbnRlciA9IHt4OiBzbWFsbFNoYXBlQkJveC54ICsgc21hbGxTaGFwZUJCb3gud2lkdGggLyAyLCB5OiBzbWFsbFNoYXBlQkJveC55ICsgc21hbGxTaGFwZUJCb3guaGVpZ2h0IC8gMn0sXHJcbiAgICAgICAgICBpc0NlbnRlckluc2lkZSA9IGdlb21ldHJ5LmlzUG9pbnRJbnNpZGVSZWN0YW5nbGUoY2VudGVyLCBiaWdTaGFwZUJCb3gpLFxyXG4gICAgICAgICAgcmVzdWx0ID0gaXNDZW50ZXJJbnNpZGUgPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZSBpcyBub3QgaW5zaWRlIHRoZSBhcmVhIG9mJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvSGF2ZVRoZVNhbWVQb3NpdGlvbldpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZVBvc2l0aW9uID0gYWN0dWFsQkJveC54ID09PSBleHBlY3RlZEJCb3gueCAmJiBhY3R1YWxCQm94LnkgPT09IGV4cGVjdGVkQkJveC55LFxyXG4gICAgICAgICAgcmVzdWx0ID0gaGF2ZVRoZVNhbWVQb3NpdGlvbiA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvSGF2ZVRoZVNhbWVTaXplV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lU2l6ZSA9IGFjdHVhbEJCb3gud2lkdGggPT09IGV4cGVjdGVkQkJveC53aWR0aCAmJiBhY3R1YWxCQm94LmhlaWdodCA9PT0gZXhwZWN0ZWRCQm94LmhlaWdodCxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lU2l6ZSA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIHNpemUnfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9CZUhvcml6b250YWxseUFsaWduV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lQWxpZ25tZW50ID0gYWN0dWFsQkJveC55ID09PSBleHBlY3RlZEJCb3gueSxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lQWxpZ25tZW50ID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgaG9yaXpvbnRhbCBwb3NpdGlvbid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlVmVydGljYWxseUFsaWduV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lQWxpZ25tZW50ID0gYWN0dWFsQkJveC54ID09PSBleHBlY3RlZEJCb3gueCxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lQWxpZ25tZW50ID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgdmVydGljYWwgcG9zaXRpb24nfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMudG9CZVBhcnRPZiA9IHRvQmVQYXJ0T2Y7XHJcbiAgdGhpcy50b0JlSW5zaWRlVGhlQXJlYU9mID0gdG9CZUluc2lkZVRoZUFyZWFPZjtcclxuICB0aGlzLnRvSGF2ZVRoZVNhbWVQb3NpdGlvbldpdGggPSB0b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoO1xyXG4gIHRoaXMudG9IYXZlVGhlU2FtZVNpemVXaXRoID0gdG9IYXZlVGhlU2FtZVNpemVXaXRoO1xyXG4gIHRoaXMudG9CZUhvcml6b250YWxseUFsaWduV2l0aCA9IHRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGg7XHJcbiAgdGhpcy50b0JlVmVydGljYWxseUFsaWduV2l0aCA9IHRvQmVWZXJ0aWNhbGx5QWxpZ25XaXRoO1xyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBHZW9tZXRyeSgpIHtcclxuXHJcbiAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICBFUFNJTE9OID0gTnVtYmVyLkVQU0lMT04gfHwgMi4yMjA0NDYwNDkyNTAzMTNlLTE2LFxyXG4gICAgICBQSSA9IE1hdGguUEksXHJcbiAgICAgIHNpbiA9IE1hdGguc2luLFxyXG4gICAgICBjb3MgPSBNYXRoLmNvcztcclxuXHJcblxyXG4gIHZhciBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUgPSAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBib3g6IHt4OiBOYU4sIHk6IE5hTiwgd2lkdGg6IE5hTiwgaGVpZ2h0OiBOYU59LFxyXG4gICAgICB0cmFuc2Zvcm1zOiBbW11dLFxyXG4gICAgICBzaGFwZXNJblBhdGg6IFtdLFxyXG4gICAgICBtb3ZlVG9Mb2NhdGlvbjoge3g6IE5hTiwgeTogTmFOfSxcclxuICAgICAgbGluZVdpZHRoczogWzFdXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIHBhdGhGaWxsU2hhcGVIYW5kbGVycyA9IHtcclxuICAgIHJlY3Q6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIHggPSBzaGFwZS54LFxyXG4gICAgICAgIHkgPSBzaGFwZS55LFxyXG4gICAgICAgIHdpZHRoID0gc2hhcGUud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0ID0gc2hhcGUuaGVpZ2h0LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IHNoYXBlLmN4LFxyXG4gICAgICAgICAgY3kgPSBzaGFwZS5jeSxcclxuICAgICAgICAgIHIgPSBzaGFwZS5yLFxyXG4gICAgICAgICAgc3ggPSBzaGFwZS5zeCxcclxuICAgICAgICAgIHN5ID0gc2hhcGUuc3ksXHJcbiAgICAgICAgICBzQW5nbGUgPSBzaGFwZS5zQW5nbGUsXHJcbiAgICAgICAgICBlQW5nbGUgPSBzaGFwZS5lQW5nbGUsXHJcbiAgICAgICAgICBjb3VudGVyY2xvY2t3aXNlID0gc2hhcGUuY291bnRlcmNsb2Nrd2lzZSxcclxuICAgICAgICAgIGFyY1BvaW50cyA9IHJlbGV2YW50QXJjUG9pbnRzKGN4LCBjeSwgciwgc0FuZ2xlLCBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2UpLFxyXG4gICAgICAgICAgYXJjQW5nbGVzID0gYXJjUG9pbnRzLm1hcCgocCkgPT4gcC5hKSxcclxuICAgICAgICAgIHNjYWxlZEFyY1BvaW50cyA9IGFyY0FuZ2xlcy5tYXAoKGEpID0+IHtcclxuICAgICAgICAgICAgdmFyIHNyID0gc2NhbGVkUmFkaXVzKHIsIHN4LCBzeSwgYSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7eDogY3ggKyBzcipjb3MoYSksIHk6IGN5ICsgc3Iqc2luKGEpfTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgbmV3Qm94ID0gYm94UG9pbnRzKHNjYWxlZEFyY1BvaW50cyk7XHJcbiAgICAgIGlmICghaXNOYU4oY3gpICYmICFpc05hTihjeSkgJiYgYXJjUG9pbnRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHBhdGhTdHJva2VTaGFwZUhhbmRsZXJzID0ge1xyXG4gICAgcmVjdDogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeCA9IHNoYXBlLngsXHJcbiAgICAgICAgeSA9IHNoYXBlLnksXHJcbiAgICAgICAgd2lkdGggPSBzaGFwZS53aWR0aCxcclxuICAgICAgICBoZWlnaHQgPSBzaGFwZS5oZWlnaHQsXHJcbiAgICAgICAgc2NhbGVkTGluZVdpZHRoID0gc3RhdGUubGluZVdpZHRoICE9PSAxID8gc3RhdGUubGluZVdpZHRoIDogMCxcclxuICAgICAgICB4U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgeVNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4IC0geFNjYWxlZExpbmVXaWR0aCAgLyAyLCB5OiB5IC0geVNjYWxlZExpbmVXaWR0aCAvIDIsIHdpZHRoOiB3aWR0aCArIHhTY2FsZWRMaW5lV2lkdGgsIGhlaWdodDogaGVpZ2h0ICsgeVNjYWxlZExpbmVXaWR0aH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyYzogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgY3ggPSBzaGFwZS5jeCxcclxuICAgICAgICAgIGN5ID0gc2hhcGUuY3ksXHJcbiAgICAgICAgICByID0gc2hhcGUucixcclxuICAgICAgICAgIHN4ID0gc2hhcGUuc3gsXHJcbiAgICAgICAgICBzeSA9IHNoYXBlLnN5LFxyXG4gICAgICAgICAgc0FuZ2xlID0gc2hhcGUuc0FuZ2xlLFxyXG4gICAgICAgICAgZUFuZ2xlID0gc2hhcGUuZUFuZ2xlLFxyXG4gICAgICAgICAgY291bnRlcmNsb2Nrd2lzZSA9IHNoYXBlLmNvdW50ZXJjbG9ja3dpc2UsXHJcbiAgICAgICAgICBhcmNQb2ludHMgPSByZWxldmFudEFyY1BvaW50cyhjeCwgY3ksIHIsIHNBbmdsZSwgZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlKSxcclxuICAgICAgICAgIGFyY0FuZ2xlcyA9IGFyY1BvaW50cy5tYXAoKHApID0+IHAuYSksXHJcbiAgICAgICAgICBzY2FsZWRBcmNQb2ludHMgPSBhcmNBbmdsZXMubWFwKChhKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBzciA9IHNjYWxlZFJhZGl1cyhyLCBzeCwgc3ksIGEpO1xyXG4gICAgICAgICAgICByZXR1cm4ge3g6IGN4ICsgc3IqY29zKGEpLCB5OiBjeSArIHNyKnNpbihhKX07XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICAgIG5ld0JveCA9IGJveFBvaW50cyhzY2FsZWRBcmNQb2ludHMpO1xyXG4gICAgICBpZiAoIWlzTmFOKGN4KSAmJiAhaXNOYU4oY3kpICYmIGFyY1BvaW50cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBsaW5lVG86IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIHgxID0gc2hhcGUueDEsXHJcbiAgICAgICAgeTEgPSBzaGFwZS55MSxcclxuICAgICAgICB4MiA9IHNoYXBlLngyLFxyXG4gICAgICAgIHkyID0gc2hhcGUueTIsXHJcbiAgICAgICAgc2NhbGVkTGluZVdpZHRoID0gZ2V0U2NhbGVkV2lkdGhPZkxpbmUoeDEsIHkxLCB4MiwgeTIsIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LCBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSwgc3RhdGUubGluZVdpZHRoKSxcclxuICAgICAgICByZWN0ID0gZ2V0UmVjdEFyb3VuZExpbmUoeDEsIHkxLCB4MiwgeTIsIHNjYWxlZExpbmVXaWR0aCAhPT0gMSA/IHNjYWxlZExpbmVXaWR0aCA6IDApLFxyXG4gICAgICAgIG5ld0JveCA9IHtcclxuICAgICAgICAgIHg6IE1hdGgubWluKHJlY3QueDEsIHJlY3QueDIsIHJlY3QueDMsIHJlY3QueDQpLFxyXG4gICAgICAgICAgeTogTWF0aC5taW4ocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NCksXHJcbiAgICAgICAgICB3aWR0aDogTWF0aC5tYXgocmVjdC54MSwgcmVjdC54MiwgcmVjdC54MywgcmVjdC54NCkgLSBNYXRoLm1pbihyZWN0LngxLCByZWN0LngyLCByZWN0LngzLCByZWN0Lng0KSxcclxuICAgICAgICAgIGhlaWdodDogTWF0aC5tYXgocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NCkgLSBNYXRoLm1pbihyZWN0LnkxLCByZWN0LnkyLCByZWN0LnkzLCByZWN0Lnk0KVxyXG4gICAgICAgIH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGNhbnZhc0NhbGxIYW5kbGVycyA9IHtcclxuICAgIGxpbmVXaWR0aDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLmxpbmVXaWR0aHNbc3RhdGUubGluZVdpZHRocy5sZW5ndGggLSAxXSA9IGNhbGwudmFsO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgZmlsbFJlY3Q6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgd2lkdGggPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIGhlaWdodCA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBzdHJva2VSZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IHN0YXRlLmxpbmVXaWR0aCAhPT0gMSA/IHN0YXRlLmxpbmVXaWR0aCA6IDAsXHJcbiAgICAgICAgeFNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIHlTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBuZXdCb3ggPSB7eDogeCAtIHhTY2FsZWRMaW5lV2lkdGggLyAyLCB5OiB5IC0geVNjYWxlZExpbmVXaWR0aCAvIDIsIHdpZHRoOiB3aWR0aCArIHhTY2FsZWRMaW5lV2lkdGgsIGhlaWdodDogaGVpZ2h0ICsgeVNjYWxlZExpbmVXaWR0aH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHJlY3Q6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgd2lkdGggPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIGhlaWdodCA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnk7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAncmVjdCcsIHg6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyYzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgY3kgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHIgPSBjYWxsLmFyZ3VtZW50c1syXSxcclxuICAgICAgICBzeCA9IHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIHN5ID0gc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgc0FuZ2xlID0gY2FsbC5hcmd1bWVudHNbM10sXHJcbiAgICAgICAgZUFuZ2xlID0gY2FsbC5hcmd1bWVudHNbNF0sXHJcbiAgICAgICAgY291bnRlcmNsb2Nrd2lzZSA9IGNhbGwuYXJndW1lbnRzWzVdIHx8IGZhbHNlO1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2FyYycsIGN4OiBjeCwgY3k6IGN5LCByOiByLCBzeDogc3gsIHN5OiBzeSwgc0FuZ2xlOiBzQW5nbGUsIGVBbmdsZTogZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlOiBjb3VudGVyY2xvY2t3aXNlfSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBtb3ZlVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkxID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueTtcclxuICAgICAgc3RhdGUubW92ZVRvTG9jYXRpb24gPSB7eDogeDEsIHk6IHkxfTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGxpbmVUbzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4MSA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLngsXHJcbiAgICAgICAgeTEgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi55LFxyXG4gICAgICAgIHgyID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5MiA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnk7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnbGluZVRvJywgeDE6IHgxLCB5MTogeTEsIHgyOiB4MiwgeTI6IHkyfSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmNUbzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4MCA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLngsXHJcbiAgICAgICAgICB5MCA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLnksXHJcbiAgICAgICAgICB4MSA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgICB5MSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgICB4MiA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgICB5MiA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgICByID0gY2FsbC5hcmd1bWVudHNbNF0sXHJcbiAgICAgICAgICBzeCA9IHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgICAgc3kgPSBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICAgIGRlY29tcG9zaXRpb24gPSBkZWNvbXBvc2VBcmNUbyh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCByLCBzeCwgc3kpO1xyXG4gICAgICBpZiAoZGVjb21wb3NpdGlvbi5saW5lKSB7XHJcbiAgICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdsaW5lVG8nLCB4MTogZGVjb21wb3NpdGlvbi5saW5lLngxLCB5MTogZGVjb21wb3NpdGlvbi5saW5lLnkxLCB4MjogZGVjb21wb3NpdGlvbi5saW5lLngyLCB5MjogZGVjb21wb3NpdGlvbi5saW5lLnkyfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRlY29tcG9zaXRpb24uYXJjKSB7XHJcbiAgICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdhcmMnLCBjeDogZGVjb21wb3NpdGlvbi5hcmMueCwgY3k6IGRlY29tcG9zaXRpb24uYXJjLnksIHI6IHIsIHN4OiBzeCwgc3k6IHN5LCBzQW5nbGU6IGRlY29tcG9zaXRpb24uYXJjLnNBbmdsZSwgZUFuZ2xlOiBkZWNvbXBvc2l0aW9uLmFyYy5lQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2U6IGRlY29tcG9zaXRpb24uYXJjLmNvdW50ZXJjbG9ja3dpc2V9KTtcclxuICAgICAgfVxyXG4gICAgICBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbiA9IHt4OiBkZWNvbXBvc2l0aW9uLnBvaW50LngsIHk6IGRlY29tcG9zaXRpb24ucG9pbnQueX07XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBzYXZlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUudHJhbnNmb3Jtcy5wdXNoKFtdKTtcclxuICAgICAgc3RhdGUubGluZVdpZHRocy5wdXNoKGxhc3RFbGVtZW50KHN0YXRlLmxpbmVXaWR0aHMpKTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHJlc3RvcmU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS50cmFuc2Zvcm1zLnBvcCgpO1xyXG4gICAgICBzdGF0ZS5saW5lV2lkdGhzLnBvcCgpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgdHJhbnNsYXRlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgbGFzdEVsZW1lbnQoc3RhdGUudHJhbnNmb3JtcylcclxuICAgICAgICAucHVzaCh7dHJhbnNsYXRlOiB7eDogY2FsbC5hcmd1bWVudHNbMF0sIHk6IGNhbGwuYXJndW1lbnRzWzFdfX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc2NhbGU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBsYXN0RWxlbWVudChzdGF0ZS50cmFuc2Zvcm1zKVxyXG4gICAgICAgIC5wdXNoKHtzY2FsZToge3g6IGNhbGwuYXJndW1lbnRzWzBdLCB5OiBjYWxsLmFyZ3VtZW50c1sxXX19KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGJlZ2luUGF0aDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aCA9IFtdO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgZmlsbDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHJldHVybiBzdGF0ZS5zaGFwZXNJblBhdGgucmVkdWNlKChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgICB2YXIgaGFuZGxlciA9IGdldFBhdGhGaWxsU2hhcGVIYW5kbGVyKHNoYXBlKTtcclxuICAgICAgICByZXR1cm4gaGFuZGxlcihzdGF0ZSwgc2hhcGUpO1xyXG4gICAgICB9LCBzdGF0ZSk7XHJcbiAgICB9LFxyXG4gICAgc3Ryb2tlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHN0YXRlLnNoYXBlc0luUGF0aC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBzaGFwZSA9IHN0YXRlLnNoYXBlc0luUGF0aFtpXSxcclxuICAgICAgICAgICAgaGFuZGxlciA9IGdldFBhdGhTdHJva2VTaGFwZUhhbmRsZXIoc2hhcGUpO1xyXG4gICAgICAgIHN0YXRlID0gaGFuZGxlcihzdGF0ZSwgc2hhcGUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBudWxsQ2FudmFzQ2FsbEhhbmRsZXIgPSAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9LFxyXG5cclxuICBnZXRDYW52YXNDYWxsSGFuZGxlciA9IChjYWxsKSA9PiB7XHJcbiAgICByZXR1cm4gY2FudmFzQ2FsbEhhbmRsZXJzW2NhbGwubWV0aG9kXSB8fCBjYW52YXNDYWxsSGFuZGxlcnNbY2FsbC5hdHRyXSB8fCBudWxsQ2FudmFzQ2FsbEhhbmRsZXI7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aEZpbGxTaGFwZUhhbmRsZXIgPSAoc2hhcGUpID0+IHtcclxuICAgIHJldHVybiBwYXRoRmlsbFNoYXBlSGFuZGxlcnNbc2hhcGUudHlwZV07XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aFN0cm9rZVNoYXBlSGFuZGxlciA9IChzaGFwZSkgPT4ge1xyXG4gICAgcmV0dXJuIHBhdGhTdHJva2VTaGFwZUhhbmRsZXJzW3NoYXBlLnR5cGVdO1xyXG4gIH0sXHJcblxyXG4gIHByZUNhbnZhc0NhbGxIYW5kbGVyID0gKHN0YXRlKSA9PiB7XHJcbiAgICBzdGF0ZS50cmFuc2Zvcm0gPSB0b3RhbFRyYW5zZm9ybShmbGF0dGVuKHN0YXRlLnRyYW5zZm9ybXMpKTtcclxuICAgIHN0YXRlLmxpbmVXaWR0aCA9IGxhc3RFbGVtZW50KHN0YXRlLmxpbmVXaWR0aHMpO1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH0sXHJcblxyXG4gIGdldEJCb3ggPSAoc2hhcGUpID0+IHtcclxuICAgIHZhciBzdGF0ZSA9IGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSgpO1xyXG4gICAgc3RhdGUgPSBzaGFwZS5yZWR1Y2UoKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciBoYW5kbGVyID0gZ2V0Q2FudmFzQ2FsbEhhbmRsZXIoY2FsbCk7XHJcbiAgICAgIHJldHVybiBoYW5kbGVyKHByZUNhbnZhc0NhbGxIYW5kbGVyKHN0YXRlKSwgY2FsbCk7XHJcbiAgICB9LCBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUoKSk7XHJcbiAgICByZXR1cm4gc3RhdGUuYm94O1xyXG4gIH0sXHJcblxyXG4gIGZsYXR0ZW4gPSAoYXJyYXkpID0+IHtcclxuICAgIHJldHVybiBhcnJheVxyXG4gICAgICAucmVkdWNlKChwcmV2aW91c0FycmF5LCBjdXJyZW50QXJyYXkpID0+IHtcclxuICAgICAgICByZXR1cm4gcHJldmlvdXNBcnJheS5jb25jYXQoY3VycmVudEFycmF5KTtcclxuICAgICAgfSwgW10pO1xyXG4gIH0sXHJcblxyXG4gIGxhc3RFbGVtZW50ID0gKGFycmF5KSA9PiB7XHJcbiAgICByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XHJcbiAgfSxcclxuXHJcbiAgZmlyc3RUcnV0aHlPclplcm8gPSAodmFsMSwgdmFsMikgPT57XHJcbiAgICBpZiAodmFsMSB8fCB2YWwxID09PSAwKSB7XHJcbiAgICAgIHJldHVybiB2YWwxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbDI7XHJcbiAgfSxcclxuXHJcbiAgdW5pb24gPSAoYm94MSwgYm94MikgPT4ge1xyXG4gICAgYm94MSA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gxLndpZHRoLCBib3gyLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLmhlaWdodCwgYm94Mi5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgYm94MiA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94Mi54LCBib3gxLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLnksIGJveDEueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gyLndpZHRoLCBib3gxLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLmhlaWdodCwgYm94MS5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgeDogTWF0aC5taW4oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBNYXRoLm1pbihib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBNYXRoLm1heChib3gxLndpZHRoLCBib3gyLndpZHRoLCBib3gxLnggPCBib3gyLnhcclxuICAgICAgICA/IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDIueCAtIChib3gxLnggKyBib3gxLndpZHRoKSlcclxuICAgICAgICA6IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDEueCAtIChib3gyLnggKyBib3gyLndpZHRoKSkpLFxyXG4gICAgICBoZWlnaHQ6IE1hdGgubWF4KGJveDEuaGVpZ2h0LCBib3gyLmhlaWdodCwgYm94MS55IDwgYm94Mi55XHJcbiAgICAgICAgPyBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDIueSAtIChib3gxLnkgKyBib3gxLmhlaWdodCkpXHJcbiAgICAgICAgOiBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDEueSAtIChib3gyLnkgKyBib3gyLmhlaWdodCkpKVxyXG4gICAgfTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSxcclxuXHJcbiAgYm94UG9pbnRzID0gKHBvaW50cykgPT4ge1xyXG4gICAgdmFyIHhlcyA9IHBvaW50cy5tYXAoKHApID0+IHAueCksXHJcbiAgICAgICAgeWVzID0gcG9pbnRzLm1hcCgocCkgPT4gcC55KSxcclxuICAgICAgICBtaW5YID0gTWF0aC5taW4uYXBwbHkobnVsbCwgeGVzKSxcclxuICAgICAgICBtYXhYID0gTWF0aC5tYXguYXBwbHkobnVsbCwgeGVzKSxcclxuICAgICAgICBtaW5ZID0gTWF0aC5taW4uYXBwbHkobnVsbCwgeWVzKSxcclxuICAgICAgICBtYXhZID0gTWF0aC5tYXguYXBwbHkobnVsbCwgeWVzKSxcclxuICAgICAgICBib3ggPSB7eDogTmFOLCB5OiBOYU4sIHdpZHRoOiBOYU4sIGhlaWdodDogTmFOfTtcclxuICAgIGlmIChtaW5YICE9PSArSW5maW5pdHkgJiYgbWF4WCAhPT0gLUluZmluaXR5ICYmIG1pblkgIT09ICtJbmZpbml0eSAmJiBtYXhZICE9PSAtSW5maW5pdHkpIHtcclxuICAgICAgYm94ID0ge1xyXG4gICAgICAgIHg6IG1pblgsXHJcbiAgICAgICAgeTogbWluWSxcclxuICAgICAgICB3aWR0aDogbWF4WCAtIG1pblgsXHJcbiAgICAgICAgaGVpZ2h0OiBtYXhZIC0gbWluWVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJveDtcclxuICB9LFxyXG5cclxuICB0b3RhbFRyYW5zZm9ybSA9ICh0cmFuc2Zvcm1zKSA9PiB7XHJcbiAgICByZXR1cm4gdHJhbnNmb3Jtc1xyXG4gICAgICAubWFwKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0cmFuc2xhdGU6IHZhbHVlLnRyYW5zbGF0ZSB8fCB7eDogMCwgeTogMH0sXHJcbiAgICAgICAgICBzY2FsZTogdmFsdWUuc2NhbGUgfHwge3g6IDEsIHk6IDF9XHJcbiAgICAgICAgfTtcclxuICAgICAgfSlcclxuICAgICAgLnJlZHVjZSgocHJldmlvdXNWYWx1ZSwgY3VycmVudFZhbHVlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRyYW5zbGF0ZToge1xyXG4gICAgICAgICAgICB4OiBwcmV2aW91c1ZhbHVlLnRyYW5zbGF0ZS54ICsgY3VycmVudFZhbHVlLnRyYW5zbGF0ZS54ICogcHJldmlvdXNWYWx1ZS5zY2FsZS54LFxyXG4gICAgICAgICAgICB5OiBwcmV2aW91c1ZhbHVlLnRyYW5zbGF0ZS55ICsgY3VycmVudFZhbHVlLnRyYW5zbGF0ZS55ICogcHJldmlvdXNWYWx1ZS5zY2FsZS55XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc2NhbGU6IHtcclxuICAgICAgICAgICAgeDogcHJldmlvdXNWYWx1ZS5zY2FsZS54ICogY3VycmVudFZhbHVlLnNjYWxlLngsXHJcbiAgICAgICAgICAgIHk6IHByZXZpb3VzVmFsdWUuc2NhbGUueSAqIGN1cnJlbnRWYWx1ZS5zY2FsZS55XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfSwge3RyYW5zbGF0ZToge3g6IDAsIHk6IDB9LCBzY2FsZToge3g6IDEsIHk6IDF9fSk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UmVjdEFyb3VuZExpbmUgPSAoeDEsIHkxLCB4MiwgeTIsIHdpZHRoKSA9PiB7XHJcbiAgICB2YXIgcmVjdDtcclxuICAgIGlmICh4MSA9PT0geTEgJiYgeDEgPT09IHgyICYmIHgxID09PSB5Mikge1xyXG4gICAgICByZWN0ID0ge1xyXG4gICAgICAgIHgxOiB4MSwgeTE6IHgxLCAgeDI6IHgxLCB5MjogeDEsXHJcbiAgICAgICAgeDQ6IHgxLCB5NDogeDEsICB4MzogeDEsIHkzOiB4MVxyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVjdCA9IGdldFJlY3RBcm91bmRMb25nTGluZSh4MSwgeTEsIHgyLCB5Miwgd2lkdGgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlY3Q7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UmVjdEFyb3VuZExvbmdMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCB3aWR0aCkgPT4ge1xyXG4gICAgLy8gIHIgPSB0aGUgcmFkaXVzIG9yIHRoZSBnaXZlbiBkaXN0YW5jZSBmcm9tIGEgZ2l2ZW4gcG9pbnQgdG8gdGhlIG5lYXJlc3QgY29ybmVycyBvZiB0aGUgcmVjdFxyXG4gICAgLy8gIGEgPSB0aGUgYW5nbGUgYmV0d2VlbiB0aGUgbGluZSBhbmQgdGhlIGhvcml6b250YWwgYXhpc1xyXG4gICAgLy8gIGIxLCBiMiA9IHRoZSBhbmdsZSBiZXR3ZWVuIGhhbGYgdGhlIGhpZ2h0IG9mIHRoZSByZWN0YW5nbGUgYW5kIHRoZSBob3Jpem9udGFsIGF4aXNcclxuICAgIC8vXHJcbiAgICAvLyAgSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlIHRoZSBnaXZlbiBsaW5lIGlzIGhvcml6b250YWwsIHNvIGEgPSAwLlxyXG4gICAgLy8gIFRoZSBnaXZlbiBsaW5lIGlzIGJldHdlZW4gdGhlIHR3byBAIHN5bWJvbHMuXHJcbiAgICAvLyAgVGhlICsgc3ltYm9scyBhcmUgdGhlIGNvcm5lcnMgb2YgcmVjdGFuZ2xlIHRvIGJlIGRldGVybWluZWQuXHJcbiAgICAvLyAgSW4gb3JkZXIgdG8gZmluZCB0aGUgYjEgYW5kIGIyIGFuZ2xlcyB3ZSBoYXZlIHRvIGFkZCBQSS8yIGFuZCByZXNwZWN0aXZseSBzdWJ0cmFjdCBQSS8yLlxyXG4gICAgLy8gIGIxIGlzIHZlcnRpY2FsIGFuZCBwb2ludGluZyB1cHdvcmRzIGFuZCBiMiBpcyBhbHNvIHZlcnRpY2FsIGJ1dCBwb2ludGluZyBkb3dud29yZHMuXHJcbiAgICAvLyAgRWFjaCBjb3JuZXIgaXMgciBvciB3aWR0aCAvIDIgZmFyIGF3YXkgZnJvbSBpdHMgY29yZXNwb25kZW50IGxpbmUgZW5kaW5nLlxyXG4gICAgLy8gIFNvIHdlIGtub3cgdGhlIGRpc3RhbmNlIChyKSwgdGhlIHN0YXJ0aW5nIHBvaW50cyAoeDEsIHkxKSBhbmQgKHgyLCB5MikgYW5kIHRoZSAoYjEsIGIyKSBkaXJlY3Rpb25zLlxyXG4gICAgLy9cclxuICAgIC8vICAoeDEseTEpICAgICAgICAgICAgICAgICAgICAoeDIseTIpXHJcbiAgICAvLyAgICAgICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXHJcbiAgICAvLyAgICAgIF4gICAgICAgICAgICAgICAgICAgICAgICBeXHJcbiAgICAvLyAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgICAvLyAgICAgIHwgYjEgICAgICAgICAgICAgICAgICAgICB8IGIxXHJcbiAgICAvLyAgICAgIEA9PT09PT09PT09PT09PT09PT09PT09PT1AXHJcbiAgICAvLyAgICAgIHwgYjIgICAgICAgICAgICAgICAgICAgICB8IGIyXHJcbiAgICAvLyAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgICAvLyAgICAgIHYgICAgICAgICAgICAgICAgICAgICAgICB2XHJcbiAgICAvLyAgICAgICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXHJcbiAgICAvLyAgKHg0LHk0KSAgICAgICAgICAgICAgICAgICAgKHgzLHkzKVxyXG4gICAgLy9cclxuXHJcbiAgICB2YXIgciA9IHdpZHRoIC8gMixcclxuICAgICAgYSA9IE1hdGguYXRhbigoeTIgLSB5MSkgLyAoeDIgLSB4MSkpLFxyXG4gICAgICBiMSA9IGEgKyBNYXRoLlBJLzIsXHJcbiAgICAgIGIyID0gYSAtIE1hdGguUEkvMixcclxuICAgICAgcngxID0gciAqIE1hdGguY29zKGIxKSArIHgxLFxyXG4gICAgICByeTEgPSByICogTWF0aC5zaW4oYjEpICsgeTEsXHJcbiAgICAgIHJ4MiA9IHIgKiBNYXRoLmNvcyhiMSkgKyB4MixcclxuICAgICAgcnkyID0gciAqIE1hdGguc2luKGIxKSArIHkyLFxyXG4gICAgICByeDMgPSByICogTWF0aC5jb3MoYjIpICsgeDIsXHJcbiAgICAgIHJ5MyA9IHIgKiBNYXRoLnNpbihiMikgKyB5MixcclxuICAgICAgcng0ID0gciAqIE1hdGguY29zKGIyKSArIHgxLFxyXG4gICAgICByeTQgPSByICogTWF0aC5zaW4oYjIpICsgeTE7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4MTogcngxLCB5MTogcnkxLCAgeDI6IHJ4MiwgeTI6IHJ5MixcclxuICAgICAgeDQ6IHJ4NCwgeTQ6IHJ5NCwgIHgzOiByeDMsIHkzOiByeTNcclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgZ2V0U2NhbGVkV2lkdGhPZkxpbmUgPSAoeDEsIHkxLCB4MiwgeTIsIHN4LCBzeSwgd2lkdGgpID0+IHtcclxuICAgIC8vICBUaGUgb3JpZ2luYWwgcG9pbnRzIGFyZSBub3QgbW92ZWQuIE9ubHkgdGhlIHdpZHRoIHdpbGwgYmUgc2NhbGVkLlxyXG4gICAgLy8gIFRoZSB3aWR0aCBvZiBhbiBob3Jpem9udGFsIGxpbmUgd2lsbCBiZSBzY2FsZWQgd2l0aCB0aGUgc3kgcmF0aW8gb25seS5cclxuICAgIC8vICBUaGUgd2lkdGggb2YgYSB2ZXJ0aXZhbCBsaW5lIHdpbGwgYmUgc2NhbGVkIHdpdGggdGhlIHN4IHJhdGlvIG9ubHkuXHJcbiAgICAvLyAgVGhlIHdpZHRoIG9mIGFuIG9ibGlxdWUgbGluZSB3aWxsIGJlIHNjYWxlZCB3aXRoIGJvdGggdGhlIHN4IGFuZCBzeVxyXG4gICAgLy9idXQgcHJvcG9ydGlvbmFsIHdpdGggdGhlIGFuZ2xlIGJldHdlZW4gdGhlIGxpbmUgYW5kIHRoZSB4IGFuZCB5IGF4ZXMuXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlxcXHJcbiAgICAvLyAgICAgICAgICAgICAgIC5cXCAgKHgyLHkyKSAgICAgICAgICAgICAgICAgICAgICAgICAuLi5cXCAgKHgyLHkyKVxyXG4gICAgLy8gICAgICAgICAgICAgIC4uLkAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLi4uQFxyXG4gICAgLy8gICAgICAgICAgICAgLi4uLy5cXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLi4uLy5cXFxyXG4gICAgLy8gICAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgICBzeCAgICAgICAgICAgICAuLi4uLi8uLi5cXFxyXG4gICAgLy8gICAgICAgICAgIC4uLi8uLi4gICAgICAgICAgICArLS0tPiAgICAgICAgICAgIC4uLi4uLy4uLi4uXHJcbiAgICAvLyAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAuLi4uLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAuLi4vLi4uICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgXFwuLi4vLi4uLi5cclxuICAgIC8vICAgICAgICAgXFwuLy4uLiAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgXFwuLy4uLi4uXHJcbiAgICAvLyAgICAgICAgICBALi4uICAgICAgICAgICAgIHN5IHYgICAgICAgICAgICAgICAgIEAuLi4uLlxyXG4gICAgLy8gICh4MSx5MSkgIFxcLiAgICAgICAgICAgICAgICAgICAgICAgICAgICh4MSx5MSkgIFxcLi4uXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFwuXHJcbiAgICAvL1xyXG4gICAgdmFyIGEgPSBNYXRoLmF0YW4oKHkyIC0geTEpIC8gKHgyIC0geDEpKSxcclxuICAgICAgc2luYSA9IE1hdGguc2luKGEpLCBjb3NhID0gTWF0aC5jb3MoYSksXHJcbiAgICAgIHNjYWxlZFdpZHRoID0gd2lkdGggKiBNYXRoLnNxcnQoc3gqc3ggKiBzaW5hKnNpbmEgKyBzeSpzeSAqIGNvc2EqY29zYSk7XHJcbiAgICByZXR1cm4gc2NhbGVkV2lkdGg7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCA9ICh4MSwgeTEsIHgyLCB5MiwgZGlzdGFuY2UpID0+IHtcclxuICAgIHZhciByZWN0ID0gZ2V0UmVjdEFyb3VuZExvbmdMaW5lKHgxLCB5MSwgeDIsIHkyLCAyICogZGlzdGFuY2UpO1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAge3gxOiByZWN0LngxLCB5MTogcmVjdC55MSwgeDI6IHJlY3QueDIsIHkyOiByZWN0LnkyfSxcclxuICAgICAge3gxOiByZWN0Lng0LCB5MTogcmVjdC55NCwgeDI6IHJlY3QueDMsIHkyOiByZWN0LnkzfVxyXG4gICAgXTtcclxuICB9LFxyXG5cclxuICBnZXRJbnRlcnNlY3Rpb25PZlR3b0xpbmVzID0gKGwxLCBsMikgPT4ge1xyXG4gICAgdmFyIGExID0gbDEueTIgLSBsMS55MSwgYjEgPSBsMS54MSAtIGwxLngyLCBjMSA9IGwxLngyKmwxLnkxIC0gbDEueDEqbDEueTIsXHJcbiAgICAgICAgYTIgPSBsMi55MiAtIGwyLnkxLCBiMiA9IGwyLngxIC0gbDIueDIsIGMyID0gbDIueDIqbDIueTEgLSBsMi54MSpsMi55MixcclxuICAgICAgICB4ID0gKGMyKmIxIC0gYzEqYjIpIC8gKGExKmIyIC0gYTIqYjEpLFxyXG4gICAgICAgIHkgPSBsMi55MSA9PT0gbDIueTIgPyBsMi55MSA6ICgtYzEgLSBhMSp4KSAvIGIxO1xyXG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5fTtcclxuICB9LFxyXG5cclxuICBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoKHgyLXgxKSooeDIteDEpICsgKHkyLXkxKSooeTIteTEpKTtcclxuICB9LFxyXG5cclxuICBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyA9ICh4MSwgeTEsIHgyLCB5MiwgeDMsIHkzKSA9PiB7XHJcbiAgICB2YXIgYSA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MSwgeTEsIHgyLCB5MiksXHJcbiAgICAgICAgYiA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MiwgeTIsIHgzLCB5MyksXHJcbiAgICAgICAgYyA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MywgeTMsIHgxLCB5MSksXHJcbiAgICAgICAgY29zQyA9IChhKmEgKyBiKmIgLSBjKmMpIC8gKDIqYSpiKSxcclxuICAgICAgICBDID0gTWF0aC5hY29zKGNvc0MpO1xyXG4gICAgcmV0dXJuIEM7XHJcbiAgfSxcclxuXHJcbiAgcGVybXV0ZUxpbmVzID0gKGFscGhhTGluZXMsIGJldGFMaW5lcykgPT4ge1xyXG4gICAgdmFyIHBlcm11dGF0aW9ucyA9IFtdO1xyXG4gICAgYWxwaGFMaW5lcy5mb3JFYWNoKChhbHBoYUxpbmUpID0+IHtcclxuICAgICAgYmV0YUxpbmVzLmZvckVhY2goKGJldGFMaW5lKSA9PiB7XHJcbiAgICAgICAgcGVybXV0YXRpb25zLnB1c2goe2FscGhhOiBhbHBoYUxpbmUsIGJldGE6IGJldGFMaW5lfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIHJldHVybiBwZXJtdXRhdGlvbnM7XHJcbiAgfSxcclxuXHJcbiAgYWxtb3N0RXF1YWwgPSAoYSwgYikgPT4ge1xyXG4gICAgLy8gZ3Jvc3MgYXBwcm94aW1hdGlvbiB0byBjb3ZlciB0aGUgZmxvdCBhbmQgdHJpZ29ub21ldHJpYyBwcmVjaXNpb25cclxuICAgIHJldHVybiBhID09PSBiIHx8IE1hdGguYWJzKGEgLSBiKSA8IDIwICogRVBTSUxPTjtcclxuICB9LFxyXG5cclxuICBpc0NlbnRlckluQmV0d2VlbiA9IChjeCwgY3ksIHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpID0+IHtcclxuICAgIHZhciBhID0gZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoeDIsIHkyLCB4MSwgeTEsIHgwLCB5MCksXHJcbiAgICAgICAgYTEgPSBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyhjeCwgY3ksIHgxLCB5MSwgeDAsIHkwKSxcclxuICAgICAgICBhMiA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzKGN4LCBjeSwgeDEsIHkxLCB4MiwgeTIpO1xyXG4gICAgcmV0dXJuIGFsbW9zdEVxdWFsKGEsIGExICsgYTIpICYmIChhMSArIGEyIDw9IE1hdGguUEkpO1xyXG4gIH0sXHJcblxyXG4gIGdldFRoZUNlbnRlck9mVGhlQ29ybmVyID0gKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIGRpc3RhbmNlLCBzeCwgc3kpID0+IHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQgIGRcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICBhbHBoYSBsaW5lIDAgICAgLS0tLS0tLS0tLS0tLSctLS8tLSctLS0tLS0tLS1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICcgICAgICAgICAgICAgZFxyXG4gICAgLy8gICAgIGdpdmVuIGxpbmUgICAgPT09UD09PT09PT09PT1QPT09PT09PT09PT09PT1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnICAgICAgICAgICAgICAgZFxyXG4gICAgLy8gICBhbHBoYSBsaW5lIDEgICAgLS0tLS0tLS0tQy0tLy0tJy0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICcgIFAgICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy9cclxuICAgIC8vICAgICBiZXRhIGxpbmVzIDAgJiAxIHdpdGggb25lIG9mIHRoZSBnaXZlbiBsaW5lIGluYmV0d2VlblxyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgUCA9IHRoZSBnaXZlbiBQMCwgUDEsIFAyIHBvaW50c1xyXG4gICAgLy9cclxuICAgIC8vICBkID0gdGhlIGdpdmVuIGRpc3RhbmNlIC8gcmFkaXVzIG9mIHRoZSBjaXJjbGVcclxuICAgIC8vXHJcbiAgICAvLyAgQyA9IHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZS9jb3JuZXIgdG8gYmUgZGV0ZXJtaW5lZFxyXG5cclxuICAgIHZhciBkMSA9IGdldFNjYWxlZFdpZHRoT2ZMaW5lKHgwLCB5MCwgeDEsIHkxLCBzeCwgc3ksIGRpc3RhbmNlKSxcclxuICAgICAgICBkMiA9IGdldFNjYWxlZFdpZHRoT2ZMaW5lKHgxLCB5MSwgeDIsIHkyLCBzeCwgc3ksIGRpc3RhbmNlKSxcclxuICAgICAgICBhbHBoYUxpbmVzID0gZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCh4MCwgeTAsIHgxLCB5MSwgZDEpLFxyXG4gICAgICAgIGJldGFMaW5lcyA9IGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQoeDEsIHkxLCB4MiwgeTIsIGQyKSxcclxuICAgICAgICBwZXJtdXRhdGlvbnMgPSBwZXJtdXRlTGluZXMoYWxwaGFMaW5lcywgYmV0YUxpbmVzKSxcclxuICAgICAgICBpbnRlcnNlY3Rpb25zID0gcGVybXV0YXRpb25zLm1hcCgocCkgPT4gZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcyhwLmFscGhhLCBwLmJldGEpKSxcclxuICAgICAgICBjZW50ZXIgPSBpbnRlcnNlY3Rpb25zLmZpbHRlcigoaSkgPT4gaXNDZW50ZXJJbkJldHdlZW4oaS54LCBpLnksIHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpKVswXTtcclxuXHJcbiAgICByZXR1cm4gY2VudGVyIHx8IHt4OiBOYU4sIHk6IE5hTn07XHJcbiAgfSxcclxuXHJcbiAgZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhciA9ICh4MSwgeTEsIHgyLCB5MiwgY3gsIGN5KSA9PiB7XHJcbiAgICB2YXIgbSA9ICh5MiAtIHkxKSAvICh4MiAtIHgxKSxcclxuICAgICAgICBjbSA9IC0xIC8gbSxcclxuICAgICAgICBDID0geTEqKHgyIC0geDEpIC0geDEqKHkyIC0geTEpLFxyXG4gICAgICAgIHggPSAoQyAtICh4MiAtIHgxKSooY3kgLSBjbSpjeCkpIC8gKGNtKih4MiAtIHgxKSArIHkxIC0geTIpLFxyXG4gICAgICAgIHkgPSBjbSooeCAtIGN4KSArIGN5O1xyXG4gICAgcmV0dXJuIG0gPT09IDAgLy8gaG9yaXpvbnRhbFxyXG4gICAgICA/IHt4OiBjeCwgeTogeTF9XHJcbiAgICAgIDogKG0gPT09IEluZmluaXR5IC8vIHZlcnRpY2FsXHJcbiAgICAgICAgPyB7eDogeDEsIHk6IGN5fVxyXG4gICAgICAgIDoge3g6IHgsIHk6IHl9KTtcclxuICB9LFxyXG5cclxuICB4eVRvQXJjQW5nbGUgPSAoY3gsIGN5LCB4LCB5KSA9PiB7XHJcbiAgICB2YXIgaG9yaXpvbnRhbFggPSBjeCArIDEsXHJcbiAgICAgICAgaG9yaXpvbnRhbFkgPSBjeSxcclxuICAgICAgICBhID0gTWF0aC5hYnMoZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoeCwgeSwgY3gsIGN5LCBob3Jpem9udGFsWCwgaG9yaXpvbnRhbFkpKTtcclxuICAgIGlmKHkgPCBjeSkge1xyXG4gICAgICAvL3RoaXJkICYgZm9ydGggcXVhZHJhbnRzXHJcbiAgICAgIGEgPSBNYXRoLlBJICsgTWF0aC5QSSAtIGE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYTtcclxuICB9LFxyXG5cclxuICBzY2FsZWRSYWRpdXMgPSAociwgc3gsIHN5LCBhKSA9PiB7XHJcbiAgICB2YXIgbmEgPSBhICUgKDIqUEkpOyAvL25vcm1hbGl6ZWQgYW5nbGVcclxuICAgIGlmIChzeCA9PT0gc3kpIHtcclxuICAgICAgcmV0dXJuIHIgKiBzeDtcclxuICAgIH0gZWxzZSBpZiAoYWxtb3N0RXF1YWwobmEsIDApIHx8IGFsbW9zdEVxdWFsKG5hLCBQSSkpIHtcclxuICAgICAgcmV0dXJuIHIgKiBzeDtcclxuICAgIH0gZWxzZSBpZiAoYWxtb3N0RXF1YWwobmEsIFBJLzIpIHx8IGFsbW9zdEVxdWFsKG5hLCAzKlBJLzIpKSB7XHJcbiAgICAgIHJldHVybiByICogc3k7XHJcbiAgICB9IGVsc2UgaWYgKG5hIDwgMSpQSS8yKSB7XHJcbiAgICAgIHZhciBhYSA9IG5hOyAvL2FkanVzdGVkIGFuZ2xlXHJcbiAgICAgIHJldHVybiByICogKHN4ICogKFBJLzItYWEpLyhQSS8yKSArIHN5ICogKGFhKS8oUEkvMikpO1xyXG4gICAgfSBlbHNlIGlmIChuYSA8IDIqUEkvMikge1xyXG4gICAgICB2YXIgYWEgPSBuYSAtIDEqUEkvMjsgLy9hZGp1c3RlZCBhbmdsZVxyXG4gICAgICByZXR1cm4gciAqIChzeCAqIChhYSkvKFBJLzIpICsgc3kgKiAoUEkvMi1hYSkvKFBJLzIpKTtcclxuICAgIH0gZWxzZSBpZiAobmEgPCAzKlBJLzIpIHtcclxuICAgICAgdmFyIGFhID0gbmEgLSAyKlBJLzI7IC8vYWRqdXN0ZWQgYW5nbGVcclxuICAgICAgcmV0dXJuIHIgKiAoc3ggKiAoUEkvMi1hYSkvKFBJLzIpICsgc3kgKiAoYWEpLyhQSS8yKSk7XHJcbiAgICB9IGVsc2UgaWYgKG5hIDwgNCpQSS8yKSB7XHJcbiAgICAgIHZhciBhYSA9IG5hIC0gMypQSS8yOyAvL2FkanVzdGVkIGFuZ2xlXHJcbiAgICAgIHJldHVybiByICogKHN4ICogKGFhKS8oUEkvMikgKyBzeSAqIChQSS8yLWFhKS8oUEkvMikpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGNvbGxpbmVhciA9ICh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSA9PiB7XHJcbiAgICB2YXIgbTEgPSAoeTEgLSB5MCkgLyAoeDEgLSB4MCksXHJcbiAgICAgICAgbTIgPSAoeTIgLSB5MSkgLyAoeDIgLSB4MSk7XHJcbiAgICByZXR1cm4gYWxtb3N0RXF1YWwobTEsIG0yKTtcclxuICB9LFxyXG5cclxuICBkZWNvbXBvc2VBcmNUbyA9ICh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCByLCBzeCwgc3kpID0+IHtcclxuICAgIHZhciBkZWNvbXBvc2l0aW9uID0ge1xyXG4gICAgICBwb2ludDoge3g6IHgxLCB5OiB5MX1cclxuICAgIH07XHJcbiAgICBpZihjb2xsaW5lYXIoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MikpIHtcclxuICAgICAgZGVjb21wb3NpdGlvbi5saW5lID0ge3gxOiB4MCwgeTE6IHkwLCB4MjogeDEsIHkyOiB5MX07XHJcbiAgICB9IGVsc2UgaWYgKCFpc05hTih4MCkgJiYgIWlzTmFOKHkwKSkge1xyXG4gICAgICB2YXIgY2VudGVyID0gZ2V0VGhlQ2VudGVyT2ZUaGVDb3JuZXIoeDAsIHkwLCB4MSwgeTEsIHgyLCB5Miwgciwgc3gsIHN5KSxcclxuICAgICAgICAgIGZvb3QxID0gZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhcih4MCwgeTAsIHgxLCB5MSwgY2VudGVyLngsIGNlbnRlci55KSxcclxuICAgICAgICAgIGZvb3QyID0gZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhcih4MSwgeTEsIHgyLCB5MiwgY2VudGVyLngsIGNlbnRlci55KSxcclxuICAgICAgICAgIGFuZ2xlRm9vdDEgPSB4eVRvQXJjQW5nbGUoY2VudGVyLngsIGNlbnRlci55LCBmb290MS54LCBmb290MS55KSxcclxuICAgICAgICAgIGFuZ2xlRm9vdDIgPSB4eVRvQXJjQW5nbGUoY2VudGVyLngsIGNlbnRlci55LCBmb290Mi54LCBmb290Mi55KSxcclxuICAgICAgICAgIHNBbmdsZSA9IE1hdGguYWJzKGFuZ2xlRm9vdDIgLSBhbmdsZUZvb3QxKSA8IE1hdGguUEkgPyBhbmdsZUZvb3QyIDogYW5nbGVGb290MSxcclxuICAgICAgICAgIGVBbmdsZSA9IE1hdGguYWJzKGFuZ2xlRm9vdDIgLSBhbmdsZUZvb3QxKSA8IE1hdGguUEkgPyBhbmdsZUZvb3QxIDogYW5nbGVGb290MjtcclxuICAgICAgaWYgKHNBbmdsZSA+IGVBbmdsZSkge1xyXG4gICAgICAgIHZhciB0ZW1wID0gc0FuZ2xlO1xyXG4gICAgICAgIHNBbmdsZSA9IGVBbmdsZTtcclxuICAgICAgICBlQW5nbGUgPSB0ZW1wICsgMipQSTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIWlzTmFOKGNlbnRlci54KSAmJiAhaXNOYU4oY2VudGVyLnkpKSB7XHJcbiAgICAgICAgaWYgKCFhbG1vc3RFcXVhbChnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMoeDAsIHkwLCBmb290MS54LCBmb290MS55KSwgMCkpIHtcclxuICAgICAgICAgIGRlY29tcG9zaXRpb24ubGluZSA9IHt4MTogeDAsIHkxOiB5MCwgeDI6IGZvb3QxLngsIHkyOiBmb290MS55fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVjb21wb3NpdGlvbi5hcmMgPSB7eDogY2VudGVyLngsIHk6IGNlbnRlci55LCByOiByLCBzQW5nbGU6IHNBbmdsZSwgZUFuZ2xlOiBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2U6IGZhbHNlfTtcclxuICAgICAgICBkZWNvbXBvc2l0aW9uLnBvaW50ID0ge3g6IGZvb3QyLngsIHk6IGZvb3QyLnl9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVjb21wb3NpdGlvbjtcclxuICB9LFxyXG5cclxuICByZWxldmFudEFyY1BvaW50cyA9IChjeCwgY3ksIHIsIHNBbmdsZSwgZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlKSA9PiB7XHJcbiAgICB2YXIgcG9pbnRzID0gW10sIHJlbGV2YW50UG9pbnRzID0gW107XHJcbiAgICAgIHBvaW50cy5wdXNoKHt4OiBjeCArIHIqY29zKHNBbmdsZSksIHk6IGN5ICsgcipzaW4oc0FuZ2xlKSwgYTogc0FuZ2xlfSk7XHJcbiAgICAgIHBvaW50cy5wdXNoKHt4OiBjeCArIHIqY29zKGVBbmdsZSksIHk6IGN5ICsgcipzaW4oZUFuZ2xlKSwgYTogZUFuZ2xlfSk7XHJcbiAgICAgIGlmIChjb3VudGVyY2xvY2t3aXNlKSB7XHJcbiAgICAgICAgdmFyIHRlbXAgPSBzQW5nbGU7XHJcbiAgICAgICAgc0FuZ2xlID0gZUFuZ2xlO1xyXG4gICAgICAgIGVBbmdsZSA9IHNBbmdsZSArIDIqUEk7XHJcbiAgICAgIH1cclxuICAgICAgWzEqUEkvMiwgMipQSS8yLCAzKlBJLzIsIDQqUEkvMl0uZm9yRWFjaCgoYSkgPT4ge1xyXG4gICAgICAgIGlmKGVBbmdsZSA+IGEgJiYgYSA+IHNBbmdsZSkge1xyXG4gICAgICAgICAgcG9pbnRzLnB1c2goe3g6IGN4ICsgcipjb3MoYSksIHk6IGN5ICsgcipzaW4oYSksIGE6IGF9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIC8vcmVtb3ZpbmcgdGhlIGR1cGxpY2F0ZWQgcG9pbnRzXHJcbiAgICByZWxldmFudFBvaW50cy5wdXNoKHBvaW50cy5wb3AoKSk7XHJcbiAgICB3aGlsZShwb2ludHMubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgcG9pbnQgPSBwb2ludHMucG9wKCksXHJcbiAgICAgICAgICBmb3VuZCA9IHJlbGV2YW50UG9pbnRzLmZpbmQoKHApID0+IGFsbW9zdEVxdWFsKHBvaW50LngsIHAueCkgJiYgYWxtb3N0RXF1YWwocG9pbnQueSwgcC55KSk7XHJcbiAgICAgIGlmICghZm91bmQpIHtcclxuICAgICAgICByZWxldmFudFBvaW50cy5wdXNoKHBvaW50KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZWxldmFudFBvaW50cztcclxuICB9LFxyXG5cclxuICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI3NTI3MjUvZmluZGluZy13aGV0aGVyLWEtcG9pbnQtbGllcy1pbnNpZGUtYS1yZWN0YW5nbGUtb3Itbm90XHJcbiAgaXNQb2ludEluc2lkZVJlY3RhbmdsZSA9IChwb2ludCwgcmVjdGFuZ2xlKSA9PiB7XHJcbiAgICB2YXIgc2VnbWVudHMgPSBbe1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54ICsgcmVjdGFuZ2xlLndpZHRoLFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnkgfSwge1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54ICsgcmVjdGFuZ2xlLndpZHRoLFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0fSwge1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHQsXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodH0sIHtcclxuICAgICAgeDE6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MTogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueVxyXG4gICAgfV07XHJcblxyXG4gICAgdmFyIGlzSW5zaWRlID0gc2VnbWVudHMubWFwKChzZWdtZW50KSA9PiB7XHJcbiAgICAgIHZhciBBID0gLShzZWdtZW50LnkyIC0gc2VnbWVudC55MSksXHJcbiAgICAgICAgQiA9IHNlZ21lbnQueDIgLSBzZWdtZW50LngxLFxyXG4gICAgICAgIEMgPSAtKEEgKiBzZWdtZW50LngxICsgQiAqIHNlZ21lbnQueTEpLFxyXG4gICAgICAgIEQgPSBBICogcG9pbnQueCArIEIgKiBwb2ludC55ICsgQztcclxuICAgICAgICByZXR1cm4gRDtcclxuICAgIH0pLmV2ZXJ5KChEKSA9PiB7XHJcbiAgICAgIHJldHVybiBEID4gMDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBpc0luc2lkZTtcclxuICB9O1xyXG5cclxuXHJcbiAgdGhpcy5nZXRCQm94ID0gZ2V0QkJveDtcclxuICB0aGlzLnVuaW9uID0gdW5pb247XHJcbiAgdGhpcy50b3RhbFRyYW5zZm9ybSA9IHRvdGFsVHJhbnNmb3JtO1xyXG4gIHRoaXMuZ2V0UmVjdEFyb3VuZExpbmUgPSBnZXRSZWN0QXJvdW5kTGluZTtcclxuICB0aGlzLmdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQgPSBnZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50O1xyXG4gIHRoaXMuZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcyA9IGdldEludGVyc2VjdGlvbk9mVHdvTGluZXM7XHJcbiAgdGhpcy5nZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzO1xyXG4gIHRoaXMuZ2V0VGhlQ2VudGVyT2ZUaGVDb3JuZXIgPSBnZXRUaGVDZW50ZXJPZlRoZUNvcm5lcjtcclxuICB0aGlzLmdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIgPSBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyO1xyXG4gIHRoaXMueHlUb0FyY0FuZ2xlID0geHlUb0FyY0FuZ2xlO1xyXG4gIHRoaXMuc2NhbGVkUmFkaXVzID0gc2NhbGVkUmFkaXVzO1xyXG4gIHRoaXMuZGVjb21wb3NlQXJjVG8gPSBkZWNvbXBvc2VBcmNUbztcclxuICB0aGlzLmlzUG9pbnRJbnNpZGVSZWN0YW5nbGUgPSBpc1BvaW50SW5zaWRlUmVjdGFuZ2xlO1xyXG5cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyeS5qcydcclxuaW1wb3J0IHsgQ3VzdG9tTWF0Y2hlcnMgfSBmcm9tICcuL2N1c3RvbU1hdGNoZXJzLmpzJ1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBSYWJiaXQoZ2VvbWV0cnksIG1hdGNoZXJzKSB7XHJcblxyXG4gIHZhciB0aGF0ID0gdGhpcyxcclxuICAgIGdlb21ldHJ5ID0gZ2VvbWV0cnkgfHwgbmV3IEdlb21ldHJ5KCksXHJcbiAgICBtYXRjaGVycyA9IG1hdGNoZXJzIHx8IG5ldyBDdXN0b21NYXRjaGVycygpO1xyXG5cclxuXHJcbiAgdmFyIGZpbmRBbGxTaGFwZXNJZ25vcmluZ0FyZ3VtZW50cyA9IChzaGFwZSwgd2hlcmUpID0+IHtcclxuICAgIHZhciBmb3VuZCA9IFtdLCBpbmRleCA9IDA7XHJcbiAgICBkbyB7XHJcbiAgICAgIGluZGV4ID0gdGhhdC5maW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyhzaGFwZSwgd2hlcmUsIGluZGV4KTtcclxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgIGZvdW5kLnB1c2god2hlcmUuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2hhcGUubGVuZ3RoKSk7XHJcbiAgICAgICAgaW5kZXggKz0gc2hhcGUubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICB9IHdoaWxlIChpbmRleCAhPT0gLTEgJiYgaW5kZXggPCB3aGVyZS5sZW5ndGgpO1xyXG4gICAgcmV0dXJuIGZvdW5kO1xyXG4gIH0sXHJcblxyXG4gIGZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzID0gKHNoYXBlLCB3aGVyZSwgc3RhcnRJbmRleCkgPT4ge1xyXG4gICAgc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXggfHwgMDtcclxuICAgIHZhciBtYXRjaCA9IGZhbHNlLCBpbmRleCA9IC0xO1xyXG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXg7IGkgPD0gd2hlcmUubGVuZ3RoIC0gc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbWF0Y2ggPSB0cnVlO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNoYXBlLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgaWYgKHdoZXJlW2kgKyBqXS5tZXRob2QgIT09IHNoYXBlW2pdLm1ldGhvZCkge1xyXG4gICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAobWF0Y2ggPT09IHRydWUpIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpbmRleDtcclxuICB9LFxyXG5cclxuICByZW1vdmVTaGFwZXMgPSAoc2hhcGVzLCBmcm9tKSA9PiB7XHJcbiAgICB2YXIgY29weSA9IGZyb20uc2xpY2UoMCwgZnJvbS5sZW5ndGgpO1xyXG4gICAgc2hhcGVzLmZvckVhY2goKHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBpbmRleCA9IC0xO1xyXG4gICAgICBkbyB7XHJcbiAgICAgICAgaW5kZXggPSB0aGF0LmZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzKHNoYXBlLCBjb3B5KTtcclxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICBjb3B5LnNwbGljZShpbmRleCwgc2hhcGUubGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gd2hpbGUgKGluZGV4ICE9PSAtMSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb3B5O1xyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLmdldEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94O1xyXG4gIHRoaXMuY3VzdG9tTWF0Y2hlcnMgPSBtYXRjaGVycztcclxuICB0aGlzLmZpbmRBbGxTaGFwZXNJZ25vcmluZ0FyZ3VtZW50cyA9IGZpbmRBbGxTaGFwZXNJZ25vcmluZ0FyZ3VtZW50cztcclxuICB0aGlzLmZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzID0gZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHM7XHJcbiAgdGhpcy5yZW1vdmVTaGFwZXMgPSByZW1vdmVTaGFwZXM7XHJcblxyXG59XHJcbiJdfQ==
