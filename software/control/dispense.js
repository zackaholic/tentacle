const valves = require('./valve_control.js');
const EventEmitter = require('events');
const logger = require('tracer').console();

class Emitter extends EventEmitter {};

const dispenser = new Emitter();

const scheduleValve =  (delay, cb, num) => {
  setTimeout(cb.bind(null, num), delay);
}

dispenser.dispenseSequential = (recipe) => {
   let delay = 0;
   logger.log('dispense time: ', recipe.reduce((acc, val) => {return acc + val;}));
   recipe.forEach((time, i) => {
     scheduleValve(delay, valves.open, i);
     delay += time;
     scheduleValve(delay, valves.close, i);
  });
  setTimeout(() => {
    dispenser.emit('dispense-complete');
  }, recipe.reduce((acc, val) => {return acc + val}) + 1000);
}

dispenser.dispenseSimultaneous = (recipe) => {
  let longest = 0;
   recipe.forEach((time, i) => {
    if (time > 0) {
      longest = Math.max(time, longest);
      valves.open(i);
      scheduleValve(time, valves.close, i);
    }
    setTimeout(() => {
      dispenser.emit('dispense-complete');
    }, longest + 1000);
  });
}

module.exports = dispenser;


