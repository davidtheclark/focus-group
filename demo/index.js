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
		next: [{ keyCode: 40 }, { keyCode: 39 }],
		prev: [{ keyCode: 38 }, { keyCode: 37 }],
		first: { keyCode: 36, ctrlKey: true },
		last: { keyCode: 35, ctrlKey: true }
	},
	wrap: true,
}).activate();
