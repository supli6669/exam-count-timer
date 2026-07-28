import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCountdownSeconds,
  getElapsedWholeSeconds,
  getStopwatchSeconds
} from '../src/utils/timer.js';

test('countdown derives the remaining time from an absolute deadline', () => {
  const deadline = 1_000_000;

  assert.equal(getCountdownSeconds(deadline, deadline - 60_000), 60);
  assert.equal(getCountdownSeconds(deadline, deadline - 59_001), 60);
  assert.equal(getCountdownSeconds(deadline, deadline + 10_000), 0);
});

test('stopwatch catches up after callbacks are throttled in a background tab', () => {
  const startedAt = 10_000;

  assert.equal(getStopwatchSeconds(startedAt, startedAt + 1_000), 1);
  assert.equal(getStopwatchSeconds(startedAt, startedAt + 127_900), 127);
});

test('elapsed delta never records negative study time', () => {
  assert.equal(getElapsedWholeSeconds(12, 130), 118);
  assert.equal(getElapsedWholeSeconds(130, 12), 0);
});
