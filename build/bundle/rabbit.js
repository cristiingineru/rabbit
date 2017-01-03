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
      EPSILON = Number.EPSILON || 2.220446049250313e-16;

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
      if (!isNaN(cx) && !isNaN(cy)) {
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
    arcTo: function arcTo(state, call) {
      var x0 = state.moveToLocation.x,
          y0 = state.moveToLocation.y,
          x1 = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
          y1 = call.arguments[1] * state.transform.scale.y + state.transform.translate.y,
          x2 = call.arguments[2] * state.transform.scale.x + state.transform.translate.x,
          y2 = call.arguments[3] * state.transform.scale.y + state.transform.translate.y,
          r = call.arguments[4] * state.transform.scale.x,
          decomposition = decomposeArcTo(x0, y0, x1, y1, x2, y2, r);
      state.shapesInPath.push({ type: 'lineTo', x1: decomposition.line.x1, y1: decomposition.line.y1, x2: decomposition.line.x2, y2: decomposition.line.y2 });
      state.shapesInPath.push({ type: 'arc', cx: decomposition.arc.x, cy: decomposition.arc.y, rx: r, ry: r });
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
    return a === b || Math.abs(a - b) < 5 * EPSILON;
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
      line: { x1: NaN, y1: NaN, x2: NaN, y2: NaN },
      arc: { x: NaN, y: NaN, r: NaN, sAngle: NaN, eAngle: NaN, counterclockwise: false },
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
      if (!isNaN(center.x) && !isNaN(center.y)) {
        decomposition = {
          line: { x1: x0, y1: y0, x2: foot1.x, y2: foot1.y },
          arc: { x: center.x, y: center.y, r: r, sAngle: sAngle, eAngle: eAngle, counterclockwise: false },
          point: { x: foot2.x, y: foot2.y }
        };
      }
    }
    return decomposition;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGN1c3RvbU1hdGNoZXJzLmpzIiwic3JjXFxnZW9tZXRyeS5qcyIsInNyY1xccmFiYml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7O1FBS2dCLGMsR0FBQSxjOztBQUhoQjs7QUFHTyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0M7O0FBRXZDLGFBQVcsWUFBWSx3QkFBdkI7O0FBR0EsTUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBTyxxQkFBUCxFQUFpQztBQUNoRCxXQUFPO0FBQ0wsZUFBUyxpQkFBQyxNQUFELEVBQVMsUUFBVCxFQUFzQjtBQUM3QixZQUFJLFFBQVEsS0FBWjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxTQUFTLE1BQVQsR0FBa0IsT0FBTyxNQUE3QyxFQUFxRCxHQUFyRCxFQUEwRDtBQUN4RCxrQkFBUSxPQUFPLE1BQVAsR0FBZ0IsQ0FBeEI7QUFDQSxlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksT0FBTyxNQUEzQixFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxnQkFBSSxTQUFTLElBQUksQ0FBYixFQUFnQixNQUFoQixLQUEyQixPQUFPLENBQVAsRUFBVSxNQUF6QyxFQUFpRDtBQUMvQyxzQkFBUSxLQUFSO0FBQ0E7QUFDRDtBQUNGO0FBQ0QsY0FBSSxVQUFVLElBQWQsRUFBb0I7QUFDbEI7QUFDRDtBQUNGO0FBQ0QsWUFBSSxTQUFTLFFBQVEsRUFBQyxNQUFNLElBQVAsRUFBUixHQUF1QixFQUFDLE1BQU0sS0FBUCxFQUFjLFNBQVMsbUJBQXZCLEVBQXBDO0FBQ0EsZUFBTyxNQUFQO0FBQ0Q7QUFqQkksS0FBUDtBQW1CRCxHQXBCRDtBQUFBLE1Bc0JBLHNCQUFzQixTQUF0QixtQkFBc0IsQ0FBQyxJQUFELEVBQU8scUJBQVAsRUFBaUM7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O0FBQ0YsT0FMRCxRQUtTLFVBQVUsQ0FBQyxDQUxwQjtBQU1ELEtBUkQ7QUFTQSxXQUFPLElBQVA7QUFDRCxHQTNDRDs7QUE4Q0EsT0FBSyxPQUFMLEdBQWUsU0FBUyxPQUF4QjtBQUNBLE9BQUssY0FBTCxHQUFzQixRQUF0QjtBQUNBLE9BQUssOEJBQUwsR0FBc0MsOEJBQXRDO0FBQ0EsT0FBSywwQkFBTCxHQUFrQywwQkFBbEM7QUFDQSxPQUFLLFlBQUwsR0FBb0IsWUFBcEI7QUFFRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyeS5qcydcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQ3VzdG9tTWF0Y2hlcnMoZ2VvbWV0cnkpIHtcclxuXHJcbiAgZ2VvbWV0cnkgPSBnZW9tZXRyeSB8fCBuZXcgR2VvbWV0cnkoKTtcclxuXHJcblxyXG4gIHZhciB0b0JlUGFydE9mID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aCAtIGFjdHVhbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgbWF0Y2ggPSBhY3R1YWwubGVuZ3RoID4gMDtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYWN0dWFsLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmIChleHBlY3RlZFtpICsgal0ubWV0aG9kICE9PSBhY3R1YWxbal0ubWV0aG9kKSB7XHJcbiAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKG1hdGNoID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVzdWx0ID0gbWF0Y2ggPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZSBub3QgcGFydCBvZid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlSW5zaWRlVGhlQXJlYU9mID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgc21hbGxTaGFwZSA9IGFjdHVhbCxcclxuICAgICAgICAgIGJpZ1NoYXBlID0gZXhwZWN0ZWQsXHJcbiAgICAgICAgICBiaWdTaGFwZUJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGJpZ1NoYXBlKSxcclxuICAgICAgICAgIHNtYWxsU2hhcGVCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChzbWFsbFNoYXBlKSxcclxuICAgICAgICAgIGNlbnRlciA9IHt4OiBzbWFsbFNoYXBlQkJveC54ICsgc21hbGxTaGFwZUJCb3gud2lkdGggLyAyLCB5OiBzbWFsbFNoYXBlQkJveC55ICsgc21hbGxTaGFwZUJCb3guaGVpZ2h0IC8gMn0sXHJcbiAgICAgICAgICBpc0NlbnRlckluc2lkZSA9IGdlb21ldHJ5LmlzUG9pbnRJbnNpZGVSZWN0YW5nbGUoY2VudGVyLCBiaWdTaGFwZUJCb3gpLFxyXG4gICAgICAgICAgcmVzdWx0ID0gaXNDZW50ZXJJbnNpZGUgPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZSBpcyBub3QgaW5zaWRlIHRoZSBhcmVhIG9mJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvSGF2ZVRoZVNhbWVQb3NpdGlvbldpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZVBvc2l0aW9uID0gYWN0dWFsQkJveC54ID09PSBleHBlY3RlZEJCb3gueCAmJiBhY3R1YWxCQm94LnkgPT09IGV4cGVjdGVkQkJveC55LFxyXG4gICAgICAgICAgcmVzdWx0ID0gaGF2ZVRoZVNhbWVQb3NpdGlvbiA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvSGF2ZVRoZVNhbWVTaXplV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lU2l6ZSA9IGFjdHVhbEJCb3gud2lkdGggPT09IGV4cGVjdGVkQkJveC53aWR0aCAmJiBhY3R1YWxCQm94LmhlaWdodCA9PT0gZXhwZWN0ZWRCQm94LmhlaWdodCxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lU2l6ZSA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIHNpemUnfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9CZUhvcml6b250YWxseUFsaWduV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lQWxpZ25tZW50ID0gYWN0dWFsQkJveC55ID09PSBleHBlY3RlZEJCb3gueSxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lQWxpZ25tZW50ID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgaG9yaXpvbnRhbCBwb3NpdGlvbid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlVmVydGljYWxseUFsaWduV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lQWxpZ25tZW50ID0gYWN0dWFsQkJveC54ID09PSBleHBlY3RlZEJCb3gueCxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lQWxpZ25tZW50ID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgdmVydGljYWwgcG9zaXRpb24nfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMudG9CZVBhcnRPZiA9IHRvQmVQYXJ0T2Y7XHJcbiAgdGhpcy50b0JlSW5zaWRlVGhlQXJlYU9mID0gdG9CZUluc2lkZVRoZUFyZWFPZjtcclxuICB0aGlzLnRvSGF2ZVRoZVNhbWVQb3NpdGlvbldpdGggPSB0b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoO1xyXG4gIHRoaXMudG9IYXZlVGhlU2FtZVNpemVXaXRoID0gdG9IYXZlVGhlU2FtZVNpemVXaXRoO1xyXG4gIHRoaXMudG9CZUhvcml6b250YWxseUFsaWduV2l0aCA9IHRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGg7XHJcbiAgdGhpcy50b0JlVmVydGljYWxseUFsaWduV2l0aCA9IHRvQmVWZXJ0aWNhbGx5QWxpZ25XaXRoO1xyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBHZW9tZXRyeSgpIHtcclxuXHJcbiAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICBFUFNJTE9OID0gTnVtYmVyLkVQU0lMT04gfHwgMi4yMjA0NDYwNDkyNTAzMTNlLTE2O1xyXG5cclxuXHJcbiAgdmFyIGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSA9ICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGJveDoge3g6IE5hTiwgeTogTmFOLCB3aWR0aDogTmFOLCBoZWlnaHQ6IE5hTn0sXHJcbiAgICAgIHRyYW5zZm9ybXM6IFtbXV0sXHJcbiAgICAgIHNoYXBlc0luUGF0aDogW10sXHJcbiAgICAgIG1vdmVUb0xvY2F0aW9uOiB7eDogTmFOLCB5OiBOYU59LFxyXG4gICAgICBsaW5lV2lkdGhzOiBbMV1cclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgcGF0aEZpbGxTaGFwZUhhbmRsZXJzID0ge1xyXG4gICAgcmVjdDogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeCA9IHNoYXBlLngsXHJcbiAgICAgICAgeSA9IHNoYXBlLnksXHJcbiAgICAgICAgd2lkdGggPSBzaGFwZS53aWR0aCxcclxuICAgICAgICBoZWlnaHQgPSBzaGFwZS5oZWlnaHQsXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmM6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIGN4ID0gc2hhcGUuY3gsXHJcbiAgICAgICAgY3kgPSBzaGFwZS5jeSxcclxuICAgICAgICByeCA9IHNoYXBlLnJ4LFxyXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IGN4IC0gcngsIHk6IGN5IC0gcnksIHdpZHRoOiAyICogcngsIGhlaWdodDogMiAqIHJ5fTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcGF0aFN0cm9rZVNoYXBlSGFuZGxlcnMgPSB7XHJcbiAgICByZWN0OiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gc2hhcGUueCxcclxuICAgICAgICB5ID0gc2hhcGUueSxcclxuICAgICAgICB3aWR0aCA9IHNoYXBlLndpZHRoLFxyXG4gICAgICAgIGhlaWdodCA9IHNoYXBlLmhlaWdodCxcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIHhTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICB5U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHggLSB4U2NhbGVkTGluZVdpZHRoICAvIDIsIHk6IHkgLSB5U2NhbGVkTGluZVdpZHRoIC8gMiwgd2lkdGg6IHdpZHRoICsgeFNjYWxlZExpbmVXaWR0aCwgaGVpZ2h0OiBoZWlnaHQgKyB5U2NhbGVkTGluZVdpZHRofTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IHNoYXBlLmN4LFxyXG4gICAgICAgIGN5ID0gc2hhcGUuY3ksXHJcbiAgICAgICAgcnggPSBzaGFwZS5yeCxcclxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IHN0YXRlLmxpbmVXaWR0aCAhPT0gMSA/IHN0YXRlLmxpbmVXaWR0aCA6IDAsXHJcbiAgICAgICAgeFNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIHlTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBuZXdCb3ggPSB7eDogY3ggLSByeCAtIHhTY2FsZWRMaW5lV2lkdGggLyAyLCB5OiBjeSAtIHJ5IC0geVNjYWxlZExpbmVXaWR0aCAvIDIsIHdpZHRoOiAyICogcnggKyB4U2NhbGVkTGluZVdpZHRoLCBoZWlnaHQ6IDIgKiByeSArIHlTY2FsZWRMaW5lV2lkdGh9O1xyXG4gICAgICBpZiAoIWlzTmFOKGN4KSAmJiAhaXNOYU4oY3kpKSB7XHJcbiAgICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBsaW5lVG86IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIHgxID0gc2hhcGUueDEsXHJcbiAgICAgICAgeTEgPSBzaGFwZS55MSxcclxuICAgICAgICB4MiA9IHNoYXBlLngyLFxyXG4gICAgICAgIHkyID0gc2hhcGUueTIsXHJcbiAgICAgICAgc2NhbGVkTGluZVdpZHRoID0gZ2V0U2NhbGVkV2lkdGhPZkxpbmUoeDEsIHkxLCB4MiwgeTIsIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LCBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSwgc3RhdGUubGluZVdpZHRoKSxcclxuICAgICAgICByZWN0ID0gZ2V0UmVjdEFyb3VuZExpbmUoeDEsIHkxLCB4MiwgeTIsIHNjYWxlZExpbmVXaWR0aCAhPT0gMSA/IHNjYWxlZExpbmVXaWR0aCA6IDApLFxyXG4gICAgICAgIG5ld0JveCA9IHtcclxuICAgICAgICAgIHg6IE1hdGgubWluKHJlY3QueDEsIHJlY3QueDIsIHJlY3QueDMsIHJlY3QueDQpLFxyXG4gICAgICAgICAgeTogTWF0aC5taW4ocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NCksXHJcbiAgICAgICAgICB3aWR0aDogTWF0aC5tYXgocmVjdC54MSwgcmVjdC54MiwgcmVjdC54MywgcmVjdC54NCkgLSBNYXRoLm1pbihyZWN0LngxLCByZWN0LngyLCByZWN0LngzLCByZWN0Lng0KSxcclxuICAgICAgICAgIGhlaWdodDogTWF0aC5tYXgocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NCkgLSBNYXRoLm1pbihyZWN0LnkxLCByZWN0LnkyLCByZWN0LnkzLCByZWN0Lnk0KVxyXG4gICAgICAgIH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGNhbnZhc0NhbGxIYW5kbGVycyA9IHtcclxuICAgIGxpbmVXaWR0aDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLmxpbmVXaWR0aHNbc3RhdGUubGluZVdpZHRocy5sZW5ndGggLSAxXSA9IGNhbGwudmFsO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgZmlsbFJlY3Q6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgd2lkdGggPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIGhlaWdodCA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBzdHJva2VSZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IHN0YXRlLmxpbmVXaWR0aCAhPT0gMSA/IHN0YXRlLmxpbmVXaWR0aCA6IDAsXHJcbiAgICAgICAgeFNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIHlTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBuZXdCb3ggPSB7eDogeCAtIHhTY2FsZWRMaW5lV2lkdGggLyAyLCB5OiB5IC0geVNjYWxlZExpbmVXaWR0aCAvIDIsIHdpZHRoOiB3aWR0aCArIHhTY2FsZWRMaW5lV2lkdGgsIGhlaWdodDogaGVpZ2h0ICsgeVNjYWxlZExpbmVXaWR0aH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHJlY3Q6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgd2lkdGggPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIGhlaWdodCA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnk7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAncmVjdCcsIHg6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyYzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgY3kgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHJ4ID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICByeSA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnk7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnYXJjJywgY3g6IGN4LCBjeTogY3ksIHJ4OiByeCwgcnk6IHJ5fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBtb3ZlVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkxID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueTtcclxuICAgICAgc3RhdGUubW92ZVRvTG9jYXRpb24gPSB7eDogeDEsIHk6IHkxfTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGxpbmVUbzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4MSA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLngsXHJcbiAgICAgICAgeTEgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi55LFxyXG4gICAgICAgIHgyID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5MiA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnk7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnbGluZVRvJywgeDE6IHgxLCB5MTogeTEsIHgyOiB4MiwgeTI6IHkyfSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmNUbzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4MCA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLngsXHJcbiAgICAgICAgeTAgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi55LFxyXG4gICAgICAgIHgxID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5MSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgeDIgPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkyID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICByID0gY2FsbC5hcmd1bWVudHNbNF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBkZWNvbXBvc2l0aW9uID0gZGVjb21wb3NlQXJjVG8oeDAsIHkwLCB4MSwgeTEsIHgyLCB5Miwgcik7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnbGluZVRvJywgeDE6IGRlY29tcG9zaXRpb24ubGluZS54MSwgeTE6IGRlY29tcG9zaXRpb24ubGluZS55MSwgeDI6IGRlY29tcG9zaXRpb24ubGluZS54MiwgeTI6IGRlY29tcG9zaXRpb24ubGluZS55Mn0pO1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2FyYycsIGN4OiBkZWNvbXBvc2l0aW9uLmFyYy54LCBjeTogZGVjb21wb3NpdGlvbi5hcmMueSwgcng6IHIsIHJ5OiByfSk7XHJcbiAgICAgIHN0YXRlLm1vdmVUb0xvY2F0aW9uID0ge3g6IGRlY29tcG9zaXRpb24ucG9pbnQueCwgeTogZGVjb21wb3NpdGlvbi5wb2ludC55fTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHNhdmU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS50cmFuc2Zvcm1zLnB1c2goW10pO1xyXG4gICAgICBzdGF0ZS5saW5lV2lkdGhzLnB1c2gobGFzdEVsZW1lbnQoc3RhdGUubGluZVdpZHRocykpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgcmVzdG9yZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLnRyYW5zZm9ybXMucG9wKCk7XHJcbiAgICAgIHN0YXRlLmxpbmVXaWR0aHMucG9wKCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICB0cmFuc2xhdGU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBsYXN0RWxlbWVudChzdGF0ZS50cmFuc2Zvcm1zKVxyXG4gICAgICAgIC5wdXNoKHt0cmFuc2xhdGU6IHt4OiBjYWxsLmFyZ3VtZW50c1swXSwgeTogY2FsbC5hcmd1bWVudHNbMV19fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBzY2FsZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIGxhc3RFbGVtZW50KHN0YXRlLnRyYW5zZm9ybXMpXHJcbiAgICAgICAgLnB1c2goe3NjYWxlOiB7eDogY2FsbC5hcmd1bWVudHNbMF0sIHk6IGNhbGwuYXJndW1lbnRzWzFdfX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYmVnaW5QYXRoOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoID0gW107XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBmaWxsOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgcmV0dXJuIHN0YXRlLnNoYXBlc0luUGF0aC5yZWR1Y2UoKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICAgIHZhciBoYW5kbGVyID0gZ2V0UGF0aEZpbGxTaGFwZUhhbmRsZXIoc2hhcGUpO1xyXG4gICAgICAgIHJldHVybiBoYW5kbGVyKHN0YXRlLCBzaGFwZSk7XHJcbiAgICAgIH0sIHN0YXRlKTtcclxuICAgIH0sXHJcbiAgICBzdHJva2U6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgc3RhdGUuc2hhcGVzSW5QYXRoLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHNoYXBlID0gc3RhdGUuc2hhcGVzSW5QYXRoW2ldLFxyXG4gICAgICAgICAgICBoYW5kbGVyID0gZ2V0UGF0aFN0cm9rZVNoYXBlSGFuZGxlcihzaGFwZSk7XHJcbiAgICAgICAgc3RhdGUgPSBoYW5kbGVyKHN0YXRlLCBzaGFwZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG51bGxDYW52YXNDYWxsSGFuZGxlciA9IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH0sXHJcblxyXG4gIGdldENhbnZhc0NhbGxIYW5kbGVyID0gKGNhbGwpID0+IHtcclxuICAgIHJldHVybiBjYW52YXNDYWxsSGFuZGxlcnNbY2FsbC5tZXRob2RdIHx8IGNhbnZhc0NhbGxIYW5kbGVyc1tjYWxsLmF0dHJdIHx8IG51bGxDYW52YXNDYWxsSGFuZGxlcjtcclxuICB9LFxyXG5cclxuICBnZXRQYXRoRmlsbFNoYXBlSGFuZGxlciA9IChzaGFwZSkgPT4ge1xyXG4gICAgcmV0dXJuIHBhdGhGaWxsU2hhcGVIYW5kbGVyc1tzaGFwZS50eXBlXTtcclxuICB9LFxyXG5cclxuICBnZXRQYXRoU3Ryb2tlU2hhcGVIYW5kbGVyID0gKHNoYXBlKSA9PiB7XHJcbiAgICByZXR1cm4gcGF0aFN0cm9rZVNoYXBlSGFuZGxlcnNbc2hhcGUudHlwZV07XHJcbiAgfSxcclxuXHJcbiAgcHJlQ2FudmFzQ2FsbEhhbmRsZXIgPSAoc3RhdGUpID0+IHtcclxuICAgIHN0YXRlLnRyYW5zZm9ybSA9IHRvdGFsVHJhbnNmb3JtKGZsYXR0ZW4oc3RhdGUudHJhbnNmb3JtcykpO1xyXG4gICAgc3RhdGUubGluZVdpZHRoID0gbGFzdEVsZW1lbnQoc3RhdGUubGluZVdpZHRocyk7XHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbiAgfSxcclxuXHJcbiAgZ2V0QkJveCA9IChzaGFwZSkgPT4ge1xyXG4gICAgdmFyIHN0YXRlID0gY3JlYXRlTmV3Q2FudmFzQ2FsbFN0YXRlKCk7XHJcbiAgICBzdGF0ZSA9IHNoYXBlLnJlZHVjZSgoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIGhhbmRsZXIgPSBnZXRDYW52YXNDYWxsSGFuZGxlcihjYWxsKTtcclxuICAgICAgcmV0dXJuIGhhbmRsZXIocHJlQ2FudmFzQ2FsbEhhbmRsZXIoc3RhdGUpLCBjYWxsKTtcclxuICAgIH0sIGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSgpKTtcclxuICAgIHJldHVybiBzdGF0ZS5ib3g7XHJcbiAgfSxcclxuXHJcbiAgZmxhdHRlbiA9IChhcnJheSkgPT4ge1xyXG4gICAgcmV0dXJuIGFycmF5XHJcbiAgICAgIC5yZWR1Y2UoKHByZXZpb3VzQXJyYXksIGN1cnJlbnRBcnJheSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBwcmV2aW91c0FycmF5LmNvbmNhdChjdXJyZW50QXJyYXkpO1xyXG4gICAgICB9LCBbXSk7XHJcbiAgfSxcclxuXHJcbiAgbGFzdEVsZW1lbnQgPSAoYXJyYXkpID0+IHtcclxuICAgIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcclxuICB9LFxyXG5cclxuICBmaXJzdFRydXRoeU9yWmVybyA9ICh2YWwxLCB2YWwyKSA9PntcclxuICAgIGlmICh2YWwxIHx8IHZhbDEgPT09IDApIHtcclxuICAgICAgcmV0dXJuIHZhbDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsMjtcclxuICB9LFxyXG5cclxuICB1bmlvbiA9IChib3gxLCBib3gyKSA9PiB7XHJcbiAgICBib3gxID0ge1xyXG4gICAgICB4OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLngsIGJveDIueCksXHJcbiAgICAgIHk6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDEueSwgYm94Mi55KSxcclxuICAgICAgd2lkdGg6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDEud2lkdGgsIGJveDIud2lkdGgpLFxyXG4gICAgICBoZWlnaHQ6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDEuaGVpZ2h0LCBib3gyLmhlaWdodClcclxuICAgIH07XHJcbiAgICBib3gyID0ge1xyXG4gICAgICB4OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLngsIGJveDEueCksXHJcbiAgICAgIHk6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDIueSwgYm94MS55KSxcclxuICAgICAgd2lkdGg6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDIud2lkdGgsIGJveDEud2lkdGgpLFxyXG4gICAgICBoZWlnaHQ6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDIuaGVpZ2h0LCBib3gxLmhlaWdodClcclxuICAgIH07XHJcbiAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICB4OiBNYXRoLm1pbihib3gxLngsIGJveDIueCksXHJcbiAgICAgIHk6IE1hdGgubWluKGJveDEueSwgYm94Mi55KSxcclxuICAgICAgd2lkdGg6IE1hdGgubWF4KGJveDEud2lkdGgsIGJveDIud2lkdGgsIGJveDEueCA8IGJveDIueFxyXG4gICAgICAgID8gYm94MS53aWR0aCArIGJveDIud2lkdGggKyAoYm94Mi54IC0gKGJveDEueCArIGJveDEud2lkdGgpKVxyXG4gICAgICAgIDogYm94MS53aWR0aCArIGJveDIud2lkdGggKyAoYm94MS54IC0gKGJveDIueCArIGJveDIud2lkdGgpKSksXHJcbiAgICAgIGhlaWdodDogTWF0aC5tYXgoYm94MS5oZWlnaHQsIGJveDIuaGVpZ2h0LCBib3gxLnkgPCBib3gyLnlcclxuICAgICAgICA/IGJveDEuaGVpZ2h0ICsgYm94Mi5oZWlnaHQgKyAoYm94Mi55IC0gKGJveDEueSArIGJveDEuaGVpZ2h0KSlcclxuICAgICAgICA6IGJveDEuaGVpZ2h0ICsgYm94Mi5oZWlnaHQgKyAoYm94MS55IC0gKGJveDIueSArIGJveDIuaGVpZ2h0KSkpXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9LFxyXG5cclxuICB0b3RhbFRyYW5zZm9ybSA9ICh0cmFuc2Zvcm1zKSA9PiB7XHJcbiAgICByZXR1cm4gdHJhbnNmb3Jtc1xyXG4gICAgICAubWFwKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0cmFuc2xhdGU6IHZhbHVlLnRyYW5zbGF0ZSB8fCB7eDogMCwgeTogMH0sXHJcbiAgICAgICAgICBzY2FsZTogdmFsdWUuc2NhbGUgfHwge3g6IDEsIHk6IDF9XHJcbiAgICAgICAgfTtcclxuICAgICAgfSlcclxuICAgICAgLnJlZHVjZSgocHJldmlvdXNWYWx1ZSwgY3VycmVudFZhbHVlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRyYW5zbGF0ZToge1xyXG4gICAgICAgICAgICB4OiBwcmV2aW91c1ZhbHVlLnRyYW5zbGF0ZS54ICsgY3VycmVudFZhbHVlLnRyYW5zbGF0ZS54ICogcHJldmlvdXNWYWx1ZS5zY2FsZS54LFxyXG4gICAgICAgICAgICB5OiBwcmV2aW91c1ZhbHVlLnRyYW5zbGF0ZS55ICsgY3VycmVudFZhbHVlLnRyYW5zbGF0ZS55ICogcHJldmlvdXNWYWx1ZS5zY2FsZS55XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc2NhbGU6IHtcclxuICAgICAgICAgICAgeDogcHJldmlvdXNWYWx1ZS5zY2FsZS54ICogY3VycmVudFZhbHVlLnNjYWxlLngsXHJcbiAgICAgICAgICAgIHk6IHByZXZpb3VzVmFsdWUuc2NhbGUueSAqIGN1cnJlbnRWYWx1ZS5zY2FsZS55XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfSwge3RyYW5zbGF0ZToge3g6IDAsIHk6IDB9LCBzY2FsZToge3g6IDEsIHk6IDF9fSk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UmVjdEFyb3VuZExpbmUgPSAoeDEsIHkxLCB4MiwgeTIsIHdpZHRoKSA9PiB7XHJcbiAgICB2YXIgcmVjdDtcclxuICAgIGlmICh4MSA9PT0geTEgJiYgeDEgPT09IHgyICYmIHgxID09PSB5Mikge1xyXG4gICAgICByZWN0ID0ge1xyXG4gICAgICAgIHgxOiB4MSwgeTE6IHgxLCAgeDI6IHgxLCB5MjogeDEsXHJcbiAgICAgICAgeDQ6IHgxLCB5NDogeDEsICB4MzogeDEsIHkzOiB4MVxyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVjdCA9IGdldFJlY3RBcm91bmRMb25nTGluZSh4MSwgeTEsIHgyLCB5Miwgd2lkdGgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlY3Q7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UmVjdEFyb3VuZExvbmdMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCB3aWR0aCkgPT4ge1xyXG4gICAgLy8gIHIgPSB0aGUgcmFkaXVzIG9yIHRoZSBnaXZlbiBkaXN0YW5jZSBmcm9tIGEgZ2l2ZW4gcG9pbnQgdG8gdGhlIG5lYXJlc3QgY29ybmVycyBvZiB0aGUgcmVjdFxyXG4gICAgLy8gIGEgPSB0aGUgYW5nbGUgYmV0d2VlbiB0aGUgbGluZSBhbmQgdGhlIGhvcml6b250YWwgYXhpc1xyXG4gICAgLy8gIGIxLCBiMiA9IHRoZSBhbmdsZSBiZXR3ZWVuIGhhbGYgdGhlIGhpZ2h0IG9mIHRoZSByZWN0YW5nbGUgYW5kIHRoZSBob3Jpem9udGFsIGF4aXNcclxuICAgIC8vXHJcbiAgICAvLyAgSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlIHRoZSBnaXZlbiBsaW5lIGlzIGhvcml6b250YWwsIHNvIGEgPSAwLlxyXG4gICAgLy8gIFRoZSBnaXZlbiBsaW5lIGlzIGJldHdlZW4gdGhlIHR3byBAIHN5bWJvbHMuXHJcbiAgICAvLyAgVGhlICsgc3ltYm9scyBhcmUgdGhlIGNvcm5lcnMgb2YgcmVjdGFuZ2xlIHRvIGJlIGRldGVybWluZWQuXHJcbiAgICAvLyAgSW4gb3JkZXIgdG8gZmluZCB0aGUgYjEgYW5kIGIyIGFuZ2xlcyB3ZSBoYXZlIHRvIGFkZCBQSS8yIGFuZCByZXNwZWN0aXZseSBzdWJ0cmFjdCBQSS8yLlxyXG4gICAgLy8gIGIxIGlzIHZlcnRpY2FsIGFuZCBwb2ludGluZyB1cHdvcmRzIGFuZCBiMiBpcyBhbHNvIHZlcnRpY2FsIGJ1dCBwb2ludGluZyBkb3dud29yZHMuXHJcbiAgICAvLyAgRWFjaCBjb3JuZXIgaXMgciBvciB3aWR0aCAvIDIgZmFyIGF3YXkgZnJvbSBpdHMgY29yZXNwb25kZW50IGxpbmUgZW5kaW5nLlxyXG4gICAgLy8gIFNvIHdlIGtub3cgdGhlIGRpc3RhbmNlIChyKSwgdGhlIHN0YXJ0aW5nIHBvaW50cyAoeDEsIHkxKSBhbmQgKHgyLCB5MikgYW5kIHRoZSAoYjEsIGIyKSBkaXJlY3Rpb25zLlxyXG4gICAgLy9cclxuICAgIC8vICAoeDEseTEpICAgICAgICAgICAgICAgICAgICAoeDIseTIpXHJcbiAgICAvLyAgICAgICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXHJcbiAgICAvLyAgICAgIF4gICAgICAgICAgICAgICAgICAgICAgICBeXHJcbiAgICAvLyAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgICAvLyAgICAgIHwgYjEgICAgICAgICAgICAgICAgICAgICB8IGIxXHJcbiAgICAvLyAgICAgIEA9PT09PT09PT09PT09PT09PT09PT09PT1AXHJcbiAgICAvLyAgICAgIHwgYjIgICAgICAgICAgICAgICAgICAgICB8IGIyXHJcbiAgICAvLyAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgICAvLyAgICAgIHYgICAgICAgICAgICAgICAgICAgICAgICB2XHJcbiAgICAvLyAgICAgICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXHJcbiAgICAvLyAgKHg0LHk0KSAgICAgICAgICAgICAgICAgICAgKHgzLHkzKVxyXG4gICAgLy9cclxuXHJcbiAgICB2YXIgciA9IHdpZHRoIC8gMixcclxuICAgICAgYSA9IE1hdGguYXRhbigoeTIgLSB5MSkgLyAoeDIgLSB4MSkpLFxyXG4gICAgICBiMSA9IGEgKyBNYXRoLlBJLzIsXHJcbiAgICAgIGIyID0gYSAtIE1hdGguUEkvMixcclxuICAgICAgcngxID0gciAqIE1hdGguY29zKGIxKSArIHgxLFxyXG4gICAgICByeTEgPSByICogTWF0aC5zaW4oYjEpICsgeTEsXHJcbiAgICAgIHJ4MiA9IHIgKiBNYXRoLmNvcyhiMSkgKyB4MixcclxuICAgICAgcnkyID0gciAqIE1hdGguc2luKGIxKSArIHkyLFxyXG4gICAgICByeDMgPSByICogTWF0aC5jb3MoYjIpICsgeDIsXHJcbiAgICAgIHJ5MyA9IHIgKiBNYXRoLnNpbihiMikgKyB5MixcclxuICAgICAgcng0ID0gciAqIE1hdGguY29zKGIyKSArIHgxLFxyXG4gICAgICByeTQgPSByICogTWF0aC5zaW4oYjIpICsgeTE7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4MTogcngxLCB5MTogcnkxLCAgeDI6IHJ4MiwgeTI6IHJ5MixcclxuICAgICAgeDQ6IHJ4NCwgeTQ6IHJ5NCwgIHgzOiByeDMsIHkzOiByeTNcclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgZ2V0U2NhbGVkV2lkdGhPZkxpbmUgPSAoeDEsIHkxLCB4MiwgeTIsIHN4LCBzeSwgd2lkdGgpID0+IHtcclxuICAgIC8vICBUaGUgb3JpZ2luYWwgcG9pbnRzIGFyZSBub3QgbW92ZWQuIE9ubHkgdGhlIHdpZHRoIHdpbGwgYmUgc2NhbGVkLlxyXG4gICAgLy8gIFRoZSB3aWR0aCBvZiBhbiBob3Jpem9udGFsIGxpbmUgd2lsbCBiZSBzY2FsZWQgd2l0aCB0aGUgc3kgcmF0aW8gb25seS5cclxuICAgIC8vICBUaGUgd2lkdGggb2YgYSB2ZXJ0aXZhbCBsaW5lIHdpbGwgYmUgc2NhbGVkIHdpdGggdGhlIHN4IHJhdGlvIG9ubHkuXHJcbiAgICAvLyAgVGhlIHdpZHRoIG9mIGFuIG9ibGlxdWUgbGluZSB3aWxsIGJlIHNjYWxlZCB3aXRoIGJvdGggdGhlIHN4IGFuZCBzeVxyXG4gICAgLy9idXQgcHJvcG9ydGlvbmFsIHdpdGggdGhlIGFuZ2xlIGJldHdlZW4gdGhlIGxpbmUgYW5kIHRoZSB4IGFuZCB5IGF4ZXMuXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlxcXHJcbiAgICAvLyAgICAgICAgICAgICAgIC5cXCAgKHgyLHkyKSAgICAgICAgICAgICAgICAgICAgICAgICAuLi5cXCAgKHgyLHkyKVxyXG4gICAgLy8gICAgICAgICAgICAgIC4uLkAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLi4uQFxyXG4gICAgLy8gICAgICAgICAgICAgLi4uLy5cXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLi4uLy5cXFxyXG4gICAgLy8gICAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgICBzeCAgICAgICAgICAgICAuLi4uLi8uLi5cXFxyXG4gICAgLy8gICAgICAgICAgIC4uLi8uLi4gICAgICAgICAgICArLS0tPiAgICAgICAgICAgIC4uLi4uLy4uLi4uXHJcbiAgICAvLyAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAuLi4uLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAuLi4vLi4uICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgXFwuLi4vLi4uLi5cclxuICAgIC8vICAgICAgICAgXFwuLy4uLiAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgXFwuLy4uLi4uXHJcbiAgICAvLyAgICAgICAgICBALi4uICAgICAgICAgICAgIHN5IHYgICAgICAgICAgICAgICAgIEAuLi4uLlxyXG4gICAgLy8gICh4MSx5MSkgIFxcLiAgICAgICAgICAgICAgICAgICAgICAgICAgICh4MSx5MSkgIFxcLi4uXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFwuXHJcbiAgICAvL1xyXG4gICAgdmFyIGEgPSBNYXRoLmF0YW4oKHkyIC0geTEpIC8gKHgyIC0geDEpKSxcclxuICAgICAgc2luYSA9IE1hdGguc2luKGEpLCBjb3NhID0gTWF0aC5jb3MoYSksXHJcbiAgICAgIHNjYWxlZFdpZHRoID0gd2lkdGggKiBNYXRoLnNxcnQoc3gqc3ggKiBzaW5hKnNpbmEgKyBzeSpzeSAqIGNvc2EqY29zYSk7XHJcbiAgICByZXR1cm4gc2NhbGVkV2lkdGg7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCA9ICh4MSwgeTEsIHgyLCB5MiwgZGlzdGFuY2UpID0+IHtcclxuICAgIHZhciByZWN0ID0gZ2V0UmVjdEFyb3VuZExvbmdMaW5lKHgxLCB5MSwgeDIsIHkyLCAyICogZGlzdGFuY2UpO1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAge3gxOiByZWN0LngxLCB5MTogcmVjdC55MSwgeDI6IHJlY3QueDIsIHkyOiByZWN0LnkyfSxcclxuICAgICAge3gxOiByZWN0Lng0LCB5MTogcmVjdC55NCwgeDI6IHJlY3QueDMsIHkyOiByZWN0LnkzfVxyXG4gICAgXTtcclxuICB9LFxyXG5cclxuICBnZXRJbnRlcnNlY3Rpb25PZlR3b0xpbmVzID0gKGwxLCBsMikgPT4ge1xyXG4gICAgdmFyIGExID0gbDEueTIgLSBsMS55MSwgYjEgPSBsMS54MSAtIGwxLngyLCBjMSA9IGwxLngyKmwxLnkxIC0gbDEueDEqbDEueTIsXHJcbiAgICAgICAgYTIgPSBsMi55MiAtIGwyLnkxLCBiMiA9IGwyLngxIC0gbDIueDIsIGMyID0gbDIueDIqbDIueTEgLSBsMi54MSpsMi55MixcclxuICAgICAgICB4ID0gKGMyKmIxIC0gYzEqYjIpIC8gKGExKmIyIC0gYTIqYjEpLFxyXG4gICAgICAgIHkgPSBsMi55MSA9PT0gbDIueTIgPyBsMi55MSA6ICgtYzEgLSBhMSp4KSAvIGIxO1xyXG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5fTtcclxuICB9LFxyXG5cclxuICBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoKHgyLXgxKSooeDIteDEpICsgKHkyLXkxKSooeTIteTEpKTtcclxuICB9LFxyXG5cclxuICBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyA9ICh4MSwgeTEsIHgyLCB5MiwgeDMsIHkzKSA9PiB7XHJcbiAgICB2YXIgYSA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MSwgeTEsIHgyLCB5MiksXHJcbiAgICAgICAgYiA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MiwgeTIsIHgzLCB5MyksXHJcbiAgICAgICAgYyA9IGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MywgeTMsIHgxLCB5MSksXHJcbiAgICAgICAgY29zQyA9IChhKmEgKyBiKmIgLSBjKmMpIC8gKDIqYSpiKSxcclxuICAgICAgICBDID0gTWF0aC5hY29zKGNvc0MpO1xyXG4gICAgcmV0dXJuIEM7XHJcbiAgfSxcclxuXHJcbiAgcGVybXV0ZUxpbmVzID0gKGFscGhhTGluZXMsIGJldGFMaW5lcykgPT4ge1xyXG4gICAgdmFyIHBlcm11dGF0aW9ucyA9IFtdO1xyXG4gICAgYWxwaGFMaW5lcy5mb3JFYWNoKChhbHBoYUxpbmUpID0+IHtcclxuICAgICAgYmV0YUxpbmVzLmZvckVhY2goKGJldGFMaW5lKSA9PiB7XHJcbiAgICAgICAgcGVybXV0YXRpb25zLnB1c2goe2FscGhhOiBhbHBoYUxpbmUsIGJldGE6IGJldGFMaW5lfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIHJldHVybiBwZXJtdXRhdGlvbnM7XHJcbiAgfSxcclxuXHJcbiAgYWxtb3N0RXF1YWwgPSAoYSwgYikgPT4ge1xyXG4gICAgLy8gZ3Jvc3MgYXBwcm94aW1hdGlvbiB0byBjb3ZlciB0aGUgZmxvdCBhbmQgdHJpZ29ub21ldHJpYyBwcmVjaXNpb25cclxuICAgIHJldHVybiBhID09PSBiIHx8IE1hdGguYWJzKGEgLSBiKSA8IDUgKiBFUFNJTE9OO1xyXG4gIH0sXHJcblxyXG4gIGlzQ2VudGVySW5CZXR3ZWVuID0gKGN4LCBjeSwgeDAsIHkwLCB4MSwgeTEsIHgyLCB5MikgPT4ge1xyXG4gICAgdmFyIGExID0gZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoY3gsIGN5LCB4MSwgeTEsIHgwLCB5MCksXHJcbiAgICAgICAgYTIgPSBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyhjeCwgY3ksIHgxLCB5MSwgeDIsIHkyKTtcclxuICAgIHJldHVybiBhbG1vc3RFcXVhbChhMSwgYTIpICYmIGExIDw9IE1hdGguUEkgLyAyO1xyXG4gIH0sXHJcblxyXG4gIGdldFRoZUNlbnRlck9mVGhlQ29ybmVyID0gKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIGRpc3RhbmNlKSA9PiB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkICBkXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgYWxwaGEgbGluZSAwICAgIC0tLS0tLS0tLS0tLS0nLS0vLS0nLS0tLS0tLS0tXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnICAgICAgICAgICAgIGRcclxuICAgIC8vICAgICBnaXZlbiBsaW5lICAgID09PVA9PT09PT09PT09UD09PT09PT09PT09PT09XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJyAgICAgICAgICAgICAgIGRcclxuICAgIC8vICAgYWxwaGEgbGluZSAxICAgIC0tLS0tLS0tLUMtLS8tLSctLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAnICBQICAnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vXHJcbiAgICAvLyAgICAgYmV0YSBsaW5lcyAwICYgMSB3aXRoIG9uZSBvZiB0aGUgZ2l2ZW4gbGluZSBpbmJldHdlZW5cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gIFAgPSB0aGUgZ2l2ZW4gUDAsIFAxLCBQMiBwb2ludHNcclxuICAgIC8vXHJcbiAgICAvLyAgZCA9IHRoZSBnaXZlbiBkaXN0YW5jZSAvIHJhZGl1cyBvZiB0aGUgY2lyY2xlXHJcbiAgICAvL1xyXG4gICAgLy8gIEMgPSB0aGUgY2VudGVyIG9mIHRoZSBjaXJjbGUvY29ybmVyIHRvIGJlIGRldGVybWluZWRcclxuXHJcbiAgICB2YXIgYWxwaGFMaW5lcyA9IGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQoeDAsIHkwLCB4MSwgeTEsIGRpc3RhbmNlKSxcclxuICAgICAgICBiZXRhTGluZXMgPSBnZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50KHgxLCB5MSwgeDIsIHkyLCBkaXN0YW5jZSksXHJcbiAgICAgICAgcGVybXV0YXRpb25zID0gcGVybXV0ZUxpbmVzKGFscGhhTGluZXMsIGJldGFMaW5lcyksXHJcbiAgICAgICAgaW50ZXJzZWN0aW9ucyA9IHBlcm11dGF0aW9ucy5tYXAoKHApID0+IGdldEludGVyc2VjdGlvbk9mVHdvTGluZXMocC5hbHBoYSwgcC5iZXRhKSksXHJcbiAgICAgICAgY2VudGVyID0gaW50ZXJzZWN0aW9ucy5maWx0ZXIoKGkpID0+IGlzQ2VudGVySW5CZXR3ZWVuKGkueCwgaS55LCB4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSlbMF07XHJcblxyXG4gICAgcmV0dXJuIGNlbnRlciB8fCB7eDogTmFOLCB5OiBOYU59O1xyXG4gIH0sXHJcblxyXG4gIGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIgPSAoeDEsIHkxLCB4MiwgeTIsIGN4LCBjeSkgPT4ge1xyXG4gICAgdmFyIG0gPSAoeTIgLSB5MSkgLyAoeDIgLSB4MSksXHJcbiAgICAgICAgY20gPSAtMSAvIG0sXHJcbiAgICAgICAgQyA9IHkxKih4MiAtIHgxKSAtIHgxKih5MiAtIHkxKSxcclxuICAgICAgICB4ID0gKEMgLSAoeDIgLSB4MSkqKGN5IC0gY20qY3gpKSAvIChjbSooeDIgLSB4MSkgKyB5MSAtIHkyKSxcclxuICAgICAgICB5ID0gY20qKHggLSBjeCkgKyBjeTtcclxuICAgIHJldHVybiBtID09PSAwIC8vIGhvcml6b250YWxcclxuICAgICAgPyB7eDogY3gsIHk6IHkxfVxyXG4gICAgICA6IChtID09PSBJbmZpbml0eSAvLyB2ZXJ0aWNhbFxyXG4gICAgICAgID8ge3g6IHgxLCB5OiBjeX1cclxuICAgICAgICA6IHt4OiB4LCB5OiB5fSk7XHJcbiAgfSxcclxuXHJcbiAgeHlUb0FyY0FuZ2xlID0gKGN4LCBjeSwgeCwgeSkgPT4ge1xyXG4gICAgdmFyIGhvcml6b250YWxYID0gY3ggKyAxLFxyXG4gICAgICAgIGhvcml6b250YWxZID0gY3ksXHJcbiAgICAgICAgYSA9IE1hdGguYWJzKGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzKHgsIHksIGN4LCBjeSwgaG9yaXpvbnRhbFgsIGhvcml6b250YWxZKSk7XHJcbiAgICBpZih5IDwgY3kpIHtcclxuICAgICAgLy90aGlyZCAmIGZvcnRoIHF1YWRyYW50c1xyXG4gICAgICBhID0gTWF0aC5QSSArIE1hdGguUEkgLSBhO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGE7XHJcbiAgfSxcclxuXHJcbiAgY29sbGluZWFyID0gKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpID0+IHtcclxuICAgIHZhciBtMSA9ICh5MSAtIHkwKSAvICh4MSAtIHgwKSxcclxuICAgICAgICBtMiA9ICh5MiAtIHkxKSAvICh4MiAtIHgxKTtcclxuICAgIHJldHVybiBhbG1vc3RFcXVhbChtMSwgbTIpO1xyXG4gIH0sXHJcblxyXG4gIGRlY29tcG9zZUFyY1RvID0gKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHIpID0+IHtcclxuICAgIHZhciBkZWNvbXBvc2l0aW9uID0ge1xyXG4gICAgICBsaW5lOiB7eDE6IE5hTiwgeTE6IE5hTiwgeDI6IE5hTiwgeTI6IE5hTn0sXHJcbiAgICAgIGFyYzoge3g6IE5hTiwgeTogTmFOLCByOiBOYU4sIHNBbmdsZTogTmFOLCBlQW5nbGU6IE5hTiwgY291bnRlcmNsb2Nrd2lzZTogZmFsc2V9LFxyXG4gICAgICBwb2ludDoge3g6IHgxLCB5OiB5MX1cclxuICAgIH07XHJcbiAgICBpZihjb2xsaW5lYXIoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MikpIHtcclxuICAgICAgZGVjb21wb3NpdGlvbi5saW5lID0ge3gxOiB4MCwgeTE6IHkwLCB4MjogeDEsIHkyOiB5MX07XHJcbiAgICB9IGVsc2UgaWYgKCFpc05hTih4MCkgJiYgIWlzTmFOKHkwKSkge1xyXG4gICAgICB2YXIgY2VudGVyID0gZ2V0VGhlQ2VudGVyT2ZUaGVDb3JuZXIoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiwgciksXHJcbiAgICAgICAgICBmb290MSA9IGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIoeDAsIHkwLCB4MSwgeTEsIGNlbnRlci54LCBjZW50ZXIueSksXHJcbiAgICAgICAgICBmb290MiA9IGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIoeDEsIHkxLCB4MiwgeTIsIGNlbnRlci54LCBjZW50ZXIueSksXHJcbiAgICAgICAgICBhbmdsZUZvb3QxID0geHlUb0FyY0FuZ2xlKGNlbnRlci54LCBjZW50ZXIueSwgZm9vdDEueCwgZm9vdDEueSksXHJcbiAgICAgICAgICBhbmdsZUZvb3QyID0geHlUb0FyY0FuZ2xlKGNlbnRlci54LCBjZW50ZXIueSwgZm9vdDIueCwgZm9vdDIueSksXHJcbiAgICAgICAgICBzQW5nbGUgPSBNYXRoLmFicyhhbmdsZUZvb3QyIC0gYW5nbGVGb290MSkgPCBNYXRoLlBJID8gYW5nbGVGb290MiA6IGFuZ2xlRm9vdDEsXHJcbiAgICAgICAgICBlQW5nbGUgPSBNYXRoLmFicyhhbmdsZUZvb3QyIC0gYW5nbGVGb290MSkgPCBNYXRoLlBJID8gYW5nbGVGb290MSA6IGFuZ2xlRm9vdDI7XHJcbiAgICAgIGlmICghaXNOYU4oY2VudGVyLngpICYmICFpc05hTihjZW50ZXIueSkpIHtcclxuICAgICAgICBkZWNvbXBvc2l0aW9uID0ge1xyXG4gICAgICAgICAgbGluZToge3gxOiB4MCwgeTE6IHkwLCB4MjogZm9vdDEueCwgeTI6IGZvb3QxLnl9LFxyXG4gICAgICAgICAgYXJjOiB7eDogY2VudGVyLngsIHk6IGNlbnRlci55LCByOiByLCBzQW5nbGU6IHNBbmdsZSwgZUFuZ2xlOiBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2U6IGZhbHNlfSxcclxuICAgICAgICAgIHBvaW50OiB7eDogZm9vdDIueCwgeTogZm9vdDIueX1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVjb21wb3NpdGlvbjtcclxuICB9LFxyXG5cclxuICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI3NTI3MjUvZmluZGluZy13aGV0aGVyLWEtcG9pbnQtbGllcy1pbnNpZGUtYS1yZWN0YW5nbGUtb3Itbm90XHJcbiAgaXNQb2ludEluc2lkZVJlY3RhbmdsZSA9IChwb2ludCwgcmVjdGFuZ2xlKSA9PiB7XHJcbiAgICB2YXIgc2VnbWVudHMgPSBbe1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54ICsgcmVjdGFuZ2xlLndpZHRoLFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnkgfSwge1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54ICsgcmVjdGFuZ2xlLndpZHRoLFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0fSwge1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHQsXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodH0sIHtcclxuICAgICAgeDE6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MTogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueVxyXG4gICAgfV07XHJcblxyXG4gICAgdmFyIGlzSW5zaWRlID0gc2VnbWVudHMubWFwKChzZWdtZW50KSA9PiB7XHJcbiAgICAgIHZhciBBID0gLShzZWdtZW50LnkyIC0gc2VnbWVudC55MSksXHJcbiAgICAgICAgQiA9IHNlZ21lbnQueDIgLSBzZWdtZW50LngxLFxyXG4gICAgICAgIEMgPSAtKEEgKiBzZWdtZW50LngxICsgQiAqIHNlZ21lbnQueTEpLFxyXG4gICAgICAgIEQgPSBBICogcG9pbnQueCArIEIgKiBwb2ludC55ICsgQztcclxuICAgICAgICByZXR1cm4gRDtcclxuICAgIH0pLmV2ZXJ5KChEKSA9PiB7XHJcbiAgICAgIHJldHVybiBEID4gMDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBpc0luc2lkZTtcclxuICB9O1xyXG5cclxuXHJcbiAgdGhpcy5nZXRCQm94ID0gZ2V0QkJveDtcclxuICB0aGlzLnVuaW9uID0gdW5pb247XHJcbiAgdGhpcy50b3RhbFRyYW5zZm9ybSA9IHRvdGFsVHJhbnNmb3JtO1xyXG4gIHRoaXMuZ2V0UmVjdEFyb3VuZExpbmUgPSBnZXRSZWN0QXJvdW5kTGluZTtcclxuICB0aGlzLmdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQgPSBnZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50O1xyXG4gIHRoaXMuZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcyA9IGdldEludGVyc2VjdGlvbk9mVHdvTGluZXM7XHJcbiAgdGhpcy5nZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzO1xyXG4gIHRoaXMuZ2V0VGhlQ2VudGVyT2ZUaGVDb3JuZXIgPSBnZXRUaGVDZW50ZXJPZlRoZUNvcm5lcjtcclxuICB0aGlzLmdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIgPSBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyO1xyXG4gIHRoaXMueHlUb0FyY0FuZ2xlID0geHlUb0FyY0FuZ2xlO1xyXG4gIHRoaXMuZGVjb21wb3NlQXJjVG8gPSBkZWNvbXBvc2VBcmNUbztcclxuICB0aGlzLmlzUG9pbnRJbnNpZGVSZWN0YW5nbGUgPSBpc1BvaW50SW5zaWRlUmVjdGFuZ2xlO1xyXG5cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyeS5qcydcclxuaW1wb3J0IHsgQ3VzdG9tTWF0Y2hlcnMgfSBmcm9tICcuL2N1c3RvbU1hdGNoZXJzLmpzJ1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBSYWJiaXQoZ2VvbWV0cnksIG1hdGNoZXJzKSB7XHJcblxyXG4gIHZhciB0aGF0ID0gdGhpcyxcclxuICAgIGdlb21ldHJ5ID0gZ2VvbWV0cnkgfHwgbmV3IEdlb21ldHJ5KCksXHJcbiAgICBtYXRjaGVycyA9IG1hdGNoZXJzIHx8IG5ldyBDdXN0b21NYXRjaGVycygpO1xyXG5cclxuXHJcbiAgdmFyIGZpbmRBbGxTaGFwZXNJZ25vcmluZ0FyZ3VtZW50cyA9IChzaGFwZSwgd2hlcmUpID0+IHtcclxuICAgIHZhciBmb3VuZCA9IFtdLCBpbmRleCA9IDA7XHJcbiAgICBkbyB7XHJcbiAgICAgIGluZGV4ID0gdGhhdC5maW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyhzaGFwZSwgd2hlcmUsIGluZGV4KTtcclxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgIGZvdW5kLnB1c2god2hlcmUuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2hhcGUubGVuZ3RoKSk7XHJcbiAgICAgICAgaW5kZXggKz0gc2hhcGUubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICB9IHdoaWxlIChpbmRleCAhPT0gLTEgJiYgaW5kZXggPCB3aGVyZS5sZW5ndGgpO1xyXG4gICAgcmV0dXJuIGZvdW5kO1xyXG4gIH0sXHJcblxyXG4gIGZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzID0gKHNoYXBlLCB3aGVyZSwgc3RhcnRJbmRleCkgPT4ge1xyXG4gICAgc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXggfHwgMDtcclxuICAgIHZhciBtYXRjaCA9IGZhbHNlLCBpbmRleCA9IC0xO1xyXG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXg7IGkgPD0gd2hlcmUubGVuZ3RoIC0gc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbWF0Y2ggPSB0cnVlO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNoYXBlLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgaWYgKHdoZXJlW2kgKyBqXS5tZXRob2QgIT09IHNoYXBlW2pdLm1ldGhvZCkge1xyXG4gICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAobWF0Y2ggPT09IHRydWUpIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpbmRleDtcclxuICB9LFxyXG5cclxuICByZW1vdmVTaGFwZXMgPSAoc2hhcGVzLCBmcm9tKSA9PiB7XHJcbiAgICB2YXIgY29weSA9IGZyb20uc2xpY2UoMCwgZnJvbS5sZW5ndGgpO1xyXG4gICAgc2hhcGVzLmZvckVhY2goKHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBpbmRleCA9IC0xO1xyXG4gICAgICBkbyB7XHJcbiAgICAgICAgaW5kZXggPSB0aGF0LmZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzKHNoYXBlLCBjb3B5KTtcclxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICBjb3B5LnNwbGljZShpbmRleCwgc2hhcGUubGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gd2hpbGUgKGluZGV4ICE9PSAtMSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb3B5O1xyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLmdldEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94O1xyXG4gIHRoaXMuY3VzdG9tTWF0Y2hlcnMgPSBtYXRjaGVycztcclxuICB0aGlzLmZpbmRBbGxTaGFwZXNJZ25vcmluZ0FyZ3VtZW50cyA9IGZpbmRBbGxTaGFwZXNJZ25vcmluZ0FyZ3VtZW50cztcclxuICB0aGlzLmZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzID0gZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHM7XHJcbiAgdGhpcy5yZW1vdmVTaGFwZXMgPSByZW1vdmVTaGFwZXM7XHJcblxyXG59XHJcbiJdfQ==
