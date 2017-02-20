const generateCells = require('./generateCells.js');

let settings = {
  boardSize: [50, 25],
  rules: {
    numsToSpawn: [3],
    numsToSurvive: [2, 3],
    numsToDie: [0, 1, 4, 5, 6, 7, 8]
  },
  paused: true,
  speed: 200,
  speedSteps: [500, 200, 50]
};
let state = {
  clicking: false,
  clickAdding: false
};
let cells = [];

// http://beeker.io/jquery-document-ready-equivalent-vanilla-javascript
var domReady = function(callback) {
    document.readyState === 'interactive' || document.readyState === 'complete' ? callback() : document.addEventListener('DOMContentLoaded', callback);
};

domReady(function() {
  cells = generateCells(settings.boardSize);
});
