const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/tty.usbserial-FTELMX61', {
  baudRate: 115200
});

const parser = port.pipe(new Readline());

port.on('error', err => {
  console.log('Error: ', err.message);
});

port.on('open', () => {
  //do nothing
});

const parseGrbl = (res) => {
  console.log('Got: ', res);
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
    fillGrblBuffer();
  },
  consume: function() {
    return this.queue.pop();
  }
}

const grbl = {
  len: 128,
  queued: [],
  free: 128,
  add: function (cmd) {
    console.log('added: ', cmd.length);
    this.free -= cmd.length;
    console.log('free: ', this.free);    
    this.queued.push(cmd.length);
  },
  use: function () {
    if (this.queued.length) {  
      console.log('removed: ', this.queued[0]);        
      this.free += this.queued.shift();
      console.log('free: ', this.free);    
    }
  }
}

const send = (output) => {
  return (cmd) => {
    console.log('sending: ', cmd);
    output(cmd + '\n');
  }
}

const sendGrbl = send(port.write.bind(port));
const sendConsole = send(console.log);

const consumer = (getCmd, send, track) => {
  return () => {
    let command = getCmd();
    track(command);
    send(command);
  }
}

const consumeCommand = consumer(commands.consume.bind(commands), sendGrbl, grbl.add.bind(grbl));

const fillGrblBuffer = () => {
  if (commands.next() && (commands.next().length < grbl.free)) {
    consumeCommand();
    fillGrblBuffer();
  } else {
    return;
  }
}
fillGrblBuffer();


module.exports.send = (cmd) => {
  commands.add(cmd);
}















