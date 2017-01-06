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
          arcAngles = relevantArcAngles(r, sAngle, eAngle, counterclockwise),
          scaledArcPoints = arcAngles.map(function (a) {
        var sr = scaledRadius(r, sx, sy, a);
        return { x: cx + sr * cos(a), y: cy + sr * sin(a) };
      }),
          newBox = boxPoints(scaledArcPoints);
      if (!isNaN(cx) && !isNaN(cy) && arcAngles.length > 1) {
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
          arcAngles = relevantArcAngles(sAngle, eAngle, counterclockwise),
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
      if (!isNaN(cx) && !isNaN(cy) && arcAngles.length > 1) {
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
    //
    //  True is returned in situations like this one:
    //
    //                             '   /
    //                            '   /
    //                           '   /
    //                          '   /
    //              ===P0==========P1=============
    //                        '   /
    //              ---------C---/----------------
    //                      '   /
    //                     '   /
    //                    '   P2
    //                   '   /
    //
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
    //
    //  The sx and sy scalings can be different so the circle looks more like an
    //ellipse. This function is returning the radius corrsponding to the specified angle
    //and taking into account the sx and sy values.
    //
    //            *   *                                  *        *
    //         *         *                         *                   *
    //       *             *           sx       *                        *
    //                             +------>    *                          *
    //       *             *       |
    //         *         *      sy v           *                          *
    //            *   *                         *                        *
    //                                            *                    *
    //                                                  *         *
    //
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
    //
    //  The sx and sy is used to scale the radius (r) only.
    //All other coordinates have to be already scaled.
    //
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
      relevantArcAngles = function relevantArcAngles(sAngle, eAngle, counterclockwise) {
    //
    //  The function is returning the specified sAngle and eAngle and
    //all the multiple of PI/2. The results doesn't contain duplications.
    //  Example: For sAngle = PI/6 and eAngle = 7*PI/6,
    // When counterclockwise = false the result is: [PI/6, 7*PI/6, PI/2, 2*PI/2]
    // When counterclockwise = true the result is: [PI/6, 7*PI/6, 3*PI/2, 4*PI/2]
    //
    var angles = [],
        relevantAngles = [];
    angles.push(sAngle);
    angles.push(eAngle);
    if (counterclockwise) {
      var temp = sAngle;
      sAngle = eAngle;
      eAngle = sAngle + 2 * PI;
    }
    [1 * PI / 2, 2 * PI / 2, 3 * PI / 2, 4 * PI / 2].forEach(function (a) {
      if (eAngle > a && a > sAngle) {
        angles.push(a);
      }
    });

    //removing the duplicated points
    relevantAngles.push(angles.pop());
    while (angles.length > 0) {
      var angle = angles.pop(),
          found = relevantAngles.find(function (a) {
        return almostEqual(angle, a) || almostEqual(angle - 2 * PI, a) || almostEqual(angle, a - 2 * PI);
      });
      if (found === undefined) {
        relevantAngles.push(angle);
      }
    }

    return relevantAngles;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGN1c3RvbU1hdGNoZXJzLmpzIiwic3JjXFxnZW9tZXRyeS5qcyIsInNyY1xccmFiYml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7O1FBS2dCLGMsR0FBQSxjOztBQUhoQjs7QUFHTyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0M7O0FBRXZDLGFBQVcsWUFBWSx3QkFBdkI7O0FBR0EsTUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBTyxxQkFBUCxFQUFpQztBQUNoRCxXQUFPO0FBQ0wsZUFBUyxpQkFBQyxNQUFELEVBQVMsUUFBVCxFQUFzQjtBQUM3QixZQUFJLFFBQVEsS0FBWjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxTQUFTLE1BQVQsR0FBa0IsT0FBTyxNQUE3QyxFQUFxRCxHQUFyRCxFQUEwRDtBQUN4RCxrQkFBUSxPQUFPLE1BQVAsR0FBZ0IsQ0FBeEI7QUFDQSxlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksT0FBTyxNQUEzQixFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxnQkFBSSxTQUFTLElBQUksQ0FBYixFQUFnQixNQUFoQixLQUEyQixPQUFPLENBQVAsRUFBVSxNQUF6QyxFQUFpRDtBQUMvQyxzQkFBUSxLQUFSO0FBQ0E7QUFDRDtBQUNGO0FBQ0QsY0FBSSxVQUFVLElBQWQsRUFBb0I7QUFDbEI7QUFDRDtBQUNGO0FBQ0QsWUFBSSxTQUFTLFFBQVEsRUFBQyxNQUFNLElBQVAsRUFBUixHQUF1QixFQUFDLE1BQU0sS0FBUCxFQUFjLFNBQVMsbUJBQXZCLEVBQXBDO0FBQ0EsZUFBTyxNQUFQO0FBQ0Q7QUFqQkksS0FBUDtBQW1CRCxHQXBCRDtBQUFBLE1Bc0JBLHNCQUFzQixTQUF0QixtQkFBc0IsQ0FBQyxJQUFELEVBQU8scUJBQVAsRUFBaUM7QUFDckQsV0FBTztBQUNMLGVBQVMsaUJB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M0QsRUFBZ0U7QUFDOUQsY0FBUSxJQUFSO0FBQ0EsV0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLE1BQU0sTUFBMUIsRUFBa0MsR0FBbEMsRUFBdUM7QUFDckMsWUFBSSxNQUFNLElBQUksQ0FBVixFQUFhLE1BQWIsS0FBd0IsTUFBTSxDQUFOLEVBQVMsTUFBckMsRUFBNkM7QUFDM0Msa0JBQVEsS0FBUjtBQUNBO0FBQ0Q7QUFDRjtBQUNELFVBQUksVUFBVSxJQUFkLEVBQW9CO0FBQ2xCLGdCQUFRLENBQVI7QUFDQTtBQUNEO0FBQ0Y7QUFDRCxXQUFPLEtBQVA7QUFDRCxHQTdCRDtBQUFBLE1BK0JBLGVBQWUsU0FBZixZQUFlLENBQUMsTUFBRCxFQUFTLElBQVQsRUFBa0I7QUFDL0IsUUFBSSxPQUFPLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxLQUFLLE1BQW5CLENBQVg7QUFDQSxXQUFPLE9BQVAsQ0FBZSxVQUFDLEtBQUQsRUFBVztBQUN4QixVQUFJLFFBQVEsQ0FBQyxDQUFiO0FBQ0EsU0FBRztBQUNELGdCQUFRLEtBQUssMEJBQUwsQ0FBZ0MsS0FBaEMsRUFBdUMsSUFBdkMsQ0FBUjtBQUNBLFlBQUksVUFBVSxDQUFDLENBQWYsRUFBa0I7QUFDaEIsZUFBSyxNQUFMLENBQVksS0FBWixFQUFtQixNQUFNLE1BQXpCO0FBQ0Q7QUFDRixPQUxELFFBS1MsVUFBVSxDQUFDLENBTHBCO0FBTUQsS0FSRDtBQVNBLFdBQU8sSUFBUDtBQUNELEdBM0NEOztBQThDQSxPQUFLLE9BQUwsR0FBZSxTQUFTLE9BQXhCO0FBQ0EsT0FBSyxjQUFMLEdBQXNCLFFBQXRCO0FBQ0EsT0FBSyw4QkFBTCxHQUFzQyw4QkFBdEM7QUFDQSxPQUFLLDBCQUFMLEdBQWtDLDBCQUFsQztBQUNBLE9BQUssWUFBTCxHQUFvQixZQUFwQjtBQUVEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJ5LmpzJ1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBDdXN0b21NYXRjaGVycyhnZW9tZXRyeSkge1xyXG5cclxuICBnZW9tZXRyeSA9IGdlb21ldHJ5IHx8IG5ldyBHZW9tZXRyeSgpO1xyXG5cclxuXHJcbiAgdmFyIHRvQmVQYXJ0T2YgPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXhwZWN0ZWQubGVuZ3RoIC0gYWN0dWFsLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBtYXRjaCA9IGFjdHVhbC5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhY3R1YWwubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKGV4cGVjdGVkW2kgKyBqXS5tZXRob2QgIT09IGFjdHVhbFtqXS5tZXRob2QpIHtcclxuICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAobWF0Y2ggPT09IHRydWUpIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBtYXRjaCA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlIG5vdCBwYXJ0IG9mJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvQmVJbnNpZGVUaGVBcmVhT2YgPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBzbWFsbFNoYXBlID0gYWN0dWFsLFxyXG4gICAgICAgICAgYmlnU2hhcGUgPSBleHBlY3RlZCxcclxuICAgICAgICAgIGJpZ1NoYXBlQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYmlnU2hhcGUpLFxyXG4gICAgICAgICAgc21hbGxTaGFwZUJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KHNtYWxsU2hhcGUpLFxyXG4gICAgICAgICAgY2VudGVyID0ge3g6IHNtYWxsU2hhcGVCQm94LnggKyBzbWFsbFNoYXBlQkJveC53aWR0aCAvIDIsIHk6IHNtYWxsU2hhcGVCQm94LnkgKyBzbWFsbFNoYXBlQkJveC5oZWlnaHQgLyAyfSxcclxuICAgICAgICAgIGlzQ2VudGVySW5zaWRlID0gZ2VvbWV0cnkuaXNQb2ludEluc2lkZVJlY3RhbmdsZShjZW50ZXIsIGJpZ1NoYXBlQkJveCksXHJcbiAgICAgICAgICByZXN1bHQgPSBpc0NlbnRlckluc2lkZSA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlIGlzIG5vdCBpbnNpZGUgdGhlIGFyZWEgb2YnfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9IYXZlVGhlU2FtZVBvc2l0aW9uV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lUG9zaXRpb24gPSBhY3R1YWxCQm94LnggPT09IGV4cGVjdGVkQkJveC54ICYmIGFjdHVhbEJCb3gueSA9PT0gZXhwZWN0ZWRCQm94LnksXHJcbiAgICAgICAgICByZXN1bHQgPSBoYXZlVGhlU2FtZVBvc2l0aW9uID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgcG9zaXRpb24nfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9IYXZlVGhlU2FtZVNpemVXaXRoID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgYWN0dWFsQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYWN0dWFsKSxcclxuICAgICAgICAgIGV4cGVjdGVkQkJveCA9IGdlb21ldHJ5LmdldEJCb3goZXhwZWN0ZWQpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVTaXplID0gYWN0dWFsQkJveC53aWR0aCA9PT0gZXhwZWN0ZWRCQm94LndpZHRoICYmIGFjdHVhbEJCb3guaGVpZ2h0ID09PSBleHBlY3RlZEJCb3guaGVpZ2h0LFxyXG4gICAgICAgICAgcmVzdWx0ID0gaGF2ZVRoZVNhbWVTaXplID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgc2l6ZSd9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlSG9yaXpvbnRhbGx5QWxpZ25XaXRoID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgYWN0dWFsQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYWN0dWFsKSxcclxuICAgICAgICAgIGV4cGVjdGVkQkJveCA9IGdlb21ldHJ5LmdldEJCb3goZXhwZWN0ZWQpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVBbGlnbm1lbnQgPSBhY3R1YWxCQm94LnkgPT09IGV4cGVjdGVkQkJveC55LFxyXG4gICAgICAgICAgcmVzdWx0ID0gaGF2ZVRoZVNhbWVBbGlnbm1lbnQgPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZXMgZG9uYHQgaGF2ZSB0aGUgc2FtZSBob3Jpem9udGFsIHBvc2l0aW9uJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvQmVWZXJ0aWNhbGx5QWxpZ25XaXRoID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgYWN0dWFsQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYWN0dWFsKSxcclxuICAgICAgICAgIGV4cGVjdGVkQkJveCA9IGdlb21ldHJ5LmdldEJCb3goZXhwZWN0ZWQpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVBbGlnbm1lbnQgPSBhY3R1YWxCQm94LnggPT09IGV4cGVjdGVkQkJveC54LFxyXG4gICAgICAgICAgcmVzdWx0ID0gaGF2ZVRoZVNhbWVBbGlnbm1lbnQgPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZXMgZG9uYHQgaGF2ZSB0aGUgc2FtZSB2ZXJ0aWNhbCBwb3NpdGlvbid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuXHJcbiAgdGhpcy50b0JlUGFydE9mID0gdG9CZVBhcnRPZjtcclxuICB0aGlzLnRvQmVJbnNpZGVUaGVBcmVhT2YgPSB0b0JlSW5zaWRlVGhlQXJlYU9mO1xyXG4gIHRoaXMudG9IYXZlVGhlU2FtZVBvc2l0aW9uV2l0aCA9IHRvSGF2ZVRoZVNhbWVQb3NpdGlvbldpdGg7XHJcbiAgdGhpcy50b0hhdmVUaGVTYW1lU2l6ZVdpdGggPSB0b0hhdmVUaGVTYW1lU2l6ZVdpdGg7XHJcbiAgdGhpcy50b0JlSG9yaXpvbnRhbGx5QWxpZ25XaXRoID0gdG9CZUhvcml6b250YWxseUFsaWduV2l0aDtcclxuICB0aGlzLnRvQmVWZXJ0aWNhbGx5QWxpZ25XaXRoID0gdG9CZVZlcnRpY2FsbHlBbGlnbldpdGg7XHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEdlb21ldHJ5KCkge1xyXG5cclxuICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgIEVQU0lMT04gPSBOdW1iZXIuRVBTSUxPTiB8fCAyLjIyMDQ0NjA0OTI1MDMxM2UtMTYsXHJcbiAgICAgIFBJID0gTWF0aC5QSSxcclxuICAgICAgc2luID0gTWF0aC5zaW4sXHJcbiAgICAgIGNvcyA9IE1hdGguY29zO1xyXG5cclxuXHJcbiAgdmFyIGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSA9ICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGJveDoge3g6IE5hTiwgeTogTmFOLCB3aWR0aDogTmFOLCBoZWlnaHQ6IE5hTn0sXHJcbiAgICAgIHRyYW5zZm9ybXM6IFtbXV0sXHJcbiAgICAgIHNoYXBlc0luUGF0aDogW10sXHJcbiAgICAgIG1vdmVUb0xvY2F0aW9uOiB7eDogTmFOLCB5OiBOYU59LFxyXG4gICAgICBsaW5lV2lkdGhzOiBbMV1cclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgcGF0aEZpbGxTaGFwZUhhbmRsZXJzID0ge1xyXG4gICAgcmVjdDogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeCA9IHNoYXBlLngsXHJcbiAgICAgICAgeSA9IHNoYXBlLnksXHJcbiAgICAgICAgd2lkdGggPSBzaGFwZS53aWR0aCxcclxuICAgICAgICBoZWlnaHQgPSBzaGFwZS5oZWlnaHQsXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmM6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIGN4ID0gc2hhcGUuY3gsXHJcbiAgICAgICAgICBjeSA9IHNoYXBlLmN5LFxyXG4gICAgICAgICAgciA9IHNoYXBlLnIsXHJcbiAgICAgICAgICBzeCA9IHNoYXBlLnN4LFxyXG4gICAgICAgICAgc3kgPSBzaGFwZS5zeSxcclxuICAgICAgICAgIHNBbmdsZSA9IHNoYXBlLnNBbmdsZSxcclxuICAgICAgICAgIGVBbmdsZSA9IHNoYXBlLmVBbmdsZSxcclxuICAgICAgICAgIGNvdW50ZXJjbG9ja3dpc2UgPSBzaGFwZS5jb3VudGVyY2xvY2t3aXNlLFxyXG4gICAgICAgICAgYXJjQW5nbGVzID0gcmVsZXZhbnRBcmNBbmdsZXMociwgc0FuZ2xlLCBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2UpLFxyXG4gICAgICAgICAgc2NhbGVkQXJjUG9pbnRzID0gYXJjQW5nbGVzLm1hcCgoYSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgc3IgPSBzY2FsZWRSYWRpdXMociwgc3gsIHN5LCBhKTtcclxuICAgICAgICAgICAgcmV0dXJuIHt4OiBjeCArIHNyKmNvcyhhKSwgeTogY3kgKyBzcipzaW4oYSl9O1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICAgICBuZXdCb3ggPSBib3hQb2ludHMoc2NhbGVkQXJjUG9pbnRzKTtcclxuICAgICAgaWYgKCFpc05hTihjeCkgJiYgIWlzTmFOKGN5KSAmJiBhcmNBbmdsZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcGF0aFN0cm9rZVNoYXBlSGFuZGxlcnMgPSB7XHJcbiAgICByZWN0OiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gc2hhcGUueCxcclxuICAgICAgICB5ID0gc2hhcGUueSxcclxuICAgICAgICB3aWR0aCA9IHNoYXBlLndpZHRoLFxyXG4gICAgICAgIGhlaWdodCA9IHNoYXBlLmhlaWdodCxcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIHhTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICB5U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHggLSB4U2NhbGVkTGluZVdpZHRoICAvIDIsIHk6IHkgLSB5U2NhbGVkTGluZVdpZHRoIC8gMiwgd2lkdGg6IHdpZHRoICsgeFNjYWxlZExpbmVXaWR0aCwgaGVpZ2h0OiBoZWlnaHQgKyB5U2NhbGVkTGluZVdpZHRofTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IHNoYXBlLmN4LFxyXG4gICAgICAgICAgY3kgPSBzaGFwZS5jeSxcclxuICAgICAgICAgIHIgPSBzaGFwZS5yLFxyXG4gICAgICAgICAgc3ggPSBzaGFwZS5zeCxcclxuICAgICAgICAgIHN5ID0gc2hhcGUuc3ksXHJcbiAgICAgICAgICBzQW5nbGUgPSBzaGFwZS5zQW5nbGUsXHJcbiAgICAgICAgICBlQW5nbGUgPSBzaGFwZS5lQW5nbGUsXHJcbiAgICAgICAgICBjb3VudGVyY2xvY2t3aXNlID0gc2hhcGUuY291bnRlcmNsb2Nrd2lzZSxcclxuICAgICAgICAgIGFyY0FuZ2xlcyA9IHJlbGV2YW50QXJjQW5nbGVzKHNBbmdsZSwgZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlKSxcclxuICAgICAgICAgIHNjYWxlZEFyY1BvaW50cyA9IGZsYXR0ZW4oYXJjQW5nbGVzLm1hcCgoYSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHNjYWxlZFJhZGl1cyhzdGF0ZS5saW5lV2lkdGgsIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LCBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSwgYSksXHJcbiAgICAgICAgICAgICAgICBzaXIgPSBzY2FsZWRSYWRpdXMociwgc3gsIHN5LCBhKSAtIHcvMiwgLy8gaW5uZXIgcmFkaXVzXHJcbiAgICAgICAgICAgICAgICBzciA9IHNjYWxlZFJhZGl1cyhyLCBzeCwgc3ksIGEpLCAgICAvLyByYWRpdXNcclxuICAgICAgICAgICAgICAgIHNvciA9IHNjYWxlZFJhZGl1cyhyLCBzeCwgc3ksIGEpICsgdy8yLCAvLyBvdXRlciByYWRpdXNcclxuICAgICAgICAgICAgICAgIHBvaW50cyA9IFtdO1xyXG4gICAgICAgICAgICBpZiAodyA9PT0gMSkge1xyXG4gICAgICAgICAgICAgIHBvaW50cy5wdXNoKHt4OiBjeCArIHNyKmNvcyhhKSwgeTogY3kgKyBzcipzaW4oYSl9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwb2ludHMucHVzaCh7eDogY3ggKyBzaXIqY29zKGEpLCB5OiBjeSArIHNpcipzaW4oYSl9KTtcclxuICAgICAgICAgICAgICBwb2ludHMucHVzaCh7eDogY3ggKyBzb3IqY29zKGEpLCB5OiBjeSArIHNvcipzaW4oYSl9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcG9pbnRzO1xyXG4gICAgICAgICAgfSkpLFxyXG4gICAgICAgICAgbmV3Qm94ID0gYm94UG9pbnRzKHNjYWxlZEFyY1BvaW50cyk7XHJcbiAgICAgIGlmICghaXNOYU4oY3gpICYmICFpc05hTihjeSkgJiYgYXJjQW5nbGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGxpbmVUbzogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBzaGFwZS54MSxcclxuICAgICAgICB5MSA9IHNoYXBlLnkxLFxyXG4gICAgICAgIHgyID0gc2hhcGUueDIsXHJcbiAgICAgICAgeTIgPSBzaGFwZS55MixcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBnZXRTY2FsZWRXaWR0aE9mTGluZSh4MSwgeTEsIHgyLCB5Miwgc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LCBzdGF0ZS5saW5lV2lkdGgpLFxyXG4gICAgICAgIHJlY3QgPSBnZXRSZWN0QXJvdW5kTGluZSh4MSwgeTEsIHgyLCB5Miwgc2NhbGVkTGluZVdpZHRoICE9PSAxID8gc2NhbGVkTGluZVdpZHRoIDogMCksXHJcbiAgICAgICAgbmV3Qm94ID0ge1xyXG4gICAgICAgICAgeDogTWF0aC5taW4ocmVjdC54MSwgcmVjdC54MiwgcmVjdC54MywgcmVjdC54NCksXHJcbiAgICAgICAgICB5OiBNYXRoLm1pbihyZWN0LnkxLCByZWN0LnkyLCByZWN0LnkzLCByZWN0Lnk0KSxcclxuICAgICAgICAgIHdpZHRoOiBNYXRoLm1heChyZWN0LngxLCByZWN0LngyLCByZWN0LngzLCByZWN0Lng0KSAtIE1hdGgubWluKHJlY3QueDEsIHJlY3QueDIsIHJlY3QueDMsIHJlY3QueDQpLFxyXG4gICAgICAgICAgaGVpZ2h0OiBNYXRoLm1heChyZWN0LnkxLCByZWN0LnkyLCByZWN0LnkzLCByZWN0Lnk0KSAtIE1hdGgubWluKHJlY3QueTEsIHJlY3QueTIsIHJlY3QueTMsIHJlY3QueTQpXHJcbiAgICAgICAgfTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY2FudmFzQ2FsbEhhbmRsZXJzID0ge1xyXG4gICAgbGluZVdpZHRoOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUubGluZVdpZHRoc1tzdGF0ZS5saW5lV2lkdGhzLmxlbmd0aCAtIDFdID0gY2FsbC52YWw7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBmaWxsUmVjdDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICB3aWR0aCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgaGVpZ2h0ID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBuZXdCb3ggPSB7eDogeCwgeTogeSwgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHN0cm9rZVJlY3Q6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgd2lkdGggPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIGhlaWdodCA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgc2NhbGVkTGluZVdpZHRoID0gc3RhdGUubGluZVdpZHRoICE9PSAxID8gc3RhdGUubGluZVdpZHRoIDogMCxcclxuICAgICAgICB4U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgeVNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4IC0geFNjYWxlZExpbmVXaWR0aCAvIDIsIHk6IHkgLSB5U2NhbGVkTGluZVdpZHRoIC8gMiwgd2lkdGg6IHdpZHRoICsgeFNjYWxlZExpbmVXaWR0aCwgaGVpZ2h0OiBoZWlnaHQgKyB5U2NhbGVkTGluZVdpZHRofTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgcmVjdDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICB3aWR0aCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgaGVpZ2h0ID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueTtcclxuICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdyZWN0JywgeDogeCwgeTogeSwgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIGN4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICBjeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgciA9IGNhbGwuYXJndW1lbnRzWzJdLFxyXG4gICAgICAgIHN4ID0gc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgc3kgPSBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBzQW5nbGUgPSBjYWxsLmFyZ3VtZW50c1szXSxcclxuICAgICAgICBlQW5nbGUgPSBjYWxsLmFyZ3VtZW50c1s0XSxcclxuICAgICAgICBjb3VudGVyY2xvY2t3aXNlID0gY2FsbC5hcmd1bWVudHNbNV0gfHwgZmFsc2U7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnYXJjJywgY3g6IGN4LCBjeTogY3ksIHI6IHIsIHN4OiBzeCwgc3k6IHN5LCBzQW5nbGU6IHNBbmdsZSwgZUFuZ2xlOiBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2U6IGNvdW50ZXJjbG9ja3dpc2V9KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIG1vdmVUbzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4MSA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeTEgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55O1xyXG4gICAgICBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbiA9IHt4OiB4MSwgeTogeTF9O1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgbGluZVRvOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHgxID0gc3RhdGUubW92ZVRvTG9jYXRpb24ueCxcclxuICAgICAgICB5MSA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLnksXHJcbiAgICAgICAgeDIgPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkyID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueTtcclxuICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdsaW5lVG8nLCB4MTogeDEsIHkxOiB5MSwgeDI6IHgyLCB5MjogeTJ9KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyY1RvOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHgwID0gc3RhdGUubW92ZVRvTG9jYXRpb24ueCxcclxuICAgICAgICAgIHkwID0gc3RhdGUubW92ZVRvTG9jYXRpb24ueSxcclxuICAgICAgICAgIHgxID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICAgIHkxID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICAgIHgyID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICAgIHkyID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICAgIHIgPSBjYWxsLmFyZ3VtZW50c1s0XSxcclxuICAgICAgICAgIHN4ID0gc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgICBzeSA9IHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgICAgZGVjb21wb3NpdGlvbiA9IGRlY29tcG9zZUFyY1RvKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHIsIHN4LCBzeSk7XHJcbiAgICAgIGlmIChkZWNvbXBvc2l0aW9uLmxpbmUpIHtcclxuICAgICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2xpbmVUbycsIHgxOiBkZWNvbXBvc2l0aW9uLmxpbmUueDEsIHkxOiBkZWNvbXBvc2l0aW9uLmxpbmUueTEsIHgyOiBkZWNvbXBvc2l0aW9uLmxpbmUueDIsIHkyOiBkZWNvbXBvc2l0aW9uLmxpbmUueTJ9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZGVjb21wb3NpdGlvbi5hcmMpIHtcclxuICAgICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2FyYycsIGN4OiBkZWNvbXBvc2l0aW9uLmFyYy54LCBjeTogZGVjb21wb3NpdGlvbi5hcmMueSwgcjogciwgc3g6IHN4LCBzeTogc3ksIHNBbmdsZTogZGVjb21wb3NpdGlvbi5hcmMuc0FuZ2xlLCBlQW5nbGU6IGRlY29tcG9zaXRpb24uYXJjLmVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZTogZGVjb21wb3NpdGlvbi5hcmMuY291bnRlcmNsb2Nrd2lzZX0pO1xyXG4gICAgICB9XHJcbiAgICAgIHN0YXRlLm1vdmVUb0xvY2F0aW9uID0ge3g6IGRlY29tcG9zaXRpb24ucG9pbnQueCwgeTogZGVjb21wb3NpdGlvbi5wb2ludC55fTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHNhdmU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS50cmFuc2Zvcm1zLnB1c2goW10pO1xyXG4gICAgICBzdGF0ZS5saW5lV2lkdGhzLnB1c2gobGFzdEVsZW1lbnQoc3RhdGUubGluZVdpZHRocykpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgcmVzdG9yZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLnRyYW5zZm9ybXMucG9wKCk7XHJcbiAgICAgIHN0YXRlLmxpbmVXaWR0aHMucG9wKCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICB0cmFuc2xhdGU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBsYXN0RWxlbWVudChzdGF0ZS50cmFuc2Zvcm1zKVxyXG4gICAgICAgIC5wdXNoKHt0cmFuc2xhdGU6IHt4OiBjYWxsLmFyZ3VtZW50c1swXSwgeTogY2FsbC5hcmd1bWVudHNbMV19fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBzY2FsZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIGxhc3RFbGVtZW50KHN0YXRlLnRyYW5zZm9ybXMpXHJcbiAgICAgICAgLnB1c2goe3NjYWxlOiB7eDogY2FsbC5hcmd1bWVudHNbMF0sIHk6IGNhbGwuYXJndW1lbnRzWzFdfX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYmVnaW5QYXRoOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoID0gW107XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBmaWxsOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgcmV0dXJuIHN0YXRlLnNoYXBlc0luUGF0aC5yZWR1Y2UoKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICAgIHZhciBoYW5kbGVyID0gZ2V0UGF0aEZpbGxTaGFwZUhhbmRsZXIoc2hhcGUpO1xyXG4gICAgICAgIHJldHVybiBoYW5kbGVyKHN0YXRlLCBzaGFwZSk7XHJcbiAgICAgIH0sIHN0YXRlKTtcclxuICAgIH0sXHJcbiAgICBzdHJva2U6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgc3RhdGUuc2hhcGVzSW5QYXRoLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHNoYXBlID0gc3RhdGUuc2hhcGVzSW5QYXRoW2ldLFxyXG4gICAgICAgICAgICBoYW5kbGVyID0gZ2V0UGF0aFN0cm9rZVNoYXBlSGFuZGxlcihzaGFwZSk7XHJcbiAgICAgICAgc3RhdGUgPSBoYW5kbGVyKHN0YXRlLCBzaGFwZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG51bGxDYW52YXNDYWxsSGFuZGxlciA9IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH0sXHJcblxyXG4gIGdldENhbnZhc0NhbGxIYW5kbGVyID0gKGNhbGwpID0+IHtcclxuICAgIHJldHVybiBjYW52YXNDYWxsSGFuZGxlcnNbY2FsbC5tZXRob2RdIHx8IGNhbnZhc0NhbGxIYW5kbGVyc1tjYWxsLmF0dHJdIHx8IG51bGxDYW52YXNDYWxsSGFuZGxlcjtcclxuICB9LFxyXG5cclxuICBnZXRQYXRoRmlsbFNoYXBlSGFuZGxlciA9IChzaGFwZSkgPT4ge1xyXG4gICAgcmV0dXJuIHBhdGhGaWxsU2hhcGVIYW5kbGVyc1tzaGFwZS50eXBlXTtcclxuICB9LFxyXG5cclxuICBnZXRQYXRoU3Ryb2tlU2hhcGVIYW5kbGVyID0gKHNoYXBlKSA9PiB7XHJcbiAgICByZXR1cm4gcGF0aFN0cm9rZVNoYXBlSGFuZGxlcnNbc2hhcGUudHlwZV07XHJcbiAgfSxcclxuXHJcbiAgcHJlQ2FudmFzQ2FsbEhhbmRsZXIgPSAoc3RhdGUpID0+IHtcclxuICAgIHN0YXRlLnRyYW5zZm9ybSA9IHRvdGFsVHJhbnNmb3JtKGZsYXR0ZW4oc3RhdGUudHJhbnNmb3JtcykpO1xyXG4gICAgc3RhdGUubGluZVdpZHRoID0gbGFzdEVsZW1lbnQoc3RhdGUubGluZVdpZHRocyk7XHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbiAgfSxcclxuXHJcbiAgZ2V0QkJveCA9IChzaGFwZSkgPT4ge1xyXG4gICAgdmFyIHN0YXRlID0gY3JlYXRlTmV3Q2FudmFzQ2FsbFN0YXRlKCk7XHJcbiAgICBzdGF0ZSA9IHNoYXBlLnJlZHVjZSgoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIGhhbmRsZXIgPSBnZXRDYW52YXNDYWxsSGFuZGxlcihjYWxsKTtcclxuICAgICAgcmV0dXJuIGhhbmRsZXIocHJlQ2FudmFzQ2FsbEhhbmRsZXIoc3RhdGUpLCBjYWxsKTtcclxuICAgIH0sIGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSgpKTtcclxuICAgIHJldHVybiBzdGF0ZS5ib3g7XHJcbiAgfSxcclxuXHJcbiAgZmxhdHRlbiA9IChhcnJheSkgPT4ge1xyXG4gICAgcmV0dXJuIGFycmF5XHJcbiAgICAgIC5yZWR1Y2UoKHByZXZpb3VzQXJyYXksIGN1cnJlbnRBcnJheSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBwcmV2aW91c0FycmF5LmNvbmNhdChjdXJyZW50QXJyYXkpO1xyXG4gICAgICB9LCBbXSk7XHJcbiAgfSxcclxuXHJcbiAgbGFzdEVsZW1lbnQgPSAoYXJyYXkpID0+IHtcclxuICAgIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcclxuICB9LFxyXG5cclxuICBmaXJzdFRydXRoeU9yWmVybyA9ICh2YWwxLCB2YWwyKSA9PntcclxuICAgIGlmICh2YWwxIHx8IHZhbDEgPT09IDApIHtcclxuICAgICAgcmV0dXJuIHZhbDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsMjtcclxuICB9LFxyXG5cclxuICB1bmlvbiA9IChib3gxLCBib3gyKSA9PiB7XHJcbiAgICBib3gxID0ge1xyXG4gICAgICB4OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLngsIGJveDIueCksXHJcbiAgICAgIHk6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDEueSwgYm94Mi55KSxcclxuICAgICAgd2lkdGg6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDEud2lkdGgsIGJveDIud2lkdGgpLFxyXG4gICAgICBoZWlnaHQ6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDEuaGVpZ2h0LCBib3gyLmhlaWdodClcclxuICAgIH07XHJcbiAgICBib3gyID0ge1xyXG4gICAgICB4OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLngsIGJveDEueCksXHJcbiAgICAgIHk6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDIueSwgYm94MS55KSxcclxuICAgICAgd2lkdGg6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDIud2lkdGgsIGJveDEud2lkdGgpLFxyXG4gICAgICBoZWlnaHQ6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDIuaGVpZ2h0LCBib3gxLmhlaWdodClcclxuICAgIH07XHJcbiAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICB4OiBNYXRoLm1pbihib3gxLngsIGJveDIueCksXHJcbiAgICAgIHk6IE1hdGgubWluKGJveDEueSwgYm94Mi55KSxcclxuICAgICAgd2lkdGg6IE1hdGgubWF4KGJveDEud2lkdGgsIGJveDIud2lkdGgsIGJveDEueCA8IGJveDIueFxyXG4gICAgICAgID8gYm94MS53aWR0aCArIGJveDIud2lkdGggKyAoYm94Mi54IC0gKGJveDEueCArIGJveDEud2lkdGgpKVxyXG4gICAgICAgIDogYm94MS53aWR0aCArIGJveDIud2lkdGggKyAoYm94MS54IC0gKGJveDIueCArIGJveDIud2lkdGgpKSksXHJcbiAgICAgIGhlaWdodDogTWF0aC5tYXgoYm94MS5oZWlnaHQsIGJveDIuaGVpZ2h0LCBib3gxLnkgPCBib3gyLnlcclxuICAgICAgICA/IGJveDEuaGVpZ2h0ICsgYm94Mi5oZWlnaHQgKyAoYm94Mi55IC0gKGJveDEueSArIGJveDEuaGVpZ2h0KSlcclxuICAgICAgICA6IGJveDEuaGVpZ2h0ICsgYm94Mi5oZWlnaHQgKyAoYm94MS55IC0gKGJveDIueSArIGJveDIuaGVpZ2h0KSkpXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9LFxyXG5cclxuICBib3hQb2ludHMgPSAocG9pbnRzKSA9PiB7XHJcbiAgICB2YXIgeGVzID0gcG9pbnRzLm1hcCgocCkgPT4gcC54KSxcclxuICAgICAgICB5ZXMgPSBwb2ludHMubWFwKChwKSA9PiBwLnkpLFxyXG4gICAgICAgIG1pblggPSBNYXRoLm1pbi5hcHBseShudWxsLCB4ZXMpLFxyXG4gICAgICAgIG1heFggPSBNYXRoLm1heC5hcHBseShudWxsLCB4ZXMpLFxyXG4gICAgICAgIG1pblkgPSBNYXRoLm1pbi5hcHBseShudWxsLCB5ZXMpLFxyXG4gICAgICAgIG1heFkgPSBNYXRoLm1heC5hcHBseShudWxsLCB5ZXMpLFxyXG4gICAgICAgIGJveCA9IHt4OiBOYU4sIHk6IE5hTiwgd2lkdGg6IE5hTiwgaGVpZ2h0OiBOYU59O1xyXG4gICAgaWYgKG1pblggIT09ICtJbmZpbml0eSAmJiBtYXhYICE9PSAtSW5maW5pdHkgJiYgbWluWSAhPT0gK0luZmluaXR5ICYmIG1heFkgIT09IC1JbmZpbml0eSkge1xyXG4gICAgICBib3ggPSB7XHJcbiAgICAgICAgeDogbWluWCxcclxuICAgICAgICB5OiBtaW5ZLFxyXG4gICAgICAgIHdpZHRoOiBtYXhYIC0gbWluWCxcclxuICAgICAgICBoZWlnaHQ6IG1heFkgLSBtaW5ZXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYm94O1xyXG4gIH0sXHJcblxyXG4gIHRvdGFsVHJhbnNmb3JtID0gKHRyYW5zZm9ybXMpID0+IHtcclxuICAgIHJldHVybiB0cmFuc2Zvcm1zXHJcbiAgICAgIC5tYXAoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRyYW5zbGF0ZTogdmFsdWUudHJhbnNsYXRlIHx8IHt4OiAwLCB5OiAwfSxcclxuICAgICAgICAgIHNjYWxlOiB2YWx1ZS5zY2FsZSB8fCB7eDogMSwgeTogMX1cclxuICAgICAgICB9O1xyXG4gICAgICB9KVxyXG4gICAgICAucmVkdWNlKChwcmV2aW91c1ZhbHVlLCBjdXJyZW50VmFsdWUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHJhbnNsYXRlOiB7XHJcbiAgICAgICAgICAgIHg6IHByZXZpb3VzVmFsdWUudHJhbnNsYXRlLnggKyBjdXJyZW50VmFsdWUudHJhbnNsYXRlLnggKiBwcmV2aW91c1ZhbHVlLnNjYWxlLngsXHJcbiAgICAgICAgICAgIHk6IHByZXZpb3VzVmFsdWUudHJhbnNsYXRlLnkgKyBjdXJyZW50VmFsdWUudHJhbnNsYXRlLnkgKiBwcmV2aW91c1ZhbHVlLnNjYWxlLnlcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzY2FsZToge1xyXG4gICAgICAgICAgICB4OiBwcmV2aW91c1ZhbHVlLnNjYWxlLnggKiBjdXJyZW50VmFsdWUuc2NhbGUueCxcclxuICAgICAgICAgICAgeTogcHJldmlvdXNWYWx1ZS5zY2FsZS55ICogY3VycmVudFZhbHVlLnNjYWxlLnlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9LCB7dHJhbnNsYXRlOiB7eDogMCwgeTogMH0sIHNjYWxlOiB7eDogMSwgeTogMX19KTtcclxuICB9LFxyXG5cclxuICBnZXRSZWN0QXJvdW5kTGluZSA9ICh4MSwgeTEsIHgyLCB5Miwgd2lkdGgpID0+IHtcclxuICAgIHZhciByZWN0O1xyXG4gICAgaWYgKHgxID09PSB5MSAmJiB4MSA9PT0geDIgJiYgeDEgPT09IHkyKSB7XHJcbiAgICAgIHJlY3QgPSB7XHJcbiAgICAgICAgeDE6IHgxLCB5MTogeDEsICB4MjogeDEsIHkyOiB4MSxcclxuICAgICAgICB4NDogeDEsIHk0OiB4MSwgIHgzOiB4MSwgeTM6IHgxXHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZWN0ID0gZ2V0UmVjdEFyb3VuZExvbmdMaW5lKHgxLCB5MSwgeDIsIHkyLCB3aWR0aCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVjdDtcclxuICB9LFxyXG5cclxuICBnZXRSZWN0QXJvdW5kTG9uZ0xpbmUgPSAoeDEsIHkxLCB4MiwgeTIsIHdpZHRoKSA9PiB7XHJcbiAgICAvLyAgciA9IHRoZSByYWRpdXMgb3IgdGhlIGdpdmVuIGRpc3RhbmNlIGZyb20gYSBnaXZlbiBwb2ludCB0byB0aGUgbmVhcmVzdCBjb3JuZXJzIG9mIHRoZSByZWN0XHJcbiAgICAvLyAgYSA9IHRoZSBhbmdsZSBiZXR3ZWVuIHRoZSBsaW5lIGFuZCB0aGUgaG9yaXpvbnRhbCBheGlzXHJcbiAgICAvLyAgYjEsIGIyID0gdGhlIGFuZ2xlIGJldHdlZW4gaGFsZiB0aGUgaGlnaHQgb2YgdGhlIHJlY3RhbmdsZSBhbmQgdGhlIGhvcml6b250YWwgYXhpc1xyXG4gICAgLy9cclxuICAgIC8vICBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUgdGhlIGdpdmVuIGxpbmUgaXMgaG9yaXpvbnRhbCwgc28gYSA9IDAuXHJcbiAgICAvLyAgVGhlIGdpdmVuIGxpbmUgaXMgYmV0d2VlbiB0aGUgdHdvIEAgc3ltYm9scy5cclxuICAgIC8vICBUaGUgKyBzeW1ib2xzIGFyZSB0aGUgY29ybmVycyBvZiByZWN0YW5nbGUgdG8gYmUgZGV0ZXJtaW5lZC5cclxuICAgIC8vICBJbiBvcmRlciB0byBmaW5kIHRoZSBiMSBhbmQgYjIgYW5nbGVzIHdlIGhhdmUgdG8gYWRkIFBJLzIgYW5kIHJlc3BlY3Rpdmx5IHN1YnRyYWN0IFBJLzIuXHJcbiAgICAvLyAgYjEgaXMgdmVydGljYWwgYW5kIHBvaW50aW5nIHVwd29yZHMgYW5kIGIyIGlzIGFsc28gdmVydGljYWwgYnV0IHBvaW50aW5nIGRvd253b3Jkcy5cclxuICAgIC8vICBFYWNoIGNvcm5lciBpcyByIG9yIHdpZHRoIC8gMiBmYXIgYXdheSBmcm9tIGl0cyBjb3Jlc3BvbmRlbnQgbGluZSBlbmRpbmcuXHJcbiAgICAvLyAgU28gd2Uga25vdyB0aGUgZGlzdGFuY2UgKHIpLCB0aGUgc3RhcnRpbmcgcG9pbnRzICh4MSwgeTEpIGFuZCAoeDIsIHkyKSBhbmQgdGhlIChiMSwgYjIpIGRpcmVjdGlvbnMuXHJcbiAgICAvL1xyXG4gICAgLy8gICh4MSx5MSkgICAgICAgICAgICAgICAgICAgICh4Mix5MilcclxuICAgIC8vICAgICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcclxuICAgIC8vICAgICAgXiAgICAgICAgICAgICAgICAgICAgICAgIF5cclxuICAgIC8vICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICAgIC8vICAgICAgfCBiMSAgICAgICAgICAgICAgICAgICAgIHwgYjFcclxuICAgIC8vICAgICAgQD09PT09PT09PT09PT09PT09PT09PT09PUBcclxuICAgIC8vICAgICAgfCBiMiAgICAgICAgICAgICAgICAgICAgIHwgYjJcclxuICAgIC8vICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICAgIC8vICAgICAgdiAgICAgICAgICAgICAgICAgICAgICAgIHZcclxuICAgIC8vICAgICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcclxuICAgIC8vICAoeDQseTQpICAgICAgICAgICAgICAgICAgICAoeDMseTMpXHJcbiAgICAvL1xyXG5cclxuICAgIHZhciByID0gd2lkdGggLyAyLFxyXG4gICAgICBhID0gTWF0aC5hdGFuKCh5MiAtIHkxKSAvICh4MiAtIHgxKSksXHJcbiAgICAgIGIxID0gYSArIE1hdGguUEkvMixcclxuICAgICAgYjIgPSBhIC0gTWF0aC5QSS8yLFxyXG4gICAgICByeDEgPSByICogTWF0aC5jb3MoYjEpICsgeDEsXHJcbiAgICAgIHJ5MSA9IHIgKiBNYXRoLnNpbihiMSkgKyB5MSxcclxuICAgICAgcngyID0gciAqIE1hdGguY29zKGIxKSArIHgyLFxyXG4gICAgICByeTIgPSByICogTWF0aC5zaW4oYjEpICsgeTIsXHJcbiAgICAgIHJ4MyA9IHIgKiBNYXRoLmNvcyhiMikgKyB4MixcclxuICAgICAgcnkzID0gciAqIE1hdGguc2luKGIyKSArIHkyLFxyXG4gICAgICByeDQgPSByICogTWF0aC5jb3MoYjIpICsgeDEsXHJcbiAgICAgIHJ5NCA9IHIgKiBNYXRoLnNpbihiMikgKyB5MTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHgxOiByeDEsIHkxOiByeTEsICB4MjogcngyLCB5MjogcnkyLFxyXG4gICAgICB4NDogcng0LCB5NDogcnk0LCAgeDM6IHJ4MywgeTM6IHJ5M1xyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBnZXRTY2FsZWRXaWR0aE9mTGluZSA9ICh4MSwgeTEsIHgyLCB5Miwgc3gsIHN5LCB3aWR0aCkgPT4ge1xyXG4gICAgLy8gIFRoZSBvcmlnaW5hbCBwb2ludHMgYXJlIG5vdCBtb3ZlZC4gT25seSB0aGUgd2lkdGggd2lsbCBiZSBzY2FsZWQuXHJcbiAgICAvLyAgVGhlIHdpZHRoIG9mIGFuIGhvcml6b250YWwgbGluZSB3aWxsIGJlIHNjYWxlZCB3aXRoIHRoZSBzeSByYXRpbyBvbmx5LlxyXG4gICAgLy8gIFRoZSB3aWR0aCBvZiBhIHZlcnRpdmFsIGxpbmUgd2lsbCBiZSBzY2FsZWQgd2l0aCB0aGUgc3ggcmF0aW8gb25seS5cclxuICAgIC8vICBUaGUgd2lkdGggb2YgYW4gb2JsaXF1ZSBsaW5lIHdpbGwgYmUgc2NhbGVkIHdpdGggYm90aCB0aGUgc3ggYW5kIHN5XHJcbiAgICAvL2J1dCBwcm9wb3J0aW9uYWwgd2l0aCB0aGUgYW5nbGUgYmV0d2VlbiB0aGUgbGluZSBhbmQgdGhlIHggYW5kIHkgYXhlcy5cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuXFxcclxuICAgIC8vICAgICAgICAgICAgICAgLlxcICAoeDIseTIpICAgICAgICAgICAgICAgICAgICAgICAgIC4uLlxcICAoeDIseTIpXHJcbiAgICAvLyAgICAgICAgICAgICAgLi4uQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uLi5AXHJcbiAgICAvLyAgICAgICAgICAgICAuLi4vLlxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uLi4vLlxcXHJcbiAgICAvLyAgICAgICAgICAgIC4uLi8uLi4gICAgICAgICAgICAgIHN4ICAgICAgICAgICAgIC4uLi4uLy4uLlxcXHJcbiAgICAvLyAgICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICstLS0+ICAgICAgICAgICAgLi4uLi4vLi4uLi5cclxuICAgIC8vICAgICAgICAgIC4uLi8uLi4gICAgICAgICAgICAgfCAgICAgICAgICAgICAgIC4uLi4uLy4uLi4uXHJcbiAgICAvLyAgICAgICAgIC4uLi8uLi4gICAgICAgICAgICAgIHwgICAgICAgICAgICAgICBcXC4uLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICBcXC4vLi4uICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICBcXC4vLi4uLi5cclxuICAgIC8vICAgICAgICAgIEAuLi4gICAgICAgICAgICAgc3kgdiAgICAgICAgICAgICAgICAgQC4uLi4uXHJcbiAgICAvLyAgKHgxLHkxKSAgXFwuICAgICAgICAgICAgICAgICAgICAgICAgICAgKHgxLHkxKSAgXFwuLi5cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXC5cclxuICAgIC8vXHJcbiAgICB2YXIgYSA9IE1hdGguYXRhbigoeTIgLSB5MSkgLyAoeDIgLSB4MSkpLFxyXG4gICAgICBzaW5hID0gTWF0aC5zaW4oYSksIGNvc2EgPSBNYXRoLmNvcyhhKSxcclxuICAgICAgc2NhbGVkV2lkdGggPSB3aWR0aCAqIE1hdGguc3FydChzeCpzeCAqIHNpbmEqc2luYSArIHN5KnN5ICogY29zYSpjb3NhKTtcclxuICAgIHJldHVybiBzY2FsZWRXaWR0aDtcclxuICB9LFxyXG5cclxuICBnZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50ID0gKHgxLCB5MSwgeDIsIHkyLCBkaXN0YW5jZSkgPT4ge1xyXG4gICAgdmFyIHJlY3QgPSBnZXRSZWN0QXJvdW5kTG9uZ0xpbmUoeDEsIHkxLCB4MiwgeTIsIDIgKiBkaXN0YW5jZSk7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICB7eDE6IHJlY3QueDEsIHkxOiByZWN0LnkxLCB4MjogcmVjdC54MiwgeTI6IHJlY3QueTJ9LFxyXG4gICAgICB7eDE6IHJlY3QueDQsIHkxOiByZWN0Lnk0LCB4MjogcmVjdC54MywgeTI6IHJlY3QueTN9XHJcbiAgICBdO1xyXG4gIH0sXHJcblxyXG4gIGdldEludGVyc2VjdGlvbk9mVHdvTGluZXMgPSAobDEsIGwyKSA9PiB7XHJcbiAgICB2YXIgYTEgPSBsMS55MiAtIGwxLnkxLCBiMSA9IGwxLngxIC0gbDEueDIsIGMxID0gbDEueDIqbDEueTEgLSBsMS54MSpsMS55MixcclxuICAgICAgICBhMiA9IGwyLnkyIC0gbDIueTEsIGIyID0gbDIueDEgLSBsMi54MiwgYzIgPSBsMi54MipsMi55MSAtIGwyLngxKmwyLnkyLFxyXG4gICAgICAgIHggPSAoYzIqYjEgLSBjMSpiMikgLyAoYTEqYjIgLSBhMipiMSksXHJcbiAgICAgICAgeSA9IGwyLnkxID09PSBsMi55MiA/IGwyLnkxIDogKC1jMSAtIGExKngpIC8gYjE7XHJcbiAgICByZXR1cm4ge3g6IHgsIHk6IHl9O1xyXG4gIH0sXHJcblxyXG4gIGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xyXG4gICAgcmV0dXJuIE1hdGguc3FydCgoeDIteDEpKih4Mi14MSkgKyAoeTIteTEpKih5Mi15MSkpO1xyXG4gIH0sXHJcblxyXG4gIGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzID0gKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMpID0+IHtcclxuICAgIHZhciBhID0gZ2V0RGlzdGFuY2VCZXR3ZWVuVHdvUG9pbnRzKHgxLCB5MSwgeDIsIHkyKSxcclxuICAgICAgICBiID0gZ2V0RGlzdGFuY2VCZXR3ZWVuVHdvUG9pbnRzKHgyLCB5MiwgeDMsIHkzKSxcclxuICAgICAgICBjID0gZ2V0RGlzdGFuY2VCZXR3ZWVuVHdvUG9pbnRzKHgzLCB5MywgeDEsIHkxKSxcclxuICAgICAgICBjb3NDID0gKGEqYSArIGIqYiAtIGMqYykgLyAoMiphKmIpLFxyXG4gICAgICAgIEMgPSBNYXRoLmFjb3MoY29zQyk7XHJcbiAgICByZXR1cm4gQztcclxuICB9LFxyXG5cclxuICBwZXJtdXRlTGluZXMgPSAoYWxwaGFMaW5lcywgYmV0YUxpbmVzKSA9PiB7XHJcbiAgICB2YXIgcGVybXV0YXRpb25zID0gW107XHJcbiAgICBhbHBoYUxpbmVzLmZvckVhY2goKGFscGhhTGluZSkgPT4ge1xyXG4gICAgICBiZXRhTGluZXMuZm9yRWFjaCgoYmV0YUxpbmUpID0+IHtcclxuICAgICAgICBwZXJtdXRhdGlvbnMucHVzaCh7YWxwaGE6IGFscGhhTGluZSwgYmV0YTogYmV0YUxpbmV9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIHBlcm11dGF0aW9ucztcclxuICB9LFxyXG5cclxuICBhbG1vc3RFcXVhbCA9IChhLCBiKSA9PiB7XHJcbiAgICAvLyBncm9zcyBhcHByb3hpbWF0aW9uIHRvIGNvdmVyIHRoZSBmbG90IGFuZCB0cmlnb25vbWV0cmljIHByZWNpc2lvblxyXG4gICAgcmV0dXJuIGEgPT09IGIgfHwgTWF0aC5hYnMoYSAtIGIpIDwgMjAgKiBFUFNJTE9OO1xyXG4gIH0sXHJcblxyXG4gIGlzQ2VudGVySW5CZXR3ZWVuID0gKGN4LCBjeSwgeDAsIHkwLCB4MSwgeTEsIHgyLCB5MikgPT4ge1xyXG4gICAgLy9cclxuICAgIC8vICBUcnVlIGlzIHJldHVybmVkIGluIHNpdHVhdGlvbnMgbGlrZSB0aGlzIG9uZTpcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgIC9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgIC9cclxuICAgIC8vICAgICAgICAgICAgICA9PT1QMD09PT09PT09PT1QMT09PT09PT09PT09PT1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgJyAgIC9cclxuICAgIC8vICAgICAgICAgICAgICAtLS0tLS0tLS1DLS0tLy0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgJyAgIFAyXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAnICAgL1xyXG4gICAgLy9cclxuICAgIHZhciBhID0gZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoeDIsIHkyLCB4MSwgeTEsIHgwLCB5MCksXHJcbiAgICAgICAgYTEgPSBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyhjeCwgY3ksIHgxLCB5MSwgeDAsIHkwKSxcclxuICAgICAgICBhMiA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzKGN4LCBjeSwgeDEsIHkxLCB4MiwgeTIpO1xyXG4gICAgcmV0dXJuIGFsbW9zdEVxdWFsKGEsIGExICsgYTIpICYmIChhMSArIGEyIDw9IE1hdGguUEkpO1xyXG4gIH0sXHJcblxyXG4gIGdldFRoZUNlbnRlck9mVGhlQ29ybmVyID0gKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIGRpc3RhbmNlLCBzeCwgc3kpID0+IHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQgIGRcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICBhbHBoYSBsaW5lIDAgICAgLS0tLS0tLS0tLS0tLSctLS8tLSctLS0tLS0tLS1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICcgICAgICAgICAgICAgZFxyXG4gICAgLy8gICAgIGdpdmVuIGxpbmUgICAgPT09UD09PT09PT09PT1QPT09PT09PT09PT09PT1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnICAgICAgICAgICAgICAgZFxyXG4gICAgLy8gICBhbHBoYSBsaW5lIDEgICAgLS0tLS0tLS0tQy0tLy0tJy0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICcgIFAgICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy9cclxuICAgIC8vICAgICBiZXRhIGxpbmVzIDAgJiAxIHdpdGggb25lIG9mIHRoZSBnaXZlbiBsaW5lIGluYmV0d2VlblxyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgUCA9IHRoZSBnaXZlbiBQMCwgUDEsIFAyIHBvaW50c1xyXG4gICAgLy9cclxuICAgIC8vICBkID0gdGhlIGdpdmVuIGRpc3RhbmNlIC8gcmFkaXVzIG9mIHRoZSBjaXJjbGVcclxuICAgIC8vXHJcbiAgICAvLyAgQyA9IHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZS9jb3JuZXIgdG8gYmUgZGV0ZXJtaW5lZFxyXG5cclxuICAgIHZhciBkMSA9IGdldFNjYWxlZFdpZHRoT2ZMaW5lKHgwLCB5MCwgeDEsIHkxLCBzeCwgc3ksIGRpc3RhbmNlKSxcclxuICAgICAgICBkMiA9IGdldFNjYWxlZFdpZHRoT2ZMaW5lKHgxLCB5MSwgeDIsIHkyLCBzeCwgc3ksIGRpc3RhbmNlKSxcclxuICAgICAgICBhbHBoYUxpbmVzID0gZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCh4MCwgeTAsIHgxLCB5MSwgZDEpLFxyXG4gICAgICAgIGJldGFMaW5lcyA9IGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQoeDEsIHkxLCB4MiwgeTIsIGQyKSxcclxuICAgICAgICBwZXJtdXRhdGlvbnMgPSBwZXJtdXRlTGluZXMoYWxwaGFMaW5lcywgYmV0YUxpbmVzKSxcclxuICAgICAgICBpbnRlcnNlY3Rpb25zID0gcGVybXV0YXRpb25zLm1hcCgocCkgPT4gZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcyhwLmFscGhhLCBwLmJldGEpKSxcclxuICAgICAgICBjZW50ZXIgPSBpbnRlcnNlY3Rpb25zLmZpbHRlcigoaSkgPT4gaXNDZW50ZXJJbkJldHdlZW4oaS54LCBpLnksIHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpKVswXTtcclxuXHJcbiAgICByZXR1cm4gY2VudGVyIHx8IHt4OiBOYU4sIHk6IE5hTn07XHJcbiAgfSxcclxuXHJcbiAgZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhciA9ICh4MSwgeTEsIHgyLCB5MiwgY3gsIGN5KSA9PiB7XHJcbiAgICB2YXIgbSA9ICh5MiAtIHkxKSAvICh4MiAtIHgxKSxcclxuICAgICAgICBjbSA9IC0xIC8gbSxcclxuICAgICAgICBDID0geTEqKHgyIC0geDEpIC0geDEqKHkyIC0geTEpLFxyXG4gICAgICAgIHggPSAoQyAtICh4MiAtIHgxKSooY3kgLSBjbSpjeCkpIC8gKGNtKih4MiAtIHgxKSArIHkxIC0geTIpLFxyXG4gICAgICAgIHkgPSBjbSooeCAtIGN4KSArIGN5O1xyXG4gICAgcmV0dXJuIG0gPT09IDAgLy8gaG9yaXpvbnRhbFxyXG4gICAgICA/IHt4OiBjeCwgeTogeTF9XHJcbiAgICAgIDogKG0gPT09IEluZmluaXR5IC8vIHZlcnRpY2FsXHJcbiAgICAgICAgPyB7eDogeDEsIHk6IGN5fVxyXG4gICAgICAgIDoge3g6IHgsIHk6IHl9KTtcclxuICB9LFxyXG5cclxuICB4eVRvQXJjQW5nbGUgPSAoY3gsIGN5LCB4LCB5KSA9PiB7XHJcbiAgICB2YXIgaG9yaXpvbnRhbFggPSBjeCArIDEsXHJcbiAgICAgICAgaG9yaXpvbnRhbFkgPSBjeSxcclxuICAgICAgICBhID0gTWF0aC5hYnMoZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoeCwgeSwgY3gsIGN5LCBob3Jpem9udGFsWCwgaG9yaXpvbnRhbFkpKTtcclxuICAgIGlmKHkgPCBjeSkge1xyXG4gICAgICAvL3RoaXJkICYgZm9ydGggcXVhZHJhbnRzXHJcbiAgICAgIGEgPSBNYXRoLlBJICsgTWF0aC5QSSAtIGE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYTtcclxuICB9LFxyXG5cclxuICBzY2FsZWRSYWRpdXMgPSAociwgc3gsIHN5LCBhKSA9PiB7XHJcbiAgICAvL1xyXG4gICAgLy8gIFRoZSBzeCBhbmQgc3kgc2NhbGluZ3MgY2FuIGJlIGRpZmZlcmVudCBzbyB0aGUgY2lyY2xlIGxvb2tzIG1vcmUgbGlrZSBhblxyXG4gICAgLy9lbGxpcHNlLiBUaGlzIGZ1bmN0aW9uIGlzIHJldHVybmluZyB0aGUgcmFkaXVzIGNvcnJzcG9uZGluZyB0byB0aGUgc3BlY2lmaWVkIGFuZ2xlXHJcbiAgICAvL2FuZCB0YWtpbmcgaW50byBhY2NvdW50IHRoZSBzeCBhbmQgc3kgdmFsdWVzLlxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgKiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgICAgKlxyXG4gICAgLy8gICAgICAgICAqICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAqICAgICAgICAgICAgICAgICAgICpcclxuICAgIC8vICAgICAgICogICAgICAgICAgICAgKiAgICAgICAgICAgc3ggICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICpcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICArLS0tLS0tPiAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAqXHJcbiAgICAvLyAgICAgICAqICAgICAgICAgICAgICogICAgICAgfFxyXG4gICAgLy8gICAgICAgICAqICAgICAgICAgKiAgICAgIHN5IHYgICAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICpcclxuICAgIC8vICAgICAgICAgICAgKiAgICogICAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICpcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqICAgICAgICAgICAgICAgICAgICAqXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgICAgICpcclxuICAgIC8vXHJcbiAgICB2YXIgbmEgPSBhICUgKDIqUEkpOyAvL25vcm1hbGl6ZWQgYW5nbGVcclxuICAgIGlmIChzeCA9PT0gc3kpIHtcclxuICAgICAgcmV0dXJuIHIgKiBzeDtcclxuICAgIH0gZWxzZSBpZiAoYWxtb3N0RXF1YWwobmEsIDApIHx8IGFsbW9zdEVxdWFsKG5hLCBQSSkpIHtcclxuICAgICAgcmV0dXJuIHIgKiBzeDtcclxuICAgIH0gZWxzZSBpZiAoYWxtb3N0RXF1YWwobmEsIFBJLzIpIHx8IGFsbW9zdEVxdWFsKG5hLCAzKlBJLzIpKSB7XHJcbiAgICAgIHJldHVybiByICogc3k7XHJcbiAgICB9IGVsc2UgaWYgKG5hIDwgMSpQSS8yKSB7XHJcbiAgICAgIHZhciBhYSA9IG5hOyAvL2FkanVzdGVkIGFuZ2xlXHJcbiAgICAgIHJldHVybiByICogKHN4ICogKFBJLzItYWEpLyhQSS8yKSArIHN5ICogKGFhKS8oUEkvMikpO1xyXG4gICAgfSBlbHNlIGlmIChuYSA8IDIqUEkvMikge1xyXG4gICAgICB2YXIgYWEgPSBuYSAtIDEqUEkvMjsgLy9hZGp1c3RlZCBhbmdsZVxyXG4gICAgICByZXR1cm4gciAqIChzeCAqIChhYSkvKFBJLzIpICsgc3kgKiAoUEkvMi1hYSkvKFBJLzIpKTtcclxuICAgIH0gZWxzZSBpZiAobmEgPCAzKlBJLzIpIHtcclxuICAgICAgdmFyIGFhID0gbmEgLSAyKlBJLzI7IC8vYWRqdXN0ZWQgYW5nbGVcclxuICAgICAgcmV0dXJuIHIgKiAoc3ggKiAoUEkvMi1hYSkvKFBJLzIpICsgc3kgKiAoYWEpLyhQSS8yKSk7XHJcbiAgICB9IGVsc2UgaWYgKG5hIDwgNCpQSS8yKSB7XHJcbiAgICAgIHZhciBhYSA9IG5hIC0gMypQSS8yOyAvL2FkanVzdGVkIGFuZ2xlXHJcbiAgICAgIHJldHVybiByICogKHN4ICogKGFhKS8oUEkvMikgKyBzeSAqIChQSS8yLWFhKS8oUEkvMikpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGNvbGxpbmVhciA9ICh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSA9PiB7XHJcbiAgICB2YXIgbTEgPSAoeTEgLSB5MCkgLyAoeDEgLSB4MCksXHJcbiAgICAgICAgbTIgPSAoeTIgLSB5MSkgLyAoeDIgLSB4MSk7XHJcbiAgICByZXR1cm4gYWxtb3N0RXF1YWwobTEsIG0yKTtcclxuICB9LFxyXG5cclxuICBkZWNvbXBvc2VBcmNUbyA9ICh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCByLCBzeCwgc3kpID0+IHtcclxuICAgIC8vXHJcbiAgICAvLyAgVGhlIHN4IGFuZCBzeSBpcyB1c2VkIHRvIHNjYWxlIHRoZSByYWRpdXMgKHIpIG9ubHkuXHJcbiAgICAvL0FsbCBvdGhlciBjb29yZGluYXRlcyBoYXZlIHRvIGJlIGFscmVhZHkgc2NhbGVkLlxyXG4gICAgLy9cclxuICAgIHZhciBkZWNvbXBvc2l0aW9uID0ge1xyXG4gICAgICBwb2ludDoge3g6IHgxLCB5OiB5MX1cclxuICAgIH07XHJcbiAgICBpZihjb2xsaW5lYXIoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MikpIHtcclxuICAgICAgZGVjb21wb3NpdGlvbi5saW5lID0ge3gxOiB4MCwgeTE6IHkwLCB4MjogeDEsIHkyOiB5MX07XHJcbiAgICB9IGVsc2UgaWYgKCFpc05hTih4MCkgJiYgIWlzTmFOKHkwKSkge1xyXG4gICAgICB2YXIgY2VudGVyID0gZ2V0VGhlQ2VudGVyT2ZUaGVDb3JuZXIoeDAsIHkwLCB4MSwgeTEsIHgyLCB5Miwgciwgc3gsIHN5KSxcclxuICAgICAgICAgIGZvb3QxID0gZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhcih4MCwgeTAsIHgxLCB5MSwgY2VudGVyLngsIGNlbnRlci55KSxcclxuICAgICAgICAgIGZvb3QyID0gZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhcih4MSwgeTEsIHgyLCB5MiwgY2VudGVyLngsIGNlbnRlci55KSxcclxuICAgICAgICAgIGFuZ2xlRm9vdDEgPSB4eVRvQXJjQW5nbGUoY2VudGVyLngsIGNlbnRlci55LCBmb290MS54LCBmb290MS55KSxcclxuICAgICAgICAgIGFuZ2xlRm9vdDIgPSB4eVRvQXJjQW5nbGUoY2VudGVyLngsIGNlbnRlci55LCBmb290Mi54LCBmb290Mi55KSxcclxuICAgICAgICAgIHNBbmdsZSA9IE1hdGguYWJzKGFuZ2xlRm9vdDIgLSBhbmdsZUZvb3QxKSA8IE1hdGguUEkgPyBhbmdsZUZvb3QyIDogYW5nbGVGb290MSxcclxuICAgICAgICAgIGVBbmdsZSA9IE1hdGguYWJzKGFuZ2xlRm9vdDIgLSBhbmdsZUZvb3QxKSA8IE1hdGguUEkgPyBhbmdsZUZvb3QxIDogYW5nbGVGb290MjtcclxuICAgICAgaWYgKHNBbmdsZSA+IGVBbmdsZSkge1xyXG4gICAgICAgIHZhciB0ZW1wID0gc0FuZ2xlO1xyXG4gICAgICAgIHNBbmdsZSA9IGVBbmdsZTtcclxuICAgICAgICBlQW5nbGUgPSB0ZW1wICsgMipQSTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIWlzTmFOKGNlbnRlci54KSAmJiAhaXNOYU4oY2VudGVyLnkpKSB7XHJcbiAgICAgICAgaWYgKCFhbG1vc3RFcXVhbChnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMoeDAsIHkwLCBmb290MS54LCBmb290MS55KSwgMCkpIHtcclxuICAgICAgICAgIGRlY29tcG9zaXRpb24ubGluZSA9IHt4MTogeDAsIHkxOiB5MCwgeDI6IGZvb3QxLngsIHkyOiBmb290MS55fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVjb21wb3NpdGlvbi5hcmMgPSB7eDogY2VudGVyLngsIHk6IGNlbnRlci55LCByOiByLCBzQW5nbGU6IHNBbmdsZSwgZUFuZ2xlOiBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2U6IGZhbHNlfTtcclxuICAgICAgICBkZWNvbXBvc2l0aW9uLnBvaW50ID0ge3g6IGZvb3QyLngsIHk6IGZvb3QyLnl9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVjb21wb3NpdGlvbjtcclxuICB9LFxyXG5cclxuICByZWxldmFudEFyY0FuZ2xlcyA9IChzQW5nbGUsIGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZSkgPT4ge1xyXG4gICAgLy9cclxuICAgIC8vICBUaGUgZnVuY3Rpb24gaXMgcmV0dXJuaW5nIHRoZSBzcGVjaWZpZWQgc0FuZ2xlIGFuZCBlQW5nbGUgYW5kXHJcbiAgICAvL2FsbCB0aGUgbXVsdGlwbGUgb2YgUEkvMi4gVGhlIHJlc3VsdHMgZG9lc24ndCBjb250YWluIGR1cGxpY2F0aW9ucy5cclxuICAgIC8vICBFeGFtcGxlOiBGb3Igc0FuZ2xlID0gUEkvNiBhbmQgZUFuZ2xlID0gNypQSS82LFxyXG4gICAgLy8gV2hlbiBjb3VudGVyY2xvY2t3aXNlID0gZmFsc2UgdGhlIHJlc3VsdCBpczogW1BJLzYsIDcqUEkvNiwgUEkvMiwgMipQSS8yXVxyXG4gICAgLy8gV2hlbiBjb3VudGVyY2xvY2t3aXNlID0gdHJ1ZSB0aGUgcmVzdWx0IGlzOiBbUEkvNiwgNypQSS82LCAzKlBJLzIsIDQqUEkvMl1cclxuICAgIC8vXHJcbiAgICB2YXIgYW5nbGVzID0gW10sIHJlbGV2YW50QW5nbGVzID0gW107XHJcbiAgICBhbmdsZXMucHVzaChzQW5nbGUpO1xyXG4gICAgYW5nbGVzLnB1c2goZUFuZ2xlKTtcclxuICAgIGlmIChjb3VudGVyY2xvY2t3aXNlKSB7XHJcbiAgICAgIHZhciB0ZW1wID0gc0FuZ2xlO1xyXG4gICAgICAgICAgc0FuZ2xlID0gZUFuZ2xlO1xyXG4gICAgICAgICAgZUFuZ2xlID0gc0FuZ2xlICsgMipQSTtcclxuICAgIH1cclxuICAgIFsxKlBJLzIsIDIqUEkvMiwgMypQSS8yLCA0KlBJLzJdLmZvckVhY2goKGEpID0+IHtcclxuICAgICAgaWYoZUFuZ2xlID4gYSAmJiBhID4gc0FuZ2xlKSB7XHJcbiAgICAgICAgYW5nbGVzLnB1c2goYSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vcmVtb3ZpbmcgdGhlIGR1cGxpY2F0ZWQgcG9pbnRzXHJcbiAgICByZWxldmFudEFuZ2xlcy5wdXNoKGFuZ2xlcy5wb3AoKSk7XHJcbiAgICB3aGlsZShhbmdsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgYW5nbGUgPSBhbmdsZXMucG9wKCksXHJcbiAgICAgICAgICBmb3VuZCA9IHJlbGV2YW50QW5nbGVzLmZpbmQoKGEpID0+XHJcbiAgICAgICAgICAgIGFsbW9zdEVxdWFsKGFuZ2xlLCBhKSB8fFxyXG4gICAgICAgICAgICBhbG1vc3RFcXVhbChhbmdsZSAtIDIqUEksIGEpIHx8XHJcbiAgICAgICAgICAgIGFsbW9zdEVxdWFsKGFuZ2xlLCBhIC0gMipQSSkpO1xyXG4gICAgICBpZiAoZm91bmQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJlbGV2YW50QW5nbGVzLnB1c2goYW5nbGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlbGV2YW50QW5nbGVzO1xyXG4gIH0sXHJcblxyXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjc1MjcyNS9maW5kaW5nLXdoZXRoZXItYS1wb2ludC1saWVzLWluc2lkZS1hLXJlY3RhbmdsZS1vci1ub3RcclxuICBpc1BvaW50SW5zaWRlUmVjdGFuZ2xlID0gKHBvaW50LCByZWN0YW5nbGUpID0+IHtcclxuICAgIHZhciBzZWdtZW50cyA9IFt7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSB9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHR9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodCxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0fSwge1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHQsXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55XHJcbiAgICB9XTtcclxuXHJcbiAgICB2YXIgaXNJbnNpZGUgPSBzZWdtZW50cy5tYXAoKHNlZ21lbnQpID0+IHtcclxuICAgICAgdmFyIEEgPSAtKHNlZ21lbnQueTIgLSBzZWdtZW50LnkxKSxcclxuICAgICAgICBCID0gc2VnbWVudC54MiAtIHNlZ21lbnQueDEsXHJcbiAgICAgICAgQyA9IC0oQSAqIHNlZ21lbnQueDEgKyBCICogc2VnbWVudC55MSksXHJcbiAgICAgICAgRCA9IEEgKiBwb2ludC54ICsgQiAqIHBvaW50LnkgKyBDO1xyXG4gICAgICAgIHJldHVybiBEO1xyXG4gICAgfSkuZXZlcnkoKEQpID0+IHtcclxuICAgICAgcmV0dXJuIEQgPiAwO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGlzSW5zaWRlO1xyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLmdldEJCb3ggPSBnZXRCQm94O1xyXG4gIHRoaXMudW5pb24gPSB1bmlvbjtcclxuICB0aGlzLnRvdGFsVHJhbnNmb3JtID0gdG90YWxUcmFuc2Zvcm07XHJcbiAgdGhpcy5nZXRSZWN0QXJvdW5kTGluZSA9IGdldFJlY3RBcm91bmRMaW5lO1xyXG4gIHRoaXMuZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCA9IGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQ7XHJcbiAgdGhpcy5nZXRJbnRlcnNlY3Rpb25PZlR3b0xpbmVzID0gZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcztcclxuICB0aGlzLmdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzID0gZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHM7XHJcbiAgdGhpcy5nZXRUaGVDZW50ZXJPZlRoZUNvcm5lciA9IGdldFRoZUNlbnRlck9mVGhlQ29ybmVyO1xyXG4gIHRoaXMuZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhciA9IGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXI7XHJcbiAgdGhpcy54eVRvQXJjQW5nbGUgPSB4eVRvQXJjQW5nbGU7XHJcbiAgdGhpcy5zY2FsZWRSYWRpdXMgPSBzY2FsZWRSYWRpdXM7XHJcbiAgdGhpcy5kZWNvbXBvc2VBcmNUbyA9IGRlY29tcG9zZUFyY1RvO1xyXG4gIHRoaXMuaXNQb2ludEluc2lkZVJlY3RhbmdsZSA9IGlzUG9pbnRJbnNpZGVSZWN0YW5nbGU7XHJcblxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJ5LmpzJ1xyXG5pbXBvcnQgeyBDdXN0b21NYXRjaGVycyB9IGZyb20gJy4vY3VzdG9tTWF0Y2hlcnMuanMnXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFJhYmJpdChnZW9tZXRyeSwgbWF0Y2hlcnMpIHtcclxuXHJcbiAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgZ2VvbWV0cnkgPSBnZW9tZXRyeSB8fCBuZXcgR2VvbWV0cnkoKSxcclxuICAgIG1hdGNoZXJzID0gbWF0Y2hlcnMgfHwgbmV3IEN1c3RvbU1hdGNoZXJzKCk7XHJcblxyXG5cclxuICB2YXIgZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzID0gKHNoYXBlLCB3aGVyZSkgPT4ge1xyXG4gICAgdmFyIGZvdW5kID0gW10sIGluZGV4ID0gMDtcclxuICAgIGRvIHtcclxuICAgICAgaW5kZXggPSB0aGF0LmZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzKHNoYXBlLCB3aGVyZSwgaW5kZXgpO1xyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgZm91bmQucHVzaCh3aGVyZS5zbGljZShpbmRleCwgaW5kZXggKyBzaGFwZS5sZW5ndGgpKTtcclxuICAgICAgICBpbmRleCArPSBzaGFwZS5sZW5ndGg7XHJcbiAgICAgIH1cclxuICAgIH0gd2hpbGUgKGluZGV4ICE9PSAtMSAmJiBpbmRleCA8IHdoZXJlLmxlbmd0aCk7XHJcbiAgICByZXR1cm4gZm91bmQ7XHJcbiAgfSxcclxuXHJcbiAgZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMgPSAoc2hhcGUsIHdoZXJlLCBzdGFydEluZGV4KSA9PiB7XHJcbiAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCB8fCAwO1xyXG4gICAgdmFyIG1hdGNoID0gZmFsc2UsIGluZGV4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gc3RhcnRJbmRleDsgaSA8PSB3aGVyZS5sZW5ndGggLSBzaGFwZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBtYXRjaCA9IHRydWU7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2hhcGUubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBpZiAod2hlcmVbaSArIGpdLm1ldGhvZCAhPT0gc2hhcGVbal0ubWV0aG9kKSB7XHJcbiAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChtYXRjaCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGluZGV4O1xyXG4gIH0sXHJcblxyXG4gIHJlbW92ZVNoYXBlcyA9IChzaGFwZXMsIGZyb20pID0+IHtcclxuICAgIHZhciBjb3B5ID0gZnJvbS5zbGljZSgwLCBmcm9tLmxlbmd0aCk7XHJcbiAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcclxuICAgICAgdmFyIGluZGV4ID0gLTE7XHJcbiAgICAgIGRvIHtcclxuICAgICAgICBpbmRleCA9IHRoYXQuZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMoc2hhcGUsIGNvcHkpO1xyXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgIGNvcHkuc3BsaWNlKGluZGV4LCBzaGFwZS5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSB3aGlsZSAoaW5kZXggIT09IC0xKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvcHk7XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMuZ2V0QkJveCA9IGdlb21ldHJ5LmdldEJCb3g7XHJcbiAgdGhpcy5jdXN0b21NYXRjaGVycyA9IG1hdGNoZXJzO1xyXG4gIHRoaXMuZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzID0gZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzO1xyXG4gIHRoaXMuZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMgPSBmaW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cztcclxuICB0aGlzLnJlbW92ZVNoYXBlcyA9IHJlbW92ZVNoYXBlcztcclxuXHJcbn1cclxuIl19
