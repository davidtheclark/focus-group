(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var createFocusGroup = require('..');

var stateNodes = [].slice.call(document.querySelectorAll('.state'));

var stateFocusGroup = createFocusGroup({
	members: stateNodes,
	stringSearch: true,
});
stateFocusGroup.activate();

},{"..":2}],2:[function(require,module,exports){
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

FocusGroup.activeGroup = null;

FocusGroup.prototype.activate = function() {
  if (FocusGroup.activeGroup) FocusGroup.activeGroup.deactivate();
  FocusGroup.activeGroup = this;
  document.addEventListener('keydown', this._boundHandleKeydownEvent, true);
  return this;
};

FocusGroup.prototype.deactivate = function() {
  FocusGroup.activeGroup = null;
  document.removeEventListener('keydown', this._boundHandleKeydownEvent, true);
  this._clearSearchStringRefreshTimer();
  return this;
};

FocusGroup.prototype._handleKeydownEvent = function(event) {
  // We should only respond to keyboard events when
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
  clearTimeout(this._stringSearchTimer);
}

FocusGroup.prototype._runStringSearch = function() {
  this._startSearchStringRefreshTimer();
  var member;
  for (var i = 0, l = this._members.length; i < l; i++) {
    member = this._members[i];
    if (!member.text) continue;

    if (member.text.indexOf(this._searchString) === 0) {
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
  var node;
  var nodeText;
  if (member.node && member.text) {
    node = this._checkNode(member.node);
    nodeText = member.text;
  } else {
    node = this._checkNode(member);
    nodeText = node.getAttribute('data-focus-group-text') || node.textContent || '';
  }

  var cleanedNodeText = nodeText.replace(/\s/g, '').toLowerCase();
  var member = {
    node: node,
    text: cleanedNodeText,
  };

  if (index) {
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

},{}]},{},[1]);
