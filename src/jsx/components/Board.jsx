const React = require('react');

const Cell = require('./Cell.jsx');

function overflow(number, min, max) {
  if (number >= 0 && number <= max) return number;

  if (number < 0) return number + max;
  if (number > max) return number - max;
}

const Board = React.createClass({
  propTypes: {
    boardSize: React.PropTypes.array,
    boardRules: React.PropTypes.object
  },
  getInitialState: function() {
    let rowSize = this.props.boardSize[0];
    let columnSize = this.props.boardSize[1];

    let numCells = this.props.boardSize[0] * this.props.boardSize[1];
    let cellStates = [];

    for (let i = 1; i <= numCells; i++) {
      let cellState = {
        alive: false,
        neighbors: []
      };

      function addNeighbor(cellId) {
        cellState.neighbors.push(overflow(cellId, rowSize, columnSize));
      }

      addNeighbor(i - (rowSize + 1)); // top-left neighbor
      addNeighbor(i - rowSize); // top-middle neighbor
      addNeighbor(i - (rowSize - 1)); // top-right neighbor

      addNeighbor(i - 1); // left neighbor
      addNeighbor(i + 1); // right neighbor

      addNeighbor(i + (rowSize - 1)); // bottom-left neighbor
      addNeighbor(i + rowSize); // bottom-middle neighbor
      addNeighbor(i + (rowSize + 1)); // bottom-right neighbor

      cellStates.push(cellState);
    }

    return {
      cells: cellStates
    };
  },
  handleClick: function(event) {
    let cellId = event.target.id.substr(4);
    let cells = this.state.cells;

    cells[cellId - 1].alive = !cells[cellId - 1].alive;

    this.setState({cells: cells});
  },
  shouldCellDie: function(cellId) {
    //
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
                alive={this.state.cells[cellId - 1].alive}
                id={'cell' + cellId}
                onClick={this.handleClick}
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
      <div>
        {rows}
      </div>
    );
  }
});

module.exports = Board;
