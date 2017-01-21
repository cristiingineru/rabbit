require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Comparators = Comparators;
function Comparators() {

  var sameValues = function sameValues(val1, val2, precision) {
    var same = false;
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      same = val1.toFixed(precision) === val2.toFixed(precision);
    } else {
      same = val1 === val2;
    }
    return same;
  },
      sameCalls = function sameCalls(call1, call2, opt) {
    var ignoreArguments = opt.ignoreArguments,
        precision = opt.precision,
        same;
    if (call1.method && call2.method && call1.method === call2.method || call1.attr && call2.attr && call1.attr === call2.attr) {
      if (ignoreArguments) {
        same = true;
      } else {
        if (call1.attr) {
          same = sameValues(call1.val, call2.val, precision);
        } else {
          same = call1.arguments.length === call2.arguments.length;
          same &= call1.arguments.reduce(function (prev, arg, index) {
            return prev && sameValues(arg, call2.arguments[index], precision);
          }, true);
        }
      }
    }
    return same;
  };

  this.sameValues = sameValues;
  this.sameCalls = sameCalls;
}

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CustomMatchers = CustomMatchers;

var _geometry = require('./geometry.js');

var _comparators = require('./comparators.js');

function CustomMatchers(geometry, comparators) {

  geometry = geometry || new _geometry.Geometry();
  comparators = comparators || new _comparators.Comparators();

  var toBePartOf = function toBePartOf(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected, opt) {
        opt = Object.assign({
          ignoreArguments: true,
          precision: 0
        }, opt || {});
        var match = false;
        for (var i = 0; i < expected.length - actual.length + 1; i++) {
          match = actual.length > 0;
          for (var j = 0; j < actual.length; j++) {
            if (!comparators.sameCalls(expected[i + j], actual[j], opt)) {
              match = false;
              break;
            }
          }
          if (match === true) {
            break;
          }
        }
        var validArguments = actual && actual.length > 0 && expected && expected.length > 0,
            how = opt.ignoreArguments ? 'ignoring the arguments' : 'comparing the arguments with precision ' + opt.precision,
            result = !validArguments ? { pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected } : match ? { pass: true } : { pass: false, message: 'Shape of length ' + actual.length + ' not part of shape of length ' + expected.length + ' ' + how };
        return result;
      }
    };
  },
      toBeInsideTheAreaOf = function toBeInsideTheAreaOf(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected, opt) {
        opt = Object.assign({
          checkTheCenterOnly: false
        }, opt || {});
        var validArguments = actual && actual.length > 0 && expected && expected.length > 0,
            smallShape = actual,
            bigShape = expected,
            bigShapeBBox = geometry.getBBox(bigShape),
            smallShapeBBox = geometry.getBBox(smallShape),
            smallShapeCorners = cornersOfABox(smallShapeBBox),
            isAnyCornerOutside = smallShapeCorners.reduce(function (prev, corner) {
          return prev |= !geometry.isPointInsideRectangle(corner, bigShapeBBox);
        }, false),
            center = { x: smallShapeBBox.x + smallShapeBBox.width / 2, y: smallShapeBBox.y + smallShapeBBox.height / 2 },
            isCenterInside = geometry.isPointInsideRectangle(center, bigShapeBBox),
            what = opt.checkTheCenterOnly ? 'center' : 'corners',
            result = !validArguments ? { pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected } : !isAnyCornerOutside || opt.checkTheCenterOnly && isCenterInside ? { pass: true } : { pass: false, message: 'The ' + what + ' of the ' + JSON.stringify(smallShapeBBox) + ' not inside ' + JSON.stringify(bigShapeBBox) };
        return result;
      }
    };
  },
      toHaveTheSamePositionWith = function toHaveTheSamePositionWith(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected, opt) {
        opt = Object.assign({
          precision: 0
        }, opt || {});
        var validArguments = actual && actual.length > 0 && expected && expected.length > 0,
            actualBBox = geometry.getBBox(actual),
            expectedBBox = geometry.getBBox(expected),
            haveTheSameX = comparators.sameValues(actualBBox.x, expectedBBox.x, opt.precision),
            haveTheSameY = comparators.sameValues(actualBBox.y, expectedBBox.y, opt.precision),
            haveTheSamePosition = haveTheSameX && haveTheSameY,
            result = !validArguments ? { pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected } : haveTheSamePosition ? { pass: true } : !haveTheSameX && !haveTheSameY ? { pass: false, message: 'Not the same x and y: ' + actualBBox.x + 'x' + actualBBox.y + ' vs. ' + expectedBBox.x + 'x' + expectedBBox.y + ' comparing with precision: ' + opt.precision } : !haveTheSameX ? { pass: false, message: 'Not the same x: ' + actualBBox.x + ' vs. ' + expectedBBox.x + ' comparing with precision: ' + opt.precision } : { pass: false, message: 'Not the same y: ' + actualBBox.y + ' vs. ' + expectedBBox.y + ' comparing with precision: ' + opt.precision };
        return result;
      }
    };
  },
      toHaveTheSameSizeWith = function toHaveTheSameSizeWith(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected, opt) {
        opt = Object.assign({
          precision: 0
        }, opt || {});
        var validArguments = actual && actual.length > 0 && expected && expected.length > 0,
            actualBBox = geometry.getBBox(actual),
            expectedBBox = geometry.getBBox(expected),
            haveTheSameWidth = comparators.sameValues(actualBBox.width, expectedBBox.width, opt.precision),
            haveTheSameHeight = comparators.sameValues(actualBBox.height, expectedBBox.height, opt.precision),
            haveTheSameSizes = haveTheSameWidth && haveTheSameHeight,
            result = !validArguments ? { pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected } : haveTheSameSizes ? { pass: true } : !haveTheSameWidth && !haveTheSameHeight ? { pass: false, message: 'Not the same width and height: ' + actualBBox.width + 'x' + actualBBox.height + ' vs. ' + expectedBBox.width + 'x' + expectedBBox.height + ' comparing with precision: ' + opt.precision } : !haveTheSameWidth ? { pass: false, message: 'Not the same width: ' + actualBBox.width + ' vs. ' + expectedBBox.width + ' comparing with precision: ' + opt.precision } : { pass: false, message: 'Not the same height: ' + actualBBox.height + ' vs. ' + expectedBBox.height + ' comparing with precision: ' + opt.precision };
        return result;
      }
    };
  },
      toBeHorizontallyAlignWith = function toBeHorizontallyAlignWith(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected, opt) {
        opt = Object.assign({
          compare: 'top',
          precision: 0
        }, opt || {});
        var validArguments = actual && actual.length > 0 && expected && expected.length > 0,
            actualBBox = geometry.getBBox(actual),
            expectedBBox = geometry.getBBox(expected),
            y1 = opt.compare === 'top' ? actualBBox.y : opt.compare === 'bottom' ? actualBBox.y + actualBBox.height : (actualBBox.y + actualBBox.height) / 2,
            y2 = opt.compare === 'top' ? expectedBBox.y : opt.compare === 'bottom' ? expectedBBox.y + expectedBBox.height : (expectedBBox.y + expectedBBox.height) / 2,
            haveTheSameAlignment = comparators.sameValues(y1, y2),
            result = !validArguments ? { pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected } : haveTheSameAlignment ? { pass: true } : { pass: false, message: 'Not the same horizontal ' + opt.compare + ' alignment: ' + y1 + ' and ' + y2 + ' comparing with precision: ' + opt.precision };
        return result;
      }
    };
  },
      toBeVerticallyAlignWith = function toBeVerticallyAlignWith(util, customEqualityTesters) {
    return {
      compare: function compare(actual, expected, opt) {
        opt = Object.assign({
          compare: 'left',
          precision: 0
        }, opt || {});
        var validArguments = actual && actual.length > 0 && expected && expected.length > 0,
            actualBBox = geometry.getBBox(actual),
            expectedBBox = geometry.getBBox(expected),
            x1 = opt.compare === 'left' ? actualBBox.x : opt.compare === 'right' ? actualBBox.x + actualBBox.width : (actualBBox.x + actualBBox.width) / 2,
            x2 = opt.compare === 'left' ? expectedBBox.x : opt.compare === 'right' ? expectedBBox.x + expectedBBox.width : (expectedBBox.x + expectedBBox.width) / 2,
            haveTheSameAlignment = comparators.sameValues(x1, x2),
            result = !validArguments ? { pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected } : haveTheSameAlignment ? { pass: true } : { pass: false, message: 'Not the same vertical ' + opt.compare + ' alignment: ' + x1 + ' and ' + x2 + ' comparing with precision: ' + opt.precision };
        return result;
      }
    };
  },
      cornersOfABox = function cornersOfABox(box) {
    return [{ x: box.x, y: box.y }, { x: box.x + box.width, y: box.y }, { x: box.x + box.width, y: box.y + box.height }, { x: box.x, y: box.y + box.height }];
  };

  this.toBePartOf = toBePartOf;
  this.toBeInsideTheAreaOf = toBeInsideTheAreaOf;
  this.toHaveTheSamePositionWith = toHaveTheSamePositionWith;
  this.toHaveTheSameSizeWith = toHaveTheSameSizeWith;
  this.toBeHorizontallyAlignWith = toBeHorizontallyAlignWith;
  this.toBeVerticallyAlignWith = toBeVerticallyAlignWith;
}

},{"./comparators.js":1,"./geometry.js":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Geometry = Geometry;
function Geometry() {

  var EPSILON = Number.EPSILON || 2.220446049250313e-16,
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
    var aa,
        //adjusted angle
    na = a % (2 * PI); //normalized angle
    if (sx === sy) {
      return r * sx;
    } else if (almostEqual(na, 0) || almostEqual(na, PI)) {
      return r * sx;
    } else if (almostEqual(na, PI / 2) || almostEqual(na, 3 * PI / 2)) {
      return r * sy;
    } else if (na < 1 * PI / 2) {
      aa = na;
      return r * (sx * (PI / 2 - aa) / (PI / 2) + sy * aa / (PI / 2));
    } else if (na < 2 * PI / 2) {
      aa = na - 1 * PI / 2;
      return r * (sx * aa / (PI / 2) + sy * (PI / 2 - aa) / (PI / 2));
    } else if (na < 3 * PI / 2) {
      aa = na - 2 * PI / 2;
      return r * (sx * (PI / 2 - aa) / (PI / 2) + sy * aa / (PI / 2));
    } else if (na < 4 * PI / 2) {
      aa = na - 3 * PI / 2;
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
      return D >= 0;
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

var _comparators = require('./comparators.js');

function Rabbit(geometry, matchers, comparators) {

  geometry = geometry || new _geometry.Geometry();
  matchers = matchers || new _customMatchers.CustomMatchers();
  comparators = comparators || new _comparators.Comparators();

  var findShapes = function findShapes(shape, where, opt) {
    opt = Object.assign({
      ignoreArguments: true,
      precision: 0,
      comparator: undefined
    }, opt || {});
    var found = [],
        index = 0,
        header,
        foundShape;
    do {
      index = findShape(shape, where, index, opt);
      if (index !== -1) {
        header = collectHeader(where, index - 1);
        foundShape = where.slice(index, index + shape.length);
        found.push(header.concat(foundShape));
        index += shape.length;
      }
    } while (index !== -1 && index < where.length);
    return found;
  },
      findShape = function findShape(shape, where, startIndex, opt) {
    startIndex = startIndex || 0;
    opt = opt || {};
    var match = false,
        index = -1,
        defaultComparator = comparators.sameCalls,
        comparator = opt.comparator || defaultComparator;
    if (Array.isArray(shape) && shape.length > 0 && Array.isArray(where) && where.length > 0) {
      for (var i = startIndex; i <= where.length - shape.length; i++) {
        match = true;
        for (var j = 0; j < shape.length; j++) {
          if (!comparator(shape[j], where[i + j], opt, defaultComparator)) {
            match = false;
            break;
          }
        }
        if (match === true) {
          index = i;
          break;
        }
      }
    }
    return index;
  },
      collectHeader = function collectHeader(stack, lastIndex) {
    var styles = [],
        call;
    for (var i = 0; i <= lastIndex; i++) {
      call = stack[i];
      if (isStyle(call) || isTransform(call)) {
        styles.push(call);
      }
    }
    return styles;
  },
      isStyle = function isStyle(call) {
    var styleNames = ['fillStyle', 'strokeStyle', 'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'lineCap', 'lineJoin', 'lineWidth', 'miterLimit', 'font', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation'];
    return styleNames.indexOf(call.attr) !== -1 ? true : false;
  },
      isTransform = function isTransform(call) {
    var transformNames = ['scale', 'translate', 'rotate', 'transform', 'setTransform', 'save', 'restore'];
    return transformNames.indexOf(call.method) !== -1 ? true : false;
  },
      removeShapes = function removeShapes(shapes, from) {
    var copy = from.slice(0, from.length);
    shapes.forEach(function (shape) {
      var index = -1;
      do {
        index = findShape(shape, copy);
        if (index !== -1) {
          copy.splice(index, shape.length);
        }
      } while (index !== -1);
    });
    return copy;
  };

  this.getBBox = geometry.getBBox;
  this.customMatchers = matchers;
  this.findShapes = findShapes;
  this.removeShapes = removeShapes;
}

},{"./comparators.js":1,"./customMatchers.js":2,"./geometry.js":3}]},{},["C:\\GitHub\\rabbit\\src\\rabbit.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGNvbXBhcmF0b3JzLmpzIiwic3JjXFxjdXN0b21NYXRjaGVycy5qcyIsInNyY1xcZ2VvbWV0cnkuanMiLCJzcmNcXHJhYmJpdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7OztRQUdnQixXLEdBQUEsVztBQUFULFNBQVMsV0FBVCxHQUF1Qjs7QUFHNUIsTUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsU0FBYixFQUEyQjtBQUMxQyxRQUFJLE9BQU8sS0FBWDtBQUNBLFFBQUksT0FBTyxJQUFQLEtBQWdCLFFBQWhCLElBQTRCLE9BQU8sSUFBUCxLQUFnQixRQUFoRCxFQUEwRDtBQUN4RCxhQUFPLEtBQUssT0FBTCxDQUFhLFNBQWIsTUFBNEIsS0FBSyxPQUFMLENBQWEsU0FBYixDQUFuQztBQUNELEtBRkQsTUFFTztBQUNMLGFBQU8sU0FBUyxJQUFoQjtBQUNEO0FBQ0QsV0FBTyxJQUFQO0FBQ0QsR0FSRDtBQUFBLE1BVUEsWUFBWSxTQUFaLFNBQVksQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEdBQWYsRUFBdUI7QUFDakMsUUFBSSxrQkFBa0IsSUFBSSxlQUExQjtBQUFBLFFBQ0ksWUFBWSxJQUFJLFNBRHBCO0FBQUEsUUFFSSxJQUZKO0FBR0EsUUFBSyxNQUFNLE1BQU4sSUFBZ0IsTUFBTSxNQUF0QixJQUFnQyxNQUFNLE1BQU4sS0FBaUIsTUFBTSxNQUF4RCxJQUNDLE1BQU0sSUFBTixJQUFjLE1BQU0sSUFBcEIsSUFBNEIsTUFBTSxJQUFOLEtBQWUsTUFBTSxJQUR0RCxFQUM2RDtBQUMzRCxVQUFJLGVBQUosRUFBcUI7QUFDbkIsZUFBTyxJQUFQO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsWUFBSSxNQUFNLElBQVYsRUFBZ0I7QUFDZCxpQkFBTyxXQUFXLE1BQU0sR0FBakIs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QUksVUFBVSxDQUFDLENBQWYsRUFBa0I7QUFDaEIsZUFBSyxNQUFMLENBQVksS0FBWixFQUFtQixNQUFNLE1BQXpCO0FBQ0Q7QUFDRixPQUxELFFBS1MsVUFBVSxDQUFDLENBTHBCO0FBTUQsS0FSRDtBQVNBLFdBQU8sSUFBUDtBQUNELEdBckZEOztBQXdGQSxPQUFLLE9BQUwsR0FBZSxTQUFTLE9BQXhCO0FBQ0EsT0FBSyxjQUFMLEdBQXNCLFFBQXRCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFVBQWxCO0FBQ0EsT0FBSyxZQUFMLEdBQW9CLFlBQXBCO0FBRUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIENvbXBhcmF0b3JzKCkge1xyXG5cclxuXHJcbiAgdmFyIHNhbWVWYWx1ZXMgPSAodmFsMSwgdmFsMiwgcHJlY2lzaW9uKSA9PiB7XHJcbiAgICB2YXIgc2FtZSA9IGZhbHNlO1xyXG4gICAgaWYgKHR5cGVvZiB2YWwxID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdmFsMiA9PT0gJ251bWJlcicpIHtcclxuICAgICAgc2FtZSA9IHZhbDEudG9GaXhlZChwcmVjaXNpb24pID09PSB2YWwyLnRvRml4ZWQocHJlY2lzaW9uKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNhbWUgPSB2YWwxID09PSB2YWwyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNhbWU7XHJcbiAgfSxcclxuXHJcbiAgc2FtZUNhbGxzID0gKGNhbGwxLCBjYWxsMiwgb3B0KSA9PiB7XHJcbiAgICB2YXIgaWdub3JlQXJndW1lbnRzID0gb3B0Lmlnbm9yZUFyZ3VtZW50cyxcclxuICAgICAgICBwcmVjaXNpb24gPSBvcHQucHJlY2lzaW9uLFxyXG4gICAgICAgIHNhbWU7XHJcbiAgICBpZiAoKGNhbGwxLm1ldGhvZCAmJiBjYWxsMi5tZXRob2QgJiYgY2FsbDEubWV0aG9kID09PSBjYWxsMi5tZXRob2QpIHx8XHJcbiAgICAgICAgKGNhbGwxLmF0dHIgJiYgY2FsbDIuYXR0ciAmJiBjYWxsMS5hdHRyID09PSBjYWxsMi5hdHRyKSkge1xyXG4gICAgICBpZiAoaWdub3JlQXJndW1lbnRzKSB7XHJcbiAgICAgICAgc2FtZSA9IHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGNhbGwxLmF0dHIpIHtcclxuICAgICAgICAgIHNhbWUgPSBzYW1lVmFsdWVzKGNhbGwxLnZhbCwgY2FsbDIudmFsLCBwcmVjaXNpb24pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW1lID0gY2FsbDEuYXJndW1lbnRzLmxlbmd0aCA9PT0gY2FsbDIuYXJndW1lbnRzLmxlbmd0aDtcclxuICAgICAgICAgIHNhbWUgJj0gY2FsbDEuYXJndW1lbnRzLnJlZHVjZShcclxuICAgICAgICAgICAgKHByZXYsIGFyZywgaW5kZXgpID0+IHByZXYgJiYgc2FtZVZhbHVlcyhhcmcsIGNhbGwyLmFyZ3VtZW50c1tpbmRleF0sIHByZWNpc2lvbiksXHJcbiAgICAgICAgICAgIHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNhbWU7XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMuc2FtZVZhbHVlcyA9IHNhbWVWYWx1ZXM7XHJcbiAgdGhpcy5zYW1lQ2FsbHMgPSBzYW1lQ2FsbHM7XHJcblxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJ5LmpzJ1xyXG5pbXBvcnQgeyBDb21wYXJhdG9ycyB9IGZyb20gJy4vY29tcGFyYXRvcnMuanMnXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEN1c3RvbU1hdGNoZXJzKGdlb21ldHJ5LCBjb21wYXJhdG9ycykge1xyXG5cclxuICBnZW9tZXRyeSA9IGdlb21ldHJ5IHx8IG5ldyBHZW9tZXRyeSgpO1xyXG4gIGNvbXBhcmF0b3JzID0gY29tcGFyYXRvcnMgfHwgbmV3IENvbXBhcmF0b3JzKClcclxuXHJcblxyXG4gIHZhciB0b0JlUGFydE9mID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQsIG9wdCkgPT4ge1xyXG4gICAgICAgIG9wdCA9IE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICAgICAgaWdub3JlQXJndW1lbnRzOiB0cnVlLFxyXG4gICAgICAgICAgcHJlY2lzaW9uOiAwXHJcbiAgICAgICAgfSwgb3B0IHx8IHt9KTtcclxuICAgICAgICB2YXIgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aCAtIGFjdHVhbC5sZW5ndGggKyAxOyBpKyspIHtcclxuICAgICAgICAgIG1hdGNoID0gYWN0dWFsLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFjdHVhbC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoIWNvbXBhcmF0b3JzLnNhbWVDYWxscyhleHBlY3RlZFtpICsgal0sIGFjdHVhbFtqXSwgb3B0KSkge1xyXG4gICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChtYXRjaCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHZhbGlkQXJndW1lbnRzID0gYWN0dWFsICYmIGFjdHVhbC5sZW5ndGggPiAwICYmIGV4cGVjdGVkICYmIGV4cGVjdGVkLmxlbmd0aCA+IDAsXHJcbiAgICAgICAgICBob3cgPSBvcHQuaWdub3JlQXJndW1lbnRzID8gJ2lnbm9yaW5nIHRoZSBhcmd1bWVudHMnIDogJ2NvbXBhcmluZyB0aGUgYXJndW1lbnRzIHdpdGggcHJlY2lzaW9uICcgKyBvcHQucHJlY2lzaW9uLFxyXG4gICAgICAgICAgcmVzdWx0ID0gIXZhbGlkQXJndW1lbnRzXHJcbiAgICAgICAgICAgID8ge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnSW52YWxpZCBzaGFwZShzKTogJyArIGFjdHVhbCArICcgYW5kICcgKyBleHBlY3RlZH1cclxuICAgICAgICAgICAgOiAobWF0Y2hcclxuICAgICAgICAgICAgICA/IHtwYXNzOiB0cnVlfVxyXG4gICAgICAgICAgICAgIDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGUgb2YgbGVuZ3RoICcgKyBhY3R1YWwubGVuZ3RoICsgJyBub3QgcGFydCBvZiBzaGFwZSBvZiBsZW5ndGggJyArIGV4cGVjdGVkLmxlbmd0aCArICcgJyArIGhvd30pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlSW5zaWRlVGhlQXJlYU9mID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQsIG9wdCkgPT4ge1xyXG4gICAgICAgIG9wdCA9IE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICAgICAgY2hlY2tUaGVDZW50ZXJPbmx5OiBmYWxzZVxyXG4gICAgICAgIH0sIG9wdCB8fCB7fSk7XHJcbiAgICAgICAgdmFyIHZhbGlkQXJndW1lbnRzID0gYWN0dWFsICYmIGFjdHVhbC5sZW5ndGggPiAwICYmIGV4cGVjdGVkICYmIGV4cGVjdGVkLmxlbmd0aCA+IDAsXHJcbiAgICAgICAgICBzbWFsbFNoYXBlID0gYWN0dWFsLFxyXG4gICAgICAgICAgYmlnU2hhcGUgPSBleHBlY3RlZCxcclxuICAgICAgICAgIGJpZ1NoYXBlQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYmlnU2hhcGUpLFxyXG4gICAgICAgICAgc21hbGxTaGFwZUJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KHNtYWxsU2hhcGUpLFxyXG4gICAgICAgICAgc21hbGxTaGFwZUNvcm5lcnMgPSBjb3JuZXJzT2ZBQm94KHNtYWxsU2hhcGVCQm94KSxcclxuICAgICAgICAgIGlzQW55Q29ybmVyT3V0c2lkZSA9IHNtYWxsU2hhcGVDb3JuZXJzXHJcbiAgICAgICAgICAgIC5yZWR1Y2UoKHByZXYsIGNvcm5lcikgPT4gcHJldiB8PSAhZ2VvbWV0cnkuaXNQb2ludEluc2lkZVJlY3RhbmdsZShjb3JuZXIsIGJpZ1NoYXBlQkJveCksIGZhbHNlKSxcclxuICAgICAgICAgIGNlbnRlciA9IHt4OiBzbWFsbFNoYXBlQkJveC54ICsgc21hbGxTaGFwZUJCb3gud2lkdGggLyAyLCB5OiBzbWFsbFNoYXBlQkJveC55ICsgc21hbGxTaGFwZUJCb3guaGVpZ2h0IC8gMn0sXHJcbiAgICAgICAgICBpc0NlbnRlckluc2lkZSA9IGdlb21ldHJ5LmlzUG9pbnRJbnNpZGVSZWN0YW5nbGUoY2VudGVyLCBiaWdTaGFwZUJCb3gpLFxyXG4gICAgICAgICAgd2hhdCA9IG9wdC5jaGVja1RoZUNlbnRlck9ubHkgPyAnY2VudGVyJyA6ICdjb3JuZXJzJyxcclxuICAgICAgICAgIHJlc3VsdCA9ICF2YWxpZEFyZ3VtZW50c1xyXG4gICAgICAgICAgICA/IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ0ludmFsaWQgc2hhcGUocyk6ICcgKyBhY3R1YWwgKyAnIGFuZCAnICsgZXhwZWN0ZWR9XHJcbiAgICAgICAgICAgIDogKCFpc0FueUNvcm5lck91dHNpZGUgfHwgKG9wdC5jaGVja1RoZUNlbnRlck9ubHkgJiYgaXNDZW50ZXJJbnNpZGUpXHJcbiAgICAgICAgICAgICAgPyB7cGFzczogdHJ1ZX1cclxuICAgICAgICAgICAgICA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1RoZSAnICsgd2hhdCArICcgb2YgdGhlICcgKyBKU09OLnN0cmluZ2lmeShzbWFsbFNoYXBlQkJveCkgKyAnIG5vdCBpbnNpZGUgJyArIEpTT04uc3RyaW5naWZ5KGJpZ1NoYXBlQkJveCl9KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9IYXZlVGhlU2FtZVBvc2l0aW9uV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkLCBvcHQpID0+IHtcclxuICAgICAgICBvcHQgPSBPYmplY3QuYXNzaWduKHtcclxuICAgICAgICAgIHByZWNpc2lvbjogMFxyXG4gICAgICAgIH0sIG9wdCB8fCB7fSk7XHJcbiAgICAgICAgdmFyIHZhbGlkQXJndW1lbnRzID0gYWN0dWFsICYmIGFjdHVhbC5sZW5ndGggPiAwICYmIGV4cGVjdGVkICYmIGV4cGVjdGVkLmxlbmd0aCA+IDAsXHJcbiAgICAgICAgICBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZVggPSBjb21wYXJhdG9ycy5zYW1lVmFsdWVzKGFjdHVhbEJCb3gueCwgZXhwZWN0ZWRCQm94LngsIG9wdC5wcmVjaXNpb24pLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVZID0gY29tcGFyYXRvcnMuc2FtZVZhbHVlcyhhY3R1YWxCQm94LnksIGV4cGVjdGVkQkJveC55LCBvcHQucHJlY2lzaW9uKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lUG9zaXRpb24gPSBoYXZlVGhlU2FtZVggJiYgaGF2ZVRoZVNhbWVZLFxyXG4gICAgICAgICAgcmVzdWx0ID0gIXZhbGlkQXJndW1lbnRzXHJcbiAgICAgICAgICAgID8ge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnSW52YWxpZCBzaGFwZShzKTogJyArIGFjdHVhbCArICcgYW5kICcgKyBleHBlY3RlZH1cclxuICAgICAgICAgICAgOiAoaGF2ZVRoZVNhbWVQb3NpdGlvblxyXG4gICAgICAgICAgICAgID8ge3Bhc3M6IHRydWV9XHJcbiAgICAgICAgICAgICAgOiAoIWhhdmVUaGVTYW1lWCAmJiAhaGF2ZVRoZVNhbWVZXHJcbiAgICAgICAgICAgICAgICA/IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ05vdCB0aGUgc2FtZSB4IGFuZCB5OiAnICsgYWN0dWFsQkJveC54ICsgJ3gnICsgYWN0dWFsQkJveC55ICsgJyB2cy4gJyArIGV4cGVjdGVkQkJveC54ICsgJ3gnICsgZXhwZWN0ZWRCQm94LnkgKyAnIGNvbXBhcmluZyB3aXRoIHByZWNpc2lvbjogJyArIG9wdC5wcmVjaXNpb259XHJcbiAgICAgICAgICAgICAgICA6ICghaGF2ZVRoZVNhbWVYXHJcbiAgICAgICAgICAgICAgICAgID8ge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnTm90IHRoZSBzYW1lIHg6ICcgKyBhY3R1YWxCQm94LnggKyAnIHZzLiAnICsgZXhwZWN0ZWRCQm94LnggKyAnIGNvbXBhcmluZyB3aXRoIHByZWNpc2lvbjogJyArIG9wdC5wcmVjaXNpb259XHJcbiAgICAgICAgICAgICAgICAgIDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnTm90IHRoZSBzYW1lIHk6ICcgKyBhY3R1YWxCQm94LnkgKyAnIHZzLiAnICsgZXhwZWN0ZWRCQm94LnkgKyAnIGNvbXBhcmluZyB3aXRoIHByZWNpc2lvbjogJyArIG9wdC5wcmVjaXNpb259KSkpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0hhdmVUaGVTYW1lU2l6ZVdpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0KSA9PiB7XHJcbiAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgICBwcmVjaXNpb246IDBcclxuICAgICAgICB9LCBvcHQgfHwge30pO1xyXG4gICAgICAgIHZhciB2YWxpZEFyZ3VtZW50cyA9IGFjdHVhbCAmJiBhY3R1YWwubGVuZ3RoID4gMCAmJiBleHBlY3RlZCAmJiBleHBlY3RlZC5sZW5ndGggPiAwLFxyXG4gICAgICAgICAgYWN0dWFsQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYWN0dWFsKSxcclxuICAgICAgICAgIGV4cGVjdGVkQkJveCA9IGdlb21ldHJ5LmdldEJCb3goZXhwZWN0ZWQpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVXaWR0aCA9IGNvbXBhcmF0b3JzLnNhbWVWYWx1ZXMoYWN0dWFsQkJveC53aWR0aCwgZXhwZWN0ZWRCQm94LndpZHRoLCBvcHQucHJlY2lzaW9uKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lSGVpZ2h0ID0gY29tcGFyYXRvcnMuc2FtZVZhbHVlcyhhY3R1YWxCQm94LmhlaWdodCwgZXhwZWN0ZWRCQm94LmhlaWdodCwgb3B0LnByZWNpc2lvbiksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZVNpemVzID0gaGF2ZVRoZVNhbWVXaWR0aCAmJiBoYXZlVGhlU2FtZUhlaWdodCxcclxuICAgICAgICAgIHJlc3VsdCA9ICF2YWxpZEFyZ3VtZW50c1xyXG4gICAgICAgICAgICA/IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ0ludmFsaWQgc2hhcGUocyk6ICcgKyBhY3R1YWwgKyAnIGFuZCAnICsgZXhwZWN0ZWR9XHJcbiAgICAgICAgICAgIDogKGhhdmVUaGVTYW1lU2l6ZXNcclxuICAgICAgICAgICAgICA/IHtwYXNzOiB0cnVlfVxyXG4gICAgICAgICAgICAgIDogKCFoYXZlVGhlU2FtZVdpZHRoICYmICFoYXZlVGhlU2FtZUhlaWdodFxyXG4gICAgICAgICAgICAgICAgPyB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdOb3QgdGhlIHNhbWUgd2lkdGggYW5kIGhlaWdodDogJyArIGFjdHVhbEJCb3gud2lkdGggKyAneCcgKyBhY3R1YWxCQm94LmhlaWdodCArICcgdnMuICcgKyBleHBlY3RlZEJCb3gud2lkdGggKyAneCcgKyBleHBlY3RlZEJCb3guaGVpZ2h0ICsgJyBjb21wYXJpbmcgd2l0aCBwcmVjaXNpb246ICcgKyBvcHQucHJlY2lzaW9ufVxyXG4gICAgICAgICAgICAgICAgOiAoIWhhdmVUaGVTYW1lV2lkdGhcclxuICAgICAgICAgICAgICAgICAgPyB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdOb3QgdGhlIHNhbWUgd2lkdGg6ICcgKyBhY3R1YWxCQm94LndpZHRoICsgJyB2cy4gJyArIGV4cGVjdGVkQkJveC53aWR0aCArICcgY29tcGFyaW5nIHdpdGggcHJlY2lzaW9uOiAnICsgb3B0LnByZWNpc2lvbn1cclxuICAgICAgICAgICAgICAgICAgOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdOb3QgdGhlIHNhbWUgaGVpZ2h0OiAnICsgYWN0dWFsQkJveC5oZWlnaHQgKyAnIHZzLiAnICsgZXhwZWN0ZWRCQm94LmhlaWdodCArICcgY29tcGFyaW5nIHdpdGggcHJlY2lzaW9uOiAnICsgb3B0LnByZWNpc2lvbn0pKSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0KSA9PiB7XHJcbiAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgICBjb21wYXJlOiAndG9wJyxcclxuICAgICAgICAgIHByZWNpc2lvbjogMFxyXG4gICAgICAgIH0sIG9wdCB8fCB7fSk7XHJcbiAgICAgICAgdmFyIHZhbGlkQXJndW1lbnRzID0gYWN0dWFsICYmIGFjdHVhbC5sZW5ndGggPiAwICYmIGV4cGVjdGVkICYmIGV4cGVjdGVkLmxlbmd0aCA+IDAsXHJcbiAgICAgICAgICBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICB5MSA9IG9wdC5jb21wYXJlID09PSAndG9wJ1xyXG4gICAgICAgICAgICA/IGFjdHVhbEJCb3gueVxyXG4gICAgICAgICAgICA6IChvcHQuY29tcGFyZSA9PT0gJ2JvdHRvbSdcclxuICAgICAgICAgICAgICA/IGFjdHVhbEJCb3gueSArIGFjdHVhbEJCb3guaGVpZ2h0XHJcbiAgICAgICAgICAgICAgOiAoYWN0dWFsQkJveC55ICsgYWN0dWFsQkJveC5oZWlnaHQpIC8gMiksXHJcbiAgICAgICAgICB5MiA9IG9wdC5jb21wYXJlID09PSAndG9wJ1xyXG4gICAgICAgICAgICA/IGV4cGVjdGVkQkJveC55XHJcbiAgICAgICAgICAgIDogKG9wdC5jb21wYXJlID09PSAnYm90dG9tJ1xyXG4gICAgICAgICAgICAgID8gZXhwZWN0ZWRCQm94LnkgKyBleHBlY3RlZEJCb3guaGVpZ2h0XHJcbiAgICAgICAgICAgICAgOiAoZXhwZWN0ZWRCQm94LnkgKyBleHBlY3RlZEJCb3guaGVpZ2h0KSAvIDIpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVBbGlnbm1lbnQgPSBjb21wYXJhdG9ycy5zYW1lVmFsdWVzKHkxLCB5MiksXHJcbiAgICAgICAgICByZXN1bHQgPSAhdmFsaWRBcmd1bWVudHNcclxuICAgICAgICAgICAgPyB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdJbnZhbGlkIHNoYXBlKHMpOiAnICsgYWN0dWFsICsgJyBhbmQgJyArIGV4cGVjdGVkfVxyXG4gICAgICAgICAgICA6IChoYXZlVGhlU2FtZUFsaWdubWVudFxyXG4gICAgICAgICAgICAgID8ge3Bhc3M6IHRydWV9XHJcbiAgICAgICAgICAgICAgOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdOb3QgdGhlIHNhbWUgaG9yaXpvbnRhbCAnICsgb3B0LmNvbXBhcmUgKyAnIGFsaWdubWVudDogJyArIHkxICsgJyBhbmQgJyArIHkyICsgJyBjb21wYXJpbmcgd2l0aCBwcmVjaXNpb246ICcgKyBvcHQucHJlY2lzaW9ufSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvQmVWZXJ0aWNhbGx5QWxpZ25XaXRoID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQsIG9wdCkgPT4ge1xyXG4gICAgICAgIG9wdCA9IE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICAgICAgY29tcGFyZTogJ2xlZnQnLFxyXG4gICAgICAgICAgcHJlY2lzaW9uOiAwXHJcbiAgICAgICAgfSwgb3B0IHx8IHt9KTtcclxuICAgICAgICB2YXIgdmFsaWRBcmd1bWVudHMgPSBhY3R1YWwgJiYgYWN0dWFsLmxlbmd0aCA+IDAgJiYgZXhwZWN0ZWQgJiYgZXhwZWN0ZWQubGVuZ3RoID4gMCxcclxuICAgICAgICAgIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIHgxID0gb3B0LmNvbXBhcmUgPT09ICdsZWZ0J1xyXG4gICAgICAgICAgICA/IGFjdHVhbEJCb3gueFxyXG4gICAgICAgICAgICA6IChvcHQuY29tcGFyZSA9PT0gJ3JpZ2h0J1xyXG4gICAgICAgICAgICAgID8gYWN0dWFsQkJveC54ICsgYWN0dWFsQkJveC53aWR0aFxyXG4gICAgICAgICAgICAgIDogKGFjdHVhbEJCb3gueCArIGFjdHVhbEJCb3gud2lkdGgpIC8gMiksXHJcbiAgICAgICAgICB4MiA9IG9wdC5jb21wYXJlID09PSAnbGVmdCdcclxuICAgICAgICAgICAgPyBleHBlY3RlZEJCb3gueFxyXG4gICAgICAgICAgICA6IChvcHQuY29tcGFyZSA9PT0gJ3JpZ2h0J1xyXG4gICAgICAgICAgICAgID8gZXhwZWN0ZWRCQm94LnggKyBleHBlY3RlZEJCb3gud2lkdGhcclxuICAgICAgICAgICAgICA6IChleHBlY3RlZEJCb3gueCArIGV4cGVjdGVkQkJveC53aWR0aCkgLyAyKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lQWxpZ25tZW50ID0gY29tcGFyYXRvcnMuc2FtZVZhbHVlcyh4MSwgeDIpLFxyXG4gICAgICAgICAgcmVzdWx0ID0gIXZhbGlkQXJndW1lbnRzXHJcbiAgICAgICAgICAgID8ge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnSW52YWxpZCBzaGFwZShzKTogJyArIGFjdHVhbCArICcgYW5kICcgKyBleHBlY3RlZH1cclxuICAgICAgICAgICAgOiAoaGF2ZVRoZVNhbWVBbGlnbm1lbnRcclxuICAgICAgICAgICAgICA/IHtwYXNzOiB0cnVlfVxyXG4gICAgICAgICAgICAgIDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnTm90IHRoZSBzYW1lIHZlcnRpY2FsICcgKyBvcHQuY29tcGFyZSArICcgYWxpZ25tZW50OiAnICsgeDEgKyAnIGFuZCAnICsgeDIgKyAnIGNvbXBhcmluZyB3aXRoIHByZWNpc2lvbjogJyArIG9wdC5wcmVjaXNpb259KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY29ybmVyc09mQUJveCA9IChib3gpID0+IHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgIHt4OiBib3gueCwgeTogYm94Lnl9LFxyXG4gICAgICB7eDogYm94LnggKyBib3gud2lkdGgsIHk6IGJveC55fSxcclxuICAgICAge3g6IGJveC54ICsgYm94LndpZHRoLCB5OiBib3gueSArIGJveC5oZWlnaHR9LFxyXG4gICAgICB7eDogYm94LngsIHk6IGJveC55ICsgYm94LmhlaWdodH1cclxuICAgIF07XHJcbiAgfTtcclxuXHJcblxyXG4gIHRoaXMudG9CZVBhcnRPZiA9IHRvQmVQYXJ0T2Y7XHJcbiAgdGhpcy50b0JlSW5zaWRlVGhlQXJlYU9mID0gdG9CZUluc2lkZVRoZUFyZWFPZjtcclxuICB0aGlzLnRvSGF2ZVRoZVNhbWVQb3NpdGlvbldpdGggPSB0b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoO1xyXG4gIHRoaXMudG9IYXZlVGhlU2FtZVNpemVXaXRoID0gdG9IYXZlVGhlU2FtZVNpemVXaXRoO1xyXG4gIHRoaXMudG9CZUhvcml6b250YWxseUFsaWduV2l0aCA9IHRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGg7XHJcbiAgdGhpcy50b0JlVmVydGljYWxseUFsaWduV2l0aCA9IHRvQmVWZXJ0aWNhbGx5QWxpZ25XaXRoO1xyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBHZW9tZXRyeSgpIHtcclxuXHJcbiAgdmFyIEVQU0lMT04gPSBOdW1iZXIuRVBTSUxPTiB8fCAyLjIyMDQ0NjA0OTI1MDMxM2UtMTYsXHJcbiAgICAgIFBJID0gTWF0aC5QSSxcclxuICAgICAgc2luID0gTWF0aC5zaW4sXHJcbiAgICAgIGNvcyA9IE1hdGguY29zO1xyXG5cclxuXHJcbiAgdmFyIGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSA9ICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGJveDoge3g6IE5hTiwgeTogTmFOLCB3aWR0aDogTmFOLCBoZWlnaHQ6IE5hTn0sXHJcbiAgICAgIHRyYW5zZm9ybXM6IFtbXV0sXHJcbiAgICAgIHNoYXBlc0luUGF0aDogW10sXHJcbiAgICAgIG1vdmVUb0xvY2F0aW9uOiB7eDogTmFOLCB5OiBOYU59LFxyXG4gICAgICBsaW5lV2lkdGhzOiBbMV1cclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgcGF0aEZpbGxTaGFwZUhhbmRsZXJzID0ge1xyXG4gICAgcmVjdDogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeCA9IHNoYXBlLngsXHJcbiAgICAgICAgeSA9IHNoYXBlLnksXHJcbiAgICAgICAgd2lkdGggPSBzaGFwZS53aWR0aCxcclxuICAgICAgICBoZWlnaHQgPSBzaGFwZS5oZWlnaHQsXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmM6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIGN4ID0gc2hhcGUuY3gsXHJcbiAgICAgICAgICBjeSA9IHNoYXBlLmN5LFxyXG4gICAgICAgICAgciA9IHNoYXBlLnIsXHJcbiAgICAgICAgICBzeCA9IHNoYXBlLnN4LFxyXG4gICAgICAgICAgc3kgPSBzaGFwZS5zeSxcclxuICAgICAgICAgIHNBbmdsZSA9IHNoYXBlLnNBbmdsZSxcclxuICAgICAgICAgIGVBbmdsZSA9IHNoYXBlLmVBbmdsZSxcclxuICAgICAgICAgIGNvdW50ZXJjbG9ja3dpc2UgPSBzaGFwZS5jb3VudGVyY2xvY2t3aXNlLFxyXG4gICAgICAgICAgYXJjQW5nbGVzID0gcmVsZXZhbnRBcmNBbmdsZXMociwgc0FuZ2xlLCBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2UpLFxyXG4gICAgICAgICAgc2NhbGVkQXJjUG9pbnRzID0gYXJjQW5nbGVzLm1hcCgoYSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgc3IgPSBzY2FsZWRSYWRpdXMociwgc3gsIHN5LCBhKTtcclxuICAgICAgICAgICAgcmV0dXJuIHt4OiBjeCArIHNyKmNvcyhhKSwgeTogY3kgKyBzcipzaW4oYSl9O1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICAgICBuZXdCb3ggPSBib3hQb2ludHMoc2NhbGVkQXJjUG9pbnRzKTtcclxuICAgICAgaWYgKCFpc05hTihjeCkgJiYgIWlzTmFOKGN5KSAmJiBhcmNBbmdsZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcGF0aFN0cm9rZVNoYXBlSGFuZGxlcnMgPSB7XHJcbiAgICByZWN0OiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gc2hhcGUueCxcclxuICAgICAgICB5ID0gc2hhcGUueSxcclxuICAgICAgICB3aWR0aCA9IHNoYXBlLndpZHRoLFxyXG4gICAgICAgIGhlaWdodCA9IHNoYXBlLmhlaWdodCxcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIHhTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICB5U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHggLSB4U2NhbGVkTGluZVdpZHRoICAvIDIsIHk6IHkgLSB5U2NhbGVkTGluZVdpZHRoIC8gMiwgd2lkdGg6IHdpZHRoICsgeFNjYWxlZExpbmVXaWR0aCwgaGVpZ2h0OiBoZWlnaHQgKyB5U2NhbGVkTGluZVdpZHRofTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBjeCA9IHNoYXBlLmN4LFxyXG4gICAgICAgICAgY3kgPSBzaGFwZS5jeSxcclxuICAgICAgICAgIHIgPSBzaGFwZS5yLFxyXG4gICAgICAgICAgc3ggPSBzaGFwZS5zeCxcclxuICAgICAgICAgIHN5ID0gc2hhcGUuc3ksXHJcbiAgICAgICAgICBzQW5nbGUgPSBzaGFwZS5zQW5nbGUsXHJcbiAgICAgICAgICBlQW5nbGUgPSBzaGFwZS5lQW5nbGUsXHJcbiAgICAgICAgICBjb3VudGVyY2xvY2t3aXNlID0gc2hhcGUuY291bnRlcmNsb2Nrd2lzZSxcclxuICAgICAgICAgIGFyY0FuZ2xlcyA9IHJlbGV2YW50QXJjQW5nbGVzKHNBbmdsZSwgZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlKSxcclxuICAgICAgICAgIHNjYWxlZEFyY1BvaW50cyA9IGZsYXR0ZW4oYXJjQW5nbGVzLm1hcCgoYSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHNjYWxlZFJhZGl1cyhzdGF0ZS5saW5lV2lkdGgsIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LCBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSwgYSksXHJcbiAgICAgICAgICAgICAgICBzaXIgPSBzY2FsZWRSYWRpdXMociwgc3gsIHN5LCBhKSAtIHcvMiwgLy8gaW5uZXIgcmFkaXVzXHJcbiAgICAgICAgICAgICAgICBzciA9IHNjYWxlZFJhZGl1cyhyLCBzeCwgc3ksIGEpLCAgICAvLyByYWRpdXNcclxuICAgICAgICAgICAgICAgIHNvciA9IHNjYWxlZFJhZGl1cyhyLCBzeCwgc3ksIGEpICsgdy8yLCAvLyBvdXRlciByYWRpdXNcclxuICAgICAgICAgICAgICAgIHBvaW50cyA9IFtdO1xyXG4gICAgICAgICAgICBpZiAodyA9PT0gMSkge1xyXG4gICAgICAgICAgICAgIHBvaW50cy5wdXNoKHt4OiBjeCArIHNyKmNvcyhhKSwgeTogY3kgKyBzcipzaW4oYSl9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwb2ludHMucHVzaCh7eDogY3ggKyBzaXIqY29zKGEpLCB5OiBjeSArIHNpcipzaW4oYSl9KTtcclxuICAgICAgICAgICAgICBwb2ludHMucHVzaCh7eDogY3ggKyBzb3IqY29zKGEpLCB5OiBjeSArIHNvcipzaW4oYSl9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcG9pbnRzO1xyXG4gICAgICAgICAgfSkpLFxyXG4gICAgICAgICAgbmV3Qm94ID0gYm94UG9pbnRzKHNjYWxlZEFyY1BvaW50cyk7XHJcbiAgICAgIGlmICghaXNOYU4oY3gpICYmICFpc05hTihjeSkgJiYgYXJjQW5nbGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGxpbmVUbzogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBzaGFwZS54MSxcclxuICAgICAgICB5MSA9IHNoYXBlLnkxLFxyXG4gICAgICAgIHgyID0gc2hhcGUueDIsXHJcbiAgICAgICAgeTIgPSBzaGFwZS55MixcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBnZXRTY2FsZWRXaWR0aE9mTGluZSh4MSwgeTEsIHgyLCB5Miwgc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LCBzdGF0ZS5saW5lV2lkdGgpLFxyXG4gICAgICAgIHJlY3QgPSBnZXRSZWN0QXJvdW5kTGluZSh4MSwgeTEsIHgyLCB5Miwgc2NhbGVkTGluZVdpZHRoICE9PSAxID8gc2NhbGVkTGluZVdpZHRoIDogMCksXHJcbiAgICAgICAgbmV3Qm94ID0ge1xyXG4gICAgICAgICAgeDogTWF0aC5taW4ocmVjdC54MSwgcmVjdC54MiwgcmVjdC54MywgcmVjdC54NCksXHJcbiAgICAgICAgICB5OiBNYXRoLm1pbihyZWN0LnkxLCByZWN0LnkyLCByZWN0LnkzLCByZWN0Lnk0KSxcclxuICAgICAgICAgIHdpZHRoOiBNYXRoLm1heChyZWN0LngxLCByZWN0LngyLCByZWN0LngzLCByZWN0Lng0KSAtIE1hdGgubWluKHJlY3QueDEsIHJlY3QueDIsIHJlY3QueDMsIHJlY3QueDQpLFxyXG4gICAgICAgICAgaGVpZ2h0OiBNYXRoLm1heChyZWN0LnkxLCByZWN0LnkyLCByZWN0LnkzLCByZWN0Lnk0KSAtIE1hdGgubWluKHJlY3QueTEsIHJlY3QueTIsIHJlY3QueTMsIHJlY3QueTQpXHJcbiAgICAgICAgfTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY2FudmFzQ2FsbEhhbmRsZXJzID0ge1xyXG4gICAgbGluZVdpZHRoOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUubGluZVdpZHRoc1tzdGF0ZS5saW5lV2lkdGhzLmxlbmd0aCAtIDFdID0gY2FsbC52YWw7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBmaWxsUmVjdDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICB3aWR0aCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgaGVpZ2h0ID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBuZXdCb3ggPSB7eDogeCwgeTogeSwgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHN0cm9rZVJlY3Q6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeCA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgd2lkdGggPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIGhlaWdodCA9IGNhbGwuYXJndW1lbnRzWzNdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgc2NhbGVkTGluZVdpZHRoID0gc3RhdGUubGluZVdpZHRoICE9PSAxID8gc3RhdGUubGluZVdpZHRoIDogMCxcclxuICAgICAgICB4U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgeVNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4IC0geFNjYWxlZExpbmVXaWR0aCAvIDIsIHk6IHkgLSB5U2NhbGVkTGluZVdpZHRoIC8gMiwgd2lkdGg6IHdpZHRoICsgeFNjYWxlZExpbmVXaWR0aCwgaGVpZ2h0OiBoZWlnaHQgKyB5U2NhbGVkTGluZVdpZHRofTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgcmVjdDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICB3aWR0aCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgaGVpZ2h0ID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueTtcclxuICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdyZWN0JywgeDogeCwgeTogeSwgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIGN4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICBjeSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnksXHJcbiAgICAgICAgciA9IGNhbGwuYXJndW1lbnRzWzJdLFxyXG4gICAgICAgIHN4ID0gc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgc3kgPSBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBzQW5nbGUgPSBjYWxsLmFyZ3VtZW50c1szXSxcclxuICAgICAgICBlQW5nbGUgPSBjYWxsLmFyZ3VtZW50c1s0XSxcclxuICAgICAgICBjb3VudGVyY2xvY2t3aXNlID0gY2FsbC5hcmd1bWVudHNbNV0gfHwgZmFsc2U7XHJcbiAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnYXJjJywgY3g6IGN4LCBjeTogY3ksIHI6IHIsIHN4OiBzeCwgc3k6IHN5LCBzQW5nbGU6IHNBbmdsZSwgZUFuZ2xlOiBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2U6IGNvdW50ZXJjbG9ja3dpc2V9KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIG1vdmVUbzogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4MSA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeTEgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55O1xyXG4gICAgICBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbiA9IHt4OiB4MSwgeTogeTF9O1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgbGluZVRvOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHgxID0gc3RhdGUubW92ZVRvTG9jYXRpb24ueCxcclxuICAgICAgICB5MSA9IHN0YXRlLm1vdmVUb0xvY2F0aW9uLnksXHJcbiAgICAgICAgeDIgPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkyID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueTtcclxuICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdsaW5lVG8nLCB4MTogeDEsIHkxOiB5MSwgeDI6IHgyLCB5MjogeTJ9KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyY1RvOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHgwID0gc3RhdGUubW92ZVRvTG9jYXRpb24ueCxcclxuICAgICAgICAgIHkwID0gc3RhdGUubW92ZVRvTG9jYXRpb24ueSxcclxuICAgICAgICAgIHgxID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICAgIHkxID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICAgIHgyID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICAgIHkyID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICAgIHIgPSBjYWxsLmFyZ3VtZW50c1s0XSxcclxuICAgICAgICAgIHN4ID0gc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgICBzeSA9IHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgICAgZGVjb21wb3NpdGlvbiA9IGRlY29tcG9zZUFyY1RvKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHIsIHN4LCBzeSk7XHJcbiAgICAgIGlmIChkZWNvbXBvc2l0aW9uLmxpbmUpIHtcclxuICAgICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2xpbmVUbycsIHgxOiBkZWNvbXBvc2l0aW9uLmxpbmUueDEsIHkxOiBkZWNvbXBvc2l0aW9uLmxpbmUueTEsIHgyOiBkZWNvbXBvc2l0aW9uLmxpbmUueDIsIHkyOiBkZWNvbXBvc2l0aW9uLmxpbmUueTJ9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZGVjb21wb3NpdGlvbi5hcmMpIHtcclxuICAgICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2FyYycsIGN4OiBkZWNvbXBvc2l0aW9uLmFyYy54LCBjeTogZGVjb21wb3NpdGlvbi5hcmMueSwgcjogciwgc3g6IHN4LCBzeTogc3ksIHNBbmdsZTogZGVjb21wb3NpdGlvbi5hcmMuc0FuZ2xlLCBlQW5nbGU6IGRlY29tcG9zaXRpb24uYXJjLmVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZTogZGVjb21wb3NpdGlvbi5hcmMuY291bnRlcmNsb2Nrd2lzZX0pO1xyXG4gICAgICB9XHJcbiAgICAgIHN0YXRlLm1vdmVUb0xvY2F0aW9uID0ge3g6IGRlY29tcG9zaXRpb24ucG9pbnQueCwgeTogZGVjb21wb3NpdGlvbi5wb2ludC55fTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHNhdmU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS50cmFuc2Zvcm1zLnB1c2goW10pO1xyXG4gICAgICBzdGF0ZS5saW5lV2lkdGhzLnB1c2gobGFzdEVsZW1lbnQoc3RhdGUubGluZVdpZHRocykpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgcmVzdG9yZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLnRyYW5zZm9ybXMucG9wKCk7XHJcbiAgICAgIHN0YXRlLmxpbmVXaWR0aHMucG9wKCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICB0cmFuc2xhdGU6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBsYXN0RWxlbWVudChzdGF0ZS50cmFuc2Zvcm1zKVxyXG4gICAgICAgIC5wdXNoKHt0cmFuc2xhdGU6IHt4OiBjYWxsLmFyZ3VtZW50c1swXSwgeTogY2FsbC5hcmd1bWVudHNbMV19fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBzY2FsZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIGxhc3RFbGVtZW50KHN0YXRlLnRyYW5zZm9ybXMpXHJcbiAgICAgICAgLnB1c2goe3NjYWxlOiB7eDogY2FsbC5hcmd1bWVudHNbMF0sIHk6IGNhbGwuYXJndW1lbnRzWzFdfX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYmVnaW5QYXRoOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoID0gW107XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBmaWxsOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgcmV0dXJuIHN0YXRlLnNoYXBlc0luUGF0aC5yZWR1Y2UoKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICAgIHZhciBoYW5kbGVyID0gZ2V0UGF0aEZpbGxTaGFwZUhhbmRsZXIoc2hhcGUpO1xyXG4gICAgICAgIHJldHVybiBoYW5kbGVyKHN0YXRlLCBzaGFwZSk7XHJcbiAgICAgIH0sIHN0YXRlKTtcclxuICAgIH0sXHJcbiAgICBzdHJva2U6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgc3RhdGUuc2hhcGVzSW5QYXRoLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHNoYXBlID0gc3RhdGUuc2hhcGVzSW5QYXRoW2ldLFxyXG4gICAgICAgICAgICBoYW5kbGVyID0gZ2V0UGF0aFN0cm9rZVNoYXBlSGFuZGxlcihzaGFwZSk7XHJcbiAgICAgICAgc3RhdGUgPSBoYW5kbGVyKHN0YXRlLCBzaGFwZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG51bGxDYW52YXNDYWxsSGFuZGxlciA9IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH0sXHJcblxyXG4gIGdldENhbnZhc0NhbGxIYW5kbGVyID0gKGNhbGwpID0+IHtcclxuICAgIHJldHVybiBjYW52YXNDYWxsSGFuZGxlcnNbY2FsbC5tZXRob2RdIHx8IGNhbnZhc0NhbGxIYW5kbGVyc1tjYWxsLmF0dHJdIHx8IG51bGxDYW52YXNDYWxsSGFuZGxlcjtcclxuICB9LFxyXG5cclxuICBnZXRQYXRoRmlsbFNoYXBlSGFuZGxlciA9IChzaGFwZSkgPT4ge1xyXG4gICAgcmV0dXJuIHBhdGhGaWxsU2hhcGVIYW5kbGVyc1tzaGFwZS50eXBlXTtcclxuICB9LFxyXG5cclxuICBnZXRQYXRoU3Ryb2tlU2hhcGVIYW5kbGVyID0gKHNoYXBlKSA9PiB7XHJcbiAgICByZXR1cm4gcGF0aFN0cm9rZVNoYXBlSGFuZGxlcnNbc2hhcGUudHlwZV07XHJcbiAgfSxcclxuXHJcbiAgcHJlQ2FudmFzQ2FsbEhhbmRsZXIgPSAoc3RhdGUpID0+IHtcclxuICAgIHN0YXRlLnRyYW5zZm9ybSA9IHRvdGFsVHJhbnNmb3JtKGZsYXR0ZW4oc3RhdGUudHJhbnNmb3JtcykpO1xyXG4gICAgc3RhdGUubGluZVdpZHRoID0gbGFzdEVsZW1lbnQoc3RhdGUubGluZVdpZHRocyk7XHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbiAgfSxcclxuXHJcbiAgZ2V0QkJveCA9IChzaGFwZSkgPT4ge1xyXG4gICAgdmFyIHN0YXRlID0gY3JlYXRlTmV3Q2FudmFzQ2FsbFN0YXRlKCk7XHJcbiAgICBzdGF0ZSA9IHNoYXBlLnJlZHVjZSgoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIGhhbmRsZXIgPSBnZXRDYW52YXNDYWxsSGFuZGxlcihjYWxsKTtcclxuICAgICAgcmV0dXJuIGhhbmRsZXIocHJlQ2FudmFzQ2FsbEhhbmRsZXIoc3RhdGUpLCBjYWxsKTtcclxuICAgIH0sIGNyZWF0ZU5ld0NhbnZhc0NhbGxTdGF0ZSgpKTtcclxuICAgIHJldHVybiBzdGF0ZS5ib3g7XHJcbiAgfSxcclxuXHJcbiAgZmxhdHRlbiA9IChhcnJheSkgPT4ge1xyXG4gICAgcmV0dXJuIGFycmF5XHJcbiAgICAgIC5yZWR1Y2UoKHByZXZpb3VzQXJyYXksIGN1cnJlbnRBcnJheSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBwcmV2aW91c0FycmF5LmNvbmNhdChjdXJyZW50QXJyYXkpO1xyXG4gICAgICB9LCBbXSk7XHJcbiAgfSxcclxuXHJcbiAgbGFzdEVsZW1lbnQgPSAoYXJyYXkpID0+IHtcclxuICAgIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcclxuICB9LFxyXG5cclxuICBmaXJzdFRydXRoeU9yWmVybyA9ICh2YWwxLCB2YWwyKSA9PntcclxuICAgIGlmICh2YWwxIHx8IHZhbDEgPT09IDApIHtcclxuICAgICAgcmV0dXJuIHZhbDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsMjtcclxuICB9LFxyXG5cclxuICB1bmlvbiA9IChib3gxLCBib3gyKSA9PiB7XHJcbiAgICBib3gxID0ge1xyXG4gICAgICB4OiBmaXJzdFRydXRoeU9yWmVybyhib3gxLngsIGJveDIueCksXHJcbiAgICAgIHk6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDEueSwgYm94Mi55KSxcclxuICAgICAgd2lkdGg6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDEud2lkdGgsIGJveDIud2lkdGgpLFxyXG4gICAgICBoZWlnaHQ6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDEuaGVpZ2h0LCBib3gyLmhlaWdodClcclxuICAgIH07XHJcbiAgICBib3gyID0ge1xyXG4gICAgICB4OiBmaXJzdFRydXRoeU9yWmVybyhib3gyLngsIGJveDEueCksXHJcbiAgICAgIHk6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDIueSwgYm94MS55KSxcclxuICAgICAgd2lkdGg6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDIud2lkdGgsIGJveDEud2lkdGgpLFxyXG4gICAgICBoZWlnaHQ6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDIuaGVpZ2h0LCBib3gxLmhlaWdodClcclxuICAgIH07XHJcbiAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICB4OiBNYXRoLm1pbihib3gxLngsIGJveDIueCksXHJcbiAgICAgIHk6IE1hdGgubWluKGJveDEueSwgYm94Mi55KSxcclxuICAgICAgd2lkdGg6IE1hdGgubWF4KGJveDEud2lkdGgsIGJveDIud2lkdGgsIGJveDEueCA8IGJveDIueFxyXG4gICAgICAgID8gYm94MS53aWR0aCArIGJveDIud2lkdGggKyAoYm94Mi54IC0gKGJveDEueCArIGJveDEud2lkdGgpKVxyXG4gICAgICAgIDogYm94MS53aWR0aCArIGJveDIud2lkdGggKyAoYm94MS54IC0gKGJveDIueCArIGJveDIud2lkdGgpKSksXHJcbiAgICAgIGhlaWdodDogTWF0aC5tYXgoYm94MS5oZWlnaHQsIGJveDIuaGVpZ2h0LCBib3gxLnkgPCBib3gyLnlcclxuICAgICAgICA/IGJveDEuaGVpZ2h0ICsgYm94Mi5oZWlnaHQgKyAoYm94Mi55IC0gKGJveDEueSArIGJveDEuaGVpZ2h0KSlcclxuICAgICAgICA6IGJveDEuaGVpZ2h0ICsgYm94Mi5oZWlnaHQgKyAoYm94MS55IC0gKGJveDIueSArIGJveDIuaGVpZ2h0KSkpXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9LFxyXG5cclxuICBib3hQb2ludHMgPSAocG9pbnRzKSA9PiB7XHJcbiAgICB2YXIgeGVzID0gcG9pbnRzLm1hcCgocCkgPT4gcC54KSxcclxuICAgICAgICB5ZXMgPSBwb2ludHMubWFwKChwKSA9PiBwLnkpLFxyXG4gICAgICAgIG1pblggPSBNYXRoLm1pbi5hcHBseShudWxsLCB4ZXMpLFxyXG4gICAgICAgIG1heFggPSBNYXRoLm1heC5hcHBseShudWxsLCB4ZXMpLFxyXG4gICAgICAgIG1pblkgPSBNYXRoLm1pbi5hcHBseShudWxsLCB5ZXMpLFxyXG4gICAgICAgIG1heFkgPSBNYXRoLm1heC5hcHBseShudWxsLCB5ZXMpLFxyXG4gICAgICAgIGJveCA9IHt4OiBOYU4sIHk6IE5hTiwgd2lkdGg6IE5hTiwgaGVpZ2h0OiBOYU59O1xyXG4gICAgaWYgKG1pblggIT09ICtJbmZpbml0eSAmJiBtYXhYICE9PSAtSW5maW5pdHkgJiYgbWluWSAhPT0gK0luZmluaXR5ICYmIG1heFkgIT09IC1JbmZpbml0eSkge1xyXG4gICAgICBib3ggPSB7XHJcbiAgICAgICAgeDogbWluWCxcclxuICAgICAgICB5OiBtaW5ZLFxyXG4gICAgICAgIHdpZHRoOiBtYXhYIC0gbWluWCxcclxuICAgICAgICBoZWlnaHQ6IG1heFkgLSBtaW5ZXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYm94O1xyXG4gIH0sXHJcblxyXG4gIHRvdGFsVHJhbnNmb3JtID0gKHRyYW5zZm9ybXMpID0+IHtcclxuICAgIHJldHVybiB0cmFuc2Zvcm1zXHJcbiAgICAgIC5tYXAoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRyYW5zbGF0ZTogdmFsdWUudHJhbnNsYXRlIHx8IHt4OiAwLCB5OiAwfSxcclxuICAgICAgICAgIHNjYWxlOiB2YWx1ZS5zY2FsZSB8fCB7eDogMSwgeTogMX1cclxuICAgICAgICB9O1xyXG4gICAgICB9KVxyXG4gICAgICAucmVkdWNlKChwcmV2aW91c1ZhbHVlLCBjdXJyZW50VmFsdWUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHJhbnNsYXRlOiB7XHJcbiAgICAgICAgICAgIHg6IHByZXZpb3VzVmFsdWUudHJhbnNsYXRlLnggKyBjdXJyZW50VmFsdWUudHJhbnNsYXRlLnggKiBwcmV2aW91c1ZhbHVlLnNjYWxlLngsXHJcbiAgICAgICAgICAgIHk6IHByZXZpb3VzVmFsdWUudHJhbnNsYXRlLnkgKyBjdXJyZW50VmFsdWUudHJhbnNsYXRlLnkgKiBwcmV2aW91c1ZhbHVlLnNjYWxlLnlcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzY2FsZToge1xyXG4gICAgICAgICAgICB4OiBwcmV2aW91c1ZhbHVlLnNjYWxlLnggKiBjdXJyZW50VmFsdWUuc2NhbGUueCxcclxuICAgICAgICAgICAgeTogcHJldmlvdXNWYWx1ZS5zY2FsZS55ICogY3VycmVudFZhbHVlLnNjYWxlLnlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9LCB7dHJhbnNsYXRlOiB7eDogMCwgeTogMH0sIHNjYWxlOiB7eDogMSwgeTogMX19KTtcclxuICB9LFxyXG5cclxuICBnZXRSZWN0QXJvdW5kTGluZSA9ICh4MSwgeTEsIHgyLCB5Miwgd2lkdGgpID0+IHtcclxuICAgIHZhciByZWN0O1xyXG4gICAgaWYgKHgxID09PSB5MSAmJiB4MSA9PT0geDIgJiYgeDEgPT09IHkyKSB7XHJcbiAgICAgIHJlY3QgPSB7XHJcbiAgICAgICAgeDE6IHgxLCB5MTogeDEsICB4MjogeDEsIHkyOiB4MSxcclxuICAgICAgICB4NDogeDEsIHk0OiB4MSwgIHgzOiB4MSwgeTM6IHgxXHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZWN0ID0gZ2V0UmVjdEFyb3VuZExvbmdMaW5lKHgxLCB5MSwgeDIsIHkyLCB3aWR0aCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVjdDtcclxuICB9LFxyXG5cclxuICBnZXRSZWN0QXJvdW5kTG9uZ0xpbmUgPSAoeDEsIHkxLCB4MiwgeTIsIHdpZHRoKSA9PiB7XHJcbiAgICAvLyAgciA9IHRoZSByYWRpdXMgb3IgdGhlIGdpdmVuIGRpc3RhbmNlIGZyb20gYSBnaXZlbiBwb2ludCB0byB0aGUgbmVhcmVzdCBjb3JuZXJzIG9mIHRoZSByZWN0XHJcbiAgICAvLyAgYSA9IHRoZSBhbmdsZSBiZXR3ZWVuIHRoZSBsaW5lIGFuZCB0aGUgaG9yaXpvbnRhbCBheGlzXHJcbiAgICAvLyAgYjEsIGIyID0gdGhlIGFuZ2xlIGJldHdlZW4gaGFsZiB0aGUgaGlnaHQgb2YgdGhlIHJlY3RhbmdsZSBhbmQgdGhlIGhvcml6b250YWwgYXhpc1xyXG4gICAgLy9cclxuICAgIC8vICBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUgdGhlIGdpdmVuIGxpbmUgaXMgaG9yaXpvbnRhbCwgc28gYSA9IDAuXHJcbiAgICAvLyAgVGhlIGdpdmVuIGxpbmUgaXMgYmV0d2VlbiB0aGUgdHdvIEAgc3ltYm9scy5cclxuICAgIC8vICBUaGUgKyBzeW1ib2xzIGFyZSB0aGUgY29ybmVycyBvZiByZWN0YW5nbGUgdG8gYmUgZGV0ZXJtaW5lZC5cclxuICAgIC8vICBJbiBvcmRlciB0byBmaW5kIHRoZSBiMSBhbmQgYjIgYW5nbGVzIHdlIGhhdmUgdG8gYWRkIFBJLzIgYW5kIHJlc3BlY3Rpdmx5IHN1YnRyYWN0IFBJLzIuXHJcbiAgICAvLyAgYjEgaXMgdmVydGljYWwgYW5kIHBvaW50aW5nIHVwd29yZHMgYW5kIGIyIGlzIGFsc28gdmVydGljYWwgYnV0IHBvaW50aW5nIGRvd253b3Jkcy5cclxuICAgIC8vICBFYWNoIGNvcm5lciBpcyByIG9yIHdpZHRoIC8gMiBmYXIgYXdheSBmcm9tIGl0cyBjb3Jlc3BvbmRlbnQgbGluZSBlbmRpbmcuXHJcbiAgICAvLyAgU28gd2Uga25vdyB0aGUgZGlzdGFuY2UgKHIpLCB0aGUgc3RhcnRpbmcgcG9pbnRzICh4MSwgeTEpIGFuZCAoeDIsIHkyKSBhbmQgdGhlIChiMSwgYjIpIGRpcmVjdGlvbnMuXHJcbiAgICAvL1xyXG4gICAgLy8gICh4MSx5MSkgICAgICAgICAgICAgICAgICAgICh4Mix5MilcclxuICAgIC8vICAgICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcclxuICAgIC8vICAgICAgXiAgICAgICAgICAgICAgICAgICAgICAgIF5cclxuICAgIC8vICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICAgIC8vICAgICAgfCBiMSAgICAgICAgICAgICAgICAgICAgIHwgYjFcclxuICAgIC8vICAgICAgQD09PT09PT09PT09PT09PT09PT09PT09PUBcclxuICAgIC8vICAgICAgfCBiMiAgICAgICAgICAgICAgICAgICAgIHwgYjJcclxuICAgIC8vICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICAgIC8vICAgICAgdiAgICAgICAgICAgICAgICAgICAgICAgIHZcclxuICAgIC8vICAgICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcclxuICAgIC8vICAoeDQseTQpICAgICAgICAgICAgICAgICAgICAoeDMseTMpXHJcbiAgICAvL1xyXG5cclxuICAgIHZhciByID0gd2lkdGggLyAyLFxyXG4gICAgICBhID0gTWF0aC5hdGFuKCh5MiAtIHkxKSAvICh4MiAtIHgxKSksXHJcbiAgICAgIGIxID0gYSArIE1hdGguUEkvMixcclxuICAgICAgYjIgPSBhIC0gTWF0aC5QSS8yLFxyXG4gICAgICByeDEgPSByICogTWF0aC5jb3MoYjEpICsgeDEsXHJcbiAgICAgIHJ5MSA9IHIgKiBNYXRoLnNpbihiMSkgKyB5MSxcclxuICAgICAgcngyID0gciAqIE1hdGguY29zKGIxKSArIHgyLFxyXG4gICAgICByeTIgPSByICogTWF0aC5zaW4oYjEpICsgeTIsXHJcbiAgICAgIHJ4MyA9IHIgKiBNYXRoLmNvcyhiMikgKyB4MixcclxuICAgICAgcnkzID0gciAqIE1hdGguc2luKGIyKSArIHkyLFxyXG4gICAgICByeDQgPSByICogTWF0aC5jb3MoYjIpICsgeDEsXHJcbiAgICAgIHJ5NCA9IHIgKiBNYXRoLnNpbihiMikgKyB5MTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHgxOiByeDEsIHkxOiByeTEsICB4MjogcngyLCB5MjogcnkyLFxyXG4gICAgICB4NDogcng0LCB5NDogcnk0LCAgeDM6IHJ4MywgeTM6IHJ5M1xyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBnZXRTY2FsZWRXaWR0aE9mTGluZSA9ICh4MSwgeTEsIHgyLCB5Miwgc3gsIHN5LCB3aWR0aCkgPT4ge1xyXG4gICAgLy8gIFRoZSBvcmlnaW5hbCBwb2ludHMgYXJlIG5vdCBtb3ZlZC4gT25seSB0aGUgd2lkdGggd2lsbCBiZSBzY2FsZWQuXHJcbiAgICAvLyAgVGhlIHdpZHRoIG9mIGFuIGhvcml6b250YWwgbGluZSB3aWxsIGJlIHNjYWxlZCB3aXRoIHRoZSBzeSByYXRpbyBvbmx5LlxyXG4gICAgLy8gIFRoZSB3aWR0aCBvZiBhIHZlcnRpdmFsIGxpbmUgd2lsbCBiZSBzY2FsZWQgd2l0aCB0aGUgc3ggcmF0aW8gb25seS5cclxuICAgIC8vICBUaGUgd2lkdGggb2YgYW4gb2JsaXF1ZSBsaW5lIHdpbGwgYmUgc2NhbGVkIHdpdGggYm90aCB0aGUgc3ggYW5kIHN5XHJcbiAgICAvL2J1dCBwcm9wb3J0aW9uYWwgd2l0aCB0aGUgYW5nbGUgYmV0d2VlbiB0aGUgbGluZSBhbmQgdGhlIHggYW5kIHkgYXhlcy5cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuXFxcclxuICAgIC8vICAgICAgICAgICAgICAgLlxcICAoeDIseTIpICAgICAgICAgICAgICAgICAgICAgICAgIC4uLlxcICAoeDIseTIpXHJcbiAgICAvLyAgICAgICAgICAgICAgLi4uQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uLi5AXHJcbiAgICAvLyAgICAgICAgICAgICAuLi4vLlxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uLi4vLlxcXHJcbiAgICAvLyAgICAgICAgICAgIC4uLi8uLi4gICAgICAgICAgICAgIHN4ICAgICAgICAgICAgIC4uLi4uLy4uLlxcXHJcbiAgICAvLyAgICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICstLS0+ICAgICAgICAgICAgLi4uLi4vLi4uLi5cclxuICAgIC8vICAgICAgICAgIC4uLi8uLi4gICAgICAgICAgICAgfCAgICAgICAgICAgICAgIC4uLi4uLy4uLi4uXHJcbiAgICAvLyAgICAgICAgIC4uLi8uLi4gICAgICAgICAgICAgIHwgICAgICAgICAgICAgICBcXC4uLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICBcXC4vLi4uICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICBcXC4vLi4uLi5cclxuICAgIC8vICAgICAgICAgIEAuLi4gICAgICAgICAgICAgc3kgdiAgICAgICAgICAgICAgICAgQC4uLi4uXHJcbiAgICAvLyAgKHgxLHkxKSAgXFwuICAgICAgICAgICAgICAgICAgICAgICAgICAgKHgxLHkxKSAgXFwuLi5cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXC5cclxuICAgIC8vXHJcbiAgICB2YXIgYSA9IE1hdGguYXRhbigoeTIgLSB5MSkgLyAoeDIgLSB4MSkpLFxyXG4gICAgICBzaW5hID0gTWF0aC5zaW4oYSksIGNvc2EgPSBNYXRoLmNvcyhhKSxcclxuICAgICAgc2NhbGVkV2lkdGggPSB3aWR0aCAqIE1hdGguc3FydChzeCpzeCAqIHNpbmEqc2luYSArIHN5KnN5ICogY29zYSpjb3NhKTtcclxuICAgIHJldHVybiBzY2FsZWRXaWR0aDtcclxuICB9LFxyXG5cclxuICBnZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50ID0gKHgxLCB5MSwgeDIsIHkyLCBkaXN0YW5jZSkgPT4ge1xyXG4gICAgdmFyIHJlY3QgPSBnZXRSZWN0QXJvdW5kTG9uZ0xpbmUoeDEsIHkxLCB4MiwgeTIsIDIgKiBkaXN0YW5jZSk7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICB7eDE6IHJlY3QueDEsIHkxOiByZWN0LnkxLCB4MjogcmVjdC54MiwgeTI6IHJlY3QueTJ9LFxyXG4gICAgICB7eDE6IHJlY3QueDQsIHkxOiByZWN0Lnk0LCB4MjogcmVjdC54MywgeTI6IHJlY3QueTN9XHJcbiAgICBdO1xyXG4gIH0sXHJcblxyXG4gIGdldEludGVyc2VjdGlvbk9mVHdvTGluZXMgPSAobDEsIGwyKSA9PiB7XHJcbiAgICB2YXIgYTEgPSBsMS55MiAtIGwxLnkxLCBiMSA9IGwxLngxIC0gbDEueDIsIGMxID0gbDEueDIqbDEueTEgLSBsMS54MSpsMS55MixcclxuICAgICAgICBhMiA9IGwyLnkyIC0gbDIueTEsIGIyID0gbDIueDEgLSBsMi54MiwgYzIgPSBsMi54MipsMi55MSAtIGwyLngxKmwyLnkyLFxyXG4gICAgICAgIHggPSAoYzIqYjEgLSBjMSpiMikgLyAoYTEqYjIgLSBhMipiMSksXHJcbiAgICAgICAgeSA9IGwyLnkxID09PSBsMi55MiA/IGwyLnkxIDogKC1jMSAtIGExKngpIC8gYjE7XHJcbiAgICByZXR1cm4ge3g6IHgsIHk6IHl9O1xyXG4gIH0sXHJcblxyXG4gIGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xyXG4gICAgcmV0dXJuIE1hdGguc3FydCgoeDIteDEpKih4Mi14MSkgKyAoeTIteTEpKih5Mi15MSkpO1xyXG4gIH0sXHJcblxyXG4gIGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzID0gKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMpID0+IHtcclxuICAgIHZhciBhID0gZ2V0RGlzdGFuY2VCZXR3ZWVuVHdvUG9pbnRzKHgxLCB5MSwgeDIsIHkyKSxcclxuICAgICAgICBiID0gZ2V0RGlzdGFuY2VCZXR3ZWVuVHdvUG9pbnRzKHgyLCB5MiwgeDMsIHkzKSxcclxuICAgICAgICBjID0gZ2V0RGlzdGFuY2VCZXR3ZWVuVHdvUG9pbnRzKHgzLCB5MywgeDEsIHkxKSxcclxuICAgICAgICBjb3NDID0gKGEqYSArIGIqYiAtIGMqYykgLyAoMiphKmIpLFxyXG4gICAgICAgIEMgPSBNYXRoLmFjb3MoY29zQyk7XHJcbiAgICByZXR1cm4gQztcclxuICB9LFxyXG5cclxuICBwZXJtdXRlTGluZXMgPSAoYWxwaGFMaW5lcywgYmV0YUxpbmVzKSA9PiB7XHJcbiAgICB2YXIgcGVybXV0YXRpb25zID0gW107XHJcbiAgICBhbHBoYUxpbmVzLmZvckVhY2goKGFscGhhTGluZSkgPT4ge1xyXG4gICAgICBiZXRhTGluZXMuZm9yRWFjaCgoYmV0YUxpbmUpID0+IHtcclxuICAgICAgICBwZXJtdXRhdGlvbnMucHVzaCh7YWxwaGE6IGFscGhhTGluZSwgYmV0YTogYmV0YUxpbmV9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIHBlcm11dGF0aW9ucztcclxuICB9LFxyXG5cclxuICBhbG1vc3RFcXVhbCA9IChhLCBiKSA9PiB7XHJcbiAgICAvLyBncm9zcyBhcHByb3hpbWF0aW9uIHRvIGNvdmVyIHRoZSBmbG90IGFuZCB0cmlnb25vbWV0cmljIHByZWNpc2lvblxyXG4gICAgcmV0dXJuIGEgPT09IGIgfHwgTWF0aC5hYnMoYSAtIGIpIDwgMjAgKiBFUFNJTE9OO1xyXG4gIH0sXHJcblxyXG4gIGlzQ2VudGVySW5CZXR3ZWVuID0gKGN4LCBjeSwgeDAsIHkwLCB4MSwgeTEsIHgyLCB5MikgPT4ge1xyXG4gICAgLy9cclxuICAgIC8vICBUcnVlIGlzIHJldHVybmVkIGluIHNpdHVhdGlvbnMgbGlrZSB0aGlzIG9uZTpcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgIC9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgIC9cclxuICAgIC8vICAgICAgICAgICAgICA9PT1QMD09PT09PT09PT1QMT09PT09PT09PT09PT1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgJyAgIC9cclxuICAgIC8vICAgICAgICAgICAgICAtLS0tLS0tLS1DLS0tLy0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgJyAgIFAyXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAnICAgL1xyXG4gICAgLy9cclxuICAgIHZhciBhID0gZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoeDIsIHkyLCB4MSwgeTEsIHgwLCB5MCksXHJcbiAgICAgICAgYTEgPSBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyhjeCwgY3ksIHgxLCB5MSwgeDAsIHkwKSxcclxuICAgICAgICBhMiA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzKGN4LCBjeSwgeDEsIHkxLCB4MiwgeTIpO1xyXG4gICAgcmV0dXJuIGFsbW9zdEVxdWFsKGEsIGExICsgYTIpICYmIChhMSArIGEyIDw9IE1hdGguUEkpO1xyXG4gIH0sXHJcblxyXG4gIGdldFRoZUNlbnRlck9mVGhlQ29ybmVyID0gKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIGRpc3RhbmNlLCBzeCwgc3kpID0+IHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQgIGRcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICBhbHBoYSBsaW5lIDAgICAgLS0tLS0tLS0tLS0tLSctLS8tLSctLS0tLS0tLS1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICcgICAgICAgICAgICAgZFxyXG4gICAgLy8gICAgIGdpdmVuIGxpbmUgICAgPT09UD09PT09PT09PT1QPT09PT09PT09PT09PT1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnICAgICAgICAgICAgICAgZFxyXG4gICAgLy8gICBhbHBoYSBsaW5lIDEgICAgLS0tLS0tLS0tQy0tLy0tJy0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICcgIFAgICdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy9cclxuICAgIC8vICAgICBiZXRhIGxpbmVzIDAgJiAxIHdpdGggb25lIG9mIHRoZSBnaXZlbiBsaW5lIGluYmV0d2VlblxyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgUCA9IHRoZSBnaXZlbiBQMCwgUDEsIFAyIHBvaW50c1xyXG4gICAgLy9cclxuICAgIC8vICBkID0gdGhlIGdpdmVuIGRpc3RhbmNlIC8gcmFkaXVzIG9mIHRoZSBjaXJjbGVcclxuICAgIC8vXHJcbiAgICAvLyAgQyA9IHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZS9jb3JuZXIgdG8gYmUgZGV0ZXJtaW5lZFxyXG5cclxuICAgIHZhciBkMSA9IGdldFNjYWxlZFdpZHRoT2ZMaW5lKHgwLCB5MCwgeDEsIHkxLCBzeCwgc3ksIGRpc3RhbmNlKSxcclxuICAgICAgICBkMiA9IGdldFNjYWxlZFdpZHRoT2ZMaW5lKHgxLCB5MSwgeDIsIHkyLCBzeCwgc3ksIGRpc3RhbmNlKSxcclxuICAgICAgICBhbHBoYUxpbmVzID0gZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCh4MCwgeTAsIHgxLCB5MSwgZDEpLFxyXG4gICAgICAgIGJldGFMaW5lcyA9IGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQoeDEsIHkxLCB4MiwgeTIsIGQyKSxcclxuICAgICAgICBwZXJtdXRhdGlvbnMgPSBwZXJtdXRlTGluZXMoYWxwaGFMaW5lcywgYmV0YUxpbmVzKSxcclxuICAgICAgICBpbnRlcnNlY3Rpb25zID0gcGVybXV0YXRpb25zLm1hcCgocCkgPT4gZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcyhwLmFscGhhLCBwLmJldGEpKSxcclxuICAgICAgICBjZW50ZXIgPSBpbnRlcnNlY3Rpb25zLmZpbHRlcigoaSkgPT4gaXNDZW50ZXJJbkJldHdlZW4oaS54LCBpLnksIHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpKVswXTtcclxuXHJcbiAgICByZXR1cm4gY2VudGVyIHx8IHt4OiBOYU4sIHk6IE5hTn07XHJcbiAgfSxcclxuXHJcbiAgZ2V0VGhlRm9vdE9mVGhlUGVycGVuZGljdWxhciA9ICh4MSwgeTEsIHgyLCB5MiwgY3gsIGN5KSA9PiB7XHJcbiAgICB2YXIgbSA9ICh5MiAtIHkxKSAvICh4MiAtIHgxKSxcclxuICAgICAgICBjbSA9IC0xIC8gbSxcclxuICAgICAgICBDID0geTEqKHgyIC0geDEpIC0geDEqKHkyIC0geTEpLFxyXG4gICAgICAgIHggPSAoQyAtICh4MiAtIHgxKSooY3kgLSBjbSpjeCkpIC8gKGNtKih4MiAtIHgxKSArIHkxIC0geTIpLFxyXG4gICAgICAgIHkgPSBjbSooeCAtIGN4KSArIGN5O1xyXG4gICAgcmV0dXJuIG0gPT09IDAgLy8gaG9yaXpvbnRhbFxyXG4gICAgICA/IHt4OiBjeCwgeTogeTF9XHJcbiAgICAgIDogKG0gPT09IEluZmluaXR5IC8vIHZlcnRpY2FsXHJcbiAgICAgICAgPyB7eDogeDEsIHk6IGN5fVxyXG4gICAgICAgIDoge3g6IHgsIHk6IHl9KTtcclxuICB9LFxyXG5cclxuICB4eVRvQXJjQW5nbGUgPSAoY3gsIGN5LCB4LCB5KSA9PiB7XHJcbiAgICB2YXIgaG9yaXpvbnRhbFggPSBjeCArIDEsXHJcbiAgICAgICAgaG9yaXpvbnRhbFkgPSBjeSxcclxuICAgICAgICBhID0gTWF0aC5hYnMoZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoeCwgeSwgY3gsIGN5LCBob3Jpem9udGFsWCwgaG9yaXpvbnRhbFkpKTtcclxuICAgIGlmKHkgPCBjeSkge1xyXG4gICAgICAvL3RoaXJkICYgZm9ydGggcXVhZHJhbnRzXHJcbiAgICAgIGEgPSBNYXRoLlBJICsgTWF0aC5QSSAtIGE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYTtcclxuICB9LFxyXG5cclxuICBzY2FsZWRSYWRpdXMgPSAociwgc3gsIHN5LCBhKSA9PiB7XHJcbiAgICAvL1xyXG4gICAgLy8gIFRoZSBzeCBhbmQgc3kgc2NhbGluZ3MgY2FuIGJlIGRpZmZlcmVudCBzbyB0aGUgY2lyY2xlIGxvb2tzIG1vcmUgbGlrZSBhblxyXG4gICAgLy9lbGxpcHNlLiBUaGlzIGZ1bmN0aW9uIGlzIHJldHVybmluZyB0aGUgcmFkaXVzIGNvcnJzcG9uZGluZyB0byB0aGUgc3BlY2lmaWVkIGFuZ2xlXHJcbiAgICAvL2FuZCB0YWtpbmcgaW50byBhY2NvdW50IHRoZSBzeCBhbmQgc3kgdmFsdWVzLlxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgKiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgICAgKlxyXG4gICAgLy8gICAgICAgICAqICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAqICAgICAgICAgICAgICAgICAgICpcclxuICAgIC8vICAgICAgICogICAgICAgICAgICAgKiAgICAgICAgICAgc3ggICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICpcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICArLS0tLS0tPiAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAqXHJcbiAgICAvLyAgICAgICAqICAgICAgICAgICAgICogICAgICAgfFxyXG4gICAgLy8gICAgICAgICAqICAgICAgICAgKiAgICAgIHN5IHYgICAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICpcclxuICAgIC8vICAgICAgICAgICAgKiAgICogICAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICpcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqICAgICAgICAgICAgICAgICAgICAqXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgICAgICpcclxuICAgIC8vXHJcbiAgICB2YXIgYWEsIC8vYWRqdXN0ZWQgYW5nbGVcclxuICAgICAgICBuYSA9IGEgJSAoMipQSSk7IC8vbm9ybWFsaXplZCBhbmdsZVxyXG4gICAgaWYgKHN4ID09PSBzeSkge1xyXG4gICAgICByZXR1cm4gciAqIHN4O1xyXG4gICAgfSBlbHNlIGlmIChhbG1vc3RFcXVhbChuYSwgMCkgfHwgYWxtb3N0RXF1YWwobmEsIFBJKSkge1xyXG4gICAgICByZXR1cm4gciAqIHN4O1xyXG4gICAgfSBlbHNlIGlmIChhbG1vc3RFcXVhbChuYSwgUEkvMikgfHwgYWxtb3N0RXF1YWwobmEsIDMqUEkvMikpIHtcclxuICAgICAgcmV0dXJuIHIgKiBzeTtcclxuICAgIH0gZWxzZSBpZiAobmEgPCAxKlBJLzIpIHtcclxuICAgICAgYWEgPSBuYTtcclxuICAgICAgcmV0dXJuIHIgKiAoc3ggKiAoUEkvMi1hYSkvKFBJLzIpICsgc3kgKiAoYWEpLyhQSS8yKSk7XHJcbiAgICB9IGVsc2UgaWYgKG5hIDwgMipQSS8yKSB7XHJcbiAgICAgIGFhID0gbmEgLSAxKlBJLzI7XHJcbiAgICAgIHJldHVybiByICogKHN4ICogKGFhKS8oUEkvMikgKyBzeSAqIChQSS8yLWFhKS8oUEkvMikpO1xyXG4gICAgfSBlbHNlIGlmIChuYSA8IDMqUEkvMikge1xyXG4gICAgICBhYSA9IG5hIC0gMipQSS8yO1xyXG4gICAgICByZXR1cm4gciAqIChzeCAqIChQSS8yLWFhKS8oUEkvMikgKyBzeSAqIChhYSkvKFBJLzIpKTtcclxuICAgIH0gZWxzZSBpZiAobmEgPCA0KlBJLzIpIHtcclxuICAgICAgYWEgPSBuYSAtIDMqUEkvMjtcclxuICAgICAgcmV0dXJuIHIgKiAoc3ggKiAoYWEpLyhQSS8yKSArIHN5ICogKFBJLzItYWEpLyhQSS8yKSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY29sbGluZWFyID0gKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpID0+IHtcclxuICAgIHZhciBtMSA9ICh5MSAtIHkwKSAvICh4MSAtIHgwKSxcclxuICAgICAgICBtMiA9ICh5MiAtIHkxKSAvICh4MiAtIHgxKTtcclxuICAgIHJldHVybiBhbG1vc3RFcXVhbChtMSwgbTIpO1xyXG4gIH0sXHJcblxyXG4gIGRlY29tcG9zZUFyY1RvID0gKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHIsIHN4LCBzeSkgPT4ge1xyXG4gICAgLy9cclxuICAgIC8vICBUaGUgc3ggYW5kIHN5IGlzIHVzZWQgdG8gc2NhbGUgdGhlIHJhZGl1cyAocikgb25seS5cclxuICAgIC8vQWxsIG90aGVyIGNvb3JkaW5hdGVzIGhhdmUgdG8gYmUgYWxyZWFkeSBzY2FsZWQuXHJcbiAgICAvL1xyXG4gICAgdmFyIGRlY29tcG9zaXRpb24gPSB7XHJcbiAgICAgIHBvaW50OiB7eDogeDEsIHk6IHkxfVxyXG4gICAgfTtcclxuICAgIGlmKGNvbGxpbmVhcih4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSkge1xyXG4gICAgICBkZWNvbXBvc2l0aW9uLmxpbmUgPSB7eDE6IHgwLCB5MTogeTAsIHgyOiB4MSwgeTI6IHkxfTtcclxuICAgIH0gZWxzZSBpZiAoIWlzTmFOKHgwKSAmJiAhaXNOYU4oeTApKSB7XHJcbiAgICAgIHZhciBjZW50ZXIgPSBnZXRUaGVDZW50ZXJPZlRoZUNvcm5lcih4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCByLCBzeCwgc3kpLFxyXG4gICAgICAgICAgZm9vdDEgPSBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyKHgwLCB5MCwgeDEsIHkxLCBjZW50ZXIueCwgY2VudGVyLnkpLFxyXG4gICAgICAgICAgZm9vdDIgPSBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyKHgxLCB5MSwgeDIsIHkyLCBjZW50ZXIueCwgY2VudGVyLnkpLFxyXG4gICAgICAgICAgYW5nbGVGb290MSA9IHh5VG9BcmNBbmdsZShjZW50ZXIueCwgY2VudGVyLnksIGZvb3QxLngsIGZvb3QxLnkpLFxyXG4gICAgICAgICAgYW5nbGVGb290MiA9IHh5VG9BcmNBbmdsZShjZW50ZXIueCwgY2VudGVyLnksIGZvb3QyLngsIGZvb3QyLnkpLFxyXG4gICAgICAgICAgc0FuZ2xlID0gTWF0aC5hYnMoYW5nbGVGb290MiAtIGFuZ2xlRm9vdDEpIDwgTWF0aC5QSSA/IGFuZ2xlRm9vdDIgOiBhbmdsZUZvb3QxLFxyXG4gICAgICAgICAgZUFuZ2xlID0gTWF0aC5hYnMoYW5nbGVGb290MiAtIGFuZ2xlRm9vdDEpIDwgTWF0aC5QSSA/IGFuZ2xlRm9vdDEgOiBhbmdsZUZvb3QyO1xyXG4gICAgICBpZiAoc0FuZ2xlID4gZUFuZ2xlKSB7XHJcbiAgICAgICAgdmFyIHRlbXAgPSBzQW5nbGU7XHJcbiAgICAgICAgc0FuZ2xlID0gZUFuZ2xlO1xyXG4gICAgICAgIGVBbmdsZSA9IHRlbXAgKyAyKlBJO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghaXNOYU4oY2VudGVyLngpICYmICFpc05hTihjZW50ZXIueSkpIHtcclxuICAgICAgICBpZiAoIWFsbW9zdEVxdWFsKGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MCwgeTAsIGZvb3QxLngsIGZvb3QxLnkpLCAwKSkge1xyXG4gICAgICAgICAgZGVjb21wb3NpdGlvbi5saW5lID0ge3gxOiB4MCwgeTE6IHkwLCB4MjogZm9vdDEueCwgeTI6IGZvb3QxLnl9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWNvbXBvc2l0aW9uLmFyYyA9IHt4OiBjZW50ZXIueCwgeTogY2VudGVyLnksIHI6IHIsIHNBbmdsZTogc0FuZ2xlLCBlQW5nbGU6IGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZTogZmFsc2V9O1xyXG4gICAgICAgIGRlY29tcG9zaXRpb24ucG9pbnQgPSB7eDogZm9vdDIueCwgeTogZm9vdDIueX07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBkZWNvbXBvc2l0aW9uO1xyXG4gIH0sXHJcblxyXG4gIHJlbGV2YW50QXJjQW5nbGVzID0gKHNBbmdsZSwgZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlKSA9PiB7XHJcbiAgICAvL1xyXG4gICAgLy8gIFRoZSBmdW5jdGlvbiBpcyByZXR1cm5pbmcgdGhlIHNwZWNpZmllZCBzQW5nbGUgYW5kIGVBbmdsZSBhbmRcclxuICAgIC8vYWxsIHRoZSBtdWx0aXBsZSBvZiBQSS8yLiBUaGUgcmVzdWx0IGRvZXNuJ3QgY29udGFpbiBkdXBsaWNhdGlvbnMuXHJcbiAgICAvLyAgRXhhbXBsZTogRm9yIHNBbmdsZSA9IFBJLzYgYW5kIGVBbmdsZSA9IDcqUEkvNixcclxuICAgIC8vIFdoZW4gY291bnRlcmNsb2Nrd2lzZSA9IGZhbHNlIHRoZSByZXN1bHQgaXM6IFtQSS82LCA3KlBJLzYsIFBJLzIsIDIqUEkvMl1cclxuICAgIC8vIFdoZW4gY291bnRlcmNsb2Nrd2lzZSA9IHRydWUgdGhlIHJlc3VsdCBpczogW1BJLzYsIDcqUEkvNiwgMypQSS8yLCA0KlBJLzJdXHJcbiAgICAvL1xyXG4gICAgdmFyIGFuZ2xlcyA9IFtdLCB1bmlxdWVBbmdsZXMgPSBbXTtcclxuICAgIGFuZ2xlcy5wdXNoKHNBbmdsZSk7XHJcbiAgICBhbmdsZXMucHVzaChlQW5nbGUpO1xyXG4gICAgaWYgKGNvdW50ZXJjbG9ja3dpc2UpIHtcclxuICAgICAgdmFyIHRlbXAgPSBzQW5nbGU7XHJcbiAgICAgICAgICBzQW5nbGUgPSBlQW5nbGU7XHJcbiAgICAgICAgICBlQW5nbGUgPSBzQW5nbGUgKyAyKlBJO1xyXG4gICAgfVxyXG4gICAgWzEqUEkvMiwgMipQSS8yLCAzKlBJLzIsIDQqUEkvMl0uZm9yRWFjaCgoYSkgPT4ge1xyXG4gICAgICBpZihlQW5nbGUgPiBhICYmIGEgPiBzQW5nbGUpIHtcclxuICAgICAgICBhbmdsZXMucHVzaChhKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy9yZW1vdmluZyB0aGUgZHVwbGljYXRlZCBwb2ludHNcclxuICAgIHVuaXF1ZUFuZ2xlcy5wdXNoKGFuZ2xlcy5wb3AoKSk7XHJcbiAgICB3aGlsZShhbmdsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgYW5nbGUgPSBhbmdsZXMucG9wKCksXHJcbiAgICAgICAgICBmb3VuZCA9IHVuaXF1ZUFuZ2xlcy5maW5kKChhKSA9PlxyXG4gICAgICAgICAgICBhbG1vc3RFcXVhbChhbmdsZSwgYSkgfHxcclxuICAgICAgICAgICAgYWxtb3N0RXF1YWwoYW5nbGUgLSAyKlBJLCBhKSB8fFxyXG4gICAgICAgICAgICBhbG1vc3RFcXVhbChhbmdsZSwgYSAtIDIqUEkpKTtcclxuICAgICAgaWYgKGZvdW5kID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICB1bmlxdWVBbmdsZXMucHVzaChhbmdsZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdW5pcXVlQW5nbGVzO1xyXG4gIH0sXHJcblxyXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjc1MjcyNS9maW5kaW5nLXdoZXRoZXItYS1wb2ludC1saWVzLWluc2lkZS1hLXJlY3RhbmdsZS1vci1ub3RcclxuICBpc1BvaW50SW5zaWRlUmVjdGFuZ2xlID0gKHBvaW50LCByZWN0YW5nbGUpID0+IHtcclxuICAgIHZhciBzZWdtZW50cyA9IFt7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSB9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHR9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodCxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0fSwge1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHQsXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55XHJcbiAgICB9XTtcclxuXHJcbiAgICB2YXIgaXNJbnNpZGUgPSBzZWdtZW50cy5tYXAoKHNlZ21lbnQpID0+IHtcclxuICAgICAgdmFyIEEgPSAtKHNlZ21lbnQueTIgLSBzZWdtZW50LnkxKSxcclxuICAgICAgICBCID0gc2VnbWVudC54MiAtIHNlZ21lbnQueDEsXHJcbiAgICAgICAgQyA9IC0oQSAqIHNlZ21lbnQueDEgKyBCICogc2VnbWVudC55MSksXHJcbiAgICAgICAgRCA9IEEgKiBwb2ludC54ICsgQiAqIHBvaW50LnkgKyBDO1xyXG4gICAgICAgIHJldHVybiBEO1xyXG4gICAgfSkuZXZlcnkoKEQpID0+IHtcclxuICAgICAgcmV0dXJuIEQgPj0gMDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBpc0luc2lkZTtcclxuICB9O1xyXG5cclxuXHJcbiAgdGhpcy5nZXRCQm94ID0gZ2V0QkJveDtcclxuICB0aGlzLnVuaW9uID0gdW5pb247XHJcbiAgdGhpcy50b3RhbFRyYW5zZm9ybSA9IHRvdGFsVHJhbnNmb3JtO1xyXG4gIHRoaXMuZ2V0UmVjdEFyb3VuZExpbmUgPSBnZXRSZWN0QXJvdW5kTGluZTtcclxuICB0aGlzLmdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQgPSBnZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50O1xyXG4gIHRoaXMuZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcyA9IGdldEludGVyc2VjdGlvbk9mVHdvTGluZXM7XHJcbiAgdGhpcy5nZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzO1xyXG4gIHRoaXMuZ2V0VGhlQ2VudGVyT2ZUaGVDb3JuZXIgPSBnZXRUaGVDZW50ZXJPZlRoZUNvcm5lcjtcclxuICB0aGlzLmdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIgPSBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyO1xyXG4gIHRoaXMueHlUb0FyY0FuZ2xlID0geHlUb0FyY0FuZ2xlO1xyXG4gIHRoaXMuc2NhbGVkUmFkaXVzID0gc2NhbGVkUmFkaXVzO1xyXG4gIHRoaXMuZGVjb21wb3NlQXJjVG8gPSBkZWNvbXBvc2VBcmNUbztcclxuICB0aGlzLmlzUG9pbnRJbnNpZGVSZWN0YW5nbGUgPSBpc1BvaW50SW5zaWRlUmVjdGFuZ2xlO1xyXG5cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyeS5qcydcclxuaW1wb3J0IHsgQ3VzdG9tTWF0Y2hlcnMgfSBmcm9tICcuL2N1c3RvbU1hdGNoZXJzLmpzJ1xyXG5pbXBvcnQgeyBDb21wYXJhdG9ycyB9IGZyb20gJy4vY29tcGFyYXRvcnMuanMnXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFJhYmJpdChnZW9tZXRyeSwgbWF0Y2hlcnMsIGNvbXBhcmF0b3JzKSB7XHJcblxyXG4gIGdlb21ldHJ5ID0gZ2VvbWV0cnkgfHwgbmV3IEdlb21ldHJ5KCk7XHJcbiAgbWF0Y2hlcnMgPSBtYXRjaGVycyB8fCBuZXcgQ3VzdG9tTWF0Y2hlcnMoKTtcclxuICBjb21wYXJhdG9ycyA9IGNvbXBhcmF0b3JzIHx8IG5ldyBDb21wYXJhdG9ycygpO1xyXG5cclxuXHJcbiAgdmFyIGZpbmRTaGFwZXMgPSAoc2hhcGUsIHdoZXJlLCBvcHQpID0+IHtcclxuICAgIG9wdCA9IE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICBpZ25vcmVBcmd1bWVudHM6IHRydWUsXHJcbiAgICAgIHByZWNpc2lvbjogMCxcclxuICAgICAgY29tcGFyYXRvcjogdW5kZWZpbmVkXHJcbiAgICB9LCBvcHQgfHwge30pO1xyXG4gICAgdmFyIGZvdW5kID0gW10sIGluZGV4ID0gMCwgaGVhZGVyLCBmb3VuZFNoYXBlO1xyXG4gICAgZG8ge1xyXG4gICAgICBpbmRleCA9IGZpbmRTaGFwZShzaGFwZSwgd2hlcmUsIGluZGV4LCBvcHQpO1xyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgaGVhZGVyID0gY29sbGVjdEhlYWRlcih3aGVyZSwgaW5kZXggLSAxKTtcclxuICAgICAgICBmb3VuZFNoYXBlID0gd2hlcmUuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2hhcGUubGVuZ3RoKTtcclxuICAgICAgICBmb3VuZC5wdXNoKGhlYWRlci5jb25jYXQoZm91bmRTaGFwZSkpO1xyXG4gICAgICAgIGluZGV4ICs9IHNoYXBlLmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgfSB3aGlsZSAoaW5kZXggIT09IC0xICYmIGluZGV4IDwgd2hlcmUubGVuZ3RoKTtcclxuICAgIHJldHVybiBmb3VuZDtcclxuICB9LFxyXG5cclxuICBmaW5kU2hhcGUgPSAoc2hhcGUsIHdoZXJlLCBzdGFydEluZGV4LCBvcHQpID0+IHtcclxuICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4IHx8IDA7XHJcbiAgICBvcHQgPSBvcHQgfHwge307XHJcbiAgICB2YXIgbWF0Y2ggPSBmYWxzZSxcclxuICAgICAgICBpbmRleCA9IC0xLFxyXG4gICAgICAgIGRlZmF1bHRDb21wYXJhdG9yID0gY29tcGFyYXRvcnMuc2FtZUNhbGxzLFxyXG4gICAgICAgIGNvbXBhcmF0b3IgPSBvcHQuY29tcGFyYXRvciB8fCBkZWZhdWx0Q29tcGFyYXRvcjtcclxuICAgIGlmIChBcnJheS5pc0FycmF5KHNoYXBlKSAmJiBzaGFwZS5sZW5ndGggPiAwICYmIEFycmF5LmlzQXJyYXkod2hlcmUpICYmIHdoZXJlLmxlbmd0aCA+IDApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXg7IGkgPD0gd2hlcmUubGVuZ3RoIC0gc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBtYXRjaCA9IHRydWU7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzaGFwZS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgaWYgKCFjb21wYXJhdG9yKHNoYXBlW2pdLCB3aGVyZVtpICsgal0sIG9wdCwgZGVmYXVsdENvbXBhcmF0b3IpKSB7XHJcbiAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWF0Y2ggPT09IHRydWUpIHtcclxuICAgICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGluZGV4O1xyXG4gIH0sXHJcblxyXG4gIGNvbGxlY3RIZWFkZXIgPSAoc3RhY2ssIGxhc3RJbmRleCkgPT4ge1xyXG4gICAgdmFyIHN0eWxlcyA9IFtdLCBjYWxsO1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8PSBsYXN0SW5kZXg7IGkrKykge1xyXG4gICAgICBjYWxsID0gc3RhY2tbaV07XHJcbiAgICAgIGlmIChpc1N0eWxlKGNhbGwpIHx8IGlzVHJhbnNmb3JtKGNhbGwpKSB7XHJcbiAgICAgICAgc3R5bGVzLnB1c2goY2FsbCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBzdHlsZXM7XHJcbiAgfSxcclxuXHJcbiAgaXNTdHlsZSA9IChjYWxsKSA9PiB7XHJcbiAgICB2YXIgc3R5bGVOYW1lcyA9IFtcclxuICAgICAgJ2ZpbGxTdHlsZScsICdzdHJva2VTdHlsZScsICdzaGFkb3dDb2xvcicsICdzaGFkb3dCbHVyJywgJ3NoYWRvd09mZnNldFgnLCAnc2hhZG93T2Zmc2V0WScsXHJcbiAgICAgICdsaW5lQ2FwJywgJ2xpbmVKb2luJywgJ2xpbmVXaWR0aCcsICdtaXRlckxpbWl0JyxcclxuICAgICAgJ2ZvbnQnLCAndGV4dEFsaWduJywgJ3RleHRCYXNlbGluZScsXHJcbiAgICAgICdnbG9iYWxBbHBoYScsICdnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24nXHJcbiAgICBdO1xyXG4gICAgcmV0dXJuIHN0eWxlTmFtZXMuaW5kZXhPZihjYWxsLmF0dHIpICE9PSAtMSA/IHRydWUgOiBmYWxzZTtcclxuICB9LFxyXG5cclxuICBpc1RyYW5zZm9ybSA9IChjYWxsKSA9PiB7XHJcbiAgICB2YXIgdHJhbnNmb3JtTmFtZXMgPSBbXHJcbiAgICAgICdzY2FsZScsICd0cmFuc2xhdGUnLCAncm90YXRlJywgJ3RyYW5zZm9ybScsICdzZXRUcmFuc2Zvcm0nLFxyXG4gICAgICAnc2F2ZScsICdyZXN0b3JlJ1xyXG4gICAgXTtcclxuICAgIHJldHVybiB0cmFuc2Zvcm1OYW1lcy5pbmRleE9mKGNhbGwubWV0aG9kKSAhPT0gLTEgPyB0cnVlIDogZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlU2hhcGVzID0gKHNoYXBlcywgZnJvbSkgPT4ge1xyXG4gICAgdmFyIGNvcHkgPSBmcm9tLnNsaWNlKDAsIGZyb20ubGVuZ3RoKTtcclxuICAgIHNoYXBlcy5mb3JFYWNoKChzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgaW5kZXggPSAtMTtcclxuICAgICAgZG8ge1xyXG4gICAgICAgIGluZGV4ID0gZmluZFNoYXBlKHNoYXBlLCBjb3B5KTtcclxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICBjb3B5LnNwbGljZShpbmRleCwgc2hhcGUubGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gd2hpbGUgKGluZGV4ICE9PSAtMSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb3B5O1xyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLmdldEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94O1xyXG4gIHRoaXMuY3VzdG9tTWF0Y2hlcnMgPSBtYXRjaGVycztcclxuICB0aGlzLmZpbmRTaGFwZXMgPSBmaW5kU2hhcGVzO1xyXG4gIHRoaXMucmVtb3ZlU2hhcGVzID0gcmVtb3ZlU2hhcGVzO1xyXG5cclxufVxyXG4iXX0=
