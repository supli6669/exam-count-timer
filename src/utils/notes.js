export const NOTES_KEY = 'exam_countdown_notes';
export const NOTES_MIGRATION_KEY = 'notes_consolidated_v1';

export function consolidateNotes(notes, thoughts, now = Date.now()) {
  const result = Array.isArray(notes) ? [...notes] : [];
  const ids = new Set(result.map(note => note.id));
  if (!Array.isArray(thoughts)) return result;
  thoughts.forEach((thought, index) => {
    if (!thought || typeof thought.text !== 'string' || !thought.text.trim()) return;
    const id = `legacy-thought-${thought.id ?? index}`;
    if (ids.has(id)) return;
    result.push({
      id,
      title: thought.text.trim().slice(0, 80),
      content: thought.text,
      tags: thought.resolved ? ['Ghi nhanh', 'Đã xử lý'] : ['Ghi nhanh'],
      pinned: false,
      updatedAt: Number.isFinite(thought.createdAt) && thought.createdAt > 0 ? thought.createdAt : now
    });
    ids.add(id);
  });
  return result;
}

export function normalizeNotes(notes) {
  return (Array.isArray(notes) ? notes : []).filter(note => note && typeof note.id === 'string').map(note => ({
    ...note,
    title: typeof note.title === 'string' ? note.title : '',
    content: typeof note.content === 'string' ? note.content : '',
    tags: Array.isArray(note.tags) ? note.tags.filter(tag => typeof tag === 'string') : [],
    updatedAt: Number.isFinite(note.updatedAt) && Number.isFinite(new Date(note.updatedAt).getTime()) ? note.updatedAt : Date.now()
  }));
}
