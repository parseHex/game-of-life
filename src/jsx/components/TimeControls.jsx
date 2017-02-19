const React = require('react');

const TimeControls = React.createClass({
  propTypes: {
    pausePlay: React.PropTypes.func,
    paused: React.PropTypes.bool
  },
  render: function() {
    return (
      <div>
        <button onClick={this.props.pausePlay} className='btn btn-default'>
          {this.props.paused ? 'Play' : 'Pause'}
        </button>
      </div>
    )
  }
});

module.exports = TimeControls;
