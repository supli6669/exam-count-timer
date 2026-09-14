import test from 'node:test';
import assert from 'node:assert/strict';
import { rolloverTasks, rolloverExams, subscribeToLocalDay } from '../src/utils/dailyPlan.js';

test('overdue work joins existing plan without changing done, future, unplanned or invalid tasks', () => {
  const tasks = [
    { id: 'old', plannedDate: '2026-09-13', completed: false, deadline: '2026-09-13', estPomodoros: 3 },
    { id: 'today', plannedDate: '2026-09-14' },
    { id: 'done', plannedDate: '2026-09-12', completed: true, completedAt: 123 },
    { id: 'future', plannedDate: '2026-09-15' },
    { id: 'unplanned' },
    { id: 'invalid', plannedDate: '2026-02-31' },
  ];
  const before = structuredClone(tasks);
  const result = rolloverTasks(tasks, '2026-09-14');
  assert.deepEqual(result[0], { ...tasks[0], plannedDate: '2026-09-14', carriedFromDate: '2026-09-13' });
  assert.deepEqual(result.slice(1), tasks.slice(1));
  assert.deepEqual(tasks, before);
  assert.equal(result.filter(t => t.plannedDate === '2026-09-14').length, 2);
  assert.equal(rolloverTasks(result, '2026-09-14'), result);
  assert.deepEqual(rolloverTasks(JSON.parse(JSON.stringify(result)), '2026-09-14'), result);
});

test('multiple days, month/year boundaries retain original carry date and exam identity', () => {
  const exams = [{ id: 'math', tasks: [{ id: 'one', plannedDate: '2025-12-31' }] }, { id: 'empty' }];
  const next = rolloverExams(exams, '2026-01-04');
  assert.equal(next[0].tasks[0].plannedDate, '2026-01-04');
  const later = rolloverExams(next, '2026-02-01');
  assert.equal(later[0].tasks[0].carriedFromDate, '2025-12-31');
  assert.equal(later[0].id, 'math');
  assert.equal(later[1], exams[1]);
  assert.equal(rolloverExams(later, '2026-02-01'), later);
});

test('local day subscription checks on opening, midnight and return; cleans up', t => {
  const win = new EventTarget();
  const doc = new EventTarget();
  t.mock.method(globalThis, 'setTimeout', callback => { scheduled = callback; return 1; });
  t.mock.method(globalThis, 'clearTimeout', () => {});
  let scheduled;
  let calls = 0;
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  globalThis.window = win;
  globalThis.document = doc;
  try {
    const stop = subscribeToLocalDay(() => calls++);
    assert.equal(calls, 1);
    scheduled();
    win.dispatchEvent(new Event('focus'));
    doc.dispatchEvent(new Event('visibilitychange'));
    assert.equal(calls, 4);
    stop();
    win.dispatchEvent(new Event('focus'));
    doc.dispatchEvent(new Event('visibilitychange'));
    assert.equal(calls, 4);
  } finally {
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
    if (oldDocument === undefined) delete globalThis.document; else globalThis.document = oldDocument;
  }
});
