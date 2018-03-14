const SerialPort = require('serialport');
const port = new SerialPort('/dev/tty.usbserial-FTELMX61', {
  baudRate: 115200
});

port.on('error', err => {
  console.log('Error: ', err.message);
});

port.on('open', () => {
  //startup sequence here? Homing etc??
  //Say hi to Grbl- get response to kick off command streaming
  port.write('\n');
});

port.on('data', data => {
  console.log('Got: ', data);
});

let commands = [
'F700',
'G17',
'G20',
'G2 X4 Y0 I2 J0',
'G2 X2.39699 Y-1.63153 I-1.63178 J0.00000',
'G2 X4.14750 Y-0.03347 I-0.03161 J1.79240',
'G2 X3.03836 Y-1.59492 I-1.95361 J0.21306',
'G2 X2.25909 Y0.33332 I-0.44766 J0.94067',
'G2 X2.37779 Y0.08836 I0.04368 J-0.13007',
'G2 X2.10812 Y0.45433 I-0.12448 J0.19061',
'G3 X0.93114 Y0.53975 I-0.54391 J0.65692',
'G2 X-0.39694 Y1.05816 I-1.18160 J-1.06669',
'G3 X-0.40355 Y1.57931 I-0.02406 J0.26031',
'G3 X-0.04218 Y1.52091 I-0.13084 J-1.95667',
'G2 X-0.03251 Y1.51868 I0.04495 J0.17335',
'G3 X-3.04978 Y-0.10379 I-0.52902 J-2.63299',
'G2 X-3.12930 Y-0.22160 I-0.31889 J0.12951',
'G2 X-3.24267 Y-0.31500 I-0.63958 J0.66086',
'G2 X-3.25114 Y-0.31910 I-0.01705 J0.02444',
'G2 X-3.83313 Y2.82297 I-0.46246 J1.53927',
'G2 X-2.98759 Y0.41997 I0.09812 J-1.31573',
'G3 X-3.29272 Y-0.24807 I0.40454 J-0.58848',
'G2 X-5.64034 Y0.70465 I-1.43230 J-0.16058',
'G3 X-5.82046 Y2.48362 I-0.68204 J0.82955',
'G2 X-7.04096 Y4.71656 I1.07810 J2.03931',
'G2 X-4.95518 Y4.23472 I1.07758 J-0.09077',
'G2 X-6.37859 Y3.78288 I-0.89343 J0.34655',
'G3 X-6.26446 Y1.06043 I-0.93109 J-1.40265',
'G3 X-6.97793 Y0.77189 I-0.84825 J1.07109',
'G2 X-7.27069 Y0.72811 I0.29439 J-2.96967',
'G2 X-7.46612 Y-0.36904 I0.11779 J-0.58696',
'G3 X-8.58461 Y-1.82053 I-0.48206 J-0.78522',
'G2 X-9.11332 Y-2.68604 I-0.35846 J-0.37527',
'G3 X-9.12248 Y-2.68322 I-0.04477 J-0.12893',
'G2 X-10.10637 Y-2.15510 I0.64277 J2.37806',
'G2 X-9.00675 Y-2.16243 I0.55404 J0.63008',
'G3 X-9.09445 Y-3.39592 I0.56494 J-0.66003',
'G2 X-10.74206 Y-6.74982 I-1.51952 J-1.33518',
'G2 X-10.95286 Y-5.53509 I0.04014 J0.63263',
'G2 X-10.66234 Y-5.47181 I0.30751 J-0.71333',
'G3 X-9.73683 Y-5.26277 I-0.05215 J2.38415',
'G3 X-10.05820 Y-4.34625 I-0.19981 J0.44454'
];

const grbl = {
  len: 128,
  queued: [],
  free: 128,
  add: function (cmd) {
    this.free -= cmd.length;
    this.queued.unshift(cmd);
  },
  use: function () {
    this.free += this.queued.pop().length;
  }
}

const send = (output) => {
  return (cmd) => {
    output(cmd);
  }
}

const sendGrbl = send(port.write);
const sendConsole = send(console.log);

const consumer = (buffer, send) => {
  return () => {
    send(buffer.pop());
    return buffer;
  }
}
//TODO: add grbl tracking here or wherever it makes sense
const consumeCommand = consumer(commands, sendConsole);

const fill = () => {
  if (commands.length && commands[commands.length -1].length < grbl.free) {
    commands = consumeCommand();
    fill();
  } else {
    return;
  }
}
fill();

const fillGrblBuffer = () => {
  
}

















