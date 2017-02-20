const util = require('./utility.js');
const boardElement = util.id('board');

module.exports = function(cells, boardSize, handleClick, handleMouseEnter, handleMouseUp, handleMouseDown) {
  console.time('drawing cells')
  let rowSize = boardSize[0];
  let columnSize = boardSize[1];

  var cellId = 1;
  let boardFragment = document.createDocumentFragment();

  // loop through the columnSize to generate each row
  for (let i = 0; i < columnSize; i++) {
    // create the cells for this row

    let row = document.createElement('div');
    row.className = 'cellRow';

    for (let j = 0; j < rowSize; j++, cellId++) {
      let cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = 'c' + cellId;
      cell.addEventListener('click', handleClick);
      cell.addEventListener('contextmenu', handleClick);
      cell.addEventListener('mouseenter', handleMouseEnter);

      row.appendChild(cell);
    }
    boardFragment.appendChild(row);
  }

  boardElement.appendChild(boardFragment);
  console.timeEnd('drawing cells')
};
