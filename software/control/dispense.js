const valves = require('./valve_control.js');
//const menu = require('./recipes.js');

const scheduleValve =  (delay, cb, num) => {
  setTimeout(cb.bind(null, num), delay);
}

const dispenseSequential = (recipe) => {
   let delay = 0;
   recipe.forEach((time, i) => {
     scheduleValve(delay, valves.open, i);
     delay += time;
     scheduleValve(delay, valves.close, i);
  });
}

const dispenseSimultaneous = (recipe) => {
   recipe.forEach((time, i) => {
    if (time > 0) {
      valves.open(i);
      scheduleValve(time, valves.close, i);
    }
  });
}
/*
if (process.argv[2]) {
  if (menu.list().includes(process.argv[2])) {
    dispenseSimultaneous(menu.recipe(process.argv[2]));
  } else {
    console.log(`No recipe for ${process.argv[2]}`);
    console.log(`Options are: ${JSON.stringify(menu.list())}`);
  }
}
*/
module.exports.dispenseSimultaneous = dispenseSimultaneous;
module.exports.dispenseSequential = dispenseSequential;


