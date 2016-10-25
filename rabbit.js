if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
};

if (!Array.prototype.flatten) {
  Array.prototype.flatten = function() {
    return this
      .reduce(function(previousArray, currentArray) {
        return previousArray.concat(currentArray);
      }, []);
  }
}


function Rabbit() {

    function findAllShapesIgnoringArguments(shape, where) {
      var found = [], index = 0;
      do {
        index = findShapeIgnoringArguments(shape, where, index);
        if (index !== -1) {
          found.push(where.slice(index, index + shape.length));
          index += shape.length;
        }
      } while (index !== -1 && index < where.length);
      return found;
    }

    function findShapeIgnoringArguments(shape, where, startIndex) {
      startIndex = startIndex || 0;
      var match = false, index = -1;
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
    }

    function removeShapes(shapes, from) {
      var copy = from.slice(0, from.length);
      shapes.forEach(function(shape) {
        var index = -1;
        do {
          index = findShapeIgnoringArguments(shape, copy);
          if (index !== -1) {
            copy.splice(index, shape.length);
          }
        } while (index !== -1);
      });
      return copy;
    }

    function getBBox(shape) {
      var box = {x: NaN, y: NaN, width: NaN, height: NaN};
        transforms = [[]],
        path = [];
      shape.forEach(function (call) {
        var cx, cy, rx, ry, x, y, width, height, newBox,
          transform = totalTransform(transforms.flatten());
        switch(call.method) {
          case 'fillRect':
            x = call.arguments[0] * transform.scale.x + transform.translate.x;
            y = call.arguments[1] * transform.scale.y + transform.translate.y;
            width = call.arguments[2] * transform.scale.x;
            height = call.arguments[3] * transform.scale.y;
            newBox = {x: x, y: y, width: width, height: height};
            box = union(box, newBox);
            break;
          case 'strokeRect':
            x = call.arguments[0] * transform.scale.x + transform.translate.x;
            y = call.arguments[1] * transform.scale.y + transform.translate.y;
            width = call.arguments[2] * transform.scale.x;
            height = call.arguments[3] * transform.scale.y;
            newBox = {x: x, y: y, width: width, height: height};
            box = union(box, newBox);
            break;
          case 'rect':
            x = call.arguments[0] * transform.scale.x + transform.translate.x;
            y = call.arguments[1] * transform.scale.y + transform.translate.y;
            width = call.arguments[2] * transform.scale.x;
            height = call.arguments[3] * transform.scale.y;
            newBox = {x: x, y: y, width: width, height: height};
            path.push(newBox);
            break;
          case 'arc':
            cx = call.arguments[0] * transform.scale.x + transform.translate.x;
            cy = call.arguments[1] * transform.scale.y + transform.translate.y;
            rx = call.arguments[2] * transform.scale.x;
            ry = call.arguments[2] * transform.scale.y
            newBox = {x: cx - rx, y: cy - ry, width: 2 * rx, height: 2 * ry};
            path.push(newBox);
            break;
          case 'save':
            transforms.push([]);
            break;
          case 'restore':
            transforms.pop();
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
            path.forEach(function(newBox) {
              box = union(box, newBox);
            });
            break;
          case 'fill':
            path.forEach(function(newBox) {
              box = union(box, newBox);
            });
            break;
          case 'beginPath':
            path = [];
            break;
        };
      });
      return box;
    };

    function union(box1, box2) {
      box1 = {
        x: box1.x || box2.x,
        y: box1.y || box2.y,
        width: box1.width || box2.width,
        height: box1.height || box2.height
      };
      box2 = {
        x: box2.x || box1.x,
        y: box2.y || box1.y,
        width: box2.width || box1.width,
        height: box2.height || box1.height
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

    function totalTransform(transforms) {
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

    // http://stackoverflow.com/questions/2752725/finding-whether-a-point-lies-inside-a-rectangle-or-not
    function isPointInsideRectangle(point, rectangle) {
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


    this.findAllShapesIgnoringArguments = findAllShapesIgnoringArguments;
    this.findShapeIgnoringArguments = findShapeIgnoringArguments;
    this.removeShapes = removeShapes;
    this.getBBox = getBBox;
    this.union = union;
    this.totalTransform = totalTransform;
    this.isPointInsideRectangle = isPointInsideRectangle;
    this.customMatchers = {

      toBePartOf: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            var match = false;
            for (var i = 0; i < expected.length - actual.length; i++) {
              match = true;
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
            var result = match ? {pass: true} : {pass: false, message: 'Shape not part of'};
            return result;
          }
        }
      },

      toBeInsideTheAreaOf: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            var smallShape = actual,
              bigShape = expected,
              bigShapeBBox = getBBox(bigShape),
              smallShapeBBox = getBBox(smallShape),
              center = {x: smallShapeBBox.x + smallShapeBBox.width / 2, y: smallShapeBBox.y + smallShapeBBox.height / 2},
              isCenterInside = isPointInsideRectangle(center, bigShapeBBox),
              result = isCenterInside ? {pass: true} : {pass: false, message: 'Shape is not inside the area of'};
            return result;
          }
        }
      },

      toHaveTheSamePositionWith: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            var actualBBox = getBBox(actual),
              expectedBBox = getBBox(expected),
              haveTheSamePosition = actualBBox.x === expectedBBox.x && actualBBox.y === expectedBBox.y,
              result = haveTheSamePosition ? {pass: true} : {pass: false, message: 'Shapes don`t have the same position'};
            return result;
          }
        }
      },
      
      toHaveTheSameSizeWith: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            var actualBBox = getBBox(actual),
              expectedBBox = getBBox(expected),
              haveTheSameSize = actualBBox.width === expectedBBox.width && actualBBox.height === expectedBBox.height,
              result = haveTheSameSize ? {pass: true} : {pass: false, message: 'Shapes don`t have the same size'};
            return result;
          }
        }
      },

      toBeHorizontallyAlignWith: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            var actualBBox = getBBox(actual),
              expectedBBox = getBBox(expected),
              haveTheSameAlignment = actualBBox.y === expectedBBox.y,
              result = haveTheSameAlignment ? {pass: true} : {pass: false, message: 'Shapes don`t have the same horizontal position'};
            return result;
          }
        }
      },

      toBeVerticallyAlignWith: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            var actualBBox = getBBox(actual),
              expectedBBox = getBBox(expected),
              haveTheSameAlignment = actualBBox.x === expectedBBox.x,
              result = haveTheSameAlignment ? {pass: true} : {pass: false, message: 'Shapes don`t have the same vertical position'};
            return result;
          }
        }
      }

    };

};