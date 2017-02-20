const React = require('react');

const GameControls = React.createClass({
  propTypes: {
    clearBoard: React.PropTypes.func
  },
  render: function() {
    return (
      <div className='form-inline'>
        <div className='gameControlGroup'>
          <button onClick={this.props.clearBoard} className='btn btn-default'>
            Clear
          </button>
        </div>
      </div>
    )
  }
});

module.exports = GameControls;
