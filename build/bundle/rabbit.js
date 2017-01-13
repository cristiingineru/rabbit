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
      compare: function compare(actual, expected, opt) {
        opt = Object.assign({
          ignoreArguments: true,
          precision: 0
        }, opt || {});
        var match = false;
        for (var i = 0; i < expected.length - actual.length + 1; i++) {
          match = actual.length > 0;
          for (var j = 0; j < actual.length; j++) {
            if (!sameCalls(expected[i + j], actual[j], opt.ignoreArguments, opt.precision)) {
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
            haveTheSameX = sameValues(actualBBox.x, expectedBBox.x, opt.precision),
            haveTheSameY = sameValues(actualBBox.y, expectedBBox.y, opt.precision),
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
            haveTheSameWidth = sameValues(actualBBox.width, expectedBBox.width, opt.precision),
            haveTheSameHeight = sameValues(actualBBox.height, expectedBBox.height, opt.precision),
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
            haveTheSameAlignment = sameValues(y1, y2),
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
            haveTheSameAlignment = sameValues(x1, x2),
            result = !validArguments ? { pass: false, message: 'Invalid shape(s): ' + actual + ' and ' + expected } : haveTheSameAlignment ? { pass: true } : { pass: false, message: 'Not the same vertical ' + opt.compare + ' alignment: ' + x1 + ' and ' + x2 + ' comparing with precision: ' + opt.precision };
        return result;
      }
    };
  },
      sameValues = function sameValues(val1, val2, precision) {
    var same = false;
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      same = val1.toFixed(precision) === val2.toFixed(precision);
    } else {
      same = val1 == val2;
    }
    return same;
  },
      sameCalls = function sameCalls(call1, call2, ignoreArguments, precision) {
    var same;
    if (call1.method && call2.method || call1.attr && call2.attr) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGN1c3RvbU1hdGNoZXJzLmpzIiwic3JjXFxnZW9tZXRyeS5qcyIsInNyY1xccmFiYml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7O1FBS2dCLGMsR0FBQSxjOztBQUhoQjs7QUFHTyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0M7O0FBRXZDLGFBQVcsWUFBWSx3QkFBdkI7O0FBR0EsTUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBTyxxQkFBUCxFQUFpQztBQUNoRCxXQUFPO0FBQ0wsZUFBUyxpQkFBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixHQUFuQixFQUEyQjtBQUNsQyxjQUFNLE9BQU8sTUFBUCxDQUFjO0FBQ2xCLDJCQUFpQixJQURDO0FBRWxCLHFCQUFXO0FBRk8sU0FBZCxFQUdILE9BQU8sRUFISixDQUFOO0FBSUEsWUFBSSxRQUFRLEtBQVo7QUFDQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksU0FBUyxNQUFULEdBQWtCLE9BQU8sTUFBekIsR0FBa0MsQ0FBdEQsRUFBeUQsR0FBekQsRUFBOEQ7QUFDNUQsa0JBQVEsT0FBTyxNQUFQLEdBQWdCLENBQXhCO0FBQ0EsZUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLE9BQU8sTUFBM0IsRUFBbUMsR0FBbkMsRUFBd0M7QUFDdEMsZ0JBQUksQ0FBQyxVQUFVLFNBQVMsSUFBSSxDQUFiLENBQVYsRUFBMkIsT0FBTyxDQUFQLENBQTNCLEVBQXNDLElBQUksZUFBMUMsRUFBMkQsSUFBSSxTQUEvRCxDQUFMLEVBQWdGO0FBQzlFLHNCQUFRLEtBQVI7QUFDQTtBQUNEO0FBQ0Y7QUFDRCxjQUFJLFVBQVUsSUFBZCxFQUFvQjtBQUNsQjtBQUNEO0FBQ0Y7QUFDRCxZQUFJLGlCQUFpQixVQUFVLE9BQU8sTUFBUCxHQUFnQixDQUExQixJQUErQixRQUEvQixJQUEyQyxT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TUFBRCxFQUFTLElBQVQsRUFBa0I7QUFDL0IsUUFBSSxPQUFPLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxLQUFLLE1BQW5CLENBQVg7QUFDQSxXQUFPLE9BQVAsQ0FBZSxVQUFDLEtBQUQsRUFBVztBQUN4QixVQUFJLFFBQVEsQ0FBQyxDQUFiO0FBQ0EsU0FBRztBQUNELGdCQUFRLEtBQUssMEJBQUwsQ0FBZ0MsS0FBaEMsRUFBdUMsSUFBdkMsQ0FBUjtBQUNBLFlBQUksVUFBVSxDQUFDLENBQWYsRUFBa0I7QUFDaEIsZUFBSyxNQUFMLENBQVksS0FBWixFQUFtQixNQUFNLE1BQXpCO0FBQ0Q7QUFDRixPQUxELFFBS1MsVUFBVSxDQUFDLENBTHBCO0FBTUQsS0FSRDtBQVNBLFdBQU8sSUFBUDtBQUNELEdBM0NEOztBQThDQSxPQUFLLE9BQUwsR0FBZSxTQUFTLE9BQXhCO0FBQ0EsT0FBSyxjQUFMLEdBQXNCLFFBQXRCO0FBQ0EsT0FBSyw4QkFBTCxHQUFzQyw4QkFBdEM7QUFDQSxPQUFLLDBCQUFMLEdBQWtDLDBCQUFsQztBQUNBLE9BQUssWUFBTCxHQUFvQixZQUFwQjtBQUVEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJ5LmpzJ1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBDdXN0b21NYXRjaGVycyhnZW9tZXRyeSkge1xyXG5cclxuICBnZW9tZXRyeSA9IGdlb21ldHJ5IHx8IG5ldyBHZW9tZXRyeSgpO1xyXG5cclxuXHJcbiAgdmFyIHRvQmVQYXJ0T2YgPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0KSA9PiB7XHJcbiAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgICBpZ25vcmVBcmd1bWVudHM6IHRydWUsXHJcbiAgICAgICAgICBwcmVjaXNpb246IDBcclxuICAgICAgICB9LCBvcHQgfHwge30pO1xyXG4gICAgICAgIHZhciBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXhwZWN0ZWQubGVuZ3RoIC0gYWN0dWFsLmxlbmd0aCArIDE7IGkrKykge1xyXG4gICAgICAgICAgbWF0Y2ggPSBhY3R1YWwubGVuZ3RoID4gMDtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYWN0dWFsLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmICghc2FtZUNhbGxzKGV4cGVjdGVkW2kgKyBqXSwgYWN0dWFsW2pdLCBvcHQuaWdub3JlQXJndW1lbnRzLCBvcHQucHJlY2lzaW9uKSkge1xyXG4gICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChtYXRjaCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHZhbGlkQXJndW1lbnRzID0gYWN0dWFsICYmIGFjdHVhbC5sZW5ndGggPiAwICYmIGV4cGVjdGVkICYmIGV4cGVjdGVkLmxlbmd0aCA+IDAsXHJcbiAgICAgICAgICBob3cgPSBvcHQuaWdub3JlQXJndW1lbnRzID8gJ2lnbm9yaW5nIHRoZSBhcmd1bWVudHMnIDogJ2NvbXBhcmluZyB0aGUgYXJndW1lbnRzIHdpdGggcHJlY2lzaW9uICcgKyBvcHQucHJlY2lzaW9uLFxyXG4gICAgICAgICAgcmVzdWx0ID0gIXZhbGlkQXJndW1lbnRzXHJcbiAgICAgICAgICAgID8ge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnSW52YWxpZCBzaGFwZShzKTogJyArIGFjdHVhbCArICcgYW5kICcgKyBleHBlY3RlZH1cclxuICAgICAgICAgICAgOiAobWF0Y2hcclxuICAgICAgICAgICAgICA/IHtwYXNzOiB0cnVlfVxyXG4gICAgICAgICAgICAgIDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2hhcGUgb2YgbGVuZ3RoICcgKyBhY3R1YWwubGVuZ3RoICsgJyBub3QgcGFydCBvZiBzaGFwZSBvZiBsZW5ndGggJyArIGV4cGVjdGVkLmxlbmd0aCArICcgJyArIGhvd30pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0JlSW5zaWRlVGhlQXJlYU9mID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQsIG9wdCkgPT4ge1xyXG4gICAgICAgIG9wdCA9IE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICAgICAgY2hlY2tUaGVDZW50ZXJPbmx5OiBmYWxzZVxyXG4gICAgICAgIH0sIG9wdCB8fCB7fSk7XHJcbiAgICAgICAgdmFyIHZhbGlkQXJndW1lbnRzID0gYWN0dWFsICYmIGFjdHVhbC5sZW5ndGggPiAwICYmIGV4cGVjdGVkICYmIGV4cGVjdGVkLmxlbmd0aCA+IDAsXHJcbiAgICAgICAgICBzbWFsbFNoYXBlID0gYWN0dWFsLFxyXG4gICAgICAgICAgYmlnU2hhcGUgPSBleHBlY3RlZCxcclxuICAgICAgICAgIGJpZ1NoYXBlQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYmlnU2hhcGUpLFxyXG4gICAgICAgICAgc21hbGxTaGFwZUJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KHNtYWxsU2hhcGUpLFxyXG4gICAgICAgICAgc21hbGxTaGFwZUNvcm5lcnMgPSBjb3JuZXJzT2ZBQm94KHNtYWxsU2hhcGVCQm94KSxcclxuICAgICAgICAgIGlzQW55Q29ybmVyT3V0c2lkZSA9IHNtYWxsU2hhcGVDb3JuZXJzXHJcbiAgICAgICAgICAgIC5yZWR1Y2UoKHByZXYsIGNvcm5lcikgPT4gcHJldiB8PSAhZ2VvbWV0cnkuaXNQb2ludEluc2lkZVJlY3RhbmdsZShjb3JuZXIsIGJpZ1NoYXBlQkJveCksIGZhbHNlKSxcclxuICAgICAgICAgIGNlbnRlciA9IHt4OiBzbWFsbFNoYXBlQkJveC54ICsgc21hbGxTaGFwZUJCb3gud2lkdGggLyAyLCB5OiBzbWFsbFNoYXBlQkJveC55ICsgc21hbGxTaGFwZUJCb3guaGVpZ2h0IC8gMn0sXHJcbiAgICAgICAgICBpc0NlbnRlckluc2lkZSA9IGdlb21ldHJ5LmlzUG9pbnRJbnNpZGVSZWN0YW5nbGUoY2VudGVyLCBiaWdTaGFwZUJCb3gpLFxyXG4gICAgICAgICAgd2hhdCA9IG9wdC5jaGVja1RoZUNlbnRlck9ubHkgPyAnY2VudGVyJyA6ICdjb3JuZXJzJyxcclxuICAgICAgICAgIHJlc3VsdCA9ICF2YWxpZEFyZ3VtZW50c1xyXG4gICAgICAgICAgICA/IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ0ludmFsaWQgc2hhcGUocyk6ICcgKyBhY3R1YWwgKyAnIGFuZCAnICsgZXhwZWN0ZWR9XHJcbiAgICAgICAgICAgIDogKCFpc0FueUNvcm5lck91dHNpZGUgfHwgKG9wdC5jaGVja1RoZUNlbnRlck9ubHkgJiYgaXNDZW50ZXJJbnNpZGUpXHJcbiAgICAgICAgICAgICAgPyB7cGFzczogdHJ1ZX1cclxuICAgICAgICAgICAgICA6IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ1RoZSAnICsgd2hhdCArICcgb2YgdGhlICcgKyBKU09OLnN0cmluZ2lmeShzbWFsbFNoYXBlQkJveCkgKyAnIG5vdCBpbnNpZGUgJyArIEpTT04uc3RyaW5naWZ5KGJpZ1NoYXBlQkJveCl9KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9IYXZlVGhlU2FtZVBvc2l0aW9uV2l0aCA9ICh1dGlsLCBjdXN0b21FcXVhbGl0eVRlc3RlcnMpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBhcmU6IChhY3R1YWwsIGV4cGVjdGVkLCBvcHQpID0+IHtcclxuICAgICAgICBvcHQgPSBPYmplY3QuYXNzaWduKHtcclxuICAgICAgICAgIHByZWNpc2lvbjogMFxyXG4gICAgICAgIH0sIG9wdCB8fCB7fSk7XHJcbiAgICAgICAgdmFyIHZhbGlkQXJndW1lbnRzID0gYWN0dWFsICYmIGFjdHVhbC5sZW5ndGggPiAwICYmIGV4cGVjdGVkICYmIGV4cGVjdGVkLmxlbmd0aCA+IDAsXHJcbiAgICAgICAgICBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZVggPSBzYW1lVmFsdWVzKGFjdHVhbEJCb3gueCwgZXhwZWN0ZWRCQm94LngsIG9wdC5wcmVjaXNpb24pLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVZID0gc2FtZVZhbHVlcyhhY3R1YWxCQm94LnksIGV4cGVjdGVkQkJveC55LCBvcHQucHJlY2lzaW9uKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lUG9zaXRpb24gPSBoYXZlVGhlU2FtZVggJiYgaGF2ZVRoZVNhbWVZLFxyXG4gICAgICAgICAgcmVzdWx0ID0gIXZhbGlkQXJndW1lbnRzXHJcbiAgICAgICAgICAgID8ge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnSW52YWxpZCBzaGFwZShzKTogJyArIGFjdHVhbCArICcgYW5kICcgKyBleHBlY3RlZH1cclxuICAgICAgICAgICAgOiAoaGF2ZVRoZVNhbWVQb3NpdGlvblxyXG4gICAgICAgICAgICAgID8ge3Bhc3M6IHRydWV9XHJcbiAgICAgICAgICAgICAgOiAoIWhhdmVUaGVTYW1lWCAmJiAhaGF2ZVRoZVNhbWVZXHJcbiAgICAgICAgICAgICAgICA/IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ05vdCB0aGUgc2FtZSB4IGFuZCB5OiAnICsgYWN0dWFsQkJveC54ICsgJ3gnICsgYWN0dWFsQkJveC55ICsgJyB2cy4gJyArIGV4cGVjdGVkQkJveC54ICsgJ3gnICsgZXhwZWN0ZWRCQm94LnkgKyAnIGNvbXBhcmluZyB3aXRoIHByZWNpc2lvbjogJyArIG9wdC5wcmVjaXNpb259XHJcbiAgICAgICAgICAgICAgICA6ICghaGF2ZVRoZVNhbWVYXHJcbiAgICAgICAgICAgICAgICAgID8ge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnTm90IHRoZSBzYW1lIHg6ICcgKyBhY3R1YWxCQm94LnggKyAnIHZzLiAnICsgZXhwZWN0ZWRCQm94LnggKyAnIGNvbXBhcmluZyB3aXRoIHByZWNpc2lvbjogJyArIG9wdC5wcmVjaXNpb259XHJcbiAgICAgICAgICAgICAgICAgIDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnTm90IHRoZSBzYW1lIHk6ICcgKyBhY3R1YWxCQm94LnkgKyAnIHZzLiAnICsgZXhwZWN0ZWRCQm94LnkgKyAnIGNvbXBhcmluZyB3aXRoIHByZWNpc2lvbjogJyArIG9wdC5wcmVjaXNpb259KSkpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0b0hhdmVUaGVTYW1lU2l6ZVdpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0KSA9PiB7XHJcbiAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgICBwcmVjaXNpb246IDBcclxuICAgICAgICB9LCBvcHQgfHwge30pO1xyXG4gICAgICAgIHZhciB2YWxpZEFyZ3VtZW50cyA9IGFjdHVhbCAmJiBhY3R1YWwubGVuZ3RoID4gMCAmJiBleHBlY3RlZCAmJiBleHBlY3RlZC5sZW5ndGggPiAwLFxyXG4gICAgICAgICAgYWN0dWFsQkJveCA9IGdlb21ldHJ5LmdldEJCb3goYWN0dWFsKSxcclxuICAgICAgICAgIGV4cGVjdGVkQkJveCA9IGdlb21ldHJ5LmdldEJCb3goZXhwZWN0ZWQpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVXaWR0aCA9IHNhbWVWYWx1ZXMoYWN0dWFsQkJveC53aWR0aCwgZXhwZWN0ZWRCQm94LndpZHRoLCBvcHQucHJlY2lzaW9uKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lSGVpZ2h0ID0gc2FtZVZhbHVlcyhhY3R1YWxCQm94LmhlaWdodCwgZXhwZWN0ZWRCQm94LmhlaWdodCwgb3B0LnByZWNpc2lvbiksXHJcbiAgICAgICAgICBoYXZlVGhlU2FtZVNpemVzID0gaGF2ZVRoZVNhbWVXaWR0aCAmJiBoYXZlVGhlU2FtZUhlaWdodCxcclxuICAgICAgICAgIHJlc3VsdCA9ICF2YWxpZEFyZ3VtZW50c1xyXG4gICAgICAgICAgICA/IHtwYXNzOiBmYWxzZSwgbWVzc2FnZTogJ0ludmFsaWQgc2hhcGUocyk6ICcgKyBhY3R1YWwgKyAnIGFuZCAnICsgZXhwZWN0ZWR9XHJcbiAgICAgICAgICAgIDogKGhhdmVUaGVTYW1lU2l6ZXNcclxuICAgICAgICAgICAgICA/IHtwYXNzOiB0cnVlfVxyXG4gICAgICAgICAgICAgIDogKCFoYXZlVGhlU2FtZVdpZHRoICYmICFoYXZlVGhlU2FtZUhlaWdodFxyXG4gICAgICAgICAgICAgICAgPyB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdOb3QgdGhlIHNhbWUgd2lkdGggYW5kIGhlaWdodDogJyArIGFjdHVhbEJCb3gud2lkdGggKyAneCcgKyBhY3R1YWxCQm94LmhlaWdodCArICcgdnMuICcgKyBleHBlY3RlZEJCb3gud2lkdGggKyAneCcgKyBleHBlY3RlZEJCb3guaGVpZ2h0ICsgJyBjb21wYXJpbmcgd2l0aCBwcmVjaXNpb246ICcgKyBvcHQucHJlY2lzaW9ufVxyXG4gICAgICAgICAgICAgICAgOiAoIWhhdmVUaGVTYW1lV2lkdGhcclxuICAgICAgICAgICAgICAgICAgPyB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdOb3QgdGhlIHNhbWUgd2lkdGg6ICcgKyBhY3R1YWxCQm94LndpZHRoICsgJyB2cy4gJyArIGV4cGVjdGVkQkJveC53aWR0aCArICcgY29tcGFyaW5nIHdpdGggcHJlY2lzaW9uOiAnICsgb3B0LnByZWNpc2lvbn1cclxuICAgICAgICAgICAgICAgICAgOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdOb3QgdGhlIHNhbWUgaGVpZ2h0OiAnICsgYWN0dWFsQkJveC5oZWlnaHQgKyAnIHZzLiAnICsgZXhwZWN0ZWRCQm94LmhlaWdodCArICcgY29tcGFyaW5nIHdpdGggcHJlY2lzaW9uOiAnICsgb3B0LnByZWNpc2lvbn0pKSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGggPSAodXRpbCwgY3VzdG9tRXF1YWxpdHlUZXN0ZXJzKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21wYXJlOiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0KSA9PiB7XHJcbiAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgICBjb21wYXJlOiAndG9wJyxcclxuICAgICAgICAgIHByZWNpc2lvbjogMFxyXG4gICAgICAgIH0sIG9wdCB8fCB7fSk7XHJcbiAgICAgICAgdmFyIHZhbGlkQXJndW1lbnRzID0gYWN0dWFsICYmIGFjdHVhbC5sZW5ndGggPiAwICYmIGV4cGVjdGVkICYmIGV4cGVjdGVkLmxlbmd0aCA+IDAsXHJcbiAgICAgICAgICBhY3R1YWxCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChhY3R1YWwpLFxyXG4gICAgICAgICAgZXhwZWN0ZWRCQm94ID0gZ2VvbWV0cnkuZ2V0QkJveChleHBlY3RlZCksXHJcbiAgICAgICAgICB5MSA9IG9wdC5jb21wYXJlID09PSAndG9wJ1xyXG4gICAgICAgICAgICA/IGFjdHVhbEJCb3gueVxyXG4gICAgICAgICAgICA6IChvcHQuY29tcGFyZSA9PT0gJ2JvdHRvbSdcclxuICAgICAgICAgICAgICA/IGFjdHVhbEJCb3gueSArIGFjdHVhbEJCb3guaGVpZ2h0XHJcbiAgICAgICAgICAgICAgOiAoYWN0dWFsQkJveC55ICsgYWN0dWFsQkJveC5oZWlnaHQpIC8gMiksXHJcbiAgICAgICAgICB5MiA9IG9wdC5jb21wYXJlID09PSAndG9wJ1xyXG4gICAgICAgICAgICA/IGV4cGVjdGVkQkJveC55XHJcbiAgICAgICAgICAgIDogKG9wdC5jb21wYXJlID09PSAnYm90dG9tJ1xyXG4gICAgICAgICAgICAgID8gZXhwZWN0ZWRCQm94LnkgKyBleHBlY3RlZEJCb3guaGVpZ2h0XHJcbiAgICAgICAgICAgICAgOiAoZXhwZWN0ZWRCQm94LnkgKyBleHBlY3RlZEJCb3guaGVpZ2h0KSAvIDIpLFxyXG4gICAgICAgICAgaGF2ZVRoZVNhbWVBbGlnbm1lbnQgPSBzYW1lVmFsdWVzKHkxLCB5MiksXHJcbiAgICAgICAgICByZXN1bHQgPSAhdmFsaWRBcmd1bWVudHNcclxuICAgICAgICAgICAgPyB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdJbnZhbGlkIHNoYXBlKHMpOiAnICsgYWN0dWFsICsgJyBhbmQgJyArIGV4cGVjdGVkfVxyXG4gICAgICAgICAgICA6IChoYXZlVGhlU2FtZUFsaWdubWVudFxyXG4gICAgICAgICAgICAgID8ge3Bhc3M6IHRydWV9XHJcbiAgICAgICAgICAgICAgOiB7cGFzczogZmFsc2UsIG1lc3NhZ2U6ICdOb3QgdGhlIHNhbWUgaG9yaXpvbnRhbCAnICsgb3B0LmNvbXBhcmUgKyAnIGFsaWdubWVudDogJyArIHkxICsgJyBhbmQgJyArIHkyICsgJyBjb21wYXJpbmcgd2l0aCBwcmVjaXNpb246ICcgKyBvcHQucHJlY2lzaW9ufSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRvQmVWZXJ0aWNhbGx5QWxpZ25XaXRoID0gKHV0aWwsIGN1c3RvbUVxdWFsaXR5VGVzdGVycykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGFyZTogKGFjdHVhbCwgZXhwZWN0ZWQsIG9wdCkgPT4ge1xyXG4gICAgICAgIG9wdCA9IE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICAgICAgY29tcGFyZTogJ2xlZnQnLFxyXG4gICAgICAgICAgcHJlY2lzaW9uOiAwXHJcbiAgICAgICAgfSwgb3B0IHx8IHt9KTtcclxuICAgICAgICB2YXIgdmFsaWRBcmd1bWVudHMgPSBhY3R1YWwgJiYgYWN0dWFsLmxlbmd0aCA+IDAgJiYgZXhwZWN0ZWQgJiYgZXhwZWN0ZWQubGVuZ3RoID4gMCxcclxuICAgICAgICAgIGFjdHVhbEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGFjdHVhbCksXHJcbiAgICAgICAgICBleHBlY3RlZEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94KGV4cGVjdGVkKSxcclxuICAgICAgICAgIHgxID0gb3B0LmNvbXBhcmUgPT09ICdsZWZ0J1xyXG4gICAgICAgICAgICA/IGFjdHVhbEJCb3gueFxyXG4gICAgICAgICAgICA6IChvcHQuY29tcGFyZSA9PT0gJ3JpZ2h0J1xyXG4gICAgICAgICAgICAgID8gYWN0dWFsQkJveC54ICsgYWN0dWFsQkJveC53aWR0aFxyXG4gICAgICAgICAgICAgIDogKGFjdHVhbEJCb3gueCArIGFjdHVhbEJCb3gud2lkdGgpIC8gMiksXHJcbiAgICAgICAgICB4MiA9IG9wdC5jb21wYXJlID09PSAnbGVmdCdcclxuICAgICAgICAgICAgPyBleHBlY3RlZEJCb3gueFxyXG4gICAgICAgICAgICA6IChvcHQuY29tcGFyZSA9PT0gJ3JpZ2h0J1xyXG4gICAgICAgICAgICAgID8gZXhwZWN0ZWRCQm94LnggKyBleHBlY3RlZEJCb3gud2lkdGhcclxuICAgICAgICAgICAgICA6IChleHBlY3RlZEJCb3gueCArIGV4cGVjdGVkQkJveC53aWR0aCkgLyAyKSxcclxuICAgICAgICAgIGhhdmVUaGVTYW1lQWxpZ25tZW50ID0gc2FtZVZhbHVlcyh4MSwgeDIpLFxyXG4gICAgICAgICAgcmVzdWx0ID0gIXZhbGlkQXJndW1lbnRzXHJcbiAgICAgICAgICAgID8ge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnSW52YWxpZCBzaGFwZShzKTogJyArIGFjdHVhbCArICcgYW5kICcgKyBleHBlY3RlZH1cclxuICAgICAgICAgICAgOiAoaGF2ZVRoZVNhbWVBbGlnbm1lbnRcclxuICAgICAgICAgICAgICA/IHtwYXNzOiB0cnVlfVxyXG4gICAgICAgICAgICAgIDoge3Bhc3M6IGZhbHNlLCBtZXNzYWdlOiAnTm90IHRoZSBzYW1lIHZlcnRpY2FsICcgKyBvcHQuY29tcGFyZSArICcgYWxpZ25tZW50OiAnICsgeDEgKyAnIGFuZCAnICsgeDIgKyAnIGNvbXBhcmluZyB3aXRoIHByZWNpc2lvbjogJyArIG9wdC5wcmVjaXNpb259KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgc2FtZVZhbHVlcyA9ICh2YWwxLCB2YWwyLCBwcmVjaXNpb24pID0+IHtcclxuICAgIHZhciBzYW1lID0gZmFsc2U7XHJcbiAgICBpZiAodHlwZW9mIHZhbDEgPT09ICdudW1iZXInICYmIHR5cGVvZiB2YWwyID09PSAnbnVtYmVyJykge1xyXG4gICAgICBzYW1lID0gdmFsMS50b0ZpeGVkKHByZWNpc2lvbikgPT09IHZhbDIudG9GaXhlZChwcmVjaXNpb24pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2FtZSA9IHZhbDEgPT0gdmFsMjtcclxuICAgIH1cclxuICAgIHJldHVybiBzYW1lO1xyXG4gIH0sXHJcblxyXG4gIHNhbWVDYWxscyA9IChjYWxsMSwgY2FsbDIsIGlnbm9yZUFyZ3VtZW50cywgcHJlY2lzaW9uKSA9PiB7XHJcbiAgICB2YXIgc2FtZTtcclxuICAgIGlmICgoY2FsbDEubWV0aG9kICYmIGNhbGwyLm1ldGhvZCkgfHwgKGNhbGwxLmF0dHIgJiYgY2FsbDIuYXR0cikpIHtcclxuICAgICAgaWYgKGlnbm9yZUFyZ3VtZW50cykge1xyXG4gICAgICAgIHNhbWUgPSB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChjYWxsMS5hdHRyKSB7XHJcbiAgICAgICAgICBzYW1lID0gc2FtZVZhbHVlcyhjYWxsMS52YWwsIGNhbGwyLnZhbCwgcHJlY2lzaW9uKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FtZSA9IGNhbGwxLmFyZ3VtZW50cy5sZW5ndGggPT09IGNhbGwyLmFyZ3VtZW50cy5sZW5ndGg7XHJcbiAgICAgICAgICBzYW1lICY9IGNhbGwxLmFyZ3VtZW50cy5yZWR1Y2UoXHJcbiAgICAgICAgICAgIChwcmV2LCBhcmcsIGluZGV4KSA9PiBwcmV2ICYmIHNhbWVWYWx1ZXMoYXJnLCBjYWxsMi5hcmd1bWVudHNbaW5kZXhdLCBwcmVjaXNpb24pLFxyXG4gICAgICAgICAgICB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBzYW1lO1xyXG4gIH0sXHJcblxyXG4gIGNvcm5lcnNPZkFCb3ggPSAoYm94KSA9PiB7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICB7eDogYm94LngsIHk6IGJveC55fSxcclxuICAgICAge3g6IGJveC54ICsgYm94LndpZHRoLCB5OiBib3gueX0sXHJcbiAgICAgIHt4OiBib3gueCArIGJveC53aWR0aCwgeTogYm94LnkgKyBib3guaGVpZ2h0fSxcclxuICAgICAge3g6IGJveC54LCB5OiBib3gueSArIGJveC5oZWlnaHR9XHJcbiAgICBdO1xyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLnRvQmVQYXJ0T2YgPSB0b0JlUGFydE9mO1xyXG4gIHRoaXMudG9CZUluc2lkZVRoZUFyZWFPZiA9IHRvQmVJbnNpZGVUaGVBcmVhT2Y7XHJcbiAgdGhpcy50b0hhdmVUaGVTYW1lUG9zaXRpb25XaXRoID0gdG9IYXZlVGhlU2FtZVBvc2l0aW9uV2l0aDtcclxuICB0aGlzLnRvSGF2ZVRoZVNhbWVTaXplV2l0aCA9IHRvSGF2ZVRoZVNhbWVTaXplV2l0aDtcclxuICB0aGlzLnRvQmVIb3Jpem9udGFsbHlBbGlnbldpdGggPSB0b0JlSG9yaXpvbnRhbGx5QWxpZ25XaXRoO1xyXG4gIHRoaXMudG9CZVZlcnRpY2FsbHlBbGlnbldpdGggPSB0b0JlVmVydGljYWxseUFsaWduV2l0aDtcclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gR2VvbWV0cnkoKSB7XHJcblxyXG4gIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgRVBTSUxPTiA9IE51bWJlci5FUFNJTE9OIHx8IDIuMjIwNDQ2MDQ5MjUwMzEzZS0xNixcclxuICAgICAgUEkgPSBNYXRoLlBJLFxyXG4gICAgICBzaW4gPSBNYXRoLnNpbixcclxuICAgICAgY29zID0gTWF0aC5jb3M7XHJcblxyXG5cclxuICB2YXIgY3JlYXRlTmV3Q2FudmFzQ2FsbFN0YXRlID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYm94OiB7eDogTmFOLCB5OiBOYU4sIHdpZHRoOiBOYU4sIGhlaWdodDogTmFOfSxcclxuICAgICAgdHJhbnNmb3JtczogW1tdXSxcclxuICAgICAgc2hhcGVzSW5QYXRoOiBbXSxcclxuICAgICAgbW92ZVRvTG9jYXRpb246IHt4OiBOYU4sIHk6IE5hTn0sXHJcbiAgICAgIGxpbmVXaWR0aHM6IFsxXVxyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBwYXRoRmlsbFNoYXBlSGFuZGxlcnMgPSB7XHJcbiAgICByZWN0OiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gc2hhcGUueCxcclxuICAgICAgICB5ID0gc2hhcGUueSxcclxuICAgICAgICB3aWR0aCA9IHNoYXBlLndpZHRoLFxyXG4gICAgICAgIGhlaWdodCA9IHNoYXBlLmhlaWdodCxcclxuICAgICAgICBuZXdCb3ggPSB7eDogeCwgeTogeSwgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH07XHJcbiAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGFyYzogKHN0YXRlLCBzaGFwZSkgPT4ge1xyXG4gICAgICB2YXIgY3ggPSBzaGFwZS5jeCxcclxuICAgICAgICAgIGN5ID0gc2hhcGUuY3ksXHJcbiAgICAgICAgICByID0gc2hhcGUucixcclxuICAgICAgICAgIHN4ID0gc2hhcGUuc3gsXHJcbiAgICAgICAgICBzeSA9IHNoYXBlLnN5LFxyXG4gICAgICAgICAgc0FuZ2xlID0gc2hhcGUuc0FuZ2xlLFxyXG4gICAgICAgICAgZUFuZ2xlID0gc2hhcGUuZUFuZ2xlLFxyXG4gICAgICAgICAgY291bnRlcmNsb2Nrd2lzZSA9IHNoYXBlLmNvdW50ZXJjbG9ja3dpc2UsXHJcbiAgICAgICAgICBhcmNBbmdsZXMgPSByZWxldmFudEFyY0FuZ2xlcyhyLCBzQW5nbGUsIGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZSksXHJcbiAgICAgICAgICBzY2FsZWRBcmNQb2ludHMgPSBhcmNBbmdsZXMubWFwKChhKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBzciA9IHNjYWxlZFJhZGl1cyhyLCBzeCwgc3ksIGEpO1xyXG4gICAgICAgICAgICByZXR1cm4ge3g6IGN4ICsgc3IqY29zKGEpLCB5OiBjeSArIHNyKnNpbihhKX07XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICAgIG5ld0JveCA9IGJveFBvaW50cyhzY2FsZWRBcmNQb2ludHMpO1xyXG4gICAgICBpZiAoIWlzTmFOKGN4KSAmJiAhaXNOYU4oY3kpICYmIGFyY0FuZ2xlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBwYXRoU3Ryb2tlU2hhcGVIYW5kbGVycyA9IHtcclxuICAgIHJlY3Q6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIHggPSBzaGFwZS54LFxyXG4gICAgICAgIHkgPSBzaGFwZS55LFxyXG4gICAgICAgIHdpZHRoID0gc2hhcGUud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0ID0gc2hhcGUuaGVpZ2h0LFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IHN0YXRlLmxpbmVXaWR0aCAhPT0gMSA/IHN0YXRlLmxpbmVXaWR0aCA6IDAsXHJcbiAgICAgICAgeFNjYWxlZExpbmVXaWR0aCA9IHNjYWxlZExpbmVXaWR0aCAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54LFxyXG4gICAgICAgIHlTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBuZXdCb3ggPSB7eDogeCAtIHhTY2FsZWRMaW5lV2lkdGggIC8gMiwgeTogeSAtIHlTY2FsZWRMaW5lV2lkdGggLyAyLCB3aWR0aDogd2lkdGggKyB4U2NhbGVkTGluZVdpZHRoLCBoZWlnaHQ6IGhlaWdodCArIHlTY2FsZWRMaW5lV2lkdGh9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmM6IChzdGF0ZSwgc2hhcGUpID0+IHtcclxuICAgICAgdmFyIGN4ID0gc2hhcGUuY3gsXHJcbiAgICAgICAgICBjeSA9IHNoYXBlLmN5LFxyXG4gICAgICAgICAgciA9IHNoYXBlLnIsXHJcbiAgICAgICAgICBzeCA9IHNoYXBlLnN4LFxyXG4gICAgICAgICAgc3kgPSBzaGFwZS5zeSxcclxuICAgICAgICAgIHNBbmdsZSA9IHNoYXBlLnNBbmdsZSxcclxuICAgICAgICAgIGVBbmdsZSA9IHNoYXBlLmVBbmdsZSxcclxuICAgICAgICAgIGNvdW50ZXJjbG9ja3dpc2UgPSBzaGFwZS5jb3VudGVyY2xvY2t3aXNlLFxyXG4gICAgICAgICAgYXJjQW5nbGVzID0gcmVsZXZhbnRBcmNBbmdsZXMoc0FuZ2xlLCBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2UpLFxyXG4gICAgICAgICAgc2NhbGVkQXJjUG9pbnRzID0gZmxhdHRlbihhcmNBbmdsZXMubWFwKChhKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciB3ID0gc2NhbGVkUmFkaXVzKHN0YXRlLmxpbmVXaWR0aCwgc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LCBhKSxcclxuICAgICAgICAgICAgICAgIHNpciA9IHNjYWxlZFJhZGl1cyhyLCBzeCwgc3ksIGEpIC0gdy8yLCAvLyBpbm5lciByYWRpdXNcclxuICAgICAgICAgICAgICAgIHNyID0gc2NhbGVkUmFkaXVzKHIsIHN4LCBzeSwgYSksICAgIC8vIHJhZGl1c1xyXG4gICAgICAgICAgICAgICAgc29yID0gc2NhbGVkUmFkaXVzKHIsIHN4LCBzeSwgYSkgKyB3LzIsIC8vIG91dGVyIHJhZGl1c1xyXG4gICAgICAgICAgICAgICAgcG9pbnRzID0gW107XHJcbiAgICAgICAgICAgIGlmICh3ID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgcG9pbnRzLnB1c2goe3g6IGN4ICsgc3IqY29zKGEpLCB5OiBjeSArIHNyKnNpbihhKX0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBvaW50cy5wdXNoKHt4OiBjeCArIHNpcipjb3MoYSksIHk6IGN5ICsgc2lyKnNpbihhKX0pO1xyXG4gICAgICAgICAgICAgIHBvaW50cy5wdXNoKHt4OiBjeCArIHNvcipjb3MoYSksIHk6IGN5ICsgc29yKnNpbihhKX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwb2ludHM7XHJcbiAgICAgICAgICB9KSksXHJcbiAgICAgICAgICBuZXdCb3ggPSBib3hQb2ludHMoc2NhbGVkQXJjUG9pbnRzKTtcclxuICAgICAgaWYgKCFpc05hTihjeCkgJiYgIWlzTmFOKGN5KSAmJiBhcmNBbmdsZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIHN0YXRlLmJveCA9IHVuaW9uKHN0YXRlLmJveCwgbmV3Qm94KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgbGluZVRvOiAoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciB4MSA9IHNoYXBlLngxLFxyXG4gICAgICAgIHkxID0gc2hhcGUueTEsXHJcbiAgICAgICAgeDIgPSBzaGFwZS54MixcclxuICAgICAgICB5MiA9IHNoYXBlLnkyLFxyXG4gICAgICAgIHNjYWxlZExpbmVXaWR0aCA9IGdldFNjYWxlZFdpZHRoT2ZMaW5lKHgxLCB5MSwgeDIsIHkyLCBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCwgc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksIHN0YXRlLmxpbmVXaWR0aCksXHJcbiAgICAgICAgcmVjdCA9IGdldFJlY3RBcm91bmRMaW5lKHgxLCB5MSwgeDIsIHkyLCBzY2FsZWRMaW5lV2lkdGggIT09IDEgPyBzY2FsZWRMaW5lV2lkdGggOiAwKSxcclxuICAgICAgICBuZXdCb3ggPSB7XHJcbiAgICAgICAgICB4OiBNYXRoLm1pbihyZWN0LngxLCByZWN0LngyLCByZWN0LngzLCByZWN0Lng0KSxcclxuICAgICAgICAgIHk6IE1hdGgubWluKHJlY3QueTEsIHJlY3QueTIsIHJlY3QueTMsIHJlY3QueTQpLFxyXG4gICAgICAgICAgd2lkdGg6IE1hdGgubWF4KHJlY3QueDEsIHJlY3QueDIsIHJlY3QueDMsIHJlY3QueDQpIC0gTWF0aC5taW4ocmVjdC54MSwgcmVjdC54MiwgcmVjdC54MywgcmVjdC54NCksXHJcbiAgICAgICAgICBoZWlnaHQ6IE1hdGgubWF4KHJlY3QueTEsIHJlY3QueTIsIHJlY3QueTMsIHJlY3QueTQpIC0gTWF0aC5taW4ocmVjdC55MSwgcmVjdC55MiwgcmVjdC55MywgcmVjdC55NClcclxuICAgICAgICB9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBjYW52YXNDYWxsSGFuZGxlcnMgPSB7XHJcbiAgICBsaW5lV2lkdGg6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS5saW5lV2lkdGhzW3N0YXRlLmxpbmVXaWR0aHMubGVuZ3RoIC0gMV0gPSBjYWxsLnZhbDtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGZpbGxSZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIG5ld0JveCA9IHt4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcclxuICAgICAgc3RhdGUuYm94ID0gdW5pb24oc3RhdGUuYm94LCBuZXdCb3gpO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc3Ryb2tlUmVjdDogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHZhciB4ID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICB3aWR0aCA9IGNhbGwuYXJndW1lbnRzWzJdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLngsXHJcbiAgICAgICAgaGVpZ2h0ID0gY2FsbC5hcmd1bWVudHNbM10gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSxcclxuICAgICAgICBzY2FsZWRMaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggIT09IDEgPyBzdGF0ZS5saW5lV2lkdGggOiAwLFxyXG4gICAgICAgIHhTY2FsZWRMaW5lV2lkdGggPSBzY2FsZWRMaW5lV2lkdGggKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICB5U2NhbGVkTGluZVdpZHRoID0gc2NhbGVkTGluZVdpZHRoICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgbmV3Qm94ID0ge3g6IHggLSB4U2NhbGVkTGluZVdpZHRoIC8gMiwgeTogeSAtIHlTY2FsZWRMaW5lV2lkdGggLyAyLCB3aWR0aDogd2lkdGggKyB4U2NhbGVkTGluZVdpZHRoLCBoZWlnaHQ6IGhlaWdodCArIHlTY2FsZWRMaW5lV2lkdGh9O1xyXG4gICAgICBzdGF0ZS5ib3ggPSB1bmlvbihzdGF0ZS5ib3gsIG5ld0JveCk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICByZWN0OiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIHkgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgIHdpZHRoID0gY2FsbC5hcmd1bWVudHNbMl0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBoZWlnaHQgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55O1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ3JlY3QnLCB4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBhcmM6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgY3ggPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgIGN5ID0gY2FsbC5hcmd1bWVudHNbMV0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueSArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSxcclxuICAgICAgICByID0gY2FsbC5hcmd1bWVudHNbMl0sXHJcbiAgICAgICAgc3ggPSBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICBzeSA9IHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55LFxyXG4gICAgICAgIHNBbmdsZSA9IGNhbGwuYXJndW1lbnRzWzNdLFxyXG4gICAgICAgIGVBbmdsZSA9IGNhbGwuYXJndW1lbnRzWzRdLFxyXG4gICAgICAgIGNvdW50ZXJjbG9ja3dpc2UgPSBjYWxsLmFyZ3VtZW50c1s1XSB8fCBmYWxzZTtcclxuICAgICAgc3RhdGUuc2hhcGVzSW5QYXRoLnB1c2goe3R5cGU6ICdhcmMnLCBjeDogY3gsIGN5OiBjeSwgcjogciwgc3g6IHN4LCBzeTogc3ksIHNBbmdsZTogc0FuZ2xlLCBlQW5nbGU6IGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZTogY291bnRlcmNsb2Nrd2lzZX0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgbW92ZVRvOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgdmFyIHgxID0gY2FsbC5hcmd1bWVudHNbMF0gKiBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCArIHN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueCxcclxuICAgICAgICB5MSA9IGNhbGwuYXJndW1lbnRzWzFdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnkgKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnk7XHJcbiAgICAgIHN0YXRlLm1vdmVUb0xvY2F0aW9uID0ge3g6IHgxLCB5OiB5MX07XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBsaW5lVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDEgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi54LFxyXG4gICAgICAgIHkxID0gc3RhdGUubW92ZVRvTG9jYXRpb24ueSxcclxuICAgICAgICB4MiA9IGNhbGwuYXJndW1lbnRzWzBdICogc3RhdGUudHJhbnNmb3JtLnNjYWxlLnggKyBzdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLngsXHJcbiAgICAgICAgeTIgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55O1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGgucHVzaCh7dHlwZTogJ2xpbmVUbycsIHgxOiB4MSwgeTE6IHkxLCB4MjogeDIsIHkyOiB5Mn0pO1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgYXJjVG86IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgeDAgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi54LFxyXG4gICAgICAgICAgeTAgPSBzdGF0ZS5tb3ZlVG9Mb2NhdGlvbi55LFxyXG4gICAgICAgICAgeDEgPSBjYWxsLmFyZ3VtZW50c1swXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgICAgeTEgPSBjYWxsLmFyZ3VtZW50c1sxXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgICAgeDIgPSBjYWxsLmFyZ3VtZW50c1syXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS54ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxyXG4gICAgICAgICAgeTIgPSBjYWxsLmFyZ3VtZW50c1szXSAqIHN0YXRlLnRyYW5zZm9ybS5zY2FsZS55ICsgc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS55LFxyXG4gICAgICAgICAgciA9IGNhbGwuYXJndW1lbnRzWzRdLFxyXG4gICAgICAgICAgc3ggPSBzdGF0ZS50cmFuc2Zvcm0uc2NhbGUueCxcclxuICAgICAgICAgIHN5ID0gc3RhdGUudHJhbnNmb3JtLnNjYWxlLnksXHJcbiAgICAgICAgICBkZWNvbXBvc2l0aW9uID0gZGVjb21wb3NlQXJjVG8oeDAsIHkwLCB4MSwgeTEsIHgyLCB5Miwgciwgc3gsIHN5KTtcclxuICAgICAgaWYgKGRlY29tcG9zaXRpb24ubGluZSkge1xyXG4gICAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnbGluZVRvJywgeDE6IGRlY29tcG9zaXRpb24ubGluZS54MSwgeTE6IGRlY29tcG9zaXRpb24ubGluZS55MSwgeDI6IGRlY29tcG9zaXRpb24ubGluZS54MiwgeTI6IGRlY29tcG9zaXRpb24ubGluZS55Mn0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChkZWNvbXBvc2l0aW9uLmFyYykge1xyXG4gICAgICAgIHN0YXRlLnNoYXBlc0luUGF0aC5wdXNoKHt0eXBlOiAnYXJjJywgY3g6IGRlY29tcG9zaXRpb24uYXJjLngsIGN5OiBkZWNvbXBvc2l0aW9uLmFyYy55LCByOiByLCBzeDogc3gsIHN5OiBzeSwgc0FuZ2xlOiBkZWNvbXBvc2l0aW9uLmFyYy5zQW5nbGUsIGVBbmdsZTogZGVjb21wb3NpdGlvbi5hcmMuZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlOiBkZWNvbXBvc2l0aW9uLmFyYy5jb3VudGVyY2xvY2t3aXNlfSk7XHJcbiAgICAgIH1cclxuICAgICAgc3RhdGUubW92ZVRvTG9jYXRpb24gPSB7eDogZGVjb21wb3NpdGlvbi5wb2ludC54LCB5OiBkZWNvbXBvc2l0aW9uLnBvaW50Lnl9O1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG4gICAgc2F2ZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIHN0YXRlLnRyYW5zZm9ybXMucHVzaChbXSk7XHJcbiAgICAgIHN0YXRlLmxpbmVXaWR0aHMucHVzaChsYXN0RWxlbWVudChzdGF0ZS5saW5lV2lkdGhzKSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICByZXN0b3JlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgc3RhdGUudHJhbnNmb3Jtcy5wb3AoKTtcclxuICAgICAgc3RhdGUubGluZVdpZHRocy5wb3AoKTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHRyYW5zbGF0ZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIGxhc3RFbGVtZW50KHN0YXRlLnRyYW5zZm9ybXMpXHJcbiAgICAgICAgLnB1c2goe3RyYW5zbGF0ZToge3g6IGNhbGwuYXJndW1lbnRzWzBdLCB5OiBjYWxsLmFyZ3VtZW50c1sxXX19KTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIHNjYWxlOiAoc3RhdGUsIGNhbGwpID0+IHtcclxuICAgICAgbGFzdEVsZW1lbnQoc3RhdGUudHJhbnNmb3JtcylcclxuICAgICAgICAucHVzaCh7c2NhbGU6IHt4OiBjYWxsLmFyZ3VtZW50c1swXSwgeTogY2FsbC5hcmd1bWVudHNbMV19fSk7XHJcbiAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcbiAgICBiZWdpblBhdGg6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICBzdGF0ZS5zaGFwZXNJblBhdGggPSBbXTtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfSxcclxuICAgIGZpbGw6IChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICByZXR1cm4gc3RhdGUuc2hhcGVzSW5QYXRoLnJlZHVjZSgoc3RhdGUsIHNoYXBlKSA9PiB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIgPSBnZXRQYXRoRmlsbFNoYXBlSGFuZGxlcihzaGFwZSk7XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZXIoc3RhdGUsIHNoYXBlKTtcclxuICAgICAgfSwgc3RhdGUpO1xyXG4gICAgfSxcclxuICAgIHN0cm9rZTogKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdGF0ZS5zaGFwZXNJblBhdGgubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgc2hhcGUgPSBzdGF0ZS5zaGFwZXNJblBhdGhbaV0sXHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSBnZXRQYXRoU3Ryb2tlU2hhcGVIYW5kbGVyKHNoYXBlKTtcclxuICAgICAgICBzdGF0ZSA9IGhhbmRsZXIoc3RhdGUsIHNoYXBlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgbnVsbENhbnZhc0NhbGxIYW5kbGVyID0gKHN0YXRlLCBjYWxsKSA9PiB7XHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbiAgfSxcclxuXHJcbiAgZ2V0Q2FudmFzQ2FsbEhhbmRsZXIgPSAoY2FsbCkgPT4ge1xyXG4gICAgcmV0dXJuIGNhbnZhc0NhbGxIYW5kbGVyc1tjYWxsLm1ldGhvZF0gfHwgY2FudmFzQ2FsbEhhbmRsZXJzW2NhbGwuYXR0cl0gfHwgbnVsbENhbnZhc0NhbGxIYW5kbGVyO1xyXG4gIH0sXHJcblxyXG4gIGdldFBhdGhGaWxsU2hhcGVIYW5kbGVyID0gKHNoYXBlKSA9PiB7XHJcbiAgICByZXR1cm4gcGF0aEZpbGxTaGFwZUhhbmRsZXJzW3NoYXBlLnR5cGVdO1xyXG4gIH0sXHJcblxyXG4gIGdldFBhdGhTdHJva2VTaGFwZUhhbmRsZXIgPSAoc2hhcGUpID0+IHtcclxuICAgIHJldHVybiBwYXRoU3Ryb2tlU2hhcGVIYW5kbGVyc1tzaGFwZS50eXBlXTtcclxuICB9LFxyXG5cclxuICBwcmVDYW52YXNDYWxsSGFuZGxlciA9IChzdGF0ZSkgPT4ge1xyXG4gICAgc3RhdGUudHJhbnNmb3JtID0gdG90YWxUcmFuc2Zvcm0oZmxhdHRlbihzdGF0ZS50cmFuc2Zvcm1zKSk7XHJcbiAgICBzdGF0ZS5saW5lV2lkdGggPSBsYXN0RWxlbWVudChzdGF0ZS5saW5lV2lkdGhzKTtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9LFxyXG5cclxuICBnZXRCQm94ID0gKHNoYXBlKSA9PiB7XHJcbiAgICB2YXIgc3RhdGUgPSBjcmVhdGVOZXdDYW52YXNDYWxsU3RhdGUoKTtcclxuICAgIHN0YXRlID0gc2hhcGUucmVkdWNlKChzdGF0ZSwgY2FsbCkgPT4ge1xyXG4gICAgICB2YXIgaGFuZGxlciA9IGdldENhbnZhc0NhbGxIYW5kbGVyKGNhbGwpO1xyXG4gICAgICByZXR1cm4gaGFuZGxlcihwcmVDYW52YXNDYWxsSGFuZGxlcihzdGF0ZSksIGNhbGwpO1xyXG4gICAgfSwgY3JlYXRlTmV3Q2FudmFzQ2FsbFN0YXRlKCkpO1xyXG4gICAgcmV0dXJuIHN0YXRlLmJveDtcclxuICB9LFxyXG5cclxuICBmbGF0dGVuID0gKGFycmF5KSA9PiB7XHJcbiAgICByZXR1cm4gYXJyYXlcclxuICAgICAgLnJlZHVjZSgocHJldmlvdXNBcnJheSwgY3VycmVudEFycmF5KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHByZXZpb3VzQXJyYXkuY29uY2F0KGN1cnJlbnRBcnJheSk7XHJcbiAgICAgIH0sIFtdKTtcclxuICB9LFxyXG5cclxuICBsYXN0RWxlbWVudCA9IChhcnJheSkgPT4ge1xyXG4gICAgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xyXG4gIH0sXHJcblxyXG4gIGZpcnN0VHJ1dGh5T3JaZXJvID0gKHZhbDEsIHZhbDIpID0+e1xyXG4gICAgaWYgKHZhbDEgfHwgdmFsMSA9PT0gMCkge1xyXG4gICAgICByZXR1cm4gdmFsMTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWwyO1xyXG4gIH0sXHJcblxyXG4gIHVuaW9uID0gKGJveDEsIGJveDIpID0+IHtcclxuICAgIGJveDEgPSB7XHJcbiAgICAgIHg6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDEueCwgYm94Mi54KSxcclxuICAgICAgeTogZmlyc3RUcnV0aHlPclplcm8oYm94MS55LCBib3gyLnkpLFxyXG4gICAgICB3aWR0aDogZmlyc3RUcnV0aHlPclplcm8oYm94MS53aWR0aCwgYm94Mi53aWR0aCksXHJcbiAgICAgIGhlaWdodDogZmlyc3RUcnV0aHlPclplcm8oYm94MS5oZWlnaHQsIGJveDIuaGVpZ2h0KVxyXG4gICAgfTtcclxuICAgIGJveDIgPSB7XHJcbiAgICAgIHg6IGZpcnN0VHJ1dGh5T3JaZXJvKGJveDIueCwgYm94MS54KSxcclxuICAgICAgeTogZmlyc3RUcnV0aHlPclplcm8oYm94Mi55LCBib3gxLnkpLFxyXG4gICAgICB3aWR0aDogZmlyc3RUcnV0aHlPclplcm8oYm94Mi53aWR0aCwgYm94MS53aWR0aCksXHJcbiAgICAgIGhlaWdodDogZmlyc3RUcnV0aHlPclplcm8oYm94Mi5oZWlnaHQsIGJveDEuaGVpZ2h0KVxyXG4gICAgfTtcclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgIHg6IE1hdGgubWluKGJveDEueCwgYm94Mi54KSxcclxuICAgICAgeTogTWF0aC5taW4oYm94MS55LCBib3gyLnkpLFxyXG4gICAgICB3aWR0aDogTWF0aC5tYXgoYm94MS53aWR0aCwgYm94Mi53aWR0aCwgYm94MS54IDwgYm94Mi54XHJcbiAgICAgICAgPyBib3gxLndpZHRoICsgYm94Mi53aWR0aCArIChib3gyLnggLSAoYm94MS54ICsgYm94MS53aWR0aCkpXHJcbiAgICAgICAgOiBib3gxLndpZHRoICsgYm94Mi53aWR0aCArIChib3gxLnggLSAoYm94Mi54ICsgYm94Mi53aWR0aCkpKSxcclxuICAgICAgaGVpZ2h0OiBNYXRoLm1heChib3gxLmhlaWdodCwgYm94Mi5oZWlnaHQsIGJveDEueSA8IGJveDIueVxyXG4gICAgICAgID8gYm94MS5oZWlnaHQgKyBib3gyLmhlaWdodCArIChib3gyLnkgLSAoYm94MS55ICsgYm94MS5oZWlnaHQpKVxyXG4gICAgICAgIDogYm94MS5oZWlnaHQgKyBib3gyLmhlaWdodCArIChib3gxLnkgLSAoYm94Mi55ICsgYm94Mi5oZWlnaHQpKSlcclxuICAgIH07XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sXHJcblxyXG4gIGJveFBvaW50cyA9IChwb2ludHMpID0+IHtcclxuICAgIHZhciB4ZXMgPSBwb2ludHMubWFwKChwKSA9PiBwLngpLFxyXG4gICAgICAgIHllcyA9IHBvaW50cy5tYXAoKHApID0+IHAueSksXHJcbiAgICAgICAgbWluWCA9IE1hdGgubWluLmFwcGx5KG51bGwsIHhlcyksXHJcbiAgICAgICAgbWF4WCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIHhlcyksXHJcbiAgICAgICAgbWluWSA9IE1hdGgubWluLmFwcGx5KG51bGwsIHllcyksXHJcbiAgICAgICAgbWF4WSA9IE1hdGgubWF4LmFwcGx5KG51bGwsIHllcyksXHJcbiAgICAgICAgYm94ID0ge3g6IE5hTiwgeTogTmFOLCB3aWR0aDogTmFOLCBoZWlnaHQ6IE5hTn07XHJcbiAgICBpZiAobWluWCAhPT0gK0luZmluaXR5ICYmIG1heFggIT09IC1JbmZpbml0eSAmJiBtaW5ZICE9PSArSW5maW5pdHkgJiYgbWF4WSAhPT0gLUluZmluaXR5KSB7XHJcbiAgICAgIGJveCA9IHtcclxuICAgICAgICB4OiBtaW5YLFxyXG4gICAgICAgIHk6IG1pblksXHJcbiAgICAgICAgd2lkdGg6IG1heFggLSBtaW5YLFxyXG4gICAgICAgIGhlaWdodDogbWF4WSAtIG1pbllcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIHJldHVybiBib3g7XHJcbiAgfSxcclxuXHJcbiAgdG90YWxUcmFuc2Zvcm0gPSAodHJhbnNmb3JtcykgPT4ge1xyXG4gICAgcmV0dXJuIHRyYW5zZm9ybXNcclxuICAgICAgLm1hcCgodmFsdWUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHJhbnNsYXRlOiB2YWx1ZS50cmFuc2xhdGUgfHwge3g6IDAsIHk6IDB9LFxyXG4gICAgICAgICAgc2NhbGU6IHZhbHVlLnNjYWxlIHx8IHt4OiAxLCB5OiAxfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pXHJcbiAgICAgIC5yZWR1Y2UoKHByZXZpb3VzVmFsdWUsIGN1cnJlbnRWYWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0cmFuc2xhdGU6IHtcclxuICAgICAgICAgICAgeDogcHJldmlvdXNWYWx1ZS50cmFuc2xhdGUueCArIGN1cnJlbnRWYWx1ZS50cmFuc2xhdGUueCAqIHByZXZpb3VzVmFsdWUuc2NhbGUueCxcclxuICAgICAgICAgICAgeTogcHJldmlvdXNWYWx1ZS50cmFuc2xhdGUueSArIGN1cnJlbnRWYWx1ZS50cmFuc2xhdGUueSAqIHByZXZpb3VzVmFsdWUuc2NhbGUueVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNjYWxlOiB7XHJcbiAgICAgICAgICAgIHg6IHByZXZpb3VzVmFsdWUuc2NhbGUueCAqIGN1cnJlbnRWYWx1ZS5zY2FsZS54LFxyXG4gICAgICAgICAgICB5OiBwcmV2aW91c1ZhbHVlLnNjYWxlLnkgKiBjdXJyZW50VmFsdWUuc2NhbGUueVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sIHt0cmFuc2xhdGU6IHt4OiAwLCB5OiAwfSwgc2NhbGU6IHt4OiAxLCB5OiAxfX0pO1xyXG4gIH0sXHJcblxyXG4gIGdldFJlY3RBcm91bmRMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCB3aWR0aCkgPT4ge1xyXG4gICAgdmFyIHJlY3Q7XHJcbiAgICBpZiAoeDEgPT09IHkxICYmIHgxID09PSB4MiAmJiB4MSA9PT0geTIpIHtcclxuICAgICAgcmVjdCA9IHtcclxuICAgICAgICB4MTogeDEsIHkxOiB4MSwgIHgyOiB4MSwgeTI6IHgxLFxyXG4gICAgICAgIHg0OiB4MSwgeTQ6IHgxLCAgeDM6IHgxLCB5MzogeDFcclxuICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlY3QgPSBnZXRSZWN0QXJvdW5kTG9uZ0xpbmUoeDEsIHkxLCB4MiwgeTIsIHdpZHRoKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZWN0O1xyXG4gIH0sXHJcblxyXG4gIGdldFJlY3RBcm91bmRMb25nTGluZSA9ICh4MSwgeTEsIHgyLCB5Miwgd2lkdGgpID0+IHtcclxuICAgIC8vICByID0gdGhlIHJhZGl1cyBvciB0aGUgZ2l2ZW4gZGlzdGFuY2UgZnJvbSBhIGdpdmVuIHBvaW50IHRvIHRoZSBuZWFyZXN0IGNvcm5lcnMgb2YgdGhlIHJlY3RcclxuICAgIC8vICBhID0gdGhlIGFuZ2xlIGJldHdlZW4gdGhlIGxpbmUgYW5kIHRoZSBob3Jpem9udGFsIGF4aXNcclxuICAgIC8vICBiMSwgYjIgPSB0aGUgYW5nbGUgYmV0d2VlbiBoYWxmIHRoZSBoaWdodCBvZiB0aGUgcmVjdGFuZ2xlIGFuZCB0aGUgaG9yaXpvbnRhbCBheGlzXHJcbiAgICAvL1xyXG4gICAgLy8gIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSB0aGUgZ2l2ZW4gbGluZSBpcyBob3Jpem9udGFsLCBzbyBhID0gMC5cclxuICAgIC8vICBUaGUgZ2l2ZW4gbGluZSBpcyBiZXR3ZWVuIHRoZSB0d28gQCBzeW1ib2xzLlxyXG4gICAgLy8gIFRoZSArIHN5bWJvbHMgYXJlIHRoZSBjb3JuZXJzIG9mIHJlY3RhbmdsZSB0byBiZSBkZXRlcm1pbmVkLlxyXG4gICAgLy8gIEluIG9yZGVyIHRvIGZpbmQgdGhlIGIxIGFuZCBiMiBhbmdsZXMgd2UgaGF2ZSB0byBhZGQgUEkvMiBhbmQgcmVzcGVjdGl2bHkgc3VidHJhY3QgUEkvMi5cclxuICAgIC8vICBiMSBpcyB2ZXJ0aWNhbCBhbmQgcG9pbnRpbmcgdXB3b3JkcyBhbmQgYjIgaXMgYWxzbyB2ZXJ0aWNhbCBidXQgcG9pbnRpbmcgZG93bndvcmRzLlxyXG4gICAgLy8gIEVhY2ggY29ybmVyIGlzIHIgb3Igd2lkdGggLyAyIGZhciBhd2F5IGZyb20gaXRzIGNvcmVzcG9uZGVudCBsaW5lIGVuZGluZy5cclxuICAgIC8vICBTbyB3ZSBrbm93IHRoZSBkaXN0YW5jZSAociksIHRoZSBzdGFydGluZyBwb2ludHMgKHgxLCB5MSkgYW5kICh4MiwgeTIpIGFuZCB0aGUgKGIxLCBiMikgZGlyZWN0aW9ucy5cclxuICAgIC8vXHJcbiAgICAvLyAgKHgxLHkxKSAgICAgICAgICAgICAgICAgICAgKHgyLHkyKVxyXG4gICAgLy8gICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xyXG4gICAgLy8gICAgICBeICAgICAgICAgICAgICAgICAgICAgICAgXlxyXG4gICAgLy8gICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gICAgLy8gICAgICB8IGIxICAgICAgICAgICAgICAgICAgICAgfCBiMVxyXG4gICAgLy8gICAgICBAPT09PT09PT09PT09PT09PT09PT09PT09QFxyXG4gICAgLy8gICAgICB8IGIyICAgICAgICAgICAgICAgICAgICAgfCBiMlxyXG4gICAgLy8gICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gICAgLy8gICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgdlxyXG4gICAgLy8gICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xyXG4gICAgLy8gICh4NCx5NCkgICAgICAgICAgICAgICAgICAgICh4Myx5MylcclxuICAgIC8vXHJcblxyXG4gICAgdmFyIHIgPSB3aWR0aCAvIDIsXHJcbiAgICAgIGEgPSBNYXRoLmF0YW4oKHkyIC0geTEpIC8gKHgyIC0geDEpKSxcclxuICAgICAgYjEgPSBhICsgTWF0aC5QSS8yLFxyXG4gICAgICBiMiA9IGEgLSBNYXRoLlBJLzIsXHJcbiAgICAgIHJ4MSA9IHIgKiBNYXRoLmNvcyhiMSkgKyB4MSxcclxuICAgICAgcnkxID0gciAqIE1hdGguc2luKGIxKSArIHkxLFxyXG4gICAgICByeDIgPSByICogTWF0aC5jb3MoYjEpICsgeDIsXHJcbiAgICAgIHJ5MiA9IHIgKiBNYXRoLnNpbihiMSkgKyB5MixcclxuICAgICAgcngzID0gciAqIE1hdGguY29zKGIyKSArIHgyLFxyXG4gICAgICByeTMgPSByICogTWF0aC5zaW4oYjIpICsgeTIsXHJcbiAgICAgIHJ4NCA9IHIgKiBNYXRoLmNvcyhiMikgKyB4MSxcclxuICAgICAgcnk0ID0gciAqIE1hdGguc2luKGIyKSArIHkxO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDE6IHJ4MSwgeTE6IHJ5MSwgIHgyOiByeDIsIHkyOiByeTIsXHJcbiAgICAgIHg0OiByeDQsIHk0OiByeTQsICB4MzogcngzLCB5MzogcnkzXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIGdldFNjYWxlZFdpZHRoT2ZMaW5lID0gKHgxLCB5MSwgeDIsIHkyLCBzeCwgc3ksIHdpZHRoKSA9PiB7XHJcbiAgICAvLyAgVGhlIG9yaWdpbmFsIHBvaW50cyBhcmUgbm90IG1vdmVkLiBPbmx5IHRoZSB3aWR0aCB3aWxsIGJlIHNjYWxlZC5cclxuICAgIC8vICBUaGUgd2lkdGggb2YgYW4gaG9yaXpvbnRhbCBsaW5lIHdpbGwgYmUgc2NhbGVkIHdpdGggdGhlIHN5IHJhdGlvIG9ubHkuXHJcbiAgICAvLyAgVGhlIHdpZHRoIG9mIGEgdmVydGl2YWwgbGluZSB3aWxsIGJlIHNjYWxlZCB3aXRoIHRoZSBzeCByYXRpbyBvbmx5LlxyXG4gICAgLy8gIFRoZSB3aWR0aCBvZiBhbiBvYmxpcXVlIGxpbmUgd2lsbCBiZSBzY2FsZWQgd2l0aCBib3RoIHRoZSBzeCBhbmQgc3lcclxuICAgIC8vYnV0IHByb3BvcnRpb25hbCB3aXRoIHRoZSBhbmdsZSBiZXR3ZWVuIHRoZSBsaW5lIGFuZCB0aGUgeCBhbmQgeSBheGVzLlxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cXFxyXG4gICAgLy8gICAgICAgICAgICAgICAuXFwgICh4Mix5MikgICAgICAgICAgICAgICAgICAgICAgICAgLi4uXFwgICh4Mix5MilcclxuICAgIC8vICAgICAgICAgICAgICAuLi5AICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4uLkBcclxuICAgIC8vICAgICAgICAgICAgIC4uLi8uXFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4uLi8uXFxcclxuICAgIC8vICAgICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICAgc3ggICAgICAgICAgICAgLi4uLi4vLi4uXFxcclxuICAgIC8vICAgICAgICAgICAuLi4vLi4uICAgICAgICAgICAgKy0tLT4gICAgICAgICAgICAuLi4uLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgLi4uLi4vLi4uLi5cclxuICAgIC8vICAgICAgICAgLi4uLy4uLiAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgIFxcLi4uLy4uLi4uXHJcbiAgICAvLyAgICAgICAgIFxcLi8uLi4gICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgIFxcLi8uLi4uLlxyXG4gICAgLy8gICAgICAgICAgQC4uLiAgICAgICAgICAgICBzeSB2ICAgICAgICAgICAgICAgICBALi4uLi5cclxuICAgIC8vICAoeDEseTEpICBcXC4gICAgICAgICAgICAgICAgICAgICAgICAgICAoeDEseTEpICBcXC4uLlxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcLlxyXG4gICAgLy9cclxuICAgIHZhciBhID0gTWF0aC5hdGFuKCh5MiAtIHkxKSAvICh4MiAtIHgxKSksXHJcbiAgICAgIHNpbmEgPSBNYXRoLnNpbihhKSwgY29zYSA9IE1hdGguY29zKGEpLFxyXG4gICAgICBzY2FsZWRXaWR0aCA9IHdpZHRoICogTWF0aC5zcXJ0KHN4KnN4ICogc2luYSpzaW5hICsgc3kqc3kgKiBjb3NhKmNvc2EpO1xyXG4gICAgcmV0dXJuIHNjYWxlZFdpZHRoO1xyXG4gIH0sXHJcblxyXG4gIGdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQgPSAoeDEsIHkxLCB4MiwgeTIsIGRpc3RhbmNlKSA9PiB7XHJcbiAgICB2YXIgcmVjdCA9IGdldFJlY3RBcm91bmRMb25nTGluZSh4MSwgeTEsIHgyLCB5MiwgMiAqIGRpc3RhbmNlKTtcclxuICAgIHJldHVybiBbXHJcbiAgICAgIHt4MTogcmVjdC54MSwgeTE6IHJlY3QueTEsIHgyOiByZWN0LngyLCB5MjogcmVjdC55Mn0sXHJcbiAgICAgIHt4MTogcmVjdC54NCwgeTE6IHJlY3QueTQsIHgyOiByZWN0LngzLCB5MjogcmVjdC55M31cclxuICAgIF07XHJcbiAgfSxcclxuXHJcbiAgZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcyA9IChsMSwgbDIpID0+IHtcclxuICAgIHZhciBhMSA9IGwxLnkyIC0gbDEueTEsIGIxID0gbDEueDEgLSBsMS54MiwgYzEgPSBsMS54MipsMS55MSAtIGwxLngxKmwxLnkyLFxyXG4gICAgICAgIGEyID0gbDIueTIgLSBsMi55MSwgYjIgPSBsMi54MSAtIGwyLngyLCBjMiA9IGwyLngyKmwyLnkxIC0gbDIueDEqbDIueTIsXHJcbiAgICAgICAgeCA9IChjMipiMSAtIGMxKmIyKSAvIChhMSpiMiAtIGEyKmIxKSxcclxuICAgICAgICB5ID0gbDIueTEgPT09IGwyLnkyID8gbDIueTEgOiAoLWMxIC0gYTEqeCkgLyBiMTtcclxuICAgIHJldHVybiB7eDogeCwgeTogeX07XHJcbiAgfSxcclxuXHJcbiAgZ2V0RGlzdGFuY2VCZXR3ZWVuVHdvUG9pbnRzID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCh4Mi14MSkqKHgyLXgxKSArICh5Mi15MSkqKHkyLXkxKSk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMgPSAoeDEsIHkxLCB4MiwgeTIsIHgzLCB5MykgPT4ge1xyXG4gICAgdmFyIGEgPSBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMoeDEsIHkxLCB4MiwgeTIpLFxyXG4gICAgICAgIGIgPSBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMoeDIsIHkyLCB4MywgeTMpLFxyXG4gICAgICAgIGMgPSBnZXREaXN0YW5jZUJldHdlZW5Ud29Qb2ludHMoeDMsIHkzLCB4MSwgeTEpLFxyXG4gICAgICAgIGNvc0MgPSAoYSphICsgYipiIC0gYypjKSAvICgyKmEqYiksXHJcbiAgICAgICAgQyA9IE1hdGguYWNvcyhjb3NDKTtcclxuICAgIHJldHVybiBDO1xyXG4gIH0sXHJcblxyXG4gIHBlcm11dGVMaW5lcyA9IChhbHBoYUxpbmVzLCBiZXRhTGluZXMpID0+IHtcclxuICAgIHZhciBwZXJtdXRhdGlvbnMgPSBbXTtcclxuICAgIGFscGhhTGluZXMuZm9yRWFjaCgoYWxwaGFMaW5lKSA9PiB7XHJcbiAgICAgIGJldGFMaW5lcy5mb3JFYWNoKChiZXRhTGluZSkgPT4ge1xyXG4gICAgICAgIHBlcm11dGF0aW9ucy5wdXNoKHthbHBoYTogYWxwaGFMaW5lLCBiZXRhOiBiZXRhTGluZX0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbiAgICByZXR1cm4gcGVybXV0YXRpb25zO1xyXG4gIH0sXHJcblxyXG4gIGFsbW9zdEVxdWFsID0gKGEsIGIpID0+IHtcclxuICAgIC8vIGdyb3NzIGFwcHJveGltYXRpb24gdG8gY292ZXIgdGhlIGZsb3QgYW5kIHRyaWdvbm9tZXRyaWMgcHJlY2lzaW9uXHJcbiAgICByZXR1cm4gYSA9PT0gYiB8fCBNYXRoLmFicyhhIC0gYikgPCAyMCAqIEVQU0lMT047XHJcbiAgfSxcclxuXHJcbiAgaXNDZW50ZXJJbkJldHdlZW4gPSAoY3gsIGN5LCB4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSA9PiB7XHJcbiAgICAvL1xyXG4gICAgLy8gIFRydWUgaXMgcmV0dXJuZWQgaW4gc2l0dWF0aW9ucyBsaWtlIHRoaXMgb25lOlxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAgL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgIC9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgIC9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAnICAgL1xyXG4gICAgLy8gICAgICAgICAgICAgID09PVAwPT09PT09PT09PVAxPT09PT09PT09PT09PVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAnICAgL1xyXG4gICAgLy8gICAgICAgICAgICAgIC0tLS0tLS0tLUMtLS0vLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgJyAgIC9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgJyAgIC9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAnICAgUDJcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICcgICAvXHJcbiAgICAvL1xyXG4gICAgdmFyIGEgPSBnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyh4MiwgeTIsIHgxLCB5MSwgeDAsIHkwKSxcclxuICAgICAgICBhMSA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzKGN4LCBjeSwgeDEsIHkxLCB4MCwgeTApLFxyXG4gICAgICAgIGEyID0gZ2V0QW5nbGVCZXR3ZWVuVGhyZWVQb2ludHMoY3gsIGN5LCB4MSwgeTEsIHgyLCB5Mik7XHJcbiAgICByZXR1cm4gYWxtb3N0RXF1YWwoYSwgYTEgKyBhMikgJiYgKGExICsgYTIgPD0gTWF0aC5QSSk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0VGhlQ2VudGVyT2ZUaGVDb3JuZXIgPSAoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiwgZGlzdGFuY2UsIHN4LCBzeSkgPT4ge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZCAgZFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvLyAgIGFscGhhIGxpbmUgMCAgICAtLS0tLS0tLS0tLS0tJy0tLy0tJy0tLS0tLS0tLVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJyAgICAgICAgICAgICBkXHJcbiAgICAvLyAgICAgZ2l2ZW4gbGluZSAgICA9PT1QPT09PT09PT09PVA9PT09PT09PT09PT09PVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIC8gICcgICAgICAgICAgICAgICBkXHJcbiAgICAvLyAgIGFscGhhIGxpbmUgMSAgICAtLS0tLS0tLS1DLS0vLS0nLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgJyAgLyAgJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgJyAgUCAgJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAnICAvICAnXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIGJldGEgbGluZXMgMCAmIDEgd2l0aCBvbmUgb2YgdGhlIGdpdmVuIGxpbmUgaW5iZXR3ZWVuXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vICBQID0gdGhlIGdpdmVuIFAwLCBQMSwgUDIgcG9pbnRzXHJcbiAgICAvL1xyXG4gICAgLy8gIGQgPSB0aGUgZ2l2ZW4gZGlzdGFuY2UgLyByYWRpdXMgb2YgdGhlIGNpcmNsZVxyXG4gICAgLy9cclxuICAgIC8vICBDID0gdGhlIGNlbnRlciBvZiB0aGUgY2lyY2xlL2Nvcm5lciB0byBiZSBkZXRlcm1pbmVkXHJcblxyXG4gICAgdmFyIGQxID0gZ2V0U2NhbGVkV2lkdGhPZkxpbmUoeDAsIHkwLCB4MSwgeTEsIHN4LCBzeSwgZGlzdGFuY2UpLFxyXG4gICAgICAgIGQyID0gZ2V0U2NhbGVkV2lkdGhPZkxpbmUoeDEsIHkxLCB4MiwgeTIsIHN4LCBzeSwgZGlzdGFuY2UpLFxyXG4gICAgICAgIGFscGhhTGluZXMgPSBnZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50KHgwLCB5MCwgeDEsIHkxLCBkMSksXHJcbiAgICAgICAgYmV0YUxpbmVzID0gZ2V0UGFyYWxsZWxzQXJvdW5kU2VnbWVudCh4MSwgeTEsIHgyLCB5MiwgZDIpLFxyXG4gICAgICAgIHBlcm11dGF0aW9ucyA9IHBlcm11dGVMaW5lcyhhbHBoYUxpbmVzLCBiZXRhTGluZXMpLFxyXG4gICAgICAgIGludGVyc2VjdGlvbnMgPSBwZXJtdXRhdGlvbnMubWFwKChwKSA9PiBnZXRJbnRlcnNlY3Rpb25PZlR3b0xpbmVzKHAuYWxwaGEsIHAuYmV0YSkpLFxyXG4gICAgICAgIGNlbnRlciA9IGludGVyc2VjdGlvbnMuZmlsdGVyKChpKSA9PiBpc0NlbnRlckluQmV0d2VlbihpLngsIGkueSwgeDAsIHkwLCB4MSwgeTEsIHgyLCB5MikpWzBdO1xyXG5cclxuICAgIHJldHVybiBjZW50ZXIgfHwge3g6IE5hTiwgeTogTmFOfTtcclxuICB9LFxyXG5cclxuICBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyID0gKHgxLCB5MSwgeDIsIHkyLCBjeCwgY3kpID0+IHtcclxuICAgIHZhciBtID0gKHkyIC0geTEpIC8gKHgyIC0geDEpLFxyXG4gICAgICAgIGNtID0gLTEgLyBtLFxyXG4gICAgICAgIEMgPSB5MSooeDIgLSB4MSkgLSB4MSooeTIgLSB5MSksXHJcbiAgICAgICAgeCA9IChDIC0gKHgyIC0geDEpKihjeSAtIGNtKmN4KSkgLyAoY20qKHgyIC0geDEpICsgeTEgLSB5MiksXHJcbiAgICAgICAgeSA9IGNtKih4IC0gY3gpICsgY3k7XHJcbiAgICByZXR1cm4gbSA9PT0gMCAvLyBob3Jpem9udGFsXHJcbiAgICAgID8ge3g6IGN4LCB5OiB5MX1cclxuICAgICAgOiAobSA9PT0gSW5maW5pdHkgLy8gdmVydGljYWxcclxuICAgICAgICA/IHt4OiB4MSwgeTogY3l9XHJcbiAgICAgICAgOiB7eDogeCwgeTogeX0pO1xyXG4gIH0sXHJcblxyXG4gIHh5VG9BcmNBbmdsZSA9IChjeCwgY3ksIHgsIHkpID0+IHtcclxuICAgIHZhciBob3Jpem9udGFsWCA9IGN4ICsgMSxcclxuICAgICAgICBob3Jpem9udGFsWSA9IGN5LFxyXG4gICAgICAgIGEgPSBNYXRoLmFicyhnZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyh4LCB5LCBjeCwgY3ksIGhvcml6b250YWxYLCBob3Jpem9udGFsWSkpO1xyXG4gICAgaWYoeSA8IGN5KSB7XHJcbiAgICAgIC8vdGhpcmQgJiBmb3J0aCBxdWFkcmFudHNcclxuICAgICAgYSA9IE1hdGguUEkgKyBNYXRoLlBJIC0gYTtcclxuICAgIH1cclxuICAgIHJldHVybiBhO1xyXG4gIH0sXHJcblxyXG4gIHNjYWxlZFJhZGl1cyA9IChyLCBzeCwgc3ksIGEpID0+IHtcclxuICAgIC8vXHJcbiAgICAvLyAgVGhlIHN4IGFuZCBzeSBzY2FsaW5ncyBjYW4gYmUgZGlmZmVyZW50IHNvIHRoZSBjaXJjbGUgbG9va3MgbW9yZSBsaWtlIGFuXHJcbiAgICAvL2VsbGlwc2UuIFRoaXMgZnVuY3Rpb24gaXMgcmV0dXJuaW5nIHRoZSByYWRpdXMgY29ycnNwb25kaW5nIHRvIHRoZSBzcGVjaWZpZWQgYW5nbGVcclxuICAgIC8vYW5kIHRha2luZyBpbnRvIGFjY291bnQgdGhlIHN4IGFuZCBzeSB2YWx1ZXMuXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAqICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqICAgICAgICAqXHJcbiAgICAvLyAgICAgICAgICogICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICogICAgICAgICAgICAgICAgICAgKlxyXG4gICAgLy8gICAgICAgKiAgICAgICAgICAgICAqICAgICAgICAgICBzeCAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgKlxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICstLS0tLS0+ICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICpcclxuICAgIC8vICAgICAgICogICAgICAgICAgICAgKiAgICAgICB8XHJcbiAgICAvLyAgICAgICAgICogICAgICAgICAqICAgICAgc3kgdiAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgKlxyXG4gICAgLy8gICAgICAgICAgICAqICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgKlxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogICAgICAgICAgICAgICAgICAgICpcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqICAgICAgICAgKlxyXG4gICAgLy9cclxuICAgIHZhciBuYSA9IGEgJSAoMipQSSk7IC8vbm9ybWFsaXplZCBhbmdsZVxyXG4gICAgaWYgKHN4ID09PSBzeSkge1xyXG4gICAgICByZXR1cm4gciAqIHN4O1xyXG4gICAgfSBlbHNlIGlmIChhbG1vc3RFcXVhbChuYSwgMCkgfHwgYWxtb3N0RXF1YWwobmEsIFBJKSkge1xyXG4gICAgICByZXR1cm4gciAqIHN4O1xyXG4gICAgfSBlbHNlIGlmIChhbG1vc3RFcXVhbChuYSwgUEkvMikgfHwgYWxtb3N0RXF1YWwobmEsIDMqUEkvMikpIHtcclxuICAgICAgcmV0dXJuIHIgKiBzeTtcclxuICAgIH0gZWxzZSBpZiAobmEgPCAxKlBJLzIpIHtcclxuICAgICAgdmFyIGFhID0gbmE7IC8vYWRqdXN0ZWQgYW5nbGVcclxuICAgICAgcmV0dXJuIHIgKiAoc3ggKiAoUEkvMi1hYSkvKFBJLzIpICsgc3kgKiAoYWEpLyhQSS8yKSk7XHJcbiAgICB9IGVsc2UgaWYgKG5hIDwgMipQSS8yKSB7XHJcbiAgICAgIHZhciBhYSA9IG5hIC0gMSpQSS8yOyAvL2FkanVzdGVkIGFuZ2xlXHJcbiAgICAgIHJldHVybiByICogKHN4ICogKGFhKS8oUEkvMikgKyBzeSAqIChQSS8yLWFhKS8oUEkvMikpO1xyXG4gICAgfSBlbHNlIGlmIChuYSA8IDMqUEkvMikge1xyXG4gICAgICB2YXIgYWEgPSBuYSAtIDIqUEkvMjsgLy9hZGp1c3RlZCBhbmdsZVxyXG4gICAgICByZXR1cm4gciAqIChzeCAqIChQSS8yLWFhKS8oUEkvMikgKyBzeSAqIChhYSkvKFBJLzIpKTtcclxuICAgIH0gZWxzZSBpZiAobmEgPCA0KlBJLzIpIHtcclxuICAgICAgdmFyIGFhID0gbmEgLSAzKlBJLzI7IC8vYWRqdXN0ZWQgYW5nbGVcclxuICAgICAgcmV0dXJuIHIgKiAoc3ggKiAoYWEpLyhQSS8yKSArIHN5ICogKFBJLzItYWEpLyhQSS8yKSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY29sbGluZWFyID0gKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIpID0+IHtcclxuICAgIHZhciBtMSA9ICh5MSAtIHkwKSAvICh4MSAtIHgwKSxcclxuICAgICAgICBtMiA9ICh5MiAtIHkxKSAvICh4MiAtIHgxKTtcclxuICAgIHJldHVybiBhbG1vc3RFcXVhbChtMSwgbTIpO1xyXG4gIH0sXHJcblxyXG4gIGRlY29tcG9zZUFyY1RvID0gKHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHIsIHN4LCBzeSkgPT4ge1xyXG4gICAgLy9cclxuICAgIC8vICBUaGUgc3ggYW5kIHN5IGlzIHVzZWQgdG8gc2NhbGUgdGhlIHJhZGl1cyAocikgb25seS5cclxuICAgIC8vQWxsIG90aGVyIGNvb3JkaW5hdGVzIGhhdmUgdG8gYmUgYWxyZWFkeSBzY2FsZWQuXHJcbiAgICAvL1xyXG4gICAgdmFyIGRlY29tcG9zaXRpb24gPSB7XHJcbiAgICAgIHBvaW50OiB7eDogeDEsIHk6IHkxfVxyXG4gICAgfTtcclxuICAgIGlmKGNvbGxpbmVhcih4MCwgeTAsIHgxLCB5MSwgeDIsIHkyKSkge1xyXG4gICAgICBkZWNvbXBvc2l0aW9uLmxpbmUgPSB7eDE6IHgwLCB5MTogeTAsIHgyOiB4MSwgeTI6IHkxfTtcclxuICAgIH0gZWxzZSBpZiAoIWlzTmFOKHgwKSAmJiAhaXNOYU4oeTApKSB7XHJcbiAgICAgIHZhciBjZW50ZXIgPSBnZXRUaGVDZW50ZXJPZlRoZUNvcm5lcih4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCByLCBzeCwgc3kpLFxyXG4gICAgICAgICAgZm9vdDEgPSBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyKHgwLCB5MCwgeDEsIHkxLCBjZW50ZXIueCwgY2VudGVyLnkpLFxyXG4gICAgICAgICAgZm9vdDIgPSBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyKHgxLCB5MSwgeDIsIHkyLCBjZW50ZXIueCwgY2VudGVyLnkpLFxyXG4gICAgICAgICAgYW5nbGVGb290MSA9IHh5VG9BcmNBbmdsZShjZW50ZXIueCwgY2VudGVyLnksIGZvb3QxLngsIGZvb3QxLnkpLFxyXG4gICAgICAgICAgYW5nbGVGb290MiA9IHh5VG9BcmNBbmdsZShjZW50ZXIueCwgY2VudGVyLnksIGZvb3QyLngsIGZvb3QyLnkpLFxyXG4gICAgICAgICAgc0FuZ2xlID0gTWF0aC5hYnMoYW5nbGVGb290MiAtIGFuZ2xlRm9vdDEpIDwgTWF0aC5QSSA/IGFuZ2xlRm9vdDIgOiBhbmdsZUZvb3QxLFxyXG4gICAgICAgICAgZUFuZ2xlID0gTWF0aC5hYnMoYW5nbGVGb290MiAtIGFuZ2xlRm9vdDEpIDwgTWF0aC5QSSA/IGFuZ2xlRm9vdDEgOiBhbmdsZUZvb3QyO1xyXG4gICAgICBpZiAoc0FuZ2xlID4gZUFuZ2xlKSB7XHJcbiAgICAgICAgdmFyIHRlbXAgPSBzQW5nbGU7XHJcbiAgICAgICAgc0FuZ2xlID0gZUFuZ2xlO1xyXG4gICAgICAgIGVBbmdsZSA9IHRlbXAgKyAyKlBJO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghaXNOYU4oY2VudGVyLngpICYmICFpc05hTihjZW50ZXIueSkpIHtcclxuICAgICAgICBpZiAoIWFsbW9zdEVxdWFsKGdldERpc3RhbmNlQmV0d2VlblR3b1BvaW50cyh4MCwgeTAsIGZvb3QxLngsIGZvb3QxLnkpLCAwKSkge1xyXG4gICAgICAgICAgZGVjb21wb3NpdGlvbi5saW5lID0ge3gxOiB4MCwgeTE6IHkwLCB4MjogZm9vdDEueCwgeTI6IGZvb3QxLnl9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWNvbXBvc2l0aW9uLmFyYyA9IHt4OiBjZW50ZXIueCwgeTogY2VudGVyLnksIHI6IHIsIHNBbmdsZTogc0FuZ2xlLCBlQW5nbGU6IGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZTogZmFsc2V9O1xyXG4gICAgICAgIGRlY29tcG9zaXRpb24ucG9pbnQgPSB7eDogZm9vdDIueCwgeTogZm9vdDIueX07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBkZWNvbXBvc2l0aW9uO1xyXG4gIH0sXHJcblxyXG4gIHJlbGV2YW50QXJjQW5nbGVzID0gKHNBbmdsZSwgZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlKSA9PiB7XHJcbiAgICAvL1xyXG4gICAgLy8gIFRoZSBmdW5jdGlvbiBpcyByZXR1cm5pbmcgdGhlIHNwZWNpZmllZCBzQW5nbGUgYW5kIGVBbmdsZSBhbmRcclxuICAgIC8vYWxsIHRoZSBtdWx0aXBsZSBvZiBQSS8yLiBUaGUgcmVzdWx0IGRvZXNuJ3QgY29udGFpbiBkdXBsaWNhdGlvbnMuXHJcbiAgICAvLyAgRXhhbXBsZTogRm9yIHNBbmdsZSA9IFBJLzYgYW5kIGVBbmdsZSA9IDcqUEkvNixcclxuICAgIC8vIFdoZW4gY291bnRlcmNsb2Nrd2lzZSA9IGZhbHNlIHRoZSByZXN1bHQgaXM6IFtQSS82LCA3KlBJLzYsIFBJLzIsIDIqUEkvMl1cclxuICAgIC8vIFdoZW4gY291bnRlcmNsb2Nrd2lzZSA9IHRydWUgdGhlIHJlc3VsdCBpczogW1BJLzYsIDcqUEkvNiwgMypQSS8yLCA0KlBJLzJdXHJcbiAgICAvL1xyXG4gICAgdmFyIGFuZ2xlcyA9IFtdLCB1bmlxdWVBbmdsZXMgPSBbXTtcclxuICAgIGFuZ2xlcy5wdXNoKHNBbmdsZSk7XHJcbiAgICBhbmdsZXMucHVzaChlQW5nbGUpO1xyXG4gICAgaWYgKGNvdW50ZXJjbG9ja3dpc2UpIHtcclxuICAgICAgdmFyIHRlbXAgPSBzQW5nbGU7XHJcbiAgICAgICAgICBzQW5nbGUgPSBlQW5nbGU7XHJcbiAgICAgICAgICBlQW5nbGUgPSBzQW5nbGUgKyAyKlBJO1xyXG4gICAgfVxyXG4gICAgWzEqUEkvMiwgMipQSS8yLCAzKlBJLzIsIDQqUEkvMl0uZm9yRWFjaCgoYSkgPT4ge1xyXG4gICAgICBpZihlQW5nbGUgPiBhICYmIGEgPiBzQW5nbGUpIHtcclxuICAgICAgICBhbmdsZXMucHVzaChhKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy9yZW1vdmluZyB0aGUgZHVwbGljYXRlZCBwb2ludHNcclxuICAgIHVuaXF1ZUFuZ2xlcy5wdXNoKGFuZ2xlcy5wb3AoKSk7XHJcbiAgICB3aGlsZShhbmdsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgYW5nbGUgPSBhbmdsZXMucG9wKCksXHJcbiAgICAgICAgICBmb3VuZCA9IHVuaXF1ZUFuZ2xlcy5maW5kKChhKSA9PlxyXG4gICAgICAgICAgICBhbG1vc3RFcXVhbChhbmdsZSwgYSkgfHxcclxuICAgICAgICAgICAgYWxtb3N0RXF1YWwoYW5nbGUgLSAyKlBJLCBhKSB8fFxyXG4gICAgICAgICAgICBhbG1vc3RFcXVhbChhbmdsZSwgYSAtIDIqUEkpKTtcclxuICAgICAgaWYgKGZvdW5kID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICB1bmlxdWVBbmdsZXMucHVzaChhbmdsZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdW5pcXVlQW5nbGVzO1xyXG4gIH0sXHJcblxyXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjc1MjcyNS9maW5kaW5nLXdoZXRoZXItYS1wb2ludC1saWVzLWluc2lkZS1hLXJlY3RhbmdsZS1vci1ub3RcclxuICBpc1BvaW50SW5zaWRlUmVjdGFuZ2xlID0gKHBvaW50LCByZWN0YW5nbGUpID0+IHtcclxuICAgIHZhciBzZWdtZW50cyA9IFt7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSB9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55LFxyXG4gICAgICB4MjogcmVjdGFuZ2xlLnggKyByZWN0YW5nbGUud2lkdGgsXHJcbiAgICAgIHkyOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHR9LCB7XHJcbiAgICAgIHgxOiByZWN0YW5nbGUueCArIHJlY3RhbmdsZS53aWR0aCxcclxuICAgICAgeTE6IHJlY3RhbmdsZS55ICsgcmVjdGFuZ2xlLmhlaWdodCxcclxuICAgICAgeDI6IHJlY3RhbmdsZS54LFxyXG4gICAgICB5MjogcmVjdGFuZ2xlLnkgKyByZWN0YW5nbGUuaGVpZ2h0fSwge1xyXG4gICAgICB4MTogcmVjdGFuZ2xlLngsXHJcbiAgICAgIHkxOiByZWN0YW5nbGUueSArIHJlY3RhbmdsZS5oZWlnaHQsXHJcbiAgICAgIHgyOiByZWN0YW5nbGUueCxcclxuICAgICAgeTI6IHJlY3RhbmdsZS55XHJcbiAgICB9XTtcclxuXHJcbiAgICB2YXIgaXNJbnNpZGUgPSBzZWdtZW50cy5tYXAoKHNlZ21lbnQpID0+IHtcclxuICAgICAgdmFyIEEgPSAtKHNlZ21lbnQueTIgLSBzZWdtZW50LnkxKSxcclxuICAgICAgICBCID0gc2VnbWVudC54MiAtIHNlZ21lbnQueDEsXHJcbiAgICAgICAgQyA9IC0oQSAqIHNlZ21lbnQueDEgKyBCICogc2VnbWVudC55MSksXHJcbiAgICAgICAgRCA9IEEgKiBwb2ludC54ICsgQiAqIHBvaW50LnkgKyBDO1xyXG4gICAgICAgIHJldHVybiBEO1xyXG4gICAgfSkuZXZlcnkoKEQpID0+IHtcclxuICAgICAgcmV0dXJuIEQgPj0gMDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBpc0luc2lkZTtcclxuICB9O1xyXG5cclxuXHJcbiAgdGhpcy5nZXRCQm94ID0gZ2V0QkJveDtcclxuICB0aGlzLnVuaW9uID0gdW5pb247XHJcbiAgdGhpcy50b3RhbFRyYW5zZm9ybSA9IHRvdGFsVHJhbnNmb3JtO1xyXG4gIHRoaXMuZ2V0UmVjdEFyb3VuZExpbmUgPSBnZXRSZWN0QXJvdW5kTGluZTtcclxuICB0aGlzLmdldFBhcmFsbGVsc0Fyb3VuZFNlZ21lbnQgPSBnZXRQYXJhbGxlbHNBcm91bmRTZWdtZW50O1xyXG4gIHRoaXMuZ2V0SW50ZXJzZWN0aW9uT2ZUd29MaW5lcyA9IGdldEludGVyc2VjdGlvbk9mVHdvTGluZXM7XHJcbiAgdGhpcy5nZXRBbmdsZUJldHdlZW5UaHJlZVBvaW50cyA9IGdldEFuZ2xlQmV0d2VlblRocmVlUG9pbnRzO1xyXG4gIHRoaXMuZ2V0VGhlQ2VudGVyT2ZUaGVDb3JuZXIgPSBnZXRUaGVDZW50ZXJPZlRoZUNvcm5lcjtcclxuICB0aGlzLmdldFRoZUZvb3RPZlRoZVBlcnBlbmRpY3VsYXIgPSBnZXRUaGVGb290T2ZUaGVQZXJwZW5kaWN1bGFyO1xyXG4gIHRoaXMueHlUb0FyY0FuZ2xlID0geHlUb0FyY0FuZ2xlO1xyXG4gIHRoaXMuc2NhbGVkUmFkaXVzID0gc2NhbGVkUmFkaXVzO1xyXG4gIHRoaXMuZGVjb21wb3NlQXJjVG8gPSBkZWNvbXBvc2VBcmNUbztcclxuICB0aGlzLmlzUG9pbnRJbnNpZGVSZWN0YW5nbGUgPSBpc1BvaW50SW5zaWRlUmVjdGFuZ2xlO1xyXG5cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi9nZW9tZXRyeS5qcydcclxuaW1wb3J0IHsgQ3VzdG9tTWF0Y2hlcnMgfSBmcm9tICcuL2N1c3RvbU1hdGNoZXJzLmpzJ1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBSYWJiaXQoZ2VvbWV0cnksIG1hdGNoZXJzKSB7XHJcblxyXG4gIHZhciB0aGF0ID0gdGhpcyxcclxuICAgIGdlb21ldHJ5ID0gZ2VvbWV0cnkgfHwgbmV3IEdlb21ldHJ5KCksXHJcbiAgICBtYXRjaGVycyA9IG1hdGNoZXJzIHx8IG5ldyBDdXN0b21NYXRjaGVycygpO1xyXG5cclxuXHJcbiAgdmFyIGZpbmRBbGxTaGFwZXNJZ25vcmluZ0FyZ3VtZW50cyA9IChzaGFwZSwgd2hlcmUpID0+IHtcclxuICAgIHZhciBmb3VuZCA9IFtdLCBpbmRleCA9IDA7XHJcbiAgICBkbyB7XHJcbiAgICAgIGluZGV4ID0gdGhhdC5maW5kU2hhcGVJZ25vcmluZ0FyZ3VtZW50cyhzaGFwZSwgd2hlcmUsIGluZGV4KTtcclxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgIGZvdW5kLnB1c2god2hlcmUuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2hhcGUubGVuZ3RoKSk7XHJcbiAgICAgICAgaW5kZXggKz0gc2hhcGUubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICB9IHdoaWxlIChpbmRleCAhPT0gLTEgJiYgaW5kZXggPCB3aGVyZS5sZW5ndGgpO1xyXG4gICAgcmV0dXJuIGZvdW5kO1xyXG4gIH0sXHJcblxyXG4gIGZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzID0gKHNoYXBlLCB3aGVyZSwgc3RhcnRJbmRleCkgPT4ge1xyXG4gICAgc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXggfHwgMDtcclxuICAgIHZhciBtYXRjaCA9IGZhbHNlLCBpbmRleCA9IC0xO1xyXG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXg7IGkgPD0gd2hlcmUubGVuZ3RoIC0gc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbWF0Y2ggPSB0cnVlO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNoYXBlLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgaWYgKHdoZXJlW2kgKyBqXS5tZXRob2QgIT09IHNoYXBlW2pdLm1ldGhvZCkge1xyXG4gICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAobWF0Y2ggPT09IHRydWUpIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpbmRleDtcclxuICB9LFxyXG5cclxuICByZW1vdmVTaGFwZXMgPSAoc2hhcGVzLCBmcm9tKSA9PiB7XHJcbiAgICB2YXIgY29weSA9IGZyb20uc2xpY2UoMCwgZnJvbS5sZW5ndGgpO1xyXG4gICAgc2hhcGVzLmZvckVhY2goKHNoYXBlKSA9PiB7XHJcbiAgICAgIHZhciBpbmRleCA9IC0xO1xyXG4gICAgICBkbyB7XHJcbiAgICAgICAgaW5kZXggPSB0aGF0LmZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzKHNoYXBlLCBjb3B5KTtcclxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICBjb3B5LnNwbGljZShpbmRleCwgc2hhcGUubGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gd2hpbGUgKGluZGV4ICE9PSAtMSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb3B5O1xyXG4gIH07XHJcblxyXG5cclxuICB0aGlzLmdldEJCb3ggPSBnZW9tZXRyeS5nZXRCQm94O1xyXG4gIHRoaXMuY3VzdG9tTWF0Y2hlcnMgPSBtYXRjaGVycztcclxuICB0aGlzLmZpbmRBbGxTaGFwZXNJZ25vcmluZ0FyZ3VtZW50cyA9IGZpbmRBbGxTaGFwZXNJZ25vcmluZ0FyZ3VtZW50cztcclxuICB0aGlzLmZpbmRTaGFwZUlnbm9yaW5nQXJndW1lbnRzID0gZmluZFNoYXBlSWdub3JpbmdBcmd1bWVudHM7XHJcbiAgdGhpcy5yZW1vdmVTaGFwZXMgPSByZW1vdmVTaGFwZXM7XHJcblxyXG59XHJcbiJdfQ==
