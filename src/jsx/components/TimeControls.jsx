const React = require('react');

const TimeControls = React.createClass({
  propTypes: {
    pausePlay: React.PropTypes.func,
    nextTick: React.PropTypes.func,
    decreaseSpeed: React.PropTypes.func,
    increaseSpeed: React.PropTypes.func,
    paused: React.PropTypes.bool,
    speed: React.PropTypes.number
  },
  render: function() {
    return (
      <div className='form-inline'>
        <div className='gameControlGroup'>
          <button onClick={this.props.pausePlay} className='btn btn-default'>
            {this.props.paused ? 'Play' : 'Pause'}
          </button>
          <button onClick={this.props.nextTick} className='btn btn-default' title='Step Forward'>
            >
          </button>
        </div>
        <div className='gameControlGroup'>
          <button onClick={this.props.decreaseSpeed} className='btn btn-default' id='decreaseSpeed' title='Decrease Speed (make faster)'>
            -
          </button>
          <input type='text' value={this.props.speed} className='form-control' id='gameSpeed' title='Game Speed' readOnly />
          <button onClick={this.props.increaseSpeed} className='btn btn-default' id='increaseSpeed' title='Increase Speed (make slower)'>
            +
          </button>
        </div>
      </div>
    )
  }
});

module.exports = TimeControls;
