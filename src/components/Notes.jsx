import { useEffect, useMemo, useState } from 'react';
import { safeJsonParse } from '../utils/storage';
import { consolidateNotes, NOTES_KEY, NOTES_MIGRATION_KEY } from '../utils/notes';

const makeNote = () => ({
  id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: '',
  content: '',
  tags: [],
  pinned: false,
  updatedAt: Date.now()
});

const formatUpdatedAt = (timestamp) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  }).format(date);
};

function Notes() {
  const [notes, setNotes] = useState(() => {
    const saved = safeJsonParse(NOTES_KEY, []);
    const current = Array.isArray(saved) ? saved : [];
    return localStorage.getItem(NOTES_MIGRATION_KEY) === 'true'
      ? current
      : consolidateNotes(current, safeJsonParse('focus_distractions_v1', []));
  });
  const [selectedId, setSelectedId] = useState(() => sessionStorage.getItem('notes_selected_id'));
  const [query, setQuery] = useState('');
  const [showEditor, setShowEditor] = useState(true);
  useEffect(() => {
    if (selectedId) sessionStorage.setItem('notes_selected_id', selectedId);
    else sessionStorage.removeItem('notes_selected_id');
  }, [selectedId]);

  useEffect(() => {
    // Persist immediately so switching tabs cannot cancel a pending note save.
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    localStorage.setItem(NOTES_MIGRATION_KEY, 'true');
  }, [notes]);

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN');
    return notes
      .filter((note) => !normalizedQuery || [note.title, note.content, ...(note.tags || [])]
        .join(' ').toLocaleLowerCase('vi-VN').includes(normalizedQuery))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [notes, query]);

  const selectedNote = notes.find((note) => note.id === selectedId) || null;

  const createNote = () => {
    const note = makeNote();
    setNotes((current) => [note, ...current]);
    setQuery('');
    setSelectedId(note.id);
    setShowEditor(true);
  };

  const updateNote = (patch) => {
    if (!selectedId) return;
    setNotes((current) => current.map((note) => note.id === selectedId
      ? { ...note, ...patch, updatedAt: Date.now() }
      : note));
  };

  const deleteSelectedNote = () => {
    if (!selectedNote) return;
    setNotes((current) => current.filter((note) => note.id !== selectedNote.id));
    setSelectedId(null);
  };

  const updateTags = (value) => {
    const tags = [...new Set(value.split(',').map((tag) => tag.trim()).filter(Boolean))].slice(0, 8);
    updateNote({ tags });
  };

  return (
    <section className={`notes-workspace ${selectedNote && showEditor ? 'show-note-editor' : ''}`} aria-label="Sổ tay học tập">
      <aside className="notes-sidebar">
        <div className="notes-sidebar-header">
          <div>
            <p className="section-kicker">Ý TƯỞNG & KIẾN THỨC</p>
            <h2>Sổ tay</h2>
            <p>Lưu nhanh ý tưởng, công thức và kế hoạch ôn tập.</p>
          </div>
          <button className="notes-add-btn" type="button" onClick={createNote}>
            <span aria-hidden="true">＋</span> Ghi chú mới
          </button>
        </div>

        <label className="notes-search">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm trong sổ tay..." aria-label="Tìm ghi chú" />
        </label>

        <div className="notes-list" aria-live="polite">
          {visibleNotes.map((note) => (
            <button
              className={`note-list-item ${selectedId === note.id ? 'active' : ''}`}
              key={note.id}
              type="button"
              onClick={() => { setSelectedId(note.id); setShowEditor(true); }}
            >
              <span className="note-list-title">{note.pinned && '📌 '}{note.title || 'Ghi chú chưa có tiêu đề'}</span>
              <span className="note-list-preview">{note.content || 'Chưa có nội dung'}</span>
              <span className="note-list-date">{formatUpdatedAt(note.updatedAt)}</span>
            </button>
          ))}
          {visibleNotes.length === 0 && (
            <div className="notes-list-empty">{query ? 'Không tìm thấy ghi chú phù hợp.' : 'Chưa có ghi chú nào. Hãy tạo ghi chú đầu tiên.'}</div>
          )}
        </div>
      </aside>

      <div className="note-editor" key={selectedNote?.id || 'empty'}>
        <button type="button" className="btn btn-secondary notes-back" onClick={() => setShowEditor(false)}>← Danh sách ghi chú</button>
        {selectedNote ? (
          <>
            <div className="note-editor-toolbar">
              <span className="save-status">Tự động lưu · {formatUpdatedAt(selectedNote.updatedAt)}</span>
              <div className="note-editor-actions">
                <button type="button" className={`note-icon-button ${selectedNote.pinned ? 'is-active' : ''}`} onClick={() => updateNote({ pinned: !selectedNote.pinned })} aria-pressed={selectedNote.pinned} title="Ghim ghi chú">📌</button>
                <button type="button" className="note-icon-button danger" onClick={deleteSelectedNote} title="Xóa ghi chú" aria-label="Xóa ghi chú">🗑</button>
              </div>
            </div>
            <input className="note-title-input" value={selectedNote.title} onChange={(event) => updateNote({ title: event.target.value.slice(0, 120) })} placeholder="Tiêu đề ghi chú" aria-label="Tiêu đề ghi chú" />
            <label className="note-tags-field">
              <span>Nhãn</span>
              <input value={(selectedNote.tags || []).join(', ')} onChange={(event) => updateTags(event.target.value)} placeholder="Ví dụ: toán, công thức, tuần 1" aria-label="Nhãn, ngăn cách bằng dấu phẩy" />
            </label>
            <textarea className="note-content-input" value={selectedNote.content} onChange={(event) => updateNote({ content: event.target.value })} placeholder={'Viết điều bạn cần nhớ…\n\nDùng nhãn để tìm lại ghi chú sau này.'} aria-label="Nội dung ghi chú" />
            <div className="note-editor-footer">{selectedNote.content.length.toLocaleString('vi-VN')} ký tự</div>
          </>
        ) : (
          <div className="notes-empty-editor">
            <span aria-hidden="true">📝</span>
            <h2>Chọn một ghi chú hoặc tạo ghi chú mới</h2>
            <p>Sổ tay được tự động lưu ngay trên thiết bị của bạn.</p>
            <button className="btn btn-primary" type="button" onClick={createNote}>Tạo ghi chú</button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Notes;
