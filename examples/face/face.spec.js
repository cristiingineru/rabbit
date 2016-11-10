"use strict";

/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

System.register(['eye.js', 'mouth.js', 'face.js', 'x/rabbit.js'], function(_export, _context) {

var Eye, Mouth, Face, Rabbit;


var go = function() {

  describe('Face', function () {
    'use strict';

    var $ = jQuery;
    var rabbit, fixture, placeholder, ctx, face;

    beforeAll(function() {
      rabbit = new Rabbit();
      jasmine.addMatchers(rabbit.customMatchers);
    });

    beforeEach(function () {
      fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 300px">').find('#demo-container').get(0);

      placeholder = $('<canvas id="placeholder"  />');
      placeholder.appendTo(fixture);
      ctx = placeholder[0].getContext('2d');
      face = new Face(ctx);
    });


    describe('with default options', function() {

      it('should have 2 eyes of the same size', function () {
          face.draw();

          var eyeCtx = newCtx();
          new Eye(eyeCtx).draw();
          var found = rabbit.findAllShapesIgnoringArguments(eyeCtx.stack(), ctx.stack());

          expect(found.length).toBe(2);
          expect(found[0]).toHaveTheSameSizeWith(found[1]);
      });

      it('should have the eyes aligned', function () {
          face.draw();

          var eyeCtx = newCtx();
          new Eye(eyeCtx).draw();
          var found = rabbit.findAllShapesIgnoringArguments(eyeCtx.stack(), ctx.stack());

          expect(found[0]).toBeHorizontallyAlignWith(found[1]);
      });

      it('should contain the eyes inside it`s area', function () {
          face.draw();

          var eyeCtx = newCtx();
          new Eye(eyeCtx).draw();
          var foundEyes = rabbit.findAllShapesIgnoringArguments(eyeCtx.stack(), ctx.stack());

          var justTheFaceShape = rabbit.removeShapes(foundEyes, ctx.stack())
          foundEyes.forEach(function(foundEye) {
            expect(foundEye).toBeInsideTheAreaOf(justTheFaceShape);
          });
      });

      it('should have 1 mouth', function () {
          face.draw();

          var mouthCtx = newCtx();
          new Mouth(mouthCtx).draw();
          var found = rabbit.findAllShapesIgnoringArguments(mouthCtx.stack(), ctx.stack());

          expect(found.length).toBe(1);
      });

    });


    describe('side', function () {

      ['left', 'right'].forEach(function (side) {
        it('should have 1 eye when looked from ' + side, function () {
            face.draw({side: side});

            var eyeCtx = newCtx();
            new Eye(eyeCtx).draw();
            var foundEyes = rabbit.findAllShapesIgnoringArguments(eyeCtx.stack(), ctx.stack());

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
        var foundEyeStacks = rabbit.findAllShapesIgnoringArguments(eyeStack, ctx.stack()),
          lastLeftEye = foundEyeStacks.shift(),
          lastRightEye = foundEyeStacks.shift();

        for(var i = 0; i < 5; i++) {
          ctx.clear();
          rafMock.step();

          foundEyeStacks = rabbit.findAllShapesIgnoringArguments(eyeStack, ctx.stack());
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

          var foundEyeStacks = rabbit.findAllShapesIgnoringArguments(eyeStack, ctx.stack()),
            justTheFaceShape = rabbit.removeShapes(foundEyeStacks, ctx.stack()),
            leftEye = foundEyeStacks.shift(),
            rightEye = foundEyeStacks.shift();

          expect(leftEye).toBeInsideTheAreaOf(justTheFaceShape);
          expect(rightEye).toBeInsideTheAreaOf(justTheFaceShape);
        }
      });

    });

    function newCtx() {
      var placeholder = $('<canvas />');
      placeholder.appendTo(fixture);
      var ctx = placeholder[0].getContext('2d');
      return ctx;
    }
  });


};



return {
  setters: [function (_eye) {
    Eye = _eye.Eye;
  }, function (_mouth) {
    Mouth = _mouth.Mouth;
  }, function (_face) {
    Face = _face.Face;
  }, function (_rabbit) {
    Rabbit = _rabbit.Rabbit;
  }],
  execute: go
};


});
