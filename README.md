# Overview

Rabbit is a JavaScript library for writing tests for code drawing on canvas.

It's using [Canteen](https://github.com/platfora/Canteen) to spy all the calls to a canvas and provides higher level abstraction functions and Jasmine checkers for finding and inspecting the shapes being drawn.


# How it's working

Rabbit is not doing image recognition.


# Usage

* Set up [Canteen](https://github.com/platfora/Canteen/blob/master/README.md)
* Create a Rabbit object. One per test suite is enough:
```js
rabbit = new Rabbit();
```
* Optional: add the Rabbit matchers to Jasmine:
```js
jasmine.addMatchers(rabbit.customMatchers);
```
* Let your code draw on canvas.
* Create a reference drawing in a different canvas. It can be a simple circle, rectangle or anything you expect your canvas under test to contain.
* Get the call records from both the canvases using Canteen:
```js
var canvasUnderTestStack = canvasUnderTest.getContext('2d').stack();
var referenceCanvasStack = referenceCanvas.getContext('2d').stack();
```
* Use Rabbit to find whether the canvas under test contains the reference:
```js
var found = rabbit.findAllShapesIgnoringArguments(referenceCanvasStack, canvasUnderTestStack);
expect(found.length).toBe(1);
```
* Or just use a custom matcher:
```js
expect(referenceCanvasStack).toBePartOf(canvasUnderTestStack);
```
