const stream = require('./grblStream.js');
const EventEmitter = require('events');
const logger = require('tracer').console();

//set this val here since it directly impacts how many commands are sent at
//a time?
stream.setThreshold(5);

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
  for (let i = 0; i < 6; i++) {
    stream.buffer(testMove());
  }
}

mover.getPosition = () => {
  return new Promise((resolve, reject) => {
    stream.getGrblStatus().then((res) => {
      resolve(res);
    },
    (rej) => {
      reject(rej);
    });
  });
}

stream.on('port-open', () => {
  mover.emit('ready');
});

mover.home = () => {
  stream.buffer(moveTo({x: 0, y: 0}));
}
mover.setSpeed = (f) => {
  stream.buffer(`F${f}`);
}

mover.attract = () => {
  //kick things off
  sendSomeMoves();
  stream.on('buffer-low', sendSomeMoves);
};

const closeEnough = (val1, val2, error) => {
    return Math.abs(val1 - val2) < error;
}

const positionsEqual = (pos1, pos2) => {
  if (!pos1.hasOwnProperty('x') ||
      !pos1.hasOwnProperty('y') ||
      !pos2.hasOwnProperty('x') ||
      !pos2.hasOwnProperty('y')) {
        throw new Error('argument is not a position object');
  }
  return (closeEnough(pos1.x, pos2.x, 0.1) && closeEnough(pos1.y, pos2.y, 0.1));
}

const grblIdle = (status) => {
  return status.state === 'Idle';
}

const alertOnPosition = (position) => {
  return new Promise((resolve, reject) => {
    const pollPositionInterval = setInterval(() => {
      stream.getGrblStatus().then((res) => {
        if (positionsEqual(position, res) && grblIdle(res)) {
          clearInterval(pollPositionInterval);
          resolve(res);
        }
      },
      (rej) => {
        clearInterval(pollPositionInterval);
        reject(rej);
      });
      }, 1000);
  });
}

mover.dispense = () => {
 return new Promise((resolve, reject) => {
    stream.removeListener('buffer-low', sendSomeMoves);
    stream.buffer(moveTo(dispensePosition));
    alertOnPosition(dispensePosition).then(() => {
      clearTimeout(dispenseTimeout);
      resolve();
    },
    (rej) => {
      reject(rej);
    });
    const dispenseTimeout = setTimeout(() => {
      reject('dispense move timeout');
    }, 120000); //how long do you wait before your drink starts pouring without getting anxious? 5sec max?
  });
}

module.exports = mover;
