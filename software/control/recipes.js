//ingreds:  whiskey soda  tequila juice

const menu = {

  "whiskey-soda": [2000, 0, 4000, 0],
  "tequila-soda": [3000, 3000, 0, 0],
  "suicide":      [1000, 1000, 1000, 1000],
  "kid-special":  [4000, 0, 0, 2000]
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
