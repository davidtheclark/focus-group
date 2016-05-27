function FocusGroup(options) {
  options = options || {};
  this._settings = {
    forwardArrows: options.forwardArrows || ['down'],
    backArrows: options.backArrows || ['up'],
    wrap: options.wrap,
    stringSearch: options.stringSearch,
    stringSearchDelay: 800,
  };
  this._searchString = '';
  this._members = [];
  if (options.members) this.setMembers(options.members);
  this._boundHandleKeydownEvent = this._handleKeydownEvent.bind(this);
}

FocusGroup.prototype.activate = function() {
  // Use capture in case other libraries might grab it first -- i.e. React
  document.addEventListener('keydown', this._boundHandleKeydownEvent, true);
  return this;
};

FocusGroup.prototype.deactivate = function() {
  document.removeEventListener('keydown', this._boundHandleKeydownEvent, true);
  this._clearSearchStringRefreshTimer();
  return this;
};

FocusGroup.prototype._handleKeydownEvent = function(event) {
  // Only respond to keyboard events when
  // focus is already within the focus-group
  var activeElementIndex = this._getActiveElementIndex();
  if (activeElementIndex === -1) return;

  var arrow = getEventArrowKey(event);

  if (!arrow) {
    this._handleNonArrowKey(event);
    return;
  }

  if (this._settings.forwardArrows.indexOf(arrow) !== -1) {
    event.preventDefault();
    this.moveFocusForward();
    return;
  }

  if (this._settings.backArrows.indexOf(arrow) !== -1) {
    event.preventDefault();
    this.moveFocusBack();
    return;
  }
};

FocusGroup.prototype.moveFocusForward = function() {
  var activeElementIndex = this._getActiveElementIndex();
  var targetIndex;
  if (activeElementIndex < this._members.length - 1) {
    targetIndex = activeElementIndex + 1;
  } else if (this._settings.wrap) {
    targetIndex = 0;
  } else {
    targetIndex = activeElementIndex;
  }
  this.focusNodeAtIndex(targetIndex);
  return targetIndex;
};

FocusGroup.prototype.moveFocusBack = function() {
  var activeElementIndex = this._getActiveElementIndex();
  var targetIndex;
  if (activeElementIndex > 0) {
    targetIndex = activeElementIndex - 1;
  } else if (this._settings.wrap) {
    targetIndex = this._members.length - 1;
  } else {
    targetIndex = activeElementIndex;
  }
  this.focusNodeAtIndex(targetIndex);
  return targetIndex;
};

FocusGroup.prototype._handleNonArrowKey = function(event) {
  if (!this._settings.stringSearch) return;

  // While a string search is underway, ignore spaces
  // and prevent the default space-key behavior
  if (this._searchString !== '' && (event.key === ' ' || event.keyCode === 32)) {
    event.preventDefault();
    return -1;
  }

  // Only respond to letter keys
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
  clearTimeout(this._stringSearchTimer);
}

FocusGroup.prototype._runStringSearch = function() {
  this._startSearchStringRefreshTimer();
  this.moveFocusByString(this._searchString);
}

FocusGroup.prototype.moveFocusByString = function(str) {
  var member;
  for (var i = 0, l = this._members.length; i < l; i++) {
    member = this._members[i];
    if (!member.text) continue;

    if (member.text.indexOf(str) === 0) {
      return focusNode(member.node);
    }
  }
}

FocusGroup.prototype._findIndexOfNode = function(searchNode) {
  for (var i = 0, l = this._members.length; i < l; i++) {
    if (this._members[i].node === searchNode) {
      return i;
    }
  }
  return -1;
}

FocusGroup.prototype._getActiveElementIndex = function() {
  return this._findIndexOfNode(document.activeElement);
};

FocusGroup.prototype.focusNodeAtIndex = function(index) {
  var member = this._members[index];
  if (member) focusNode(member.node);
  return this;
};

FocusGroup.prototype.addMember = function(member, index) {
  var node = member.node || member;
  var nodeText = member.text || node.getAttribute('data-focus-group-text') || node.textContent || '';

  this._checkNode(node);

  var cleanedNodeText = nodeText.replace(/[\W_]/g, '').toLowerCase();
  var member = {
    node: node,
    text: cleanedNodeText,
  };

  if (index !== null && index !== undefined) {
    this._members.splice(index, 0, member);
  } else {
    this._members.push(member);
  }
  return this;
};

FocusGroup.prototype.removeMember = function(member) {
  var removalIndex = (typeof member === 'number')
    ? member
    : this._findIndexOfNode(member);
  if (removalIndex === -1) return;
  this._members.splice(removalIndex, 1);
  return this;
};

FocusGroup.prototype.clearMembers = function() {
  this._members = [];
  return this;
};

FocusGroup.prototype.setMembers = function(nextMembers) {
  this.clearMembers();
  for (var i = 0, l = nextMembers.length; i < l; i++) {
    this.addMember(nextMembers[i]);
  }
  return this;
};

FocusGroup.prototype.getMembers = function() {
  return this._members;
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
