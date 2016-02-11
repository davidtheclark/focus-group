var createFocusGroup = require('..');

var stateNodes = [].slice.call(document.querySelectorAll('.state'));

var stateFocusGroup = createFocusGroup({
	nodes: stateNodes,
	letterNavigation: true,
});
stateFocusGroup.activate();
