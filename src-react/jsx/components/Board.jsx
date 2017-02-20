const React = require('react');

const starterCells = require('../starterCells.js');

const Cell = require('./Cell.jsx');

let animationFrame;
let numCells;

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

    numCells = rowSize * columnSize;
    let state = {};

    for (let i = 1; i <= numCells; i++) {
      let cellState = {
        alive: false,
        neighbors: []
      };
      if (starterCells.includes(i)) cellState.alive = true;

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

    state.clicking = false;
    state.clickAdding = false;

    return state;
  },
  clear: function() {
    let cells = this.state;
    delete cells.clicking;
    delete cells.clickAdding;

    this.killCells(Object.keys(cells));
  },
  startTimer: function() {
    var timeCount = 0;
    var thisRef = this;
    var lastRun = new Date().getTime();
    function animationFrameFunction() {
      let thisRun = new Date().getTime();
      let time = thisRun - lastRun;
      timeCount += time;
      lastRun = thisRun;

      if (timeCount >= thisRef.props.speed) {
        // console.log(timeCount);
        timeCount = 0; // will run this time, reset count back to zero

        thisRef.processCells();
      }
      animationFrame = requestAnimationFrame(animationFrameFunction);
    }
    animationFrame = requestAnimationFrame(animationFrameFunction);
  },
  stopTimer: function() {
    if (animationFrame === null) return;

    cancelAnimationFrame(animationFrame);

    animationFrame = null;
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
    // console.time('spawning cells')
    var cells = this.state;
    let cellsToChange = {};

    cellIds.forEach(function(cellId) {
      cellsToChange[ cellId ] = cells[ cellId ];
      cellsToChange[ cellId ].alive = true;
    });

    this.setState(cellsToChange, function() {
      // console.timeEnd('spawning cells')
    });
  },
  killCells: function(cellIds) {
    // console.time('killing cells')
    let cells = this.state;
    let cellsToChange = {};

    cellIds.forEach(function(cellId) {
      cellsToChange[ cellId ] = cells[ cellId ];
      cellsToChange[ cellId ].alive = false;
    });

    this.setState(cellsToChange, function() {
      // console.timeEnd('killing cells')
    });
  },
  processCells: function() {
    const boardRules = this.props.boardRules;
    let cells = this.state;

    let cellsToKill = [];
    let cellsToSpawn = [];
    for (var cellId = 1; cellId <= numCells; cellId++) {
      if (typeof cells[cellId] !== 'object') continue;
      let cell = cells[cellId];
      const neighbors = cell.neighbors;
      let neighborsAlive = 0;
      for (var j = 0; j < neighbors.length; j++) {
        let neighbor = cells[ neighbors[j] ];
        if (neighbor.alive) neighborsAlive++;
      }

      if (cell.alive && boardRules.numsToDie.includes(neighborsAlive)) {
        cellsToKill.push(cellId);
      }
      if (!cell.alive && boardRules.numsToSpawn.includes(neighborsAlive)) {
        cellsToSpawn.push(cellId);
      }
    }
    this.killCells(cellsToKill);
    this.spawnCells(cellsToSpawn);
  },
  render: function() {
    // console.time('rendering')
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
  },
  componentDidMount: function() {
    // console.timeEnd('rendering')
  },
  componentDidUpdate: function() {
    // console.timeEnd('rendering')
  }
});

module.exports = Board;
