const clampEstimate = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(12, Math.max(1, parsed)) : 1;
};

const readDueDate = (due) => {
  if (typeof due === 'string') return due.slice(0, 10);
  if (typeof due?.date === 'string') return due.date.slice(0, 10);
  if (typeof due?.datetime === 'string') return due.datetime.slice(0, 10);
  return '';
};

export function mapTodoistTasks(payload) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.tasks)
        ? payload.tasks
        : [];

  return items
    .filter((item) => item && !item.is_deleted && !item.checked && !item.completed)
    .map((item) => ({
      text: String(item.content || item.title || item.name || '').trim().slice(0, 240),
      deadline: readDueDate(item.due || item.deadline),
      estPomodoros: clampEstimate(
        item.estPomodoros
        ?? item.estimated_pomodoros
        ?? item.duration?.amount
      ),
      urgent: Number(item.priority) >= 4,
      important: Number(item.priority) >= 2
    }))
    .filter((task) => task.text);
}

export function parseTaskImport(text) {
  return mapTodoistTasks(JSON.parse(text));
}
