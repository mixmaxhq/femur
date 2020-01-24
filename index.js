'use strict';

/**
 * femur is used to wrap a function so as to provide an execution timer. When
 * wrapping a function with femur, you provide a callback to which femur will
 * pass the function execution duration. As such, make sure your duration
 * callback is asynchronous.
 *
 * Usage:
 * ```js
 *  const femur = require('..');
 *
 *  function asyncMax(a, b, cb) {
 *    cb(Math.max(a, b));
 *  }
 *
 *  function durationLogger(dur) {
 *    console.log('duration was: ' + dur);
 *  }
 *
 *  let wrappedMax = femur.wrap(asyncMax, durationLogger);
 *
 *  wrappedMax(4, 5);
 * ```
 */

const assert = require('assert');

/**
 * We use these time units mutators in order to convert the process.hrtime
 * [seconds, nanoseconds] data into a duration with the desired unit.
 */
const TIME_UNITS = {
  s: { multiplier: 1, divider: 1000000000 },
  ms: { multiplier: 1000, divider: 1000000 },
  ns: { multiplier: 1000000000, divider: 1 },
};

/**
 * Timer is used to time a function with a very high level of precision. Using
 * a timer is extremely simply:
 *
 * ```js
 *   let timer = new Timer();
 *   timer.start();
 *   // do work...
 *   let duration = timer.stop();
 * ```
 */
class Timer {
  /**
   * start starts the timer.
   */
  start() {
    this._start = process.hrtime();
  }

  /**
   * duration calculates the duration that we've been running since the timer
   * started.
   * @param{String} resolution (optional) The unit of time to return the
   *    duration in. If no unit is provided, we use milliseconds as the unit of
   *    time.
   * @return{Number}           The duration that the timer has been running.
   * @throws{AssertionError}   Throws if we call duration before calling start
   *    or if a resolution that is provided that is not one of: s, ms or ns.
   */
  duration(resolution) {
    assert(this._start, 'Cannot call duration without having called start()');
    const diff = process.hrtime(this._start);

    resolution = resolution || 'ms';
    const mutators = TIME_UNITS[resolution];

    assert(mutators, 'Must provide a valid resolution (s, ms, or ns)');
    const divider = mutators.divider,
      multiplier = mutators.multiplier;

    return diff[0] * multiplier + Math.floor(diff[1] / divider);
  }
}

/**
 * isFunction is a utility function for determining if the provided argument is
 * a function.
 * @param  {Unknown}  a A unknown value of unknown type.
 * @return {Boolean}   True if a is a function, false otherwise.
 */
function isFunction(a) {
  return typeof a == 'function' || false;
}

/**
 * wrap wraps a function to call the durationCb with the duration it took to
 * execute the given function. It can optionally be provided with a given
 * context to run within.
 * @param  {Function} func       The function to wrap.
 * @param  {Function} durationCb The callback to which the duration will be provided.
 * @param  {Object} context      (optional) The context to run the function within.
 * @return {Function}            The timer wrapped function.
 */
function wrap(func, durationCb, context) {
  return sample(1.0, func, durationCb, context);
}

/**
 * sample wraps a function to call the durationCb with the duration it took to
 * execute the given function. It can optionally be provided with a given
 * context to run within. When the wrapped function is called, it will only time
 * and call the durationCb with the given frequency rate.
 * @param  {Float} rate          The rate with which to sample the function's execution time.
 * @param  {Function} func       The function to wrap.
 * @param  {Function} durationCb The callback to which the duration will be provided.
 * @param  {Object} context      (optional) The context to run the function within.
 * @return {Function}            The timer wrapped function.
 */
function sample(rate, func, durationCb, context) {
  var slice = Array.prototype.slice;

  var timedFunc = function() {
    const args = slice.call(arguments); // Convert arguments to a real array
    if (Math.random() >= rate) {
      // Don't sample it.
      return func.apply(context, args);
    }

    let isAsync = false;
    context = context || this;

    if (args && args.length) {
      // There could be a callback that was provided.
      const cb = args.pop();
      isAsync = isFunction(cb);
      args.push(cb); //  Push it back on to pop later.
    }

    const tmr = new Timer();
    if (isAsync) {
      // If it was async we need to wrap the callback.
      const cb = args.pop();
      const timedCb = function() {
        const duration = tmr.duration();
        durationCb(duration);
        cb.apply(context, arguments);
      };

      tmr.start();
      args.push(timedCb); // Push new callback to args
      return func.apply(context, args);
    }

    tmr.start();
    const result = func.apply(context, args);
    const duration = tmr.duration();
    durationCb(duration);
    return result;
  };
  return timedFunc;
}

module.exports = {
  wrap,
  sample,
};
