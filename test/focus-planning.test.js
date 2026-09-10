import test from 'node:test';
import assert from 'node:assert/strict';
import {
  flattenStudyTasks,
  migrateStudyData,
} from '../src/utils/focusPlanning.js';

test('flattens exam and general tasks with stable keys and estimates', () => {
  const tasks = flattenStudyTasks(
    [{ id: 'math', subject: 'Toán', tasks: [{ id: 't1', text: 'Đề 1', estPomodoros: 3 }] }],
    [{ id: 'g1', text: 'Dọn bàn' }]
  );
  assert.deepEqual(tasks.map(({ key, subject, estPomodoros }) => ({ key, subject, estPomodoros })), [
    { key: 'math:t1', subject: 'Toán', estPomodoros: 3 },
    { key: 'general:g1', subject: 'Nhiệm vụ chung', estPomodoros: 1 }
  ]);
});

test('migrates legacy tasks without dropping their existing fields', () => {
  const migrated = migrateStudyData(
    [{ id: 'math', tasks: [{ id: 't1', text: 'Legacy' }] }],
    []
  );
  assert.equal(migrated.exams[0].tasks[0].estPomodoros, 1);
  assert.equal(migrated.exams[0].tasks[0].important, true);
});
