module.exports = {
  id: function(id) {
    return document.getElementById(id);
  },
  getSpeedName: function(speed, steps) {
    let speedIndex = steps.indexOf(speed);
    switch (speedIndex) {
      case 0: {
        return 'Slow';
      }
      case 1: {
        return 'Normal';
      }
      case 2: {
        return 'Fast';
      }
      case 3: {
        return 'Very Fast';
      }
    }
  }
};
