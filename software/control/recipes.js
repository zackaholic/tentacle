//ingreds:  whiskey soda  tequila juice
// 4000ms pour at between 5 and 7.5psi equals 1oz plus a tiny bit
const menu = {

  "button4": [0, 0, 0, 0],
  "button3": [0, 0, 0, 0],
  "button2": [0, 16000, 0, 0],
  "button1": [4000, 16000, 0, 0]
}

module.exports.list = function() {
  let list = [];
  for (name in menu) {
    list.push(name);
  }
  return list;
}

module.exports.recipe = function(name) {
  if (menu[name]) {
    return menu[name];
  } else {
    throw `No recipe for ${name}`;
  }
}
