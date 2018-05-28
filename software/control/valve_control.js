const makePwmDriver = require('adafruit-i2c-pwm-driver');
const pwmDriver = makePwmDriver({address: 0x40, device: '/dev/i2c-1'});

pwmDriver.setPWMFreq(50);

// Configure min and max servo pulse lengths
const servo_min = 150 // Min pulse length out of 4096
const servo_max = 550 // Max pulse length out of 4096

const setPosition = (channel, pulseDuration, setFunction) => {
  setFunction(channel, 0,  pulseDuration);
}

const writePosition = (pulse) => {
  return (channel) => {
    setPosition.call(null, channel, pulse, pwmDriver.setPWM);
  }
}
module.exports.close = writePosition(500);
module.exports.open = writePosition(200);

