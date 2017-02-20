const React = require('react');
const ReactDOM = require('react-dom');

const TimeControls = require('./components/TimeControls.jsx');
const Board = require('./components/Board.jsx');
const GameControls = require('./components/GameControls.jsx');

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
      speed: 200,
      speedSteps: [500, 200, 50]
    };
  },
  pausePlay: function() {
    this.setState(
      {paused: !this.state.paused},
      function() {
        if (!this.state.paused) {
          this._board.startTimer();
        } else {
          this._board.stopTimer();
        }
      }
    );
  },
  nextTick: function() {
    this._board.stopTimer();
    console.time('testing setState')
    this.setState({paused: true}, function() {
      console.timeEnd('testing setState');
      this._board.processCells();
    });
  },
  increaseSpeed: function() {
    let speedIndex = this.state.speedSteps.indexOf(this.state.speed);
    if (typeof this.state.speedSteps[speedIndex + 1] === 'undefined') return;

    this.setState({speed: this.state.speedSteps[speedIndex + 1]});
  },
  decreaseSpeed: function() {
    let speedIndex = this.state.speedSteps.indexOf(this.state.speed);
    if (typeof this.state.speedSteps[speedIndex - 1] === 'undefined') return;

    this.setState({speed: this.state.speedSteps[speedIndex - 1]});
  },
  clearBoard: function() {
    this._board.stopTimer();
    this.setState({paused: true});

    this._board.clear();
  },
  render: function() {
    return (
      <div>
        <TimeControls pausePlay={this.pausePlay}
                      paused={this.state.paused}
                      speed={this.state.speed}
                      speedSteps={this.state.speedSteps}
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
      <GameControls clearBoard={this.clearBoard}
                      paused={this.state.paused}
        />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('app'));
