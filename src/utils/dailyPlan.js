import { getLocalDateKey, localDateFromKey } from './date.js';

export function rolloverTasks(tasks, today = getLocalDateKey()) {
  let changed = false;
  const result = tasks.map(task => {
    const date = task.plannedDate;
    if (task.completed || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        getLocalDateKey(localDateFromKey(date)) !== date || date >= today) return task;
    changed = true;
    return { ...task, plannedDate: today, carriedFromDate: task.carriedFromDate || date };
  });
  return changed ? result : tasks;
}

export function rolloverExams(exams, today = getLocalDateKey()) {
  let changed = false;
  const result = exams.map(exam => {
    if (!Array.isArray(exam.tasks)) return exam;
    const tasks = rolloverTasks(exam.tasks, today);
    if (tasks === exam.tasks) return exam;
    changed = true;
    return { ...exam, tasks };
  });
  return changed ? result : exams;
}

// Recheck after sleep/background throttling, and schedule the local midnight.
export function subscribeToLocalDay(listener) {
  let timer;
  const check = () => {
    clearTimeout(timer);
    listener();
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timer = setTimeout(check, Math.max(1, next - now));
  };
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', check);
  check();
  return () => {
    clearTimeout(timer);
    window.removeEventListener('focus', check);
    document.removeEventListener('visibilitychange', check);
  };
}
