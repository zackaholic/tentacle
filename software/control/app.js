const menu = require('./recipes.js');
const dispense = require('./dispense.js');
const mover = require('./mover.js');
const logger = require('tracer').console();
const LED = require('./led_control.js');
const Gpio = require('onoff').Gpio;
const valves = require('./valve_control');

const buttons = [
 new Gpio(17, 'in', 'falling', {debounceTimeout: 10}),
 new Gpio(27, 'in', 'falling', {debounceTimeout: 10}),
 new Gpio(22, 'in', 'falling', {debounceTimeout: 10}),
 new Gpio(10, 'in', 'falling', {debounceTimeout: 10})
];

const cupSensor = new Gpio(11, 'in', 'falling', {debounceTimeout: 20});

const cupPresent = ((sensor) => {
  return () => {
    return new Promise((resolve, reject) => {
      sensor.read((err, val) => {
        if (err) {
          reject(err);
        }
        if (val === 0) {
          resolve(0);
        } else {
          reject('cup not detected');
        };
      });
    });
  }
})(cupSensor);

const LEDs = [
 new LED(4),
 new LED(5),
 new LED(6),
 new LED(7),
];

const LEDsOn = (leds) => {
  leds.forEach((e) => {
    e.on();
  });
}

const LEDsOff = (leds) => {
  leds.forEach((e) => {
    e.stopFlash();
    e.off();
  });
}

process.on('SIGINT', () => {
  buttons[0].unexport();
  buttons[1].unexport();
  buttons[2].unexport();
  buttons[3].unexport();

  cupSensor.unexport();
  //open pinch valves on power down to preserve tubing
  valves.open(0);
  valves.open(1);
  valves.open(2);
  valves.open(3);

  LEDsOff(LEDs);

  console.log('\nbuttons detached, LEDs off');
});

const dispenser = (dispenseFunc, moveFunc, senseFunc) => {
  return (recipe, indicator) => {
    return (err) => {
      if (err) {
        return console.log(err);
      }
      unwatchButtons();
      cupPresent()
      .then(() => {
        logger.log(`moving to dispense ${recipe}`);
        indicator.flash(2);
        return moveFunc();
      })
      .then(() => {
        logger.log('beginning pour');
        return dispenseFunc(menu.recipe(recipe));
      })
      .then(() => {
        logger.log('dispense complete, attract call');
        indicator.stopFlash();
        indicator.on();
        mover.attract();
        watchButtons();
      })
      .catch((err) => {
        //something went wrong, reset to attract mode
        logger.log(err);
        indicator.stopFlash();
        indicator.on();
        mover.attract();
        watchButtons();
      });
    }
  }
}

const dispenseDrink = dispenser(dispense.dispenseSequential, mover.dispense)



const watchButtons = ((buttons, dispenseFn, menu, LEDs) => {
  return () => {
    buttons.forEach((butt, i) => {
      butt.watch(dispenseFn(menu[i], LEDs[i]));
    });
  }
})(buttons, dispenseDrink, menu.list(), LEDs);

const unwatchButtons  = ((buttons) => {
  return () => {
    buttons.forEach((e) => {
      e.unwatchAll();
    });
  };
})(buttons);

const start = () => {
  LEDsOn(LEDs);
  watchButtons();
  mover.setSpeed(10000);
  mover.attract();
}
mover.on('ready', start);


