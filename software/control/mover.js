const stream = require('./grblStream.js');
const EventEmitter = require('events');
const logger = require('tracer').console();
const Noise = require('toxiclibsjs/math/noise');

const simplex = Noise.simplexNoise;

//set this val here since it directly impacts how many commands are sent at
//a time?
stream.setThreshold(5);

class Emitter extends EventEmitter {};
const mover = new Emitter();
const dispensePosition = {x: 0, y: -65};

const trim = (precision) => {
  return (val) => {
    return Number.parseFloat(val).toFixed(precision);
  }
}

const trim4 = trim(4);

const gcodePoint = (x, y) => {
 return `X${x}Y${y}`;
}

const noise2D = (scalar, offset, x, y) => {
  return simplex.noise( x * scalar + offset, y * scalar );
}

const valueAtCoord = (x, y, width, arr) => {
  return arr[x + y * width];
}

const moveTo = (coordinate) => {
  return `G1X${coordinate.x}Y${coordinate.y}`;
}

const sendSomeMoves = () => {
  logger.log('sending moves');
  let excitation;
  let moveCmd;
  for (let i = 0; i < 20; i++) {
    excitation = mood.getMood(location.current().x, location.current().y);
    moveCmd = location.moveDist(excitation * 0.05);
    stream.buffer(moveCmd);
  }
}

const location = (() => {
  const mod = {};
  const currentLocation = {x: 0, y: 0};
  const offsets = {x: 1, y: 50};
  let scale = 53;

  mod.moveDist = (amt) => {
    offsets.x += amt;
    offsets.y += amt;
//    scale = amt * 160;
    const destX = noise2D(0.04, offsets.x, 1, 1) * scale;
    const destY = noise2D(0.04, offsets.y, 1, 1) * scale;
    currentLocation.x = destX;
    currentLocation.y = destY;
//    console.log('\n' + amt + '\n');
    return(`G1${gcodePoint(trim4(destX), trim4(destY))}F${trim4(1000 + amt * 50000)}`);    
  };
  
  mod.current = () => {
    return currentLocation;
  }

  return mod;
})();

const mood = (() => {
  const mod = {};
  const size = 106;
  const scalar = 0.04;
  let offset = 1;
  const offsetShift = 0.005;
  let backgroundMood = [];
  
  const createMoodMap = (scalar, width, height, offset) => {
    const map = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const noiseVal = noise2D(scalar, offset, x, y, );
        const c = ((noiseVal + 1) / 2);
        map[x + y * width] = c;             
      }
    }
    return map;
  }

  backgroundMood = createMoodMap(scalar, size, size, offset);
  
  mod.getMood = (x, y) => {
    const value = valueAtCoord(Math.floor(x) + size / 2, Math.floor(y) + size / 2, size, backgroundMood);
    return value;
  }

  setInterval(() => {
    offset += offsetShift;
    backgroundMood = createMoodMap(scalar, size, size, offset)
  }, 10000);

  return mod;
})();

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
  stream.removeAllListeners('buffer-low');
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
    stream.buffer('F3000');
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
    }, 30000); //how long do you wait before your drink starts pouring without getting anxious? 5sec max?
  });
}

module.exports = mover;
