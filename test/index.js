import test from 'ava';
import sinon from 'sinon';
import createFocusGroup from '..';

test.beforeEach(t => {
  t.context.mockDocument = {
    addEventListener: sinon.spy(),
    removeEventListener: sinon.spy(),
  };
  t.context.defaultTestOptions = {
    _document: t.context.mockDocument,
  };
});

test('FocusGroup#constructor with default settings', t => {
  const noOptionsGroup = createFocusGroup(t.context.defaultTestOptions);
  t.same(noOptionsGroup._settings, {
    forwardArrows: ['down'],
    backArrows: ['up'],
    letterNavigation: undefined,
    cycle: undefined,
  });
  t.same(noOptionsGroup._nodes, []);
});

test('FocusGroup#_getActiveNodeIndex', t => {
  // Use numbers instead of nodes for simplicity
  t.context.mockDocument.activeElement = 3;
  var focusGroup = createFocusGroup(t.context.defaultTestOptions);
  focusGroup._nodes = [1, 2, 3, 4, 5];
  t.is(focusGroup._getActiveNodeIndex(), 2);
});

test('FocusGroup#activate, without already active group', t => {
  const focusGroup = createFocusGroup(t.context.defaultTestOptions);
  const activateReturnValue = focusGroup.activate();
  t.is(t.context.mockDocument.addEventListener.callCount, 1);
  t.same(t.context.mockDocument.addEventListener.getCall(0).args, [
    'keydown',
    focusGroup._handleKeyDown,
    true,
  ]);
  t.is(activateReturnValue, focusGroup);
  t.is(focusGroup.constructor.activeGroup, focusGroup);
});

test('FocusGroup#active on a second group deactivates the first', t => {
  const focusGroupA = createFocusGroup(t.context.defaultTestOptions);
  const focusGroupADeactivate = sinon.spy(focusGroupA, 'deactivate');
  const focusGroupB = createFocusGroup(t.context.defaultTestOptions);
  focusGroupA.activate();
  focusGroupB.activate();
  t.is(focusGroupADeactivate.callCount, 1);
  t.is(focusGroupA.constructor.activeGroup, focusGroupB);
});

test('FocusGroup#deactivate', t => {
  const focusGroup = createFocusGroup(t.context.defaultTestOptions);
  focusGroup.activate();
  const deactivateReturnValue = focusGroup.deactivate();
  t.is(t.context.mockDocument.removeEventListener.callCount, 1);
  t.same(t.context.mockDocument.removeEventListener.getCall(0).args, [
    'keydown',
    focusGroup._handleKeyDown,
    true,
  ]);
  t.is(deactivateReturnValue, focusGroup);
  t.is(focusGroup.constructor.activeGroup, null);
});

test('FocusGroup#handleKeyDown with down arrow, default settings, no activeElement', t => {
  const focusGroup = createFocusGroup(t.context.defaultTestOptions);
  focusGroup.moveFocusByLetter = sinon.spy();
  focusGroup.moveFocusBack = sinon.spy();
  focusGroup.moveFocusForward = sinon.spy();
  const mockDownArrowEvent = createMockEvent('ArrowDown');
  focusGroup.handleKeyDown(mockDownArrowEvent);
  t.is(focusGroup.moveFocusByLetter.callCount, 0);
  t.is(focusGroup.moveFocusBack.callCount, 0);
  t.is(focusGroup.moveFocusForward.callCount, 0);
  t.is(mockDownArrowEvent.preventDefault.callCount, 0);
});

test('FocusGroup#handleKeyDown with down arrow, default settings, and an activeElement outside the group', t => {
  t.context.mockDocument.activeElement = 7;
  const focusGroup = createFocusGroup(Object.assign(t.context.defaultTestOptions, {
    initialNodes: [3, 4, 5, 6],
  }));
  focusGroup.moveFocusByLetter = sinon.spy();
  focusGroup.moveFocusBack = sinon.spy();
  focusGroup.moveFocusForward = sinon.spy();
  const mockDownArrowEvent = createMockEvent('ArrowDown');
  focusGroup.handleKeyDown(mockDownArrowEvent);
  t.is(focusGroup.moveFocusByLetter.callCount, 0);
  t.is(focusGroup.moveFocusBack.callCount, 0);
  t.is(focusGroup.moveFocusForward.callCount, 0);
  t.is(mockDownArrowEvent.preventDefault.callCount, 0);
});

test('FocusGroup#handleKeyDown with down arrow, initialNodes, and activeElement inside the group', t => {
  t.context.mockDocument.activeElement = 4;
  const focusGroup = createFocusGroup(Object.assign(t.context.defaultTestOptions, {
    initialNodes: [3, 4, 5, 6],
  }));
  focusGroup.moveFocusByLetter = sinon.spy();
  focusGroup.moveFocusBack = sinon.spy();
  focusGroup.moveFocusForward = sinon.spy();
  const mockDownArrowEvent = createMockEvent('ArrowDown');
  focusGroup.handleKeyDown(mockDownArrowEvent);
  t.is(focusGroup.moveFocusByLetter.callCount, 0);
  t.is(focusGroup.moveFocusBack.callCount, 0);
  t.is(focusGroup.moveFocusForward.callCount, 1);
  t.same(focusGroup.moveFocusForward.getCall(0).args, [1],
    'moveFocusForward called with active node index');
  t.is(mockDownArrowEvent.preventDefault.callCount, 1);
});

test('FocusGroup#handleKeyDown with keyCode 40, initialNodes, and activeElement inside the group', t => {
  t.context.mockDocument.activeElement = 4;
  const focusGroup = createFocusGroup(Object.assign(t.context.defaultTestOptions, {
    initialNodes: [3, 4, 5, 6],
  }));
  focusGroup.moveFocusByLetter = sinon.spy();
  focusGroup.moveFocusBack = sinon.spy();
  focusGroup.moveFocusForward = sinon.spy();
  const mockDownArrowEvent = createMockEvent(40);
  focusGroup.handleKeyDown(mockDownArrowEvent);
  t.is(focusGroup.moveFocusByLetter.callCount, 0);
  t.is(focusGroup.moveFocusBack.callCount, 0);
  t.is(focusGroup.moveFocusForward.callCount, 1);
  t.same(focusGroup.moveFocusForward.getCall(0).args, [1],
    'moveFocusForward called with active node index');
  t.is(mockDownArrowEvent.preventDefault.callCount, 1);
});

test('FocusGroup#handleKeyDown with up arrow, default settings, no activeElement', t => {
  const focusGroup = createFocusGroup(t.context.defaultTestOptions);
  focusGroup.moveFocusByLetter = sinon.spy();
  focusGroup.moveFocusBack = sinon.spy();
  focusGroup.moveFocusForward = sinon.spy();
  const mockUpArrowEvent = createMockEvent('ArrowUp');
  focusGroup.handleKeyDown(mockUpArrowEvent);
  t.is(focusGroup.moveFocusByLetter.callCount, 0);
  t.is(focusGroup.moveFocusBack.callCount, 0);
  t.is(focusGroup.moveFocusForward.callCount, 0);
  t.is(mockUpArrowEvent.preventDefault.callCount, 0);
});

test('FocusGroup#handleKeyDown with up arrow, default settings, and an activeElement outside the group', t => {
  t.context.mockDocument.activeElement = 7;
  const focusGroup = createFocusGroup(Object.assign(t.context.defaultTestOptions, {
    initialNodes: [3, 4, 5, 6],
  }));
  focusGroup.moveFocusByLetter = sinon.spy();
  focusGroup.moveFocusBack = sinon.spy();
  focusGroup.moveFocusForward = sinon.spy();
  const mockUpArrowEvent = createMockEvent('ArrowUp');
  focusGroup.handleKeyDown(mockUpArrowEvent);
  t.is(focusGroup.moveFocusByLetter.callCount, 0);
  t.is(focusGroup.moveFocusBack.callCount, 0);
  t.is(focusGroup.moveFocusForward.callCount, 0);
  t.is(mockUpArrowEvent.preventDefault.callCount, 0);
});

test('FocusGroup#handleKeyDown with up arrow, initialNodes, and activeElement inside the group', t => {
  t.context.mockDocument.activeElement = 4;
  const focusGroup = createFocusGroup(Object.assign(t.context.defaultTestOptions, {
    initialNodes: [3, 4, 5, 6],
  }));
  focusGroup.moveFocusByLetter = sinon.spy();
  focusGroup.moveFocusBack = sinon.spy();
  focusGroup.moveFocusForward = sinon.spy();
  const mockUpArrowEvent = createMockEvent('ArrowUp');
  focusGroup.handleKeyDown(mockUpArrowEvent);
  t.is(focusGroup.moveFocusByLetter.callCount, 0);
  t.is(focusGroup.moveFocusForward.callCount, 0);
  t.is(focusGroup.moveFocusBack.callCount, 1);
  t.same(focusGroup.moveFocusBack.getCall(0).args, [1],
    'moveFocusBack called with active node index');
  t.is(mockUpArrowEvent.preventDefault.callCount, 1);
});

test('FocusGroup#handleKeyDown with keyCode 38, initialNodes, and activeElement inside the group', t => {
  t.context.mockDocument.activeElement = 4;
  const focusGroup = createFocusGroup(Object.assign(t.context.defaultTestOptions, {
    initialNodes: [3, 4, 5, 6],
  }));
  focusGroup.moveFocusByLetter = sinon.spy();
  focusGroup.moveFocusBack = sinon.spy();
  focusGroup.moveFocusForward = sinon.spy();
  const mockUpArrowEvent = createMockEvent(38);
  focusGroup.handleKeyDown(mockUpArrowEvent);
  t.is(focusGroup.moveFocusByLetter.callCount, 0);
  t.is(focusGroup.moveFocusForward.callCount, 0);
  t.is(focusGroup.moveFocusBack.callCount, 1);
  t.same(focusGroup.moveFocusBack.getCall(0).args, [1],
    'moveFocusBack called with active node index');
  t.is(mockUpArrowEvent.preventDefault.callCount, 1);
});

test('FocusGroup#handleKeyDown with keyCode 65 (letter A), default settings, and an activeElement inside the group', t => {
  t.context.mockDocument.activeElement = 6;
  const focusGroup = createFocusGroup(Object.assign(t.context.defaultTestOptions, {
    initialNodes: [3, 4, 5, 6],
  }));
  focusGroup.moveFocusByLetter = sinon.spy();
  focusGroup.moveFocusBack = sinon.spy();
  focusGroup.moveFocusForward = sinon.spy();
  const mockLetterKeyEvent = createMockEvent(65);
  focusGroup.handleKeyDown(mockLetterKeyEvent);
  t.is(focusGroup.moveFocusBack.callCount, 0);
  t.is(focusGroup.moveFocusForward.callCount, 0);
  t.is(focusGroup.moveFocusByLetter.callCount, 1);
  t.same(focusGroup.moveFocusByLetter.getCall(0).args, [mockLetterKeyEvent],
    'moveFocusByLetter called with the event'););
});

// test('FocusGroup#moveFocusForward' t => {
//   const focusGroup = createFocusGroup(t.context.defaultTestOptions);
//   const mockNode = {};
//   const focusNodeAtIndexStub = stub(focusGroup, 'focusNodeAtIndex', i => {
//     if (i === 6) return mockNode;
//   });
//   focusGroup.moveFocusForward()
// });

function createMockEvent(keyInfo) {
  const event = {
    preventDefault: sinon.spy(),
  };
  if (typeof keyInfo === 'number') {
    event.keyCode = keyInfo;
  } else {
    event.key = keyInfo;
  }
  return event;
}
