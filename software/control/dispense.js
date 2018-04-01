const valves = require('./valve_control.js');
const menu = require('./recipes.js');

const scheduleValveOff = (valve, time) => {
  setTimeout(() => {valves.close(valve)},time);
}

const dispenceSequential = () => {
}

const dispenseSimultaneous = (recipe) => {
   recipe.forEach((time, i) => {
    if (time > 0) {
      valves.open(i);
      scheduleValveOff(i, time)
    }
  });
}
if (process.argv[2]) {
  if (menu.list().includes(process.argv[2])) {
    dispenseSimultaneous(menu.recipe(process.argv[2]));
  } else {
    console.log(`No recipe for ${process.argv[2]}`);
    console.log(`Options are: ${JSON.stringify(menu.list())}`);
  }
}
