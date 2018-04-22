const SerialPort = require('serialport');
const EventEmitter = require('events');
const logger = require('tracer').console();

const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/serial0', {
  baudRate: 115200
});

const parser = port.pipe(new Readline({delimiter: '\r\n'}));

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

const appendNewline = (s) => `${s}\n`;

port.on('error', err => {
  logger.log('Error: ', err.message);
});

port.on('open', () => {
  streamer.emit('port-open');
});

const parseGrbl = (res) => {
  logger.log('Got: ', res);
  res = res.toString('utf8');
//TODO: why does only includes() work for this comparison???  
  if (res.includes('ok')) {
    grbl.use();
    fillGrblBuffer();    
  } else {
    if (res.includes('error')) {
      //switch error code
      //are any errors recoverable from??
    }
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
    this.queue.unshift(cmd);
    //if streaming has stopped (or will stop after next response (a rare case??))
    //kick things off again with a newline
    //TODO: but only send once!
    if (grbl.streaming === false) {
      send(appendNewline(''));
      grbl.streaming = true;
    }
  },
  consume: function() {
    const consumed = this.queue.pop();
    //logger.log('Buffer size: ', this.queue.length);
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
    //logger.log(`added: ${cmd} (${cmd.length})`);
    this.free -= cmd.length;
    //logger.log('grbl free: ', this.free);    
    this.queued.push(cmd);
  },
  use: function () {
    //logger.log(`use called and grbl queue has ${this.queued.length} elements`);

    if (this.queued.length) {  
      logger.log('removed: ', this.queued[0]);        
      this.free += this.queued.shift().length;
      logger.log('free: ', this.free);    
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
  
  logger.log(`sending: ${cmd}`);
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
  commands.add(appendNewline(cmd));
}
streamer.setThreshold = (thresh) => {
  lowBufferThreshold = thresh
};
