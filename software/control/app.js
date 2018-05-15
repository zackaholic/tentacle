const menu = require('./recipes.js');
const dispense = require('./dispense.js');
const mover = require('./mover.js');
const logger = require('tracer').console();
const LED = require('./led_control.js');
const Gpio = require('onoff').Gpio;

const buttons = [
 new Gpio(17, 'in', 'falling', {debounceTimeout: 10}),
 new Gpio(27, 'in', 'falling', {debounceTimeout: 10}),
 new Gpio(22, 'in', 'falling', {debounceTimeout: 10}),
 new Gpio(10, 'in', 'falling', {debounceTimeout: 10})
];

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
  
  LEDsOff(LEDs);

  console.log('\nbuttons detached, LEDs off');
});

const dispenser = (dispenseFunc, moveFunc) => {
  return (recipe, indicator) => {
    return (err) => {
      if (err) {
        return console.log(err);
      }
      logger.log(`moving to dispense ${recipe}`);
      indicator.flash(2);
      unwatchButtons();
      moveFunc()
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
        logger.log(err);
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


