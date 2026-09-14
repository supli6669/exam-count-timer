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
    exams: (Array.isArray(exams) ? exams : []).filter(exam => exam && typeof exam.id === 'string').map((exam) => ({
      ...exam,
      subject: typeof exam.subject === 'string' ? exam.subject : 'Môn học',
      tasks: Array.isArray(exam.tasks) ? exam.tasks.filter(task => task && typeof task.id === 'string' && typeof task.text === 'string').map(normalizeStudyTask) : []
    })),
    generalTasks: (Array.isArray(generalTasks) ? generalTasks : []).filter(task => task && typeof task.id === 'string' && typeof task.text === 'string').map(normalizeStudyTask)
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
