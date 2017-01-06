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
          scaledArcPoints = flatten(arcAngles.map(function (a) {
        var w = scaledRadius(state.lineWidth, state.transform.scale.x, state.transform.scale.y, a),
            sir = scaledRadius(r, sx, sy, a) - w / 2,
            // inner radius
        sr = scaledRadius(r, sx, sy, a),
            // radius
        sor = scaledRadius(r, sx, sy, a) + w / 2,
            // outer radius
        points = [];
        if (w === 1) {
          points.push({ x: cx + sr * cos(a), y: cy + sr * sin(a) });
        } else {
          points.push({ x: cx + sir * cos(a), y: cy + sir * sin(a) });
          points.push({ x: cx + sor * cos(a), y: cy + sor * sin(a) });
        }
        return points;
      })),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGN1c3RvbU1hdGNoZXJzLmpzIiwic3JjXFxnZW9tZXRyeS5qcyIsInNyY1xccmFiYml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7O1FBS2dCLGMsR0FBQSxjOztBQUhoQjs7QUFHTyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0M7O0FBRXZDLGFBQVcsWUFBWSx3QkFBdkI7O0FBR0EsTUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBTyxxQkFBUCxFQUFpQztBQUNoRCxXQUFPO0FBQ0wsZUFBUyxpQkFBQyxNQUFELEVBQVMsUUFBVCxFQUFzQjtBQUM3QixZQUFJLFFBQVEsS0FBWjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxTQUFTLE1BQVQsR0FBa0IsT0FBTyxNQUE3QyxFQUFxRCxHQUFyRCxFQUEwRDtBQUN4RCxrQkFBUSxPQUFPLE1BQVAsR0FBZ0IsQ0FBeEI7QUFDQSxlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksT0FBTyxNQUEzQixFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxnQkFBSSxTQUFTLElBQUksQ0FBYixFQUFnQixNQUFoQixLQUEyQixPQUFPLENBQVAsRUFBVSxNQUF6QyxFQUFpRDtBQUMvQyxzQkFBUSxLQUFSO0FBQ0E7QUFDRDtBQUNGO0FBQ0QsY0FBSSxVQUFVLElBQWQsRUFBb0I7QUFDbEI7QUFDRDtBQUNGO0FBQ0QsWUFBSSxTQUFTLFFBQVEsRUFBQyxNQUFNLElBQVAsRUFBUixHQUF1QixFQUFDLE1BQU0sS0FBUCxFQUFjLFNBQVMsbUJBQXZCLEVBQXBDO0FBQ0EsZUFBTyxNQUFQO0FBQ0Q7QUFqQkksS0FBUDtBQW1CRCxHQXBCRDtBQUFBLE1Bc0JBLHNCQUFzQixTQUF0QixtQkFBc0IsQ0FBQyxJQUFELEVBQU8scUJBQVAsRUFBaUM7QUFDckQsV0FBTztBQUNMLGVBQVMsaUJB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V0FBTyxJQUFQO0FBQ0QsR0EzQ0Q7O0FBOENBLE9BQUssT0FBTCxHQUFlLFNBQVMsT0FBeEI7QUFDQSxPQUFLLGNBQUwsR0FBc0IsUUFBdEI7QUFDQSxPQUFLLDhCQUFMLEdBQXNDLDhCQUF0QztBQUNBLE9BQUssMEJBQUwsR0FBa0MsMEJBQWxDO0FBQ0EsT0FBSyxZQUFMLEdBQW9CLFlBQXBCO0FBRUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cnkuanMnXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEN1c3RvbU1hdGNoZXJzKGdlb21ldHJ5KSB7XHJcblxyXG4gIGdlb21ldHJ5ID0gZ2VvbWV0cnkgfHwgbmV3IEdlb21ldHJ5KCk7XHJcblxyXG5cclxuICB2YXIgdG9CZVBhcnRPZiA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBleHBlY3RlZC5sZW5ndGggLSBhY3R1YWwubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIG1hdGNoID0gYWN0dWFsLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFjdHVhbC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoZXhwZWN0ZWRbaSArIGpdLm1ldGhvZCAhPT0gYWN0dWFsW2pdLm1ldGhvZCkge1xyXG4gICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChtYXRjaCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG1hdGNoID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGUgbm90IHBhcnQgb2YnfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9CZUluc2lkZVRoZUFyZWFPZiA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIHNtYWxsU2hhcGUgPSBhY3R1YWwsXHJcbiAgICAgICAgICBiaWdTaGFwZSA9IGV4cGVjdGVkLFxyXG4gICAgICAgICAgYmlnU2hhcGVCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChiaWdTaGFwZSksXHJcbiAgICAgICAgICBzbWFsbFNoYXBlQkJveCA9IGdlb21ldHJ5LmdldEJCb3goc21hbGxTaGFwZSksXHJcbiAgICAgICAgICBjZW50ZXIgPSB7eDogc21hbGxTaGFwZUJCb3gueCArIHNtYWxsU2hhcGVCQm94LndpZHRoIC8gMiwgeTogc21hbGxTaGFwZUJCb3gueSArIHNtYWxsU2hhcGVCQm94LmhlaWdodCAvIDJ9LFxyXG4gICAgICAgICAgaXNDZW50ZXJJbnNpZGUgPSBnZW9tZXRyeS5pc1BvaW50SW5zaWRlUmVjdGFuZ2xlKGNlbnRlciwgYmlnU2hhcGVCQm94KSxcclxuICAgICAgICAgIHJlc3VsdCA9IGlzQ2VudGVySW5zaWRlID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGUgaXMgbm90IGluc2lkZSB0aGUgYXJlYSBvZid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgYWN0dWFsQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYWN0dWFsKSxcclxuICAgICAgICAgIGV4cGVjdGVkQkJveCA9IGdlb21ldHJ5LmdldEJCb3goZXhwZWN0ZWQpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVQb3NpdGlvbiA9IGFjdHVhbEJCb3gueCA9PT0gZXhwZWN0ZWRCQm94LnggJiYgYWN0dWFsQkJveC55ID09PSBleHBlY3RlZEJCb3gueSxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lUG9zaXRpb24gPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZXMgZG9uYHQgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0hhdmVUaGVTYW1lU2l6ZVdpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZVNpemUgPSBhY3R1YWxCQm94LndpZHRoID09PSBleHBlY3RlZEJCb3gud2lkdGggJiYgYWN0dWFsQkJveC5oZWlnaHQgPT09IGV4cGVjdGVkQkJveC5oZWlnaHQsXHJcbiAgICAgICAgICByZXN1bHQgPSBoYXZlVGhlU2FtZVNpemUgPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZXMgZG9uYHQgaGF2ZSB0aGUgc2FtZSBzaXplJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZUFsaWdubWVudCA9IGFjdHVhbEJCb3gueSA9PT0gZXhwZWN0ZWRCQm94LnksXHJcbiAgICAgICAgICByZXN1bHQgPSBoYXZlVGhlU2FtZUFsaWdubWVudCA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIGhvcml6b250YWwgcG9zaXRpb24nfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9CZVZlcnRpY2FsbHlBbGlnbldpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZUFsaWdubWVudCA9IGFjdHVhbEJCb3gueCA9PT0gZXhwZWN0ZWRCQm94LngsXHJcbiAgICAgICAgICByZXN1bHQgPSBoYXZlVGhlU2FtZUFsaWdubWVudCA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIHZlcnRpY2FsIHBvc2l0aW9uJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLnRvQmVQYXJ0T2YgPSB0b0JlUGFydE9mO1xyXG4gIHRoaXMudG9CZUluc2lkZVRoZUFyZWFPZiA9IHRvQmVJbnNpZGVUaGVBcmVhT2Y7XHJcbiAgdGhpcy50b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoID0gdG9IYXZlVGhlU2FtZVBvc2l0aW9uV2l0aDtcclxuICB0aGlzLnRvSGF2ZVRoZVNhbWVTaXplV2l0aCA9IHRvSGF2ZVRoZVNhbWVTaXplV2l0aDtcclxuICB0aGlzLnRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGggPSB0b0JlSG9yaXpvbnRhbGx5QWxpZ25XaXRoO1xyXG4gIHRoaXMudG9CZVZlcnRpY2FsbHlBbGlnbldpdGggPSB0b0JlVmVydGljYWxseUFsaWduV2l0aDtcclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gR2VvbWV0cnkoKSB7XHJcblxyXG4gIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgRVBTSUxPTiA9IE51bWJlci5FUFNJTE9OIHx8IDIuMjIwNDQ2MDQ5MjUwMzEzZS0xNixcclxuICAgICAgUEkgPSBNYXRoLlBJLFxyXG4gICAgICBzaW4gPSBNYXRoLnNpbixcclxuICAgICAgY29zID0gTWF0aC5jb3M7XHJcblxyXG5cclxuICB2YXIgY3JlYXRlTmV3Q2FudmFzQ2FsbFN0YXRlID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYm94OiB7eDogTmFOLCB5OiBOYU4sIHdpZHRoOiBOYU4sIGhlaWdodDogTmFOfSxcclxuICAgICAgdHJhbnNmb3JtczogW1tdXSxcclxuICAgICAgc2hhcGVzSW5QYXRoOiBbXSxcclxuICAgICAgbW92ZVRvTG9jYXRpb246IHt4OiBOYU4sIHk6IE5hTn0sXHJcbiAgICAgIGxpbmVXaWR0aHM6IFsxXVxyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBwYXRoRmlsbFNoYXBlSGFuZGxlcnMgPSB7XHJcbiAgICByZWN0OiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gc2hhcGUueCxcclxuICAgICAgICB5ID0gc2hhcGUueSxcclxuICAgICAgICB3aWR0aCA9IHNoYXBlLndpZHRoLFxyXG4gICAgICAgIGhlaWdodCA9IHNoYXBlLmhlaWdodCxcclxuICAgICAgICBuZXdCb3ggPSB7eDogeCwgeTogeSwgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyYzogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgY3ggPSBzaGFwZS5jeCxcclxuICAgICAgICAgIGN5ID0gc2hhcGUuY3ksXHJcbiAgICAgICAgICByID0gc2hhcGUucixcclxuICAgICAgICAgIHN4ID0gc2hhcGUuc3gsXHJcbiAgICAgICAgICBzeSA9IHNoYXBlLnN5LFxyXG4gICAgICAgICAgc0FuZ2xlID0gc2hhcGUuc0FuZ2xlLFxyXG4gICAgICAgICAgZUFuZ2xlID0gc2hhcGUuZUFuZ2xlLFxyXG4gICAgICAgICAgY291bnRlcmNsb2Nrd2lzZSA9IHNoYXBlLmNvdW50ZXJjbG9ja3dpc2UsXHJcbiAgICAgICAgICBhcmNQb2ludHMgPSByZWxldmFudEFyY1BvaW50cyhjeCwgY3ksIHIsIHNBbmdsZSwgZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlKSxcclxuICAgICAgICAgIGFyY0FuZ2xlcyA9IGFyY1BvaW50cy5tYXAoKHApID0+IHAuYSksXHJcbiAgICAgICAgICBzY2FsZWRBcmNQb2ludHMgPSBhcmNBbmdsZXMubWFwKChhKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBzciA9IHNjYWxlZFJhZGl1cyhyLCBzeCwgc3ksIGEpO1xyXG4gICAgICAgICAgICByZXR1cm4ge3g6IGN4ICsgc3IqY29zKGEpLCB5OiBjeSArIHNyKnNpbihhKX07XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICAgIG5ld0JveCA9IGJveFBvaW50cyhzY2FsZWRBcmNQb2ludHMpO1xyXG4gICAgICBpZiAoIWlzTmFOKGN4KSAmJiAhaXNOYU4oY3kpICYmIGFyY1BvaW50cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBwYXRoU3Ryb2tlU2hhcGVIYW5kbGVycyA9IHtcclxuICAgIHJlY3Q6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIHggPSBzaGFwZS54LFxyXG4gICAgICAgIHkgPSBzaGFwZS55LFxyXG4gICAgICAgIHdpZHRoID0gc2hhcGUud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0ID0gc2hhcGUuaGVpZ2h0LFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IHN0YXRlLmxpbmVXaWR0aCAhPT0gMSA/IHN0YXRlLmxpbmVXaWR0aCA6IDAsXHJcbiAgICAgICAgeFNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIHlTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBuZXdCb3ggPSB7eDogeCAtIHhTY2FsZWRMaW5lV2lkdGggIC8gMiwgeTogeSAtIHlTY2FsZWRMaW5lV2lkdGggLyAyLCB3aWR0aDogd2lkdGggKyB4U2NhbGVkTGluZVdpZHRoLCBoZWlnaHQ6IGhlaWdodCArIHlTY2FsZWRMaW5lV2lkdGh9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmM6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIGN4ID0gc2hhcGUuY3gsXHJcbiAgICAgICAgICBjeSA9IHNoYXBlLmN5LFxyXG4gICAgICAgICAgciA9IHNoYXBlLnIsXHJcbiAgICAgICAgICBzeCA9IHNoYXBlLnN4LFxyXG4gICAgICAgICAgc3kgPSBzaGFwZS5zeSxcclxuICAgICAgICAgIHNBbmdsZSA9IHNoYXBlLnNBbmdsZSxcclxuICAgICAgICAgIGVBbmdsZSA9IHNoYXBlLmVBbmdsZSxcclxuICAgICAgICAgIGNvdW50ZXJjbG9ja3dpc2UgPSBzaGFwZS5jb3VudGVyY2xvY2t3aXNlLFxyXG4gICAgICAgICAgYXJjUG9pbnRzID0gcmVsZXZhbnRBcmNQb2ludHMoY3gsIGN5LCByLCBzQW5nbGUsIGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZSksXHJcbiAgICAgICAgICBhcmNBbmdsZXMgPSBhcmNQb2ludHMubWFwKChwKSA9PiBwLmEpLFxyXG4gICAgICAgICAgc2NhbGVkQXJjUG9pbnRzID0gZmxhdHRlbihhcmNBbmdsZXMubWFwKChhKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciB3ID0gc2NhbGVkUmFkaXVzKHN0YXRlLmxpbmVXaWR0aCwgc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LCBhKSxcclxuICAgICAgICAgICAgICAgIHNpciA9IHNjYWxlZFJhZGl1cyhyLCBzeCwgc3ksIGEpIC0gdy8yLCAvLyBpbm5lciByYWRpdXNcclxuICAgICAgICAgICAgICAgIHNyID0gc2NhbGVkUmFkaXVzKHIsIHN4LCBzeSwgYSksICAgIC8vIHJhZGl1c1xyXG4gICAgICAgICAgICAgICAgc29yID0gc2NhbGVkUmFkaXVzKHIsIHN4LCBzeSwgYSkgKyB3LzIsIC8vIG91dGVyIHJhZGl1c1xyXG4gICAgICAgICAgICAgICAgcG9pbnRzID0gW107XHJcbiAgICAgICAgICAgIGlmICh3ID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgcG9pbnRzLnB1c2goe3g6IGN4ICsgc3IqY29zKGEpLCB5OiBjeSArIHNyKnNpbihhKX0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBvaW50cy5wdXNoKHt4OiBjeCArIHNpcipjb3MoYSksIHk6IGN5ICsgc2lyKnNpbihhKX0pO1xyXG4gICAgICAgICAgICAgIHBvaW50cy5wdXNoKHt4OiBjeCArIHNvcipjb3MoYSksIHk6IGN5ICsgc29yKnNpbihhKX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwb2ludHM7XHJcbiAgICAgICAgICB9KSksXHJcbiAgICAgICAgICBuZXdCb3ggPSBib3hQb2ludHMoc2NhbGVkQXJjUG9pbnRzKTtcclxuICAgICAgaWYgKCFpc05hTihjeCkgJiYgIWlzTmFOKGN5KSAmJiBhcmNQb2ludHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgbGluZVRvOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciB4MSA9IHNoYXBlLngxLFxyXG4gICAgICAgIHkxID0gc2hhcGUueTEsXHJcbiAgICAgICAgeDIgPSBzaGFwZS54MixcclxuICAgICAgICB5MiA9IHNoYXBlLnkyLFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IGdldFNjYWxlZFdpZHRoT2ZMaW5lKHgxLCB5MSwgeDIsIHkyLCBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCwgc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksIHN0YXRlLmxpbmVXaWR0aCksXHJcbiAgICAgICAgcmVjdCA9IGdldFJlY3RBcm91bmRMaW5lKHgxLCB5MSwgeDIsIHkyLCBzY2FsZWRMaW5lV2lkdGggIT09IDEgPyBzY2FsZWRMaW5lV2lkdGggOiAwKSxcclxuICAgICAgICBuZXdCb3ggPSB7XHJcbiAgICAgICAgICB4OiBNYXRoLm1pbihyZWN0LngxLCByZWN0LngyLCByZWN0LngzLCByZWN0Lng0KSxcclxuICAgICAgICAgIHk6IE1hdGgubWluKHJlY3QueTEsIHJlY3QueTIsIHJlY3QueTMsIHJlY3QueTQpLFxyXG4gICAgICAgICAgd2lkdGg6IE1hdGgubWF4KHJlY3QueDEsIHJlY3QueDIsIHJlY3QueDMsIHJlY3QueDQpIC0gTWF0aC5taW4ocmVjdC54MSwgcmVjdC54MiwgcmVjdC54MywgcmVjdC54NCksXHJcbiAgICAgICAgICBoZWlnaHQ6IE1hdGgubWF4KHJlY3QueTEsIHJlY3QueTIsIHJlY3QueTMsIHJlY3QueTQpIC0gTWF0aC5taW4ocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NClcclxuICAgICAgICB9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBjYW52YXNDYWxsSGFuZGxlcnMgPSB7XHJcbiAgICBsaW5lV2lkdGg6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS5saW5lV2lkdGhzW3N0YXRlLmxpbmVXaWR0aHMubGVuZ3RoIC0gMV0gPSBjYWxsLnZhbDtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGZpbGxSZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc3Ryb2tlUmVjdDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICB3aWR0aCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgaGVpZ2h0ID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIHhTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICB5U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHggLSB4U2NhbGVkTGluZVdpZHRoIC8gMiwgeTogeSAtIHlTY2FsZWRMaW5lV2lkdGggLyAyLCB3aWR0aDogd2lkdGggKyB4U2NhbGVkTGluZVdpZHRoLCBoZWlnaHQ6IGhlaWdodCArIHlTY2FsZWRMaW5lV2lkdGh9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICByZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55O1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ3JlY3QnLCB4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmM6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgY3ggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIGN5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICByID0gY2FsbC5hcmd1bWVudHNbMl0sXHJcbiAgICAgICAgc3ggPSBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBzeSA9IHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIHNBbmdsZSA9IGNhbGwuYXJndW1lbnRzWzNdLFxyXG4gICAgICAgIGVBbmdsZSA9IGNhbGwuYXJndW1lbnRzWzRdLFxyXG4gICAgICAgIGNvdW50ZXJjbG9ja3dpc2UgPSBjYWxsLmFyZ3VtZW50c1s1XSB8fCBmYWxzZTtcclxuICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdhcmMnLCBjeDogY3gsIGN5OiBjeSwgcjogciwgc3g6IHN4LCBzeTogc3ksIHNBbmdsZTogc0FuZ2xlLCBlQW5nbGU6IGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZTogY291bnRlcmNsb2Nrd2lzZX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgbW92ZVRvOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHgxID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5MSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnk7XHJcbiAgICAgIHN0YXRlLm1vdmVUb0xvY2F0aW9uID0ge3g6IHgxLCB5OiB5MX07XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBsaW5lVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi54LFxyXG4gICAgICAgIHkxID0gc3RhdGUubW92ZVRvTG9jYXRpb24ueSxcclxuICAgICAgICB4MiA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeTIgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55O1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2xpbmVUbycsIHgxOiB4MSwgeTE6IHkxLCB4MjogeDIsIHkyOiB5Mn0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDAgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi54LFxyXG4gICAgICAgICAgeTAgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi55LFxyXG4gICAgICAgICAgeDEgPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgICAgeTEgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgICAgeDIgPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgICAgeTIgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgICAgciA9IGNhbGwuYXJndW1lbnRzWzRdLFxyXG4gICAgICAgICAgc3ggPSBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICAgIHN5ID0gc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgICBkZWNvbXBvc2l0aW9uID0gZGVjb21wb3NlQXJjVG8oeDAsIHkwLCB4MSwgeTEsIHgyLCB5Miwgciwgc3gsIHN5KTtcclxuICAgICAgaWYgKGRlY29tcG9zaXRpb24ubGluZSkge1xyXG4gICAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnbGluZVRvJywgeDE6IGRlY29tcG9zaXRpb24ubGluZS54MSwgeTE6IGRlY29tcG9zaXRpb24ubGluZS55MSwgeDI6IGRlY29tcG9zaXRpb24ubGluZS54MiwgeTI6IGRlY29tcG9zaXRpb24ubGluZS55Mn0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChkZWNvbXBvc2l0aW9uLmFyYykge1xyXG4gICAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnYXJjJywgY3g6IGRlY29tcG9zaXRpb24uYXJjLngsIGN5OiBkZWNvbXBvc2l0aW9uLmFyYy55LCByOiByLCBzeDogc3gsIHN5OiBzeSwgc0FuZ2xlOiBkZWNvbXBvc2l0aW9uLmFyYy5zQW5nbGUsIGVBbmdsZTogZGVjb21wb3NpdGlvbi5hcmMuZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlOiBkZWNvbXBvc2l0aW9uLmFyYy5jb3VudGVyY2xvY2t3aXNlfSk7XHJcbiAgICAgIH1cclxuICAgICAgc3RhdGUubW92ZVRvTG9jYXRpb24gPSB7eDogZGVjb21wb3NpdGlvbi5wb2ludC54LCB5OiBkZWNvbXBvc2l0aW9uLnBvaW50Lnl9O1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc2F2ZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLnRyYW5zZm9ybXMucHVzaChbXSk7XHJcbiAgICAgIHN0YXRlLmxpbmVXaWR0aHMucHVzaChsYXN0RWxlbWVudChzdGF0ZS5saW5lV2lkdGhzKSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICByZXN0b3JlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUudHJhbnNmb3Jtcy5wb3AoKTtcclxuICAgICAgc3RhdGUubGluZVdpZHRocy5wb3AoKTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHRyYW5zbGF0ZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIGxhc3RFbGVtZW50KHN0YXRlLnRyYW5zZm9ybXMpXHJcbiAgICAgICAgLnB1c2goe3RyYW5zbGF0ZToge3g6IGNhbGwuYXJndW1lbnRzWzBdLCB5OiBjYWxsLmFyZ3VtZW50c1sxXX19KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHNjYWxlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgbGFzdEVsZW1lbnQoc3RhdGUudHJhbnNmb3JtcylcclxuICAgICAgICAucHVzaCh7c2NhbGU6IHt4OiBjYWxsLmFyZ3VtZW50c1swXSwgeTogY2FsbC5hcmd1bWVudHNbMV19fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBiZWdpblBhdGg6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGggPSBbXTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGZpbGw6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICByZXR1cm4gc3RhdGUuc2hhcGVzSW5QYXRoLnJlZHVjZSgoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIgPSBnZXRQYXRoRmlsbFNoYXBlSGFuZGxlcihzaGFwZSk7XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZXIoc3RhdGUsIHNoYXBlKTtcclxuICAgICAgfSwgc3RhdGUpO1xyXG4gICAgfSxcclxuICAgIHN0cm9rZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdGF0ZS5zaGFwZXNJblBhdGgubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgc2hhcGUgPSBzdGF0ZS5zaGFwZXNJblBhdGhbaV0sXHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSBnZXRQYXRoU3Ryb2tlU2hhcGVIYW5kbGVyKHNoYXBlKTtcclxuICAgICAgICBzdGF0ZSA9IGhhbmRsZXIoc3RhdGUsIHNoYXBlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgbnVsbENhbnZhc0NhbGxIYW5kbGVyID0gKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbiAgfSxcclxuXHJcbiAgZ2V0Q2FudmFzQ2FsbEhhbmRsZXIgPSAoY2FsbCkgPT4ge1xyXG4gICAgcmV0dXJuIGNhbnZhc0NhbGxIYW5kbGVyc1tjYWxsLm1ldGhvZF0gfHwgY2FudmFzQ2FsbEhhbmRsZXJzW2NhbGwuYXR0cl0gfHwgbnVsbENhbnZhc0NhbGxIYW5kbGVyO1xyXG4gIH0sXHJcblxyXG4gIGdldFBhdGhGaWxsU2hhcGVIYW5kbGVyID0gKHNoYXBlKSA9PiB7XHJcbiAgICByZXR1cm4gcGF0aEZpbGxTaGFwZUhhbmRsZXJzW3NoYXBlLnR5cGVdO1xyXG4gIH0sXHJcblxyXG4gIGdldFBhdGhTdHJva2VTaGFwZUhhbmRsZXIgPSAoc2hhcGUpID0+IHtcclxuICAgIHJldHVybiBwYXRoU3Ryb2tlU2hhcGVIYW5kbGVyc1tzaGFwZS50eXBlXTtcclxuICB9LFxyXG5cclxuICBwcmVDYW52YXNDYWxsSGFuZGxlciA9IChzdGF0ZSkgPT4ge1xyXG4gICAgc3RhdGUudHJhbnNmb3JtID0gdG90YWxUcmFuc2Zvcm0oZmxhdHRlbihzdGF0ZS50cmFuc2Zvcm1zKSk7XHJcbiAgICBzdGF0ZS5saW5lV2lkdGggPSBsYXN0RWxlbWVudChzdGF0ZS5saW5lV2lkdGhzKTtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9LFxyXG5cclxuICBnZXRCQm94ID0gKHNoYXBlKSA9PiB7XHJcbiAgICB2YXIgc3RhdGUgPSBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUoKTtcclxuICAgIHN0YXRlID0gc2hhcGUucmVkdWNlKChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgaGFuZGxlciA9IGdldENhbnZhc0NhbGxIYW5kbGVyKGNhbGwpO1xyXG4gICAgICByZXR1cm4gaGFuZGxlcihwcmVDYW52YXNDYWxsSGFuZGxlcihzdGF0ZSksIGNhbGwpO1xyXG4gICAgfSwgY3JlYXRlTmV3Q2FudmFzQ2FsbFN0YXRlKCkpO1xyXG4gICAgcmV0dXJuIHN0YXRlLmJveDtcclxuICB9LFxyXG5cclxuICBmbGF0dGVuID0gKGFycmF5KSA9PiB7XHJcbiAgICByZXR1cm4gYXJyYXlcclxuICAgICAgLnJlZHVjZSgocHJldmlvdXNBcnJheSwgY3VycmVudEFycmF5KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHByZXZpb3VzQXJyYXkuY29uY2F0KGN1cnJlbnRBcnJheSk7XHJcbiAgICAgIH0sIFtdKTtcclxuICB9LFxyXG5cclxuICBsYXN0RWxlbWVudCA9IChhcnJheSkgPT4ge1xyXG4gICAgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xyXG4gIH0sXHJcblxyXG4gIGZpcnN0VHJ1dGh5T3JaZXJvID0gKHZhbDEsIHZhbDIpID0+e1xyXG4gICAgaWYgKHZhbDEgfHwgdmFsMSA9PT0gMCkge1xyXG4gICAgICByZXR1cm4gdmFsMTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWwyO1xyXG4gIH0sXHJcblxyXG4gIHVuaW9uID0gKGJveDEsIGJveDIpID0+IHtcclxuICAgIGJveDEgPSB7XHJcbiAgICAgIHg6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDEueCwgYm94Mi54KSxcclxuICAgICAgeTogZmlyc3RUcnV0aHlPclplcm8oYm94MS55LCBib3gyLnkpLFxyXG4gICAgICB3aWR0aDogZmlyc3RUcnV0aHlPclplcm8oYm94MS53aWR0aCwgYm94Mi53aWR0aCksXHJcbiAgICAgIGhlaWdodDogZmlyc3RUcnV0aHlPclplcm8oYm94MS5oZWlnaHQsIGJveDIuaGVpZ2h0KVxyXG4gICAgfTtcclxuICAgIGJveDIgPSB7XHJcbiAgICAgIHg6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDIueCwgYm94MS54KSxcclxuICAgICAgeTogZmlyc3RUcnV0aHlPclplcm8oYm94Mi55LCBib3gxLnkpLFxyXG4gICAgICB3aWR0aDogZmlyc3RUcnV0aHlPclplcm8oYm94Mi53aWR0aCwgYm94MS53aWR0aCksXHJcbiAgICAgIGhlaWdodDogZmlyc3RUcnV0aHlPclplcm8oYm94Mi5oZWlnaHQsIGJveDEuaGVpZ2h0KVxyXG4gICAgfTtcclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgIHg6IE1hdGgubWluKGJveDEueCwgYm94Mi54KSxcclxuICAgICAgeTogTWF0aC5taW4oYm94MS55LCBib3gyLnkpLFxyXG4gICAgICB3aWR0aDogTWF0aC5tYXgoYm94MS53aWR0aCwgYm94Mi53aWR0aCwgYm94MS54IDwgYm94Mi54XHJcbiAgICAgICAgPyBib3gxLndpZHRoICsgYm94Mi53aWR0aCArIChib3gyLnggLSAoYm94MS54ICsgYm94MS53aWR0aCkpXHJcbiAgICAgICAgOiBib3gxLndpZHRoICsgYm94Mi53aWR0aCArIChib3gxLnggLSAoYm94Mi54ICsgYm94Mi53aWR0aCkpKSxcclxuICAgICAgaGVpZ2h0OiBNYXRoLm1heChib3gxLmhlaWdodCwgYm94Mi5oZWlnaHQsIGJveDEueSA8IGJveDIueVxyXG4gICAgICAgID8gYm94MS5oZWlnaHQgKyBib3gyLmhlaWdodCArIChib3gyLnkgLSAoYm94MS55ICsgYm94MS5oZWlnaHQpKVxyXG4gICAgICAgIDogYm94MS5oZWlnaHQgKyBib3gyLmhlaWdodCArIChib3gxLnkgLSAoYm94Mi55ICsgYm94Mi5oZWlnaHQpKSlcclxuICAgIH07XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sXHJcblxyXG4gIGJveFBvaW50cyA9IChwb2ludHMpID0+IHtcclxuICAgIHZhciB4ZXMgPSBwb2ludHMubWFwKChwKSA9PiBwLngpLFxyXG4gICAgICAgIHllcyA9IHBvaW50cy5tYXAoKHApID0+IHAueSksXHJcbiAgICAgICAgbWluWCA9IE1hdGgubWluLmFwcGx5KG51bGwsIHhlcyksXHJcbiAgICAgICAgbWF4WCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIHhlcyksXHJcbiAgICAgICAgbWluWSA9IE1hdGgubWluLmFwcGx5KG51bGwsIHllcyksXHJcbiAgICAgICAgbWF4WSA9IE1hdGgubWF4LmFwcGx5KG51bGwsIHllcyksXHJcbiAgICAgICAgYm94ID0ge3g6IE5hTiwgeTogTmFOLCB3aWR0aDogTmFOLCBoZWlnaHQ6IE5hTn07XHJcbiAgICBpZiAobWluWCAhPT0gK0luZmluaXR5ICYmIG1heFggIT09IC1JbmZpbml0eSAmJiBtaW5ZICE9PSArSW5maW5pdHkgJiYgbWF4WSAhPT0gLUluZmluaXR5KSB7XHJcbiAgICAgIGJveCA9IHtcclxuICAgICAgICB4OiBtaW5YLFxyXG4gICAgICAgIHk6IG1pblksXHJcbiAgICAgICAgd2lkdGg6IG1heFggLSBtaW5YLFxyXG4gICAgICAgIGhlaWdodDogbWF4WSAtIG1pbllcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIHJldHVybiBib3g7XHJcbiAgfSxcclxuXHJcbiAgdG90YWxUcmFuc2Zvcm0gPSAodHJhbnNmb3JtcykgPT4ge1xyXG4gICAgcmV0dXJuIHRyYW5zZm9ybXNcclxuICAgICAgLm1hcCgodmFsdWUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHJhbnNsYXRlOiB2YWx1ZS50cmFuc2xhdGUgfHwge3g6IDAsIHk6IDB9LFxyXG4gICAgICAgICAgc2NhbGU6IHZhbHVlLnNjYWxlIHx8IHt4OiAxLCB5OiAxfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pXHJcbiAgICAgIC5yZWR1Y2UoKHByZXZpb3VzVmFsdWUsIGN1cnJlbnRWYWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0cmFuc2xhdGU6IHtcclxuICAgICAgICAgICAgeDogcHJldmlvdXNWYWx1ZS50cmFuc2xhdGUueCArIGN1cnJlbnRWYWx1ZS50cmFuc2xhdGUueCAqIHByZXZpb3VzVmFsdWUuc2NhbGUueCxcclxuICAgICAgICAgICAgeTogcHJldmlvdXNWYWx1ZS50cmFuc2xhdGUueSArIGN1cnJlbnRWYWx1ZS50cmFuc2xhdGUueSAqIHByZXZpb3VzVmFsdWUuc2NhbGUueVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNjYWxlOiB7XHJcbiAgICAgICAgICAgIHg6IHByZXZpb3VzVmFsdWUuc2NhbGUueCAqIGN1cnJlbnRWYWx1ZS5zY2FsZS54LFxyXG4gICAgICAgICAgICB5OiBwcmV2aW91c1ZhbHVlLnNjYWxlLnkgKiBjdXJyZW50VmFsdWUuc2NhbGUueVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sIHt0cmFuc2xhdGU6IHt4OiAwLCB5OiAwfSwgc2NhbGU6IHt4OiAxLCB5OiAxfX0pO1xyXG4gIH0sXHJcblxyXG4gIGdldFJlY3RBcm91bmRMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCB3aWR0aCkgPT4ge1xyXG4gICAgdmFyIHJlY3Q7XHJcbiAgICBpZiAoeDEgPT09IHkxICYmIHgxID09PSB4MiAmJiB4MSA9PT0geTIpIHtcclxuICAgICAgcmVjdCA9IHtcclxuICAgICAgICB4MTogeDEsIHkxOiB4MSwgIHgyOiB4MSwgeTI6IHgxLFxyXG4gICAgICAgIHg0OiB4MSwgeTQ6IHgxLCAgeDM6IHgxLCB5MzogeDFcclxuICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlY3QgPSBnZXRSZWN0QXJvdW5kTG9uZ0xpbmUoeDEsIHkxLCB4MiwgeTIsIHdpZHRoKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZWN0O1xyXG4gIH0sXHJcblxyXG4gIGdldFJlY3RBcm91bmRMb25nTGluZSA9ICh4MSwgeTEsIHgyLCB5Miwgd2lkdGgpID0+IHtcclxuICAgIC8vICByID0gdGhlIHJhZGl1cyBvciB0aGUgZ2l2ZW4gZGlzdGFuY2UgZnJvbSBhIGdpdmVuIHBvaW50IHRvIHRoZSBuZWFyZXN0IGNvcm5lcnMgb2YgdGhlIHJlY3RcclxuICAgIC8vICBhID0gdGhlIGFuZ2xlIGJldHdlZW4gdGhlIGxpbmUgYW5kIHRoZSBob3Jpem9udGFsIGF4aXNcclxuICAgIC8vICBiMSwgYjIgPSB0aGUgYW5nbGUgYmV0d2VlbiBoYWxmIHRoZSBoaWdodCBvZiB0aGUgcmVjdGFuZ2xlIGFuZCB0aGUgaG9yaXpvbnRhbCBheGlzXHJcbiAgICAvL1xyXG4gICAgLy8gIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSB0aGUgZ2l2ZW4gbGluZSBpcyBob3Jpem9udGFsLCBzbyBhID0gMC5cclxuICAgIC8vICBUaGUgZ2l2ZW4gbGluZSBpcyBiZXR3ZWVuIHRoZSB0d28gQCBzeW1ib2xzLlxyXG4gICAgLy8gIFRoZSArIHN5bWJvbHMgYXJlIHRoZSBjb3JuZXJzIG9mIHJlY3RhbmdsZSB0byBiZSBkZXRlcm1pbmVkLlxyXG4gICAgLy8gIEluIG9yZGVyIHRvIGZpbmQgdGhlIGIxIGFuZCBiMiBhbmdsZXMgd2UgaGF2ZSB0byBhZGQgUEkvMiBhbmQgcmVzcGVjdGl2bHkgc3VidHJhY3QgUEkvMi5cclxuICAgIC8vICBiMSBpcyB2ZXJ0aWNhbCBhbmQgcG9pbnRpbmcgdXB3b3JkcyBhbmQgYjIgaXMgYWxzbyB2ZXJ0aWNhbCBidXQgcG9pbnRpbmcgZG93bndvcmRzLlxyXG4gICAgLy8gIEVhY2ggY29ybmVyIGlzIHIgb3Igd2lkdGggLyAyIGZhciBhd2F5IGZyb20gaXRzIGNvcmVzcG9uZGVudCBsaW5lIGVuZGluZy5cclxuICAgIC8vICBTbyB3ZSBrbm93IHRoZSBkaXN0YW5jZSAociksIHRoZSBzdGFydGluZyBwb2ludHMgKHgxLCB5MSkgYW5kICh4MiwgeTIpIGFuZCB0aGUgKGIxLCBiMikgZGlyZWN0aW9ucy5cclxuICAgIC8vXHJcbiAgICAvLyAgKHgxLHkxKSAgICAgICAgICAgICAgICAgICAgKHgyLHkyKVxyXG4gICAgLy8gICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xyXG4gICAgLy8gICAgICBeICAgICAgICAgICAgICAgICAgICAgICAgXlxyXG4gICAgLy8gICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gICAgLy8gICAgICB8IGIxICAgICAgICAgICAgICAgICAgICAgfCBiMVxyXG4gICAgLy8gICAgICBAPT09PT09PT09PT09PT09PT09PT09PT09QFxyXG4gICAgLy8gICAgICB8IGIyICAgICAgICAgICAgICAgICAgICAgfCBiMlxyXG4gICAgLy8gICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gICAgLy8gICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgdlxyXG4gICAgLy8gICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xyXG4gICAgLy8gICh4NCx5NCkgICAgICAgICAgICAgICAgICAgICh4Myx5MylcclxuICAgIC8vXHJcblxyXG4gICAgdmFyIHIgPSB3aWR0aCAvIDIsXHJcbiAgICAgIGEgPSBNYXRoLmF0YW4oKHkyIC0geTEpIC8gKHgyIC0geDEpKSxcclxuICAgICAgYjEgPSBhICsgTWF0aC5QSS8yLFxyXG4gICAgICBiMiA9IGEgLSBNYXRoLlBJLzIsXHJcbiAgICAgIHJ4MSA9IHIgKiBNYXRoLmNvcyhiMSkgKyB4MSxcclxuICAgICAgcnkxID0gciAqIE1hdGguc2luKGIxKSArIHkxLFxyXG4gICAgICByeDIgPSByICogTWF0aC5jb3MoYjEpICsgeDIsXHJcbiAgICAgIHJ5MiA9IHIgKiBNYXRoLnNpbihiMSkgKyB5MixcclxuICAgICAgcngzID0gciAqIE1hdGguY29zKGIyKSArIHgyLFxyXG4gICAgICByeTMgPSByICogTWF0aC5zaW4oYjIpICsgeTIsXHJcbiAgICAgIHJ4NCA9IHIgKiBNYXRoLmNvcyhiMikgKyB4MSxcclxuICAgICAgcnk0ID0gciAqIE1hdGguc2luKGIyKSArIHkxO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDE6IHJ4MSwgeTE6IHJ5MSwgIHgyOiByeDIsIHkyOiByeTIsXHJcbiAgICAgIHg0OiByeDQsIHk0OiByeTQsICB4MzogcngzLCB5MzogcnkzXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIGdldFNjYWxlZFdpZHRoT2ZMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCBzeCwgc3ksIHdpZHRoKSA9PiB7XHJcbiAgICAvLyAgVGhlIG9yaWdpbmFsIHBvaW50cyBhcmUgbm90IG1vdmVkLiBPbmx5IHRoZSB3aWR0aCB3aWxsIGJlIHNjYWxlZC5cclxuICAgIC8vICBUaGUgd2lkdGggb2YgYW4gaG9yaXpvbnRhbCBsaW5lIHdpbGwgYmUgc2NhbGVkIHdpdGggdGhlIHN5IHJhdGlvIG9ubHkuXHJcbiAgICAvLyAgVGhlIHdpZHRoIG9mIGEgdmVydGl2YWwgbGluZSB3aWxsIGJlIHNjYWxlZCB3aXRoIHRoZSBzeCByYXRpbyBvbmx5LlxyXG4gICAgLy8gIFRoZSB3aWR0aCBvZiBhbiBvYmxpcXVlIGxpbmUgd2lsbCBiZSBzY2FsZWQgd2l0aCBib3RoIHRoZSBzeCBhbmQgc3lcclxuICAgIC8vYnV0IHByb3BvcnRpb25hbCB3aXRoIHRoZSBhbmdsZSBiZXR3ZWVuIHRoZSBsaW5lIGFuZCB0aGUgeCBhbmQgeSBheGVzLlxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cXFxyXG4gICAgLy8gICAgICAgICAgICAgICAuXFwgICh4Mix5MikgICAgICAgICAgICAgICAgICAgICAgICAgLi4uXFwgICh4Mix5MilcclxuICAgIC8vICAgICAgICAgICAgICAuLi5AICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4uLkBcclxuICAgIC8vICAgICAgICAgICAgIC4uLi8uXFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4uLi8uXFxcclxuICAgIC8vICAgICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICAgc3ggICAgICAgICAgICAgLi4uLi4vLi4uXFxcclxuICAgIC8vICAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgKy0tLT4gICAgICAgICAgICAuLi4uLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgLi4uLi4vLi4uLi5cclxuICAgIC8vICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgIFxcLi4uLy4uLi4uXHJcbiAgICAvLyAgICAgICAgIFxcLi8uLi4gICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgIFxcLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAgQC4uLiAgICAgICAgICAgICBzeSB2ICAgICAgICAgICAgICAgICBALi4uLi5cclxuICAgIC8vICAoeDEseTEpICBcXC4gICAgICAgICAgICAgICAgICAgICAgICAgICAoeDEseTEpICBcXC4uLlxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcLlxyXG4gICAgLy9cclxuICAgIHZhciBhID0gTWF0aC5hdGFuKCh5MiAtIHkxKSAvICh4MiAtIHgxKSksXHJcbiAgICAgIHNpbmEgPSBNYXRoLnNpbihhKSwgY29zYSA9IE1hdGguY29zKGEpLFxyXG4gICAgICBzY2FsZWRXaWR0aCA9IHdpZHRoICogTWF0aC5zcXJ0KHN4KnN4ICogc2luYSpzaW5hICsgc3kqc3kgKiBjb3NhKmNvc2EpO1xyXG4gICAgcmV0dXJuIHNjYWxlZFdpZHRoO1xyXG4gIH0sXHJcblxyXG4gIGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQgPSAoeDEsIHkxLCB4MiwgeTIsIGRpc3RhbmNlKSA9PiB7XHJcbiAgICB2YXIgcmVjdCA9IGdldFJlY3RBcm91bmRMb25nTGluZSh4MSwgeTEsIHgyLCB5MiwgMiAqIGRpc3RhbmNlKTtcclxuICAgIHJldHVybiBbXHJcbiAgICAgIHt4MTogcmVjdC54MSwgeTE6IHJlY3QueTEsIHgyOiByZWN0LngyLCB5MjogcmVjdC55Mn0sXHJcbiAgICAgIHt4MTogcmVjdC54NCwgeTE6IHJlY3QueTQsIHgyOiByZWN0LngzLCB5MjogcmVjdC55M31cclxuICAgIF07XHJcbiAgfSxcclxuXHJcbiAgZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcyA9IChsMSwgbDIpID0+IHtcclxuICAgIHZhciBhMSA9IGwxLnkyIC0gbDEueTEsIGIxID0gbDEueDEgLSBsMS54MiwgYzEgPSBsMS54MipsMS55MSAtIGwxLngxKmwxLnkyLFxyXG4gICAgICAgIGEyID0gbDIueTIgLSBsMi55MSwgYjIgPSBsMi54MSAtIGwyLngyLCBjMiA9IGwyLngyKmwyLnkxIC0gbDIueDEqbDIueTIsXHJcbiAgICAgICAgeCA9IChjMipiMSAtIGMxKmIyKSAvIChhMSpiMiAtIGEyKmIxKSxcclxuICAgICAgICB5ID0gbDIueTEgPT09IGwyLnkyID8gbDIueTEgOiAoLWMxIC0gYTEqeCkgLyBiMTtcclxuICAgIHJldHVybiB7eDogeCwgeTogeX07XHJcbiAgfSxcclxuXHJcbiAgZ2V0RGlzdGFuY2VCZXR3ZWVuVHdvUG9pbnRzID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCh4Mi14MSkqKHgyLXgxKSArICh5Mi15MSkqKHkyLXkxKSk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMgPSAoeDEsIHkxLCB4MiwgeTIsIHgzLCB5MykgPT4ge1xyXG4gICAgdmFyIGEgPSBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMoeDEsIHkxLCB4MiwgeTIpLFxyXG4gICAgICAgIGIgPSBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMoeDIsIHkyLCB4MywgeTMpLFxyXG4gICAgICAgIGMgPSBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMoeDMsIHkzLCB4MSwgeTEpLFxyXG4gICAgICAgIGNvc0MgPSAoYSphICsgYipiIC0gYypjKSAvICgyKmEqYiksXHJcbiAgICAgICAgQyA9IE1hdGguYWNvcyhjb3NDKTtcclxuICAgIHJldHVybiBDO1xyXG4gIH0sXHJcblxyXG4gIHBlcm11dGVMaW5lcyA9IChhbHBoYUxpbmVzLCBiZXRhTGluZXMpID0+IHtcclxuICAgIHZhciBwZXJtdXRhdGlvbnMgPSBbXTtcclxuICAgIGFscGhhTGluZXMuZm9yRWFjaCgoYWxwaGFMaW5lKSA9PiB7XHJcbiAgICAgIGJldGFMaW5lcy5mb3JFYWNoKChiZXRhTGluZSkgPT4ge1xyXG4gICAgICAgIHBlcm11dGF0aW9ucy5wdXNoKHthbHBoYTogYWxwaGFMaW5lLCBiZXRhOiBiZXRhTGluZX0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbiAgICByZXR1cm4gcGVybXV0YXRpb25zO1xyXG4gIH0sXHJcblxyXG4gIGFsbW9zdEVxdWFsID0gKGEsIGIpID0+IHtcclxuICAgIC8vIGdyb3NzIGFwcHJveGltYXRpb24gdG8gY292ZXIgdGhlIGZsb3QgYW5kIHRyaWdvbm9tZXRyaWMgcHJlY2lzaW9uXHJcbiAgICByZXR1cm4gYSA9PT0gYiB8fCBNYXRoLmFicyhhIC0gYikgPCAyMCAqIEVQU0lMT047XHJcbiAgfSxcclxuXHJcbiAgaXNDZW50ZXJJbkJldHdlZW4gPSAoY3gsIGN5LCB4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSA9PiB7XHJcbiAgICB2YXIgYSA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzKHgyLCB5MiwgeDEsIHkxLCB4MCwgeTApLFxyXG4gICAgICAgIGExID0gZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoY3gsIGN5LCB4MSwgeTEsIHgwLCB5MCksXHJcbiAgICAgICAgYTIgPSBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyhjeCwgY3ksIHgxLCB5MSwgeDIsIHkyKTtcclxuICAgIHJldHVybiBhbG1vc3RFcXVhbChhLCBhMSArIGEyKSAmJiAoYTEgKyBhMiA8PSBNYXRoLlBJKTtcclxuICB9LFxyXG5cclxuICBnZXRUaGVDZW50ZXJPZlRoZUNvcm5lciA9ICh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCBkaXN0YW5jZSwgc3gsIHN5KSA9PiB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkICBkXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgYWxwaGEgbGluZSAwICAgIC0tLS0tLS0tLS0tLS0nLS0vLS0nLS0tLS0tLS0tXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnICAgICAgICAgICAgIGRcclxuICAgIC8vICAgICBnaXZlbiBsaW5lICAgID09PVA9PT09PT09PT09UD09PT09PT09PT09PT09XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJyAgICAgICAgICAgICAgIGRcclxuICAgIC8vICAgYWxwaGEgbGluZSAxICAgIC0tLS0tLS0tLUMtLS8tLSctLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAnICBQICAnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vXHJcbiAgICAvLyAgICAgYmV0YSBsaW5lcyAwICYgMSB3aXRoIG9uZSBvZiB0aGUgZ2l2ZW4gbGluZSBpbmJldHdlZW5cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gIFAgPSB0aGUgZ2l2ZW4gUDAsIFAxLCBQMiBwb2ludHNcclxuICAgIC8vXHJcbiAgICAvLyAgZCA9IHRoZSBnaXZlbiBkaXN0YW5jZSAvIHJhZGl1cyBvZiB0aGUgY2lyY2xlXHJcbiAgICAvL1xyXG4gICAgLy8gIEMgPSB0aGUgY2VudGVyIG9mIHRoZSBjaXJjbGUvY29ybmVyIHRvIGJlIGRldGVybWluZWRcclxuXHJcbiAgICB2YXIgZDEgPSBnZXRTY2FsZWRXaWR0aE9mTGluZSh4MCwgeTAsIHgxLCB5MSwgc3gsIHN5LCBkaXN0YW5jZSksXHJcbiAgICAgICAgZDIgPSBnZXRTY2FsZWRXaWR0aE9mTGluZSh4MSwgeTEsIHgyLCB5Miwgc3gsIHN5LCBkaXN0YW5jZSksXHJcbiAgICAgICAgYWxwaGFMaW5lcyA9IGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQoeDAsIHkwLCB4MSwgeTEsIGQxKSxcclxuICAgICAgICBiZXRhTGluZXMgPSBnZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50KHgxLCB5MSwgeDIsIHkyLCBkMiksXHJcbiAgICAgICAgcGVybXV0YXRpb25zID0gcGVybXV0ZUxpbmVzKGFscGhhTGluZXMsIGJldGFMaW5lcyksXHJcbiAgICAgICAgaW50ZXJzZWN0aW9ucyA9IHBlcm11dGF0aW9ucy5tYXAoKHApID0+IGdldEludGVyc2VjdGlvbk9mVHdvTGluZXMocC5hbHBoYSwgcC5iZXRhKSksXHJcbiAgICAgICAgY2VudGVyID0gaW50ZXJzZWN0aW9ucy5maWx0ZXIoKGkpID0+IGlzQ2VudGVySW5CZXR3ZWVuKGkueCwgaS55LCB4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSlbMF07XHJcblxyXG4gICAgcmV0dXJuIGNlbnRlciB8fCB7eDogTmFOLCB5OiBOYU59O1xyXG4gIH0sXHJcblxyXG4gIGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIgPSAoeDEsIHkxLCB4MiwgeTIsIGN4LCBjeSkgPT4ge1xyXG4gICAgdmFyIG0gPSAoeTIgLSB5MSkgLyAoeDIgLSB4MSksXHJcbiAgICAgICAgY20gPSAtMSAvIG0sXHJcbiAgICAgICAgQyA9IHkxKih4MiAtIHgxKSAtIHgxKih5MiAtIHkxKSxcclxuICAgICAgICB4ID0gKEMgLSAoeDIgLSB4MSkqKGN5IC0gY20qY3gpKSAvIChjbSooeDIgLSB4MSkgKyB5MSAtIHkyKSxcclxuICAgICAgICB5ID0gY20qKHggLSBjeCkgKyBjeTtcclxuICAgIHJldHVybiBtID09PSAwIC8vIGhvcml6b250YWxcclxuICAgICAgPyB7eDogY3gsIHk6IHkxfVxyXG4gICAgICA6IChtID09PSBJbmZpbml0eSAvLyB2ZXJ0aWNhbFxyXG4gICAgICAgID8ge3g6IHgxLCB5OiBjeX1cclxuICAgICAgICA6IHt4OiB4LCB5OiB5fSk7XHJcbiAgfSxcclxuXHJcbiAgeHlUb0FyY0FuZ2xlID0gKGN4LCBjeSwgeCwgeSkgPT4ge1xyXG4gICAgdmFyIGhvcml6b250YWxYID0gY3ggKyAxLFxyXG4gICAgICAgIGhvcml6b250YWxZID0gY3ksXHJcbiAgICAgICAgYSA9IE1hdGguYWJzKGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzKHgsIHksIGN4LCBjeSwgaG9yaXpvbnRhbFgsIGhvcml6b250YWxZKSk7XHJcbiAgICBpZih5IDwgY3kpIHtcclxuICAgICAgLy90aGlyZCAmIGZvcnRoIHF1YWRyYW50c1xyXG4gICAgICBhID0gTWF0aC5QSSArIE1hdGguUEkgLSBhO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGE7XHJcbiAgfSxcclxuXHJcbiAgc2NhbGVkUmFkaXVzID0gKHIsIHN4LCBzeSwgYSkgPT4ge1xyXG4gICAgdmFyIG5hID0gYSAlICgyKlBJKTsgLy9ub3JtYWxpemVkIGFuZ2xlXHJcbiAgICBpZiAoc3ggPT09IHN5KSB7XHJcbiAgICAgIHJldHVybiByICogc3g7XHJcbiAgICB9IGVsc2UgaWYgKGFsbW9zdEVxdWFsKG5hLCAwKSB8fCBhbG1vc3RFcXVhbChuYSwgUEkpKSB7XHJcbiAgICAgIHJldHVybiByICogc3g7XHJcbiAgICB9IGVsc2UgaWYgKGFsbW9zdEVxdWFsKG5hLCBQSS8yKSB8fCBhbG1vc3RFcXVhbChuYSwgMypQSS8yKSkge1xyXG4gICAgICByZXR1cm4gciAqIHN5O1xyXG4gICAgfSBlbHNlIGlmIChuYSA8IDEqUEkvMikge1xyXG4gICAgICB2YXIgYWEgPSBuYTsgLy9hZGp1c3RlZCBhbmdsZVxyXG4gICAgICByZXR1cm4gciAqIChzeCAqIChQSS8yLWFhKS8oUEkvMikgKyBzeSAqIChhYSkvKFBJLzIpKTtcclxuICAgIH0gZWxzZSBpZiAobmEgPCAyKlBJLzIpIHtcclxuICAgICAgdmFyIGFhID0gbmEgLSAxKlBJLzI7IC8vYWRqdXN0ZWQgYW5nbGVcclxuICAgICAgcmV0dXJuIHIgKiAoc3ggKiAoYWEpLyhQSS8yKSArIHN5ICogKFBJLzItYWEpLyhQSS8yKSk7XHJcbiAgICB9IGVsc2UgaWYgKG5hIDwgMypQSS8yKSB7XHJcbiAgICAgIHZhciBhYSA9IG5hIC0gMipQSS8yOyAvL2FkanVzdGVkIGFuZ2xlXHJcbiAgICAgIHJldHVybiByICogKHN4ICogKFBJLzItYWEpLyhQSS8yKSArIHN5ICogKGFhKS8oUEkvMikpO1xyXG4gICAgfSBlbHNlIGlmIChuYSA8IDQqUEkvMikge1xyXG4gICAgICB2YXIgYWEgPSBuYSAtIDMqUEkvMjsgLy9hZGp1c3RlZCBhbmdsZVxyXG4gICAgICByZXR1cm4gciAqIChzeCAqIChhYSkvKFBJLzIpICsgc3kgKiAoUEkvMi1hYSkvKFBJLzIpKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBjb2xsaW5lYXIgPSAoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MikgPT4ge1xyXG4gICAgdmFyIG0xID0gKHkxIC0geTApIC8gKHgxIC0geDApLFxyXG4gICAgICAgIG0yID0gKHkyIC0geTEpIC8gKHgyIC0geDEpO1xyXG4gICAgcmV0dXJuIGFsbW9zdEVxdWFsKG0xLCBtMik7XHJcbiAgfSxcclxuXHJcbiAgZGVjb21wb3NlQXJjVG8gPSAoeDAsIHkwLCB4MSwgeTEsIHgyLCB5Miwgciwgc3gsIHN5KSA9PiB7XHJcbiAgICB2YXIgZGVjb21wb3NpdGlvbiA9IHtcclxuICAgICAgcG9pbnQ6IHt4OiB4MSwgeTogeTF9XHJcbiAgICB9O1xyXG4gICAgaWYoY29sbGluZWFyKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpKSB7XHJcbiAgICAgIGRlY29tcG9zaXRpb24ubGluZSA9IHt4MTogeDAsIHkxOiB5MCwgeDI6IHgxLCB5MjogeTF9O1xyXG4gICAgfSBlbHNlIGlmICghaXNOYU4oeDApICYmICFpc05hTih5MCkpIHtcclxuICAgICAgdmFyIGNlbnRlciA9IGdldFRoZUNlbnRlck9mVGhlQ29ybmVyKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHIsIHN4LCBzeSksXHJcbiAgICAgICAgICBmb290MSA9IGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIoeDAsIHkwLCB4MSwgeTEsIGNlbnRlci54LCBjZW50ZXIueSksXHJcbiAgICAgICAgICBmb290MiA9IGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIoeDEsIHkxLCB4MiwgeTIsIGNlbnRlci54LCBjZW50ZXIueSksXHJcbiAgICAgICAgICBhbmdsZUZvb3QxID0geHlUb0FyY0FuZ2xlKGNlbnRlci54LCBjZW50ZXIueSwgZm9vdDEueCwgZm9vdDEueSksXHJcbiAgICAgICAgICBhbmdsZUZvb3QyID0geHlUb0FyY0FuZ2xlKGNlbnRlci54LCBjZW50ZXIueSwgZm9vdDIueCwgZm9vdDIueSksXHJcbiAgICAgICAgICBzQW5nbGUgPSBNYXRoLmFicyhhbmdsZUZvb3QyIC0gYW5nbGVGb290MSkgPCBNYXRoLlBJID8gYW5nbGVGb290MiA6IGFuZ2xlRm9vdDEsXHJcbiAgICAgICAgICBlQW5nbGUgPSBNYXRoLmFicyhhbmdsZUZvb3QyIC0gYW5nbGVGb290MSkgPCBNYXRoLlBJID8gYW5nbGVGb290MSA6IGFuZ2xlRm9vdDI7XHJcbiAgICAgIGlmIChzQW5nbGUgPiBlQW5nbGUpIHtcclxuICAgICAgICB2YXIgdGVtcCA9IHNBbmdsZTtcclxuICAgICAgICBzQW5nbGUgPSBlQW5nbGU7XHJcbiAgICAgICAgZUFuZ2xlID0gdGVtcCArIDIqUEk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFpc05hTihjZW50ZXIueCkgJiYgIWlzTmFOKGNlbnRlci55KSkge1xyXG4gICAgICAgIGlmICghYWxtb3N0RXF1YWwoZ2V0RGlzdGFuY2VCZXR3ZWVuVHdvUG9pbnRzKHgwLCB5MCwgZm9vdDEueCwgZm9vdDEueSksIDApKSB7XHJcbiAgICAgICAgICBkZWNvbXBvc2l0aW9uLmxpbmUgPSB7eDE6IHgwLCB5MTogeTAsIHgyOiBmb290MS54LCB5MjogZm9vdDEueX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlY29tcG9zaXRpb24uYXJjID0ge3g6IGNlbnRlci54LCB5OiBjZW50ZXIueSwgcjogciwgc0FuZ2xlOiBzQW5nbGUsIGVBbmdsZTogZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlOiBmYWxzZX07XHJcbiAgICAgICAgZGVjb21wb3NpdGlvbi5wb2ludCA9IHt4OiBmb290Mi54LCB5OiBmb290Mi55fTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRlY29tcG9zaXRpb247XHJcbiAgfSxcclxuXHJcbiAgcmVsZXZhbnRBcmNQb2ludHMgPSAoY3gsIGN5LCByLCBzQW5nbGUsIGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZSkgPT4ge1xyXG4gICAgdmFyIHBvaW50cyA9IFtdLCByZWxldmFudFBvaW50cyA9IFtdO1xyXG4gICAgICBwb2ludHMucHVzaCh7eDogY3ggKyByKmNvcyhzQW5nbGUpLCB5OiBjeSArIHIqc2luKHNBbmdsZSksIGE6IHNBbmdsZX0pO1xyXG4gICAgICBwb2ludHMucHVzaCh7eDogY3ggKyByKmNvcyhlQW5nbGUpLCB5OiBjeSArIHIqc2luKGVBbmdsZSksIGE6IGVBbmdsZX0pO1xyXG4gICAgICBpZiAoY291bnRlcmNsb2Nrd2lzZSkge1xyXG4gICAgICAgIHZhciB0ZW1wID0gc0FuZ2xlO1xyXG4gICAgICAgIHNBbmdsZSA9IGVBbmdsZTtcclxuICAgICAgICBlQW5nbGUgPSBzQW5nbGUgKyAyKlBJO1xyXG4gICAgICB9XHJcbiAgICAgIFsxKlBJLzIsIDIqUEkvMiwgMypQSS8yLCA0KlBJLzJdLmZvckVhY2goKGEpID0+IHtcclxuICAgICAgICBpZihlQW5nbGUgPiBhICYmIGEgPiBzQW5nbGUpIHtcclxuICAgICAgICAgIHBvaW50cy5wdXNoKHt4OiBjeCArIHIqY29zKGEpLCB5OiBjeSArIHIqc2luKGEpLCBhOiBhfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAvL3JlbW92aW5nIHRoZSBkdXBsaWNhdGVkIHBvaW50c1xyXG4gICAgcmVsZXZhbnRQb2ludHMucHVzaChwb2ludHMucG9wKCkpO1xyXG4gICAgd2hpbGUocG9pbnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIHBvaW50ID0gcG9pbnRzLnBvcCgpLFxyXG4gICAgICAgICAgZm91bmQgPSByZWxldmFudFBvaW50cy5maW5kKChwKSA9PiBhbG1vc3RFcXVhbChwb2ludC54LCBwLngpICYmIGFsbW9zdEVxdWFsKHBvaW50LnksIHAueSkpO1xyXG4gICAgICBpZiAoIWZvdW5kKSB7XHJcbiAgICAgICAgcmVsZXZhbnRQb2ludHMucHVzaChwb2ludCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVsZXZhbnRQb2ludHM7XHJcbiAgfSxcclxuXHJcbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNzUyNzI1L2ZpbmRpbmctd2hldGhlci1hLXBvaW50LWxpZXMtaW5zaWRlLWEtcmVjdGFuZ2xlLW9yLW5vdFxyXG4gIGlzUG9pbnRJbnNpZGVSZWN0YW5nbGUgPSAocG9pbnQsIHJlY3RhbmdsZSkgPT4ge1xyXG4gICAgdmFyIHNlZ21lbnRzID0gW3tcclxuICAgICAgeDE6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MTogcmVjdGFuZ2xlLnksXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55IH0sIHtcclxuICAgICAgeDE6IHJlY3RhbmdsZS54ICsgcmVjdGFuZ2xlLndpZHRoLFxyXG4gICAgICB5MTogcmVjdGFuZ2xlLnksXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodH0sIHtcclxuICAgICAgeDE6IHJlY3RhbmdsZS54ICsgcmVjdGFuZ2xlLndpZHRoLFxyXG4gICAgICB5MTogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHR9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodCxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnlcclxuICAgIH1dO1xyXG5cclxuICAgIHZhciBpc0luc2lkZSA9IHNlZ21lbnRzLm1hcCgoc2VnbWVudCkgPT4ge1xyXG4gICAgICB2YXIgQSA9IC0oc2VnbWVudC55MiAtIHNlZ21lbnQueTEpLFxyXG4gICAgICAgIEIgPSBzZWdtZW50LngyIC0gc2VnbWVudC54MSxcclxuICAgICAgICBDID0gLShBICogc2VnbWVudC54MSArIEIgKiBzZWdtZW50LnkxKSxcclxuICAgICAgICBEID0gQSAqIHBvaW50LnggKyBCICogcG9pbnQueSArIEM7XHJcbiAgICAgICAgcmV0dXJuIEQ7XHJcbiAgICB9KS5ldmVyeSgoRCkgPT4ge1xyXG4gICAgICByZXR1cm4gRCA+IDA7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gaXNJbnNpZGU7XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMuZ2V0QkJveCA9IGdldEJCb3g7XHJcbiAgdGhpcy51bmlvbiA9IHVuaW9uO1xyXG4gIHRoaXMudG90YWxUcmFuc2Zvcm0gPSB0b3RhbFRyYW5zZm9ybTtcclxuICB0aGlzLmdldFJlY3RBcm91bmRMaW5lID0gZ2V0UmVjdEFyb3VuZExpbmU7XHJcbiAgdGhpcy5nZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50ID0gZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudDtcclxuICB0aGlzLmdldEludGVyc2VjdGlvbk9mVHdvTGluZXMgPSBnZXRJbnRlcnNlY3Rpb25PZlR3b0xpbmVzO1xyXG4gIHRoaXMuZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMgPSBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cztcclxuICB0aGlzLmdldFRoZUNlbnRlck9mVGhlQ29ybmVyID0gZ2V0VGhlQ2VudGVyT2ZUaGVDb3JuZXI7XHJcbiAgdGhpcy5nZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyID0gZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhcjtcclxuICB0aGlzLnh5VG9BcmNBbmdsZSA9IHh5VG9BcmNBbmdsZTtcclxuICB0aGlzLnNjYWxlZFJhZGl1cyA9IHNjYWxlZFJhZGl1cztcclxuICB0aGlzLmRlY29tcG9zZUFyY1RvID0gZGVjb21wb3NlQXJjVG87XHJcbiAgdGhpcy5pc1BvaW50SW5zaWRlUmVjdGFuZ2xlID0gaXNQb2ludEluc2lkZVJlY3RhbmdsZTtcclxuXHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cnkuanMnXHJcbmltcG9ydCB7IEN1c3RvbU1hdGNoZXJzIH0gZnJvbSAnLi9jdXN0b21NYXRjaGVycy5qcydcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gUmFiYml0KGdlb21ldHJ5LCBtYXRjaGVycykge1xyXG5cclxuICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICBnZW9tZXRyeSA9IGdlb21ldHJ5IHx8IG5ldyBHZW9tZXRyeSgpLFxyXG4gICAgbWF0Y2hlcnMgPSBtYXRjaGVycyB8fCBuZXcgQ3VzdG9tTWF0Y2hlcnMoKTtcclxuXHJcblxyXG4gIHZhciBmaW5kQWxsU2hhcGVzSWdub3JpbmdBcmd1bWVudHMgPSAoc2hhcGUsIHdoZXJlKSA9PiB7XHJcbiAgICB2YXIgZm91bmQgPSBbXSwgaW5kZXggPSAwO1xyXG4gICAgZG8ge1xyXG4gICAgICBpbmRleCA9IHRoYXQuZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMoc2hhcGUsIHdoZXJlLCBpbmRleCk7XHJcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICBmb3VuZC5wdXNoKHdoZXJlLnNsaWNlKGluZGV4LCBpbmRleCArIHNoYXBlLmxlbmd0aCkpO1xyXG4gICAgICAgIGluZGV4ICs9IHNoYXBlLmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgfSB3aGlsZSAoaW5kZXggIT09IC0xICYmIGluZGV4IDwgd2hlcmUubGVuZ3RoKTtcclxuICAgIHJldHVybiBmb3VuZDtcclxuICB9LFxyXG5cclxuICBmaW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyA9IChzaGFwZSwgd2hlcmUsIHN0YXJ0SW5kZXgpID0+IHtcclxuICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4IHx8IDA7XHJcbiAgICB2YXIgbWF0Y2ggPSBmYWxzZSwgaW5kZXggPSAtMTtcclxuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4OyBpIDw9IHdoZXJlLmxlbmd0aCAtIHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIG1hdGNoID0gdHJ1ZTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzaGFwZS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIGlmICh3aGVyZVtpICsgal0ubWV0aG9kICE9PSBzaGFwZVtqXS5tZXRob2QpIHtcclxuICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG1hdGNoID09PSB0cnVlKSB7XHJcbiAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5kZXg7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlU2hhcGVzID0gKHNoYXBlcywgZnJvbSkgPT4ge1xyXG4gICAgdmFyIGNvcHkgPSBmcm9tLnNsaWNlKDAsIGZyb20ubGVuZ3RoKTtcclxuICAgIHNoYXBlcy5mb3JFYWNoKChzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgaW5kZXggPSAtMTtcclxuICAgICAgZG8ge1xyXG4gICAgICAgIGluZGV4ID0gdGhhdC5maW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyhzaGFwZSwgY29weSk7XHJcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgY29weS5zcGxpY2UoaW5kZXgsIHNoYXBlLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IHdoaWxlIChpbmRleCAhPT0gLTEpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY29weTtcclxuICB9O1xyXG5cclxuXHJcbiAgdGhpcy5nZXRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveDtcclxuICB0aGlzLmN1c3RvbU1hdGNoZXJzID0gbWF0Y2hlcnM7XHJcbiAgdGhpcy5maW5kQWxsU2hhcGVzSWdub3JpbmdBcmd1bWVudHMgPSBmaW5kQWxsU2hhcGVzSWdub3JpbmdBcmd1bWVudHM7XHJcbiAgdGhpcy5maW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyA9IGZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzO1xyXG4gIHRoaXMucmVtb3ZlU2hhcGVzID0gcmVtb3ZlU2hhcGVzO1xyXG5cclxufVxyXG4iXX0=
