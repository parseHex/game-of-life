const starterCells = require('./starterCells.js');

module.exports = function(size) {
  let rowSize = size[0];
  let columnSize = size[1];

  let numberOfCells = rowSize * columnSize;
  let cells = [];

  for (let i = 1; i <= numberOfCells; i++) {
    let cell = {
      alive: false,
      neighbors: []
    };
    if (starterCells.includes(i)) cell.alive = true;

    let topMiddle = overflow(i - rowSize, 1, numCells, numCells);

    let topMaxSize = rowMax(topMiddle, rowSize);
    let topMinSize = topMaxSize - (rowSize - 1);

    let topLeft = overflow(topMiddle - 1, topMinSize, topMaxSize, rowSize);
    let topRight = overflow(topMiddle + 1, topMinSize, topMaxSize, rowSize);

    let thisMaxSize = rowMax(i, rowSize);
    let thisMinSize = thisMaxSize - (rowSize - 1);

    let left = overflow(i - 1, thisMinSize, thisMaxSize, rowSize);
    let right = overflow(i + 1, thisMinSize, thisMaxSize, rowSize);

    let bottomMiddle = overflow(i + rowSize, 1, numCells, numCells);

    let bottomMaxSize = rowMax(bottomMiddle, rowSize);
    let bottomMinSize = bottomMaxSize - (rowSize - 1);

    let bottomLeft = overflow(bottomMiddle - 1, bottomMinSize, bottomMaxSize, rowSize);
    let bottomRight = overflow(bottomMiddle + 1, bottomMinSize, bottomMaxSize, rowSize);

    cell.neighbors.push(topLeft);
    cell.neighbors.push(topMiddle);
    cell.neighbors.push(topRight);
    cell.neighbors.push(left);
    cell.neighbors.push(right);
    cell.neighbors.push(bottomLeft);
    cell.neighbors.push(bottomMiddle);
    cell.neighbors.push(bottomRight);

    cells.push(cell);
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
