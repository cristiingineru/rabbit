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
          sAngle = shape.sAngle,
          eAngle = shape.eAngle,
          counterclockwise = shape.counterclockwise,

      //scaledLineWidth = state.lineWidth !== 1 ? state.lineWidth : 0,
      //xScaledLineWidth = scaledLineWidth * state.transform.scale.x,
      //yScaledLineWidth = scaledLineWidth * state.transform.scale.y,
      //newBox = {x: cx - rx - xScaledLineWidth / 2, y: cy - ry - yScaledLineWidth / 2, width: 2 * rx + xScaledLineWidth, height: 2 * ry + yScaledLineWidth},
      arcPoints = relevantArcPoints(cx, cy, rx, sAngle, eAngle, counterclockwise),
          newBox = boxPoints(arcPoints);
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
          rx = r * state.transform.scale.x,
          ry = r * state.transform.scale.y,
          sAngle = call.arguments[3],
          eAngle = call.arguments[4],
          counterclockwise = call.arguments[5] || false;
      state.shapesInPath.push({ type: 'arc', cx: cx, cy: cy, rx: rx, ry: ry, sAngle: sAngle, eAngle: eAngle, counterclockwise: counterclockwise });
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
          r = call.arguments[4] * state.transform.scale.x,
          decomposition = decomposeArcTo(x0, y0, x1, y1, x2, y2, r);
      if (decomposition.line) {
        state.shapesInPath.push({ type: 'lineTo', x1: decomposition.line.x1, y1: decomposition.line.y1, x2: decomposition.line.x2, y2: decomposition.line.y2 });
      }
      if (decomposition.arc) {
        state.shapesInPath.push({ type: 'arc', cx: decomposition.arc.x, cy: decomposition.arc.y, rx: r, ry: r, sAngle: decomposition.arc.sAngle, eAngle: decomposition.arc.eAngle, counterclockwise: decomposition.arc.counterclockwise });
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
    var a1 = getAngleBetweenThreePoints(cx, cy, x1, y1, x0, y0),
        a2 = getAngleBetweenThreePoints(cx, cy, x1, y1, x2, y2);
    return almostEqual(a1, a2) && a1 <= Math.PI / 2;
  },
      getTheCenterOfTheCorner = function getTheCenterOfTheCorner(x0, y0, x1, y1, x2, y2, distance) {
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

    var alphaLines = getParallelsAroundSegment(x0, y0, x1, y1, distance),
        betaLines = getParallelsAroundSegment(x1, y1, x2, y2, distance),
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
      collinear = function collinear(x0, y0, x1, y1, x2, y2) {
    var m1 = (y1 - y0) / (x1 - x0),
        m2 = (y2 - y1) / (x2 - x1);
    return almostEqual(m1, m2);
  },
      decomposeArcTo = function decomposeArcTo(x0, y0, x1, y1, x2, y2, r) {
    var decomposition = {
      point: { x: x1, y: y1 }
    };
    if (collinear(x0, y0, x1, y1, x2, y2)) {
      decomposition.line = { x1: x0, y1: y0, x2: x1, y2: y1 };
    } else if (!isNaN(x0) && !isNaN(y0)) {
      var center = getTheCenterOfTheCorner(x0, y0, x1, y1, x2, y2, r),
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
        decomposition.line = { x1: x0, y1: y0, x2: foot1.x, y2: foot1.y };
        decomposition.arc = { x: center.x, y: center.y, r: r, sAngle: sAngle, eAngle: eAngle, counterclockwise: false };
        decomposition.point = { x: foot2.x, y: foot2.y };
      }
    }
    return decomposition;
  },
      relevantArcPoints = function relevantArcPoints(cx, cy, r, sAngle, eAngle, counterclockwise) {
    var points = [],
        relevantPoints = [];
    points.push({ x: cx + r * cos(sAngle), y: cy + r * sin(sAngle) });
    points.push({ x: cx + r * cos(eAngle), y: cy + r * sin(eAngle) });
    if (counterclockwise) {
      var temp = sAngle;
      sAngle = eAngle;
      eAngle = sAngle + 2 * PI;
    }
    [1 * PI / 2, 2 * PI / 2, 3 * PI / 2, 4 * PI / 2].forEach(function (a) {
      if (eAngle > a && a > sAngle) {
        points.push({ x: cx + r * cos(a), y: cy + r * sin(a) });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGN1c3RvbU1hdGNoZXJzLmpzIiwic3JjXFxnZW9tZXRyeS5qcyIsInNyY1xccmFiYml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7O1FBS2dCLGMsR0FBQSxjOztBQUhoQjs7QUFHTyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0M7O0FBRXZDLGFBQVcsWUFBWSx3QkFBdkI7O0FBR0EsTUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBTyxxQkFBUCxFQUFpQztBQUNoRCxXQUFPO0FBQ0wsZUFBUyxpQkFBQyxNQUFELEVBQVMsUUFBVCxFQUFzQjtBQUM3QixZQUFJLFFBQVEsS0FBWjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxTQUFTLE1BQVQsR0FBa0IsT0FBTyxNQUE3QyxFQUFxRCxHQUFyRCxFQUEwRDtBQUN4RCxrQkFBUSxPQUFPLE1BQVAsR0FBZ0IsQ0FBeEI7QUFDQSxlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksT0FBTyxNQUEzQixFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxnQkFBSSxTQUFTLElBQUksQ0FBYixFQUFnQixNQUFoQixLQUEyQixPQUFPLENBQVAsRUFBVSxNQUF6QyxFQUFpRDtBQUMvQyxzQkFBUSxLQUFSO0FBQ0E7QUFDRDtBQUNGO0FBQ0QsY0FBSSxVQUFVLElBQWQsRUFBb0I7QUFDbEI7QUFDRDtBQUNGO0FBQ0QsWUFBSSxTQUFTLFFBQVEsRUFBQyxNQUFNLElBQVAsRUFBUixHQUF1QixFQUFDLE1BQU0sS0FBUCxFQUFjLFNBQVMsbUJBQXZCLEVBQXBDO0FBQ0EsZUFBTyxNQUFQO0FBQ0Q7QUFqQkksS0FBUDtBQW1CRCxHQXBCRDtBQUFBLE1Bc0JBLHNCQUFzQixTQUF0QixtQkFBc0IsQ0FBQyxJQUFELEVBQU8scUJBQVAsRUFBaUM7QUFDckQsV0FBTztBQUNMLGVBQVMsaUJB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QUssS0FBTCxDQUFXLENBQVgsRUFBYyxLQUFLLE1BQW5CLENBQVg7QUFDQSxXQUFPLE9BQVAsQ0FBZSxVQUFDLEtBQUQsRUFBVztBQUN4QixVQUFJLFFBQVEsQ0FBQyxDQUFiO0FBQ0EsU0FBRztBQUNELGdCQUFRLEtBQUssMEJBQUwsQ0FBZ0MsS0FBaEMsRUFBdUMsSUFBdkMsQ0FBUjtBQUNBLFlBQUksVUFBVSxDQUFDLENBQWYsRUFBa0I7QUFDaEIsZUFBSyxNQUFMLENBQVksS0FBWixFQUFtQixNQUFNLE1BQXpCO0FBQ0Q7QUFDRixPQUxELFFBS1MsVUFBVSxDQUFDLENBTHBCO0FBTUQsS0FSRDtBQVNBLFdBQU8sSUFBUDtBQUNELEdBM0NEOztBQThDQSxPQUFLLE9BQUwsR0FBZSxTQUFTLE9BQXhCO0FBQ0EsT0FBSyxjQUFMLEdBQXNCLFFBQXRCO0FBQ0EsT0FBSyw4QkFBTCxHQUFzQyw4QkFBdEM7QUFDQSxPQUFLLDBCQUFMLEdBQWtDLDBCQUFsQztBQUNBLE9BQUssWUFBTCxHQUFvQixZQUFwQjtBQUVEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJ5LmpzJ1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBDdXN0b21NYXRjaGVycyhnZW9tZXRyeSkge1xyXG5cclxuICBnZW9tZXRyeSA9IGdlb21ldHJ5IHx8IG5ldyBHZW9tZXRyeSgpO1xyXG5cclxuXHJcbiAgdmFyIHRvQmVQYXJ0T2YgPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXhwZWN0ZWQubGVuZ3RoIC0gYWN0dWFsLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBtYXRjaCA9IGFjdHVhbC5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhY3R1YWwubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKGV4cGVjdGVkW2kgKyBqXS5tZXRob2QgIT09IGFjdHVhbFtqXS5tZXRob2QpIHtcclxuICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAobWF0Y2ggPT09IHRydWUpIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBtYXRjaCA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlIG5vdCBwYXJ0IG9mJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvQmVJbnNpZGVUaGVBcmVhT2YgPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBzbWFsbFNoYXBlID0gYWN0dWFsLFxyXG4gICAgICAgICAgYmlnU2hhcGUgPSBleHBlY3RlZCxcclxuICAgICAgICAgIGJpZ1NoYXBlQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYmlnU2hhcGUpLFxyXG4gICAgICAgICAgc21hbGxTaGFwZUJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KHNtYWxsU2hhcGUpLFxyXG4gICAgICAgICAgY2VudGVyID0ge3g6IHNtYWxsU2hhcGVCQm94LnggKyBzbWFsbFNoYXBlQkJveC53aWR0aCAvIDIsIHk6IHNtYWxsU2hhcGVCQm94LnkgKyBzbWFsbFNoYXBlQkJveC5oZWlnaHQgLyAyfSxcclxuICAgICAgICAgIGlzQ2VudGVySW5zaWRlID0gZ2VvbWV0cnkuaXNQb2ludEluc2lkZVJlY3RhbmdsZShjZW50ZXIsIGJpZ1NoYXBlQkJveCksXHJcbiAgICAgICAgICByZXN1bHQgPSBpc0NlbnRlckluc2lkZSA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlIGlzIG5vdCBpbnNpZGUgdGhlIGFyZWEgb2YnfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9IYXZlVGhlU2FtZVBvc2l0aW9uV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lUG9zaXRpb24gPSBhY3R1YWxCQm94LnggPT09IGV4cGVjdGVkQkJveC54ICYmIGFjdHVhbEJCb3gueSA9PT0gZXhwZWN0ZWRCQm94LnksXHJcbiAgICAgICAgICByZXN1bHQgPSBoYXZlVGhlU2FtZVBvc2l0aW9uID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgcG9zaXRpb24nfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9IYXZlVGhlU2FtZVNpemVXaXRoID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgYWN0dWFsQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYWN0dWFsKSxcclxuICAgICAgICAgIGV4cGVjdGVkQkJveCA9IGdlb21ldHJ5LmdldEJCb3goZXhwZWN0ZWQpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVTaXplID0gYWN0dWFsQkJveC53aWR0aCA9PT0gZXhwZWN0ZWRCQm94LndpZHRoICYmIGFjdHVhbEJCb3guaGVpZ2h0ID09PSBleHBlY3RlZEJCb3guaGVpZ2h0LFxyXG4gICAgICAgICAgcmVzdWx0ID0gaGF2ZVRoZVNhbWVTaXplID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgc2l6ZSd9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlSG9yaXpvbnRhbGx5QWxpZ25XaXRoID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgYWN0dWFsQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYWN0dWFsKSxcclxuICAgICAgICAgIGV4cGVjdGVkQkJveCA9IGdlb21ldHJ5LmdldEJCb3goZXhwZWN0ZWQpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVBbGlnbm1lbnQgPSBhY3R1YWxCQm94LnkgPT09IGV4cGVjdGVkQkJveC55LFxyXG4gICAgICAgICAgcmVzdWx0ID0gaGF2ZVRoZVNhbWVBbGlnbm1lbnQgPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZXMgZG9uYHQgaGF2ZSB0aGUgc2FtZSBob3Jpem9udGFsIHBvc2l0aW9uJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvQmVWZXJ0aWNhbGx5QWxpZ25XaXRoID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgYWN0dWFsQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYWN0dWFsKSxcclxuICAgICAgICAgIGV4cGVjdGVkQkJveCA9IGdlb21ldHJ5LmdldEJCb3goZXhwZWN0ZWQpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVBbGlnbm1lbnQgPSBhY3R1YWxCQm94LnggPT09IGV4cGVjdGVkQkJveC54LFxyXG4gICAgICAgICAgcmVzdWx0ID0gaGF2ZVRoZVNhbWVBbGlnbm1lbnQgPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZXMgZG9uYHQgaGF2ZSB0aGUgc2FtZSB2ZXJ0aWNhbCBwb3NpdGlvbid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuXHJcbiAgdGhpcy50b0JlUGFydE9mID0gdG9CZVBhcnRPZjtcclxuICB0aGlzLnRvQmVJbnNpZGVUaGVBcmVhT2YgPSB0b0JlSW5zaWRlVGhlQXJlYU9mO1xyXG4gIHRoaXMudG9IYXZlVGhlU2FtZVBvc2l0aW9uV2l0aCA9IHRvSGF2ZVRoZVNhbWVQb3NpdGlvbldpdGg7XHJcbiAgdGhpcy50b0hhdmVUaGVTYW1lU2l6ZVdpdGggPSB0b0hhdmVUaGVTYW1lU2l6ZVdpdGg7XHJcbiAgdGhpcy50b0JlSG9yaXpvbnRhbGx5QWxpZ25XaXRoID0gdG9CZUhvcml6b250YWxseUFsaWduV2l0aDtcclxuICB0aGlzLnRvQmVWZXJ0aWNhbGx5QWxpZ25XaXRoID0gdG9CZVZlcnRpY2FsbHlBbGlnbldpdGg7XHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEdlb21ldHJ5KCkge1xyXG5cclxuICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgIEVQU0lMT04gPSBOdW1iZXIuRVBTSUxPTiB8fCAyLjIyMDQ0NjA0OTI1MDMxM2UtMTYsXHJcbiAgICAgIFBJID0gTWF0aC5QSSxcclxuICAgICAgc2luID0gTWF0aC5zaW4sXHJcbiAgICAgIGNvcyA9IE1hdGguY29zO1xyXG5cclxuXHJcbiAgdmFyIGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSA9ICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGJveDoge3g6IE5hTiwgeTogTmFOLCB3aWR0aDogTmFOLCBoZWlnaHQ6IE5hTn0sXHJcbiAgICAgIHRyYW5zZm9ybXM6IFtbXV0sXHJcbiAgICAgIHNoYXBlc0luUGF0aDogW10sXHJcbiAgICAgIG1vdmVUb0xvY2F0aW9uOiB7eDogTmFOLCB5OiBOYU59LFxyXG4gICAgICBsaW5lV2lkdGhzOiBbMV1cclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgcGF0aEZpbGxTaGFwZUhhbmRsZXJzID0ge1xyXG4gICAgcmVjdDogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeCA9IHNoYXBlLngsXHJcbiAgICAgICAgeSA9IHNoYXBlLnksXHJcbiAgICAgICAgd2lkdGggPSBzaGFwZS53aWR0aCxcclxuICAgICAgICBoZWlnaHQgPSBzaGFwZS5oZWlnaHQsXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmM6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIGN4ID0gc2hhcGUuY3gsXHJcbiAgICAgICAgY3kgPSBzaGFwZS5jeSxcclxuICAgICAgICByeCA9IHNoYXBlLnJ4LFxyXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IGN4IC0gcngsIHk6IGN5IC0gcnksIHdpZHRoOiAyICogcngsIGhlaWdodDogMiAqIHJ5fTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcGF0aFN0cm9rZVNoYXBlSGFuZGxlcnMgPSB7XHJcbiAgICByZWN0OiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gc2hhcGUueCxcclxuICAgICAgICB5ID0gc2hhcGUueSxcclxuICAgICAgICB3aWR0aCA9IHNoYXBlLndpZHRoLFxyXG4gICAgICAgIGhlaWdodCA9IHNoYXBlLmhlaWdodCxcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIHhTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICB5U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHggLSB4U2NhbGVkTGluZVdpZHRoICAvIDIsIHk6IHkgLSB5U2NhbGVkTGluZVdpZHRoIC8gMiwgd2lkdGg6IHdpZHRoICsgeFNjYWxlZExpbmVXaWR0aCwgaGVpZ2h0OiBoZWlnaHQgKyB5U2NhbGVkTGluZVdpZHRofTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IHNoYXBlLmN4LFxyXG4gICAgICAgIGN5ID0gc2hhcGUuY3ksXHJcbiAgICAgICAgcnggPSBzaGFwZS5yeCxcclxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxyXG4gICAgICAgIHNBbmdsZSA9IHNoYXBlLnNBbmdsZSxcclxuICAgICAgICBlQW5nbGUgPSBzaGFwZS5lQW5nbGUsXHJcbiAgICAgICAgY291bnRlcmNsb2Nrd2lzZSA9IHNoYXBlLmNvdW50ZXJjbG9ja3dpc2UsXHJcbiAgICAgICAgLy9zY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIC8veFNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIC8veVNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIC8vbmV3Qm94ID0ge3g6IGN4IC0gcnggLSB4U2NhbGVkTGluZVdpZHRoIC8gMiwgeTogY3kgLSByeSAtIHlTY2FsZWRMaW5lV2lkdGggLyAyLCB3aWR0aDogMiAqIHJ4ICsgeFNjYWxlZExpbmVXaWR0aCwgaGVpZ2h0OiAyICogcnkgKyB5U2NhbGVkTGluZVdpZHRofSxcclxuICAgICAgICBhcmNQb2ludHMgPSByZWxldmFudEFyY1BvaW50cyhjeCwgY3ksIHJ4LCBzQW5nbGUsIGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZSksXHJcbiAgICAgICAgbmV3Qm94ID0gYm94UG9pbnRzKGFyY1BvaW50cyk7XHJcbiAgICAgIGlmICghaXNOYU4oY3gpICYmICFpc05hTihjeSkgJiYgYXJjUG9pbnRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGxpbmVUbzogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBzaGFwZS54MSxcclxuICAgICAgICB5MSA9IHNoYXBlLnkxLFxyXG4gICAgICAgIHgyID0gc2hhcGUueDIsXHJcbiAgICAgICAgeTIgPSBzaGFwZS55MixcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBnZXRTY2FsZWRXaWR0aE9mTGluZSh4MSwgeTEsIHgyLCB5Miwgc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LCBzdGF0ZS5saW5lV2lkdGgpLFxyXG4gICAgICAgIHJlY3QgPSBnZXRSZWN0QXJvdW5kTGluZSh4MSwgeTEsIHgyLCB5Miwgc2NhbGVkTGluZVdpZHRoICE9PSAxID8gc2NhbGVkTGluZVdpZHRoIDogMCksXHJcbiAgICAgICAgbmV3Qm94ID0ge1xyXG4gICAgICAgICAgeDogTWF0aC5taW4ocmVjdC54MSwgcmVjdC54MiwgcmVjdC54MywgcmVjdC54NCksXHJcbiAgICAgICAgICB5OiBNYXRoLm1pbihyZWN0LnkxLCByZWN0LnkyLCByZWN0LnkzLCByZWN0Lnk0KSxcclxuICAgICAgICAgIHdpZHRoOiBNYXRoLm1heChyZWN0LngxLCByZWN0LngyLCByZWN0LngzLCByZWN0Lng0KSAtIE1hdGgubWluKHJlY3QueDEsIHJlY3QueDIsIHJlY3QueDMsIHJlY3QueDQpLFxyXG4gICAgICAgICAgaGVpZ2h0OiBNYXRoLm1heChyZWN0LnkxLCByZWN0LnkyLCByZWN0LnkzLCByZWN0Lnk0KSAtIE1hdGgubWluKHJlY3QueTEsIHJlY3QueTIsIHJlY3QueTMsIHJlY3QueTQpXHJcbiAgICAgICAgfTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY2FudmFzQ2FsbEhhbmRsZXJzID0ge1xyXG4gICAgbGluZVdpZHRoOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUubGluZVdpZHRoc1tzdGF0ZS5saW5lV2lkdGhzLmxlbmd0aCAtIDFdID0gY2FsbC52YWw7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBmaWxsUmVjdDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICB3aWR0aCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgaGVpZ2h0ID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBuZXdCb3ggPSB7eDogeCwgeTogeSwgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHN0cm9rZVJlY3Q6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgd2lkdGggPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIGhlaWdodCA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgc2NhbGVkTGluZVdpZHRoID0gc3RhdGUubGluZVdpZHRoICE9PSAxID8gc3RhdGUubGluZVdpZHRoIDogMCxcclxuICAgICAgICB4U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgeVNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4IC0geFNjYWxlZExpbmVXaWR0aCAvIDIsIHk6IHkgLSB5U2NhbGVkTGluZVdpZHRoIC8gMiwgd2lkdGg6IHdpZHRoICsgeFNjYWxlZExpbmVXaWR0aCwgaGVpZ2h0OiBoZWlnaHQgKyB5U2NhbGVkTGluZVdpZHRofTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgcmVjdDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICB3aWR0aCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgaGVpZ2h0ID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueTtcclxuICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdyZWN0JywgeDogeCwgeTogeSwgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIGN4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICBjeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgciA9IGNhbGwuYXJndW1lbnRzWzJdLFxyXG4gICAgICAgIHJ4ID0gciAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIHJ5ID0gciAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIHNBbmdsZSA9IGNhbGwuYXJndW1lbnRzWzNdLFxyXG4gICAgICAgIGVBbmdsZSA9IGNhbGwuYXJndW1lbnRzWzRdLFxyXG4gICAgICAgIGNvdW50ZXJjbG9ja3dpc2UgPSBjYWxsLmFyZ3VtZW50c1s1XSB8fCBmYWxzZTtcclxuICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdhcmMnLCBjeDogY3gsIGN5OiBjeSwgcng6IHJ4LCByeTogcnksIHNBbmdsZTogc0FuZ2xlLCBlQW5nbGU6IGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZTogY291bnRlcmNsb2Nrd2lzZX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgbW92ZVRvOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHgxID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5MSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnk7XHJcbiAgICAgIHN0YXRlLm1vdmVUb0xvY2F0aW9uID0ge3g6IHgxLCB5OiB5MX07XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBsaW5lVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi54LFxyXG4gICAgICAgIHkxID0gc3RhdGUubW92ZVRvTG9jYXRpb24ueSxcclxuICAgICAgICB4MiA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeTIgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55O1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2xpbmVUbycsIHgxOiB4MSwgeTE6IHkxLCB4MjogeDIsIHkyOiB5Mn0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDAgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi54LFxyXG4gICAgICAgICAgeTAgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi55LFxyXG4gICAgICAgICAgeDEgPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgICAgeTEgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgICAgeDIgPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgICAgeTIgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgICAgciA9IGNhbGwuYXJndW1lbnRzWzRdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgICBkZWNvbXBvc2l0aW9uID0gZGVjb21wb3NlQXJjVG8oeDAsIHkwLCB4MSwgeTEsIHgyLCB5Miwgcik7XHJcbiAgICAgIGlmIChkZWNvbXBvc2l0aW9uLmxpbmUpIHtcclxuICAgICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2xpbmVUbycsIHgxOiBkZWNvbXBvc2l0aW9uLmxpbmUueDEsIHkxOiBkZWNvbXBvc2l0aW9uLmxpbmUueTEsIHgyOiBkZWNvbXBvc2l0aW9uLmxpbmUueDIsIHkyOiBkZWNvbXBvc2l0aW9uLmxpbmUueTJ9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZGVjb21wb3NpdGlvbi5hcmMpIHtcclxuICAgICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2FyYycsIGN4OiBkZWNvbXBvc2l0aW9uLmFyYy54LCBjeTogZGVjb21wb3NpdGlvbi5hcmMueSwgcng6IHIsIHJ5OiByLCBzQW5nbGU6IGRlY29tcG9zaXRpb24uYXJjLnNBbmdsZSwgZUFuZ2xlOiBkZWNvbXBvc2l0aW9uLmFyYy5lQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2U6IGRlY29tcG9zaXRpb24uYXJjLmNvdW50ZXJjbG9ja3dpc2V9KTtcclxuICAgICAgfVxyXG4gICAgICBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbiA9IHt4OiBkZWNvbXBvc2l0aW9uLnBvaW50LngsIHk6IGRlY29tcG9zaXRpb24ucG9pbnQueX07XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBzYXZlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUudHJhbnNmb3Jtcy5wdXNoKFtdKTtcclxuICAgICAgc3RhdGUubGluZVdpZHRocy5wdXNoKGxhc3RFbGVtZW50KHN0YXRlLmxpbmVXaWR0aHMpKTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHJlc3RvcmU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS50cmFuc2Zvcm1zLnBvcCgpO1xyXG4gICAgICBzdGF0ZS5saW5lV2lkdGhzLnBvcCgpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgdHJhbnNsYXRlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgbGFzdEVsZW1lbnQoc3RhdGUudHJhbnNmb3JtcylcclxuICAgICAgICAucHVzaCh7dHJhbnNsYXRlOiB7eDogY2FsbC5hcmd1bWVudHNbMF0sIHk6IGNhbGwuYXJndW1lbnRzWzFdfX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc2NhbGU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBsYXN0RWxlbWVudChzdGF0ZS50cmFuc2Zvcm1zKVxyXG4gICAgICAgIC5wdXNoKHtzY2FsZToge3g6IGNhbGwuYXJndW1lbnRzWzBdLCB5OiBjYWxsLmFyZ3VtZW50c1sxXX19KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGJlZ2luUGF0aDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aCA9IFtdO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgZmlsbDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHJldHVybiBzdGF0ZS5zaGFwZXNJblBhdGgucmVkdWNlKChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgICB2YXIgaGFuZGxlciA9IGdldFBhdGhGaWxsU2hhcGVIYW5kbGVyKHNoYXBlKTtcclxuICAgICAgICByZXR1cm4gaGFuZGxlcihzdGF0ZSwgc2hhcGUpO1xyXG4gICAgICB9LCBzdGF0ZSk7XHJcbiAgICB9LFxyXG4gICAgc3Ryb2tlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHN0YXRlLnNoYXBlc0luUGF0aC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBzaGFwZSA9IHN0YXRlLnNoYXBlc0luUGF0aFtpXSxcclxuICAgICAgICAgICAgaGFuZGxlciA9IGdldFBhdGhTdHJva2VTaGFwZUhhbmRsZXIoc2hhcGUpO1xyXG4gICAgICAgIHN0YXRlID0gaGFuZGxlcihzdGF0ZSwgc2hhcGUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBudWxsQ2FudmFzQ2FsbEhhbmRsZXIgPSAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9LFxyXG5cclxuICBnZXRDYW52YXNDYWxsSGFuZGxlciA9IChjYWxsKSA9PiB7XHJcbiAgICByZXR1cm4gY2FudmFzQ2FsbEhhbmRsZXJzW2NhbGwubWV0aG9kXSB8fCBjYW52YXNDYWxsSGFuZGxlcnNbY2FsbC5hdHRyXSB8fCBudWxsQ2FudmFzQ2FsbEhhbmRsZXI7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aEZpbGxTaGFwZUhhbmRsZXIgPSAoc2hhcGUpID0+IHtcclxuICAgIHJldHVybiBwYXRoRmlsbFNoYXBlSGFuZGxlcnNbc2hhcGUudHlwZV07XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aFN0cm9rZVNoYXBlSGFuZGxlciA9IChzaGFwZSkgPT4ge1xyXG4gICAgcmV0dXJuIHBhdGhTdHJva2VTaGFwZUhhbmRsZXJzW3NoYXBlLnR5cGVdO1xyXG4gIH0sXHJcblxyXG4gIHByZUNhbnZhc0NhbGxIYW5kbGVyID0gKHN0YXRlKSA9PiB7XHJcbiAgICBzdGF0ZS50cmFuc2Zvcm0gPSB0b3RhbFRyYW5zZm9ybShmbGF0dGVuKHN0YXRlLnRyYW5zZm9ybXMpKTtcclxuICAgIHN0YXRlLmxpbmVXaWR0aCA9IGxhc3RFbGVtZW50KHN0YXRlLmxpbmVXaWR0aHMpO1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH0sXHJcblxyXG4gIGdldEJCb3ggPSAoc2hhcGUpID0+IHtcclxuICAgIHZhciBzdGF0ZSA9IGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSgpO1xyXG4gICAgc3RhdGUgPSBzaGFwZS5yZWR1Y2UoKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciBoYW5kbGVyID0gZ2V0Q2FudmFzQ2FsbEhhbmRsZXIoY2FsbCk7XHJcbiAgICAgIHJldHVybiBoYW5kbGVyKHByZUNhbnZhc0NhbGxIYW5kbGVyKHN0YXRlKSwgY2FsbCk7XHJcbiAgICB9LCBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUoKSk7XHJcbiAgICByZXR1cm4gc3RhdGUuYm94O1xyXG4gIH0sXHJcblxyXG4gIGZsYXR0ZW4gPSAoYXJyYXkpID0+IHtcclxuICAgIHJldHVybiBhcnJheVxyXG4gICAgICAucmVkdWNlKChwcmV2aW91c0FycmF5LCBjdXJyZW50QXJyYXkpID0+IHtcclxuICAgICAgICByZXR1cm4gcHJldmlvdXNBcnJheS5jb25jYXQoY3VycmVudEFycmF5KTtcclxuICAgICAgfSwgW10pO1xyXG4gIH0sXHJcblxyXG4gIGxhc3RFbGVtZW50ID0gKGFycmF5KSA9PiB7XHJcbiAgICByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XHJcbiAgfSxcclxuXHJcbiAgZmlyc3RUcnV0aHlPclplcm8gPSAodmFsMSwgdmFsMikgPT57XHJcbiAgICBpZiAodmFsMSB8fCB2YWwxID09PSAwKSB7XHJcbiAgICAgIHJldHVybiB2YWwxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbDI7XHJcbiAgfSxcclxuXHJcbiAgdW5pb24gPSAoYm94MSwgYm94MikgPT4ge1xyXG4gICAgYm94MSA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gxLndpZHRoLCBib3gyLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLmhlaWdodCwgYm94Mi5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgYm94MiA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94Mi54LCBib3gxLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLnksIGJveDEueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gyLndpZHRoLCBib3gxLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLmhlaWdodCwgYm94MS5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgeDogTWF0aC5taW4oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBNYXRoLm1pbihib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBNYXRoLm1heChib3gxLndpZHRoLCBib3gyLndpZHRoLCBib3gxLnggPCBib3gyLnhcclxuICAgICAgICA/IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDIueCAtIChib3gxLnggKyBib3gxLndpZHRoKSlcclxuICAgICAgICA6IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDEueCAtIChib3gyLnggKyBib3gyLndpZHRoKSkpLFxyXG4gICAgICBoZWlnaHQ6IE1hdGgubWF4KGJveDEuaGVpZ2h0LCBib3gyLmhlaWdodCwgYm94MS55IDwgYm94Mi55XHJcbiAgICAgICAgPyBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDIueSAtIChib3gxLnkgKyBib3gxLmhlaWdodCkpXHJcbiAgICAgICAgOiBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDEueSAtIChib3gyLnkgKyBib3gyLmhlaWdodCkpKVxyXG4gICAgfTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSxcclxuXHJcbiAgYm94UG9pbnRzID0gKHBvaW50cykgPT4ge1xyXG4gICAgdmFyIHhlcyA9IHBvaW50cy5tYXAoKHApID0+IHAueCksXHJcbiAgICAgICAgeWVzID0gcG9pbnRzLm1hcCgocCkgPT4gcC55KSxcclxuICAgICAgICBtaW5YID0gTWF0aC5taW4uYXBwbHkobnVsbCwgeGVzKSxcclxuICAgICAgICBtYXhYID0gTWF0aC5tYXguYXBwbHkobnVsbCwgeGVzKSxcclxuICAgICAgICBtaW5ZID0gTWF0aC5taW4uYXBwbHkobnVsbCwgeWVzKSxcclxuICAgICAgICBtYXhZID0gTWF0aC5tYXguYXBwbHkobnVsbCwgeWVzKSxcclxuICAgICAgICBib3ggPSB7eDogTmFOLCB5OiBOYU4sIHdpZHRoOiBOYU4sIGhlaWdodDogTmFOfTtcclxuICAgIGlmIChtaW5YICE9PSArSW5maW5pdHkgJiYgbWF4WCAhPT0gLUluZmluaXR5ICYmIG1pblkgIT09ICtJbmZpbml0eSAmJiBtYXhZICE9PSAtSW5maW5pdHkpIHtcclxuICAgICAgYm94ID0ge1xyXG4gICAgICAgIHg6IG1pblgsXHJcbiAgICAgICAgeTogbWluWSxcclxuICAgICAgICB3aWR0aDogbWF4WCAtIG1pblgsXHJcbiAgICAgICAgaGVpZ2h0OiBtYXhZIC0gbWluWVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJveDtcclxuICB9LFxyXG5cclxuICB0b3RhbFRyYW5zZm9ybSA9ICh0cmFuc2Zvcm1zKSA9PiB7XHJcbiAgICByZXR1cm4gdHJhbnNmb3Jtc1xyXG4gICAgICAubWFwKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0cmFuc2xhdGU6IHZhbHVlLnRyYW5zbGF0ZSB8fCB7eDogMCwgeTogMH0sXHJcbiAgICAgICAgICBzY2FsZTogdmFsdWUuc2NhbGUgfHwge3g6IDEsIHk6IDF9XHJcbiAgICAgICAgfTtcclxuICAgICAgfSlcclxuICAgICAgLnJlZHVjZSgocHJldmlvdXNWYWx1ZSwgY3VycmVudFZhbHVlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRyYW5zbGF0ZToge1xyXG4gICAgICAgICAgICB4OiBwcmV2aW91c1ZhbHVlLnRyYW5zbGF0ZS54ICsgY3VycmVudFZhbHVlLnRyYW5zbGF0ZS54ICogcHJldmlvdXNWYWx1ZS5zY2FsZS54LFxyXG4gICAgICAgICAgICB5OiBwcmV2aW91c1ZhbHVlLnRyYW5zbGF0ZS55ICsgY3VycmVudFZhbHVlLnRyYW5zbGF0ZS55ICogcHJldmlvdXNWYWx1ZS5zY2FsZS55XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc2NhbGU6IHtcclxuICAgICAgICAgICAgeDogcHJldmlvdXNWYWx1ZS5zY2FsZS54ICogY3VycmVudFZhbHVlLnNjYWxlLngsXHJcbiAgICAgICAgICAgIHk6IHByZXZpb3VzVmFsdWUuc2NhbGUueSAqIGN1cnJlbnRWYWx1ZS5zY2FsZS55XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfSwge3RyYW5zbGF0ZToge3g6IDAsIHk6IDB9LCBzY2FsZToge3g6IDEsIHk6IDF9fSk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UmVjdEFyb3VuZExpbmUgPSAoeDEsIHkxLCB4MiwgeTIsIHdpZHRoKSA9PiB7XHJcbiAgICB2YXIgcmVjdDtcclxuICAgIGlmICh4MSA9PT0geTEgJiYgeDEgPT09IHgyICYmIHgxID09PSB5Mikge1xyXG4gICAgICByZWN0ID0ge1xyXG4gICAgICAgIHgxOiB4MSwgeTE6IHgxLCAgeDI6IHgxLCB5MjogeDEsXHJcbiAgICAgICAgeDQ6IHgxLCB5NDogeDEsICB4MzogeDEsIHkzOiB4MVxyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVjdCA9IGdldFJlY3RBcm91bmRMb25nTGluZSh4MSwgeTEsIHgyLCB5Miwgd2lkdGgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlY3Q7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UmVjdEFyb3VuZExvbmdMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCB3aWR0aCkgPT4ge1xyXG4gICAgLy8gIHIgPSB0aGUgcmFkaXVzIG9yIHRoZSBnaXZlbiBkaXN0YW5jZSBmcm9tIGEgZ2l2ZW4gcG9pbnQgdG8gdGhlIG5lYXJlc3QgY29ybmVycyBvZiB0aGUgcmVjdFxyXG4gICAgLy8gIGEgPSB0aGUgYW5nbGUgYmV0d2VlbiB0aGUgbGluZSBhbmQgdGhlIGhvcml6b250YWwgYXhpc1xyXG4gICAgLy8gIGIxLCBiMiA9IHRoZSBhbmdsZSBiZXR3ZWVuIGhhbGYgdGhlIGhpZ2h0IG9mIHRoZSByZWN0YW5nbGUgYW5kIHRoZSBob3Jpem9udGFsIGF4aXNcclxuICAgIC8vXHJcbiAgICAvLyAgSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlIHRoZSBnaXZlbiBsaW5lIGlzIGhvcml6b250YWwsIHNvIGEgPSAwLlxyXG4gICAgLy8gIFRoZSBnaXZlbiBsaW5lIGlzIGJldHdlZW4gdGhlIHR3byBAIHN5bWJvbHMuXHJcbiAgICAvLyAgVGhlICsgc3ltYm9scyBhcmUgdGhlIGNvcm5lcnMgb2YgcmVjdGFuZ2xlIHRvIGJlIGRldGVybWluZWQuXHJcbiAgICAvLyAgSW4gb3JkZXIgdG8gZmluZCB0aGUgYjEgYW5kIGIyIGFuZ2xlcyB3ZSBoYXZlIHRvIGFkZCBQSS8yIGFuZCByZXNwZWN0aXZseSBzdWJ0cmFjdCBQSS8yLlxyXG4gICAgLy8gIGIxIGlzIHZlcnRpY2FsIGFuZCBwb2ludGluZyB1cHdvcmRzIGFuZCBiMiBpcyBhbHNvIHZlcnRpY2FsIGJ1dCBwb2ludGluZyBkb3dud29yZHMuXHJcbiAgICAvLyAgRWFjaCBjb3JuZXIgaXMgciBvciB3aWR0aCAvIDIgZmFyIGF3YXkgZnJvbSBpdHMgY29yZXNwb25kZW50IGxpbmUgZW5kaW5nLlxyXG4gICAgLy8gIFNvIHdlIGtub3cgdGhlIGRpc3RhbmNlIChyKSwgdGhlIHN0YXJ0aW5nIHBvaW50cyAoeDEsIHkxKSBhbmQgKHgyLCB5MikgYW5kIHRoZSAoYjEsIGIyKSBkaXJlY3Rpb25zLlxyXG4gICAgLy9cclxuICAgIC8vICAoeDEseTEpICAgICAgICAgICAgICAgICAgICAoeDIseTIpXHJcbiAgICAvLyAgICAgICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXHJcbiAgICAvLyAgICAgIF4gICAgICAgICAgICAgICAgICAgICAgICBeXHJcbiAgICAvLyAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgICAvLyAgICAgIHwgYjEgICAgICAgICAgICAgICAgICAgICB8IGIxXHJcbiAgICAvLyAgICAgIEA9PT09PT09PT09PT09PT09PT09PT09PT1AXHJcbiAgICAvLyAgICAgIHwgYjIgICAgICAgICAgICAgICAgICAgICB8IGIyXHJcbiAgICAvLyAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgICAvLyAgICAgIHYgICAgICAgICAgICAgICAgICAgICAgICB2XHJcbiAgICAvLyAgICAgICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXHJcbiAgICAvLyAgKHg0LHk0KSAgICAgICAgICAgICAgICAgICAgKHgzLHkzKVxyXG4gICAgLy9cclxuXHJcbiAgICB2YXIgciA9IHdpZHRoIC8gMixcclxuICAgICAgYSA9IE1hdGguYXRhbigoeTIgLSB5MSkgLyAoeDIgLSB4MSkpLFxyXG4gICAgICBiMSA9IGEgKyBNYXRoLlBJLzIsXHJcbiAgICAgIGIyID0gYSAtIE1hdGguUEkvMixcclxuICAgICAgcngxID0gciAqIE1hdGguY29zKGIxKSArIHgxLFxyXG4gICAgICByeTEgPSByICogTWF0aC5zaW4oYjEpICsgeTEsXHJcbiAgICAgIHJ4MiA9IHIgKiBNYXRoLmNvcyhiMSkgKyB4MixcclxuICAgICAgcnkyID0gciAqIE1hdGguc2luKGIxKSArIHkyLFxyXG4gICAgICByeDMgPSByICogTWF0aC5jb3MoYjIpICsgeDIsXHJcbiAgICAgIHJ5MyA9IHIgKiBNYXRoLnNpbihiMikgKyB5MixcclxuICAgICAgcng0ID0gciAqIE1hdGguY29zKGIyKSArIHgxLFxyXG4gICAgICByeTQgPSByICogTWF0aC5zaW4oYjIpICsgeTE7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4MTogcngxLCB5MTogcnkxLCAgeDI6IHJ4MiwgeTI6IHJ5MixcclxuICAgICAgeDQ6IHJ4NCwgeTQ6IHJ5NCwgIHgzOiByeDMsIHkzOiByeTNcclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgZ2V0U2NhbGVkV2lkdGhPZkxpbmUgPSAoeDEsIHkxLCB4MiwgeTIsIHN4LCBzeSwgd2lkdGgpID0+IHtcclxuICAgIC8vICBUaGUgb3JpZ2luYWwgcG9pbnRzIGFyZSBub3QgbW92ZWQuIE9ubHkgdGhlIHdpZHRoIHdpbGwgYmUgc2NhbGVkLlxyXG4gICAgLy8gIFRoZSB3aWR0aCBvZiBhbiBob3Jpem9udGFsIGxpbmUgd2lsbCBiZSBzY2FsZWQgd2l0aCB0aGUgc3kgcmF0aW8gb25seS5cclxuICAgIC8vICBUaGUgd2lkdGggb2YgYSB2ZXJ0aXZhbCBsaW5lIHdpbGwgYmUgc2NhbGVkIHdpdGggdGhlIHN4IHJhdGlvIG9ubHkuXHJcbiAgICAvLyAgVGhlIHdpZHRoIG9mIGFuIG9ibGlxdWUgbGluZSB3aWxsIGJlIHNjYWxlZCB3aXRoIGJvdGggdGhlIHN4IGFuZCBzeVxyXG4gICAgLy9idXQgcHJvcG9ydGlvbmFsIHdpdGggdGhlIGFuZ2xlIGJldHdlZW4gdGhlIGxpbmUgYW5kIHRoZSB4IGFuZCB5IGF4ZXMuXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlxcXHJcbiAgICAvLyAgICAgICAgICAgICAgIC5cXCAgKHgyLHkyKSAgICAgICAgICAgICAgICAgICAgICAgICAuLi5cXCAgKHgyLHkyKVxyXG4gICAgLy8gICAgICAgICAgICAgIC4uLkAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLi4uQFxyXG4gICAgLy8gICAgICAgICAgICAgLi4uLy5cXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLi4uLy5cXFxyXG4gICAgLy8gICAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgICBzeCAgICAgICAgICAgICAuLi4uLi8uLi5cXFxyXG4gICAgLy8gICAgICAgICAgIC4uLi8uLi4gICAgICAgICAgICArLS0tPiAgICAgICAgICAgIC4uLi4uLy4uLi4uXHJcbiAgICAvLyAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAuLi4uLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAuLi4vLi4uICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgXFwuLi4vLi4uLi5cclxuICAgIC8vICAgICAgICAgXFwuLy4uLiAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgXFwuLy4uLi4uXHJcbiAgICAvLyAgICAgICAgICBALi4uICAgICAgICAgICAgIHN5IHYgICAgICAgICAgICAgICAgIEAuLi4uLlxyXG4gICAgLy8gICh4MSx5MSkgIFxcLiAgICAgICAgICAgICAgICAgICAgICAgICAgICh4MSx5MSkgIFxcLi4uXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFwuXHJcbiAgICAvL1xyXG4gICAgdmFyIGEgPSBNYXRoLmF0YW4oKHkyIC0geTEpIC8gKHgyIC0geDEpKSxcclxuICAgICAgc2luYSA9IE1hdGguc2luKGEpLCBjb3NhID0gTWF0aC5jb3MoYSksXHJcbiAgICAgIHNjYWxlZFdpZHRoID0gd2lkdGggKiBNYXRoLnNxcnQoc3gqc3ggKiBzaW5hKnNpbmEgKyBzeSpzeSAqIGNvc2EqY29zYSk7XHJcbiAgICByZXR1cm4gc2NhbGVkV2lkdGg7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCA9ICh4MSwgeTEsIHgyLCB5MiwgZGlzdGFuY2UpID0+IHtcclxuICAgIHZhciByZWN0ID0gZ2V0UmVjdEFyb3VuZExvbmdMaW5lKHgxLCB5MSwgeDIsIHkyLCAyICogZGlzdGFuY2UpO1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAge3gxOiByZWN0LngxLCB5MTogcmVjdC55MSwgeDI6IHJlY3QueDIsIHkyOiByZWN0LnkyfSxcclxuICAgICAge3gxOiByZWN0Lng0LCB5MTogcmVjdC55NCwgeDI6IHJlY3QueDMsIHkyOiByZWN0LnkzfVxyXG4gICAgXTtcclxuICB9LFxyXG5cclxuICBnZXRJbnRlcnNlY3Rpb25PZlR3b0xpbmVzID0gKGwxLCBsMikgPT4ge1xyXG4gICAgdmFyIGExID0gbDEueTIgLSBsMS55MSwgYjEgPSBsMS54MSAtIGwxLngyLCBjMSA9IGwxLngyKmwxLnkxIC0gbDEueDEqbDEueTIsXHJcbiAgICAgICAgYTIgPSBsMi55MiAtIGwyLnkxLCBiMiA9IGwyLngxIC0gbDIueDIsIGMyID0gbDIueDIqbDIueTEgLSBsMi54MSpsMi55MixcclxuICAgICAgICB4ID0gKGMyKmIxIC0gYzEqYjIpIC8gKGExKmIyIC0gYTIqYjEpLFxyXG4gICAgICAgIHkgPSBsMi55MSA9PT0gbDIueTIgPyBsMi55MSA6ICgtYzEgLSBhMSp4KSAvIGIxO1xyXG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5fTtcclxuICB9LFxyXG5cclxuICBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoKHgyLXgxKSooeDIteDEpICsgKHkyLXkxKSooeTIteTEpKTtcclxuICB9LFxyXG5cclxuICBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyA9ICh4MSwgeTEsIHgyLCB5MiwgeDMsIHkzKSA9PiB7XHJcbiAgICB2YXIgYSA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MSwgeTEsIHgyLCB5MiksXHJcbiAgICAgICAgYiA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MiwgeTIsIHgzLCB5MyksXHJcbiAgICAgICAgYyA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MywgeTMsIHgxLCB5MSksXHJcbiAgICAgICAgY29zQyA9IChhKmEgKyBiKmIgLSBjKmMpIC8gKDIqYSpiKSxcclxuICAgICAgICBDID0gTWF0aC5hY29zKGNvc0MpO1xyXG4gICAgcmV0dXJuIEM7XHJcbiAgfSxcclxuXHJcbiAgcGVybXV0ZUxpbmVzID0gKGFscGhhTGluZXMsIGJldGFMaW5lcykgPT4ge1xyXG4gICAgdmFyIHBlcm11dGF0aW9ucyA9IFtdO1xyXG4gICAgYWxwaGFMaW5lcy5mb3JFYWNoKChhbHBoYUxpbmUpID0+IHtcclxuICAgICAgYmV0YUxpbmVzLmZvckVhY2goKGJldGFMaW5lKSA9PiB7XHJcbiAgICAgICAgcGVybXV0YXRpb25zLnB1c2goe2FscGhhOiBhbHBoYUxpbmUsIGJldGE6IGJldGFMaW5lfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIHJldHVybiBwZXJtdXRhdGlvbnM7XHJcbiAgfSxcclxuXHJcbiAgYWxtb3N0RXF1YWwgPSAoYSwgYikgPT4ge1xyXG4gICAgLy8gZ3Jvc3MgYXBwcm94aW1hdGlvbiB0byBjb3ZlciB0aGUgZmxvdCBhbmQgdHJpZ29ub21ldHJpYyBwcmVjaXNpb25cclxuICAgIHJldHVybiBhID09PSBiIHx8IE1hdGguYWJzKGEgLSBiKSA8IDIwICogRVBTSUxPTjtcclxuICB9LFxyXG5cclxuICBpc0NlbnRlckluQmV0d2VlbiA9IChjeCwgY3ksIHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpID0+IHtcclxuICAgIHZhciBhMSA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzKGN4LCBjeSwgeDEsIHkxLCB4MCwgeTApLFxyXG4gICAgICAgIGEyID0gZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoY3gsIGN5LCB4MSwgeTEsIHgyLCB5Mik7XHJcbiAgICByZXR1cm4gYWxtb3N0RXF1YWwoYTEsIGEyKSAmJiBhMSA8PSBNYXRoLlBJIC8gMjtcclxuICB9LFxyXG5cclxuICBnZXRUaGVDZW50ZXJPZlRoZUNvcm5lciA9ICh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCBkaXN0YW5jZSkgPT4ge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZCAgZFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvLyAgIGFscGhhIGxpbmUgMCAgICAtLS0tLS0tLS0tLS0tJy0tLy0tJy0tLS0tLS0tLVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJyAgICAgICAgICAgICBkXHJcbiAgICAvLyAgICAgZ2l2ZW4gbGluZSAgICA9PT1QPT09PT09PT09PVA9PT09PT09PT09PT09PVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICcgICAgICAgICAgICAgICBkXHJcbiAgICAvLyAgIGFscGhhIGxpbmUgMSAgICAtLS0tLS0tLS1DLS0vLS0nLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgJyAgUCAgJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIGJldGEgbGluZXMgMCAmIDEgd2l0aCBvbmUgb2YgdGhlIGdpdmVuIGxpbmUgaW5iZXR3ZWVuXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vICBQID0gdGhlIGdpdmVuIFAwLCBQMSwgUDIgcG9pbnRzXHJcbiAgICAvL1xyXG4gICAgLy8gIGQgPSB0aGUgZ2l2ZW4gZGlzdGFuY2UgLyByYWRpdXMgb2YgdGhlIGNpcmNsZVxyXG4gICAgLy9cclxuICAgIC8vICBDID0gdGhlIGNlbnRlciBvZiB0aGUgY2lyY2xlL2Nvcm5lciB0byBiZSBkZXRlcm1pbmVkXHJcblxyXG4gICAgdmFyIGFscGhhTGluZXMgPSBnZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50KHgwLCB5MCwgeDEsIHkxLCBkaXN0YW5jZSksXHJcbiAgICAgICAgYmV0YUxpbmVzID0gZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCh4MSwgeTEsIHgyLCB5MiwgZGlzdGFuY2UpLFxyXG4gICAgICAgIHBlcm11dGF0aW9ucyA9IHBlcm11dGVMaW5lcyhhbHBoYUxpbmVzLCBiZXRhTGluZXMpLFxyXG4gICAgICAgIGludGVyc2VjdGlvbnMgPSBwZXJtdXRhdGlvbnMubWFwKChwKSA9PiBnZXRJbnRlcnNlY3Rpb25PZlR3b0xpbmVzKHAuYWxwaGEsIHAuYmV0YSkpLFxyXG4gICAgICAgIGNlbnRlciA9IGludGVyc2VjdGlvbnMuZmlsdGVyKChpKSA9PiBpc0NlbnRlckluQmV0d2VlbihpLngsIGkueSwgeDAsIHkwLCB4MSwgeTEsIHgyLCB5MikpWzBdO1xyXG5cclxuICAgIHJldHVybiBjZW50ZXIgfHwge3g6IE5hTiwgeTogTmFOfTtcclxuICB9LFxyXG5cclxuICBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyID0gKHgxLCB5MSwgeDIsIHkyLCBjeCwgY3kpID0+IHtcclxuICAgIHZhciBtID0gKHkyIC0geTEpIC8gKHgyIC0geDEpLFxyXG4gICAgICAgIGNtID0gLTEgLyBtLFxyXG4gICAgICAgIEMgPSB5MSooeDIgLSB4MSkgLSB4MSooeTIgLSB5MSksXHJcbiAgICAgICAgeCA9IChDIC0gKHgyIC0geDEpKihjeSAtIGNtKmN4KSkgLyAoY20qKHgyIC0geDEpICsgeTEgLSB5MiksXHJcbiAgICAgICAgeSA9IGNtKih4IC0gY3gpICsgY3k7XHJcbiAgICByZXR1cm4gbSA9PT0gMCAvLyBob3Jpem9udGFsXHJcbiAgICAgID8ge3g6IGN4LCB5OiB5MX1cclxuICAgICAgOiAobSA9PT0gSW5maW5pdHkgLy8gdmVydGljYWxcclxuICAgICAgICA/IHt4OiB4MSwgeTogY3l9XHJcbiAgICAgICAgOiB7eDogeCwgeTogeX0pO1xyXG4gIH0sXHJcblxyXG4gIHh5VG9BcmNBbmdsZSA9IChjeCwgY3ksIHgsIHkpID0+IHtcclxuICAgIHZhciBob3Jpem9udGFsWCA9IGN4ICsgMSxcclxuICAgICAgICBob3Jpem9udGFsWSA9IGN5LFxyXG4gICAgICAgIGEgPSBNYXRoLmFicyhnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyh4LCB5LCBjeCwgY3ksIGhvcml6b250YWxYLCBob3Jpem9udGFsWSkpO1xyXG4gICAgaWYoeSA8IGN5KSB7XHJcbiAgICAgIC8vdGhpcmQgJiBmb3J0aCBxdWFkcmFudHNcclxuICAgICAgYSA9IE1hdGguUEkgKyBNYXRoLlBJIC0gYTtcclxuICAgIH1cclxuICAgIHJldHVybiBhO1xyXG4gIH0sXHJcblxyXG4gIGNvbGxpbmVhciA9ICh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSA9PiB7XHJcbiAgICB2YXIgbTEgPSAoeTEgLSB5MCkgLyAoeDEgLSB4MCksXHJcbiAgICAgICAgbTIgPSAoeTIgLSB5MSkgLyAoeDIgLSB4MSk7XHJcbiAgICByZXR1cm4gYWxtb3N0RXF1YWwobTEsIG0yKTtcclxuICB9LFxyXG5cclxuICBkZWNvbXBvc2VBcmNUbyA9ICh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCByKSA9PiB7XHJcbiAgICB2YXIgZGVjb21wb3NpdGlvbiA9IHtcclxuICAgICAgcG9pbnQ6IHt4OiB4MSwgeTogeTF9XHJcbiAgICB9O1xyXG4gICAgaWYoY29sbGluZWFyKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpKSB7XHJcbiAgICAgIGRlY29tcG9zaXRpb24ubGluZSA9IHt4MTogeDAsIHkxOiB5MCwgeDI6IHgxLCB5MjogeTF9O1xyXG4gICAgfSBlbHNlIGlmICghaXNOYU4oeDApICYmICFpc05hTih5MCkpIHtcclxuICAgICAgdmFyIGNlbnRlciA9IGdldFRoZUNlbnRlck9mVGhlQ29ybmVyKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHIpLFxyXG4gICAgICAgICAgZm9vdDEgPSBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyKHgwLCB5MCwgeDEsIHkxLCBjZW50ZXIueCwgY2VudGVyLnkpLFxyXG4gICAgICAgICAgZm9vdDIgPSBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyKHgxLCB5MSwgeDIsIHkyLCBjZW50ZXIueCwgY2VudGVyLnkpLFxyXG4gICAgICAgICAgYW5nbGVGb290MSA9IHh5VG9BcmNBbmdsZShjZW50ZXIueCwgY2VudGVyLnksIGZvb3QxLngsIGZvb3QxLnkpLFxyXG4gICAgICAgICAgYW5nbGVGb290MiA9IHh5VG9BcmNBbmdsZShjZW50ZXIueCwgY2VudGVyLnksIGZvb3QyLngsIGZvb3QyLnkpLFxyXG4gICAgICAgICAgc0FuZ2xlID0gTWF0aC5hYnMoYW5nbGVGb290MiAtIGFuZ2xlRm9vdDEpIDwgTWF0aC5QSSA/IGFuZ2xlRm9vdDIgOiBhbmdsZUZvb3QxLFxyXG4gICAgICAgICAgZUFuZ2xlID0gTWF0aC5hYnMoYW5nbGVGb290MiAtIGFuZ2xlRm9vdDEpIDwgTWF0aC5QSSA/IGFuZ2xlRm9vdDEgOiBhbmdsZUZvb3QyO1xyXG4gICAgICBpZiAoc0FuZ2xlID4gZUFuZ2xlKSB7XHJcbiAgICAgICAgdmFyIHRlbXAgPSBzQW5nbGU7XHJcbiAgICAgICAgc0FuZ2xlID0gZUFuZ2xlO1xyXG4gICAgICAgIGVBbmdsZSA9IHRlbXAgKyAyKlBJO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghaXNOYU4oY2VudGVyLngpICYmICFpc05hTihjZW50ZXIueSkpIHtcclxuICAgICAgICBkZWNvbXBvc2l0aW9uLmxpbmUgPSB7eDE6IHgwLCB5MTogeTAsIHgyOiBmb290MS54LCB5MjogZm9vdDEueX07XHJcbiAgICAgICAgZGVjb21wb3NpdGlvbi5hcmMgPSB7eDogY2VudGVyLngsIHk6IGNlbnRlci55LCByOiByLCBzQW5nbGU6IHNBbmdsZSwgZUFuZ2xlOiBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2U6IGZhbHNlfTtcclxuICAgICAgICBkZWNvbXBvc2l0aW9uLnBvaW50ID0ge3g6IGZvb3QyLngsIHk6IGZvb3QyLnl9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVjb21wb3NpdGlvbjtcclxuICB9LFxyXG5cclxuICByZWxldmFudEFyY1BvaW50cyA9IChjeCwgY3ksIHIsIHNBbmdsZSwgZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlKSA9PiB7XHJcbiAgICB2YXIgcG9pbnRzID0gW10sIHJlbGV2YW50UG9pbnRzID0gW107XHJcbiAgICAgIHBvaW50cy5wdXNoKHt4OiBjeCArIHIqY29zKHNBbmdsZSksIHk6IGN5ICsgcipzaW4oc0FuZ2xlKX0pO1xyXG4gICAgICBwb2ludHMucHVzaCh7eDogY3ggKyByKmNvcyhlQW5nbGUpLCB5OiBjeSArIHIqc2luKGVBbmdsZSl9KTtcclxuICAgICAgaWYgKGNvdW50ZXJjbG9ja3dpc2UpIHtcclxuICAgICAgICB2YXIgdGVtcCA9IHNBbmdsZTtcclxuICAgICAgICBzQW5nbGUgPSBlQW5nbGU7XHJcbiAgICAgICAgZUFuZ2xlID0gc0FuZ2xlICsgMipQSTtcclxuICAgICAgfVxyXG4gICAgICBbMSpQSS8yLCAyKlBJLzIsIDMqUEkvMiwgNCpQSS8yXS5mb3JFYWNoKChhKSA9PiB7XHJcbiAgICAgICAgaWYoZUFuZ2xlID4gYSAmJiBhID4gc0FuZ2xlKSB7XHJcbiAgICAgICAgICBwb2ludHMucHVzaCh7eDogY3ggKyByKmNvcyhhKSwgeTogY3kgKyByKnNpbihhKX0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgLy9yZW1vdmluZyB0aGUgZHVwbGljYXRlZCBwb2ludHNcclxuICAgIHJlbGV2YW50UG9pbnRzLnB1c2gocG9pbnRzLnBvcCgpKTtcclxuICAgIHdoaWxlKHBvaW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciBwb2ludCA9IHBvaW50cy5wb3AoKSxcclxuICAgICAgICAgIGZvdW5kID0gcmVsZXZhbnRQb2ludHMuZmluZCgocCkgPT4gYWxtb3N0RXF1YWwocG9pbnQueCwgcC54KSAmJiBhbG1vc3RFcXVhbChwb2ludC55LCBwLnkpKTtcclxuICAgICAgaWYgKCFmb3VuZCkge1xyXG4gICAgICAgIHJlbGV2YW50UG9pbnRzLnB1c2gocG9pbnQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlbGV2YW50UG9pbnRzO1xyXG4gIH0sXHJcblxyXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjc1MjcyNS9maW5kaW5nLXdoZXRoZXItYS1wb2ludC1saWVzLWluc2lkZS1hLXJlY3RhbmdsZS1vci1ub3RcclxuICBpc1BvaW50SW5zaWRlUmVjdGFuZ2xlID0gKHBvaW50LCByZWN0YW5nbGUpID0+IHtcclxuICAgIHZhciBzZWdtZW50cyA9IFt7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSB9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHR9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodCxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0fSwge1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHQsXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55XHJcbiAgICB9XTtcclxuXHJcbiAgICB2YXIgaXNJbnNpZGUgPSBzZWdtZW50cy5tYXAoKHNlZ21lbnQpID0+IHtcclxuICAgICAgdmFyIEEgPSAtKHNlZ21lbnQueTIgLSBzZWdtZW50LnkxKSxcclxuICAgICAgICBCID0gc2VnbWVudC54MiAtIHNlZ21lbnQueDEsXHJcbiAgICAgICAgQyA9IC0oQSAqIHNlZ21lbnQueDEgKyBCICogc2VnbWVudC55MSksXHJcbiAgICAgICAgRCA9IEEgKiBwb2ludC54ICsgQiAqIHBvaW50LnkgKyBDO1xyXG4gICAgICAgIHJldHVybiBEO1xyXG4gICAgfSkuZXZlcnkoKEQpID0+IHtcclxuICAgICAgcmV0dXJuIEQgPiAwO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGlzSW5zaWRlO1xyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLmdldEJCb3ggPSBnZXRCQm94O1xyXG4gIHRoaXMudW5pb24gPSB1bmlvbjtcclxuICB0aGlzLnRvdGFsVHJhbnNmb3JtID0gdG90YWxUcmFuc2Zvcm07XHJcbiAgdGhpcy5nZXRSZWN0QXJvdW5kTGluZSA9IGdldFJlY3RBcm91bmRMaW5lO1xyXG4gIHRoaXMuZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCA9IGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQ7XHJcbiAgdGhpcy5nZXRJbnRlcnNlY3Rpb25PZlR3b0xpbmVzID0gZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcztcclxuICB0aGlzLmdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzID0gZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHM7XHJcbiAgdGhpcy5nZXRUaGVDZW50ZXJPZlRoZUNvcm5lciA9IGdldFRoZUNlbnRlck9mVGhlQ29ybmVyO1xyXG4gIHRoaXMuZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhciA9IGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXI7XHJcbiAgdGhpcy54eVRvQXJjQW5nbGUgPSB4eVRvQXJjQW5nbGU7XHJcbiAgdGhpcy5kZWNvbXBvc2VBcmNUbyA9IGRlY29tcG9zZUFyY1RvO1xyXG4gIHRoaXMuaXNQb2ludEluc2lkZVJlY3RhbmdsZSA9IGlzUG9pbnRJbnNpZGVSZWN0YW5nbGU7XHJcblxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJ5LmpzJ1xyXG5pbXBvcnQgeyBDdXN0b21NYXRjaGVycyB9IGZyb20gJy4vY3VzdG9tTWF0Y2hlcnMuanMnXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFJhYmJpdChnZW9tZXRyeSwgbWF0Y2hlcnMpIHtcclxuXHJcbiAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgZ2VvbWV0cnkgPSBnZW9tZXRyeSB8fCBuZXcgR2VvbWV0cnkoKSxcclxuICAgIG1hdGNoZXJzID0gbWF0Y2hlcnMgfHwgbmV3IEN1c3RvbU1hdGNoZXJzKCk7XHJcblxyXG5cclxuICB2YXIgZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzID0gKHNoYXBlLCB3aGVyZSkgPT4ge1xyXG4gICAgdmFyIGZvdW5kID0gW10sIGluZGV4ID0gMDtcclxuICAgIGRvIHtcclxuICAgICAgaW5kZXggPSB0aGF0LmZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzKHNoYXBlLCB3aGVyZSwgaW5kZXgpO1xyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgZm91bmQucHVzaCh3aGVyZS5zbGljZShpbmRleCwgaW5kZXggKyBzaGFwZS5sZW5ndGgpKTtcclxuICAgICAgICBpbmRleCArPSBzaGFwZS5sZW5ndGg7XHJcbiAgICAgIH1cclxuICAgIH0gd2hpbGUgKGluZGV4ICE9PSAtMSAmJiBpbmRleCA8IHdoZXJlLmxlbmd0aCk7XHJcbiAgICByZXR1cm4gZm91bmQ7XHJcbiAgfSxcclxuXHJcbiAgZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMgPSAoc2hhcGUsIHdoZXJlLCBzdGFydEluZGV4KSA9PiB7XHJcbiAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCB8fCAwO1xyXG4gICAgdmFyIG1hdGNoID0gZmFsc2UsIGluZGV4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gc3RhcnRJbmRleDsgaSA8PSB3aGVyZS5sZW5ndGggLSBzaGFwZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBtYXRjaCA9IHRydWU7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2hhcGUubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBpZiAod2hlcmVbaSArIGpdLm1ldGhvZCAhPT0gc2hhcGVbal0ubWV0aG9kKSB7XHJcbiAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChtYXRjaCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGluZGV4O1xyXG4gIH0sXHJcblxyXG4gIHJlbW92ZVNoYXBlcyA9IChzaGFwZXMsIGZyb20pID0+IHtcclxuICAgIHZhciBjb3B5ID0gZnJvbS5zbGljZSgwLCBmcm9tLmxlbmd0aCk7XHJcbiAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcclxuICAgICAgdmFyIGluZGV4ID0gLTE7XHJcbiAgICAgIGRvIHtcclxuICAgICAgICBpbmRleCA9IHRoYXQuZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMoc2hhcGUsIGNvcHkpO1xyXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgIGNvcHkuc3BsaWNlKGluZGV4LCBzaGFwZS5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSB3aGlsZSAoaW5kZXggIT09IC0xKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvcHk7XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMuZ2V0QkJveCA9IGdlb21ldHJ5LmdldEJCb3g7XHJcbiAgdGhpcy5jdXN0b21NYXRjaGVycyA9IG1hdGNoZXJzO1xyXG4gIHRoaXMuZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzID0gZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzO1xyXG4gIHRoaXMuZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMgPSBmaW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cztcclxuICB0aGlzLnJlbW92ZVNoYXBlcyA9IHJlbW92ZVNoYXBlcztcclxuXHJcbn1cclxuIl19
