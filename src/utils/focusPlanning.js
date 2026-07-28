import { getLocalDateKey } from './date.js';

export const FOCUS_PLANNER_STORAGE_KEY = 'focus_planner_v1';
export const FOCUS_TEMPLATES_STORAGE_KEY = 'focus_task_templates_v1';
export const DISTRACTIONS_STORAGE_KEY = 'focus_distractions_v1';

export function getTaskKey(examId, taskId) {
  return `${examId}:${taskId}`;
}

export function normalizeStudyTask(task) {
  const estimate = Number.parseInt(task?.estPomodoros, 10);
  return {
    ...task,
    completed: Boolean(task?.completed),
    deadline: typeof task?.deadline === 'string' ? task.deadline : '',
    estPomodoros: Number.isFinite(estimate) ? Math.min(12, Math.max(1, estimate)) : 1,
    urgent: typeof task?.urgent === 'boolean' ? task.urgent : false,
    important: typeof task?.important === 'boolean' ? task.important : true,
    completedAt: Number.isFinite(task?.completedAt) ? task.completedAt : null
  };
}

export function migrateStudyData(exams = [], generalTasks = []) {
  return {
    exams: exams.map((exam) => ({
      ...exam,
      tasks: Array.isArray(exam.tasks) ? exam.tasks.map(normalizeStudyTask) : []
    })),
    generalTasks: generalTasks.map(normalizeStudyTask)
  };
}

export function flattenStudyTasks(exams = [], generalTasks = []) {
  const examTasks = exams.flatMap((exam) => (exam.tasks || []).map((task) => ({
    ...task,
    examId: exam.id,
    taskId: task.id,
    key: getTaskKey(exam.id, task.id),
    subject: exam.subject,
    estPomodoros: Math.max(1, Number(task.estPomodoros) || 1)
  })));
  const standaloneTasks = generalTasks.map((task) => ({
    ...task,
    examId: 'general',
    taskId: task.id,
    key: getTaskKey('general', task.id),
    subject: 'Nhiệm vụ chung',
    estPomodoros: Math.max(1, Number(task.estPomodoros) || 1)
  }));
  return [...examTasks, ...standaloneTasks];
}

export function createDefaultFocusPlan(now = new Date()) {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    version: 1,
    dailyGoalMinutes: 120,
    today: {
      date: getLocalDateKey(now),
      mostImportantTaskKey: '',
      priorityTaskKeys: []
    },
    tomorrow: {
      date: getLocalDateKey(tomorrow),
      mostImportantTaskKey: '',
      priorityTaskKeys: []
    }
  };
}

const normalizeDayPlan = (value, fallbackDate) => ({
  date: typeof value?.date === 'string' ? value.date : fallbackDate,
  mostImportantTaskKey: typeof value?.mostImportantTaskKey === 'string'
    ? value.mostImportantTaskKey
    : '',
  priorityTaskKeys: Array.isArray(value?.priorityTaskKeys)
    ? [...new Set(value.priorityTaskKeys.filter((key) => typeof key === 'string'))].slice(0, 3)
    : []
});

export function normalizeFocusPlan(value, now = new Date()) {
  const defaults = createDefaultFocusPlan(now);
  const parsedGoal = Number(value?.dailyGoalMinutes);
  let today = normalizeDayPlan(value?.today, defaults.today.date);
  let tomorrow = normalizeDayPlan(value?.tomorrow, defaults.tomorrow.date);

  if (today.date !== defaults.today.date) {
    today = tomorrow.date === defaults.today.date
      ? { ...tomorrow, date: defaults.today.date }
      : defaults.today;
    tomorrow = defaults.tomorrow;
  } else if (tomorrow.date !== defaults.tomorrow.date) {
    tomorrow = defaults.tomorrow;
  }

  return {
    version: 1,
    dailyGoalMinutes: Number.isFinite(parsedGoal)
      ? Math.min(720, Math.max(15, Math.round(parsedGoal)))
      : defaults.dailyGoalMinutes,
    today,
    tomorrow
  };
}

export function summarizeFocusLogs(logs = [], tasks = [], dateKey = getLocalDateKey()) {
  const todayLogs = logs.filter((log) => {
    if (log?.date) return log.date === dateKey;
    return Number.isFinite(log?.timestamp) && getLocalDateKey(new Date(log.timestamp)) === dateKey;
  });
  const totalSeconds = todayLogs.reduce((sum, log) => sum + Math.max(0, Number(log.seconds) || 0), 0);
  const byTask = new Map();

  logs.forEach((log) => {
    if (!log?.taskId) return;
    const current = byTask.get(log.taskId) || { seconds: 0, sessions: 0 };
    current.seconds += Math.max(0, Number(log.seconds) || 0);
    current.sessions += 1;
    byTask.set(log.taskId, current);
  });

  const taskAccuracy = tasks.map((task) => {
    const actual = byTask.get(task.taskId) || { seconds: 0, sessions: 0 };
    const estimatedMinutes = task.estPomodoros * 25;
    const actualMinutes = Math.round(actual.seconds / 60);
    return {
      ...task,
      estimatedMinutes,
      actualMinutes,
      sessions: actual.sessions,
      varianceMinutes: actualMinutes - estimatedMinutes
    };
  }).filter((task) => task.actualMinutes > 0 || task.completed);

  return {
    totalSeconds,
    totalMinutes: Math.round(totalSeconds / 60),
    sessions: todayLogs.length,
    taskAccuracy
  };
}

export function estimatePlanFinish(priorityTasks = [], focusedMinutes = 0, now = new Date()) {
  const plannedMinutes = priorityTasks.reduce(
    (sum, task) => sum + Math.max(1, Number(task.estPomodoros) || 1) * 25,
    0
  );
  const remainingMinutes = Math.max(0, plannedMinutes - Math.max(0, focusedMinutes));
  return {
    plannedMinutes,
    remainingMinutes,
    finishAt: new Date(now.getTime() + remainingMinutes * 60 * 1000)
  };
}

const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export function buildFocusCsv(logs = []) {
  const header = ['Thời gian', 'Ngày', 'Môn', 'Nhiệm vụ', 'Phút'];
  const rows = logs.map((log) => [
    new Date(log.timestamp).toISOString(),
    log.date || '',
    log.subjectName || '',
    log.taskText || '',
    (Math.max(0, Number(log.seconds) || 0) / 60).toFixed(1)
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
}
