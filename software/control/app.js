const menu = require('./recipes.js');
const dispense = require('./dispense.js');
const input = require('./interface.js');
const mover = require('./mover.js');
const logger = require('tracer').console();

const dispenserP = (dispenseFunc, moveFunc) => {
  return (recipe) => {
    return () => {
      logger.log(`moving to dispense ${recipe}`);
      moveFunc()
      .then(() => {
        logger.log('beginning pour');
        return dispenseFunc(recipe);
      })
      .then(() => {
        logger.log('dispense complete, attract call');
        mover.attract();
      })
      .catch((err) => {
        logger.log(err);
      });
    }
  }
}

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

const dispenseDrink = dispenserP(dispense.dispenseSequentialP, mover.dispenseP);

input.assign([
  dispenseDrink(menu.recipe(menu.list()[0])),
  dispenseDrink(menu.recipe(menu.list()[1])),
  dispenseDrink(menu.recipe(menu.list()[2])),
  dispenseDrink(menu.recipe(menu.list()[3]))
]);

const start = () => {
  mover.setSpeed(10000);
  mover.attract();
  setTimeout(() => {
    dispenseDrink(menu.recipe(menu.list()[2]))();
}, 1000);

}
mover.on('ready', start);


