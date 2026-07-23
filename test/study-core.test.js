import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTimeLeft } from '../src/utils/examTime.js';
import { buildTodayStudyPlan, getNextReviewDate } from '../src/utils/studyPlanner.js';

test('calculates an active exam countdown', () => {
  const now = Date.UTC(2026, 0, 1, 0, 0, 0);
  assert.deepEqual(calculateTimeLeft(now + 90061000, now), { days: 1, hours: 1, minutes: 1, seconds: 1, isPassed: false, totalMs: 90061000 });
});

test('schedules the next successful review by Leitner box', () => {
  assert.equal(getNextReviewDate(2, true, new Date(2026, 0, 1)).nextReviewDate, '2026-01-08');
});

test('prioritizes urgent exam tasks', () => {
  const plan = buildTodayStudyPlan([{ id: 'e1', subject: 'Toán', datetime: new Date(Date.now() + 86400000).toISOString(), tasks: [{ id: 't1', text: 'Làm đề', urgent: true, completed: false }] }]);
  assert.equal(plan[0].id, 't1');
});
