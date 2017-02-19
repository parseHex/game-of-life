const React = require('react');
const ReactDOM = require('react-dom');

const TimeControls = require('./components/TimeControls.jsx');
const Board = require('./components/Board.jsx');

const App = React.createClass({
  getInitialState: function() {
    return {
      boardSize: [50, 25],
      boardRules: {
        numsToSpawn: [3],
        numsToSurvive: [2, 3],
        numsToDie: [0, 1, 4, 5, 6, 7, 8]
      },
      paused: true,
      speed: 500
    };
  },
  pausePlay: function() {
    this.setState({paused: !this.state.paused});
  },
  render: function() {
    return (
      <div>
        <TimeControls pausePlay={this.pausePlay}
                      paused={this.state.paused}
        />
        <Board boardSize={this.state.boardSize}
               boardRules={this.state.boardRules}
               speed={this.state.speed}
               paused={this.state.paused}
        />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('app'));
