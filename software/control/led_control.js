const makePwmDriver = require('adafruit-i2c-pwm-driver');
const pwmDriver = makePwmDriver({address: 0x40, device: '/dev/i2c-1'});
//ic has only one clock which has to stay at servo frequency of 50hz (so no smooth fades probably)
//pwmDriver.setPWMFreq(50);

const ledOn = 4095; // Max pulse length out of 4096
const ledOff = 0; // Min pulse length out of 4096

const LED = function(_channel) {
  this.channel = _channel;
  this.state = 'OFF';

  const toggle = () => {
    if (this.state === 'ON') {
      this.off();
    } else {
      this.on();
    }
  }
  
  this.on = function() {
    pwmDriver.setPWM(this.channel, 0, ledOn);
    this.state = 'ON';
  }
  this.off = function() {
    pwmDriver.setPWM(this.channel, 0, ledOff);
    this.state = 'OFF';
  }
  this.flash = function(hz) {
    this.flashing = true;
    let timer = setInterval( () => {
      toggle();
    }, (1 / hz) * 1000);
  }
  this.stopFlash = function() {
    try {
      clearInterval(timer);
    }
    catch(e) {
      //whatever
    }
  }
}

module.exports.LED = LED;
