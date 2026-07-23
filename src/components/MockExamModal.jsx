import { useEffect, useMemo, useState } from 'react';

export default function MockExamModal({ isOpen, onClose, exams = [] }) {
  const [subject, setSubject] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [questionCount, setQuestionCount] = useState(20);
  const [startedAt, setStartedAt] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [correct, setCorrect] = useState('');
  const active = startedAt !== null;
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setRemaining(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(id);
  }, [active]);
  const formatted = useMemo(() => `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`, [remaining]);
  const finish = () => {
    const score = Math.max(0, Math.min(questionCount, Number(correct) || 0));
    let records = [];
    try {
      const saved = JSON.parse(localStorage.getItem('mock_exam_results') || '[]');
      records = Array.isArray(saved) ? saved : [];
    } catch { /* Use the empty default when saved results are invalid. */ }
    localStorage.setItem('mock_exam_results', JSON.stringify([{ id: Date.now(), subject: subject || 'Tổng hợp', questionCount, correct: score, minutes, completedAt: Date.now() }, ...records].slice(0, 50)));
    setStartedAt(null); setCorrect(''); alert(`Hoàn thành: ${score}/${questionCount} câu đúng.`);
  };
  if (!isOpen) return null;
  return <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.8)', display: 'grid', placeItems: 'center', padding: '1rem' }}><div onClick={e => e.stopPropagation()} className="glass-panel" style={{ width: 'min(540px,100%)', padding: '1.5rem', border: '1px solid var(--border-glass)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><div><h2 style={{ margin: 0 }}>📝 Mock Exam</h2><p style={{ color: 'var(--text-secondary)' }}>Mô phỏng bài thi và lưu kết quả tự chấm.</p></div><button onClick={onClose}>✕</button></div>
    {!active ? <div style={{ display: 'grid', gap: '.9rem' }}><label>Môn<select value={subject} onChange={e => setSubject(e.target.value)}><option value="">Tổng hợp</option>{exams.map(exam => <option value={exam.subject} key={exam.id}>{exam.subject}</option>)}</select></label><label>Thời lượng (phút)<input type="number" min="5" max="240" value={minutes} onChange={e => setMinutes(Math.max(5, Math.min(240, Number(e.target.value) || 30)))} /></label><label>Số câu<input type="number" min="1" max="200" value={questionCount} onChange={e => setQuestionCount(Math.max(1, Math.min(200, Number(e.target.value) || 20)))} /></label><button className="btn btn-primary" onClick={() => { setRemaining(minutes * 60); setStartedAt(Date.now()); }}>Bắt đầu làm đề</button></div> : <div style={{ textAlign: 'center' }}><div style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem' }}>{formatted}</div><p>{subject || 'Tổng hợp'} · {questionCount} câu</p><label>Số câu đúng<input type="number" min="0" max={questionCount} value={correct} onChange={e => setCorrect(e.target.value)} /></label><div style={{ marginTop: '1rem' }}><button className="btn btn-primary" onClick={finish}>Nộp bài & lưu kết quả</button></div></div>}
  </div></div>;
}
