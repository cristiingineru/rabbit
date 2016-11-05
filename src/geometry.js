if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}

if (!Array.prototype.flatten) {
  Array.prototype.flatten = function() {
    return this
      .reduce(function(previousArray, currentArray) {
        return previousArray.concat(currentArray);
      }, []);
  }
}


function Geometry() {

  var that = this;

  this.getBBox = function(shape) {
    var box = {x: NaN, y: NaN, width: NaN, height: NaN},
      transforms = [[]],
      shapesInPath = [],
      moveToLocation = {x: NaN, y: NaN},
      lineWidths = [1];
    shape.forEach(function (call) {
      var cx, cy, rx, ry, x, y, x1, y1, x2, y2, rect, width, height, newBox,
        scaledLineWidth, xScaledLineWidth, yScaledLineWidth,
        transform = that.totalTransform(transforms.flatten()),
        lineWidth = lineWidths.last();
      switch(call.method) {
        case 'fillRect':
          x = call.arguments[0] * transform.scale.x + transform.translate.x;
          y = call.arguments[1] * transform.scale.y + transform.translate.y;
          width = call.arguments[2] * transform.scale.x;
          height = call.arguments[3] * transform.scale.y;
          newBox = {x: x, y: y, width: width, height: height};
          box = that.union(box, newBox);
          break;
        case 'strokeRect':
          x = call.arguments[0] * transform.scale.x + transform.translate.x;
          y = call.arguments[1] * transform.scale.y + transform.translate.y;
          width = call.arguments[2] * transform.scale.x;
          height = call.arguments[3] * transform.scale.y;
          scaledLineWidth = lineWidth !== 1 ? lineWidth : 0;
          xScaledLineWidth = scaledLineWidth * transform.scale.x,
          yScaledLineWidth = scaledLineWidth * transform.scale.y,
          newBox = {x: x - xScaledLineWidth / 2, y: y - yScaledLineWidth / 2, width: width + xScaledLineWidth, height: height + yScaledLineWidth};
          box = that.union(box, newBox);
          break;
        case 'rect':
          x = call.arguments[0] * transform.scale.x + transform.translate.x;
          y = call.arguments[1] * transform.scale.y + transform.translate.y;
          width = call.arguments[2] * transform.scale.x;
          height = call.arguments[3] * transform.scale.y;
          shapesInPath.push({type: 'rect', x: x, y: y, width: width, height: height});
          break;
        case 'arc':
          cx = call.arguments[0] * transform.scale.x + transform.translate.x;
          cy = call.arguments[1] * transform.scale.y + transform.translate.y;
          rx = call.arguments[2] * transform.scale.x;
          ry = call.arguments[2] * transform.scale.y
          shapesInPath.push({type: 'arc', cx: cx, cy: cy, rx: rx, ry: ry});
          break;
        case 'moveTo':
          x1 = call.arguments[0] * transform.scale.x + transform.translate.x;
          y1 = call.arguments[1] * transform.scale.y + transform.translate.y;
          moveToLocation = {x: x1, y: y1};
          break;
        case 'lineTo':
          x1 = moveToLocation.x;
          y1 = moveToLocation.y;
          x2 = call.arguments[0] * transform.scale.x + transform.translate.x;
          y2 = call.arguments[1] * transform.scale.y + transform.translate.y;
          shapesInPath.push({type: 'lineTo', x1: x1, y1: y1, x2: x2, y2: y2});
          break;
        case 'save':
          transforms.push([]);
          lineWidths.push(lineWidths.last());
          break;
        case 'restore':
          transforms.pop();
          lineWidths.pop();
          break;
        case 'translate':
          transforms
            .last()
            .push({translate: {x: call.arguments[0], y: call.arguments[1]}});
          break;
        case 'scale':
          transforms
            .last()
            .push({scale: {x: call.arguments[0], y: call.arguments[1]}});
          break;
        case 'stroke':
          shapesInPath.forEach(function(shape) {
            switch (shape.type) {
              case 'rect':
                x = shape.x;
                y = shape.y;
                width = shape.width;
                height = shape.height;
                scaledLineWidth = lineWidth !== 1 ? lineWidth : 0;
                xScaledLineWidth = scaledLineWidth * transform.scale.x,
                yScaledLineWidth = scaledLineWidth * transform.scale.y,
                newBox = {x: x - xScaledLineWidth  / 2, y: y - yScaledLineWidth / 2, width: width + xScaledLineWidth, height: height + yScaledLineWidth};
                box = that.union(box, newBox);
                break;
              case 'arc':
                cx = shape.cx;
                cy = shape.cy;
                rx = shape.rx;
                ry = shape.ry;
                scaledLineWidth = lineWidth !== 1 ? lineWidth : 0;
                xScaledLineWidth = scaledLineWidth * transform.scale.x,
                yScaledLineWidth = scaledLineWidth * transform.scale.y,
                newBox = {x: cx - rx - xScaledLineWidth / 2, y: cy - ry - yScaledLineWidth / 2, width: 2 * rx + xScaledLineWidth, height: 2 * ry + yScaledLineWidth};
                box = that.union(box, newBox);
                break;
              case 'lineTo':
                x1 = shape.x1;
                y1 = shape.y1;
                x2 = shape.x2;
                y2 = shape.y2;
                scaledLineWidth = that.getScaledWidthOfLine(x1, y1, x2, y2, transform.scale.x, transform.scale.y, lineWidth);
                rect = that.getRectAroundLine(x1, y1, x2, y2, scaledLineWidth !== 1 ? scaledLineWidth : 0);
                newBox = {
                  x: Math.min(rect.x1, rect.x2, rect.x3, rect.x4),
                  y: Math.min(rect.y1, rect.y2, rect.y3, rect.y4),
                  width: Math.max(rect.x1, rect.x2, rect.x3, rect.x4) - Math.min(rect.x1, rect.x2, rect.x3, rect.x4),
                  height: Math.max(rect.y1, rect.y2, rect.y3, rect.y4) - Math.min(rect.y1, rect.y2, rect.y3, rect.y4)
                };
                box = that.union(box, newBox);
                break;
            }
          });
          break;
        case 'fill':
          shapesInPath.forEach(function(shape) {
            switch (shape.type) {
              case 'rect':
                x = shape.x;
                y = shape.y;
                width = shape.width;
                height = shape.height;
                newBox = {x: x, y: y, width: width, height: height};
                box = that.union(box, newBox);
                break;
              case 'arc':
                cx = shape.cx;
                cy = shape.cy;
                rx = shape.rx;
                ry = shape.ry;
                newBox = {x: cx - rx, y: cy - ry, width: 2 * rx, height: 2 * ry};
                box = that.union(box, newBox);
                break;
            }
          });
          break;
        case 'beginPath':
          shapesInPath = [];
          break;
      }
      switch(call.attr) {
        case 'lineWidth':
          lineWidths[lineWidths.length - 1] = call.val;
          break;
      }
    });
    return box;
  }

  this.firstTruthyOrZero = function(val1, val2){
    if (val1 || val1 === 0) {
      return val1;
    }
    return val2;
  }

  this.union = function(box1, box2) {
    box1 = {
      x: that.firstTruthyOrZero(box1.x, box2.x),
      y: that.firstTruthyOrZero(box1.y, box2.y),
      width: that.firstTruthyOrZero(box1.width, box2.width),
      height: that.firstTruthyOrZero(box1.height, box2.height)
    };
    box2 = {
      x: that.firstTruthyOrZero(box2.x, box1.x),
      y: that.firstTruthyOrZero(box2.y, box1.y),
      width: that.firstTruthyOrZero(box2.width, box1.width),
      height: that.firstTruthyOrZero(box2.height, box1.height)
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
  }

  this.totalTransform = function(transforms) {
    return transforms
      .map(function(value) {
        return {
          translate: value.translate || {x: 0, y: 0},
          scale: value.scale || {x: 1, y: 1}
        };
      })
      .reduce(function(previousValue, currentValue) {
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
  }

  this.getRectAroundLine = function(x1, y1, x2, y2, width) {
    var rect;
    if (x1 === y1 && x1 === x2 && x1 === y2) {
      rect = {
        x1: x1, y1: x1,  x2: x1, y2: x1,
        x4: x1, y4: x1,  x3: x1, y3: x1
      };
    } else {
      rect = that.getRectAroundLongLine(x1, y1, x2, y2, width);
    }
    return rect;
  }

  this.getRectAroundLongLine = function(x1, y1, x2, y2, width) {
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
  }

  this.getScaledWidthOfLine = function(x1, y1, x2, y2, sx, sy, width) {
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
  }

  // http://stackoverflow.com/questions/2752725/finding-whether-a-point-lies-inside-a-rectangle-or-not
  this.isPointInsideRectangle = function(point, rectangle) {
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

    var isInside = segments.map(function(segment) {
      var A = -(segment.y2 - segment.y1),
        B = segment.x2 - segment.x1,
        C = -(A * segment.x1 + B * segment.y1),
        D = A * point.x + B * point.y + C;
        return D;
    }).every(function(D) {
      return D > 0;
    });

    return isInside;
  }


}
