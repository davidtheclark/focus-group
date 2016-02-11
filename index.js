function FocusGroup(options) {
  options = options || {};
  this._settings = {
    forwardArrows: options.forwardArrows || ['down'],
    backArrows: options.backArrows || ['up'],
    letterNavigation: options.letterNavigation,
    wrap: options.wrap,
    stringSearchDelay: 800,
  };
  this._nodeReps = [];
  if (options.nodes) this.setNodes(options.nodes);
  this._handleKeydownEvent = this.handleKeydownEvent.bind(this);
  this._searchString = '';
}

FocusGroup.activeGroup = null;

FocusGroup.prototype.activate = function() {
  if (FocusGroup.activeGroup) FocusGroup.activeGroup.deactivate();
  FocusGroup.activeGroup = this;
  document.addEventListener('keydown', this._handleKeydownEvent, true);
  return this;
};

FocusGroup.prototype.deactivate = function() {
  FocusGroup.activeGroup = null;
  document.removeEventListener('keydown', this._handleKeydownEvent, true);
  this._clearSearchStringRefreshTimer();
  return this;
};

FocusGroup.prototype.handleKeydownEvent = function(event) {
  // We should only respond to keyboard events when
  // focus is already within the focus-group
  var activeNodeIndex = this._getActiveNodeIndex();
  if (activeNodeIndex === -1) return;

  var arrow = getEventArrowKey(event);

  if (!arrow) {
    this._handleNonArrowKey(event);
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
  if (activeNodeIndex < this._nodeReps.length - 1) {
    targetNodeIndex = activeNodeIndex + 1;
  } else if (this._settings.wrap) {
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
  } else if (this._settings.wrap) {
    targetNodeIndex = this._nodeReps.length - 1;
  } else {
    targetNodeIndex = activeNodeIndex;
  }
  this.focusNodeAtIndex(targetNodeIndex);
  return targetNodeIndex;
};

FocusGroup.prototype._handleNonArrowKey = function(event) {
  if (!this._settings.letterNavigation) return;

  // While a string search is underway, ignore spaces and prevent their default
  if (this._searchString !== '' && (event.key === ' ' || event.keyCode === 32)) {
    event.preventDefault();
    return -1;
  }

  if (!isLetterKeyCode(event.keyCode)) return -1;

  // If the letter key is part of a key combo,
  // let it do whatever it was going to do
  if (event.ctrlKey || event.metaKey || event.altKey) return -1;

  event.preventDefault();

  this._addToSearchString(String.fromCharCode(event.keyCode));
  this._runStringSearch();
};

FocusGroup.prototype._clearSearchString = function() {
  this._searchString = '';
};

FocusGroup.prototype._addToSearchString = function(letter) {
  // Always store the lowercase version of the letter
  this._searchString += letter.toLowerCase();
};

FocusGroup.prototype._startSearchStringRefreshTimer = function() {
  var self = this;
  this._clearSearchStringRefreshTimer();
  this._stringSearchTimer = setTimeout(function() {
    self._clearSearchString();
  }, this._settings.stringSearchDelay);
};

FocusGroup.prototype._clearSearchStringRefreshTimer = function() {
  if (this._stringSearchTimer) {
    clearTimeout(this._stringSearchTimer);
  }
}

FocusGroup.prototype._runStringSearch = function() {
  this._startSearchStringRefreshTimer();
  var nodeRep, nodeText;
  for (var i = 0, l = this._nodeReps.length; i < l; i++) {
    nodeRep = this._nodeReps[i];
    if (!nodeRep.text) continue;

    if (nodeRep.text.indexOf(this._searchString) === 0) {
      return focusNode(nodeRep.node);
    }
  }
}

FocusGroup.prototype._findIndexOfNode = function(searchNode) {
  for (var i = 0, l = this._nodeReps.length; i < l; i++) {
    if (this._nodeReps[i].node === searchNode) {
      return i;
    }
  }
  return -1;
}

FocusGroup.prototype._getActiveNodeIndex = function() {
  return this._findIndexOfNode(document.activeElement);
};

FocusGroup.prototype.focusNodeAtIndex = function(index) {
  var nodeRep = this._nodeReps[index];
  if (nodeRep) focusNode(nodeRep.node);
  return this;
};

FocusGroup.prototype.addNode = function(input) {
  var node;
  var nodeText;
  if (input.node && input.text) {
    node = this._checkNode(input.node);
    nodeText = input.text;
  } else {
    node = this._checkNode(input);
    nodeText = node.getAttribute('data-focus-group-text') || node.textContent || '';
  }

  var cleanedNodeText = nodeText.replace(/\s/g, '').toLowerCase();

  this._nodeReps.push({
    node: node,
    text: cleanedNodeText,
  });
  return this;
};

FocusGroup.prototype.removeNode = function(node) {
  var nodeIndex = this._findIndexOfNode(node);
  if (nodeIndex === -1) return;
  this._nodeReps.splice(nodeIndex, 1);
  return this;
};

FocusGroup.prototype.clearNodes = function() {
  this._nodeReps = [];
  return this;
};

FocusGroup.prototype.setNodes = function(nextNodes) {
  for (var i = 0, l = nextNodes.length; i < l; i++) {
    this.addNode(nextNodes[i]);
  }
  return this;
};

FocusGroup.prototype.getNodes = function() {
  return this._nodeReps;
};

FocusGroup.prototype._checkNode = function(node) {
  if (!node.nodeType || node.nodeType !== window.Node.ELEMENT_NODE) {
    throw new Error('focus-group: only DOM nodes allowed');
  }
  return node;
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
  if (!node || !node.focus) return;
  node.focus();
  if (node.tagName.toLowerCase() === 'input') node.select();
}

module.exports = function createFocusGroup(options) {
  return new FocusGroup(options);
};
