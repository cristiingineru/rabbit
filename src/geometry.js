"use strict";


export function Geometry() {

  var that = this,
      EPSILON = Number.EPSILON || 2.220446049250313e-16;


  var createNewCanvasCallState = () => {
    return {
      box: {x: NaN, y: NaN, width: NaN, height: NaN},
      transforms: [[]],
      shapesInPath: [],
      moveToLocation: {x: NaN, y: NaN},
      lineWidths: [1]
    };
  },

  pathFillShapeHandlers = {
    rect: (state, shape) => {
      var x = shape.x,
        y = shape.y,
        width = shape.width,
        height = shape.height,
        newBox = {x: x, y: y, width: width, height: height};
      state.box = union(state.box, newBox);
      return state;
    },
    arc: (state, shape) => {
      var cx = shape.cx,
        cy = shape.cy,
        rx = shape.rx,
        ry = shape.ry,
        newBox = {x: cx - rx, y: cy - ry, width: 2 * rx, height: 2 * ry};
      state.box = union(state.box, newBox);
      return state;
    }
  },

  pathStrokeShapeHandlers = {
    rect: (state, shape) => {
      var x = shape.x,
        y = shape.y,
        width = shape.width,
        height = shape.height,
        scaledLineWidth = state.lineWidth !== 1 ? state.lineWidth : 0,
        xScaledLineWidth = scaledLineWidth * state.transform.scale.x,
        yScaledLineWidth = scaledLineWidth * state.transform.scale.y,
        newBox = {x: x - xScaledLineWidth  / 2, y: y - yScaledLineWidth / 2, width: width + xScaledLineWidth, height: height + yScaledLineWidth};
      state.box = union(state.box, newBox);
      return state;
    },
    arc: (state, shape) => {
      var cx = shape.cx,
        cy = shape.cy,
        rx = shape.rx,
        ry = shape.ry,
        scaledLineWidth = state.lineWidth !== 1 ? state.lineWidth : 0,
        xScaledLineWidth = scaledLineWidth * state.transform.scale.x,
        yScaledLineWidth = scaledLineWidth * state.transform.scale.y,
        newBox = {x: cx - rx - xScaledLineWidth / 2, y: cy - ry - yScaledLineWidth / 2, width: 2 * rx + xScaledLineWidth, height: 2 * ry + yScaledLineWidth};
      state.box = union(state.box, newBox);
      return state;
    },
    lineTo: (state, shape) => {
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
    lineWidth: (state, call) => {
      state.lineWidths[state.lineWidths.length - 1] = call.val;
      return state;
    },
    fillRect: (state, call) => {
      var x = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
        y = call.arguments[1] * state.transform.scale.y + state.transform.translate.y,
        width = call.arguments[2] * state.transform.scale.x,
        height = call.arguments[3] * state.transform.scale.y,
        newBox = {x: x, y: y, width: width, height: height};
      state.box = union(state.box, newBox);
      return state;
    },
    strokeRect: (state, call) => {
      var x = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
        y = call.arguments[1] * state.transform.scale.y + state.transform.translate.y,
        width = call.arguments[2] * state.transform.scale.x,
        height = call.arguments[3] * state.transform.scale.y,
        scaledLineWidth = state.lineWidth !== 1 ? state.lineWidth : 0,
        xScaledLineWidth = scaledLineWidth * state.transform.scale.x,
        yScaledLineWidth = scaledLineWidth * state.transform.scale.y,
        newBox = {x: x - xScaledLineWidth / 2, y: y - yScaledLineWidth / 2, width: width + xScaledLineWidth, height: height + yScaledLineWidth};
      state.box = union(state.box, newBox);
      return state;
    },
    rect: (state, call) => {
      var x = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
        y = call.arguments[1] * state.transform.scale.y + state.transform.translate.y,
        width = call.arguments[2] * state.transform.scale.x,
        height = call.arguments[3] * state.transform.scale.y;
      state.shapesInPath.push({type: 'rect', x: x, y: y, width: width, height: height});
      return state;
    },
    arc: (state, call) => {
      var cx = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
        cy = call.arguments[1] * state.transform.scale.y + state.transform.translate.y,
        rx = call.arguments[2] * state.transform.scale.x,
        ry = call.arguments[2] * state.transform.scale.y;
      state.shapesInPath.push({type: 'arc', cx: cx, cy: cy, rx: rx, ry: ry});
      return state;
    },
    moveTo: (state, call) => {
      var x1 = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
        y1 = call.arguments[1] * state.transform.scale.y + state.transform.translate.y;
      state.moveToLocation = {x: x1, y: y1};
      return state;
    },
    lineTo: (state, call) => {
      var x1 = state.moveToLocation.x,
        y1 = state.moveToLocation.y,
        x2 = call.arguments[0] * state.transform.scale.x + state.transform.translate.x,
        y2 = call.arguments[1] * state.transform.scale.y + state.transform.translate.y;
      state.shapesInPath.push({type: 'lineTo', x1: x1, y1: y1, x2: x2, y2: y2});
      return state;
    },
    save: (state, call) => {
      state.transforms.push([]);
      state.lineWidths.push(lastElement(state.lineWidths));
      return state;
    },
    restore: (state, call) => {
      state.transforms.pop();
      state.lineWidths.pop();
      return state;
    },
    translate: (state, call) => {
      lastElement(state.transforms)
        .push({translate: {x: call.arguments[0], y: call.arguments[1]}});
      return state;
    },
    scale: (state, call) => {
      lastElement(state.transforms)
        .push({scale: {x: call.arguments[0], y: call.arguments[1]}});
      return state;
    },
    beginPath: (state, call) => {
      state.shapesInPath = [];
      return state;
    },
    fill: (state, call) => {
      return state.shapesInPath.reduce((state, shape) => {
        var handler = getPathFillShapeHandler(shape);
        return handler(state, shape);
      }, state);
    },
    stroke: (state, call) => {
      return state.shapesInPath.reduce((state, shape) => {
        var handler = getPathStrokeShapeHandler(shape);
        return handler(state, shape);
      }, state);
    }
  },

  nullCanvasCallHandler = (state, call) => {
    return state;
  },

  getCanvasCallHandler = (call) => {
    return canvasCallHandlers[call.method] || canvasCallHandlers[call.attr] || nullCanvasCallHandler;
  },

  getPathFillShapeHandler = (shape) => {
    return pathFillShapeHandlers[shape.type];
  },

  getPathStrokeShapeHandler = (shape) => {
    return pathStrokeShapeHandlers[shape.type];
  },

  preCanvasCallHandler = (state) => {
    state.transform = totalTransform(flatten(state.transforms));
    state.lineWidth = lastElement(state.lineWidths);
    return state;
  },

  getBBox = (shape) => {
    var state = createNewCanvasCallState();
    state = shape.reduce((state, call) => {
      var handler = getCanvasCallHandler(call);
      return handler(preCanvasCallHandler(state), call);
    }, createNewCanvasCallState());
    return state.box;
  },

  flatten = (array) => {
    return array
      .reduce((previousArray, currentArray) => {
        return previousArray.concat(currentArray);
      }, []);
  },

  lastElement = (array) => {
    return array[array.length - 1];
  },

  firstTruthyOrZero = (val1, val2) =>{
    if (val1 || val1 === 0) {
      return val1;
    }
    return val2;
  },

  union = (box1, box2) => {
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
      width: Math.max(box1.width, box2.width, box1.x < box2.x
        ? box1.width + box2.width + (box2.x - (box1.x + box1.width))
        : box1.width + box2.width + (box1.x - (box2.x + box2.width))),
      height: Math.max(box1.height, box2.height, box1.y < box2.y
        ? box1.height + box2.height + (box2.y - (box1.y + box1.height))
        : box1.height + box2.height + (box1.y - (box2.y + box2.height)))
    };
    return result;
  },

  totalTransform = (transforms) => {
    return transforms
      .map((value) => {
        return {
          translate: value.translate || {x: 0, y: 0},
          scale: value.scale || {x: 1, y: 1}
        };
      })
      .reduce((previousValue, currentValue) => {
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
      }, {translate: {x: 0, y: 0}, scale: {x: 1, y: 1}});
  },

  getRectAroundLine = (x1, y1, x2, y2, width) => {
    var rect;
    if (x1 === y1 && x1 === x2 && x1 === y2) {
      rect = {
        x1: x1, y1: x1,  x2: x1, y2: x1,
        x4: x1, y4: x1,  x3: x1, y3: x1
      };
    } else {
      rect = getRectAroundLongLine(x1, y1, x2, y2, width);
    }
    return rect;
  },

  getRectAroundLongLine = (x1, y1, x2, y2, width) => {
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
      b1 = a + Math.PI/2,
      b2 = a - Math.PI/2,
      rx1 = r * Math.cos(b1) + x1,
      ry1 = r * Math.sin(b1) + y1,
      rx2 = r * Math.cos(b1) + x2,
      ry2 = r * Math.sin(b1) + y2,
      rx3 = r * Math.cos(b2) + x2,
      ry3 = r * Math.sin(b2) + y2,
      rx4 = r * Math.cos(b2) + x1,
      ry4 = r * Math.sin(b2) + y1;
    return {
      x1: rx1, y1: ry1,  x2: rx2, y2: ry2,
      x4: rx4, y4: ry4,  x3: rx3, y3: ry3
    };
  },

  getScaledWidthOfLine = (x1, y1, x2, y2, sx, sy, width) => {
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
      sina = Math.sin(a), cosa = Math.cos(a),
      scaledWidth = width * Math.sqrt(sx*sx * sina*sina + sy*sy * cosa*cosa);
    return scaledWidth;
  },

  getParallelsAroundSegment = (x1, y1, x2, y2, distance) => {
    var rect = getRectAroundLongLine(x1, y1, x2, y2, 2 * distance);
    return [
      {x1: rect.x1, y1: rect.y1, x2: rect.x2, y2: rect.y2},
      {x1: rect.x4, y1: rect.y4, x2: rect.x3, y2: rect.y3}
    ];
  },

  getIntersectionOfTwoLines = (l1, l2) => {
    var a1 = l1.y2 - l1.y1, b1 = l1.x1 - l1.x2, c1 = l1.x2*l1.y1 - l1.x1*l1.y2,
        a2 = l2.y2 - l2.y1, b2 = l2.x1 - l2.x2, c2 = l2.x2*l2.y1 - l2.x1*l2.y2,
        x = (c2*b1 - c1*b2) / (a1*b2 - a2*b1),
        y = (-c1 - a1*x) / b1;
    return {x: x, y: y};
  },

  getDistanceBetweenTwoPoints = (x1, y1, x2, y2) => {
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
  },

  getAngleBetweenThreePoints = (x1, y1, x2, y2, x3, y3) => {
    var a = getDistanceBetweenTwoPoints(x1, y1, x2, y2),
        b = getDistanceBetweenTwoPoints(x2, y2, x3, y3),
        c = getDistanceBetweenTwoPoints(x3, y3, x1, y1),
        cosC = (a*a + b*b - c*c) / (2*a*b),
        C = Math.acos(cosC);
    return C;
  },

  permuteLines = (alphaLines, betaLines) => {
    var permutations = [];
    alphaLines.forEach((alphaLine) => {
      betaLines.forEach((betaLine) => {
        permutations.push({alpha: alphaLine, beta: betaLine});
      });
    })
    return permutations;
  },

  almostEqual = (a, b) => {
    // gross approximation to cover the flot and trigonometric precision
    return Math.abs(a - b) < 5 * EPSILON;
  },

  isCenterInBetween = (cx, cy, x0, y0, x1, y1, x2, y2) => {
    var a1 = getAngleBetweenThreePoints(cx, cy, x1, y1, x0, y0),
        a2 = getAngleBetweenThreePoints(cx, cy, x1, y1, x2, y2);
    return almostEqual(a1, a2) && a1 <= Math.PI / 2;
  },

  getTheCenterOfTheCorner = (x0, y0, x1, y1, x2, y2, distance) => {
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
        intersections = permutations.map((p) => getIntersectionOfTwoLines(p.alpha, p.beta)),
        center = intersections.filter((i) => isCenterInBetween(i.x, i.y, x0, y0, x1, y1, x2, y2))[0];

    return center || {x: NaN, y: NaN};
  },

  getTheFootOfThePerpendicular = (x1, y1, x2, y2, cx, cy) => {
    var m = (y2 - y1) / (x2 - x1),
        cm = -1 / m,
        C = y1*(x2 - x1) - x1*(y2 - y1),
        x = (C - (x2 - x1)*(cy - cm*cx)) / (cm*(x2 - x1) + y1 - y2),
        y = cm*(x - cx) + cy;
    return m === 0 // horizontal
      ? {x: cx, y: y1}
      : (m === Infinity // vertical
        ? {x: x1, y: cy}
        : {x: x, y: y});
  },

  xyToArcAngle = (cx, cy, x, y) => {
    var horizontalX = cx + 1,
        horizontalY = cy,
        a = Math.abs(getAngleBetweenThreePoints(x, y, cx, cy, horizontalX, horizontalY));
    if(y < cy) {
      //third & forth quadrants
      a = Math.PI + Math.PI - a;
    }
    return a;
  },

  // http://stackoverflow.com/questions/2752725/finding-whether-a-point-lies-inside-a-rectangle-or-not
  isPointInsideRectangle = (point, rectangle) => {
    var segments = [{
      x1: rectangle.x,
      y1: rectangle.y,
      x2: rectangle.x + rectangle.width,
      y2: rectangle.y }, {
      x1: rectangle.x + rectangle.width,
      y1: rectangle.y,
      x2: rectangle.x + rectangle.width,
      y2: rectangle.y + rectangle.height}, {
      x1: rectangle.x + rectangle.width,
      y1: rectangle.y + rectangle.height,
      x2: rectangle.x,
      y2: rectangle.y + rectangle.height}, {
      x1: rectangle.x,
      y1: rectangle.y + rectangle.height,
      x2: rectangle.x,
      y2: rectangle.y
    }];

    var isInside = segments.map((segment) => {
      var A = -(segment.y2 - segment.y1),
        B = segment.x2 - segment.x1,
        C = -(A * segment.x1 + B * segment.y1),
        D = A * point.x + B * point.y + C;
        return D;
    }).every((D) => {
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
  this.isPointInsideRectangle = isPointInsideRectangle;

}
