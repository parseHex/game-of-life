const React = require('react');

const TimeControls = React.createClass({
  propTypes: {
    pausePlay: React.PropTypes.func,
    nextTick: React.PropTypes.func,
    decreaseSpeed: React.PropTypes.func,
    increaseSpeed: React.PropTypes.func,
    paused: React.PropTypes.bool,
    speed: React.PropTypes.number,
    speedSteps: React.PropTypes.array
  },
  render: function() {
    let speedName = '';
    let speedIndex = this.props.speedSteps.indexOf(this.props.speed);
    switch (speedIndex) {
      case 0: {
        speedName = 'Slow';
        break;
      }
      case 1: {
        speedName = 'Normal';
        break;
      }
      case 2: {
        speedName = 'Fast';
        break;
      }
    }
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
          <button onClick={this.props.decreaseSpeed} className='btn btn-default' id='decreaseSpeed' title='Decrease Speed (make slower)'>
            -
          </button>
          <input type='text' value={speedName} className='form-control' id='gameSpeed' title='Game Speed' readOnly />
          <button onClick={this.props.increaseSpeed} className='btn btn-default' id='increaseSpeed' title='Increase Speed (make faster)'>
            +
          </button>
        </div>
      </div>
    )
  }
});

module.exports = TimeControls;
