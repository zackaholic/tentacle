const menu = require('./recipes.js');
const dispense = require('./dispense.js');
const input = require('./interface.js');
const move = require('./mover.js');

const dispenser = (dispense, move, drink) => {
    return () => {
      console.log('dispensing ', drink);
      move();
      //somehow handle the move delay here
      dispense(drink);
  }
}

const dispenseDrink = dispenser.bind(null, dispense.dispenseSimultaneous, move.moveDispense);

input.assign([
  dispenseDrink(menu.recipe(menu.list()[0])),
  dispenseDrink(menu.recipe(menu.list()[1])),
  dispenseDrink(menu.recipe(menu.list()[2])),
  dispenseDrink(menu.recipe(menu.list()[3]))
]);

move.moveRandom();
