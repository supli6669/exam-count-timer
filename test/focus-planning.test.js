import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFocusCsv,
  estimatePlanFinish,
  flattenStudyTasks,
  migrateStudyData,
  normalizeFocusPlan,
  summarizeFocusLogs
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

test('rolls tomorrow plan into today after the date changes', () => {
  const plan = normalizeFocusPlan({
    dailyGoalMinutes: 90,
    today: { date: '2026-07-27', mostImportantTaskKey: 'old', priorityTaskKeys: [] },
    tomorrow: { date: '2026-07-28', mostImportantTaskKey: 'math:t1', priorityTaskKeys: ['math:t1'] }
  }, new Date(2026, 6, 28, 9));
  assert.equal(plan.today.mostImportantTaskKey, 'math:t1');
  assert.equal(plan.tomorrow.date, '2026-07-29');
});

test('summarizes actual focus time and estimate variance by task', () => {
  const tasks = [{ taskId: 't1', key: 'math:t1', estPomodoros: 2, completed: true }];
  const logs = [{ timestamp: new Date(2026, 6, 28, 9).getTime(), date: '2026-07-28', taskId: 't1', seconds: 3600 }];
  const summary = summarizeFocusLogs(logs, tasks, '2026-07-28');
  assert.equal(summary.totalMinutes, 60);
  assert.equal(summary.taskAccuracy[0].varianceMinutes, 10);
});

test('estimates finish time from planned pomodoros', () => {
  const start = new Date(2026, 6, 28, 8);
  const estimate = estimatePlanFinish([{ estPomodoros: 2 }, { estPomodoros: 1 }], 25, start);
  assert.equal(estimate.remainingMinutes, 50);
  assert.equal(estimate.finishAt.getHours(), 8);
  assert.equal(estimate.finishAt.getMinutes(), 50);
});

test('exports focus logs as escaped CSV', () => {
  const csv = buildFocusCsv([{ timestamp: 0, date: '1970-01-01', subjectName: 'A, B', taskText: 'Ôn "đề"', seconds: 90 }]);
  assert.match(csv, /"A, B"/);
  assert.match(csv, /"Ôn ""đề"""/);
  assert.match(csv, /"1.5"/);
});
