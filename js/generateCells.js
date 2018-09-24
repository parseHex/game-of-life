const starterCells = require('./starterCells.js');

module.exports = function(size) {
  let numberOfCells = size[0] * size[1];
  let cells = {};

  for (let i = 1; i <= numberOfCells; i++) {
    let cell = {
      alive: false,
      lastAlive: false,
      neighbors: []
    };
    if (starterCells.includes(i)) cell.alive = true;

    let topMiddle = overflow(i - size[0], 1, numberOfCells, numberOfCells);

    let topMaxSize = rowMax(topMiddle, size[0]);
    let topMinSize = topMaxSize - (size[0] - 1);

    let topLeft = overflow(topMiddle - 1, topMinSize, topMaxSize, size[0]);
    let topRight = overflow(topMiddle + 1, topMinSize, topMaxSize, size[0]);

    let thisMaxSize = rowMax(i, size[0]);
    let thisMinSize = thisMaxSize - (size[0] - 1);

    let left = overflow(i - 1, thisMinSize, thisMaxSize, size[0]);
    let right = overflow(i + 1, thisMinSize, thisMaxSize, size[0]);

    let bottomMiddle = overflow(i + size[0], 1, numberOfCells, numberOfCells);

    let bottomMaxSize = rowMax(bottomMiddle, size[0]);
    let bottomMinSize = bottomMaxSize - (size[0] - 1);

    let bottomLeft = overflow(bottomMiddle - 1, bottomMinSize, bottomMaxSize, size[0]);
    let bottomRight = overflow(bottomMiddle + 1, bottomMinSize, bottomMaxSize, size[0]);

    cell.neighbors.push(topLeft);
    cell.neighbors.push(topMiddle);
    cell.neighbors.push(topRight);
    cell.neighbors.push(left);
    cell.neighbors.push(right);
    cell.neighbors.push(bottomLeft);
    cell.neighbors.push(bottomMiddle);
    cell.neighbors.push(bottomRight);

    cells[i] = cell;
  }

  return cells;
};

function overflow(number, min, max, resolver) {
  if (number >= min && number <= max) return number;

  if (number < min) return number + resolver;
  if (number > max) return number - resolver;
}

function rowMax(cellId, rowSize) {
  if (cellId % rowSize === 0) {
    return cellId;
  } else {
    for (let i = cellId + 1; i < cellId + rowSize + 1; i++) {
      if (i % rowSize === 0) return i;
    }
  }
}
