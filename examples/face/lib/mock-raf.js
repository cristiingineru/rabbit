// Original source: https://github.com/FormidableLabs/mock-raf

window.createRafMock = function () {
  var allCallbacks = [];
  var prevTime = 0;

  var now = function () {
    return prevTime;
  };

  var raf = function (callback) {
    allCallbacks.push(callback);
  };

  var cancel = function () {
    allCallbacks = [];
  };

  var step = function (count, time) {
    count = count || 1;
    time = time || 1000 / 60;

    var oldAllCallbacks;

    for (var i = 0; i < count; i++) {
      oldAllCallbacks = allCallbacks;
      allCallbacks = [];

      oldAllCallbacks.forEach(function (callback) {
        callback(prevTime + time);
      });

      prevTime += time;
    }
  }

  return {
    now: now,
    raf: raf,
    cancel: cancel,
    step: step
  };
};
