import * as util from './utility';

export default function (cells, numberOfCells) {
	for (var i = 1; i <= numberOfCells; i++) {
		let cell = cells[i];
		if (cell.lastAlive === cell.alive) continue;

		util.id('c' + i).className = cell.alive ? 'cell alive' : 'cell';
	}
}
