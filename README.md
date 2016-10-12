## femur
femur is used to wrap a function so as to provide an execution timer. When
wrapping a function with femur, you provide a callback to which femur will
pass the function execution duration. As such, make sure your duration
callback is asynchronous.

## Install
```
$ npm install femur --save
```

## Usage

### Wrapping functions
The main point of femur is to be able to provide an execution duration logger
when initially wrapping a function. As such, using femur is pretty simple.

```js
const femur = require('femur');

function durationLogger(duration) {
  console.log(duration);
}

function max(a, b) {
  return Math.max(a, b);
}


// Wrapping synchronous functions is simple.
let wrappedMax = femur.wrap(max, durationLogger);
wrappedMax(4, 5); // returns 5 and logs the duration to the console


// Wrapping asynchronous functions is just as easy.
function asyncMax(a, b, cb) {
  cb(Math.max(a, b));
}

let asyncWrappedMax = femur.wrap(asyncMax, durationLogger);
// As a note on ordering, the below will log the duration to the console first,
// and then it will log 5 to the console.
asyncWrappedMax(4, 5, (val) => {
  console.log(val);
});

```


## Release History
*1.0.0 Initial release.
