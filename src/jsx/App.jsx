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
      speed: 200
    };
  },
  pausePlay: function() {
    this.setState({paused: !this.state.paused});
  },
  nextTick: function() {
    this.setState({paused: true});

    this._board.processCells();
  },
  increaseSpeed: function() {
    if (this.state.speed + 100 > 5000) return;

    this.setState({speed: this.state.speed + 100});
  },
  decreaseSpeed: function() {
    if (this.state.speed - 100 < 100) return;

    this.setState({speed: this.state.speed - 100});
  },
  render: function() {
    return (
      <div>
        <TimeControls pausePlay={this.pausePlay}
                      paused={this.state.paused}
                      speed={this.state.speed}
                      nextTick={this.nextTick}
                      increaseSpeed={this.increaseSpeed}
                      decreaseSpeed={this.decreaseSpeed}
        />
        <Board boardSize={this.state.boardSize}
               boardRules={this.state.boardRules}
               speed={this.state.speed}
               paused={this.state.paused}
               ref={(child) => { this._board = child; }}
        />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('app'));
