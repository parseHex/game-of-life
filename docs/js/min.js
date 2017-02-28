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
    if (!cell.alive) return;

    cell.lastAlive = true;
    cell.alive = false;
  }

  if (!noAnimate) animateCurrentTick(cells, numberOfCells);
}
function populateCells(cellIds, noAnimate) {
  for (var i = 0; i < cellIds.length; i++) {
    var cell = cells[cellIds[i]];
    if (cell.alive) return;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQXBwLmpzIiwic3JjL2pzL2FuaW1hdGVDdXJyZW50VGljay5qcyIsInNyYy9qcy9kcmF3Q2VsbHMuanMiLCJzcmMvanMvZ2VuZXJhdGVDZWxscy5qcyIsInNyYy9qcy9wcm9jZXNzQ2VsbHMuanMiLCJzcmMvanMvc3RhcnRlckNlbGxzLmpzIiwic3JjL2pzL3V0aWxpdHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sZ0JBQWdCLFFBQVEsb0JBQVIsQ0FBdEI7QUFDQSxJQUFNLFlBQVksUUFBUSxnQkFBUixDQUFsQjtBQUNBLElBQU0scUJBQXFCLFFBQVEseUJBQVIsQ0FBM0I7QUFDQSxJQUFNLGVBQWUsUUFBUSxtQkFBUixDQUFyQjtBQUNBLElBQU0sT0FBTyxRQUFRLGNBQVIsQ0FBYjs7QUFFQSxJQUFNLGFBQWEsQ0FDakIsR0FEaUIsRUFDWjtBQUNMLEdBRmlCLEVBRVo7QUFDTCxFQUhpQixFQUdaO0FBQ0wsRUFKaUIsRUFJWjtBQUNMLENBTGlCLENBS1o7QUFMWSxDQUFuQjs7QUFRQSxJQUFJLFdBQVc7QUFDYixhQUFXLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FERTtBQUViLFNBQU87QUFDTCxvQkFBZ0IsQ0FBQyxDQUFELENBRFg7QUFFTCxtQkFBZSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRlY7QUFHTCxlQUFXLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkI7QUFITixHQUZNO0FBT2IsU0FBTztBQVBNLENBQWY7QUFTQSxJQUFJLFFBQVE7QUFDVixVQUFRLElBREU7QUFFVixZQUFVLEtBRkE7QUFHVixlQUFhLEtBSEg7QUFJVixrQkFBZ0I7QUFKTixDQUFaO0FBTUEsSUFBSSxRQUFRLEVBQVo7QUFDQSxJQUFJLGdCQUFnQixTQUFTLFNBQVQsQ0FB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QUFPLFdBQVA7QUFDRDtBQUNELFdBQUssQ0FBTDtBQUFRO0FBQ04saUJBQU8sV0FBUDtBQUNEO0FBZkg7QUFpQkQ7QUF2QmMsQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgZ2VuZXJhdGVDZWxscyA9IHJlcXVpcmUoJy4vZ2VuZXJhdGVDZWxscy5qcycpO1xuY29uc3QgZHJhd0NlbGxzID0gcmVxdWlyZSgnLi9kcmF3Q2VsbHMuanMnKTtcbmNvbnN0IGFuaW1hdGVDdXJyZW50VGljayA9IHJlcXVpcmUoJy4vYW5pbWF0ZUN1cnJlbnRUaWNrLmpzJyk7XG5jb25zdCBwcm9jZXNzQ2VsbHMgPSByZXF1aXJlKCcuL3Byb2Nlc3NDZWxscy5qcycpO1xuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbGl0eS5qcycpO1xuXG5jb25zdCBTcGVlZFN0ZXBzID0gW1xuICA1MDAsIC8vIFNsb3dcbiAgMjAwLCAvLyBOb3JtYWxcbiAgNTAsICAvLyBGYXN0XG4gIDEwLCAgLy8gVmVyeSBGYXN0XG4gIDUgICAgLy8gTGlnaHRuaW5nXG5dO1xuXG5sZXQgc2V0dGluZ3MgPSB7XG4gIGJvYXJkU2l6ZTogWzUwLCAyNV0sXG4gIHJ1bGVzOiB7XG4gICAgbnVtc1RvUG9wdWxhdGU6IFszXSxcbiAgICBudW1zVG9TdXJ2aXZlOiBbMiwgM10sXG4gICAgbnVtc1RvRGllOiBbMCwgMSwgNCwgNSwgNiwgNywgOF1cbiAgfSxcbiAgc3BlZWQ6IDIwMFxufTtcbmxldCBzdGF0ZSA9IHtcbiAgcGF1c2VkOiB0cnVlLFxuICBjbGlja2luZzogZmFsc2UsXG4gIGNsaWNrQWRkaW5nOiBmYWxzZSxcbiAgYW5pbWF0aW9uRnJhbWU6IG51bGxcbn07XG5sZXQgY2VsbHMgPSB7fTtcbmxldCBudW1iZXJPZkNlbGxzID0gc2V0dGluZ3MuYm9hcmRTaXplWzBdICogc2V0dGluZ3MuYm9hcmRTaXplWzFdO1xuXG4vLyBDZWxsIE1hbmFnZW1lbnRcbmZ1bmN0aW9uIGtpbGxDZWxscyhjZWxsSWRzLCBub0FuaW1hdGUpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjZWxsSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNlbGwgPSBjZWxsc1sgY2VsbElkc1sgaSBdIF07XG4gICAgaWYgKCFjZWxsLmFsaXZlKSByZXR1cm47XG5cbiAgICBjZWxsLmxhc3RBbGl2ZSA9IHRydWU7XG4gICAgY2VsbC5hbGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKCFub0FuaW1hdGUpIGFuaW1hdGVDdXJyZW50VGljayhjZWxscywgbnVtYmVyT2ZDZWxscyk7XG59XG5mdW5jdGlvbiBwb3B1bGF0ZUNlbGxzKGNlbGxJZHMsIG5vQW5pbWF0ZSkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNlbGxJZHMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY2VsbCA9IGNlbGxzWyBjZWxsSWRzIFsgaSBdIF07XG4gICAgaWYgKGNlbGwuYWxpdmUpIHJldHVybjtcblxuICAgIGNlbGwubGFzdEFsaXZlID0gZmFsc2U7XG4gICAgY2VsbC5hbGl2ZSA9IHRydWU7XG4gIH1cblxuICBpZiAoIW5vQW5pbWF0ZSkgYW5pbWF0ZUN1cnJlbnRUaWNrKGNlbGxzLCBudW1iZXJPZkNlbGxzKTtcbn1cblxuLy8gQm9hcmQgRXZlbnQgSGFuZGxlcnNcbmZ1bmN0aW9uIGhhbmRsZUNlbGxDbGljayhldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGxldCBjZWxsSWQgPSArZXZlbnQudGFyZ2V0LmlkLnN1YnN0cigxKTtcbiAgbGV0IGFsaXZlID0gIWNlbGxzWyBjZWxsSWQgXS5hbGl2ZTtcblxuICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSByZXR1cm4ga2lsbENlbGxzKCBbIGNlbGxJZCBdICk7XG5cbiAgaWYgKGFsaXZlKSB7XG4gICAgcG9wdWxhdGVDZWxscyggWyBjZWxsSWQgXSApO1xuICB9IGVsc2Uge1xuICAgIGtpbGxDZWxscyggWyBjZWxsSWQgXSApO1xuICB9XG59XG5mdW5jdGlvbiBoYW5kbGVDZWxsTW91c2VFbnRlcihldmVudCkge1xuICBpZiAoIXN0YXRlLmNsaWNraW5nKSByZXR1cm47XG5cbiAgbGV0IGNlbGxJZCA9ICtldmVudC50YXJnZXQuaWQuc3Vic3RyKDEpO1xuXG4gIGlmIChzdGF0ZS5jbGlja0FkZGluZykge1xuICAgIHBvcHVsYXRlQ2VsbHMoIFsgY2VsbElkIF0gKTtcbiAgfSBlbHNlIHtcbiAgICBraWxsQ2VsbHMoIFsgY2VsbElkIF0gKTtcbiAgfVxufVxuZnVuY3Rpb24gaGFuZGxlQm9hcmRNb3VzZVVwKGV2ZW50KSB7XG4gIGlmIChldmVudC5idXR0b24gPT09IDEpIHJldHVybjsgLy8gbWlkZGxlIGJ1dHRvblxuXG4gIHN0YXRlLmNsaWNraW5nID0gZmFsc2U7XG4gIHN0YXRlLmNsaWNrQWRkaW5nID0gZmFsc2U7XG5cbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn1cbmZ1bmN0aW9uIGhhbmRsZUJvYXJkTW91c2VEb3duKGV2ZW50KSB7XG4gIGlmIChldmVudC5idXR0b24gPT09IDEpIHJldHVybjsgLy8gbWlkZGxlIGJ1dHRvblxuXG4gIHN0YXRlLmNsaWNraW5nID0gdHJ1ZTtcbiAgc3RhdGUuY2xpY2tBZGRpbmcgPSBldmVudC5idXR0b24gPT09IDA7XG5cbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn1cblxuLy8gVGltZSBDb250cm9sc1xuZnVuY3Rpb24gbmV4dFRpY2soKSB7XG4gIHByb2Nlc3NDZWxscyhjZWxscywgbnVtYmVyT2ZDZWxscywgc2V0dGluZ3MucnVsZXMsIGtpbGxDZWxscywgcG9wdWxhdGVDZWxscyk7XG4gIGFuaW1hdGVDdXJyZW50VGljayhjZWxscywgbnVtYmVyT2ZDZWxscyk7XG59XG5mdW5jdGlvbiBmb3J3YXJkKCkge1xuICBzdG9wKCk7XG4gIG5leHRUaWNrKCk7XG59XG5mdW5jdGlvbiBzdGFydCgpIHtcbiAgaWYgKCFzdGF0ZS5wYXVzZWQpIHJldHVybjtcbiAgdXRpbC5pZCgncGxheUJ1dHRvbicpLnRleHRDb250ZW50ID0gJ1BhdXNlJztcblxuICBzdGF0ZS5wYXVzZWQgPSBmYWxzZTtcblxuICBsZXQgdGltZUNvdW50ID0gMDtcbiAgbGV0IGxhc3RSdW4gPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgZnVuY3Rpb24gYW5pbWF0aW9uRnJhbWVGdW5jdGlvbigpIHtcbiAgICBsZXQgdGhpc1J1biA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGxldCB0aW1lID0gdGhpc1J1biAtIGxhc3RSdW47XG4gICAgdGltZUNvdW50ICs9IHRpbWU7XG4gICAgbGFzdFJ1biA9IHRoaXNSdW47XG5cbiAgICBpZiAodGltZUNvdW50ID49IHNldHRpbmdzLnNwZWVkKSB7XG4gICAgICB0aW1lQ291bnQgPSAwOyAvLyB3aWxsIHJ1biB0aGlzIHRpbWUsIHJlc2V0IGNvdW50IGJhY2sgdG8gemVyb1xuXG4gICAgICBuZXh0VGljaygpO1xuICAgIH1cbiAgICBzZXR0aW5ncy5hbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRpb25GcmFtZUZ1bmN0aW9uKTtcbiAgfVxuICBzZXR0aW5ncy5hbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRpb25GcmFtZUZ1bmN0aW9uKTtcbn1cbmZ1bmN0aW9uIHN0b3AoKSB7XG4gIGlmIChzdGF0ZS5wYXVzZWQpIHJldHVybjtcbiAgdXRpbC5pZCgncGxheUJ1dHRvbicpLnRleHRDb250ZW50ID0gJ1BsYXknO1xuXG4gIHN0YXRlLnBhdXNlZCA9IHRydWU7XG5cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2V0dGluZ3MuYW5pbWF0aW9uRnJhbWUpO1xufVxuXG4vLyBTcGVlZCBNb2RpZmllcnNcbmZ1bmN0aW9uIGRlY3JlYXNlU3BlZWQoKSB7XG4gIGxldCBjdXJyZW50U3BlZWRJbmRleCA9IFNwZWVkU3RlcHMuaW5kZXhPZihzZXR0aW5ncy5zcGVlZCk7XG4gIGlmICh0eXBlb2YgU3BlZWRTdGVwc1sgY3VycmVudFNwZWVkSW5kZXggLSAxIF0gPT09ICd1bmRlZmluZWQnKSByZXR1cm47XG5cbiAgc2V0dGluZ3Muc3BlZWQgPSBTcGVlZFN0ZXBzWyBjdXJyZW50U3BlZWRJbmRleCAtIDEgXTtcblxuICB1dGlsLmlkKCdnYW1lU3BlZWQnKS52YWx1ZSA9IHV0aWwuZ2V0U3BlZWROYW1lKHNldHRpbmdzLnNwZWVkLCBTcGVlZFN0ZXBzKTtcbn1cbmZ1bmN0aW9uIGluY3JlYXNlU3BlZWQoKSB7XG4gIGxldCBjdXJyZW50U3BlZWRJbmRleCA9IFNwZWVkU3RlcHMuaW5kZXhPZihzZXR0aW5ncy5zcGVlZCk7XG4gIGlmICh0eXBlb2YgU3BlZWRTdGVwc1sgY3VycmVudFNwZWVkSW5kZXggKyAxIF0gPT09ICd1bmRlZmluZWQnKSByZXR1cm47XG5cbiAgc2V0dGluZ3Muc3BlZWQgPSBTcGVlZFN0ZXBzWyBjdXJyZW50U3BlZWRJbmRleCArIDEgXTtcblxuICB1dGlsLmlkKCdnYW1lU3BlZWQnKS52YWx1ZSA9IHV0aWwuZ2V0U3BlZWROYW1lKHNldHRpbmdzLnNwZWVkLCBTcGVlZFN0ZXBzKTtcbn1cblxuLy8gaHR0cDovL2JlZWtlci5pby9qcXVlcnktZG9jdW1lbnQtcmVhZHktZXF1aXZhbGVudC12YW5pbGxhLWphdmFzY3JpcHRcbnZhciBkb21SZWFkeSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2ludGVyYWN0aXZlJyB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnID8gY2FsbGJhY2soKSA6IGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBjYWxsYmFjayk7XG59O1xuXG5kb21SZWFkeShmdW5jdGlvbigpIHtcbiAgY2VsbHMgPSBnZW5lcmF0ZUNlbGxzKHNldHRpbmdzLmJvYXJkU2l6ZSk7XG4gIGRyYXdDZWxscyhjZWxscyxcbiAgICAgICAgICAgIHNldHRpbmdzLmJvYXJkU2l6ZSxcbiAgICAgICAgICAgIGhhbmRsZUNlbGxDbGljayxcbiAgICAgICAgICAgIGhhbmRsZUNlbGxNb3VzZUVudGVyLFxuICAgICAgICAgICAgaGFuZGxlQm9hcmRNb3VzZVVwLFxuICAgICAgICAgICAgaGFuZGxlQm9hcmRNb3VzZURvd25cbiAgKTtcbiAgYW5pbWF0ZUN1cnJlbnRUaWNrKGNlbGxzLCBudW1iZXJPZkNlbGxzKTtcblxuICB1dGlsLmlkKCdwbGF5QnV0dG9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoc3RhdGUucGF1c2VkKSB7XG4gICAgICBzdGFydCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdG9wKCk7XG4gICAgfVxuICB9KTtcbiAgdXRpbC5pZCgnZm9yd2FyZEJ1dHRvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZm9yd2FyZCk7XG5cbiAgdXRpbC5pZCgnZGVjcmVhc2VTcGVlZCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGVjcmVhc2VTcGVlZCk7XG4gIHV0aWwuaWQoJ2luY3JlYXNlU3BlZWQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGluY3JlYXNlU3BlZWQpO1xufSk7XG4iLCJjb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsaXR5LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY2VsbHMsIG51bWJlck9mQ2VsbHMpIHtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPD0gbnVtYmVyT2ZDZWxsczsgaSsrKSB7XG4gICAgbGV0IGNlbGwgPSBjZWxsc1tpXTtcbiAgICBpZiAoY2VsbC5sYXN0QWxpdmUgPT09IGNlbGwuYWxpdmUpIGNvbnRpbnVlO1xuXG4gICAgdXRpbC5pZCgnYycgKyBpKS5jbGFzc05hbWUgPSBjZWxsLmFsaXZlID8gJ2NlbGwgYWxpdmUnIDogJ2NlbGwnO1xuICB9XG59O1xuIiwiY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbGl0eS5qcycpO1xuY29uc3QgYm9hcmRFbGVtZW50ID0gdXRpbC5pZCgnYm9hcmQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjZWxscywgYm9hcmRTaXplLCBoYW5kbGVDbGljaywgaGFuZGxlTW91c2VFbnRlciwgaGFuZGxlTW91c2VVcCwgaGFuZGxlTW91c2VEb3duKSB7XG4gIGxldCByb3dTaXplID0gYm9hcmRTaXplWzBdO1xuICBsZXQgY29sdW1uU2l6ZSA9IGJvYXJkU2l6ZVsxXTtcblxuICB2YXIgY2VsbElkID0gMTtcbiAgbGV0IGJvYXJkRnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgLy8gbG9vcCB0aHJvdWdoIHRoZSBjb2x1bW5TaXplIHRvIGdlbmVyYXRlIGVhY2ggcm93XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1uU2l6ZTsgaSsrKSB7XG4gICAgLy8gY3JlYXRlIHRoZSBjZWxscyBmb3IgdGhpcyByb3dcblxuICAgIGxldCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByb3cuY2xhc3NOYW1lID0gJ2NlbGxSb3cnO1xuXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dTaXplOyBqKyssIGNlbGxJZCsrKSB7XG4gICAgICBsZXQgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgY2VsbC5jbGFzc05hbWUgPSAnY2VsbCc7XG4gICAgICBjZWxsLmlkID0gJ2MnICsgY2VsbElkO1xuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNsaWNrKTtcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBoYW5kbGVDbGljayk7XG4gICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBoYW5kbGVNb3VzZUVudGVyKTtcblxuICAgICAgcm93LmFwcGVuZENoaWxkKGNlbGwpO1xuICAgIH1cbiAgICBib2FyZEZyYWdtZW50LmFwcGVuZENoaWxkKHJvdyk7XG4gIH1cblxuICBib2FyZEVsZW1lbnQuYXBwZW5kQ2hpbGQoYm9hcmRGcmFnbWVudCk7XG4gIGJvYXJkRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBoYW5kbGVNb3VzZURvd24pO1xuICBib2FyZEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGhhbmRsZU1vdXNlVXApO1xufTtcbiIsImNvbnN0IHN0YXJ0ZXJDZWxscyA9IHJlcXVpcmUoJy4vc3RhcnRlckNlbGxzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2l6ZSkge1xuICBsZXQgbnVtYmVyT2ZDZWxscyA9IHNpemVbMF0gKiBzaXplWzFdO1xuICBsZXQgY2VsbHMgPSB7fTtcblxuICBmb3IgKGxldCBpID0gMTsgaSA8PSBudW1iZXJPZkNlbGxzOyBpKyspIHtcbiAgICBsZXQgY2VsbCA9IHtcbiAgICAgIGFsaXZlOiBmYWxzZSxcbiAgICAgIGxhc3RBbGl2ZTogZmFsc2UsXG4gICAgICBuZWlnaGJvcnM6IFtdXG4gICAgfTtcbiAgICBpZiAoc3RhcnRlckNlbGxzLmluY2x1ZGVzKGkpKSBjZWxsLmFsaXZlID0gdHJ1ZTtcblxuICAgIGxldCB0b3BNaWRkbGUgPSBvdmVyZmxvdyhpIC0gc2l6ZVswXSwgMSwgbnVtYmVyT2ZDZWxscywgbnVtYmVyT2ZDZWxscyk7XG5cbiAgICBsZXQgdG9wTWF4U2l6ZSA9IHJvd01heCh0b3BNaWRkbGUsIHNpemVbMF0pO1xuICAgIGxldCB0b3BNaW5TaXplID0gdG9wTWF4U2l6ZSAtIChzaXplWzBdIC0gMSk7XG5cbiAgICBsZXQgdG9wTGVmdCA9IG92ZXJmbG93KHRvcE1pZGRsZSAtIDEsIHRvcE1pblNpemUsIHRvcE1heFNpemUsIHNpemVbMF0pO1xuICAgIGxldCB0b3BSaWdodCA9IG92ZXJmbG93KHRvcE1pZGRsZSArIDEsIHRvcE1pblNpemUsIHRvcE1heFNpemUsIHNpemVbMF0pO1xuXG4gICAgbGV0IHRoaXNNYXhTaXplID0gcm93TWF4KGksIHNpemVbMF0pO1xuICAgIGxldCB0aGlzTWluU2l6ZSA9IHRoaXNNYXhTaXplIC0gKHNpemVbMF0gLSAxKTtcblxuICAgIGxldCBsZWZ0ID0gb3ZlcmZsb3coaSAtIDEsIHRoaXNNaW5TaXplLCB0aGlzTWF4U2l6ZSwgc2l6ZVswXSk7XG4gICAgbGV0IHJpZ2h0ID0gb3ZlcmZsb3coaSArIDEsIHRoaXNNaW5TaXplLCB0aGlzTWF4U2l6ZSwgc2l6ZVswXSk7XG5cbiAgICBsZXQgYm90dG9tTWlkZGxlID0gb3ZlcmZsb3coaSArIHNpemVbMF0sIDEsIG51bWJlck9mQ2VsbHMsIG51bWJlck9mQ2VsbHMpO1xuXG4gICAgbGV0IGJvdHRvbU1heFNpemUgPSByb3dNYXgoYm90dG9tTWlkZGxlLCBzaXplWzBdKTtcbiAgICBsZXQgYm90dG9tTWluU2l6ZSA9IGJvdHRvbU1heFNpemUgLSAoc2l6ZVswXSAtIDEpO1xuXG4gICAgbGV0IGJvdHRvbUxlZnQgPSBvdmVyZmxvdyhib3R0b21NaWRkbGUgLSAxLCBib3R0b21NaW5TaXplLCBib3R0b21NYXhTaXplLCBzaXplWzBdKTtcbiAgICBsZXQgYm90dG9tUmlnaHQgPSBvdmVyZmxvdyhib3R0b21NaWRkbGUgKyAxLCBib3R0b21NaW5TaXplLCBib3R0b21NYXhTaXplLCBzaXplWzBdKTtcblxuICAgIGNlbGwubmVpZ2hib3JzLnB1c2godG9wTGVmdCk7XG4gICAgY2VsbC5uZWlnaGJvcnMucHVzaCh0b3BNaWRkbGUpO1xuICAgIGNlbGwubmVpZ2hib3JzLnB1c2godG9wUmlnaHQpO1xuICAgIGNlbGwubmVpZ2hib3JzLnB1c2gobGVmdCk7XG4gICAgY2VsbC5uZWlnaGJvcnMucHVzaChyaWdodCk7XG4gICAgY2VsbC5uZWlnaGJvcnMucHVzaChib3R0b21MZWZ0KTtcbiAgICBjZWxsLm5laWdoYm9ycy5wdXNoKGJvdHRvbU1pZGRsZSk7XG4gICAgY2VsbC5uZWlnaGJvcnMucHVzaChib3R0b21SaWdodCk7XG5cbiAgICBjZWxsc1tpXSA9IGNlbGw7XG4gIH1cblxuICByZXR1cm4gY2VsbHM7XG59O1xuXG5mdW5jdGlvbiBvdmVyZmxvdyhudW1iZXIsIG1pbiwgbWF4LCByZXNvbHZlcikge1xuICBpZiAobnVtYmVyID49IG1pbiAmJiBudW1iZXIgPD0gbWF4KSByZXR1cm4gbnVtYmVyO1xuXG4gIGlmIChudW1iZXIgPCBtaW4pIHJldHVybiBudW1iZXIgKyByZXNvbHZlcjtcbiAgaWYgKG51bWJlciA+IG1heCkgcmV0dXJuIG51bWJlciAtIHJlc29sdmVyO1xufVxuXG5mdW5jdGlvbiByb3dNYXgoY2VsbElkLCByb3dTaXplKSB7XG4gIGlmIChjZWxsSWQgJSByb3dTaXplID09PSAwKSB7XG4gICAgcmV0dXJuIGNlbGxJZDtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGxldCBpID0gY2VsbElkICsgMTsgaSA8IGNlbGxJZCArIHJvd1NpemUgKyAxOyBpKyspIHtcbiAgICAgIGlmIChpICUgcm93U2l6ZSA9PT0gMCkgcmV0dXJuIGk7XG4gICAgfVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNlbGxzLCBudW1iZXJPZkNlbGxzLCBydWxlcywga2lsbENlbGxzLCBwb3B1bGF0ZUNlbGxzKSB7XG4gIGxldCBjZWxsc1RvS2lsbCA9IFtdO1xuICBsZXQgY2VsbHNUb1BvcHVsYXRlID0gW107XG4gIGZvciAodmFyIGNlbGxJZCA9IDE7IGNlbGxJZCA8PSBudW1iZXJPZkNlbGxzOyBjZWxsSWQrKykge1xuICAgIGlmICh0eXBlb2YgY2VsbHNbIGNlbGxJZCBdICE9PSAnb2JqZWN0JykgY29udGludWU7XG5cbiAgICBsZXQgY2VsbCA9IGNlbGxzWyBjZWxsSWQgXTtcblxuICAgIGNvbnN0IG5laWdoYm9ycyA9IGNlbGwubmVpZ2hib3JzO1xuICAgIGxldCBuZWlnaGJvcnNBbGl2ZSA9IDA7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IG5laWdoYm9ycy5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IG5laWdoYm9yID0gY2VsbHNbIG5laWdoYm9yc1sgaiBdIF07XG4gICAgICBpZiAobmVpZ2hib3IuYWxpdmUpIG5laWdoYm9yc0FsaXZlKys7XG4gICAgfVxuXG4gICAgaWYgKGNlbGwuYWxpdmUgJiYgcnVsZXMubnVtc1RvRGllLmluY2x1ZGVzKG5laWdoYm9yc0FsaXZlKSkge1xuICAgICAgY2VsbHNUb0tpbGwucHVzaChjZWxsSWQpO1xuICAgIH1cbiAgICBpZiAoIWNlbGwuYWxpdmUgJiYgcnVsZXMubnVtc1RvUG9wdWxhdGUuaW5jbHVkZXMobmVpZ2hib3JzQWxpdmUpKSB7XG4gICAgICBjZWxsc1RvUG9wdWxhdGUucHVzaChjZWxsSWQpO1xuICAgIH1cbiAgfVxuICBraWxsQ2VsbHMoY2VsbHNUb0tpbGwsIHRydWUpO1xuICBwb3B1bGF0ZUNlbGxzKGNlbGxzVG9Qb3B1bGF0ZSwgdHJ1ZSk7XG59O1xuIiwiLy8gY3JlYXRlcyBhIGdsaWRlciBpbiA1MHgyNSBib2FyZFxubW9kdWxlLmV4cG9ydHMgPSBbNTI0LCA1NzUsIDYyMywgNjI0LCA2MjVdO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlkOiBmdW5jdGlvbihpZCkge1xuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gIH0sXG4gIGdldFNwZWVkTmFtZTogZnVuY3Rpb24oc3BlZWQsIHN0ZXBzKSB7XG4gICAgbGV0IHNwZWVkSW5kZXggPSBzdGVwcy5pbmRleE9mKHNwZWVkKTtcbiAgICBzd2l0Y2ggKHNwZWVkSW5kZXgpIHtcbiAgICAgIGNhc2UgMDoge1xuICAgICAgICByZXR1cm4gJ1Nsb3cnO1xuICAgICAgfVxuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIHJldHVybiAnTm9ybWFsJztcbiAgICAgIH1cbiAgICAgIGNhc2UgMjoge1xuICAgICAgICByZXR1cm4gJ0Zhc3QnO1xuICAgICAgfVxuICAgICAgY2FzZSAzOiB7XG4gICAgICAgIHJldHVybiAnVmVyeSBGYXN0JztcbiAgICAgIH1cbiAgICAgIGNhc2UgNDoge1xuICAgICAgICByZXR1cm4gJ0xpZ2h0bmluZyc7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuIl19
