const React = require('react');

const Cell = React.createClass({
  propTypes: {
    alive: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    id: React.PropTypes.string
  },
  render: function() {
    return (
      <div className={'cell' + (this.props.alive ? ' alive' : '')}
           onClick={this.props.onClick}
           id={this.props.id} />
    );
  }
});

module.exports = Cell;