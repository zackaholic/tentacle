const arc = require("./arc.js");
const stream = require('./grblStream.js');

let arc1 = arc.firstArc()
let arc2;

const trim = (precision) => {
  return (val) => {
    return Number.parseFloat(val).toFixed(precision);
  }
}

const trim4 = trim(4);

const testMove = () => {
  return `G1X${trim4(Math.random() * 20 - 10)}Y${trim4(Math.random() * 20 - 10)}`;
}

const sender = () => {
  stream.removeListener('bufferReady', sender);
  for (let i = 0; i < 20; i++) {
    stream.buffer(testMove());
  }
  stream.on('bufferReady', sender);
}

stream.on('bufferReady', sender);

stream.on('error', err => console.log);

stream.buffer('F10000');

