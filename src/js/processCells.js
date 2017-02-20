module.exports = function(cells, rules, killCells, populateCells) {
  console.time('processing cells');
  let cellsToKill = [];
  let cellsToPopulate = [];
  for (var cellId = 0; cellId < cells.length; cellId++) {
    if (typeof cells[ cellId ] !== 'object') continue;

    let cell = cells[ cellId ];

    const neighbors = cell.neighbors;
    let neighborsAlive = 0;

    for (var j = 0; j < neighbors.length; j++) {
      let neighbor = cells[ neighbors[ j ] - 1 ];
      if (neighbor.alive) neighborsAlive++;
    }

    if (cell.alive && rules.numsToDie.includes(neighborsAlive)) {
      cellsToKill.push(cellId);
    }
    if (!cell.alive && rules.numsToPopulate.includes(neighborsAlive)) {
      cellsToPopulate.push(cellId);
    }
  }
  console.timeEnd('processing cells');
  killCells(cellsToKill, true);
  populateCells(cellsToPopulate);
};
