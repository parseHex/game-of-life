const React = require('react');

const Cell = require('./Cell.jsx');

var clicking = false;

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

const Board = React.createClass({
  propTypes: {
    boardSize: React.PropTypes.array,
    boardRules: React.PropTypes.object,
    time: React.PropTypes.number,
    paused: React.PropTypes.bool
  },
  getInitialState: function() {
    let rowSize = this.props.boardSize[0];
    let columnSize = this.props.boardSize[1];

    let numCells = rowSize * columnSize;
    let state = {};

    for (let i = 1; i <= numCells; i++) {
      let cellState = {
        alive: false,
        neighbors: []
      };

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

      cellState.neighbors.push(topLeft);
      cellState.neighbors.push(topMiddle);
      cellState.neighbors.push(topRight);
      cellState.neighbors.push(left);
      cellState.neighbors.push(right);
      cellState.neighbors.push(bottomLeft);
      cellState.neighbors.push(bottomMiddle);
      cellState.neighbors.push(bottomRight);

      state[i] = (cellState);
    }
    this.setupTimer();

    state.clicking = false;
    state.clickAdding = false;

    return state;
  },
  setupTimer: function() {
    var timeCount = 0;
    var thisRef = this;
    var start = new Date().getTime()
    setInterval(function() {
      let time = new Date().getTime() - start;
      timeCount += time;

      if (thisRef.props.paused || timeCount < thisRef.props.speed) return;
      timeCount = 0; // will run this time, reset back to zero

      thisRef.processCells();
    }, 100);
  },
  handleMouseDown: function(event) {
    if ((event.button !== 0 && event.button !== 2) || this.state.clicking) return;

    event.preventDefault();

    this.setState({
      clicking: true,
      clickAdding: event.button === 0
    });
  },
  handleMouseUp: function(event) {
    if ((event.button !== 0 && event.button !== 2) || !this.state.clicking) return;

    event.preventDefault();

    this.setState({
      clicking: false,
      clickAdding: false
    });
  },
  handleHover: function(event) {
    let cellId = event.target.id.substr(4);

    if (!this.state.clicking) return;

    let cell = this.state[cellId];

    cell.alive = this.state.clickAdding;

    let newState = {};
    newState[cellId] = cell;

    this.setState(newState);
  },
  handleClick: function(event) {
    let cellId = event.target.id.substr(4);
    let cell = this.state[cellId];

    cell.alive = !cell.alive;

    let newState = {};
    newState[cellId] = cell;

    this.setState(newState);
  },
  handleContextMenu: function(event) {
    event.preventDefault();

    let cellId = event.target.id.substr(4);
    let cell = this.state[cellId];

    if (!cell.alive) return;

    cell.alive = false;

    let newState = {};
    newState[cellId] = cell;

    this.setState(newState);
  },
  spawnCells: function(cellIds) {
    var cells = this.state;

    cellIds.forEach(function(cellId) {
      cells[cellId].alive = true;
    });

    this.setState(cells);
  },
  killCells: function(cellIds) {
    var cells = this.state;

    cellIds.forEach(function(cellId) {
      cells[cellId].alive = false;
    });

    this.setState(cells);
  },
  processCells: function() {
    let boardRules = this.props.boardRules;
    let cells = this.state;

    delete cells.clicking;
    delete cells.clickAdding;

    var cellsToKill = [];
    var cellsToSpawn = [];
    for (let cellId = 1; cellId <= Object.keys(cells).length; cellId++) {
      var cell = cells[cellId];
      let neighbors = cell.neighbors;
      var neighborsAlive = 0;
      for (let j = 0; j < neighbors.length; j++) {
        let neighborId = neighbors[j];
        let neighbor = cells[neighborId];
        if (neighbor.alive) neighborsAlive++;
      }

      if (boardRules.numsToDie.includes(neighborsAlive)) {
        cellsToKill.push(cellId);
      }
      if (boardRules.numsToSurvive.includes(neighborsAlive)) {
        // do nothing. good job on surviving!
      }
      if (boardRules.numsToSpawn.includes(neighborsAlive)) {
        cellsToSpawn.push(cellId);
      }
    }
    this.killCells(cellsToKill);
    this.spawnCells(cellsToSpawn);
  },
  render: function() {
    let rowSize = this.props.boardSize[0];
    let columnSize = this.props.boardSize[1];

    // loop through the columnSize to generate each row
    var rows = [];
    var cellId = 1;
    for (let i = 1; i <= columnSize; i++) {
      // create the cells for this row
      var cells = [];
      for (let j = 1; j <= rowSize; j++, cellId++) {
        cells.push(
          <Cell key={cellId}
                alive={this.state[cellId].alive}
                id={'cell' + cellId}
                onClick={this.handleClick}
                onHover={this.handleHover}
          />
        );
      }

      // create surrounding row div
      let row = (
        <div className='cellRow' key={i}>
          {cells}
        </div>
      );
      rows.push(row);
    }

    return (
      <div onMouseDown={this.handleMouseDown}
           onMouseUp={this.handleMouseUp}
           onContextMenu={this.handleContextMenu}
      >
        {rows}
      </div>
    );
  }
});

module.exports = Board;
