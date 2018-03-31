const makePwmDriver = require('adafruit-i2c-pwm-driver');
const pwmDriver = makePwmDriver({address: 0x40, device: '/dev/i2c-1'});

pwmDriver.setPWMFreq(50);

// Configure min and max servo pulse lengths
const servo_min = 150 // Min pulse length out of 4096
const servo_max = 600 // Max pulse length out of 4096

const setPosition = (pulse, setFunction) => {
	return (channel) => {
		setFunction(channel, 0, pulse);
	}
}

setToggle = (openFun, closeFun) => {
//to be usefull this has to actually get servo position from the controller
	let servoState = 1;
	return (channel) => {
		if (servoState > 0) {
			closeFun(channel);
		} else {
			openFun(channel);
		}
		servoState *= -1;
	}
};

const open = setPosition(500, pwmDriver.setPWM);
const close = setPosition(400, pwmDriver.setPWM);
const toggle = setToggle(open, close);

if (process.argv[2]){
  if (process.argv[2] === 'open') {
    console.log('opening');
    open(0);
  } 
  if (process.argv[2] === 'close') {
    console.log('closing');
    close(0);
  }
} 

//setInterval(function() {
//	toggle(0);
//}, 1000);
