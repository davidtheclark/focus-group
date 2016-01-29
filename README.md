# focus-group

Create a group of nodes with special focusing powers

## Planned Features

- Given an array of nodes, move focus through that group with arrows keys.
  - Designate which arrows keys move in which direction through the array.
    By default, down moves forward and up moves backward. Right and left
    can also get involved.
- Move focus through the group by typing letters. If the letter typed
  matches the first letter of a node's text (or a `data-focus-group-text`
  attribute value), focus on that node. Nodes are matched in a
  cyclic way:
    - If focus is already within the group, start on the node after
      the currently focused node, move to the end of the list,
      start again at the beginning, end at the currently focused node.
    - If focus is not in the group (because user used `moveFocusByLetter`
      manually: this movement was not triggered by a keyboard event),
      start the first node and move on until the last.
- Only handle keyboard events like the above when focus is already
  within the group.
- Provide functions in the API allowing manual movement of focus:
  - `moveFocusForward`
  - `moveFocusBack`
  - `moveFocusByLetter`
  - `focusNodeAtIndex`
- Add, remove, clear, and set the node array at whim.
- Allow focus to either cycle through the list or stop at the
  start and finish of the array.

## Contributing

Please note that this project is released with a Contributor Code of Conduct.
By participating in this project you agree to abide by its terms.
