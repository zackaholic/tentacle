const Gpio = require('onoff').Gpio;
const dispense = require('./dispense.js');

buttons = [
  (new Gpio(17, 'in', 'falling', {debounceTimeout: 20})),
  (new Gpio(27, 'in', 'falling', {debounceTimeout: 20})),
  (new Gpio(22, 'in', 'falling', {debounceTimeout: 20})),
  (new Gpio(10, 'in', 'falling', {debounceTimeout: 20}))
];

process.on('SIGINT', () => {
  buttons[0].unexport();
  buttons[1].unexport();
  buttons[2].unexport();
  buttons[3].unexport();
  console.log('buttons detached');
});

const buttonCallbacks = {
  cb1: undefined,
  cb2: undefined,
  cb3: undefined,
  cb4: undefined
};

//TODO: move listener assignments to named functions, remove listener as first
//act of listener, reinstate when dispensing is done.
//So, move all the button stuff to main app?
/*
module.exports.assign = (buttonMap) => {
  for (let i = 0; i < 4; i++) {
    buttons[i].watch((err, val) => {
      if (err) {
        throw err;
      }
      buttonMap[i]();
    });
  }
}
*/
