'use strict';
const SerialPort = require('serialport');
const EventEmitter = require('events');

const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/serial0', {
  baudRate: 115200,
});

const parser = port.pipe(new Readline('\n'));


class Emitter extends EventEmitter {};
const streamer = new Emitter();
let lowBufferThreshold = 10;

const watcher = (emitter) => {
  return (buff, threshold) => {
    if (buff.length === threshold) {
      emitter.emit('buffer-low');
    }
  }
}

const watchBuffer = watcher(streamer);

const parseGrblStatus = (res) => {
  if (!res.startsWith('<')) {
    return undefined;
  }
  const status = res.match(/^<(\w+)\|WPos:(-?\d+\.\d+),(-?\d+\.\d+),(-?\d+\.\d+)/);
  return {state: status[1], x: status[2], y: status[3]};
}

const getStatus = () => {
  return new Promise((resolve, reject) => {
    const getStatusTimeout = setTimeout(() => {
      reject('get status timeout');
    }, 2000);
    let status;
    parser.on('data', function getState (data) {
      if (status = parseGrblStatus(data)) {
        clearTimeout(getStatusTimeout);
        parser.removeListener('data', getState);
        resolve(status);
      }
    });
    port.write('?');
  });
}

const appendNewline = (s) => `${s}\n`;

port.on('error', err => {
  console.log('Error: ', err.message);
});

port.on('open', () => {
  streamer.emit('port-open');
});

const parseGrbl = (res) => {
  console.log('Got: ', res);
  res = res.toString('utf8');
  if (res.includes('ok')) {
    grbl.use();
    fillGrblBuffer();    
  }else if (res.includes('Grbl')) {
   streamer.emit('first-contact'); 
  }else if (res.includes('error')) {
      //switch error code?
  }
}

parser.on('data', parseGrbl);

//object methods referencing 'this' means functions composed of them must bind them
//to their parent object when passing them to the composition function

const commands = {
  queue : [],
  next : function() {
    if (this.queue.length) {
      return this.queue[this.queue.length -1];
    } else {
      return null;
    }
  },
  add: function(cmd) {
    if (cmd.charAt(cmd.length -1) !== '\n') {
      cmd += '\n';
    }
    this.queue.unshift(cmd);
    //if streaming has stopped (or will stop after next response (a rare case??))
    //kick things off again with a newline
    //TODO: but only send once!
    if (grbl.streaming === false) {
      send('\n');
      grbl.streaming = true;
    }
  },
  consume: function() {
    const consumed = this.queue.pop();
    //console.log('Buffer size: ', this.queue.length);
    watchBuffer(this.queue, lowBufferThreshold);
    return consumed;
  }
}

const grbl = {
  len: 127,
  queued: [],
  free: 127,
  streaming: false,

  add: function (cmd) {
//    console.log(`added: ${cmd} (${cmd.length})`);
    this.free -= cmd.length;
//    console.log('grbl free: ', this.free);    
    this.queued.push(cmd);
  },
  use: function () {
    //console.log(`use called and grbl queue has ${this.queued.length} elements`);

    if (this.queued.length) {  
//      console.log(`removed: ${this.queued[0]} (${this.queued[0].length})`);        
      this.free += this.queued.shift().length;
//      console.log('free: ', this.free);    
      if (this.free === this.len) {
        //last command in queue has been parsed!
        streamer.emit('grbl-empty');
        this.streaming = false;
      }
    }
  }
}
const viewBytes = (s) => {
  return s.slice().split('').map((e) => {return e.charCodeAt(0)});
}

const send = (cmd) => {
  console.log(`sending: ${cmd}`);
  port.write(cmd);
}

const consumer = (getCmd, send, track) => {
  return () => {
    let command = getCmd();
    track(command);
    send(command);
  }
}

const consumeCommand = consumer(commands.consume.bind(commands), send, grbl.add.bind(grbl));

const fillGrblBuffer = () => {
  if (commands.next() && (commands.next().length < grbl.free)) {
    consumeCommand();
    fillGrblBuffer();
  } else {
    return;
  }
}

module.exports = streamer;
streamer.buffer = (cmd) => {
  commands.add(cmd);
}
streamer.setThreshold = (thresh) => {
  lowBufferThreshold = thresh
};
streamer.getGrblStatus = getStatus;
