const Gpio = require('onoff').Gpio;
const dispense = require('./dispense.js');

buttons = [
  (new Gpio(17, 'in', 'falling', {debounceTimeout: 10})),
  (new Gpio(27, 'in', 'falling', {debounceTimeout: 10})),
  (new Gpio(22, 'in', 'falling', {debounceTimeout: 10})),
  (new Gpio(10, 'in', 'falling', {debounceTimeout: 10}))
];

process.on('SIGINT', () => {
  buttons[0].unexport();
  buttons[1].unexport();
  buttons[2].unexport();
  buttons[3].unexport();
  console.log('buttons detached');
});

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
