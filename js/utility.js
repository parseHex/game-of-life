export function id(elId) {
	return document.getElementById(elId);
}
export function getSpeedName(speed, steps) {
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
		case 4: {
			return 'Lightning';
		}
	}
}
export function domReady(callback) {
	// http://beeker.io/jquery-document-ready-equivalent-vanilla-javascript
	if (document.readyState === 'interactive' || document.readyState === 'complete') {
		callback();
	} else {
		document.addEventListener('DOMContentLoaded', callback);
	}
}
