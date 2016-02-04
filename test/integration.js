var assert = require('power-assert');
var simulant = require('simulant');
var createFocusGroup = require('..');

var arrowUpEvent = { keyCode: 38 };
var arrowDownEvent = { keyCode: 40 };
var arrowLeftEvent = { keyCode: 37 };
var arrowRightEvent = { keyCode: 39 };

var nodeOne = document.createElement('button');
nodeOne.innerHTML = 'one';
document.body.appendChild(nodeOne);
var nodeTwo = document.createElement('button');
nodeTwo.innerHTML = 'two';
document.body.appendChild(nodeTwo);
var nodeThree = document.createElement('button');
nodeThree.innerHTML = 'three';
document.body.appendChild(nodeThree);
var nodeFour = document.createElement('button');
nodeFour.innerHTML = 'four';
document.body.appendChild(nodeFour);

describe('default settings', function() {
  before(function() {
    createFocusGroup({
      initialNodes: [nodeOne, nodeTwo, nodeThree],
    }).activate();
  });

  it('with focus outside the group, arrow and letter keys do not affect focus', function() {
    nodeFour.focus(); // nodeFour is outside group
    simulateKeydown(arrowUpEvent);
    assertActiveElement(nodeFour);
    simulateKeydown(arrowDownEvent);
    assertActiveElement(nodeFour);
    simulateKeydown(arrowLeftEvent);
    assertActiveElement(nodeFour);
    simulateKeydown(arrowRightEvent);
    assertActiveElement(nodeFour);
    simulateKeydown({ keyCode: 70 });
    assertActiveElement(nodeFour);
    simulateKeydown({ keyCode: 88 });
    assertActiveElement(nodeFour);
  });

  describe('with focus inside the group', function() {
    it('down arrow moves focus to next node and sticks on last', function() {
      nodeOne.focus();
      simulateKeydown(arrowDownEvent);
      assertActiveElement(nodeTwo);
      simulateKeydown(arrowDownEvent);
      assertActiveElement(nodeThree);
      simulateKeydown(arrowDownEvent);
      assertActiveElement(nodeThree);
    });

    it('up arrow moves focus to previous node and sticks on first', function() {
      nodeThree.focus();
      simulateKeydown(arrowUpEvent);
      assertActiveElement(nodeTwo);
      simulateKeydown(arrowUpEvent);
      assertActiveElement(nodeOne);
      simulateKeydown(arrowUpEvent);
      assertActiveElement(nodeOne);
    });

    it('left and right arrows and letters do not move focus', function() {
      nodeTwo.focus();
      simulateKeydown(arrowLeftEvent);
      assertActiveElement(nodeTwo);
      simulateKeydown(arrowRightEvent);
      assertActiveElement(nodeTwo);
      simulateKeydown({ keyCode: 70 });
      assertActiveElement(nodeTwo);
      simulateKeydown({ keyCode: 88 });
      assertActiveElement(nodeTwo);
    });
  });
});

describe('all arrows designated', function() {
  before(function() {
    createFocusGroup({
      initialNodes: [nodeOne, nodeTwo, nodeThree],
      forwardArrows: ['up', 'left'],
      backArrows: ['down', 'right'],
    }).activate();
  });

  it('up and left arrows move focus forward', function() {
    nodeOne.focus();
    simulateKeydown(arrowUpEvent);
    assertActiveElement(nodeTwo);
    simulateKeydown(arrowLeftEvent);
    assertActiveElement(nodeThree);
  });

  it('up and left arrows move focus back', function() {
    nodeThree.focus();
    simulateKeydown(arrowDownEvent);
    assertActiveElement(nodeTwo);
    simulateKeydown(arrowRightEvent);
    assertActiveElement(nodeOne);
  });
});

describe('cycle: true', function() {
  before(function() {
    createFocusGroup({
      initialNodes: [nodeOne, nodeTwo, nodeThree],
      cycle: true,
    }).activate();
  });

  it('down arrow cycles forward', function() {
    nodeTwo.focus();
    simulateKeydown(arrowDownEvent);
    assertActiveElement(nodeThree);
    simulateKeydown(arrowDownEvent);
    assertActiveElement(nodeOne);
  });

  it('up arrow cycles back', function() {
    nodeTwo.focus();
    simulateKeydown(arrowUpEvent);
    assertActiveElement(nodeOne);
    simulateKeydown(arrowUpEvent);
    assertActiveElement(nodeThree);
  });
});

describe('letterNavigation: true', function() {
  before(function() {
    createFocusGroup({
      initialNodes: [nodeOne, nodeTwo, nodeThree],
      letterNavigation: true,
    }).activate();
  });

  it('letter moves to next node with that letter, cycling', function() {
    nodeOne.focus();
    simulateKeydown({ keyCode: 79 }); // "o"
    assertActiveElement(nodeOne);
    simulateKeydown({ keyCode: 84 }); // "t"
    assertActiveElement(nodeTwo);
    simulateKeydown({ keyCode: 84 }); // "t"
    assertActiveElement(nodeThree);
    simulateKeydown({ keyCode: 84 }); // "t"
    assertActiveElement(nodeTwo);
    simulateKeydown({ keyCode: 79 }); // "o"
    assertActiveElement(nodeOne);
  });
});

function assertActiveElement(node) {
  assert.equal(document.activeElement, node);
}

function simulateKeydown(mockEvent) {
  simulant.fire(document, 'keydown', mockEvent);
}
