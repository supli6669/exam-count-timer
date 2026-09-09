import test from 'node:test';
import assert from 'node:assert/strict';
import { createCreditPlan, finishTimer, isValidPlan, normalizeSubjects, timerRemaining } from '../src/utils/creditPlan.js';
const subjects = [4, 3, 2].map((credits, i) => ({ id: String(i), subject: `Môn ${i}`, credits }));
const make = (config = {}) => createCreditPlan(subjects, { days: 6, minutes: 100, session: 30, ...config }, 'plan');

test('4:3:2 credits get 240:180:120 minutes across six 100-minute days including breaks', () => {
  const p = make();
  assert.deepEqual(subjects.map(subject => p.sessions.filter(s => s.subjectId === subject.id).reduce((n, s) => n + s.minutes, 0)), [240, 180, 120]);
  for (let day = 0; day < 6; day++) assert.equal(p.sessions.filter(s => s.day === day).reduce((n, s) => n + s.minutes + s.rest, 0), 100);
  assert.equal(p.sessions.length, 18);
  assert.ok(isValidPlan(p));
});
test('varied budgets never overrun, create tiny sessions, or append an unnecessary break', () => {
  for (const minutes of [15, 20, 29, 30, 31, 45, 49, 50, 60, 90, 100, 120, 480]) {
    for (const session of [25, 30, 45, 50]) {
      const p = make({ days: 1, minutes, session });
      assert.ok(p.sessions.every(s => s.minutes >= 15 && s.minutes <= session));
      assert.ok(p.sessions.reduce((n, s) => n + s.minutes + s.rest, 0) <= minutes);
      assert.equal(p.sessions.at(-1).rest, 0);
    }
  }
});
test('legacy courses need no deadline and source data stays unchanged', () => {
  const old = [{ id: 'old', subject: 'Toán', datetime: '2020-01-01', tasks: [{ text: 'Keep' }] }];
  const normalized = normalizeSubjects(old);
  assert.equal(normalized[0].credits, 3);
  assert.equal(old[0].tasks[0].text, 'Keep');
  assert.equal(createCreditPlan(normalized, { days: 1, minutes: 30, session: 30 }, 'x').sessions[0].subject, 'Toán');
});
test('invalid scheduling settings fail before any plan is replaced', () => {
  assert.throws(() => make({ days: 0 }));
  assert.throws(() => make({ minutes: '' }));
  assert.throws(() => make({ session: 0 }));
  assert.throws(() => createCreditPlan([], { days: 1, minutes: 30, session: 30 }, 'x'));
  assert.equal(isValidPlan({}), false);
});
test('timer uses elapsed wall time and preserves pause duration', () => {
  assert.equal(timerRemaining({ deadline: 10000, remaining: 30 }, 7000), 3);
  assert.equal(timerRemaining({ deadline: 10000, remaining: 30 }, 12000), 0);
  assert.equal(timerRemaining({ deadline: null, remaining: 23 }, 999999), 23);
});
test('finishing work marks exactly one session, pauses at break, never auto-studies next subject', () => {
  const p = make();
  p.timer = { kind: 'work', sessionId: p.sessions[0].id, remaining: 0, deadline: 1000 };
  const done = finishTimer(p);
  assert.deepEqual(done.done, [p.sessions[0].id]);
  assert.equal(done.timer.kind, 'rest');
  assert.equal(done.timer.deadline, null);
  assert.equal(done.timer.remaining, 300);
  const rested = finishTimer(done);
  assert.equal(rested.timer, null);
  assert.equal(rested.done.length, 1);
  assert.equal(finishTimer({ ...done, timer: p.timer }).done.length, 1);
});
