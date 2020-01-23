/* globals describe, expect, it */
'use strict';

const femur = require('..');

function isNumber(n) {
  return typeof n === 'number';
}

describe('femur', () => {
  const durationAssert = (dur) => {
    expect(isNumber(dur)).toEqual(true);
  };

  it('should be able to time a function call', (done) => {
    // This test will timeout if the done callback isn't called.
    const wrappedMax = femur.wrap(Math.max, durationAssert);
    const val = wrappedMax(4, 5);
    expect(val).toEqual(5);
    done();
  });

  it('should be able to time a function with no arguments', (done) => {
    // This test will timeout if the done callback isn't called.
    const wrappedFn = femur.wrap(function() {
      return 5;
    }, durationAssert);
    const val = wrappedFn();
    expect(val).toEqual(5);
    done();
  });

  it('should be able to time a function with a callback', (done) => {
    // This test will timeout if the done callback isn't called.
    const fn = function(cb) {
      cb(5);
    };
    const wrappedFn = femur.wrap(fn, durationAssert);

    const cb = function(five) {
      expect(five).toEqual(5);
      done();
    };
    wrappedFn(cb);
  });
});
