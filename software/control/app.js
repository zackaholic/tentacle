const menu = require('./recipes.js');
const dispense = require('./dispense.js');
const input = require('./interface.js');
const mover = require('./mover.js');
const logger = require('tracer').console();
const LED = require('./led_control.js');

const led1 = new LED(4);
const led2 = new LED(5);
const led3 = new LED(6);
const led4 = new LED(7);
led1.on();
led2.on();
led3.on();
led4.on();

process.on('SIGINT', () => {
  led1.stopFlash();
  led2.stopFlash();
  led3.stopFlash();
  led4.stopFlash();
  led1.off();
  led2.off();
  led3.off();
  led4.off();
  console.log('LEDs off');
});


const dispenser = (dispenseFunc, moveFunc) => {
  return (recipe, indicator) => {
    return () => {
      logger.log(`moving to dispense ${recipe}`);
      indicator.flash(2);
      moveFunc()
      .then(() => {
        logger.log('beginning pour');
        return dispenseFunc(recipe);
      })
      .then(() => {
        logger.log('dispense complete, attract call');
        indicator.stopFlash();
        indicator.on();
//        mover.attract();
      })
      .catch((err) => {
        logger.log(err);
      });
    }
  }
}

const dispenseDrink = dispenser(dispense.dispenseSequentialP, mover.dispenseP);

input.assign([
  dispenseDrink(menu.recipe(menu.list()[0]), led1),
  dispenseDrink(menu.recipe(menu.list()[1]), led2),
  dispenseDrink(menu.recipe(menu.list()[2]), led3),
  dispenseDrink(menu.recipe(menu.list()[3]), led4)
]);

const start = () => {
  mover.setSpeed(10000);
//  mover.attract();
}
mover.on('ready', start);


