// Stable IDs make retries safe if saving the migration marker fails.
export function consolidateTasks(current = [], daily = [], recurring = {}) {
  const tasks = [...current];
  const ids = new Set(tasks.map(task => task.id));
  const append = (items, source) => {
    if (!Array.isArray(items)) return;
    items.forEach((task, index) => {
      if (!task || typeof task.text !== 'string' || !task.text.trim()) return;
      const id = `legacy-${source}-${task.id ?? index}`;
      if (ids.has(id)) return;
      tasks.push({ ...task, id, completed: Boolean(task.completed), estPomodoros: task.estPomodoros || 1 });
      ids.add(id);
    });
  };
  append(daily, 'daily-list');
  if (recurring && typeof recurring === 'object' && !Array.isArray(recurring)) {
    for (const period of ['daily', 'weekly', 'monthly', 'yearly']) append(recurring[period]?.tasks, period);
  }
  return tasks;
}
