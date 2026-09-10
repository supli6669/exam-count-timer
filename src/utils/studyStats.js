import { getLocalDateKey } from './date.js';

export function summarizeStudyStats(logs, now = new Date()) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setDate(day.getDate() - 6 + index);
    return { date: getLocalDateKey(day), seconds: 0 };
  });
  let total = 0;
  const subjects = new Map();
  for (const log of Array.isArray(logs) ? logs : []) {
    if (!log || !Number.isFinite(log.seconds) || log.seconds <= 0 || !Number.isFinite(log.timestamp) || log.timestamp > now.getTime()) continue;
    const date = new Date(log.timestamp);
    if (Number.isNaN(date.getTime())) continue;
    total += log.seconds;
    const day = days.find(item => item.date === getLocalDateKey(date));
    if (day) day.seconds += log.seconds;
    const name = typeof log.subjectName === 'string' ? log.subjectName : 'Học tập chung';
    subjects.set(name, (subjects.get(name) || 0) + log.seconds);
  }
  return { days, today: days[6].seconds, week: days.reduce((sum, day) => sum + day.seconds, 0), total, subjects: [...subjects].sort((a, b) => b[1] - a[1]) };
}
