# focus-group

[![Build Status](https://travis-ci.org/davidtheclark/focus-group.svg?branch=master)](https://travis-ci.org/davidtheclark/focus-group)
[![Coverage Status](https://coveralls.io/repos/github/davidtheclark/focus-group/badge.svg?branch=master)](https://coveralls.io/github/davidtheclark/focus-group?branch=master)

Create a group of nodes with special focus-related powers.

Specifically, you can do the following with your focus group:

- Use arrow keys to move focus through the nodes
- Use letter keys to jump focus to a specific node

These kinds of powers are useful for:

- Accessible menus, like [react-aria-menubutton](//github.com/davidtheclark/react-aria-menubutton)
- Any other widgets whose keyboard UX will improve by enabling arrow-key navigation and letter-key jumping

## API

### var focusGroup = createFocusGroup([options])

This is the function you get when you `require()` the module (or `import`).

```js
var createFocusGroup = require('focus-group');
var myMegaMenuFocusGroup = createFocusGroup();
```

#### Options

**nodes** { Array of DOM nodes }: Nodes for the group. You can omit this option and add nodes later with `addNode()` or `setNodes()`. Default: `[]`.

**forwardArrows** { Array of `'up'`, `'down'`, `'left'`, or `'right'` }: Specify which arrows should move the focus *forward* through the group (e.g. from index 2 to index 3). Default: `[ 'down' ]`

**backArrows** { Array of `'up'`, `'down'`, `'left'`, or `'right'` }: Specify which arrows should move the focus *back* through the group (e.g. from index 4 to index 3). Default: `[ 'up' ]`

**wrap** { Boolean }: If `true`, when the arrow keys are moving focus they will wrap around the group. That is, when focus is on the last item and you move focus forward, the first item will focus; and when focus is on the first item and you move focus back, the last item will focus.

**letterNavigation** { Boolean }: If `true`, letter navigation is enabled (see below). Default: `false`.

### focusGroup.activate()

Begin listening to keyboard events and responding accordingly.

If another focus group is already active, that prior group will be deactivated before the new group is activated. It only makes sense to have one active focus group at a time.

Returns the focus group instance.

### focusGroup.deactivate()

Stop listening to keyboard events.

Returns the focus group instance.

### focusGroup.addNode(node)

Adds a node to the end of the group.

Returns the focus group instance.

### focusGroup.removeNode(node)

Remove a node from the group.

Returns the focus group instance.

### focusGroup.clearNodes()

Empty the focus group of nodes.

Returns the focus group instance.

### focusGroup.setNodes(nodes)

Set an array of nodes to be the focus group's constituents.

Returns the focus group instance.

### focusGroup.getNodes()

Returns the focus group's current node array.

### focusGroup.focusNodeAtIndex(index)

Focuses the node at a particular index in the focus group's node array.

If no node exists at that index, does nothing.

Returns the focus group instance.

### focusGroup.moveFocusForward()

Moves the focus forward one node, if focus is already within the group.

If focus is not within the group, does nothing.

Returns the index of the newly focused node.

### focusGroup.moveFocusBack()

Moves the focus back one node, if focus is already within the group.

If focus is not within the group, does nothing.

Returns the index of the newly focused node.

## Contributing

Please note that this project is released with a Contributor Code of Conduct.
By participating in this project you agree to abide by its terms.
