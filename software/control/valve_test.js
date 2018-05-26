const valves = require('./valve_control.js');
const readline = require('readline');
const SerialPort = require('serialport');

const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/serial0', {
  baudRate: 115200,
});

const parser = port.pipe(new Readline('\n'));

const parseLine = (res) => {
  const cmds = res.split(' ');
  const valve = Number.parseInt(cmds[1]) - 1;
  const action = cmds[0].toLowerCase();
  activate(valve, action);
}

const activate = (valve, position) => {
 if (position === 'open') {
   valves.open(valve);
 }
  if (position === 'close') {
    valves.close(valve);
  }
}

port.on('error', err => {
  console.log('Error: ', err.message);
});

port.on('open', () => {
  console.log('port open');
  console.log('Usage: [open / close] [valve number (1 - 4)]');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.prompt();
  rl.on('line', (cmd) => {
    parseLine(cmd);
    rl.prompt();
  });
});

parser.on('data', console.log);



