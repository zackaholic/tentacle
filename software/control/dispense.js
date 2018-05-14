const valves = require('./valve_control.js');
const EventEmitter = require('events');
const logger = require('tracer').console();

class Emitter extends EventEmitter {};

const dispenser = new Emitter();

const scheduleValve =  (delay, cb, num) => {
  setTimeout(cb.bind(null, num), delay);
}

dispenser.dispenseSequentialP = (recipe) => {
  return new Promise((resolve, reject) => {
    let delay = 0;
    recipe.forEach((time, i) => {
      scheduleValve(delay, valves.open, i);
      delay += time;
      scheduleValve(delay, valves.close, i);
    });
    setTimeout(() => {
      //open loop here- assuming that valves have opened/closed as instructed
      resolve(); 
    }, recipe.reduce((acc, val) => {return acc + val}) + 1000);
  });
}

dispenser.dispenseSimultaneousP = (recipe) => {
  return new Promise((resolve, reject) => {
    let longest = 0;
     recipe.forEach((time, i) => {
      if (time > 0) {
        longest = Math.max(time, longest);
        valves.open(i);
        scheduleValve(time, valves.close, i);
      }
      setTimeout(() => {
        resolve();
        //dispenser.emit('dispense-complete');
      }, longest + 1000);
    });
  });
}


module.exports = dispenser;


