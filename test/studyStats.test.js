import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeStudyStats } from '../src/utils/studyStats.js';

test('statistics separate today, last seven local days and older history across a month boundary', () => {
  const now = new Date(2026, 9, 2, 12);
  const log = (day, seconds) => ({ timestamp: new Date(2026, 9, day, 0, 15).getTime(), seconds, subjectName: 'Toán' });
  const result = summarizeStudyStats([log(2, 60), log(-4, 120), log(-5, 240)], now);
  assert.equal(result.today, 60);
  assert.equal(result.week, 180);
  assert.equal(result.total, 420);
  assert.deepEqual(result.subjects, [['Toán', 420]]);
});

test('statistics ignore malformed, negative and future entries', () => {
  const now = new Date();
  const invalid = [null, {}, { timestamp: NaN, seconds: 1 }, { timestamp: now.getTime(), seconds: -2 }, { timestamp: now.getTime() + 1000, seconds: 1 }];
  assert.equal(summarizeStudyStats(invalid, now).total, 0);
  assert.equal(summarizeStudyStats(null, now).total, 0);
});
