export function getCountdownSeconds(deadlineMs, nowMs = Date.now()) {
  if (!Number.isFinite(deadlineMs) || !Number.isFinite(nowMs)) return 0;
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

export function getStopwatchSeconds(startedAtMs, nowMs = Date.now()) {
  if (!Number.isFinite(startedAtMs) || !Number.isFinite(nowMs)) return 0;
  return Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
}

export function getElapsedWholeSeconds(previousSeconds, currentSeconds) {
  if (!Number.isFinite(previousSeconds) || !Number.isFinite(currentSeconds)) return 0;
  return Math.max(0, currentSeconds - previousSeconds);
}
