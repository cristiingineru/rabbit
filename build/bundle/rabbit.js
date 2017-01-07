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
    //all the multiple of PI/2. The result doesn't contain duplications.
    //  Example: For sAngle = PI/6 and eAngle = 7*PI/6,
    // When counterclockwise = false the result is: [PI/6, 7*PI/6, PI/2, 2*PI/2]
    // When counterclockwise = true the result is: [PI/6, 7*PI/6, 3*PI/2, 4*PI/2]
    //
    var angles = [],
        uniqueAngles = [];
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
    uniqueAngles.push(angles.pop());
    while (angles.length > 0) {
      var angle = angles.pop(),
          found = uniqueAngles.find(function (a) {
        return almostEqual(angle, a) || almostEqual(angle - 2 * PI, a) || almostEqual(angle, a - 2 * PI);
      });
      if (found === undefined) {
        uniqueAngles.push(angle);
      }
    }

    return uniqueAngles;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGN1c3RvbU1hdGNoZXJzLmpzIiwic3JjXFxnZW9tZXRyeS5qcyIsInNyY1xccmFiYml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7O1FBS2dCLGMsR0FBQSxjOztBQUhoQjs7QUFHTyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0M7O0FBRXZDLGFBQVcsWUFBWSx3QkFBdkI7O0FBR0EsTUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBTyxxQkFBUCxFQUFpQztBQUNoRCxXQUFPO0FBQ0wsZUFBUyxpQkFBQyxNQUFELEVBQVMsUUFBVCxFQUFzQjtBQUM3QixZQUFJLFFBQVEsS0FBWjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxTQUFTLE1BQVQsR0FBa0IsT0FBTyxNQUE3QyxFQUFxRCxHQUFyRCxFQUEwRDtBQUN4RCxrQkFBUSxPQUFPLE1BQVAsR0FBZ0IsQ0FBeEI7QUFDQSxlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksT0FBTyxNQUEzQixFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxnQkFBSSxTQUFTLElBQUksQ0FBYixFQUFnQixNQUFoQixLQUEyQixPQUFPLENBQVAsRUFBVSxNQUF6QyxFQUFpRDtBQUMvQyxzQkFBUSxLQUFSO0FBQ0E7QUFDRDtBQUNGO0FBQ0QsY0FBSSxVQUFVLElBQWQsRUFBb0I7QUFDbEI7QUFDRDtBQUNGO0FBQ0QsWUFBSSxTQUFTLFFBQVEsRUFBQyxNQUFNLElBQVAsRUFBUixHQUF1QixFQUFDLE1BQU0sS0FBUCxFQUFjLFNBQVMsbUJBQXZCLEVBQXBDO0FBQ0EsZUFBTyxNQUFQO0FBQ0Q7QUFqQkksS0FBUDtBQW1CRCxHQXBCRDtBQUFBLE1Bc0JBLHNCQUFzQixTQUF0QixtQkFBc0IsQ0FBQyxJQUFELEVBQU8scUJBQVAsRUFBaUM7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ZSxNQUFNLE1BQW5ELEVBQTJELEdBQTNELEVBQWdFO0FBQzlELGNBQVEsSUFBUjtBQUNBLFdBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxNQUFNLE1BQTFCLEVBQWtDLEdBQWxDLEVBQXVDO0FBQ3JDLFlBQUksTUFBTSxJQUFJLENBQVYsRUFBYSxNQUFiLEtBQXdCLE1BQU0sQ0FBTixFQUFTLE1BQXJDLEVBQTZDO0FBQzNDLGtCQUFRLEtBQVI7QUFDQTtBQUNEO0FBQ0Y7QUFDRCxVQUFJLFVBQVUsSUFBZCxFQUFvQjtBQUNsQixnQkFBUSxDQUFSO0FBQ0E7QUFDRDtBQUNGO0FBQ0QsV0FBTyxLQUFQO0FBQ0QsR0E3QkQ7QUFBQSxNQStCQSxlQUFlLFNBQWYsWUFBZSxDQUFDLE1BQUQsRUFBUyxJQUFULEVBQWtCO0FBQy9CLFFBQUksT0FBTyxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsS0FBSyxNQUFuQixDQUFYO0FBQ0EsV0FBTyxPQUFQLENBQWUsVUFBQyxLQUFELEVBQVc7QUFDeEIsVUFBSSxRQUFRLENBQUMsQ0FBYjtBQUNBLFNBQUc7QUFDRCxnQkFBUSxLQUFLLDBCQUFMLENBQWdDLEtBQWhDLEVBQXVDLElBQXZDLENBQVI7QUFDQSxZQUFJLFVBQVUsQ0FBQyxDQUFmLEVBQWtCO0FBQ2hCLGVBQUssTUFBTCxDQUFZLEtBQVosRUFBbUIsTUFBTSxNQUF6QjtBQUNEO0FBQ0YsT0FMRCxRQUtTLFVBQVUsQ0FBQyxDQUxwQjtBQU1ELEtBUkQ7QUFTQSxXQUFPLElBQVA7QUFDRCxHQTNDRDs7QUE4Q0EsT0FBSyxPQUFMLEdBQWUsU0FBUyxPQUF4QjtBQUNBLE9BQUssY0FBTCxHQUFzQixRQUF0QjtBQUNBLE9BQUssOEJBQUwsR0FBc0MsOEJBQXRDO0FBQ0EsT0FBSywwQkFBTCxHQUFrQywwQkFBbEM7QUFDQSxPQUFLLFlBQUwsR0FBb0IsWUFBcEI7QUFFRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyeS5qcydcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQ3VzdG9tTWF0Y2hlcnMoZ2VvbWV0cnkpIHtcclxuXHJcbiAgZ2VvbWV0cnkgPSBnZW9tZXRyeSB8fCBuZXcgR2VvbWV0cnkoKTtcclxuXHJcblxyXG4gIHZhciB0b0JlUGFydE9mID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aCAtIGFjdHVhbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgbWF0Y2ggPSBhY3R1YWwubGVuZ3RoID4gMDtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYWN0dWFsLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmIChleHBlY3RlZFtpICsgal0ubWV0aG9kICE9PSBhY3R1YWxbal0ubWV0aG9kKSB7XHJcbiAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKG1hdGNoID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVzdWx0ID0gbWF0Y2ggPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZSBub3QgcGFydCBvZid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlSW5zaWRlVGhlQXJlYU9mID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgc21hbGxTaGFwZSA9IGFjdHVhbCxcclxuICAgICAgICAgIGJpZ1NoYXBlID0gZXhwZWN0ZWQsXHJcbiAgICAgICAgICBiaWdTaGFwZUJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGJpZ1NoYXBlKSxcclxuICAgICAgICAgIHNtYWxsU2hhcGVCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChzbWFsbFNoYXBlKSxcclxuICAgICAgICAgIGNlbnRlciA9IHt4OiBzbWFsbFNoYXBlQkJveC54ICsgc21hbGxTaGFwZUJCb3gud2lkdGggLyAyLCB5OiBzbWFsbFNoYXBlQkJveC55ICsgc21hbGxTaGFwZUJCb3guaGVpZ2h0IC8gMn0sXHJcbiAgICAgICAgICBpc0NlbnRlckluc2lkZSA9IGdlb21ldHJ5LmlzUG9pbnRJbnNpZGVSZWN0YW5nbGUoY2VudGVyLCBiaWdTaGFwZUJCb3gpLFxyXG4gICAgICAgICAgcmVzdWx0ID0gaXNDZW50ZXJJbnNpZGUgPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZSBpcyBub3QgaW5zaWRlIHRoZSBhcmVhIG9mJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvSGF2ZVRoZVNhbWVQb3NpdGlvbldpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZVBvc2l0aW9uID0gYWN0dWFsQkJveC54ID09PSBleHBlY3RlZEJCb3gueCAmJiBhY3R1YWxCQm94LnkgPT09IGV4cGVjdGVkQkJveC55LFxyXG4gICAgICAgICAgcmVzdWx0ID0gaGF2ZVRoZVNhbWVQb3NpdGlvbiA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvSGF2ZVRoZVNhbWVTaXplV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lU2l6ZSA9IGFjdHVhbEJCb3gud2lkdGggPT09IGV4cGVjdGVkQkJveC53aWR0aCAmJiBhY3R1YWxCQm94LmhlaWdodCA9PT0gZXhwZWN0ZWRCQm94LmhlaWdodCxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lU2l6ZSA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIHNpemUnfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9CZUhvcml6b250YWxseUFsaWduV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lQWxpZ25tZW50ID0gYWN0dWFsQkJveC55ID09PSBleHBlY3RlZEJCb3gueSxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lQWxpZ25tZW50ID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgaG9yaXpvbnRhbCBwb3NpdGlvbid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlVmVydGljYWxseUFsaWduV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lQWxpZ25tZW50ID0gYWN0dWFsQkJveC54ID09PSBleHBlY3RlZEJCb3gueCxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lQWxpZ25tZW50ID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgdmVydGljYWwgcG9zaXRpb24nfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMudG9CZVBhcnRPZiA9IHRvQmVQYXJ0T2Y7XHJcbiAgdGhpcy50b0JlSW5zaWRlVGhlQXJlYU9mID0gdG9CZUluc2lkZVRoZUFyZWFPZjtcclxuICB0aGlzLnRvSGF2ZVRoZVNhbWVQb3NpdGlvbldpdGggPSB0b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoO1xyXG4gIHRoaXMudG9IYXZlVGhlU2FtZVNpemVXaXRoID0gdG9IYXZlVGhlU2FtZVNpemVXaXRoO1xyXG4gIHRoaXMudG9CZUhvcml6b250YWxseUFsaWduV2l0aCA9IHRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGg7XHJcbiAgdGhpcy50b0JlVmVydGljYWxseUFsaWduV2l0aCA9IHRvQmVWZXJ0aWNhbGx5QWxpZ25XaXRoO1xyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBHZW9tZXRyeSgpIHtcclxuXHJcbiAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICBFUFNJTE9OID0gTnVtYmVyLkVQU0lMT04gfHwgMi4yMjA0NDYwNDkyNTAzMTNlLTE2LFxyXG4gICAgICBQSSA9IE1hdGguUEksXHJcbiAgICAgIHNpbiA9IE1hdGguc2luLFxyXG4gICAgICBjb3MgPSBNYXRoLmNvcztcclxuXHJcblxyXG4gIHZhciBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUgPSAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBib3g6IHt4OiBOYU4sIHk6IE5hTiwgd2lkdGg6IE5hTiwgaGVpZ2h0OiBOYU59LFxyXG4gICAgICB0cmFuc2Zvcm1zOiBbW11dLFxyXG4gICAgICBzaGFwZXNJblBhdGg6IFtdLFxyXG4gICAgICBtb3ZlVG9Mb2NhdGlvbjoge3g6IE5hTiwgeTogTmFOfSxcclxuICAgICAgbGluZVdpZHRoczogWzFdXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIHBhdGhGaWxsU2hhcGVIYW5kbGVycyA9IHtcclxuICAgIHJlY3Q6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIHggPSBzaGFwZS54LFxyXG4gICAgICAgIHkgPSBzaGFwZS55LFxyXG4gICAgICAgIHdpZHRoID0gc2hhcGUud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0ID0gc2hhcGUuaGVpZ2h0LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IHNoYXBlLmN4LFxyXG4gICAgICAgICAgY3kgPSBzaGFwZS5jeSxcclxuICAgICAgICAgIHIgPSBzaGFwZS5yLFxyXG4gICAgICAgICAgc3ggPSBzaGFwZS5zeCxcclxuICAgICAgICAgIHN5ID0gc2hhcGUuc3ksXHJcbiAgICAgICAgICBzQW5nbGUgPSBzaGFwZS5zQW5nbGUsXHJcbiAgICAgICAgICBlQW5nbGUgPSBzaGFwZS5lQW5nbGUsXHJcbiAgICAgICAgICBjb3VudGVyY2xvY2t3aXNlID0gc2hhcGUuY291bnRlcmNsb2Nrd2lzZSxcclxuICAgICAgICAgIGFyY0FuZ2xlcyA9IHJlbGV2YW50QXJjQW5nbGVzKHIsIHNBbmdsZSwgZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlKSxcclxuICAgICAgICAgIHNjYWxlZEFyY1BvaW50cyA9IGFyY0FuZ2xlcy5tYXAoKGEpID0+IHtcclxuICAgICAgICAgICAgdmFyIHNyID0gc2NhbGVkUmFkaXVzKHIsIHN4LCBzeSwgYSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7eDogY3ggKyBzcipjb3MoYSksIHk6IGN5ICsgc3Iqc2luKGEpfTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgbmV3Qm94ID0gYm94UG9pbnRzKHNjYWxlZEFyY1BvaW50cyk7XHJcbiAgICAgIGlmICghaXNOYU4oY3gpICYmICFpc05hTihjeSkgJiYgYXJjQW5nbGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHBhdGhTdHJva2VTaGFwZUhhbmRsZXJzID0ge1xyXG4gICAgcmVjdDogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeCA9IHNoYXBlLngsXHJcbiAgICAgICAgeSA9IHNoYXBlLnksXHJcbiAgICAgICAgd2lkdGggPSBzaGFwZS53aWR0aCxcclxuICAgICAgICBoZWlnaHQgPSBzaGFwZS5oZWlnaHQsXHJcbiAgICAgICAgc2NhbGVkTGluZVdpZHRoID0gc3RhdGUubGluZVdpZHRoICE9PSAxID8gc3RhdGUubGluZVdpZHRoIDogMCxcclxuICAgICAgICB4U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgeVNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4IC0geFNjYWxlZExpbmVXaWR0aCAgLyAyLCB5OiB5IC0geVNjYWxlZExpbmVXaWR0aCAvIDIsIHdpZHRoOiB3aWR0aCArIHhTY2FsZWRMaW5lV2lkdGgsIGhlaWdodDogaGVpZ2h0ICsgeVNjYWxlZExpbmVXaWR0aH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyYzogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgY3ggPSBzaGFwZS5jeCxcclxuICAgICAgICAgIGN5ID0gc2hhcGUuY3ksXHJcbiAgICAgICAgICByID0gc2hhcGUucixcclxuICAgICAgICAgIHN4ID0gc2hhcGUuc3gsXHJcbiAgICAgICAgICBzeSA9IHNoYXBlLnN5LFxyXG4gICAgICAgICAgc0FuZ2xlID0gc2hhcGUuc0FuZ2xlLFxyXG4gICAgICAgICAgZUFuZ2xlID0gc2hhcGUuZUFuZ2xlLFxyXG4gICAgICAgICAgY291bnRlcmNsb2Nrd2lzZSA9IHNoYXBlLmNvdW50ZXJjbG9ja3dpc2UsXHJcbiAgICAgICAgICBhcmNBbmdsZXMgPSByZWxldmFudEFyY0FuZ2xlcyhzQW5nbGUsIGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZSksXHJcbiAgICAgICAgICBzY2FsZWRBcmNQb2ludHMgPSBmbGF0dGVuKGFyY0FuZ2xlcy5tYXAoKGEpID0+IHtcclxuICAgICAgICAgICAgdmFyIHcgPSBzY2FsZWRSYWRpdXMoc3RhdGUubGluZVdpZHRoLCBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCwgc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksIGEpLFxyXG4gICAgICAgICAgICAgICAgc2lyID0gc2NhbGVkUmFkaXVzKHIsIHN4LCBzeSwgYSkgLSB3LzIsIC8vIGlubmVyIHJhZGl1c1xyXG4gICAgICAgICAgICAgICAgc3IgPSBzY2FsZWRSYWRpdXMociwgc3gsIHN5LCBhKSwgICAgLy8gcmFkaXVzXHJcbiAgICAgICAgICAgICAgICBzb3IgPSBzY2FsZWRSYWRpdXMociwgc3gsIHN5LCBhKSArIHcvMiwgLy8gb3V0ZXIgcmFkaXVzXHJcbiAgICAgICAgICAgICAgICBwb2ludHMgPSBbXTtcclxuICAgICAgICAgICAgaWYgKHcgPT09IDEpIHtcclxuICAgICAgICAgICAgICBwb2ludHMucHVzaCh7eDogY3ggKyBzcipjb3MoYSksIHk6IGN5ICsgc3Iqc2luKGEpfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcG9pbnRzLnB1c2goe3g6IGN4ICsgc2lyKmNvcyhhKSwgeTogY3kgKyBzaXIqc2luKGEpfSk7XHJcbiAgICAgICAgICAgICAgcG9pbnRzLnB1c2goe3g6IGN4ICsgc29yKmNvcyhhKSwgeTogY3kgKyBzb3Iqc2luKGEpfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHBvaW50cztcclxuICAgICAgICAgIH0pKSxcclxuICAgICAgICAgIG5ld0JveCA9IGJveFBvaW50cyhzY2FsZWRBcmNQb2ludHMpO1xyXG4gICAgICBpZiAoIWlzTmFOKGN4KSAmJiAhaXNOYU4oY3kpICYmIGFyY0FuZ2xlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBsaW5lVG86IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIHgxID0gc2hhcGUueDEsXHJcbiAgICAgICAgeTEgPSBzaGFwZS55MSxcclxuICAgICAgICB4MiA9IHNoYXBlLngyLFxyXG4gICAgICAgIHkyID0gc2hhcGUueTIsXHJcbiAgICAgICAgc2NhbGVkTGluZVdpZHRoID0gZ2V0U2NhbGVkV2lkdGhPZkxpbmUoeDEsIHkxLCB4MiwgeTIsIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LCBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSwgc3RhdGUubGluZVdpZHRoKSxcclxuICAgICAgICByZWN0ID0gZ2V0UmVjdEFyb3VuZExpbmUoeDEsIHkxLCB4MiwgeTIsIHNjYWxlZExpbmVXaWR0aCAhPT0gMSA/IHNjYWxlZExpbmVXaWR0aCA6IDApLFxyXG4gICAgICAgIG5ld0JveCA9IHtcclxuICAgICAgICAgIHg6IE1hdGgubWluKHJlY3QueDEsIHJlY3QueDIsIHJlY3QueDMsIHJlY3QueDQpLFxyXG4gICAgICAgICAgeTogTWF0aC5taW4ocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NCksXHJcbiAgICAgICAgICB3aWR0aDogTWF0aC5tYXgocmVjdC54MSwgcmVjdC54MiwgcmVjdC54MywgcmVjdC54NCkgLSBNYXRoLm1pbihyZWN0LngxLCByZWN0LngyLCByZWN0LngzLCByZWN0Lng0KSxcclxuICAgICAgICAgIGhlaWdodDogTWF0aC5tYXgocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NCkgLSBNYXRoLm1pbihyZWN0LnkxLCByZWN0LnkyLCByZWN0LnkzLCByZWN0Lnk0KVxyXG4gICAgICAgIH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGNhbnZhc0NhbGxIYW5kbGVycyA9IHtcclxuICAgIGxpbmVXaWR0aDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLmxpbmVXaWR0aHNbc3RhdGUubGluZVdpZHRocy5sZW5ndGggLSAxXSA9IGNhbGwudmFsO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgZmlsbFJlY3Q6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgd2lkdGggPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIGhlaWdodCA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBzdHJva2VSZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IHN0YXRlLmxpbmVXaWR0aCAhPT0gMSA/IHN0YXRlLmxpbmVXaWR0aCA6IDAsXHJcbiAgICAgICAgeFNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIHlTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBuZXdCb3ggPSB7eDogeCAtIHhTY2FsZWRMaW5lV2lkdGggLyAyLCB5OiB5IC0geVNjYWxlZExpbmVXaWR0aCAvIDIsIHdpZHRoOiB3aWR0aCArIHhTY2FsZWRMaW5lV2lkdGgsIGhlaWdodDogaGVpZ2h0ICsgeVNjYWxlZExpbmVXaWR0aH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHJlY3Q6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgd2lkdGggPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIGhlaWdodCA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnk7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAncmVjdCcsIHg6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyYzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgY3kgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHIgPSBjYWxsLmFyZ3VtZW50c1syXSxcclxuICAgICAgICBzeCA9IHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIHN5ID0gc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgc0FuZ2xlID0gY2FsbC5hcmd1bWVudHNbM10sXHJcbiAgICAgICAgZUFuZ2xlID0gY2FsbC5hcmd1bWVudHNbNF0sXHJcbiAgICAgICAgY291bnRlcmNsb2Nrd2lzZSA9IGNhbGwuYXJndW1lbnRzWzVdIHx8IGZhbHNlO1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2FyYycsIGN4OiBjeCwgY3k6IGN5LCByOiByLCBzeDogc3gsIHN5OiBzeSwgc0FuZ2xlOiBzQW5nbGUsIGVBbmdsZTogZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlOiBjb3VudGVyY2xvY2t3aXNlfSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBtb3ZlVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkxID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueTtcclxuICAgICAgc3RhdGUubW92ZVRvTG9jYXRpb24gPSB7eDogeDEsIHk6IHkxfTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGxpbmVUbzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4MSA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLngsXHJcbiAgICAgICAgeTEgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi55LFxyXG4gICAgICAgIHgyID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5MiA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnk7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnbGluZVRvJywgeDE6IHgxLCB5MTogeTEsIHgyOiB4MiwgeTI6IHkyfSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmNUbzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4MCA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLngsXHJcbiAgICAgICAgICB5MCA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLnksXHJcbiAgICAgICAgICB4MSA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgICB5MSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgICB4MiA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgICB5MiA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgICByID0gY2FsbC5hcmd1bWVudHNbNF0sXHJcbiAgICAgICAgICBzeCA9IHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgICAgc3kgPSBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICAgIGRlY29tcG9zaXRpb24gPSBkZWNvbXBvc2VBcmNUbyh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCByLCBzeCwgc3kpO1xyXG4gICAgICBpZiAoZGVjb21wb3NpdGlvbi5saW5lKSB7XHJcbiAgICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdsaW5lVG8nLCB4MTogZGVjb21wb3NpdGlvbi5saW5lLngxLCB5MTogZGVjb21wb3NpdGlvbi5saW5lLnkxLCB4MjogZGVjb21wb3NpdGlvbi5saW5lLngyLCB5MjogZGVjb21wb3NpdGlvbi5saW5lLnkyfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRlY29tcG9zaXRpb24uYXJjKSB7XHJcbiAgICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdhcmMnLCBjeDogZGVjb21wb3NpdGlvbi5hcmMueCwgY3k6IGRlY29tcG9zaXRpb24uYXJjLnksIHI6IHIsIHN4OiBzeCwgc3k6IHN5LCBzQW5nbGU6IGRlY29tcG9zaXRpb24uYXJjLnNBbmdsZSwgZUFuZ2xlOiBkZWNvbXBvc2l0aW9uLmFyYy5lQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2U6IGRlY29tcG9zaXRpb24uYXJjLmNvdW50ZXJjbG9ja3dpc2V9KTtcclxuICAgICAgfVxyXG4gICAgICBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbiA9IHt4OiBkZWNvbXBvc2l0aW9uLnBvaW50LngsIHk6IGRlY29tcG9zaXRpb24ucG9pbnQueX07XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBzYXZlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUudHJhbnNmb3Jtcy5wdXNoKFtdKTtcclxuICAgICAgc3RhdGUubGluZVdpZHRocy5wdXNoKGxhc3RFbGVtZW50KHN0YXRlLmxpbmVXaWR0aHMpKTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHJlc3RvcmU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS50cmFuc2Zvcm1zLnBvcCgpO1xyXG4gICAgICBzdGF0ZS5saW5lV2lkdGhzLnBvcCgpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgdHJhbnNsYXRlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgbGFzdEVsZW1lbnQoc3RhdGUudHJhbnNmb3JtcylcclxuICAgICAgICAucHVzaCh7dHJhbnNsYXRlOiB7eDogY2FsbC5hcmd1bWVudHNbMF0sIHk6IGNhbGwuYXJndW1lbnRzWzFdfX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc2NhbGU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBsYXN0RWxlbWVudChzdGF0ZS50cmFuc2Zvcm1zKVxyXG4gICAgICAgIC5wdXNoKHtzY2FsZToge3g6IGNhbGwuYXJndW1lbnRzWzBdLCB5OiBjYWxsLmFyZ3VtZW50c1sxXX19KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGJlZ2luUGF0aDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aCA9IFtdO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgZmlsbDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHJldHVybiBzdGF0ZS5zaGFwZXNJblBhdGgucmVkdWNlKChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgICB2YXIgaGFuZGxlciA9IGdldFBhdGhGaWxsU2hhcGVIYW5kbGVyKHNoYXBlKTtcclxuICAgICAgICByZXR1cm4gaGFuZGxlcihzdGF0ZSwgc2hhcGUpO1xyXG4gICAgICB9LCBzdGF0ZSk7XHJcbiAgICB9LFxyXG4gICAgc3Ryb2tlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHN0YXRlLnNoYXBlc0luUGF0aC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBzaGFwZSA9IHN0YXRlLnNoYXBlc0luUGF0aFtpXSxcclxuICAgICAgICAgICAgaGFuZGxlciA9IGdldFBhdGhTdHJva2VTaGFwZUhhbmRsZXIoc2hhcGUpO1xyXG4gICAgICAgIHN0YXRlID0gaGFuZGxlcihzdGF0ZSwgc2hhcGUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBudWxsQ2FudmFzQ2FsbEhhbmRsZXIgPSAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9LFxyXG5cclxuICBnZXRDYW52YXNDYWxsSGFuZGxlciA9IChjYWxsKSA9PiB7XHJcbiAgICByZXR1cm4gY2FudmFzQ2FsbEhhbmRsZXJzW2NhbGwubWV0aG9kXSB8fCBjYW52YXNDYWxsSGFuZGxlcnNbY2FsbC5hdHRyXSB8fCBudWxsQ2FudmFzQ2FsbEhhbmRsZXI7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aEZpbGxTaGFwZUhhbmRsZXIgPSAoc2hhcGUpID0+IHtcclxuICAgIHJldHVybiBwYXRoRmlsbFNoYXBlSGFuZGxlcnNbc2hhcGUudHlwZV07XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aFN0cm9rZVNoYXBlSGFuZGxlciA9IChzaGFwZSkgPT4ge1xyXG4gICAgcmV0dXJuIHBhdGhTdHJva2VTaGFwZUhhbmRsZXJzW3NoYXBlLnR5cGVdO1xyXG4gIH0sXHJcblxyXG4gIHByZUNhbnZhc0NhbGxIYW5kbGVyID0gKHN0YXRlKSA9PiB7XHJcbiAgICBzdGF0ZS50cmFuc2Zvcm0gPSB0b3RhbFRyYW5zZm9ybShmbGF0dGVuKHN0YXRlLnRyYW5zZm9ybXMpKTtcclxuICAgIHN0YXRlLmxpbmVXaWR0aCA9IGxhc3RFbGVtZW50KHN0YXRlLmxpbmVXaWR0aHMpO1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH0sXHJcblxyXG4gIGdldEJCb3ggPSAoc2hhcGUpID0+IHtcclxuICAgIHZhciBzdGF0ZSA9IGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSgpO1xyXG4gICAgc3RhdGUgPSBzaGFwZS5yZWR1Y2UoKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciBoYW5kbGVyID0gZ2V0Q2FudmFzQ2FsbEhhbmRsZXIoY2FsbCk7XHJcbiAgICAgIHJldHVybiBoYW5kbGVyKHByZUNhbnZhc0NhbGxIYW5kbGVyKHN0YXRlKSwgY2FsbCk7XHJcbiAgICB9LCBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUoKSk7XHJcbiAgICByZXR1cm4gc3RhdGUuYm94O1xyXG4gIH0sXHJcblxyXG4gIGZsYXR0ZW4gPSAoYXJyYXkpID0+IHtcclxuICAgIHJldHVybiBhcnJheVxyXG4gICAgICAucmVkdWNlKChwcmV2aW91c0FycmF5LCBjdXJyZW50QXJyYXkpID0+IHtcclxuICAgICAgICByZXR1cm4gcHJldmlvdXNBcnJheS5jb25jYXQoY3VycmVudEFycmF5KTtcclxuICAgICAgfSwgW10pO1xyXG4gIH0sXHJcblxyXG4gIGxhc3RFbGVtZW50ID0gKGFycmF5KSA9PiB7XHJcbiAgICByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XHJcbiAgfSxcclxuXHJcbiAgZmlyc3RUcnV0aHlPclplcm8gPSAodmFsMSwgdmFsMikgPT57XHJcbiAgICBpZiAodmFsMSB8fCB2YWwxID09PSAwKSB7XHJcbiAgICAgIHJldHVybiB2YWwxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbDI7XHJcbiAgfSxcclxuXHJcbiAgdW5pb24gPSAoYm94MSwgYm94MikgPT4ge1xyXG4gICAgYm94MSA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gxLndpZHRoLCBib3gyLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLmhlaWdodCwgYm94Mi5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgYm94MiA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94Mi54LCBib3gxLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLnksIGJveDEueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gyLndpZHRoLCBib3gxLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLmhlaWdodCwgYm94MS5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgeDogTWF0aC5taW4oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBNYXRoLm1pbihib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBNYXRoLm1heChib3gxLndpZHRoLCBib3gyLndpZHRoLCBib3gxLnggPCBib3gyLnhcclxuICAgICAgICA/IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDIueCAtIChib3gxLnggKyBib3gxLndpZHRoKSlcclxuICAgICAgICA6IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDEueCAtIChib3gyLnggKyBib3gyLndpZHRoKSkpLFxyXG4gICAgICBoZWlnaHQ6IE1hdGgubWF4KGJveDEuaGVpZ2h0LCBib3gyLmhlaWdodCwgYm94MS55IDwgYm94Mi55XHJcbiAgICAgICAgPyBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDIueSAtIChib3gxLnkgKyBib3gxLmhlaWdodCkpXHJcbiAgICAgICAgOiBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDEueSAtIChib3gyLnkgKyBib3gyLmhlaWdodCkpKVxyXG4gICAgfTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSxcclxuXHJcbiAgYm94UG9pbnRzID0gKHBvaW50cykgPT4ge1xyXG4gICAgdmFyIHhlcyA9IHBvaW50cy5tYXAoKHApID0+IHAueCksXHJcbiAgICAgICAgeWVzID0gcG9pbnRzLm1hcCgocCkgPT4gcC55KSxcclxuICAgICAgICBtaW5YID0gTWF0aC5taW4uYXBwbHkobnVsbCwgeGVzKSxcclxuICAgICAgICBtYXhYID0gTWF0aC5tYXguYXBwbHkobnVsbCwgeGVzKSxcclxuICAgICAgICBtaW5ZID0gTWF0aC5taW4uYXBwbHkobnVsbCwgeWVzKSxcclxuICAgICAgICBtYXhZID0gTWF0aC5tYXguYXBwbHkobnVsbCwgeWVzKSxcclxuICAgICAgICBib3ggPSB7eDogTmFOLCB5OiBOYU4sIHdpZHRoOiBOYU4sIGhlaWdodDogTmFOfTtcclxuICAgIGlmIChtaW5YICE9PSArSW5maW5pdHkgJiYgbWF4WCAhPT0gLUluZmluaXR5ICYmIG1pblkgIT09ICtJbmZpbml0eSAmJiBtYXhZICE9PSAtSW5maW5pdHkpIHtcclxuICAgICAgYm94ID0ge1xyXG4gICAgICAgIHg6IG1pblgsXHJcbiAgICAgICAgeTogbWluWSxcclxuICAgICAgICB3aWR0aDogbWF4WCAtIG1pblgsXHJcbiAgICAgICAgaGVpZ2h0OiBtYXhZIC0gbWluWVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJveDtcclxuICB9LFxyXG5cclxuICB0b3RhbFRyYW5zZm9ybSA9ICh0cmFuc2Zvcm1zKSA9PiB7XHJcbiAgICByZXR1cm4gdHJhbnNmb3Jtc1xyXG4gICAgICAubWFwKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0cmFuc2xhdGU6IHZhbHVlLnRyYW5zbGF0ZSB8fCB7eDogMCwgeTogMH0sXHJcbiAgICAgICAgICBzY2FsZTogdmFsdWUuc2NhbGUgfHwge3g6IDEsIHk6IDF9XHJcbiAgICAgICAgfTtcclxuICAgICAgfSlcclxuICAgICAgLnJlZHVjZSgocHJldmlvdXNWYWx1ZSwgY3VycmVudFZhbHVlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRyYW5zbGF0ZToge1xyXG4gICAgICAgICAgICB4OiBwcmV2aW91c1ZhbHVlLnRyYW5zbGF0ZS54ICsgY3VycmVudFZhbHVlLnRyYW5zbGF0ZS54ICogcHJldmlvdXNWYWx1ZS5zY2FsZS54LFxyXG4gICAgICAgICAgICB5OiBwcmV2aW91c1ZhbHVlLnRyYW5zbGF0ZS55ICsgY3VycmVudFZhbHVlLnRyYW5zbGF0ZS55ICogcHJldmlvdXNWYWx1ZS5zY2FsZS55XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc2NhbGU6IHtcclxuICAgICAgICAgICAgeDogcHJldmlvdXNWYWx1ZS5zY2FsZS54ICogY3VycmVudFZhbHVlLnNjYWxlLngsXHJcbiAgICAgICAgICAgIHk6IHByZXZpb3VzVmFsdWUuc2NhbGUueSAqIGN1cnJlbnRWYWx1ZS5zY2FsZS55XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfSwge3RyYW5zbGF0ZToge3g6IDAsIHk6IDB9LCBzY2FsZToge3g6IDEsIHk6IDF9fSk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UmVjdEFyb3VuZExpbmUgPSAoeDEsIHkxLCB4MiwgeTIsIHdpZHRoKSA9PiB7XHJcbiAgICB2YXIgcmVjdDtcclxuICAgIGlmICh4MSA9PT0geTEgJiYgeDEgPT09IHgyICYmIHgxID09PSB5Mikge1xyXG4gICAgICByZWN0ID0ge1xyXG4gICAgICAgIHgxOiB4MSwgeTE6IHgxLCAgeDI6IHgxLCB5MjogeDEsXHJcbiAgICAgICAgeDQ6IHgxLCB5NDogeDEsICB4MzogeDEsIHkzOiB4MVxyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVjdCA9IGdldFJlY3RBcm91bmRMb25nTGluZSh4MSwgeTEsIHgyLCB5Miwgd2lkdGgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlY3Q7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UmVjdEFyb3VuZExvbmdMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCB3aWR0aCkgPT4ge1xyXG4gICAgLy8gIHIgPSB0aGUgcmFkaXVzIG9yIHRoZSBnaXZlbiBkaXN0YW5jZSBmcm9tIGEgZ2l2ZW4gcG9pbnQgdG8gdGhlIG5lYXJlc3QgY29ybmVycyBvZiB0aGUgcmVjdFxyXG4gICAgLy8gIGEgPSB0aGUgYW5nbGUgYmV0d2VlbiB0aGUgbGluZSBhbmQgdGhlIGhvcml6b250YWwgYXhpc1xyXG4gICAgLy8gIGIxLCBiMiA9IHRoZSBhbmdsZSBiZXR3ZWVuIGhhbGYgdGhlIGhpZ2h0IG9mIHRoZSByZWN0YW5nbGUgYW5kIHRoZSBob3Jpem9udGFsIGF4aXNcclxuICAgIC8vXHJcbiAgICAvLyAgSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlIHRoZSBnaXZlbiBsaW5lIGlzIGhvcml6b250YWwsIHNvIGEgPSAwLlxyXG4gICAgLy8gIFRoZSBnaXZlbiBsaW5lIGlzIGJldHdlZW4gdGhlIHR3byBAIHN5bWJvbHMuXHJcbiAgICAvLyAgVGhlICsgc3ltYm9scyBhcmUgdGhlIGNvcm5lcnMgb2YgcmVjdGFuZ2xlIHRvIGJlIGRldGVybWluZWQuXHJcbiAgICAvLyAgSW4gb3JkZXIgdG8gZmluZCB0aGUgYjEgYW5kIGIyIGFuZ2xlcyB3ZSBoYXZlIHRvIGFkZCBQSS8yIGFuZCByZXNwZWN0aXZseSBzdWJ0cmFjdCBQSS8yLlxyXG4gICAgLy8gIGIxIGlzIHZlcnRpY2FsIGFuZCBwb2ludGluZyB1cHdvcmRzIGFuZCBiMiBpcyBhbHNvIHZlcnRpY2FsIGJ1dCBwb2ludGluZyBkb3dud29yZHMuXHJcbiAgICAvLyAgRWFjaCBjb3JuZXIgaXMgciBvciB3aWR0aCAvIDIgZmFyIGF3YXkgZnJvbSBpdHMgY29yZXNwb25kZW50IGxpbmUgZW5kaW5nLlxyXG4gICAgLy8gIFNvIHdlIGtub3cgdGhlIGRpc3RhbmNlIChyKSwgdGhlIHN0YXJ0aW5nIHBvaW50cyAoeDEsIHkxKSBhbmQgKHgyLCB5MikgYW5kIHRoZSAoYjEsIGIyKSBkaXJlY3Rpb25zLlxyXG4gICAgLy9cclxuICAgIC8vICAoeDEseTEpICAgICAgICAgICAgICAgICAgICAoeDIseTIpXHJcbiAgICAvLyAgICAgICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXHJcbiAgICAvLyAgICAgIF4gICAgICAgICAgICAgICAgICAgICAgICBeXHJcbiAgICAvLyAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgICAvLyAgICAgIHwgYjEgICAgICAgICAgICAgICAgICAgICB8IGIxXHJcbiAgICAvLyAgICAgIEA9PT09PT09PT09PT09PT09PT09PT09PT1AXHJcbiAgICAvLyAgICAgIHwgYjIgICAgICAgICAgICAgICAgICAgICB8IGIyXHJcbiAgICAvLyAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgICAvLyAgICAgIHYgICAgICAgICAgICAgICAgICAgICAgICB2XHJcbiAgICAvLyAgICAgICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXHJcbiAgICAvLyAgKHg0LHk0KSAgICAgICAgICAgICAgICAgICAgKHgzLHkzKVxyXG4gICAgLy9cclxuXHJcbiAgICB2YXIgciA9IHdpZHRoIC8gMixcclxuICAgICAgYSA9IE1hdGguYXRhbigoeTIgLSB5MSkgLyAoeDIgLSB4MSkpLFxyXG4gICAgICBiMSA9IGEgKyBNYXRoLlBJLzIsXHJcbiAgICAgIGIyID0gYSAtIE1hdGguUEkvMixcclxuICAgICAgcngxID0gciAqIE1hdGguY29zKGIxKSArIHgxLFxyXG4gICAgICByeTEgPSByICogTWF0aC5zaW4oYjEpICsgeTEsXHJcbiAgICAgIHJ4MiA9IHIgKiBNYXRoLmNvcyhiMSkgKyB4MixcclxuICAgICAgcnkyID0gciAqIE1hdGguc2luKGIxKSArIHkyLFxyXG4gICAgICByeDMgPSByICogTWF0aC5jb3MoYjIpICsgeDIsXHJcbiAgICAgIHJ5MyA9IHIgKiBNYXRoLnNpbihiMikgKyB5MixcclxuICAgICAgcng0ID0gciAqIE1hdGguY29zKGIyKSArIHgxLFxyXG4gICAgICByeTQgPSByICogTWF0aC5zaW4oYjIpICsgeTE7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4MTogcngxLCB5MTogcnkxLCAgeDI6IHJ4MiwgeTI6IHJ5MixcclxuICAgICAgeDQ6IHJ4NCwgeTQ6IHJ5NCwgIHgzOiByeDMsIHkzOiByeTNcclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgZ2V0U2NhbGVkV2lkdGhPZkxpbmUgPSAoeDEsIHkxLCB4MiwgeTIsIHN4LCBzeSwgd2lkdGgpID0+IHtcclxuICAgIC8vICBUaGUgb3JpZ2luYWwgcG9pbnRzIGFyZSBub3QgbW92ZWQuIE9ubHkgdGhlIHdpZHRoIHdpbGwgYmUgc2NhbGVkLlxyXG4gICAgLy8gIFRoZSB3aWR0aCBvZiBhbiBob3Jpem9udGFsIGxpbmUgd2lsbCBiZSBzY2FsZWQgd2l0aCB0aGUgc3kgcmF0aW8gb25seS5cclxuICAgIC8vICBUaGUgd2lkdGggb2YgYSB2ZXJ0aXZhbCBsaW5lIHdpbGwgYmUgc2NhbGVkIHdpdGggdGhlIHN4IHJhdGlvIG9ubHkuXHJcbiAgICAvLyAgVGhlIHdpZHRoIG9mIGFuIG9ibGlxdWUgbGluZSB3aWxsIGJlIHNjYWxlZCB3aXRoIGJvdGggdGhlIHN4IGFuZCBzeVxyXG4gICAgLy9idXQgcHJvcG9ydGlvbmFsIHdpdGggdGhlIGFuZ2xlIGJldHdlZW4gdGhlIGxpbmUgYW5kIHRoZSB4IGFuZCB5IGF4ZXMuXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlxcXHJcbiAgICAvLyAgICAgICAgICAgICAgIC5cXCAgKHgyLHkyKSAgICAgICAgICAgICAgICAgICAgICAgICAuLi5cXCAgKHgyLHkyKVxyXG4gICAgLy8gICAgICAgICAgICAgIC4uLkAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLi4uQFxyXG4gICAgLy8gICAgICAgICAgICAgLi4uLy5cXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLi4uLy5cXFxyXG4gICAgLy8gICAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgICBzeCAgICAgICAgICAgICAuLi4uLi8uLi5cXFxyXG4gICAgLy8gICAgICAgICAgIC4uLi8uLi4gICAgICAgICAgICArLS0tPiAgICAgICAgICAgIC4uLi4uLy4uLi4uXHJcbiAgICAvLyAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAuLi4uLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAuLi4vLi4uICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgXFwuLi4vLi4uLi5cclxuICAgIC8vICAgICAgICAgXFwuLy4uLiAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgXFwuLy4uLi4uXHJcbiAgICAvLyAgICAgICAgICBALi4uICAgICAgICAgICAgIHN5IHYgICAgICAgICAgICAgICAgIEAuLi4uLlxyXG4gICAgLy8gICh4MSx5MSkgIFxcLiAgICAgICAgICAgICAgICAgICAgICAgICAgICh4MSx5MSkgIFxcLi4uXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFwuXHJcbiAgICAvL1xyXG4gICAgdmFyIGEgPSBNYXRoLmF0YW4oKHkyIC0geTEpIC8gKHgyIC0geDEpKSxcclxuICAgICAgc2luYSA9IE1hdGguc2luKGEpLCBjb3NhID0gTWF0aC5jb3MoYSksXHJcbiAgICAgIHNjYWxlZFdpZHRoID0gd2lkdGggKiBNYXRoLnNxcnQoc3gqc3ggKiBzaW5hKnNpbmEgKyBzeSpzeSAqIGNvc2EqY29zYSk7XHJcbiAgICByZXR1cm4gc2NhbGVkV2lkdGg7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCA9ICh4MSwgeTEsIHgyLCB5MiwgZGlzdGFuY2UpID0+IHtcclxuICAgIHZhciByZWN0ID0gZ2V0UmVjdEFyb3VuZExvbmdMaW5lKHgxLCB5MSwgeDIsIHkyLCAyICogZGlzdGFuY2UpO1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAge3gxOiByZWN0LngxLCB5MTogcmVjdC55MSwgeDI6IHJlY3QueDIsIHkyOiByZWN0LnkyfSxcclxuICAgICAge3gxOiByZWN0Lng0LCB5MTogcmVjdC55NCwgeDI6IHJlY3QueDMsIHkyOiByZWN0LnkzfVxyXG4gICAgXTtcclxuICB9LFxyXG5cclxuICBnZXRJbnRlcnNlY3Rpb25PZlR3b0xpbmVzID0gKGwxLCBsMikgPT4ge1xyXG4gICAgdmFyIGExID0gbDEueTIgLSBsMS55MSwgYjEgPSBsMS54MSAtIGwxLngyLCBjMSA9IGwxLngyKmwxLnkxIC0gbDEueDEqbDEueTIsXHJcbiAgICAgICAgYTIgPSBsMi55MiAtIGwyLnkxLCBiMiA9IGwyLngxIC0gbDIueDIsIGMyID0gbDIueDIqbDIueTEgLSBsMi54MSpsMi55MixcclxuICAgICAgICB4ID0gKGMyKmIxIC0gYzEqYjIpIC8gKGExKmIyIC0gYTIqYjEpLFxyXG4gICAgICAgIHkgPSBsMi55MSA9PT0gbDIueTIgPyBsMi55MSA6ICgtYzEgLSBhMSp4KSAvIGIxO1xyXG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5fTtcclxuICB9LFxyXG5cclxuICBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoKHgyLXgxKSooeDIteDEpICsgKHkyLXkxKSooeTIteTEpKTtcclxuICB9LFxyXG5cclxuICBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyA9ICh4MSwgeTEsIHgyLCB5MiwgeDMsIHkzKSA9PiB7XHJcbiAgICB2YXIgYSA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MSwgeTEsIHgyLCB5MiksXHJcbiAgICAgICAgYiA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MiwgeTIsIHgzLCB5MyksXHJcbiAgICAgICAgYyA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MywgeTMsIHgxLCB5MSksXHJcbiAgICAgICAgY29zQyA9IChhKmEgKyBiKmIgLSBjKmMpIC8gKDIqYSpiKSxcclxuICAgICAgICBDID0gTWF0aC5hY29zKGNvc0MpO1xyXG4gICAgcmV0dXJuIEM7XHJcbiAgfSxcclxuXHJcbiAgcGVybXV0ZUxpbmVzID0gKGFscGhhTGluZXMsIGJldGFMaW5lcykgPT4ge1xyXG4gICAgdmFyIHBlcm11dGF0aW9ucyA9IFtdO1xyXG4gICAgYWxwaGFMaW5lcy5mb3JFYWNoKChhbHBoYUxpbmUpID0+IHtcclxuICAgICAgYmV0YUxpbmVzLmZvckVhY2goKGJldGFMaW5lKSA9PiB7XHJcbiAgICAgICAgcGVybXV0YXRpb25zLnB1c2goe2FscGhhOiBhbHBoYUxpbmUsIGJldGE6IGJldGFMaW5lfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIHJldHVybiBwZXJtdXRhdGlvbnM7XHJcbiAgfSxcclxuXHJcbiAgYWxtb3N0RXF1YWwgPSAoYSwgYikgPT4ge1xyXG4gICAgLy8gZ3Jvc3MgYXBwcm94aW1hdGlvbiB0byBjb3ZlciB0aGUgZmxvdCBhbmQgdHJpZ29ub21ldHJpYyBwcmVjaXNpb25cclxuICAgIHJldHVybiBhID09PSBiIHx8IE1hdGguYWJzKGEgLSBiKSA8IDIwICogRVBTSUxPTjtcclxuICB9LFxyXG5cclxuICBpc0NlbnRlckluQmV0d2VlbiA9IChjeCwgY3ksIHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpID0+IHtcclxuICAgIC8vXHJcbiAgICAvLyAgVHJ1ZSBpcyByZXR1cm5lZCBpbiBzaXR1YXRpb25zIGxpa2UgdGhpcyBvbmU6XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAgL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAnICAgL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvLyAgICAgICAgICAgICAgPT09UDA9PT09PT09PT09UDE9PT09PT09PT09PT09XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvLyAgICAgICAgICAgICAgLS0tLS0tLS0tQy0tLS8tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAnICAgL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAnICAgL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICcgICBQMlxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgJyAgIC9cclxuICAgIC8vXHJcbiAgICB2YXIgYSA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzKHgyLCB5MiwgeDEsIHkxLCB4MCwgeTApLFxyXG4gICAgICAgIGExID0gZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoY3gsIGN5LCB4MSwgeTEsIHgwLCB5MCksXHJcbiAgICAgICAgYTIgPSBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyhjeCwgY3ksIHgxLCB5MSwgeDIsIHkyKTtcclxuICAgIHJldHVybiBhbG1vc3RFcXVhbChhLCBhMSArIGEyKSAmJiAoYTEgKyBhMiA8PSBNYXRoLlBJKTtcclxuICB9LFxyXG5cclxuICBnZXRUaGVDZW50ZXJPZlRoZUNvcm5lciA9ICh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCBkaXN0YW5jZSwgc3gsIHN5KSA9PiB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkICBkXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgYWxwaGEgbGluZSAwICAgIC0tLS0tLS0tLS0tLS0nLS0vLS0nLS0tLS0tLS0tXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnICAgICAgICAgICAgIGRcclxuICAgIC8vICAgICBnaXZlbiBsaW5lICAgID09PVA9PT09PT09PT09UD09PT09PT09PT09PT09XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJyAgICAgICAgICAgICAgIGRcclxuICAgIC8vICAgYWxwaGEgbGluZSAxICAgIC0tLS0tLS0tLUMtLS8tLSctLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAnICBQICAnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vXHJcbiAgICAvLyAgICAgYmV0YSBsaW5lcyAwICYgMSB3aXRoIG9uZSBvZiB0aGUgZ2l2ZW4gbGluZSBpbmJldHdlZW5cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gIFAgPSB0aGUgZ2l2ZW4gUDAsIFAxLCBQMiBwb2ludHNcclxuICAgIC8vXHJcbiAgICAvLyAgZCA9IHRoZSBnaXZlbiBkaXN0YW5jZSAvIHJhZGl1cyBvZiB0aGUgY2lyY2xlXHJcbiAgICAvL1xyXG4gICAgLy8gIEMgPSB0aGUgY2VudGVyIG9mIHRoZSBjaXJjbGUvY29ybmVyIHRvIGJlIGRldGVybWluZWRcclxuXHJcbiAgICB2YXIgZDEgPSBnZXRTY2FsZWRXaWR0aE9mTGluZSh4MCwgeTAsIHgxLCB5MSwgc3gsIHN5LCBkaXN0YW5jZSksXHJcbiAgICAgICAgZDIgPSBnZXRTY2FsZWRXaWR0aE9mTGluZSh4MSwgeTEsIHgyLCB5Miwgc3gsIHN5LCBkaXN0YW5jZSksXHJcbiAgICAgICAgYWxwaGFMaW5lcyA9IGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQoeDAsIHkwLCB4MSwgeTEsIGQxKSxcclxuICAgICAgICBiZXRhTGluZXMgPSBnZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50KHgxLCB5MSwgeDIsIHkyLCBkMiksXHJcbiAgICAgICAgcGVybXV0YXRpb25zID0gcGVybXV0ZUxpbmVzKGFscGhhTGluZXMsIGJldGFMaW5lcyksXHJcbiAgICAgICAgaW50ZXJzZWN0aW9ucyA9IHBlcm11dGF0aW9ucy5tYXAoKHApID0+IGdldEludGVyc2VjdGlvbk9mVHdvTGluZXMocC5hbHBoYSwgcC5iZXRhKSksXHJcbiAgICAgICAgY2VudGVyID0gaW50ZXJzZWN0aW9ucy5maWx0ZXIoKGkpID0+IGlzQ2VudGVySW5CZXR3ZWVuKGkueCwgaS55LCB4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSlbMF07XHJcblxyXG4gICAgcmV0dXJuIGNlbnRlciB8fCB7eDogTmFOLCB5OiBOYU59O1xyXG4gIH0sXHJcblxyXG4gIGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIgPSAoeDEsIHkxLCB4MiwgeTIsIGN4LCBjeSkgPT4ge1xyXG4gICAgdmFyIG0gPSAoeTIgLSB5MSkgLyAoeDIgLSB4MSksXHJcbiAgICAgICAgY20gPSAtMSAvIG0sXHJcbiAgICAgICAgQyA9IHkxKih4MiAtIHgxKSAtIHgxKih5MiAtIHkxKSxcclxuICAgICAgICB4ID0gKEMgLSAoeDIgLSB4MSkqKGN5IC0gY20qY3gpKSAvIChjbSooeDIgLSB4MSkgKyB5MSAtIHkyKSxcclxuICAgICAgICB5ID0gY20qKHggLSBjeCkgKyBjeTtcclxuICAgIHJldHVybiBtID09PSAwIC8vIGhvcml6b250YWxcclxuICAgICAgPyB7eDogY3gsIHk6IHkxfVxyXG4gICAgICA6IChtID09PSBJbmZpbml0eSAvLyB2ZXJ0aWNhbFxyXG4gICAgICAgID8ge3g6IHgxLCB5OiBjeX1cclxuICAgICAgICA6IHt4OiB4LCB5OiB5fSk7XHJcbiAgfSxcclxuXHJcbiAgeHlUb0FyY0FuZ2xlID0gKGN4LCBjeSwgeCwgeSkgPT4ge1xyXG4gICAgdmFyIGhvcml6b250YWxYID0gY3ggKyAxLFxyXG4gICAgICAgIGhvcml6b250YWxZID0gY3ksXHJcbiAgICAgICAgYSA9IE1hdGguYWJzKGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzKHgsIHksIGN4LCBjeSwgaG9yaXpvbnRhbFgsIGhvcml6b250YWxZKSk7XHJcbiAgICBpZih5IDwgY3kpIHtcclxuICAgICAgLy90aGlyZCAmIGZvcnRoIHF1YWRyYW50c1xyXG4gICAgICBhID0gTWF0aC5QSSArIE1hdGguUEkgLSBhO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGE7XHJcbiAgfSxcclxuXHJcbiAgc2NhbGVkUmFkaXVzID0gKHIsIHN4LCBzeSwgYSkgPT4ge1xyXG4gICAgLy9cclxuICAgIC8vICBUaGUgc3ggYW5kIHN5IHNjYWxpbmdzIGNhbiBiZSBkaWZmZXJlbnQgc28gdGhlIGNpcmNsZSBsb29rcyBtb3JlIGxpa2UgYW5cclxuICAgIC8vZWxsaXBzZS4gVGhpcyBmdW5jdGlvbiBpcyByZXR1cm5pbmcgdGhlIHJhZGl1cyBjb3Jyc3BvbmRpbmcgdG8gdGhlIHNwZWNpZmllZCBhbmdsZVxyXG4gICAgLy9hbmQgdGFraW5nIGludG8gYWNjb3VudCB0aGUgc3ggYW5kIHN5IHZhbHVlcy5cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICogICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogICAgICAgICpcclxuICAgIC8vICAgICAgICAgKiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAqXHJcbiAgICAvLyAgICAgICAqICAgICAgICAgICAgICogICAgICAgICAgIHN4ICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAqXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKy0tLS0tLT4gICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgKlxyXG4gICAgLy8gICAgICAgKiAgICAgICAgICAgICAqICAgICAgIHxcclxuICAgIC8vICAgICAgICAgKiAgICAgICAgICogICAgICBzeSB2ICAgICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAqXHJcbiAgICAvLyAgICAgICAgICAgICogICAqICAgICAgICAgICAgICAgICAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAqXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgKlxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogICAgICAgICAqXHJcbiAgICAvL1xyXG4gICAgdmFyIG5hID0gYSAlICgyKlBJKTsgLy9ub3JtYWxpemVkIGFuZ2xlXHJcbiAgICBpZiAoc3ggPT09IHN5KSB7XHJcbiAgICAgIHJldHVybiByICogc3g7XHJcbiAgICB9IGVsc2UgaWYgKGFsbW9zdEVxdWFsKG5hLCAwKSB8fCBhbG1vc3RFcXVhbChuYSwgUEkpKSB7XHJcbiAgICAgIHJldHVybiByICogc3g7XHJcbiAgICB9IGVsc2UgaWYgKGFsbW9zdEVxdWFsKG5hLCBQSS8yKSB8fCBhbG1vc3RFcXVhbChuYSwgMypQSS8yKSkge1xyXG4gICAgICByZXR1cm4gciAqIHN5O1xyXG4gICAgfSBlbHNlIGlmIChuYSA8IDEqUEkvMikge1xyXG4gICAgICB2YXIgYWEgPSBuYTsgLy9hZGp1c3RlZCBhbmdsZVxyXG4gICAgICByZXR1cm4gciAqIChzeCAqIChQSS8yLWFhKS8oUEkvMikgKyBzeSAqIChhYSkvKFBJLzIpKTtcclxuICAgIH0gZWxzZSBpZiAobmEgPCAyKlBJLzIpIHtcclxuICAgICAgdmFyIGFhID0gbmEgLSAxKlBJLzI7IC8vYWRqdXN0ZWQgYW5nbGVcclxuICAgICAgcmV0dXJuIHIgKiAoc3ggKiAoYWEpLyhQSS8yKSArIHN5ICogKFBJLzItYWEpLyhQSS8yKSk7XHJcbiAgICB9IGVsc2UgaWYgKG5hIDwgMypQSS8yKSB7XHJcbiAgICAgIHZhciBhYSA9IG5hIC0gMipQSS8yOyAvL2FkanVzdGVkIGFuZ2xlXHJcbiAgICAgIHJldHVybiByICogKHN4ICogKFBJLzItYWEpLyhQSS8yKSArIHN5ICogKGFhKS8oUEkvMikpO1xyXG4gICAgfSBlbHNlIGlmIChuYSA8IDQqUEkvMikge1xyXG4gICAgICB2YXIgYWEgPSBuYSAtIDMqUEkvMjsgLy9hZGp1c3RlZCBhbmdsZVxyXG4gICAgICByZXR1cm4gciAqIChzeCAqIChhYSkvKFBJLzIpICsgc3kgKiAoUEkvMi1hYSkvKFBJLzIpKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBjb2xsaW5lYXIgPSAoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MikgPT4ge1xyXG4gICAgdmFyIG0xID0gKHkxIC0geTApIC8gKHgxIC0geDApLFxyXG4gICAgICAgIG0yID0gKHkyIC0geTEpIC8gKHgyIC0geDEpO1xyXG4gICAgcmV0dXJuIGFsbW9zdEVxdWFsKG0xLCBtMik7XHJcbiAgfSxcclxuXHJcbiAgZGVjb21wb3NlQXJjVG8gPSAoeDAsIHkwLCB4MSwgeTEsIHgyLCB5Miwgciwgc3gsIHN5KSA9PiB7XHJcbiAgICAvL1xyXG4gICAgLy8gIFRoZSBzeCBhbmQgc3kgaXMgdXNlZCB0byBzY2FsZSB0aGUgcmFkaXVzIChyKSBvbmx5LlxyXG4gICAgLy9BbGwgb3RoZXIgY29vcmRpbmF0ZXMgaGF2ZSB0byBiZSBhbHJlYWR5IHNjYWxlZC5cclxuICAgIC8vXHJcbiAgICB2YXIgZGVjb21wb3NpdGlvbiA9IHtcclxuICAgICAgcG9pbnQ6IHt4OiB4MSwgeTogeTF9XHJcbiAgICB9O1xyXG4gICAgaWYoY29sbGluZWFyKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpKSB7XHJcbiAgICAgIGRlY29tcG9zaXRpb24ubGluZSA9IHt4MTogeDAsIHkxOiB5MCwgeDI6IHgxLCB5MjogeTF9O1xyXG4gICAgfSBlbHNlIGlmICghaXNOYU4oeDApICYmICFpc05hTih5MCkpIHtcclxuICAgICAgdmFyIGNlbnRlciA9IGdldFRoZUNlbnRlck9mVGhlQ29ybmVyKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHIsIHN4LCBzeSksXHJcbiAgICAgICAgICBmb290MSA9IGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIoeDAsIHkwLCB4MSwgeTEsIGNlbnRlci54LCBjZW50ZXIueSksXHJcbiAgICAgICAgICBmb290MiA9IGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIoeDEsIHkxLCB4MiwgeTIsIGNlbnRlci54LCBjZW50ZXIueSksXHJcbiAgICAgICAgICBhbmdsZUZvb3QxID0geHlUb0FyY0FuZ2xlKGNlbnRlci54LCBjZW50ZXIueSwgZm9vdDEueCwgZm9vdDEueSksXHJcbiAgICAgICAgICBhbmdsZUZvb3QyID0geHlUb0FyY0FuZ2xlKGNlbnRlci54LCBjZW50ZXIueSwgZm9vdDIueCwgZm9vdDIueSksXHJcbiAgICAgICAgICBzQW5nbGUgPSBNYXRoLmFicyhhbmdsZUZvb3QyIC0gYW5nbGVGb290MSkgPCBNYXRoLlBJID8gYW5nbGVGb290MiA6IGFuZ2xlRm9vdDEsXHJcbiAgICAgICAgICBlQW5nbGUgPSBNYXRoLmFicyhhbmdsZUZvb3QyIC0gYW5nbGVGb290MSkgPCBNYXRoLlBJID8gYW5nbGVGb290MSA6IGFuZ2xlRm9vdDI7XHJcbiAgICAgIGlmIChzQW5nbGUgPiBlQW5nbGUpIHtcclxuICAgICAgICB2YXIgdGVtcCA9IHNBbmdsZTtcclxuICAgICAgICBzQW5nbGUgPSBlQW5nbGU7XHJcbiAgICAgICAgZUFuZ2xlID0gdGVtcCArIDIqUEk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFpc05hTihjZW50ZXIueCkgJiYgIWlzTmFOKGNlbnRlci55KSkge1xyXG4gICAgICAgIGlmICghYWxtb3N0RXF1YWwoZ2V0RGlzdGFuY2VCZXR3ZWVuVHdvUG9pbnRzKHgwLCB5MCwgZm9vdDEueCwgZm9vdDEueSksIDApKSB7XHJcbiAgICAgICAgICBkZWNvbXBvc2l0aW9uLmxpbmUgPSB7eDE6IHgwLCB5MTogeTAsIHgyOiBmb290MS54LCB5MjogZm9vdDEueX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlY29tcG9zaXRpb24uYXJjID0ge3g6IGNlbnRlci54LCB5OiBjZW50ZXIueSwgcjogciwgc0FuZ2xlOiBzQW5nbGUsIGVBbmdsZTogZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlOiBmYWxzZX07XHJcbiAgICAgICAgZGVjb21wb3NpdGlvbi5wb2ludCA9IHt4OiBmb290Mi54LCB5OiBmb290Mi55fTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRlY29tcG9zaXRpb247XHJcbiAgfSxcclxuXHJcbiAgcmVsZXZhbnRBcmNBbmdsZXMgPSAoc0FuZ2xlLCBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2UpID0+IHtcclxuICAgIC8vXHJcbiAgICAvLyAgVGhlIGZ1bmN0aW9uIGlzIHJldHVybmluZyB0aGUgc3BlY2lmaWVkIHNBbmdsZSBhbmQgZUFuZ2xlIGFuZFxyXG4gICAgLy9hbGwgdGhlIG11bHRpcGxlIG9mIFBJLzIuIFRoZSByZXN1bHQgZG9lc24ndCBjb250YWluIGR1cGxpY2F0aW9ucy5cclxuICAgIC8vICBFeGFtcGxlOiBGb3Igc0FuZ2xlID0gUEkvNiBhbmQgZUFuZ2xlID0gNypQSS82LFxyXG4gICAgLy8gV2hlbiBjb3VudGVyY2xvY2t3aXNlID0gZmFsc2UgdGhlIHJlc3VsdCBpczogW1BJLzYsIDcqUEkvNiwgUEkvMiwgMipQSS8yXVxyXG4gICAgLy8gV2hlbiBjb3VudGVyY2xvY2t3aXNlID0gdHJ1ZSB0aGUgcmVzdWx0IGlzOiBbUEkvNiwgNypQSS82LCAzKlBJLzIsIDQqUEkvMl1cclxuICAgIC8vXHJcbiAgICB2YXIgYW5nbGVzID0gW10sIHVuaXF1ZUFuZ2xlcyA9IFtdO1xyXG4gICAgYW5nbGVzLnB1c2goc0FuZ2xlKTtcclxuICAgIGFuZ2xlcy5wdXNoKGVBbmdsZSk7XHJcbiAgICBpZiAoY291bnRlcmNsb2Nrd2lzZSkge1xyXG4gICAgICB2YXIgdGVtcCA9IHNBbmdsZTtcclxuICAgICAgICAgIHNBbmdsZSA9IGVBbmdsZTtcclxuICAgICAgICAgIGVBbmdsZSA9IHNBbmdsZSArIDIqUEk7XHJcbiAgICB9XHJcbiAgICBbMSpQSS8yLCAyKlBJLzIsIDMqUEkvMiwgNCpQSS8yXS5mb3JFYWNoKChhKSA9PiB7XHJcbiAgICAgIGlmKGVBbmdsZSA+IGEgJiYgYSA+IHNBbmdsZSkge1xyXG4gICAgICAgIGFuZ2xlcy5wdXNoKGEpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL3JlbW92aW5nIHRoZSBkdXBsaWNhdGVkIHBvaW50c1xyXG4gICAgdW5pcXVlQW5nbGVzLnB1c2goYW5nbGVzLnBvcCgpKTtcclxuICAgIHdoaWxlKGFuZ2xlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciBhbmdsZSA9IGFuZ2xlcy5wb3AoKSxcclxuICAgICAgICAgIGZvdW5kID0gdW5pcXVlQW5nbGVzLmZpbmQoKGEpID0+XHJcbiAgICAgICAgICAgIGFsbW9zdEVxdWFsKGFuZ2xlLCBhKSB8fFxyXG4gICAgICAgICAgICBhbG1vc3RFcXVhbChhbmdsZSAtIDIqUEksIGEpIHx8XHJcbiAgICAgICAgICAgIGFsbW9zdEVxdWFsKGFuZ2xlLCBhIC0gMipQSSkpO1xyXG4gICAgICBpZiAoZm91bmQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHVuaXF1ZUFuZ2xlcy5wdXNoKGFuZ2xlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB1bmlxdWVBbmdsZXM7XHJcbiAgfSxcclxuXHJcbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNzUyNzI1L2ZpbmRpbmctd2hldGhlci1hLXBvaW50LWxpZXMtaW5zaWRlLWEtcmVjdGFuZ2xlLW9yLW5vdFxyXG4gIGlzUG9pbnRJbnNpZGVSZWN0YW5nbGUgPSAocG9pbnQsIHJlY3RhbmdsZSkgPT4ge1xyXG4gICAgdmFyIHNlZ21lbnRzID0gW3tcclxuICAgICAgeDE6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MTogcmVjdGFuZ2xlLnksXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55IH0sIHtcclxuICAgICAgeDE6IHJlY3RhbmdsZS54ICsgcmVjdGFuZ2xlLndpZHRoLFxyXG4gICAgICB5MTogcmVjdGFuZ2xlLnksXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodH0sIHtcclxuICAgICAgeDE6IHJlY3RhbmdsZS54ICsgcmVjdGFuZ2xlLndpZHRoLFxyXG4gICAgICB5MTogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHR9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodCxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnlcclxuICAgIH1dO1xyXG5cclxuICAgIHZhciBpc0luc2lkZSA9IHNlZ21lbnRzLm1hcCgoc2VnbWVudCkgPT4ge1xyXG4gICAgICB2YXIgQSA9IC0oc2VnbWVudC55MiAtIHNlZ21lbnQueTEpLFxyXG4gICAgICAgIEIgPSBzZWdtZW50LngyIC0gc2VnbWVudC54MSxcclxuICAgICAgICBDID0gLShBICogc2VnbWVudC54MSArIEIgKiBzZWdtZW50LnkxKSxcclxuICAgICAgICBEID0gQSAqIHBvaW50LnggKyBCICogcG9pbnQueSArIEM7XHJcbiAgICAgICAgcmV0dXJuIEQ7XHJcbiAgICB9KS5ldmVyeSgoRCkgPT4ge1xyXG4gICAgICByZXR1cm4gRCA+IDA7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gaXNJbnNpZGU7XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMuZ2V0QkJveCA9IGdldEJCb3g7XHJcbiAgdGhpcy51bmlvbiA9IHVuaW9uO1xyXG4gIHRoaXMudG90YWxUcmFuc2Zvcm0gPSB0b3RhbFRyYW5zZm9ybTtcclxuICB0aGlzLmdldFJlY3RBcm91bmRMaW5lID0gZ2V0UmVjdEFyb3VuZExpbmU7XHJcbiAgdGhpcy5nZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50ID0gZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudDtcclxuICB0aGlzLmdldEludGVyc2VjdGlvbk9mVHdvTGluZXMgPSBnZXRJbnRlcnNlY3Rpb25PZlR3b0xpbmVzO1xyXG4gIHRoaXMuZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMgPSBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cztcclxuICB0aGlzLmdldFRoZUNlbnRlck9mVGhlQ29ybmVyID0gZ2V0VGhlQ2VudGVyT2ZUaGVDb3JuZXI7XHJcbiAgdGhpcy5nZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyID0gZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhcjtcclxuICB0aGlzLnh5VG9BcmNBbmdsZSA9IHh5VG9BcmNBbmdsZTtcclxuICB0aGlzLnNjYWxlZFJhZGl1cyA9IHNjYWxlZFJhZGl1cztcclxuICB0aGlzLmRlY29tcG9zZUFyY1RvID0gZGVjb21wb3NlQXJjVG87XHJcbiAgdGhpcy5pc1BvaW50SW5zaWRlUmVjdGFuZ2xlID0gaXNQb2ludEluc2lkZVJlY3RhbmdsZTtcclxuXHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cnkuanMnXHJcbmltcG9ydCB7IEN1c3RvbU1hdGNoZXJzIH0gZnJvbSAnLi9jdXN0b21NYXRjaGVycy5qcydcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gUmFiYml0KGdlb21ldHJ5LCBtYXRjaGVycykge1xyXG5cclxuICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICBnZW9tZXRyeSA9IGdlb21ldHJ5IHx8IG5ldyBHZW9tZXRyeSgpLFxyXG4gICAgbWF0Y2hlcnMgPSBtYXRjaGVycyB8fCBuZXcgQ3VzdG9tTWF0Y2hlcnMoKTtcclxuXHJcblxyXG4gIHZhciBmaW5kQWxsU2hhcGVzSWdub3JpbmdBcmd1bWVudHMgPSAoc2hhcGUsIHdoZXJlKSA9PiB7XHJcbiAgICB2YXIgZm91bmQgPSBbXSwgaW5kZXggPSAwO1xyXG4gICAgZG8ge1xyXG4gICAgICBpbmRleCA9IHRoYXQuZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMoc2hhcGUsIHdoZXJlLCBpbmRleCk7XHJcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICBmb3VuZC5wdXNoKHdoZXJlLnNsaWNlKGluZGV4LCBpbmRleCArIHNoYXBlLmxlbmd0aCkpO1xyXG4gICAgICAgIGluZGV4ICs9IHNoYXBlLmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgfSB3aGlsZSAoaW5kZXggIT09IC0xICYmIGluZGV4IDwgd2hlcmUubGVuZ3RoKTtcclxuICAgIHJldHVybiBmb3VuZDtcclxuICB9LFxyXG5cclxuICBmaW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyA9IChzaGFwZSwgd2hlcmUsIHN0YXJ0SW5kZXgpID0+IHtcclxuICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4IHx8IDA7XHJcbiAgICB2YXIgbWF0Y2ggPSBmYWxzZSwgaW5kZXggPSAtMTtcclxuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4OyBpIDw9IHdoZXJlLmxlbmd0aCAtIHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIG1hdGNoID0gdHJ1ZTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzaGFwZS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIGlmICh3aGVyZVtpICsgal0ubWV0aG9kICE9PSBzaGFwZVtqXS5tZXRob2QpIHtcclxuICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG1hdGNoID09PSB0cnVlKSB7XHJcbiAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5kZXg7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlU2hhcGVzID0gKHNoYXBlcywgZnJvbSkgPT4ge1xyXG4gICAgdmFyIGNvcHkgPSBmcm9tLnNsaWNlKDAsIGZyb20ubGVuZ3RoKTtcclxuICAgIHNoYXBlcy5mb3JFYWNoKChzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgaW5kZXggPSAtMTtcclxuICAgICAgZG8ge1xyXG4gICAgICAgIGluZGV4ID0gdGhhdC5maW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyhzaGFwZSwgY29weSk7XHJcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgY29weS5zcGxpY2UoaW5kZXgsIHNoYXBlLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IHdoaWxlIChpbmRleCAhPT0gLTEpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY29weTtcclxuICB9O1xyXG5cclxuXHJcbiAgdGhpcy5nZXRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveDtcclxuICB0aGlzLmN1c3RvbU1hdGNoZXJzID0gbWF0Y2hlcnM7XHJcbiAgdGhpcy5maW5kQWxsU2hhcGVzSWdub3JpbmdBcmd1bWVudHMgPSBmaW5kQWxsU2hhcGVzSWdub3JpbmdBcmd1bWVudHM7XHJcbiAgdGhpcy5maW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyA9IGZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzO1xyXG4gIHRoaXMucmVtb3ZlU2hhcGVzID0gcmVtb3ZlU2hhcGVzO1xyXG5cclxufVxyXG4iXX0=
