const readline = require('readline');
const SerialPort = require('serialport');

const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/serial0', {
  baudRate: 115200,
});

const parser = port.pipe(new Readline('\n'));


port.on('error', err => {
  console.log('Error: ', err.message);
});

port.on('open', () => {
  console.log('port open');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.prompt();
  rl.on('line', (cmd) => {
    port.write(cmd + '\n');
    rl.prompt();
  });
});

parser.on('data', console.log);


