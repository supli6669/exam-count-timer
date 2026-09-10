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
