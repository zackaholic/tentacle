//ingreds:  whiskey soda  tequila juice

const menu = {

  "whiskey-soda": [4000, 6000, 0, 0],
  "tequila-soda": [0, 6000, 4000, 0],
  "suicide":      [2500, 2500, 2500, 2500],
  "kid-special":  [0, 5000, 0, 5000]
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
