import test from 'node:test';
import assert from 'node:assert/strict';
import { rankStudySubjects } from '../src/utils/studyNext.js';

const now = Date.parse('2026-09-09T08:00:00Z');
const exam = (id, days, extra = {}) => ({ id, subject: id, datetime: new Date(now + days * 86400000).toISOString(), ...extra });

test('ignores expired and invalid dates, handles empty list', () => {
  assert.deepEqual(rankStudySubjects([], now), []);
  assert.deepEqual(rankStudySubjects([exam('past', -1), { datetime: 'invalid' }], now), []);
});
test('imminent exams take priority, confidence adjusts comparable deadlines', () => {
  const list = [exam('later', 10, { studyLevel: 'new' }), exam('soon', 1, { studyLevel: 'ready' })];
  assert.equal(rankStudySubjects(list, now)[0].exam.id, 'soon');
  assert.equal(rankStudySubjects([exam('ready', 4, { studyLevel: 'ready' }), exam('new', 5, { studyLevel: 'new' })], now)[0].exam.id, 'new');
});
test('suggests unfinished urgent work and gives a concrete fallback without tasks', () => {
  const tasks = [{ id: 'done', completed: true, urgent: true }, { id: 'later', text: 'Later' }, { id: 'urgent', urgent: true, text: 'Solve problem 1' }];
  const result = rankStudySubjects([exam('math', 2, { tasks })], now)[0];
  assert.equal(result.task.id, 'urgent');
  assert.equal(result.action, 'Solve problem 1');
  assert.ok(rankStudySubjects([exam('empty', 2)], now)[0].action.length > 20);
  assert.equal(tasks[0].id, 'done');
});
