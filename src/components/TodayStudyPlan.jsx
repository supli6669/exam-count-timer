import { memo, useEffect, useMemo, useState } from 'react';
import { buildTodayStudyPlan } from '../utils/studyPlanner';

const loadCards = () => {
  try {
    const cards = JSON.parse(localStorage.getItem('app_leitner_flashcards') || '[]');
    return Array.isArray(cards) ? cards : [];
  } catch { return []; }
};

function TodayStudyPlan({ exams, generalTasks, onOpenFlashcards, onOpenPomodoro }) {
  const [cards, setCards] = useState(loadCards);
  useEffect(() => {
    const refresh = () => setCards(loadCards());
    window.addEventListener('flashcards-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('flashcards-updated', refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const plan = useMemo(() => buildTodayStudyPlan(exams, generalTasks, cards), [exams, generalTasks, cards]);
  return <section className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--border-glass)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div><h2 style={{ margin: 0, fontSize: '1.05rem' }}>✨ Hôm nay học gì?</h2><p style={{ margin: '.3rem 0 0', color: 'var(--text-secondary)', fontSize: '.85rem' }}>Ưu tiên được tạo từ hạn thi, task và thẻ đến hạn.</p></div>
      <button className="btn btn-primary" onClick={onOpenPomodoro}>Bắt đầu tập trung</button>
    </div>
    {plan.length ? <ol style={{ margin: '1rem 0 0', paddingLeft: '1.25rem', display: 'grid', gap: '.6rem' }}>{plan.map(item => <li key={`${item.type}-${item.id}`}><strong>{item.subject}:</strong> {item.text} <span style={{ color: 'var(--text-secondary)' }}>· {item.minutes} phút</span>{item.type === 'flashcards' && <button onClick={onOpenFlashcards} style={{ marginLeft: '.6rem' }}>Ôn ngay</button>}</li>)}</ol> : <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 0' }}>Chưa có việc cần ưu tiên. Hãy thêm task hoặc flashcard để bắt đầu.</p>}
  </section>;
}

export default memo(TodayStudyPlan);
