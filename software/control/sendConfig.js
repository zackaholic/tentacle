const config = require('./config.js');
const SerialPort = require('serialport');

const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/serial0', {
  baudRate: 115200,
});

const parser = port.pipe(new Readline('\n'));

port.on('open', () => {
  let i = 0;
  parser.on('data', (res) => {
    console.log('got ', res);
    port.write(config[i++]);
  });
  port.write(config[i++]);
});

