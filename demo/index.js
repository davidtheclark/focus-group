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
	keybindings: {
		next: [{ keyCode: 40 }, { keyCode: 34 }],
		prev: [{ keyCode: 38 }, { keyCode: 33 }],
		first: { keyCode: 36, modifier: 'ctrlKey' },
		last: { keyCode: 35, modifier: 'ctrlKey' }
	},
	wrap: true,
}).activate();
