import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateTasks } from '../src/utils/tasks.js';

test('consolidation retains existing and completed tasks without changing source data', () => {
  const current = [{ id: 'a', text: 'Đề 1', completed: true }];
  const daily = [{ id: 'a', text: 'Đọc sách', completed: true, deadline: '2026-09-11' }];
  const recurring = { daily: { tasks: [{ id: 'a', text: 'Ôn bài', completed: false }] } };
  const before = structuredClone({ current, daily, recurring });
  const result = consolidateTasks(current, daily, recurring);
  assert.equal(result.length, 3);
  assert.equal(new Set(result.map(task => task.id)).size, 3);
  assert.equal(result[1].completed, true);
  assert.equal(result[1].deadline, '2026-09-11');
  assert.deepEqual({ current, daily, recurring }, before);
  assert.deepEqual(consolidateTasks(result, daily, recurring), result);
});

test('consolidation accepts absent or malformed legacy data and creates no sample tasks', () => {
  assert.deepEqual(consolidateTasks([], null, null), []);
  assert.deepEqual(consolidateTasks([], [null, {}, { text: ' ' }], { daily: { tasks: {} } }), []);
});
