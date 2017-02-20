const util = require('./utility.js');

module.exports = function(cells) {
  console.time('animating tick');
  for (var i = 0; i < cells.length; i++) {
    let cell = cells[i];

    if (cell.lastAlive === cell.alive) continue;

    util.id('c' + i).className = cell.alive ? 'cell alive' : 'cell';
  }
  console.timeEnd('animating tick');
};
