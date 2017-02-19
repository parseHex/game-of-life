const React = require('react');
const ReactDOM = require('react-dom');

const Board = require('./components/Board.jsx');

const App = React.createClass({
  getInitialState: function() {
    return {
      boardSize: [50, 25],
      boardRules: {
        numsToSpawn: [3],
        numsToSurvive: [2, 3],
        numsToDie: [0, 1, 4, 5, 6, 7, 8]
      }
    };
  },
  render: function() {
    return (
      <div>
        <Board boardSize={this.state.boardSize}
               boardRules={this.state.boardRules}
        />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('app'));
