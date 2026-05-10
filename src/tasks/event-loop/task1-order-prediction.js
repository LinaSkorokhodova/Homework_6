const fs = require('fs');

console.log("1: sync start");

setTimeout(() => console.log("2: setTimeout 0"), 0);

setImmediate(() => console.log("3: setImmediate"));

Promise.resolve()
  .then(() => console.log("4: promise.then 1"))
  .then(() => console.log("5: promise.then 2"));

process.nextTick(() => console.log("6: nextTick"));

fs.readFile(__filename, () => {
  console.log("7: readFile callback");

  setTimeout(() => console.log("8: inner setTimeout 0"), 0);
  setImmediate(() => console.log("9: inner setImmediate"));

  Promise.resolve().then(() => console.log("10: inner promise"));
  process.nextTick(() => console.log("11: inner nextTick"));
});

console.log("12: sync end");