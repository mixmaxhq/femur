/* globals describe, expect, it */
'use strict';

const femur = require('..');

function isNumber(n) {
  return typeof n === 'number';
}

describe('femur', () => {
  let durationAssert = (dur) => {
    expect(isNumber(dur)).toEqual(true);
  };

  it('should be able to time a function call', (done) => {
    // This test will timeout if the done callback isn't called.
    let wrappedMax = femur.wrap(Math.max, durationAssert);
    let val = wrappedMax(4, 5);
    expect(val).toEqual(5);
    done();
  });

  it('should be able to time a function with no arguments', (done) => {
    // This test will timeout if the done callback isn't called.
    let wrappedFn = femur.wrap(function(){return 5;}, durationAssert);
    let val = wrappedFn();
    expect(val).toEqual(5);
    done();
  });

  it('should be able to time a function with a callback', (done) => {
    // This test will timeout if the done callback isn't called.
    let fn = function(cb) {
      cb(5);
    };
    let wrappedFn = femur.wrap(fn, durationAssert);

    let cb = function(five) {
      expect(five).toEqual(5);
      done();
    };
    wrappedFn(cb);
  });
});
