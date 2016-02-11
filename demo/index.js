var createFocusGroup = require('..');

var stateNodes = [].slice.call(document.querySelectorAll('.state'));

var stateFocusGroup = createFocusGroup({
	members: stateNodes,
	stringSearch: true,
});
stateFocusGroup.activate();
