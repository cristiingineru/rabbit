/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

describe('Face', function () {
    'use strict';

    var fixture, placeholder, ctx, face;

    beforeEach(function () {
      jasmine.addMatchers(customMatchers);

      fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 300px">').find('#demo-container').get(0);

      placeholder = $('<canvas id="placeholder"  />');
      placeholder.appendTo(fixture);
      ctx = placeholder[0].getContext('2d');
      face = new Face(ctx);
    });

    afterEach(function () {
        $('#demo-container').empty();
    });
    
  
    describe('with default options', function() {

        it('should have 2 eyes of the same size', function () {
            face.draw();

            var eyeCtx = newCtx();
            new Eye(eyeCtx).draw();
            var found = findAllShapesIgnoringArguments(eyeCtx.stack(), ctx.stack());

            expect(found.length).toBe(2);
            expect(found[0]).toHaveTheSizeWith(found[1]);
        });

        it('should have the eyes aligned', function () {
            face.draw();

            var eyeCtx = newCtx();
            new Eye(eyeCtx).draw();
            var found = findAllShapesIgnoringArguments(eyeCtx.stack(), ctx.stack());

            expect(found[0]).toBeHorizontallyAlignWith(found[1]);
        });

        it('should contain the eyes inside it`s area', function () {
            face.draw();

            var eyeCtx = newCtx();
            new Eye(eyeCtx).draw();
            var foundEyes = findAllShapesIgnoringArguments(eyeCtx.stack(), ctx.stack());

            var justTheFaceShape = removeShapes(foundEyes, ctx.stack())
            foundEyes.forEach(function(foundEye) {
              expect(foundEye).toBeInsideTheAreaOf(justTheFaceShape);
            });
        });
        
        it('should have 1 mouth', function () {
            face.draw();

            var mouthCtx = newCtx();
            new Mouth(mouthCtx).draw();
            var found = findAllShapesIgnoringArguments(mouthCtx.stack(), ctx.stack());

            expect(found.length).toBe(1);
        });
        
    });
    
    
    describe('side', function () {

        ['left', 'right'].forEach(function (side) {
          it('should have 1 eye when looked from ' + side, function () {
              face.draw({side: side});

              var eyeCtx = newCtx();
              new Eye(eyeCtx).draw();
              var foundEyes = findAllShapesIgnoringArguments(eyeCtx.stack(), ctx.stack());

              expect(foundEyes.length).toBe(1);
          });
        });
        
    });
    
    
    describe('drunk mood', function () {

        it('should render blurry eye when drunk', function () {
          face.draw({mood: 'drunk'});
          var drunkFace = ctx.stack();

          var eyeCtx = newCtx();
          new Eye(eyeCtx).draw({style: 'blurry'});
          var blurryEye = eyeCtx.stack();

          expect(blurryEye).toBePartOf(drunkFace);
        });
        
    });
    

    describe('crazy mood', function () {

      beforeEach(function () {
        jasmine.clock().install();
      });

      afterEach(function () {
        jasmine.clock().uninstall();
      });

      it('should animate in the next frame', function () {
          var window = {
              requestAnimationFrame: jasmine.createSpy('requestAnimationFrame')
            },
            face = new Face(ctx, window);

          face.draw({mood: 'crazy'});

          expect(window.requestAnimationFrame).toHaveBeenCalled();
      });

      it('should animate each frame', function () {
        var rafMock = window.createRafMock();
        spyOn(window, 'requestAnimationFrame').and.callFake(rafMock.raf);

        var face = new Face(ctx, window);
        face.draw({mood: 'crazy'});

        var frameCount = 5,
          initCount = 1;
        rafMock.step(frameCount);
        expect(window.requestAnimationFrame.calls.count()).toBe(frameCount + initCount);
      });

      it('should stop the animation when a non-animated draw is requested', function () {
        var rafMock = window.createRafMock();
        spyOn(window, 'requestAnimationFrame').and.callFake(rafMock.raf);

        var face = new Face(ctx, window),
          frameCount = 5,
          initCount = 1;
        face.draw({mood: 'crazy'});
        rafMock.step(frameCount);

        face.draw();

        var largeFrameCount = 10;
        rafMock.step(largeFrameCount);
        expect(window.requestAnimationFrame.calls.count()).toBe(frameCount + initCount);
      });

      it('should change the position of the eyes for each frame', function () {
        var rafMock = window.createRafMock();
        spyOn(window, 'requestAnimationFrame').and.callFake(rafMock.raf);

        var eyeCtx = newCtx();
        new Eye(eyeCtx).draw();
        var eyeStack = eyeCtx.stack();

        var face = new Face(ctx, window);
        face.draw({mood: 'crazy'});

        rafMock.step();
        var foundEyeStacks = findAllShapesIgnoringArguments(eyeStack, ctx.stack()),
          lastLeftEye = foundEyeStacks.shift(),
          lastRightEye = foundEyeStacks.shift();

        for(var i = 0; i < 5; i++) {
          ctx.clear();
          rafMock.step();

          foundEyeStacks = findAllShapesIgnoringArguments(eyeStack, ctx.stack());
          var leftEye = foundEyeStacks.shift(),
            rightEye = foundEyeStacks.shift();

          expect(leftEye).not.toHaveTheSamePositionWith(lastLeftEye);
          expect(rightEye).not.toHaveTheSamePositionWith(lastRightEye);

          lastLeftEye = leftEye;
          lastRightEye = rightEye;
        }
      });

      it('should change the position of the eyes inside the face area', function () {
        var rafMock = window.createRafMock();
        spyOn(window, 'requestAnimationFrame').and.callFake(rafMock.raf);

        var eyeCtx = newCtx();
        new Eye(eyeCtx).draw();
        var eyeStack = eyeCtx.stack();

        var face = new Face(ctx, window);
        face.draw({mood: 'crazy'});

        for(var i = 0; i < 100; i++) {
          ctx.clear();
          rafMock.step();

          var foundEyeStacks = findAllShapesIgnoringArguments(eyeStack, ctx.stack()),
            justTheFaceShape = removeShapes(foundEyeStacks, ctx.stack()),
            leftEye = foundEyeStacks.shift(),
            rightEye = foundEyeStacks.shift();

          expect(leftEye).toBeInsideTheAreaOf(justTheFaceShape);
          expect(rightEye).toBeInsideTheAreaOf(justTheFaceShape);
        }
      });

    });

    var customMatchers = {

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

    if (!Array.prototype.last) {
      Array.prototype.last = function() {
        return this[this.length - 1];
      };
    };

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

    function circles(stack) {
      return stack.filter(function(element) {
        var angleOfFullCircle = +(2 * Math.PI).toFixed(3);
        return element.method === 'arc' && (element.arguments[4] - element.arguments[3] === angleOfFullCircle);
      })
    }

    function arcs(stack) {
      return stack.filter(function(element) {
        var angleOfFullCircle = +(2 * Math.PI).toFixed(3);
        return element.method === 'arc' && (element.arguments[4] - element.arguments[3] < angleOfFullCircle);
      })
    }

    function rectangles(stack) {
      return stack.filter(function(element) {
        return element.method === 'strokeRect';
      })
    }

    function radius(circle) {
      return circle.arguments[2];
    }

    function position(circle) {
      return {cx: circle.arguments[0], cy: circle.arguments[1]};
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

    function newCtx() {
      var placeholder = $('<canvas />');
      placeholder.appendTo(fixture);
      var ctx = placeholder[0].getContext('2d');
      return ctx;
    }
});
