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
        transforms = [[]];
      shape.forEach(function (call) {
        var cx, cy, rx, ry, x, y, width, height, newBox,
          transform = totalTransform(transforms.flatten());
        switch(call.method) {
          case 'arc':
            cx = call.arguments[0] * transform.scale.x + transform.translate.x;
            cy = call.arguments[1] * transform.scale.y + transform.translate.y;
            rx = call.arguments[2] * transform.scale.x;
            ry = call.arguments[2] * transform.scale.y
            newBox = {x: cx - rx, y: cy - ry, width: 2 * rx, height: 2 * ry};
            box = union(box, newBox);
            break;
          case 'rect':
            x = call.arguments[0] + transform.translate.x;
            y = call.arguments[1] + transform.translate.y;
            width = call.arguments[2];
            height = call.arguments[3];
            newBox = {x: x, y: y, width: width, height: height};
            box = union(box, newBox);
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
        };
      });
      return box;
    };

    function shapeSize(shape) {
      var size = {width: 0, height: 0};
      shape.forEach(function (call) {
        var cx, cy, r;
        switch(call.method) {
          case 'arc':
            cx = call.arguments[0];
            cy = call.arguments[1];
            r = call.arguments[2];
            size = maxSize(size, r * 2, r * 2);
            break;
        };
      });
      return size;
    }

    function shapePosition(shape) {
      var position = {x: NaN, y: NaN},
        translates = [[]];
      shape.forEach(function (call) {
        var cx, cy, r,
          translate = calculateTotalTranslation(translates);
        switch(call.method) {
          case 'arc':
            cx = call.arguments[0] + translate.x;
            cy = call.arguments[1] + translate.y;
            r = call.arguments[2];
            position = minPosition(position, cx - r, cy - r);
            break;
          case 'rect':
              x = call.arguments[0] + translate.x;
              y = call.arguments[1] + translate.y;
              position = minPosition(position, x, y);
              break;
          case 'save':
            translates.push([]);
            break;
          case 'restore':
            translates.pop();
            break;
          case 'translate':
            translates
              .last()
              .push({x: call.arguments[0], y: call.arguments[1]});
            break;
        };
      });
      return position;
    }

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

    function calculateTotalTranslation(translates) {
      return translates
        .reduce(function(previousArray, currentArray) {
          return previousArray.concat(currentArray);
        }, [])
        .reduce(function(previousValue, currentValue) {
          return {
            x: previousValue.x + currentValue.x,
            y: previousValue.y + currentValue.y
          };
        }, {x: 0, y: 0});
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

    function maxSize(size, width, height) {
      return {
        width: Math.max(size.width, width),
        height: Math.max(size.height, height)
      };
    }

    function minPosition(position, x, y) {
      return {
        x: isNaN(position.x) ? x : Math.min(position.x, x),
        y: isNaN(position.y) ? y : Math.min(position.y, y)
      };
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
    this.shapeSize = shapeSize;
    this.shapePosition = shapePosition;
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
              bigShapePostion = shapePosition(bigShape),
              bigShapeSize = shapeSize(bigShape),
              rectangle = {x: bigShapePostion.x, y: bigShapePostion.y, width: bigShapePostion.x + bigShapeSize.width, height: bigShapePostion.y + bigShapeSize.height},
              smallShapePosition = shapePosition(smallShape),
              smallShapeSize = shapeSize(smallShape),
              center = {x: smallShapePosition.x + smallShapeSize.width / 2, y: smallShapePosition.y + smallShapeSize.height / 2},
              isCenterInside = isPointInsideRectangle(center, rectangle),
              result = isCenterInside ? {pass: true} : {pass: false, message: 'Shape is not inside the area of'};
            return result;
          }
        }
      },

      toHaveTheSamePositionWith: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            var actualPosition = shapePosition(actual),
              expectedPosition = shapePosition(expected),
              haveTheSamePosition = actualPosition.x === expectedPosition.x && actualPosition.y === expectedPosition.y,
              result = haveTheSamePosition ? {pass: true} : {pass: false, message: 'Shapes don`t have the same position'};
            return result;
          }
        }
      },

      toBeHorizontallyAlignWith: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            var actualPosition = shapePosition(actual),
              expectedPosition = shapePosition(expected),
              haveTheSameAlignment = actualPosition.y === expectedPosition.y,
              result = haveTheSameAlignment ? {pass: true} : {pass: false, message: 'Shapes don`t have the same horizontal position'};
            return result;
          }
        }
      },

      toBeVerticallyAlignWith: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            var actualPosition = shapePosition(actual),
              expectedPosition = shapePosition(expected),
              haveTheSameAlignment = actualPosition.x === expectedPosition.x,
              result = haveTheSameAlignment ? {pass: true} : {pass: false, message: 'Shapes don`t have the same vertical position'};
            return result;
          }
        }
      },

      toHaveTheSizeWith: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            var actualSize = shapeSize(actual),
              expectedSize = shapeSize(expected),
              haveTheSameSize = actualSize.width === expectedSize.width && actualSize.height === expectedSize.height,
              result = haveTheSameSize ? {pass: true} : {pass: false, message: 'Shapes don`t have the same size'};
            return result;
          }
        }
      }

    };

};
