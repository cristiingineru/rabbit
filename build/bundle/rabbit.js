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
      if (decomposition.line) {
        state.shapesInPath.push({ type: 'lineTo', x1: decomposition.line.x1, y1: decomposition.line.y1, x2: decomposition.line.x2, y2: decomposition.line.y2 });
      }
      if (decomposition.arc) {
        state.shapesInPath.push({ type: 'arc', cx: decomposition.arc.x, cy: decomposition.arc.y, rx: r, ry: r });
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
      if (!isNaN(center.x) && !isNaN(center.y)) {
        decomposition.line = { x1: x0, y1: y0, x2: foot1.x, y2: foot1.y };
        decomposition.arc = { x: center.x, y: center.y, r: r, sAngle: sAngle, eAngle: eAngle, counterclockwise: false };
        decomposition.point = { x: foot2.x, y: foot2.y };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGN1c3RvbU1hdGNoZXJzLmpzIiwic3JjXFxnZW9tZXRyeS5qcyIsInNyY1xccmFiYml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7O1FBS2dCLGMsR0FBQSxjOztBQUhoQjs7QUFHTyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0M7O0FBRXZDLGFBQVcsWUFBWSx3QkFBdkI7O0FBR0EsTUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBTyxxQkFBUCxFQUFpQztBQUNoRCxXQUFPO0FBQ0wsZUFBUyxpQkFBQyxNQUFELEVBQVMsUUFBVCxFQUFzQjtBQUM3QixZQUFJLFFBQVEsS0FBWjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxTQUFTLE1BQVQsR0FBa0IsT0FBTyxNQUE3QyxFQUFxRCxHQUFyRCxFQUEwRDtBQUN4RCxrQkFBUSxPQUFPLE1BQVAsR0FBZ0IsQ0FBeEI7QUFDQSxlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksT0FBTyxNQUEzQixFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxnQkFBSSxTQUFTLElBQUksQ0FBYixFQUFnQixNQUFoQixLQUEyQixPQUFPLENBQVAsRUFBVSxNQUF6QyxFQUFpRDtBQUMvQyxzQkFBUSxLQUFSO0FBQ0E7QUFDRDtBQUNGO0FBQ0QsY0FBSSxVQUFVLElBQWQsRUFBb0I7QUFDbEI7QUFDRDtBQUNGO0FBQ0QsWUFBSSxTQUFTLFFBQVEsRUFBQyxNQUFNLElBQVAsRUFBUixHQUF1QixFQUFDLE1BQU0sS0FBUCxFQUFjLFNBQVMsbUJBQXZCLEVBQXBDO0FBQ0EsZUFBTyxNQUFQO0FBQ0Q7QUFqQkksS0FBUDtBQW1CRCxHQXBCRDtBQUFBLE1Bc0JBLHNCQUFzQixTQUF0QixtQkFBc0IsQ0FBQyxJQUFELEVBQU8scUJBQVAsRUFBaUM7QUFDckQsV0FBTztBQUNMLGVBQVMsaUJB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QUssOEJBQUwsR0FBc0MsOEJBQXRDO0FBQ0EsT0FBSywwQkFBTCxHQUFrQywwQkFBbEM7QUFDQSxPQUFLLFlBQUwsR0FBb0IsWUFBcEI7QUFFRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyeS5qcydcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQ3VzdG9tTWF0Y2hlcnMoZ2VvbWV0cnkpIHtcclxuXHJcbiAgZ2VvbWV0cnkgPSBnZW9tZXRyeSB8fCBuZXcgR2VvbWV0cnkoKTtcclxuXHJcblxyXG4gIHZhciB0b0JlUGFydE9mID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aCAtIGFjdHVhbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgbWF0Y2ggPSBhY3R1YWwubGVuZ3RoID4gMDtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYWN0dWFsLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmIChleHBlY3RlZFtpICsgal0ubWV0aG9kICE9PSBhY3R1YWxbal0ubWV0aG9kKSB7XHJcbiAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKG1hdGNoID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVzdWx0ID0gbWF0Y2ggPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZSBub3QgcGFydCBvZid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlSW5zaWRlVGhlQXJlYU9mID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+IHtcclxuICAgICAgICB2YXIgc21hbGxTaGFwZSA9IGFjdHVhbCxcclxuICAgICAgICAgIGJpZ1NoYXBlID0gZXhwZWN0ZWQsXHJcbiAgICAgICAgICBiaWdTaGFwZUJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGJpZ1NoYXBlKSxcclxuICAgICAgICAgIHNtYWxsU2hhcGVCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChzbWFsbFNoYXBlKSxcclxuICAgICAgICAgIGNlbnRlciA9IHt4OiBzbWFsbFNoYXBlQkJveC54ICsgc21hbGxTaGFwZUJCb3gud2lkdGggLyAyLCB5OiBzbWFsbFNoYXBlQkJveC55ICsgc21hbGxTaGFwZUJCb3guaGVpZ2h0IC8gMn0sXHJcbiAgICAgICAgICBpc0NlbnRlckluc2lkZSA9IGdlb21ldHJ5LmlzUG9pbnRJbnNpZGVSZWN0YW5nbGUoY2VudGVyLCBiaWdTaGFwZUJCb3gpLFxyXG4gICAgICAgICAgcmVzdWx0ID0gaXNDZW50ZXJJbnNpZGUgPyB7cGFzczogdHJ1ZX0gOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdTaGFwZSBpcyBub3QgaW5zaWRlIHRoZSBhcmVhIG9mJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvSGF2ZVRoZVNhbWVQb3NpdGlvbldpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCkgPT4ge1xyXG4gICAgICAgIHZhciBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZVBvc2l0aW9uID0gYWN0dWFsQkJveC54ID09PSBleHBlY3RlZEJCb3gueCAmJiBhY3R1YWxCQm94LnkgPT09IGV4cGVjdGVkQkJveC55LFxyXG4gICAgICAgICAgcmVzdWx0ID0gaGF2ZVRoZVNhbWVQb3NpdGlvbiA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uJ307XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvSGF2ZVRoZVNhbWVTaXplV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lU2l6ZSA9IGFjdHVhbEJCb3gud2lkdGggPT09IGV4cGVjdGVkQkJveC53aWR0aCAmJiBhY3R1YWxCQm94LmhlaWdodCA9PT0gZXhwZWN0ZWRCQm94LmhlaWdodCxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lU2l6ZSA/IHtwYXNzOiB0cnVlfSA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NoYXBlcyBkb25gdCBoYXZlIHRoZSBzYW1lIHNpemUnfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9CZUhvcml6b250YWxseUFsaWduV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lQWxpZ25tZW50ID0gYWN0dWFsQkJveC55ID09PSBleHBlY3RlZEJCb3gueSxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lQWxpZ25tZW50ID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgaG9yaXpvbnRhbCBwb3NpdGlvbid9O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlVmVydGljYWxseUFsaWduV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkKSA9PiB7XHJcbiAgICAgICAgdmFyIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lQWxpZ25tZW50ID0gYWN0dWFsQkJveC54ID09PSBleHBlY3RlZEJCb3gueCxcclxuICAgICAgICAgIHJlc3VsdCA9IGhhdmVUaGVTYW1lQWxpZ25tZW50ID8ge3Bhc3M6IHRydWV9IDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGVzIGRvbmB0IGhhdmUgdGhlIHNhbWUgdmVydGljYWwgcG9zaXRpb24nfTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMudG9CZVBhcnRPZiA9IHRvQmVQYXJ0T2Y7XHJcbiAgdGhpcy50b0JlSW5zaWRlVGhlQXJlYU9mID0gdG9CZUluc2lkZVRoZUFyZWFPZjtcclxuICB0aGlzLnRvSGF2ZVRoZVNhbWVQb3NpdGlvbldpdGggPSB0b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoO1xyXG4gIHRoaXMudG9IYXZlVGhlU2FtZVNpemVXaXRoID0gdG9IYXZlVGhlU2FtZVNpemVXaXRoO1xyXG4gIHRoaXMudG9CZUhvcml6b250YWxseUFsaWduV2l0aCA9IHRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGg7XHJcbiAgdGhpcy50b0JlVmVydGljYWxseUFsaWduV2l0aCA9IHRvQmVWZXJ0aWNhbGx5QWxpZ25XaXRoO1xyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBHZW9tZXRyeSgpIHtcclxuXHJcbiAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICBFUFNJTE9OID0gTnVtYmVyLkVQU0lMT04gfHwgMi4yMjA0NDYwNDkyNTAzMTNlLTE2O1xyXG5cclxuXHJcbiAgdmFyIGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSA9ICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGJveDoge3g6IE5hTiwgeTogTmFOLCB3aWR0aDogTmFOLCBoZWlnaHQ6IE5hTn0sXHJcbiAgICAgIHRyYW5zZm9ybXM6IFtbXV0sXHJcbiAgICAgIHNoYXBlc0luUGF0aDogW10sXHJcbiAgICAgIG1vdmVUb0xvY2F0aW9uOiB7eDogTmFOLCB5OiBOYU59LFxyXG4gICAgICBsaW5lV2lkdGhzOiBbMV1cclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgcGF0aEZpbGxTaGFwZUhhbmRsZXJzID0ge1xyXG4gICAgcmVjdDogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeCA9IHNoYXBlLngsXHJcbiAgICAgICAgeSA9IHNoYXBlLnksXHJcbiAgICAgICAgd2lkdGggPSBzaGFwZS53aWR0aCxcclxuICAgICAgICBoZWlnaHQgPSBzaGFwZS5oZWlnaHQsXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmM6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIGN4ID0gc2hhcGUuY3gsXHJcbiAgICAgICAgY3kgPSBzaGFwZS5jeSxcclxuICAgICAgICByeCA9IHNoYXBlLnJ4LFxyXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IGN4IC0gcngsIHk6IGN5IC0gcnksIHdpZHRoOiAyICogcngsIGhlaWdodDogMiAqIHJ5fTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcGF0aFN0cm9rZVNoYXBlSGFuZGxlcnMgPSB7XHJcbiAgICByZWN0OiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gc2hhcGUueCxcclxuICAgICAgICB5ID0gc2hhcGUueSxcclxuICAgICAgICB3aWR0aCA9IHNoYXBlLndpZHRoLFxyXG4gICAgICAgIGhlaWdodCA9IHNoYXBlLmhlaWdodCxcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIHhTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICB5U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHggLSB4U2NhbGVkTGluZVdpZHRoICAvIDIsIHk6IHkgLSB5U2NhbGVkTGluZVdpZHRoIC8gMiwgd2lkdGg6IHdpZHRoICsgeFNjYWxlZExpbmVXaWR0aCwgaGVpZ2h0OiBoZWlnaHQgKyB5U2NhbGVkTGluZVdpZHRofTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IHNoYXBlLmN4LFxyXG4gICAgICAgIGN5ID0gc2hhcGUuY3ksXHJcbiAgICAgICAgcnggPSBzaGFwZS5yeCxcclxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IHN0YXRlLmxpbmVXaWR0aCAhPT0gMSA/IHN0YXRlLmxpbmVXaWR0aCA6IDAsXHJcbiAgICAgICAgeFNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIHlTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBuZXdCb3ggPSB7eDogY3ggLSByeCAtIHhTY2FsZWRMaW5lV2lkdGggLyAyLCB5OiBjeSAtIHJ5IC0geVNjYWxlZExpbmVXaWR0aCAvIDIsIHdpZHRoOiAyICogcnggKyB4U2NhbGVkTGluZVdpZHRoLCBoZWlnaHQ6IDIgKiByeSArIHlTY2FsZWRMaW5lV2lkdGh9O1xyXG4gICAgICBpZiAoIWlzTmFOKGN4KSAmJiAhaXNOYU4oY3kpKSB7XHJcbiAgICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBsaW5lVG86IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIHgxID0gc2hhcGUueDEsXHJcbiAgICAgICAgeTEgPSBzaGFwZS55MSxcclxuICAgICAgICB4MiA9IHNoYXBlLngyLFxyXG4gICAgICAgIHkyID0gc2hhcGUueTIsXHJcbiAgICAgICAgc2NhbGVkTGluZVdpZHRoID0gZ2V0U2NhbGVkV2lkdGhPZkxpbmUoeDEsIHkxLCB4MiwgeTIsIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LCBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSwgc3RhdGUubGluZVdpZHRoKSxcclxuICAgICAgICByZWN0ID0gZ2V0UmVjdEFyb3VuZExpbmUoeDEsIHkxLCB4MiwgeTIsIHNjYWxlZExpbmVXaWR0aCAhPT0gMSA/IHNjYWxlZExpbmVXaWR0aCA6IDApLFxyXG4gICAgICAgIG5ld0JveCA9IHtcclxuICAgICAgICAgIHg6IE1hdGgubWluKHJlY3QueDEsIHJlY3QueDIsIHJlY3QueDMsIHJlY3QueDQpLFxyXG4gICAgICAgICAgeTogTWF0aC5taW4ocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NCksXHJcbiAgICAgICAgICB3aWR0aDogTWF0aC5tYXgocmVjdC54MSwgcmVjdC54MiwgcmVjdC54MywgcmVjdC54NCkgLSBNYXRoLm1pbihyZWN0LngxLCByZWN0LngyLCByZWN0LngzLCByZWN0Lng0KSxcclxuICAgICAgICAgIGhlaWdodDogTWF0aC5tYXgocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NCkgLSBNYXRoLm1pbihyZWN0LnkxLCByZWN0LnkyLCByZWN0LnkzLCByZWN0Lnk0KVxyXG4gICAgICAgIH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGNhbnZhc0NhbGxIYW5kbGVycyA9IHtcclxuICAgIGxpbmVXaWR0aDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLmxpbmVXaWR0aHNbc3RhdGUubGluZVdpZHRocy5sZW5ndGggLSAxXSA9IGNhbGwudmFsO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgZmlsbFJlY3Q6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgd2lkdGggPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIGhlaWdodCA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBzdHJva2VSZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IHN0YXRlLmxpbmVXaWR0aCAhPT0gMSA/IHN0YXRlLmxpbmVXaWR0aCA6IDAsXHJcbiAgICAgICAgeFNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIHlTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBuZXdCb3ggPSB7eDogeCAtIHhTY2FsZWRMaW5lV2lkdGggLyAyLCB5OiB5IC0geVNjYWxlZExpbmVXaWR0aCAvIDIsIHdpZHRoOiB3aWR0aCArIHhTY2FsZWRMaW5lV2lkdGgsIGhlaWdodDogaGVpZ2h0ICsgeVNjYWxlZExpbmVXaWR0aH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHJlY3Q6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgd2lkdGggPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIGhlaWdodCA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnk7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAncmVjdCcsIHg6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyYzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgY3kgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHJ4ID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICByeSA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnk7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnYXJjJywgY3g6IGN4LCBjeTogY3ksIHJ4OiByeCwgcnk6IHJ5fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBtb3ZlVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkxID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueTtcclxuICAgICAgc3RhdGUubW92ZVRvTG9jYXRpb24gPSB7eDogeDEsIHk6IHkxfTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGxpbmVUbzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4MSA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLngsXHJcbiAgICAgICAgeTEgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi55LFxyXG4gICAgICAgIHgyID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5MiA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnk7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnbGluZVRvJywgeDE6IHgxLCB5MTogeTEsIHgyOiB4MiwgeTI6IHkyfSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmNUbzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4MCA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLngsXHJcbiAgICAgICAgICB5MCA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLnksXHJcbiAgICAgICAgICB4MSA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgICB5MSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgICB4MiA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgICB5MiA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgICByID0gY2FsbC5hcmd1bWVudHNbNF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICAgIGRlY29tcG9zaXRpb24gPSBkZWNvbXBvc2VBcmNUbyh4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCByKTtcclxuICAgICAgaWYgKGRlY29tcG9zaXRpb24ubGluZSkge1xyXG4gICAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnbGluZVRvJywgeDE6IGRlY29tcG9zaXRpb24ubGluZS54MSwgeTE6IGRlY29tcG9zaXRpb24ubGluZS55MSwgeDI6IGRlY29tcG9zaXRpb24ubGluZS54MiwgeTI6IGRlY29tcG9zaXRpb24ubGluZS55Mn0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChkZWNvbXBvc2l0aW9uLmFyYykge1xyXG4gICAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnYXJjJywgY3g6IGRlY29tcG9zaXRpb24uYXJjLngsIGN5OiBkZWNvbXBvc2l0aW9uLmFyYy55LCByeDogciwgcnk6IHJ9KTtcclxuICAgICAgfVxyXG4gICAgICBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbiA9IHt4OiBkZWNvbXBvc2l0aW9uLnBvaW50LngsIHk6IGRlY29tcG9zaXRpb24ucG9pbnQueX07XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBzYXZlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUudHJhbnNmb3Jtcy5wdXNoKFtdKTtcclxuICAgICAgc3RhdGUubGluZVdpZHRocy5wdXNoKGxhc3RFbGVtZW50KHN0YXRlLmxpbmVXaWR0aHMpKTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHJlc3RvcmU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS50cmFuc2Zvcm1zLnBvcCgpO1xyXG4gICAgICBzdGF0ZS5saW5lV2lkdGhzLnBvcCgpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgdHJhbnNsYXRlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgbGFzdEVsZW1lbnQoc3RhdGUudHJhbnNmb3JtcylcclxuICAgICAgICAucHVzaCh7dHJhbnNsYXRlOiB7eDogY2FsbC5hcmd1bWVudHNbMF0sIHk6IGNhbGwuYXJndW1lbnRzWzFdfX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc2NhbGU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBsYXN0RWxlbWVudChzdGF0ZS50cmFuc2Zvcm1zKVxyXG4gICAgICAgIC5wdXNoKHtzY2FsZToge3g6IGNhbGwuYXJndW1lbnRzWzBdLCB5OiBjYWxsLmFyZ3VtZW50c1sxXX19KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGJlZ2luUGF0aDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aCA9IFtdO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgZmlsbDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHJldHVybiBzdGF0ZS5zaGFwZXNJblBhdGgucmVkdWNlKChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgICB2YXIgaGFuZGxlciA9IGdldFBhdGhGaWxsU2hhcGVIYW5kbGVyKHNoYXBlKTtcclxuICAgICAgICByZXR1cm4gaGFuZGxlcihzdGF0ZSwgc2hhcGUpO1xyXG4gICAgICB9LCBzdGF0ZSk7XHJcbiAgICB9LFxyXG4gICAgc3Ryb2tlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHN0YXRlLnNoYXBlc0luUGF0aC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBzaGFwZSA9IHN0YXRlLnNoYXBlc0luUGF0aFtpXSxcclxuICAgICAgICAgICAgaGFuZGxlciA9IGdldFBhdGhTdHJva2VTaGFwZUhhbmRsZXIoc2hhcGUpO1xyXG4gICAgICAgIHN0YXRlID0gaGFuZGxlcihzdGF0ZSwgc2hhcGUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBudWxsQ2FudmFzQ2FsbEhhbmRsZXIgPSAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9LFxyXG5cclxuICBnZXRDYW52YXNDYWxsSGFuZGxlciA9IChjYWxsKSA9PiB7XHJcbiAgICByZXR1cm4gY2FudmFzQ2FsbEhhbmRsZXJzW2NhbGwubWV0aG9kXSB8fCBjYW52YXNDYWxsSGFuZGxlcnNbY2FsbC5hdHRyXSB8fCBudWxsQ2FudmFzQ2FsbEhhbmRsZXI7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aEZpbGxTaGFwZUhhbmRsZXIgPSAoc2hhcGUpID0+IHtcclxuICAgIHJldHVybiBwYXRoRmlsbFNoYXBlSGFuZGxlcnNbc2hhcGUudHlwZV07XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGF0aFN0cm9rZVNoYXBlSGFuZGxlciA9IChzaGFwZSkgPT4ge1xyXG4gICAgcmV0dXJuIHBhdGhTdHJva2VTaGFwZUhhbmRsZXJzW3NoYXBlLnR5cGVdO1xyXG4gIH0sXHJcblxyXG4gIHByZUNhbnZhc0NhbGxIYW5kbGVyID0gKHN0YXRlKSA9PiB7XHJcbiAgICBzdGF0ZS50cmFuc2Zvcm0gPSB0b3RhbFRyYW5zZm9ybShmbGF0dGVuKHN0YXRlLnRyYW5zZm9ybXMpKTtcclxuICAgIHN0YXRlLmxpbmVXaWR0aCA9IGxhc3RFbGVtZW50KHN0YXRlLmxpbmVXaWR0aHMpO1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH0sXHJcblxyXG4gIGdldEJCb3ggPSAoc2hhcGUpID0+IHtcclxuICAgIHZhciBzdGF0ZSA9IGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSgpO1xyXG4gICAgc3RhdGUgPSBzaGFwZS5yZWR1Y2UoKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciBoYW5kbGVyID0gZ2V0Q2FudmFzQ2FsbEhhbmRsZXIoY2FsbCk7XHJcbiAgICAgIHJldHVybiBoYW5kbGVyKHByZUNhbnZhc0NhbGxIYW5kbGVyKHN0YXRlKSwgY2FsbCk7XHJcbiAgICB9LCBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUoKSk7XHJcbiAgICByZXR1cm4gc3RhdGUuYm94O1xyXG4gIH0sXHJcblxyXG4gIGZsYXR0ZW4gPSAoYXJyYXkpID0+IHtcclxuICAgIHJldHVybiBhcnJheVxyXG4gICAgICAucmVkdWNlKChwcmV2aW91c0FycmF5LCBjdXJyZW50QXJyYXkpID0+IHtcclxuICAgICAgICByZXR1cm4gcHJldmlvdXNBcnJheS5jb25jYXQoY3VycmVudEFycmF5KTtcclxuICAgICAgfSwgW10pO1xyXG4gIH0sXHJcblxyXG4gIGxhc3RFbGVtZW50ID0gKGFycmF5KSA9PiB7XHJcbiAgICByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XHJcbiAgfSxcclxuXHJcbiAgZmlyc3RUcnV0aHlPclplcm8gPSAodmFsMSwgdmFsMikgPT57XHJcbiAgICBpZiAodmFsMSB8fCB2YWwxID09PSAwKSB7XHJcbiAgICAgIHJldHVybiB2YWwxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbDI7XHJcbiAgfSxcclxuXHJcbiAgdW5pb24gPSAoYm94MSwgYm94MikgPT4ge1xyXG4gICAgYm94MSA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gxLndpZHRoLCBib3gyLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLmhlaWdodCwgYm94Mi5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgYm94MiA9IHtcclxuICAgICAgeDogZmlyc3RUcnV0aHlPclplcm8oYm94Mi54LCBib3gxLngpLFxyXG4gICAgICB5OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLnksIGJveDEueSksXHJcbiAgICAgIHdpZHRoOiBmaXJzdFRydXRoeU9yWmVybyhib3gyLndpZHRoLCBib3gxLndpZHRoKSxcclxuICAgICAgaGVpZ2h0OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLmhlaWdodCwgYm94MS5oZWlnaHQpXHJcbiAgICB9O1xyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgeDogTWF0aC5taW4oYm94MS54LCBib3gyLngpLFxyXG4gICAgICB5OiBNYXRoLm1pbihib3gxLnksIGJveDIueSksXHJcbiAgICAgIHdpZHRoOiBNYXRoLm1heChib3gxLndpZHRoLCBib3gyLndpZHRoLCBib3gxLnggPCBib3gyLnhcclxuICAgICAgICA/IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDIueCAtIChib3gxLnggKyBib3gxLndpZHRoKSlcclxuICAgICAgICA6IGJveDEud2lkdGggKyBib3gyLndpZHRoICsgKGJveDEueCAtIChib3gyLnggKyBib3gyLndpZHRoKSkpLFxyXG4gICAgICBoZWlnaHQ6IE1hdGgubWF4KGJveDEuaGVpZ2h0LCBib3gyLmhlaWdodCwgYm94MS55IDwgYm94Mi55XHJcbiAgICAgICAgPyBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDIueSAtIChib3gxLnkgKyBib3gxLmhlaWdodCkpXHJcbiAgICAgICAgOiBib3gxLmhlaWdodCArIGJveDIuaGVpZ2h0ICsgKGJveDEueSAtIChib3gyLnkgKyBib3gyLmhlaWdodCkpKVxyXG4gICAgfTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSxcclxuXHJcbiAgdG90YWxUcmFuc2Zvcm0gPSAodHJhbnNmb3JtcykgPT4ge1xyXG4gICAgcmV0dXJuIHRyYW5zZm9ybXNcclxuICAgICAgLm1hcCgodmFsdWUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHJhbnNsYXRlOiB2YWx1ZS50cmFuc2xhdGUgfHwge3g6IDAsIHk6IDB9LFxyXG4gICAgICAgICAgc2NhbGU6IHZhbHVlLnNjYWxlIHx8IHt4OiAxLCB5OiAxfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pXHJcbiAgICAgIC5yZWR1Y2UoKHByZXZpb3VzVmFsdWUsIGN1cnJlbnRWYWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0cmFuc2xhdGU6IHtcclxuICAgICAgICAgICAgeDogcHJldmlvdXNWYWx1ZS50cmFuc2xhdGUueCArIGN1cnJlbnRWYWx1ZS50cmFuc2xhdGUueCAqIHByZXZpb3VzVmFsdWUuc2NhbGUueCxcclxuICAgICAgICAgICAgeTogcHJldmlvdXNWYWx1ZS50cmFuc2xhdGUueSArIGN1cnJlbnRWYWx1ZS50cmFuc2xhdGUueSAqIHByZXZpb3VzVmFsdWUuc2NhbGUueVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNjYWxlOiB7XHJcbiAgICAgICAgICAgIHg6IHByZXZpb3VzVmFsdWUuc2NhbGUueCAqIGN1cnJlbnRWYWx1ZS5zY2FsZS54LFxyXG4gICAgICAgICAgICB5OiBwcmV2aW91c1ZhbHVlLnNjYWxlLnkgKiBjdXJyZW50VmFsdWUuc2NhbGUueVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sIHt0cmFuc2xhdGU6IHt4OiAwLCB5OiAwfSwgc2NhbGU6IHt4OiAxLCB5OiAxfX0pO1xyXG4gIH0sXHJcblxyXG4gIGdldFJlY3RBcm91bmRMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCB3aWR0aCkgPT4ge1xyXG4gICAgdmFyIHJlY3Q7XHJcbiAgICBpZiAoeDEgPT09IHkxICYmIHgxID09PSB4MiAmJiB4MSA9PT0geTIpIHtcclxuICAgICAgcmVjdCA9IHtcclxuICAgICAgICB4MTogeDEsIHkxOiB4MSwgIHgyOiB4MSwgeTI6IHgxLFxyXG4gICAgICAgIHg0OiB4MSwgeTQ6IHgxLCAgeDM6IHgxLCB5MzogeDFcclxuICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlY3QgPSBnZXRSZWN0QXJvdW5kTG9uZ0xpbmUoeDEsIHkxLCB4MiwgeTIsIHdpZHRoKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZWN0O1xyXG4gIH0sXHJcblxyXG4gIGdldFJlY3RBcm91bmRMb25nTGluZSA9ICh4MSwgeTEsIHgyLCB5Miwgd2lkdGgpID0+IHtcclxuICAgIC8vICByID0gdGhlIHJhZGl1cyBvciB0aGUgZ2l2ZW4gZGlzdGFuY2UgZnJvbSBhIGdpdmVuIHBvaW50IHRvIHRoZSBuZWFyZXN0IGNvcm5lcnMgb2YgdGhlIHJlY3RcclxuICAgIC8vICBhID0gdGhlIGFuZ2xlIGJldHdlZW4gdGhlIGxpbmUgYW5kIHRoZSBob3Jpem9udGFsIGF4aXNcclxuICAgIC8vICBiMSwgYjIgPSB0aGUgYW5nbGUgYmV0d2VlbiBoYWxmIHRoZSBoaWdodCBvZiB0aGUgcmVjdGFuZ2xlIGFuZCB0aGUgaG9yaXpvbnRhbCBheGlzXHJcbiAgICAvL1xyXG4gICAgLy8gIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSB0aGUgZ2l2ZW4gbGluZSBpcyBob3Jpem9udGFsLCBzbyBhID0gMC5cclxuICAgIC8vICBUaGUgZ2l2ZW4gbGluZSBpcyBiZXR3ZWVuIHRoZSB0d28gQCBzeW1ib2xzLlxyXG4gICAgLy8gIFRoZSArIHN5bWJvbHMgYXJlIHRoZSBjb3JuZXJzIG9mIHJlY3RhbmdsZSB0byBiZSBkZXRlcm1pbmVkLlxyXG4gICAgLy8gIEluIG9yZGVyIHRvIGZpbmQgdGhlIGIxIGFuZCBiMiBhbmdsZXMgd2UgaGF2ZSB0byBhZGQgUEkvMiBhbmQgcmVzcGVjdGl2bHkgc3VidHJhY3QgUEkvMi5cclxuICAgIC8vICBiMSBpcyB2ZXJ0aWNhbCBhbmQgcG9pbnRpbmcgdXB3b3JkcyBhbmQgYjIgaXMgYWxzbyB2ZXJ0aWNhbCBidXQgcG9pbnRpbmcgZG93bndvcmRzLlxyXG4gICAgLy8gIEVhY2ggY29ybmVyIGlzIHIgb3Igd2lkdGggLyAyIGZhciBhd2F5IGZyb20gaXRzIGNvcmVzcG9uZGVudCBsaW5lIGVuZGluZy5cclxuICAgIC8vICBTbyB3ZSBrbm93IHRoZSBkaXN0YW5jZSAociksIHRoZSBzdGFydGluZyBwb2ludHMgKHgxLCB5MSkgYW5kICh4MiwgeTIpIGFuZCB0aGUgKGIxLCBiMikgZGlyZWN0aW9ucy5cclxuICAgIC8vXHJcbiAgICAvLyAgKHgxLHkxKSAgICAgICAgICAgICAgICAgICAgKHgyLHkyKVxyXG4gICAgLy8gICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xyXG4gICAgLy8gICAgICBeICAgICAgICAgICAgICAgICAgICAgICAgXlxyXG4gICAgLy8gICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gICAgLy8gICAgICB8IGIxICAgICAgICAgICAgICAgICAgICAgfCBiMVxyXG4gICAgLy8gICAgICBAPT09PT09PT09PT09PT09PT09PT09PT09QFxyXG4gICAgLy8gICAgICB8IGIyICAgICAgICAgICAgICAgICAgICAgfCBiMlxyXG4gICAgLy8gICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gICAgLy8gICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgdlxyXG4gICAgLy8gICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xyXG4gICAgLy8gICh4NCx5NCkgICAgICAgICAgICAgICAgICAgICh4Myx5MylcclxuICAgIC8vXHJcblxyXG4gICAgdmFyIHIgPSB3aWR0aCAvIDIsXHJcbiAgICAgIGEgPSBNYXRoLmF0YW4oKHkyIC0geTEpIC8gKHgyIC0geDEpKSxcclxuICAgICAgYjEgPSBhICsgTWF0aC5QSS8yLFxyXG4gICAgICBiMiA9IGEgLSBNYXRoLlBJLzIsXHJcbiAgICAgIHJ4MSA9IHIgKiBNYXRoLmNvcyhiMSkgKyB4MSxcclxuICAgICAgcnkxID0gciAqIE1hdGguc2luKGIxKSArIHkxLFxyXG4gICAgICByeDIgPSByICogTWF0aC5jb3MoYjEpICsgeDIsXHJcbiAgICAgIHJ5MiA9IHIgKiBNYXRoLnNpbihiMSkgKyB5MixcclxuICAgICAgcngzID0gciAqIE1hdGguY29zKGIyKSArIHgyLFxyXG4gICAgICByeTMgPSByICogTWF0aC5zaW4oYjIpICsgeTIsXHJcbiAgICAgIHJ4NCA9IHIgKiBNYXRoLmNvcyhiMikgKyB4MSxcclxuICAgICAgcnk0ID0gciAqIE1hdGguc2luKGIyKSArIHkxO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDE6IHJ4MSwgeTE6IHJ5MSwgIHgyOiByeDIsIHkyOiByeTIsXHJcbiAgICAgIHg0OiByeDQsIHk0OiByeTQsICB4MzogcngzLCB5MzogcnkzXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIGdldFNjYWxlZFdpZHRoT2ZMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCBzeCwgc3ksIHdpZHRoKSA9PiB7XHJcbiAgICAvLyAgVGhlIG9yaWdpbmFsIHBvaW50cyBhcmUgbm90IG1vdmVkLiBPbmx5IHRoZSB3aWR0aCB3aWxsIGJlIHNjYWxlZC5cclxuICAgIC8vICBUaGUgd2lkdGggb2YgYW4gaG9yaXpvbnRhbCBsaW5lIHdpbGwgYmUgc2NhbGVkIHdpdGggdGhlIHN5IHJhdGlvIG9ubHkuXHJcbiAgICAvLyAgVGhlIHdpZHRoIG9mIGEgdmVydGl2YWwgbGluZSB3aWxsIGJlIHNjYWxlZCB3aXRoIHRoZSBzeCByYXRpbyBvbmx5LlxyXG4gICAgLy8gIFRoZSB3aWR0aCBvZiBhbiBvYmxpcXVlIGxpbmUgd2lsbCBiZSBzY2FsZWQgd2l0aCBib3RoIHRoZSBzeCBhbmQgc3lcclxuICAgIC8vYnV0IHByb3BvcnRpb25hbCB3aXRoIHRoZSBhbmdsZSBiZXR3ZWVuIHRoZSBsaW5lIGFuZCB0aGUgeCBhbmQgeSBheGVzLlxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cXFxyXG4gICAgLy8gICAgICAgICAgICAgICAuXFwgICh4Mix5MikgICAgICAgICAgICAgICAgICAgICAgICAgLi4uXFwgICh4Mix5MilcclxuICAgIC8vICAgICAgICAgICAgICAuLi5AICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4uLkBcclxuICAgIC8vICAgICAgICAgICAgIC4uLi8uXFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4uLi8uXFxcclxuICAgIC8vICAgICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICAgc3ggICAgICAgICAgICAgLi4uLi4vLi4uXFxcclxuICAgIC8vICAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgKy0tLT4gICAgICAgICAgICAuLi4uLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgLi4uLi4vLi4uLi5cclxuICAgIC8vICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgIFxcLi4uLy4uLi4uXHJcbiAgICAvLyAgICAgICAgIFxcLi8uLi4gICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgIFxcLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAgQC4uLiAgICAgICAgICAgICBzeSB2ICAgICAgICAgICAgICAgICBALi4uLi5cclxuICAgIC8vICAoeDEseTEpICBcXC4gICAgICAgICAgICAgICAgICAgICAgICAgICAoeDEseTEpICBcXC4uLlxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcLlxyXG4gICAgLy9cclxuICAgIHZhciBhID0gTWF0aC5hdGFuKCh5MiAtIHkxKSAvICh4MiAtIHgxKSksXHJcbiAgICAgIHNpbmEgPSBNYXRoLnNpbihhKSwgY29zYSA9IE1hdGguY29zKGEpLFxyXG4gICAgICBzY2FsZWRXaWR0aCA9IHdpZHRoICogTWF0aC5zcXJ0KHN4KnN4ICogc2luYSpzaW5hICsgc3kqc3kgKiBjb3NhKmNvc2EpO1xyXG4gICAgcmV0dXJuIHNjYWxlZFdpZHRoO1xyXG4gIH0sXHJcblxyXG4gIGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQgPSAoeDEsIHkxLCB4MiwgeTIsIGRpc3RhbmNlKSA9PiB7XHJcbiAgICB2YXIgcmVjdCA9IGdldFJlY3RBcm91bmRMb25nTGluZSh4MSwgeTEsIHgyLCB5MiwgMiAqIGRpc3RhbmNlKTtcclxuICAgIHJldHVybiBbXHJcbiAgICAgIHt4MTogcmVjdC54MSwgeTE6IHJlY3QueTEsIHgyOiByZWN0LngyLCB5MjogcmVjdC55Mn0sXHJcbiAgICAgIHt4MTogcmVjdC54NCwgeTE6IHJlY3QueTQsIHgyOiByZWN0LngzLCB5MjogcmVjdC55M31cclxuICAgIF07XHJcbiAgfSxcclxuXHJcbiAgZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcyA9IChsMSwgbDIpID0+IHtcclxuICAgIHZhciBhMSA9IGwxLnkyIC0gbDEueTEsIGIxID0gbDEueDEgLSBsMS54MiwgYzEgPSBsMS54MipsMS55MSAtIGwxLngxKmwxLnkyLFxyXG4gICAgICAgIGEyID0gbDIueTIgLSBsMi55MSwgYjIgPSBsMi54MSAtIGwyLngyLCBjMiA9IGwyLngyKmwyLnkxIC0gbDIueDEqbDIueTIsXHJcbiAgICAgICAgeCA9IChjMipiMSAtIGMxKmIyKSAvIChhMSpiMiAtIGEyKmIxKSxcclxuICAgICAgICB5ID0gbDIueTEgPT09IGwyLnkyID8gbDIueTEgOiAoLWMxIC0gYTEqeCkgLyBiMTtcclxuICAgIHJldHVybiB7eDogeCwgeTogeX07XHJcbiAgfSxcclxuXHJcbiAgZ2V0RGlzdGFuY2VCZXR3ZWVuVHdvUG9pbnRzID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCh4Mi14MSkqKHgyLXgxKSArICh5Mi15MSkqKHkyLXkxKSk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMgPSAoeDEsIHkxLCB4MiwgeTIsIHgzLCB5MykgPT4ge1xyXG4gICAgdmFyIGEgPSBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMoeDEsIHkxLCB4MiwgeTIpLFxyXG4gICAgICAgIGIgPSBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMoeDIsIHkyLCB4MywgeTMpLFxyXG4gICAgICAgIGMgPSBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMoeDMsIHkzLCB4MSwgeTEpLFxyXG4gICAgICAgIGNvc0MgPSAoYSphICsgYipiIC0gYypjKSAvICgyKmEqYiksXHJcbiAgICAgICAgQyA9IE1hdGguYWNvcyhjb3NDKTtcclxuICAgIHJldHVybiBDO1xyXG4gIH0sXHJcblxyXG4gIHBlcm11dGVMaW5lcyA9IChhbHBoYUxpbmVzLCBiZXRhTGluZXMpID0+IHtcclxuICAgIHZhciBwZXJtdXRhdGlvbnMgPSBbXTtcclxuICAgIGFscGhhTGluZXMuZm9yRWFjaCgoYWxwaGFMaW5lKSA9PiB7XHJcbiAgICAgIGJldGFMaW5lcy5mb3JFYWNoKChiZXRhTGluZSkgPT4ge1xyXG4gICAgICAgIHBlcm11dGF0aW9ucy5wdXNoKHthbHBoYTogYWxwaGFMaW5lLCBiZXRhOiBiZXRhTGluZX0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbiAgICByZXR1cm4gcGVybXV0YXRpb25zO1xyXG4gIH0sXHJcblxyXG4gIGFsbW9zdEVxdWFsID0gKGEsIGIpID0+IHtcclxuICAgIC8vIGdyb3NzIGFwcHJveGltYXRpb24gdG8gY292ZXIgdGhlIGZsb3QgYW5kIHRyaWdvbm9tZXRyaWMgcHJlY2lzaW9uXHJcbiAgICByZXR1cm4gYSA9PT0gYiB8fCBNYXRoLmFicyhhIC0gYikgPCAyMCAqIEVQU0lMT047XHJcbiAgfSxcclxuXHJcbiAgaXNDZW50ZXJJbkJldHdlZW4gPSAoY3gsIGN5LCB4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSA9PiB7XHJcbiAgICB2YXIgYTEgPSBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyhjeCwgY3ksIHgxLCB5MSwgeDAsIHkwKSxcclxuICAgICAgICBhMiA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzKGN4LCBjeSwgeDEsIHkxLCB4MiwgeTIpO1xyXG4gICAgcmV0dXJuIGFsbW9zdEVxdWFsKGExLCBhMikgJiYgYTEgPD0gTWF0aC5QSSAvIDI7XHJcbiAgfSxcclxuXHJcbiAgZ2V0VGhlQ2VudGVyT2ZUaGVDb3JuZXIgPSAoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiwgZGlzdGFuY2UpID0+IHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQgIGRcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICBhbHBoYSBsaW5lIDAgICAgLS0tLS0tLS0tLS0tLSctLS8tLSctLS0tLS0tLS1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICcgICAgICAgICAgICAgZFxyXG4gICAgLy8gICAgIGdpdmVuIGxpbmUgICAgPT09UD09PT09PT09PT1QPT09PT09PT09PT09PT1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnICAgICAgICAgICAgICAgZFxyXG4gICAgLy8gICBhbHBoYSBsaW5lIDEgICAgLS0tLS0tLS0tQy0tLy0tJy0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICcgIFAgICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy9cclxuICAgIC8vICAgICBiZXRhIGxpbmVzIDAgJiAxIHdpdGggb25lIG9mIHRoZSBnaXZlbiBsaW5lIGluYmV0d2VlblxyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgUCA9IHRoZSBnaXZlbiBQMCwgUDEsIFAyIHBvaW50c1xyXG4gICAgLy9cclxuICAgIC8vICBkID0gdGhlIGdpdmVuIGRpc3RhbmNlIC8gcmFkaXVzIG9mIHRoZSBjaXJjbGVcclxuICAgIC8vXHJcbiAgICAvLyAgQyA9IHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZS9jb3JuZXIgdG8gYmUgZGV0ZXJtaW5lZFxyXG5cclxuICAgIHZhciBhbHBoYUxpbmVzID0gZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCh4MCwgeTAsIHgxLCB5MSwgZGlzdGFuY2UpLFxyXG4gICAgICAgIGJldGFMaW5lcyA9IGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQoeDEsIHkxLCB4MiwgeTIsIGRpc3RhbmNlKSxcclxuICAgICAgICBwZXJtdXRhdGlvbnMgPSBwZXJtdXRlTGluZXMoYWxwaGFMaW5lcywgYmV0YUxpbmVzKSxcclxuICAgICAgICBpbnRlcnNlY3Rpb25zID0gcGVybXV0YXRpb25zLm1hcCgocCkgPT4gZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcyhwLmFscGhhLCBwLmJldGEpKSxcclxuICAgICAgICBjZW50ZXIgPSBpbnRlcnNlY3Rpb25zLmZpbHRlcigoaSkgPT4gaXNDZW50ZXJJbkJldHdlZW4oaS54LCBpLnksIHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpKVswXTtcclxuXHJcbiAgICByZXR1cm4gY2VudGVyIHx8IHt4OiBOYU4sIHk6IE5hTn07XHJcbiAgfSxcclxuXHJcbiAgZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhciA9ICh4MSwgeTEsIHgyLCB5MiwgY3gsIGN5KSA9PiB7XHJcbiAgICB2YXIgbSA9ICh5MiAtIHkxKSAvICh4MiAtIHgxKSxcclxuICAgICAgICBjbSA9IC0xIC8gbSxcclxuICAgICAgICBDID0geTEqKHgyIC0geDEpIC0geDEqKHkyIC0geTEpLFxyXG4gICAgICAgIHggPSAoQyAtICh4MiAtIHgxKSooY3kgLSBjbSpjeCkpIC8gKGNtKih4MiAtIHgxKSArIHkxIC0geTIpLFxyXG4gICAgICAgIHkgPSBjbSooeCAtIGN4KSArIGN5O1xyXG4gICAgcmV0dXJuIG0gPT09IDAgLy8gaG9yaXpvbnRhbFxyXG4gICAgICA/IHt4OiBjeCwgeTogeTF9XHJcbiAgICAgIDogKG0gPT09IEluZmluaXR5IC8vIHZlcnRpY2FsXHJcbiAgICAgICAgPyB7eDogeDEsIHk6IGN5fVxyXG4gICAgICAgIDoge3g6IHgsIHk6IHl9KTtcclxuICB9LFxyXG5cclxuICB4eVRvQXJjQW5nbGUgPSAoY3gsIGN5LCB4LCB5KSA9PiB7XHJcbiAgICB2YXIgaG9yaXpvbnRhbFggPSBjeCArIDEsXHJcbiAgICAgICAgaG9yaXpvbnRhbFkgPSBjeSxcclxuICAgICAgICBhID0gTWF0aC5hYnMoZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoeCwgeSwgY3gsIGN5LCBob3Jpem9udGFsWCwgaG9yaXpvbnRhbFkpKTtcclxuICAgIGlmKHkgPCBjeSkge1xyXG4gICAgICAvL3RoaXJkICYgZm9ydGggcXVhZHJhbnRzXHJcbiAgICAgIGEgPSBNYXRoLlBJICsgTWF0aC5QSSAtIGE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYTtcclxuICB9LFxyXG5cclxuICBjb2xsaW5lYXIgPSAoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MikgPT4ge1xyXG4gICAgdmFyIG0xID0gKHkxIC0geTApIC8gKHgxIC0geDApLFxyXG4gICAgICAgIG0yID0gKHkyIC0geTEpIC8gKHgyIC0geDEpO1xyXG4gICAgcmV0dXJuIGFsbW9zdEVxdWFsKG0xLCBtMik7XHJcbiAgfSxcclxuXHJcbiAgZGVjb21wb3NlQXJjVG8gPSAoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiwgcikgPT4ge1xyXG4gICAgdmFyIGRlY29tcG9zaXRpb24gPSB7XHJcbiAgICAgIHBvaW50OiB7eDogeDEsIHk6IHkxfVxyXG4gICAgfTtcclxuICAgIGlmKGNvbGxpbmVhcih4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSkge1xyXG4gICAgICBkZWNvbXBvc2l0aW9uLmxpbmUgPSB7eDE6IHgwLCB5MTogeTAsIHgyOiB4MSwgeTI6IHkxfTtcclxuICAgIH0gZWxzZSBpZiAoIWlzTmFOKHgwKSAmJiAhaXNOYU4oeTApKSB7XHJcbiAgICAgIHZhciBjZW50ZXIgPSBnZXRUaGVDZW50ZXJPZlRoZUNvcm5lcih4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCByKSxcclxuICAgICAgICAgIGZvb3QxID0gZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhcih4MCwgeTAsIHgxLCB5MSwgY2VudGVyLngsIGNlbnRlci55KSxcclxuICAgICAgICAgIGZvb3QyID0gZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhcih4MSwgeTEsIHgyLCB5MiwgY2VudGVyLngsIGNlbnRlci55KSxcclxuICAgICAgICAgIGFuZ2xlRm9vdDEgPSB4eVRvQXJjQW5nbGUoY2VudGVyLngsIGNlbnRlci55LCBmb290MS54LCBmb290MS55KSxcclxuICAgICAgICAgIGFuZ2xlRm9vdDIgPSB4eVRvQXJjQW5nbGUoY2VudGVyLngsIGNlbnRlci55LCBmb290Mi54LCBmb290Mi55KSxcclxuICAgICAgICAgIHNBbmdsZSA9IE1hdGguYWJzKGFuZ2xlRm9vdDIgLSBhbmdsZUZvb3QxKSA8IE1hdGguUEkgPyBhbmdsZUZvb3QyIDogYW5nbGVGb290MSxcclxuICAgICAgICAgIGVBbmdsZSA9IE1hdGguYWJzKGFuZ2xlRm9vdDIgLSBhbmdsZUZvb3QxKSA8IE1hdGguUEkgPyBhbmdsZUZvb3QxIDogYW5nbGVGb290MjtcclxuICAgICAgaWYgKCFpc05hTihjZW50ZXIueCkgJiYgIWlzTmFOKGNlbnRlci55KSkge1xyXG4gICAgICAgIGRlY29tcG9zaXRpb24ubGluZSA9IHt4MTogeDAsIHkxOiB5MCwgeDI6IGZvb3QxLngsIHkyOiBmb290MS55fTtcclxuICAgICAgICBkZWNvbXBvc2l0aW9uLmFyYyA9IHt4OiBjZW50ZXIueCwgeTogY2VudGVyLnksIHI6IHIsIHNBbmdsZTogc0FuZ2xlLCBlQW5nbGU6IGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZTogZmFsc2V9O1xyXG4gICAgICAgIGRlY29tcG9zaXRpb24ucG9pbnQgPSB7eDogZm9vdDIueCwgeTogZm9vdDIueX07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBkZWNvbXBvc2l0aW9uO1xyXG4gIH0sXHJcblxyXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjc1MjcyNS9maW5kaW5nLXdoZXRoZXItYS1wb2ludC1saWVzLWluc2lkZS1hLXJlY3RhbmdsZS1vci1ub3RcclxuICBpc1BvaW50SW5zaWRlUmVjdGFuZ2xlID0gKHBvaW50LCByZWN0YW5nbGUpID0+IHtcclxuICAgIHZhciBzZWdtZW50cyA9IFt7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSB9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHR9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodCxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0fSwge1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHQsXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55XHJcbiAgICB9XTtcclxuXHJcbiAgICB2YXIgaXNJbnNpZGUgPSBzZWdtZW50cy5tYXAoKHNlZ21lbnQpID0+IHtcclxuICAgICAgdmFyIEEgPSAtKHNlZ21lbnQueTIgLSBzZWdtZW50LnkxKSxcclxuICAgICAgICBCID0gc2VnbWVudC54MiAtIHNlZ21lbnQueDEsXHJcbiAgICAgICAgQyA9IC0oQSAqIHNlZ21lbnQueDEgKyBCICogc2VnbWVudC55MSksXHJcbiAgICAgICAgRCA9IEEgKiBwb2ludC54ICsgQiAqIHBvaW50LnkgKyBDO1xyXG4gICAgICAgIHJldHVybiBEO1xyXG4gICAgfSkuZXZlcnkoKEQpID0+IHtcclxuICAgICAgcmV0dXJuIEQgPiAwO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGlzSW5zaWRlO1xyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLmdldEJCb3ggPSBnZXRCQm94O1xyXG4gIHRoaXMudW5pb24gPSB1bmlvbjtcclxuICB0aGlzLnRvdGFsVHJhbnNmb3JtID0gdG90YWxUcmFuc2Zvcm07XHJcbiAgdGhpcy5nZXRSZWN0QXJvdW5kTGluZSA9IGdldFJlY3RBcm91bmRMaW5lO1xyXG4gIHRoaXMuZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCA9IGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQ7XHJcbiAgdGhpcy5nZXRJbnRlcnNlY3Rpb25PZlR3b0xpbmVzID0gZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcztcclxuICB0aGlzLmdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzID0gZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHM7XHJcbiAgdGhpcy5nZXRUaGVDZW50ZXJPZlRoZUNvcm5lciA9IGdldFRoZUNlbnRlck9mVGhlQ29ybmVyO1xyXG4gIHRoaXMuZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhciA9IGdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXI7XHJcbiAgdGhpcy54eVRvQXJjQW5nbGUgPSB4eVRvQXJjQW5nbGU7XHJcbiAgdGhpcy5kZWNvbXBvc2VBcmNUbyA9IGRlY29tcG9zZUFyY1RvO1xyXG4gIHRoaXMuaXNQb2ludEluc2lkZVJlY3RhbmdsZSA9IGlzUG9pbnRJbnNpZGVSZWN0YW5nbGU7XHJcblxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJ5LmpzJ1xyXG5pbXBvcnQgeyBDdXN0b21NYXRjaGVycyB9IGZyb20gJy4vY3VzdG9tTWF0Y2hlcnMuanMnXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFJhYmJpdChnZW9tZXRyeSwgbWF0Y2hlcnMpIHtcclxuXHJcbiAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgZ2VvbWV0cnkgPSBnZW9tZXRyeSB8fCBuZXcgR2VvbWV0cnkoKSxcclxuICAgIG1hdGNoZXJzID0gbWF0Y2hlcnMgfHwgbmV3IEN1c3RvbU1hdGNoZXJzKCk7XHJcblxyXG5cclxuICB2YXIgZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzID0gKHNoYXBlLCB3aGVyZSkgPT4ge1xyXG4gICAgdmFyIGZvdW5kID0gW10sIGluZGV4ID0gMDtcclxuICAgIGRvIHtcclxuICAgICAgaW5kZXggPSB0aGF0LmZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzKHNoYXBlLCB3aGVyZSwgaW5kZXgpO1xyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgZm91bmQucHVzaCh3aGVyZS5zbGljZShpbmRleCwgaW5kZXggKyBzaGFwZS5sZW5ndGgpKTtcclxuICAgICAgICBpbmRleCArPSBzaGFwZS5sZW5ndGg7XHJcbiAgICAgIH1cclxuICAgIH0gd2hpbGUgKGluZGV4ICE9PSAtMSAmJiBpbmRleCA8IHdoZXJlLmxlbmd0aCk7XHJcbiAgICByZXR1cm4gZm91bmQ7XHJcbiAgfSxcclxuXHJcbiAgZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMgPSAoc2hhcGUsIHdoZXJlLCBzdGFydEluZGV4KSA9PiB7XHJcbiAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCB8fCAwO1xyXG4gICAgdmFyIG1hdGNoID0gZmFsc2UsIGluZGV4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gc3RhcnRJbmRleDsgaSA8PSB3aGVyZS5sZW5ndGggLSBzaGFwZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBtYXRjaCA9IHRydWU7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2hhcGUubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBpZiAod2hlcmVbaSArIGpdLm1ldGhvZCAhPT0gc2hhcGVbal0ubWV0aG9kKSB7XHJcbiAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChtYXRjaCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGluZGV4O1xyXG4gIH0sXHJcblxyXG4gIHJlbW92ZVNoYXBlcyA9IChzaGFwZXMsIGZyb20pID0+IHtcclxuICAgIHZhciBjb3B5ID0gZnJvbS5zbGljZSgwLCBmcm9tLmxlbmd0aCk7XHJcbiAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcclxuICAgICAgdmFyIGluZGV4ID0gLTE7XHJcbiAgICAgIGRvIHtcclxuICAgICAgICBpbmRleCA9IHRoYXQuZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMoc2hhcGUsIGNvcHkpO1xyXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgIGNvcHkuc3BsaWNlKGluZGV4LCBzaGFwZS5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSB3aGlsZSAoaW5kZXggIT09IC0xKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvcHk7XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMuZ2V0QkJveCA9IGdlb21ldHJ5LmdldEJCb3g7XHJcbiAgdGhpcy5jdXN0b21NYXRjaGVycyA9IG1hdGNoZXJzO1xyXG4gIHRoaXMuZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzID0gZmluZEFsbFNoYXBlc0lnbm9yaW5nQXJndW1lbnRzO1xyXG4gIHRoaXMuZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHMgPSBmaW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cztcclxuICB0aGlzLnJlbW92ZVNoYXBlcyA9IHJlbW92ZVNoYXBlcztcclxuXHJcbn1cclxuIl19
