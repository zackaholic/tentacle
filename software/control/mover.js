const stream = require('./grblStream.js');
const EventEmitter = require('events');
const logger = require('tracer').console();

class Emitter extends EventEmitter {};
const mover = new Emitter();
const dispensePosition = {x: 40, y: 0};

const trim = (precision) => {
  return (val) => {
    return Number.parseFloat(val).toFixed(precision);
  }
}

const trim4 = trim(4);

const testMove = () => {
  return `G1X${trim4(Math.random() * 20 - 10)}Y${trim4(Math.random() * 20 - 10)}`;
}

const moveTo = (coordinate) => {
  return `G1X${coordinate.x}Y${coordinate.y}`;
}

const sendSomeMoves = () => {
  logger.log('sending moves');
  for (let i = 0; i < 20; i++) {
    stream.buffer(testMove());
  }
}

stream.on('port-open', () => {
  mover.emit('ready');
});

mover.setSpeed = (f) => {
  stream.buffer(`F${f}`);
}

mover.attract = () => {
  //kick things off
  sendSomeMoves();
  stream.on('buffer-low', sendSomeMoves);
};

mover.dispense = () => {
  stream.removeListener('buffer-low', sendSomeMoves);
  //stream.on or stream.once or does it really even matter what's the point anyway?
  stream.once('grbl-empty', () => {
    logger.log('\ngrbl-empty event\n');
    mover.emit('move-complete');
  });
  stream.buffer(moveTo(dispensePosition));
};

module.exports = mover;
