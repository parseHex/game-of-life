(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var generateCells = require('./generateCells.js');
var drawCells = require('./drawCells.js');
var animateCurrentTick = require('./animateCurrentTick.js');
var processCells = require('./processCells.js');
var util = require('./utility.js');

var SpeedSteps = [500, // Slow
200, // Normal
50, // Fast
10, // Very Fast
5 // Lightning
];

var settings = {
  boardSize: [50, 25],
  rules: {
    numsToPopulate: [3],
    numsToSurvive: [2, 3],
    numsToDie: [0, 1, 4, 5, 6, 7, 8]
  },
  speed: 200
};
var state = {
  paused: true,
  clicking: false,
  clickAdding: false,
  animationFrame: null
};
var cells = {};
var numberOfCells = settings.boardSize[0] * settings.boardSize[1];

// Cell Management
function killCells(cellIds, noAnimate) {
  for (var i = 0; i < cellIds.length; i++) {
    var cell = cells[cellIds[i]];
    if (!cell.alive) continue;

    cell.lastAlive = true;
    cell.alive = false;
  }

  if (!noAnimate) animateCurrentTick(cells, numberOfCells);
}
function populateCells(cellIds, noAnimate) {
  for (var i = 0; i < cellIds.length; i++) {
    var cell = cells[cellIds[i]];
    if (cell.alive) continue;

    cell.lastAlive = false;
    cell.alive = true;
  }

  if (!noAnimate) animateCurrentTick(cells, numberOfCells);
}

// Board Event Handlers
function handleCellClick(event) {
  event.preventDefault();

  var cellId = +event.target.id.substr(1);
  var alive = !cells[cellId].alive;

  if (event.button === 2) return killCells([cellId]);

  if (alive) {
    populateCells([cellId]);
  } else {
    killCells([cellId]);
  }
}
function handleCellMouseEnter(event) {
  if (!state.clicking) return;

  var cellId = +event.target.id.substr(1);

  if (state.clickAdding) {
    populateCells([cellId]);
  } else {
    killCells([cellId]);
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
  processCells(cells, numberOfCells, settings.rules, killCells, populateCells);
  animateCurrentTick(cells, numberOfCells);
}
function forward() {
  stop();
  nextTick();
}
function start() {
  if (!state.paused) return;
  util.id('playButton').textContent = 'Pause';

  state.paused = false;

  var timeCount = 0;
  var lastRun = new Date().getTime();
  function animationFrameFunction() {
    var thisRun = new Date().getTime();
    var time = thisRun - lastRun;
    timeCount += time;
    lastRun = thisRun;

    if (timeCount >= settings.speed) {
      timeCount = 0; // will run this time, reset count back to zero

      nextTick();
    }
    settings.animationFrame = requestAnimationFrame(animationFrameFunction);
  }
  settings.animationFrame = requestAnimationFrame(animationFrameFunction);
}
function stop() {
  if (state.paused) return;
  util.id('playButton').textContent = 'Play';

  state.paused = true;

  cancelAnimationFrame(settings.animationFrame);
}
function clear() {
  stop();

  var cellIds = Object.keys(cells);

  killCells(cellIds);
}

// Speed Modifiers
function decreaseSpeed() {
  var currentSpeedIndex = SpeedSteps.indexOf(settings.speed);
  if (typeof SpeedSteps[currentSpeedIndex - 1] === 'undefined') return;

  settings.speed = SpeedSteps[currentSpeedIndex - 1];

  util.id('gameSpeed').value = util.getSpeedName(settings.speed, SpeedSteps);
}
function increaseSpeed() {
  var currentSpeedIndex = SpeedSteps.indexOf(settings.speed);
  if (typeof SpeedSteps[currentSpeedIndex + 1] === 'undefined') return;

  settings.speed = SpeedSteps[currentSpeedIndex + 1];

  util.id('gameSpeed').value = util.getSpeedName(settings.speed, SpeedSteps);
}

// http://beeker.io/jquery-document-ready-equivalent-vanilla-javascript
var domReady = function domReady(callback) {
  document.readyState === 'interactive' || document.readyState === 'complete' ? callback() : document.addEventListener('DOMContentLoaded', callback);
};

domReady(function () {
  cells = generateCells(settings.boardSize);
  drawCells(cells, settings.boardSize, handleCellClick, handleCellMouseEnter, handleBoardMouseUp, handleBoardMouseDown);
  animateCurrentTick(cells, numberOfCells);

  util.id('playButton').addEventListener('click', function () {
    if (state.paused) {
      start();
    } else {
      stop();
    }
  });
  util.id('forwardButton').addEventListener('click', forward);

  util.id('decreaseSpeed').addEventListener('click', decreaseSpeed);
  util.id('increaseSpeed').addEventListener('click', increaseSpeed);

  util.id('clearButton').addEventListener('click', clear);
});

},{"./animateCurrentTick.js":2,"./drawCells.js":3,"./generateCells.js":4,"./processCells.js":5,"./utility.js":7}],2:[function(require,module,exports){
'use strict';

var util = require('./utility.js');

module.exports = function (cells, numberOfCells) {
  for (var i = 1; i <= numberOfCells; i++) {
    var cell = cells[i];
    if (cell.lastAlive === cell.alive) continue;

    util.id('c' + i).className = cell.alive ? 'cell alive' : 'cell';
  }
};

},{"./utility.js":7}],3:[function(require,module,exports){
'use strict';

var util = require('./utility.js');
var boardElement = util.id('board');

module.exports = function (cells, boardSize, handleClick, handleMouseEnter, handleMouseUp, handleMouseDown) {
  var rowSize = boardSize[0];
  var columnSize = boardSize[1];

  var cellId = 1;
  var boardFragment = document.createDocumentFragment();

  // loop through the columnSize to generate each row
  for (var i = 0; i < columnSize; i++) {
    // create the cells for this row

    var row = document.createElement('div');
    row.className = 'cellRow';

    for (var j = 0; j < rowSize; j++, cellId++) {
      var cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = 'c' + cellId;
      cell.addEventListener('click', handleClick);
      cell.addEventListener('contextmenu', handleClick);
      cell.addEventListener('mouseenter', handleMouseEnter);

      row.appendChild(cell);
    }
    boardFragment.appendChild(row);
  }

  boardElement.appendChild(boardFragment);
  boardElement.addEventListener('mousedown', handleMouseDown);
  boardElement.addEventListener('mouseup', handleMouseUp);
};

},{"./utility.js":7}],4:[function(require,module,exports){
'use strict';

var starterCells = require('./starterCells.js');

module.exports = function (size) {
  var numberOfCells = size[0] * size[1];
  var cells = {};

  for (var i = 1; i <= numberOfCells; i++) {
    var cell = {
      alive: false,
      lastAlive: false,
      neighbors: []
    };
    if (starterCells.includes(i)) cell.alive = true;

    var topMiddle = overflow(i - size[0], 1, numberOfCells, numberOfCells);

    var topMaxSize = rowMax(topMiddle, size[0]);
    var topMinSize = topMaxSize - (size[0] - 1);

    var topLeft = overflow(topMiddle - 1, topMinSize, topMaxSize, size[0]);
    var topRight = overflow(topMiddle + 1, topMinSize, topMaxSize, size[0]);

    var thisMaxSize = rowMax(i, size[0]);
    var thisMinSize = thisMaxSize - (size[0] - 1);

    var left = overflow(i - 1, thisMinSize, thisMaxSize, size[0]);
    var right = overflow(i + 1, thisMinSize, thisMaxSize, size[0]);

    var bottomMiddle = overflow(i + size[0], 1, numberOfCells, numberOfCells);

    var bottomMaxSize = rowMax(bottomMiddle, size[0]);
    var bottomMinSize = bottomMaxSize - (size[0] - 1);

    var bottomLeft = overflow(bottomMiddle - 1, bottomMinSize, bottomMaxSize, size[0]);
    var bottomRight = overflow(bottomMiddle + 1, bottomMinSize, bottomMaxSize, size[0]);

    cell.neighbors.push(topLeft);
    cell.neighbors.push(topMiddle);
    cell.neighbors.push(topRight);
    cell.neighbors.push(left);
    cell.neighbors.push(right);
    cell.neighbors.push(bottomLeft);
    cell.neighbors.push(bottomMiddle);
    cell.neighbors.push(bottomRight);

    cells[i] = cell;
  }

  return cells;
};

function overflow(number, min, max, resolver) {
  if (number >= min && number <= max) return number;

  if (number < min) return number + resolver;
  if (number > max) return number - resolver;
}

function rowMax(cellId, rowSize) {
  if (cellId % rowSize === 0) {
    return cellId;
  } else {
    for (var i = cellId + 1; i < cellId + rowSize + 1; i++) {
      if (i % rowSize === 0) return i;
    }
  }
}

},{"./starterCells.js":6}],5:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function (cells, numberOfCells, rules, killCells, populateCells) {
  var cellsToKill = [];
  var cellsToPopulate = [];
  for (var cellId = 1; cellId <= numberOfCells; cellId++) {
    if (_typeof(cells[cellId]) !== 'object') continue;

    var cell = cells[cellId];

    var neighbors = cell.neighbors;
    var neighborsAlive = 0;

    for (var j = 0; j < neighbors.length; j++) {
      var neighbor = cells[neighbors[j]];
      if (neighbor.alive) neighborsAlive++;
    }

    if (cell.alive && rules.numsToDie.includes(neighborsAlive)) {
      cellsToKill.push(cellId);
    }
    if (!cell.alive && rules.numsToPopulate.includes(neighborsAlive)) {
      cellsToPopulate.push(cellId);
    }
  }
  killCells(cellsToKill, true);
  populateCells(cellsToPopulate, true);
};

},{}],6:[function(require,module,exports){
"use strict";

// creates a glider in 50x25 board
module.exports = [524, 575, 623, 624, 625];

},{}],7:[function(require,module,exports){
'use strict';

module.exports = {
  id: function id(_id) {
    return document.getElementById(_id);
  },
  getSpeedName: function getSpeedName(speed, steps) {
    var speedIndex = steps.indexOf(speed);
    switch (speedIndex) {
      case 0:
        {
          return 'Slow';
        }
      case 1:
        {
          return 'Normal';
        }
      case 2:
        {
          return 'Fast';
        }
      case 3:
        {
          return 'Very Fast';
        }
      case 4:
        {
          return 'Lightning';
        }
    }
  }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQXBwLmpzIiwic3JjL2pzL2FuaW1hdGVDdXJyZW50VGljay5qcyIsInNyYy9qcy9kcmF3Q2VsbHMuanMiLCJzcmMvanMvZ2VuZXJhdGVDZWxscy5qcyIsInNyYy9qcy9wcm9jZXNzQ2VsbHMuanMiLCJzcmMvanMvc3RhcnRlckNlbGxzLmpzIiwic3JjL2pzL3V0aWxpdHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sZ0JBQWdCLFFBQVEsb0JBQVIsQ0FBdEI7QUFDQSxJQUFNLFlBQVksUUFBUSxnQkFBUixDQUFsQjtBQUNBLElBQU0scUJBQXFCLFFBQVEseUJBQVIsQ0FBM0I7QUFDQSxJQUFNLGVBQWUsUUFBUSxtQkFBUixDQUFyQjtBQUNBLElBQU0sT0FBTyxRQUFRLGNBQVIsQ0FBYjs7QUFFQSxJQUFNLGFBQWEsQ0FDakIsR0FEaUIsRUFDWjtBQUNMLEdBRmlCLEVBRVo7QUFDTCxFQUhpQixFQUdaO0FBQ0wsRUFKaUIsRUFJWjtBQUNMLENBTGlCLENBS1o7QUFMWSxDQUFuQjs7QUFRQSxJQUFJLFdBQVc7QUFDYixhQUFXLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FERTtBQUViLFNBQU87QUFDTCxvQkFBZ0IsQ0FBQyxDQUFELENBRFg7QUFFTCxtQkFBZSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRlY7QUFHTCxlQUFXLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkI7QUFITixHQUZNO0FBT2IsU0FBTztBQVBNLENBQWY7QUFTQSxJQUFJLFFBQVE7QUFDVixVQUFRLElBREU7QUFFVixZQUFVLEtBRkE7QUFHVixlQUFhLEtBSEg7QUFJVixrQkFBZ0I7QUFKTixDQUFaO0FBTUEsSUFBSSxRQUFRLEVBQVo7QUFDQSxJQUFJLGdCQUFnQixTQUFTLFNBQVQsQ0FBbUIsQ0FBbkIsSUFBd0IsU0FBUyxTQUFULENBQW1CLENBQW5CLENBQTVDOztBQUVBO0FBQ0EsU0FBUyxTQUFULENBQW1CLE9BQW5CLEVBQTRCLFNBQTVCLEVBQXVDO0FBQ3JDLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3ZDLFFBQUksT0FBTyxNQUFPLFFBQVMsQ0FBVCxDQUFQLENBQVg7QUFDQSxRQUFJLENBQUMsS0FBSyxLQUFWLEVBQWlCOztBQUVqQixTQUFLLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxTQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0Q7O0FBRUQsTUFBSSxDQUFDLFNBQUwsRUFBZ0IsbUJBQW1CLEtBQW5CLEVBQTBCLGFBQTFCO0FBQ2pCO0FBQ0QsU0FBUyxhQUFULENBQXVCLE9BQXZCLEVBQWdDLFNBQWhDLEVBQTJDO0FBQ3pDLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3ZDLFFBQUksT0FBTyxNQUFPLFFBQVUsQ0FBVixDQUFQLENBQVg7QUFDQSxRQUFJLEtBQUssS0FBVCxFQUFnQjs7QUFFaEIsU0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsU0FBSyxLQUFMLEdBQWEsSUFBYjtBQUNEOztBQUVELE1BQUksQ0FBQyxTQUFMLEVBQWdCLG1CQUFtQixLQUFuQixFQUEwQixhQUExQjtBQUNqQjs7QUFFRDtBQUNBLFNBQVMsZUFBVCxDQUF5QixLQUF6QixFQUFnQztBQUM5QixRQUFNLGNBQU47O0FBRUEsTUFBSSxTQUFTLENBQUMsTUFBTSxNQUFOLENBQWEsRUFBYixDQUFnQixNQUFoQixDQUF1QixDQUF2QixDQUFkO0FBQ0EsTUFBSSxRQUFRLENBQUMsTUFBTyxNQUFQLEVBQWdCLEtBQTdCOztBQUVBLE1BQUksTUFBTSxNQUFOLEtBQWlCLENBQXJCLEVBQXdCLE9BQU8sVUFBVyxDQUFFLE1BQUYsQ0FBWCxDQUFQOztBQUV4QixNQUFJLEtBQUosRUFBVztBQUNULGtCQUFlLENBQUUsTUFBRixDQUFmO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsY0FBVyxDQUFFLE1BQUYsQ0FBWDtBQUNEO0FBQ0Y7QUFDRCxTQUFTLG9CQUFULENBQThCLEtBQTlCLEVBQXFDO0FBQ25DLE1BQUksQ0FBQyxNQUFNLFFBQVgsRUFBcUI7O0FBRXJCLE1BQUksU0FBUyxDQUFDLE1BQU0sTUFBTixDQUFhLEVBQWIsQ0FBZ0IsTUFBaEIsQ0FBdUIsQ0FBdkIsQ0FBZDs7QUFFQSxNQUFJLE1BQU0sV0FBVixFQUF1QjtBQUNyQixrQkFBZSxDQUFFLE1BQUYsQ0FBZjtBQUNELEdBRkQsTUFFTztBQUNMLGNBQVcsQ0FBRSxNQUFGLENBQVg7QUFDRDtBQUNGO0FBQ0QsU0FBUyxrQkFBVCxDQUE0QixLQUE1QixFQUFtQztBQUNqQyxNQUFJLE1BQU0sTUFBTixLQUFpQixDQUFyQixFQUF3QixPQURTLENBQ0Q7O0FBRWhDLFFBQU0sUUFBTixHQUFpQixLQUFqQjtBQUNBLFFBQU0sV0FBTixHQUFvQixLQUFwQjs7QUFFQSxRQUFNLGNBQU47QUFDRDtBQUNELFNBQVMsb0JBQVQsQ0FBOEIsS0FBOUIsRUFBcUM7QUFDbkMsTUFBSSxNQUFNLE1BQU4sS0FBaUIsQ0FBckIsRUFBd0IsT0FEVyxDQUNIOztBQUVoQyxRQUFNLFFBQU4sR0FBaUIsSUFBakI7QUFDQSxRQUFNLFdBQU4sR0FBb0IsTUFBTSxNQUFOLEtBQWlCLENBQXJDOztBQUVBLFFBQU0sY0FBTjtBQUNEOztBQUVEO0FBQ0EsU0FBUyxRQUFULEdBQW9CO0FBQ2xCLGVBQWEsS0FBYixFQUFvQixhQUFwQixFQUFtQyxTQUFTLEtBQTVDLEVBQW1ELFNBQW5ELEVBQThELGFBQTlEO0FBQ0EscUJBQW1CLEtBQW5CLEVBQTBCLGFBQTFCO0FBQ0Q7QUFDRCxTQUFTLE9BQVQsR0FBbUI7QUFDakI7QUFDQTtBQUNEO0FBQ0QsU0FBUyxLQUFULEdBQWlCO0FBQ2YsTUFBSSxDQUFDLE1BQU0sTUFBWCxFQUFtQjtBQUNuQixPQUFLLEVBQUwsQ0FBUSxZQUFSLEVBQXNCLFdBQXRCLEdBQW9DLE9BQXBDOztBQUVBLFFBQU0sTUFBTixHQUFlLEtBQWY7O0FBRUEsTUFBSSxZQUFZLENBQWhCO0FBQ0EsTUFBSSxVQUFVLElBQUksSUFBSixHQUFXLE9BQVgsRUFBZDtBQUNBLFdBQVMsc0JBQVQsR0FBa0M7QUFDaEMsUUFBSSxVQUFVLElBQUksSUFBSixHQUFXLE9BQVgsRUFBZDtBQUNBLFFBQUksT0FBTyxVQUFVLE9BQXJCO0FBQ0EsaUJBQWEsSUFBYjtBQUNBLGNBQVUsT0FBVjs7QUFFQSxRQUFJLGFBQWEsU0FBUyxLQUExQixFQUFpQztBQUMvQixrQkFBWSxDQUFaLENBRCtCLENBQ2hCOztBQUVmO0FBQ0Q7QUFDRCxhQUFTLGNBQVQsR0FBMEIsc0JBQXNCLHNCQUF0QixDQUExQjtBQUNEO0FBQ0QsV0FBUyxjQUFULEdBQTBCLHNCQUFzQixzQkFBdEIsQ0FBMUI7QUFDRDtBQUNELFNBQVMsSUFBVCxHQUFnQjtBQUNkLE1BQUksTUFBTSxNQUFWLEVBQWtCO0FBQ2xCLE9BQUssRUFBTCxDQUFRLFlBQVIsRUFBc0IsV0FBdEIsR0FBb0MsTUFBcEM7O0FBRUEsUUFBTSxNQUFOLEdBQWUsSUFBZjs7QUFFQSx1QkFBcUIsU0FBUyxjQUE5QjtBQUNEO0FBQ0QsU0FBUyxLQUFULEdBQWlCO0FBQ2Y7O0FBRUEsTUFBSSxVQUFVLE9BQU8sSUFBUCxDQUFZLEtBQVosQ0FBZDs7QUFFQSxZQUFVLE9BQVY7QUFDRDs7QUFFRDtBQUNBLFNBQVMsYUFBVCxHQUF5QjtBQUN2QixNQUFJLG9CQUFvQixXQUFXLE9BQVgsQ0FBbUIsU0FBUyxLQUE1QixDQUF4QjtBQUNBLE1BQUksT0FBTyxXQUFZLG9CQUFvQixDQUFoQyxDQUFQLEtBQStDLFdBQW5ELEVBQWdFOztBQUVoRSxXQUFTLEtBQVQsR0FBaUIsV0FBWSxvQkFBb0IsQ0FBaEMsQ0FBakI7O0FBRUEsT0FBSyxFQUFMLENBQVEsV0FBUixFQUFxQixLQUFyQixHQUE2QixLQUFLLFlBQUwsQ0FBa0IsU0FBUyxLQUEzQixFQUFrQyxVQUFsQyxDQUE3QjtBQUNEO0FBQ0QsU0FBUyxhQUFULEdBQXlCO0FBQ3ZCLE1BQUksb0JBQW9CLFdBQVcsT0FBWCxDQUFtQixTQUFTLEtBQTVCLENBQXhCO0FBQ0EsTUFBSSxPQUFPLFdBQVksb0JBQW9CLENBQWhDLENBQVAsS0FBK0MsV0FBbkQsRUFBZ0U7O0FBRWhFLFdBQVMsS0FBVCxHQUFpQixXQUFZLG9CQUFvQixDQUFoQyxDQUFqQjs7QUFFQSxPQUFLLEVBQUwsQ0FBUSxXQUFSLEVBQXFCLEtBQXJCLEdBQTZCLEtBQUssWUFBTCxDQUFrQixTQUFTLEtBQTNCLEVBQWtDLFVBQWxDLENBQTdCO0FBQ0Q7O0FBRUQ7QUFDQSxJQUFJLFdBQVcsU0FBWCxRQUFXLENBQVMsUUFBVCxFQUFtQjtBQUM5QixXQUFTLFVBQVQsS0FBd0IsYUFBeEIsSUFBeUMsU0FBUyxVQUFULEtBQXdCLFVBQWpFLEdBQThFLFVBQTlFLEdBQTJGLFNBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFFBQTlDLENBQTNGO0FBQ0gsQ0FGRDs7QUFJQSxTQUFTLFlBQVc7QUFDbEIsVUFBUSxjQUFjLFNBQVMsU0FBdkIsQ0FBUjtBQUNBLFlBQVUsS0FBVixFQUNVLFNBQVMsU0FEbkIsRUFFVSxlQUZWLEVBR1Usb0JBSFYsRUFJVSxrQkFKVixFQUtVLG9CQUxWO0FBT0EscUJBQW1CLEtBQW5CLEVBQTBCLGFBQTFCOztBQUVBLE9BQUssRUFBTCxDQUFRLFlBQVIsRUFBc0IsZ0JBQXRCLENBQXVDLE9BQXZDLEVBQWdELFlBQVc7QUFDekQsUUFBSSxNQUFNLE1BQVYsRUFBa0I7QUFDaEI7QUFDRCxLQUZELE1BRU87QUFDTDtBQUNEO0FBQ0YsR0FORDtBQU9BLE9BQUssRUFBTCxDQUFRLGVBQVIsRUFBeUIsZ0JBQXpCLENBQTBDLE9BQTFDLEVBQW1ELE9BQW5EOztBQUVBLE9BQUssRUFBTCxDQUFRLGVBQVIsRUFBeUIsZ0JBQXpCLENBQTBDLE9BQTFDLEVBQW1ELGFBQW5EO0FBQ0EsT0FBSyxFQUFMLENBQVEsZUFBUixFQUF5QixnQkFBekIsQ0FBMEMsT0FBMUMsRUFBbUQsYUFBbkQ7O0FBRUEsT0FBSyxFQUFMLENBQVEsYUFBUixFQUF1QixnQkFBdkIsQ0FBd0MsT0FBeEMsRUFBaUQsS0FBakQ7QUFDRCxDQXhCRDs7Ozs7QUMxS0EsSUFBTSxPQUFPLFFBQVEsY0FBUixDQUFiOztBQUVBLE9BQU8sT0FBUCxHQUFpQixVQUFTLEtBQVQsRUFBZ0IsYUFBaEIsRUFBK0I7QUFDOUMsT0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixLQUFLLGFBQXJCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3ZDLFFBQUksT0FBTyxNQUFNLENBQU4sQ0FBWDtBQUNBLFFBQUksS0FBSyxTQUFMLEtBQW1CLEtBQUssS0FBNUIsRUFBbUM7O0FBRW5DLFNBQUssRUFBTCxDQUFRLE1BQU0sQ0FBZCxFQUFpQixTQUFqQixHQUE2QixLQUFLLEtBQUwsR0FBYSxZQUFiLEdBQTRCLE1BQXpEO0FBQ0Q7QUFDRixDQVBEOzs7OztBQ0ZBLElBQU0sT0FBTyxRQUFRLGNBQVIsQ0FBYjtBQUNBLElBQU0sZUFBZSxLQUFLLEVBQUwsQ0FBUSxPQUFSLENBQXJCOztBQUVBLE9BQU8sT0FBUCxHQUFpQixVQUFTLEtBQVQsRUFBZ0IsU0FBaEIsRUFBMkIsV0FBM0IsRUFBd0MsZ0JBQXhDLEVBQTBELGFBQTFELEVBQXlFLGVBQXpFLEVBQTBGO0FBQ3pHLE1BQUksVUFBVSxVQUFVLENBQVYsQ0FBZDtBQUNBLE1BQUksYUFBYSxVQUFVLENBQVYsQ0FBakI7O0FBRUEsTUFBSSxTQUFTLENBQWI7QUFDQSxNQUFJLGdCQUFnQixTQUFTLHNCQUFULEVBQXBCOztBQUVBO0FBQ0EsT0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLFVBQXBCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ25DOztBQUVBLFFBQUksTUFBTSxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBVjtBQUNBLFFBQUksU0FBSixHQUFnQixTQUFoQjs7QUFFQSxTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksT0FBcEIsRUFBNkIsS0FBSyxRQUFsQyxFQUE0QztBQUMxQyxVQUFJLE9BQU8sU0FBUyxhQUFULENBQXVCLEtBQXZCLENBQVg7QUFDQSxXQUFLLFNBQUwsR0FBaUIsTUFBakI7QUFDQSxXQUFLLEVBQUwsR0FBVSxNQUFNLE1BQWhCO0FBQ0EsV0FBSyxnQkFBTCxDQUFzQixPQUF0QixFQUErQixXQUEvQjtBQUNBLFdBQUssZ0JBQUwsQ0FBc0IsYUFBdEIsRUFBcUMsV0FBckM7QUFDQSxXQUFLLGdCQUFMLENBQXNCLFlBQXRCLEVBQW9DLGdCQUFwQzs7QUFFQSxVQUFJLFdBQUosQ0FBZ0IsSUFBaEI7QUFDRDtBQUNELGtCQUFjLFdBQWQsQ0FBMEIsR0FBMUI7QUFDRDs7QUFFRCxlQUFhLFdBQWIsQ0FBeUIsYUFBekI7QUFDQSxlQUFhLGdCQUFiLENBQThCLFdBQTlCLEVBQTJDLGVBQTNDO0FBQ0EsZUFBYSxnQkFBYixDQUE4QixTQUE5QixFQUF5QyxhQUF6QztBQUNELENBOUJEOzs7OztBQ0hBLElBQU0sZUFBZSxRQUFRLG1CQUFSLENBQXJCOztBQUVBLE9BQU8sT0FBUCxHQUFpQixVQUFTLElBQVQsRUFBZTtBQUM5QixNQUFJLGdCQUFnQixLQUFLLENBQUwsSUFBVSxLQUFLLENBQUwsQ0FBOUI7QUFDQSxNQUFJLFFBQVEsRUFBWjs7QUFFQSxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLEtBQUssYUFBckIsRUFBb0MsR0FBcEMsRUFBeUM7QUFDdkMsUUFBSSxPQUFPO0FBQ1QsYUFBTyxLQURFO0FBRVQsaUJBQVcsS0FGRjtBQUdULGlCQUFXO0FBSEYsS0FBWDtBQUtBLFFBQUksYUFBYSxRQUFiLENBQXNCLENBQXRCLENBQUosRUFBOEIsS0FBSyxLQUFMLEdBQWEsSUFBYjs7QUFFOUIsUUFBSSxZQUFZLFNBQVMsSUFBSSxLQUFLLENBQUwsQ0FBYixFQUFzQixDQUF0QixFQUF5QixhQUF6QixFQUF3QyxhQUF4QyxDQUFoQjs7QUFFQSxRQUFJLGFBQWEsT0FBTyxTQUFQLEVBQWtCLEtBQUssQ0FBTCxDQUFsQixDQUFqQjtBQUNBLFFBQUksYUFBYSxjQUFjLEtBQUssQ0FBTCxJQUFVLENBQXhCLENBQWpCOztBQUVBLFFBQUksVUFBVSxTQUFTLFlBQVksQ0FBckIsRUFBd0IsVUFBeEIsRUFBb0MsVUFBcEMsRUFBZ0QsS0FBSyxDQUFMLENBQWhELENBQWQ7QUFDQSxRQUFJLFdBQVcsU0FBUyxZQUFZLENBQXJCLEVBQXdCLFVBQXhCLEVBQW9DLFVBQXBDLEVBQWdELEtBQUssQ0FBTCxDQUFoRCxDQUFmOztBQUVBLFFBQUksY0FBYyxPQUFPLENBQVAsRUFBVSxLQUFLLENBQUwsQ0FBVixDQUFsQjtBQUNBLFFBQUksY0FBYyxlQUFlLEtBQUssQ0FBTCxJQUFVLENBQXpCLENBQWxCOztBQUVBLFFBQUksT0FBTyxTQUFTLElBQUksQ0FBYixFQUFnQixXQUFoQixFQUE2QixXQUE3QixFQUEwQyxLQUFLLENBQUwsQ0FBMUMsQ0FBWDtBQUNBLFFBQUksUUFBUSxTQUFTLElBQUksQ0FBYixFQUFnQixXQUFoQixFQUE2QixXQUE3QixFQUEwQyxLQUFLLENBQUwsQ0FBMUMsQ0FBWjs7QUFFQSxRQUFJLGVBQWUsU0FBUyxJQUFJLEtBQUssQ0FBTCxDQUFiLEVBQXNCLENBQXRCLEVBQXlCLGFBQXpCLEVBQXdDLGFBQXhDLENBQW5COztBQUVBLFFBQUksZ0JBQWdCLE9BQU8sWUFBUCxFQUFxQixLQUFLLENBQUwsQ0FBckIsQ0FBcEI7QUFDQSxRQUFJLGdCQUFnQixpQkFBaUIsS0FBSyxDQUFMLElBQVUsQ0FBM0IsQ0FBcEI7O0FBRUEsUUFBSSxhQUFhLFNBQVMsZUFBZSxDQUF4QixFQUEyQixhQUEzQixFQUEwQyxhQUExQyxFQUF5RCxLQUFLLENBQUwsQ0FBekQsQ0FBakI7QUFDQSxRQUFJLGNBQWMsU0FBUyxlQUFlLENBQXhCLEVBQTJCLGFBQTNCLEVBQTBDLGFBQTFDLEVBQXlELEtBQUssQ0FBTCxDQUF6RCxDQUFsQjs7QUFFQSxTQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLE9BQXBCO0FBQ0EsU0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixTQUFwQjtBQUNBLFNBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsUUFBcEI7QUFDQSxTQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLElBQXBCO0FBQ0EsU0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixLQUFwQjtBQUNBLFNBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsVUFBcEI7QUFDQSxTQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLFlBQXBCO0FBQ0EsU0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixXQUFwQjs7QUFFQSxVQUFNLENBQU4sSUFBVyxJQUFYO0FBQ0Q7O0FBRUQsU0FBTyxLQUFQO0FBQ0QsQ0EvQ0Q7O0FBaURBLFNBQVMsUUFBVCxDQUFrQixNQUFsQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxRQUFwQyxFQUE4QztBQUM1QyxNQUFJLFVBQVUsR0FBVixJQUFpQixVQUFVLEdBQS9CLEVBQW9DLE9BQU8sTUFBUDs7QUFFcEMsTUFBSSxTQUFTLEdBQWIsRUFBa0IsT0FBTyxTQUFTLFFBQWhCO0FBQ2xCLE1BQUksU0FBUyxHQUFiLEVBQWtCLE9BQU8sU0FBUyxRQUFoQjtBQUNuQjs7QUFFRCxTQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsRUFBd0IsT0FBeEIsRUFBaUM7QUFDL0IsTUFBSSxTQUFTLE9BQVQsS0FBcUIsQ0FBekIsRUFBNEI7QUFDMUIsV0FBTyxNQUFQO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsU0FBSyxJQUFJLElBQUksU0FBUyxDQUF0QixFQUF5QixJQUFJLFNBQVMsT0FBVCxHQUFtQixDQUFoRCxFQUFtRCxHQUFuRCxFQUF3RDtBQUN0RCxVQUFJLElBQUksT0FBSixLQUFnQixDQUFwQixFQUF1QixPQUFPLENBQVA7QUFDeEI7QUFDRjtBQUNGOzs7Ozs7O0FDbEVELE9BQU8sT0FBUCxHQUFpQixVQUFTLEtBQVQsRUFBZ0IsYUFBaEIsRUFBK0IsS0FBL0IsRUFBc0MsU0FBdEMsRUFBaUQsYUFBakQsRUFBZ0U7QUFDL0UsTUFBSSxjQUFjLEVBQWxCO0FBQ0EsTUFBSSxrQkFBa0IsRUFBdEI7QUFDQSxPQUFLLElBQUksU0FBUyxDQUFsQixFQUFxQixVQUFVLGFBQS9CLEVBQThDLFFBQTlDLEVBQXdEO0FBQ3RELFFBQUksUUFBTyxNQUFPLE1BQVAsQ0FBUCxNQUEyQixRQUEvQixFQUF5Qzs7QUFFekMsUUFBSSxPQUFPLE1BQU8sTUFBUCxDQUFYOztBQUVBLFFBQU0sWUFBWSxLQUFLLFNBQXZCO0FBQ0EsUUFBSSxpQkFBaUIsQ0FBckI7O0FBRUEsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLFVBQVUsTUFBOUIsRUFBc0MsR0FBdEMsRUFBMkM7QUFDekMsVUFBSSxXQUFXLE1BQU8sVUFBVyxDQUFYLENBQVAsQ0FBZjtBQUNBLFVBQUksU0FBUyxLQUFiLEVBQW9CO0FBQ3JCOztBQUVELFFBQUksS0FBSyxLQUFMLElBQWMsTUFBTSxTQUFOLENBQWdCLFFBQWhCLENBQXlCLGNBQXpCLENBQWxCLEVBQTREO0FBQzFELGtCQUFZLElBQVosQ0FBaUIsTUFBakI7QUFDRDtBQUNELFFBQUksQ0FBQyxLQUFLLEtBQU4sSUFBZSxNQUFNLGNBQU4sQ0FBcUIsUUFBckIsQ0FBOEIsY0FBOUIsQ0FBbkIsRUFBa0U7QUFDaEUsc0JBQWdCLElBQWhCLENBQXFCLE1BQXJCO0FBQ0Q7QUFDRjtBQUNELFlBQVUsV0FBVixFQUF1QixJQUF2QjtBQUNBLGdCQUFjLGVBQWQsRUFBK0IsSUFBL0I7QUFDRCxDQXpCRDs7Ozs7QUNBQTtBQUNBLE9BQU8sT0FBUCxHQUFpQixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixDQUFqQjs7Ozs7QUNEQSxPQUFPLE9BQVAsR0FBaUI7QUFDZixNQUFJLFlBQVMsR0FBVCxFQUFhO0FBQ2YsV0FBTyxTQUFTLGNBQVQsQ0FBd0IsR0FBeEIsQ0FBUDtBQUNELEdBSGM7QUFJZixnQkFBYyxzQkFBUyxLQUFULEVBQWdCLEtBQWhCLEVBQXVCO0FBQ25DLFFBQUksYUFBYSxNQUFNLE9BQU4sQ0FBYyxLQUFkLENBQWpCO0FBQ0EsWUFBUSxVQUFSO0FBQ0UsV0FBSyxDQUFMO0FBQVE7QUFDTixpQkFBTyxNQUFQO0FBQ0Q7QUFDRCxXQUFLLENBQUw7QUFBUTtBQUNOLGlCQUFPLFFBQVA7QUFDRDtBQUNELFdBQUssQ0FBTDtBQUFRO0FBQ04saUJBQU8sTUFBUDtBQUNEO0FBQ0QsV0FBSyxDQUFMO0FBQVE7QUFDTixpQkFBTyxXQUFQO0FBQ0Q7QUFDRCxXQUFLLENBQUw7QUFBUTtBQUNOLGlCQUFPLFdBQVA7QUFDRDtBQWZIO0FBaUJEO0FBdkJjLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IGdlbmVyYXRlQ2VsbHMgPSByZXF1aXJlKCcuL2dlbmVyYXRlQ2VsbHMuanMnKTtcbmNvbnN0IGRyYXdDZWxscyA9IHJlcXVpcmUoJy4vZHJhd0NlbGxzLmpzJyk7XG5jb25zdCBhbmltYXRlQ3VycmVudFRpY2sgPSByZXF1aXJlKCcuL2FuaW1hdGVDdXJyZW50VGljay5qcycpO1xuY29uc3QgcHJvY2Vzc0NlbGxzID0gcmVxdWlyZSgnLi9wcm9jZXNzQ2VsbHMuanMnKTtcbmNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWxpdHkuanMnKTtcblxuY29uc3QgU3BlZWRTdGVwcyA9IFtcbiAgNTAwLCAvLyBTbG93XG4gIDIwMCwgLy8gTm9ybWFsXG4gIDUwLCAgLy8gRmFzdFxuICAxMCwgIC8vIFZlcnkgRmFzdFxuICA1ICAgIC8vIExpZ2h0bmluZ1xuXTtcblxubGV0IHNldHRpbmdzID0ge1xuICBib2FyZFNpemU6IFs1MCwgMjVdLFxuICBydWxlczoge1xuICAgIG51bXNUb1BvcHVsYXRlOiBbM10sXG4gICAgbnVtc1RvU3Vydml2ZTogWzIsIDNdLFxuICAgIG51bXNUb0RpZTogWzAsIDEsIDQsIDUsIDYsIDcsIDhdXG4gIH0sXG4gIHNwZWVkOiAyMDBcbn07XG5sZXQgc3RhdGUgPSB7XG4gIHBhdXNlZDogdHJ1ZSxcbiAgY2xpY2tpbmc6IGZhbHNlLFxuICBjbGlja0FkZGluZzogZmFsc2UsXG4gIGFuaW1hdGlvbkZyYW1lOiBudWxsXG59O1xubGV0IGNlbGxzID0ge307XG5sZXQgbnVtYmVyT2ZDZWxscyA9IHNldHRpbmdzLmJvYXJkU2l6ZVswXSAqIHNldHRpbmdzLmJvYXJkU2l6ZVsxXTtcblxuLy8gQ2VsbCBNYW5hZ2VtZW50XG5mdW5jdGlvbiBraWxsQ2VsbHMoY2VsbElkcywgbm9BbmltYXRlKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2VsbElkcy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjZWxsID0gY2VsbHNbIGNlbGxJZHNbIGkgXSBdO1xuICAgIGlmICghY2VsbC5hbGl2ZSkgY29udGludWU7XG5cbiAgICBjZWxsLmxhc3RBbGl2ZSA9IHRydWU7XG4gICAgY2VsbC5hbGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKCFub0FuaW1hdGUpIGFuaW1hdGVDdXJyZW50VGljayhjZWxscywgbnVtYmVyT2ZDZWxscyk7XG59XG5mdW5jdGlvbiBwb3B1bGF0ZUNlbGxzKGNlbGxJZHMsIG5vQW5pbWF0ZSkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNlbGxJZHMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY2VsbCA9IGNlbGxzWyBjZWxsSWRzIFsgaSBdIF07XG4gICAgaWYgKGNlbGwuYWxpdmUpIGNvbnRpbnVlO1xuXG4gICAgY2VsbC5sYXN0QWxpdmUgPSBmYWxzZTtcbiAgICBjZWxsLmFsaXZlID0gdHJ1ZTtcbiAgfVxuXG4gIGlmICghbm9BbmltYXRlKSBhbmltYXRlQ3VycmVudFRpY2soY2VsbHMsIG51bWJlck9mQ2VsbHMpO1xufVxuXG4vLyBCb2FyZCBFdmVudCBIYW5kbGVyc1xuZnVuY3Rpb24gaGFuZGxlQ2VsbENsaWNrKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgbGV0IGNlbGxJZCA9ICtldmVudC50YXJnZXQuaWQuc3Vic3RyKDEpO1xuICBsZXQgYWxpdmUgPSAhY2VsbHNbIGNlbGxJZCBdLmFsaXZlO1xuXG4gIGlmIChldmVudC5idXR0b24gPT09IDIpIHJldHVybiBraWxsQ2VsbHMoIFsgY2VsbElkIF0gKTtcblxuICBpZiAoYWxpdmUpIHtcbiAgICBwb3B1bGF0ZUNlbGxzKCBbIGNlbGxJZCBdICk7XG4gIH0gZWxzZSB7XG4gICAga2lsbENlbGxzKCBbIGNlbGxJZCBdICk7XG4gIH1cbn1cbmZ1bmN0aW9uIGhhbmRsZUNlbGxNb3VzZUVudGVyKGV2ZW50KSB7XG4gIGlmICghc3RhdGUuY2xpY2tpbmcpIHJldHVybjtcblxuICBsZXQgY2VsbElkID0gK2V2ZW50LnRhcmdldC5pZC5zdWJzdHIoMSk7XG5cbiAgaWYgKHN0YXRlLmNsaWNrQWRkaW5nKSB7XG4gICAgcG9wdWxhdGVDZWxscyggWyBjZWxsSWQgXSApO1xuICB9IGVsc2Uge1xuICAgIGtpbGxDZWxscyggWyBjZWxsSWQgXSApO1xuICB9XG59XG5mdW5jdGlvbiBoYW5kbGVCb2FyZE1vdXNlVXAoZXZlbnQpIHtcbiAgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMSkgcmV0dXJuOyAvLyBtaWRkbGUgYnV0dG9uXG5cbiAgc3RhdGUuY2xpY2tpbmcgPSBmYWxzZTtcbiAgc3RhdGUuY2xpY2tBZGRpbmcgPSBmYWxzZTtcblxuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufVxuZnVuY3Rpb24gaGFuZGxlQm9hcmRNb3VzZURvd24oZXZlbnQpIHtcbiAgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMSkgcmV0dXJuOyAvLyBtaWRkbGUgYnV0dG9uXG5cbiAgc3RhdGUuY2xpY2tpbmcgPSB0cnVlO1xuICBzdGF0ZS5jbGlja0FkZGluZyA9IGV2ZW50LmJ1dHRvbiA9PT0gMDtcblxuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG4vLyBUaW1lIENvbnRyb2xzXG5mdW5jdGlvbiBuZXh0VGljaygpIHtcbiAgcHJvY2Vzc0NlbGxzKGNlbGxzLCBudW1iZXJPZkNlbGxzLCBzZXR0aW5ncy5ydWxlcywga2lsbENlbGxzLCBwb3B1bGF0ZUNlbGxzKTtcbiAgYW5pbWF0ZUN1cnJlbnRUaWNrKGNlbGxzLCBudW1iZXJPZkNlbGxzKTtcbn1cbmZ1bmN0aW9uIGZvcndhcmQoKSB7XG4gIHN0b3AoKTtcbiAgbmV4dFRpY2soKTtcbn1cbmZ1bmN0aW9uIHN0YXJ0KCkge1xuICBpZiAoIXN0YXRlLnBhdXNlZCkgcmV0dXJuO1xuICB1dGlsLmlkKCdwbGF5QnV0dG9uJykudGV4dENvbnRlbnQgPSAnUGF1c2UnO1xuXG4gIHN0YXRlLnBhdXNlZCA9IGZhbHNlO1xuXG4gIGxldCB0aW1lQ291bnQgPSAwO1xuICBsZXQgbGFzdFJ1biA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICBmdW5jdGlvbiBhbmltYXRpb25GcmFtZUZ1bmN0aW9uKCkge1xuICAgIGxldCB0aGlzUnVuID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgbGV0IHRpbWUgPSB0aGlzUnVuIC0gbGFzdFJ1bjtcbiAgICB0aW1lQ291bnQgKz0gdGltZTtcbiAgICBsYXN0UnVuID0gdGhpc1J1bjtcblxuICAgIGlmICh0aW1lQ291bnQgPj0gc2V0dGluZ3Muc3BlZWQpIHtcbiAgICAgIHRpbWVDb3VudCA9IDA7IC8vIHdpbGwgcnVuIHRoaXMgdGltZSwgcmVzZXQgY291bnQgYmFjayB0byB6ZXJvXG5cbiAgICAgIG5leHRUaWNrKCk7XG4gICAgfVxuICAgIHNldHRpbmdzLmFuaW1hdGlvbkZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbkZyYW1lRnVuY3Rpb24pO1xuICB9XG4gIHNldHRpbmdzLmFuaW1hdGlvbkZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbkZyYW1lRnVuY3Rpb24pO1xufVxuZnVuY3Rpb24gc3RvcCgpIHtcbiAgaWYgKHN0YXRlLnBhdXNlZCkgcmV0dXJuO1xuICB1dGlsLmlkKCdwbGF5QnV0dG9uJykudGV4dENvbnRlbnQgPSAnUGxheSc7XG5cbiAgc3RhdGUucGF1c2VkID0gdHJ1ZTtcblxuICBjYW5jZWxBbmltYXRpb25GcmFtZShzZXR0aW5ncy5hbmltYXRpb25GcmFtZSk7XG59XG5mdW5jdGlvbiBjbGVhcigpIHtcbiAgc3RvcCgpO1xuXG4gIGxldCBjZWxsSWRzID0gT2JqZWN0LmtleXMoY2VsbHMpO1xuXG4gIGtpbGxDZWxscyhjZWxsSWRzKTtcbn1cblxuLy8gU3BlZWQgTW9kaWZpZXJzXG5mdW5jdGlvbiBkZWNyZWFzZVNwZWVkKCkge1xuICBsZXQgY3VycmVudFNwZWVkSW5kZXggPSBTcGVlZFN0ZXBzLmluZGV4T2Yoc2V0dGluZ3Muc3BlZWQpO1xuICBpZiAodHlwZW9mIFNwZWVkU3RlcHNbIGN1cnJlbnRTcGVlZEluZGV4IC0gMSBdID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuXG4gIHNldHRpbmdzLnNwZWVkID0gU3BlZWRTdGVwc1sgY3VycmVudFNwZWVkSW5kZXggLSAxIF07XG5cbiAgdXRpbC5pZCgnZ2FtZVNwZWVkJykudmFsdWUgPSB1dGlsLmdldFNwZWVkTmFtZShzZXR0aW5ncy5zcGVlZCwgU3BlZWRTdGVwcyk7XG59XG5mdW5jdGlvbiBpbmNyZWFzZVNwZWVkKCkge1xuICBsZXQgY3VycmVudFNwZWVkSW5kZXggPSBTcGVlZFN0ZXBzLmluZGV4T2Yoc2V0dGluZ3Muc3BlZWQpO1xuICBpZiAodHlwZW9mIFNwZWVkU3RlcHNbIGN1cnJlbnRTcGVlZEluZGV4ICsgMSBdID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuXG4gIHNldHRpbmdzLnNwZWVkID0gU3BlZWRTdGVwc1sgY3VycmVudFNwZWVkSW5kZXggKyAxIF07XG5cbiAgdXRpbC5pZCgnZ2FtZVNwZWVkJykudmFsdWUgPSB1dGlsLmdldFNwZWVkTmFtZShzZXR0aW5ncy5zcGVlZCwgU3BlZWRTdGVwcyk7XG59XG5cbi8vIGh0dHA6Ly9iZWVrZXIuaW8vanF1ZXJ5LWRvY3VtZW50LXJlYWR5LWVxdWl2YWxlbnQtdmFuaWxsYS1qYXZhc2NyaXB0XG52YXIgZG9tUmVhZHkgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdpbnRlcmFjdGl2ZScgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyA/IGNhbGxiYWNrKCkgOiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgY2FsbGJhY2spO1xufTtcblxuZG9tUmVhZHkoZnVuY3Rpb24oKSB7XG4gIGNlbGxzID0gZ2VuZXJhdGVDZWxscyhzZXR0aW5ncy5ib2FyZFNpemUpO1xuICBkcmF3Q2VsbHMoY2VsbHMsXG4gICAgICAgICAgICBzZXR0aW5ncy5ib2FyZFNpemUsXG4gICAgICAgICAgICBoYW5kbGVDZWxsQ2xpY2ssXG4gICAgICAgICAgICBoYW5kbGVDZWxsTW91c2VFbnRlcixcbiAgICAgICAgICAgIGhhbmRsZUJvYXJkTW91c2VVcCxcbiAgICAgICAgICAgIGhhbmRsZUJvYXJkTW91c2VEb3duXG4gICk7XG4gIGFuaW1hdGVDdXJyZW50VGljayhjZWxscywgbnVtYmVyT2ZDZWxscyk7XG5cbiAgdXRpbC5pZCgncGxheUJ1dHRvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgaWYgKHN0YXRlLnBhdXNlZCkge1xuICAgICAgc3RhcnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RvcCgpO1xuICAgIH1cbiAgfSk7XG4gIHV0aWwuaWQoJ2ZvcndhcmRCdXR0b24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZvcndhcmQpO1xuXG4gIHV0aWwuaWQoJ2RlY3JlYXNlU3BlZWQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRlY3JlYXNlU3BlZWQpO1xuICB1dGlsLmlkKCdpbmNyZWFzZVNwZWVkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbmNyZWFzZVNwZWVkKTtcblxuICB1dGlsLmlkKCdjbGVhckJ1dHRvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xlYXIpO1xufSk7XG4iLCJjb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsaXR5LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY2VsbHMsIG51bWJlck9mQ2VsbHMpIHtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPD0gbnVtYmVyT2ZDZWxsczsgaSsrKSB7XG4gICAgbGV0IGNlbGwgPSBjZWxsc1tpXTtcbiAgICBpZiAoY2VsbC5sYXN0QWxpdmUgPT09IGNlbGwuYWxpdmUpIGNvbnRpbnVlO1xuXG4gICAgdXRpbC5pZCgnYycgKyBpKS5jbGFzc05hbWUgPSBjZWxsLmFsaXZlID8gJ2NlbGwgYWxpdmUnIDogJ2NlbGwnO1xuICB9XG59O1xuIiwiY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbGl0eS5qcycpO1xuY29uc3QgYm9hcmRFbGVtZW50ID0gdXRpbC5pZCgnYm9hcmQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjZWxscywgYm9hcmRTaXplLCBoYW5kbGVDbGljaywgaGFuZGxlTW91c2VFbnRlciwgaGFuZGxlTW91c2VVcCwgaGFuZGxlTW91c2VEb3duKSB7XG4gIGxldCByb3dTaXplID0gYm9hcmRTaXplWzBdO1xuICBsZXQgY29sdW1uU2l6ZSA9IGJvYXJkU2l6ZVsxXTtcblxuICB2YXIgY2VsbElkID0gMTtcbiAgbGV0IGJvYXJkRnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgLy8gbG9vcCB0aHJvdWdoIHRoZSBjb2x1bW5TaXplIHRvIGdlbmVyYXRlIGVhY2ggcm93XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1uU2l6ZTsgaSsrKSB7XG4gICAgLy8gY3JlYXRlIHRoZSBjZWxscyBmb3IgdGhpcyByb3dcblxuICAgIGxldCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByb3cuY2xhc3NOYW1lID0gJ2NlbGxSb3cnO1xuXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dTaXplOyBqKyssIGNlbGxJZCsrKSB7XG4gICAgICBsZXQgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgY2VsbC5jbGFzc05hbWUgPSAnY2VsbCc7XG4gICAgICBjZWxsLmlkID0gJ2MnICsgY2VsbElkO1xuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNsaWNrKTtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBoYW5kbGVDbGljayk7XG4gICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBoYW5kbGVNb3VzZUVudGVyKTtcblxuICAgICAgcm93LmFwcGVuZENoaWxkKGNlbGwpO1xuICAgIH1cbiAgICBib2FyZEZyYWdtZW50LmFwcGVuZENoaWxkKHJvdyk7XG4gIH1cblxuICBib2FyZEVsZW1lbnQuYXBwZW5kQ2hpbGQoYm9hcmRGcmFnbWVudCk7XG4gIGJvYXJkRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBoYW5kbGVNb3VzZURvd24pO1xuICBib2FyZEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGhhbmRsZU1vdXNlVXApO1xufTtcbiIsImNvbnN0IHN0YXJ0ZXJDZWxscyA9IHJlcXVpcmUoJy4vc3RhcnRlckNlbGxzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2l6ZSkge1xuICBsZXQgbnVtYmVyT2ZDZWxscyA9IHNpemVbMF0gKiBzaXplWzFdO1xuICBsZXQgY2VsbHMgPSB7fTtcblxuICBmb3IgKGxldCBpID0gMTsgaSA8PSBudW1iZXJPZkNlbGxzOyBpKyspIHtcbiAgICBsZXQgY2VsbCA9IHtcbiAgICAgIGFsaXZlOiBmYWxzZSxcbiAgICAgIGxhc3RBbGl2ZTogZmFsc2UsXG4gICAgICBuZWlnaGJvcnM6IFtdXG4gICAgfTtcbiAgICBpZiAoc3RhcnRlckNlbGxzLmluY2x1ZGVzKGkpKSBjZWxsLmFsaXZlID0gdHJ1ZTtcblxuICAgIGxldCB0b3BNaWRkbGUgPSBvdmVyZmxvdyhpIC0gc2l6ZVswXSwgMSwgbnVtYmVyT2ZDZWxscywgbnVtYmVyT2ZDZWxscyk7XG5cbiAgICBsZXQgdG9wTWF4U2l6ZSA9IHJvd01heCh0b3BNaWRkbGUsIHNpemVbMF0pO1xuICAgIGxldCB0b3BNaW5TaXplID0gdG9wTWF4U2l6ZSAtIChzaXplWzBdIC0gMSk7XG5cbiAgICBsZXQgdG9wTGVmdCA9IG92ZXJmbG93KHRvcE1pZGRsZSAtIDEsIHRvcE1pblNpemUsIHRvcE1heFNpemUsIHNpemVbMF0pO1xuICAgIGxldCB0b3BSaWdodCA9IG92ZXJmbG93KHRvcE1pZGRsZSArIDEsIHRvcE1pblNpemUsIHRvcE1heFNpemUsIHNpemVbMF0pO1xuXG4gICAgbGV0IHRoaXNNYXhTaXplID0gcm93TWF4KGksIHNpemVbMF0pO1xuICAgIGxldCB0aGlzTWluU2l6ZSA9IHRoaXNNYXhTaXplIC0gKHNpemVbMF0gLSAxKTtcblxuICAgIGxldCBsZWZ0ID0gb3ZlcmZsb3coaSAtIDEsIHRoaXNNaW5TaXplLCB0aGlzTWF4U2l6ZSwgc2l6ZVswXSk7XG4gICAgbGV0IHJpZ2h0ID0gb3ZlcmZsb3coaSArIDEsIHRoaXNNaW5TaXplLCB0aGlzTWF4U2l6ZSwgc2l6ZVswXSk7XG5cbiAgICBsZXQgYm90dG9tTWlkZGxlID0gb3ZlcmZsb3coaSArIHNpemVbMF0sIDEsIG51bWJlck9mQ2VsbHMsIG51bWJlck9mQ2VsbHMpO1xuXG4gICAgbGV0IGJvdHRvbU1heFNpemUgPSByb3dNYXgoYm90dG9tTWlkZGxlLCBzaXplWzBdKTtcbiAgICBsZXQgYm90dG9tTWluU2l6ZSA9IGJvdHRvbU1heFNpemUgLSAoc2l6ZVswXSAtIDEpO1xuXG4gICAgbGV0IGJvdHRvbUxlZnQgPSBvdmVyZmxvdyhib3R0b21NaWRkbGUgLSAxLCBib3R0b21NaW5TaXplLCBib3R0b21NYXhTaXplLCBzaXplWzBdKTtcbiAgICBsZXQgYm90dG9tUmlnaHQgPSBvdmVyZmxvdyhib3R0b21NaWRkbGUgKyAxLCBib3R0b21NaW5TaXplLCBib3R0b21NYXhTaXplLCBzaXplWzBdKTtcblxuICAgIGNlbGwubmVpZ2hib3JzLnB1c2godG9wTGVmdCk7XG4gICAgY2VsbC5uZWlnaGJvcnMucHVzaCh0b3BNaWRkbGUpO1xuICAgIGNlbGwubmVpZ2hib3JzLnB1c2godG9wUmlnaHQpO1xuICAgIGNlbGwubmVpZ2hib3JzLnB1c2gobGVmdCk7XG4gICAgY2VsbC5uZWlnaGJvcnMucHVzaChyaWdodCk7XG4gICAgY2VsbC5uZWlnaGJvcnMucHVzaChib3R0b21MZWZ0KTtcbiAgICBjZWxsLm5laWdoYm9ycy5wdXNoKGJvdHRvbU1pZGRsZSk7XG4gICAgY2VsbC5uZWlnaGJvcnMucHVzaChib3R0b21SaWdodCk7XG5cbiAgICBjZWxsc1tpXSA9IGNlbGw7XG4gIH1cblxuICByZXR1cm4gY2VsbHM7XG59O1xuXG5mdW5jdGlvbiBvdmVyZmxvdyhudW1iZXIsIG1pbiwgbWF4LCByZXNvbHZlcikge1xuICBpZiAobnVtYmVyID49IG1pbiAmJiBudW1iZXIgPD0gbWF4KSByZXR1cm4gbnVtYmVyO1xuXG4gIGlmIChudW1iZXIgPCBtaW4pIHJldHVybiBudW1iZXIgKyByZXNvbHZlcjtcbiAgaWYgKG51bWJlciA+IG1heCkgcmV0dXJuIG51bWJlciAtIHJlc29sdmVyO1xufVxuXG5mdW5jdGlvbiByb3dNYXgoY2VsbElkLCByb3dTaXplKSB7XG4gIGlmIChjZWxsSWQgJSByb3dTaXplID09PSAwKSB7XG4gICAgcmV0dXJuIGNlbGxJZDtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGxldCBpID0gY2VsbElkICsgMTsgaSA8IGNlbGxJZCArIHJvd1NpemUgKyAxOyBpKyspIHtcbiAgICAgIGlmIChpICUgcm93U2l6ZSA9PT0gMCkgcmV0dXJuIGk7XG4gICAgfVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNlbGxzLCBudW1iZXJPZkNlbGxzLCBydWxlcywga2lsbENlbGxzLCBwb3B1bGF0ZUNlbGxzKSB7XG4gIGxldCBjZWxsc1RvS2lsbCA9IFtdO1xuICBsZXQgY2VsbHNUb1BvcHVsYXRlID0gW107XG4gIGZvciAodmFyIGNlbGxJZCA9IDE7IGNlbGxJZCA8PSBudW1iZXJPZkNlbGxzOyBjZWxsSWQrKykge1xuICAgIGlmICh0eXBlb2YgY2VsbHNbIGNlbGxJZCBdICE9PSAnb2JqZWN0JykgY29udGludWU7XG5cbiAgICBsZXQgY2VsbCA9IGNlbGxzWyBjZWxsSWQgXTtcblxuICAgIGNvbnN0IG5laWdoYm9ycyA9IGNlbGwubmVpZ2hib3JzO1xuICAgIGxldCBuZWlnaGJvcnNBbGl2ZSA9IDA7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IG5laWdoYm9ycy5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IG5laWdoYm9yID0gY2VsbHNbIG5laWdoYm9yc1sgaiBdIF07XG4gICAgICBpZiAobmVpZ2hib3IuYWxpdmUpIG5laWdoYm9yc0FsaXZlKys7XG4gICAgfVxuXG4gICAgaWYgKGNlbGwuYWxpdmUgJiYgcnVsZXMubnVtc1RvRGllLmluY2x1ZGVzKG5laWdoYm9yc0FsaXZlKSkge1xuICAgICAgY2VsbHNUb0tpbGwucHVzaChjZWxsSWQpO1xuICAgIH1cbiAgICBpZiAoIWNlbGwuYWxpdmUgJiYgcnVsZXMubnVtc1RvUG9wdWxhdGUuaW5jbHVkZXMobmVpZ2hib3JzQWxpdmUpKSB7XG4gICAgICBjZWxsc1RvUG9wdWxhdGUucHVzaChjZWxsSWQpO1xuICAgIH1cbiAgfVxuICBraWxsQ2VsbHMoY2VsbHNUb0tpbGwsIHRydWUpO1xuICBwb3B1bGF0ZUNlbGxzKGNlbGxzVG9Qb3B1bGF0ZSwgdHJ1ZSk7XG59O1xuIiwiLy8gY3JlYXRlcyBhIGdsaWRlciBpbiA1MHgyNSBib2FyZFxubW9kdWxlLmV4cG9ydHMgPSBbNTI0LCA1NzUsIDYyMywgNjI0LCA2MjVdO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlkOiBmdW5jdGlvbihpZCkge1xuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gIH0sXG4gIGdldFNwZWVkTmFtZTogZnVuY3Rpb24oc3BlZWQsIHN0ZXBzKSB7XG4gICAgbGV0IHNwZWVkSW5kZXggPSBzdGVwcy5pbmRleE9mKHNwZWVkKTtcbiAgICBzd2l0Y2ggKHNwZWVkSW5kZXgpIHtcbiAgICAgIGNhc2UgMDoge1xuICAgICAgICByZXR1cm4gJ1Nsb3cnO1xuICAgICAgfVxuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIHJldHVybiAnTm9ybWFsJztcbiAgICAgIH1cbiAgICAgIGNhc2UgMjoge1xuICAgICAgICByZXR1cm4gJ0Zhc3QnO1xuICAgICAgfVxuICAgICAgY2FzZSAzOiB7XG4gICAgICAgIHJldHVybiAnVmVyeSBGYXN0JztcbiAgICAgIH1cbiAgICAgIGNhc2UgNDoge1xuICAgICAgICByZXR1cm4gJ0xpZ2h0bmluZyc7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuIl19
