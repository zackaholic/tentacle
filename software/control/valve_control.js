const makePwmDriver = require('adafruit-i2c-pwm-driver');
const pwmDriver = makePwmDriver({address: 0x40, device: '/dev/i2c-1'});

pwmDriver.setPWMFreq(50);

// Configure min and max servo pulse lengths
const servo_min = 150 // Min pulse length out of 4096
const servo_max = 600 // Max pulse length out of 4096

const setPosition = (channel, pulseDuration, setFunction) => {
  setFunction(channel, 0,  pulseDuration);
}

const savePosition = (pulse) => {
  return (channel) => {
    setPosition.call(null, channel, pulse, pwmDriver.setPWM);
  }
}

module.exports.close = savePosition(400);
module.exports.open = savePosition(500);
