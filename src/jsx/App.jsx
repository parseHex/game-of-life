const React = require('react');
const ReactDOM = require('react-dom');

const Board = require('./components/Board.jsx');

const App = React.createClass({
  getInitialState: function() {
    return {
      boardSize: [50, 25]
    };
  },
  render: function() {
    return (
      <div>
        <Board boardSize={this.state.boardSize} />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('app'));
