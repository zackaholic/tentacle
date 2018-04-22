const menu = require('./recipes.js');
const dispense = require('./dispense.js');
const input = require('./interface.js');
const mover = require('./mover.js');
const logger = require('tracer').console();

const dispenser = (dispenseFunc, moveFunc) => {
  return (recipe) => {
    return () => {
      logger.log('dispense call');
      moveFunc();
      mover.once('move-complete', () => {
        logger.log('move complete event, dispensing ', recipe);
        dispenseFunc(recipe);
      });
      dispense.once('dispense-complete', () => {
        logger.log('dispense complete event, attract call');
        mover.attract();
      });
    }
  }
}

const dispenseDrink = dispenser(dispense.dispenseSequential, mover.dispense);

input.assign([
  dispenseDrink(menu.recipe(menu.list()[0])),
  dispenseDrink(menu.recipe(menu.list()[1])),
  dispenseDrink(menu.recipe(menu.list()[2])),
  dispenseDrink(menu.recipe(menu.list()[3]))
]);

const start = () => {
  mover.setSpeed(100);
  mover.attract();
}

mover.on('ready', start);
