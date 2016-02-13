var createFocusGroup = require('..');

var stateNodes = [].slice.call(document.querySelectorAll('.state'));
createFocusGroup({
	members: stateNodes,
	stringSearch: true,
}).activate();

var wraNodes = document.querySelectorAll('.wra');
createFocusGroup({
	members: wraNodes,
	stringSearch: true,
	forwardArrows: ['right', 'down'],
	backArrows: ['left', 'up'],
	wrap: true,
}).activate();
