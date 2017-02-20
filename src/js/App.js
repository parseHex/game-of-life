const generateCells = require('./generateCells.js');
const drawCells = require('./drawCells.js');
const animateCurrentTick = require('./animateCurrentTick.js');
const processCells = require('./processCells.js');
const util = require('./utility.js');

const SpeedSteps = [
  500, // Slow
  200, // Normal
  50   // Fast
];

let settings = {
  boardSize: [50, 25],
  rules: {
    numsToPopulate: [3],
    numsToSurvive: [2, 3],
    numsToDie: [0, 1, 4, 5, 6, 7, 8]
  },
  speed: 200
};
let state = {
  paused: true,
  clicking: false,
  clickAdding: false
};
let cells = [];

// Cell Management
function killCells(cellIds, noAnimate) {
  for (var i = 0; i < cellIds.length; i++) {
    let cell = cells[ cellIds[ i ] ];
    if (!cell.alive) return;

    cell.lastAlive = true;
    cell.alive = false;
  }

  if (!noAnimate) animateCurrentTick(cells);
}
function populateCells(cellIds, noAnimate) {
  for (var i = 0; i < cellIds.length; i++) {
    let cell = cells[ cellIds [ i ] ];
    if (cell.alive) return;

    cell.lastAlive = false;
    cell.alive = true;
  }

  if (!noAnimate) animateCurrentTick(cells);
}

// Board Event Handlers
function handleCellClick(event) {
  let cellId = +event.target.id.substr(1);
  let alive = !cells[ cellId ].alive;

  if (alive) {
    populateCells( [cellId] );
  } else {
    killCells( [cellId] );
  }

  event.preventDefault();
}
function handleCellMouseEnter(event) {
  if (!state.clicking) return;

  let cellId = +event.target.id.substr(1);

  if (state.clickAdding) {
    populateCells(cellId);
  } else {
    killCells(cellId);
  }
}
function handleBoardMouseUp(event) {
  if (event.button === 1) return; // middle button

  state.clicking = false;
  state.clickAdding = false;

  event.preventDefault();
}
function handleBoardMouseDown(event) {
  if (event.button === 1) return; // middle button

  state.clicking = true;
  state.clickAdding = event.button === 0;

  event.preventDefault();
}

// Time Controls
function nextTick() {
  processCells(cells, settings.rules, killCells, populateCells);
  animateCurrentTick(cells);
}
function forward() {
  stop();
  nextTick();
}
function start() {
  if (!state.paused) return;
  util.id('playButton').textContent = 'Pause';

  state.paused = false;
}
function stop() {
  if (state.paused) return;
  util.id('playButton').textContent = 'Play';

  state.paused = true;
}

// Speed Modifiers
function decreaseSpeed() {
  let currentSpeedIndex = SpeedSteps.indexOf(settings.speed);
  if (typeof SpeedSteps[ currentSpeedIndex - 1 ] === 'undefined') return;

  settings.speed = SpeedSteps[ currentSpeedIndex - 1 ];

  util.id('gameSpeed').textContent = util.getSpeedName(settings.speed, SpeedSteps);
}
function increaseSpeed() {
  let currentSpeedIndex = SpeedSteps.indexOf(settings.speed);
  if (typeof SpeedSteps[ currentSpeedIndex + 1 ] === 'undefined') return;

  settings.speed = SpeedSteps[ currentSpeedIndex + 1 ];

  util.id('gameSpeed').textContent = util.getSpeedName(settings.speed, SpeedSteps);
}

// http://beeker.io/jquery-document-ready-equivalent-vanilla-javascript
var domReady = function(callback) {
    document.readyState === 'interactive' || document.readyState === 'complete' ? callback() : document.addEventListener('DOMContentLoaded', callback);
};

domReady(function() {
  cells = generateCells(settings.boardSize);
  drawCells(cells,
            settings.boardSize,
            handleCellClick,
            handleCellMouseEnter,
            handleBoardMouseUp,
            handleBoardMouseDown
  );
  animateCurrentTick(cells);

  util.id('playButton').addEventListener('click', function() {
    if (state.paused) {
      start();
    } else {
      stop();
    }
  });
  util.id('forwardButton').addEventListener('click', forward);

  util.id('decreaseSpeed').addEventListener('click', decreaseSpeed);
});
