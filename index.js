function FocusGroup(options) {
  options = options || {};
  this._settings = {
    forwardArrows: options.forwardArrows || ['down'],
    backArrows: options.backArrows || ['up'],
    letterNavigation: options.letterNavigation,
    cycle: options.cycle,
  };
  this._nodes = [];
  if (options.nodes) this.setNodes(options.nodes);
  this._handleKeydownEvent = this.handleKeydownEvent.bind(this);
}

FocusGroup.activeGroup = null;

FocusGroup.prototype._getActiveNodeIndex = function() {
  return this._nodes.indexOf(document.activeElement);
}

FocusGroup.prototype.activate = function() {
  if (FocusGroup.activeGroup) FocusGroup.activeGroup.deactivate();
  FocusGroup.activeGroup = this;
  document.addEventListener('keydown', this._handleKeydownEvent, true);
  return this;
};

FocusGroup.prototype.deactivate = function() {
  FocusGroup.activeGroup = null;
  document.removeEventListener('keydown', this._handleKeydownEvent, true);
  return this;
};

FocusGroup.prototype.handleKeydownEvent = function(event) {
  // We should only respond to keyboard events when
  // focus is already within the focus-group
  var activeNodeIndex = this._getActiveNodeIndex();
  if (activeNodeIndex === -1) return;

  var arrow = getEventArrowKey(event);

  if (!arrow) {
    this._moveFocusByLetter(event);
    return;
  }

  if (this._settings.forwardArrows.indexOf(arrow) !== -1) {
    event.preventDefault();
    this.moveFocusForward(activeNodeIndex);
    return;
  }

  if (this._settings.backArrows.indexOf(arrow) !== -1) {
    event.preventDefault();
    this.moveFocusBack(activeNodeIndex);
    return;
  }
};

FocusGroup.prototype.moveFocusForward = function() {
  var activeNodeIndex = this._getActiveNodeIndex();
  var targetNodeIndex;
  if (activeNodeIndex < this._nodes.length - 1) {
    targetNodeIndex = activeNodeIndex + 1;
  } else if (this._settings.cycle) {
    targetNodeIndex = 0;
  } else {
    targetNodeIndex = activeNodeIndex;
  }
  this.focusNodeAtIndex(targetNodeIndex);
  return targetNodeIndex;
};

FocusGroup.prototype.moveFocusBack = function() {
  var activeNodeIndex = this._getActiveNodeIndex();
  var targetNodeIndex;
  if (activeNodeIndex > 0) {
    targetNodeIndex = activeNodeIndex - 1;
  } else if (this._settings.cycle) {
    targetNodeIndex = this._nodes.length - 1;
  } else {
    targetNodeIndex = activeNodeIndex;
  }
  this.focusNodeAtIndex(targetNodeIndex);
  return targetNodeIndex;
};

FocusGroup.prototype._moveFocusByLetter = function(event) {
  if (!isLetterKeyCode(event.keyCode)) return -1;

  // If the letter key is part of a key combo,
  // let it do whatever it was going to do
  if (event.ctrlKey || event.metaKey || event.altKey) return -1;

  event.preventDefault();

  var letter = String.fromCharCode(event.keyCode);
  var activeNodeIndex = this._getActiveNodeIndex() || 0;

  // An array of this group's nodes that starts
  // with the active one and loops through
  // the end back around
  var ouroborosNodes = this._nodes
    .slice(activeNodeIndex + 1)
    .concat(this._nodes.slice(0, activeNodeIndex + 1));

  var node, nodeText, i, l;
  for (i = 0, l = ouroborosNodes.length; i < l; i++) {
    node = ouroborosNodes[i];
    nodeText = node.getAttribute('data-focus-group-text') || node.textContent;

    if (!nodeText) continue;

    if (nodeText.charAt(0).toLowerCase() === letter.toLowerCase()) {
      focusNode(node);
      return this._nodes.indexOf(node);
    }
  }
};

FocusGroup.prototype.focusNodeAtIndex = function(index) {
  focusNode(this._nodes[index]);
  return this;
};

FocusGroup.prototype.addNode = function(node) {
  this._checkNode(node);
  this._nodes.push(node);
  return this;
};

FocusGroup.prototype.removeNode = function(node) {
  var nodeIndex = this._nodes.indexOf(node);
  if (nodeIndex === -1) return;
  this._nodes.splice(nodeIndex, 1);
  return this;
};

FocusGroup.prototype.clearNodes = function() {
  this._nodes = [];
  return this;
};

FocusGroup.prototype.setNodes = function(nextNodes) {
  nextNodes.forEach(this._checkNode);
  this._nodes = nextNodes;
  return this;
};

FocusGroup.prototype.getNodes = function() {
  return this._nodes;
};

FocusGroup.prototype._checkNode = function(node) {
  if (!node.nodeType || node.nodeType !== window.Node.ELEMENT_NODE) {
    throw new Error('focus-group: attempted to add non-element node to group');
  }
};

function getEventArrowKey(event) {
  if (event.key === 'ArrowUp' || event.keyCode === 38) return 'up';
  if (event.key === 'ArrowDown' || event.keyCode === 40) return 'down';
  if (event.key === 'ArrowLeft' || event.keyCode === 37) return 'left';
  if (event.key === 'ArrowRight' || event.keyCode === 39) return 'right';
  return null;
}

function isLetterKeyCode(keyCode) {
  return keyCode >= 65 && keyCode <= 90;
}

function focusNode(node) {
  if (node && node.focus) node.focus();
}

module.exports = function createFocusGroup(options) {
  return new FocusGroup(options);
};
