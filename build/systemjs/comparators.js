"use strict";

System.register([], function (_export, _context) {
  "use strict";

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

  _export('Comparators', Comparators);

  return {
    setters: [],
    execute: function () {}
  };
});