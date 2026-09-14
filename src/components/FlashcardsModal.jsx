import { useModalFocus } from '../utils/useModalFocus';
import { persistentStorage } from '../utils/persistence';
import { useState, useEffect, useId } from 'react';
import { getDueFlashcards, getNextReviewDate } from '../utils/studyPlanner';

const INITIAL_CARDS = [
  { id: 'fc-1', question: 'Cơ sở dữ liệu: Khóa chính (Primary Key) là gì?', answer: 'Là thuộc tính hoặc tập thuộc tính xác định duy nhất một hàng trong bảng, không chứa giá trị NULL.', box: 1 },
  { id: 'fc-2', question: 'Cấu trúc dữ liệu: Độ phức tạp của thuật toán Quicksort trung bình là bao nhiêu?', answer: 'O(n log n). Trong trường hợp xấu nhất (xung đột pivot) là O(n²).', box: 2 },
  { id: 'fc-3', question: 'Mạng máy tính: Mô hình OSI gồm bao nhiêu tầng?', answer: '7 tầng: Vật lý, Liên kết dữ liệu, Mạng, Giao vận, Phiên, Trình diễn, Ứng dụng.', box: 3 }
];

export default function FlashcardsModal({ isOpen, onClose }) {
  const modalRef = useModalFocus(isOpen);
  const questionInputId = useId();
  const answerInputId = useId();
  const [cards, setCards] = useState(() => {
    try {
      const saved = persistentStorage.getItem('app_leitner_flashcards');
      const parsed = saved ? JSON.parse(saved) : INITIAL_CARDS;
      return Array.isArray(parsed) ? parsed.filter(card => card && typeof card.question === 'string' && typeof card.answer === 'string').map(card => ({ ...card, box: Number.isInteger(card.box) && card.box >= 1 && card.box <= 5 ? card.box : 1 })) : [];
    } catch (e) {
      console.warn('Could not parse flashcards:', e);
      return INITIAL_CARDS;
    }
  });

  const [activeBox, setActiveBox] = useState('due'); // due | 0 = all boxes
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    persistentStorage.setItem('app_leitner_flashcards', JSON.stringify(cards));
    window.dispatchEvent(new Event('flashcards-updated'));
  }, [cards]);

  const dueCards = getDueFlashcards(cards);
  const filteredCards = activeBox === 'due' ? dueCards : activeBox === 0 ? cards : cards.filter(c => c.box === activeBox);
  const currentCard = filteredCards[currentIndex] || null;

  const handleAnswer = (isCorrect) => {
    if (!currentCard) return;

    setCards(prev => prev.map(c => {
      if (c.id === currentCard.id) {
        const { nextBox, nextReviewDate } = getNextReviewDate(c.box, isCorrect);
        return { ...c, box: nextBox, nextReviewDate, lastReviewedAt: Date.now() };
      }
      return c;
    }));

    // In a filtered queue the answered card disappears; its successor takes this index.
    setIsFlipped(false);
    const { nextBox } = getNextReviewDate(currentCard.box, isCorrect);
    const leavesQueue = activeBox === 'due' || (activeBox !== 0 && nextBox !== activeBox);
    setCurrentIndex(prev => leavesQueue ? prev % Math.max(1, filteredCards.length - 1) : (prev + 1) % Math.max(1, filteredCards.length));
  };

  const handleCreateCard = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newCard = {
      id: `fc-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      box: 1,
      nextReviewDate: null
    };

    setCards(prev => [...prev, newCard]);
    setNewQuestion('');
    setNewAnswer('');
    setIsCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Thẻ ghi nhớ"
        tabIndex={-1}
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '650px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.8rem',
          borderRadius: '20px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-glass-focus)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🗂️</span> Thẻ Ghi Nhớ Leitner (Flashcards)
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Thuật toán lặp lại ngắt quãng (Spaced Repetition 5 Hộp)
            </p>
          </div>
          <button
            aria-label="Đóng thẻ ghi nhớ"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Box Filter Selector */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          <button onClick={() => { setActiveBox('due'); setCurrentIndex(0); setIsFlipped(false); }} style={{ padding: '0.35rem 0.75rem', borderRadius: '10px', border: activeBox === 'due' ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)', background: activeBox === 'due' ? 'var(--color-primary-glow)' : 'rgba(255,255,255,.04)', color: 'var(--text-primary)', cursor: 'pointer' }}>Đến hạn ({dueCards.length})</button>
          <button
            onClick={() => { setActiveBox(0); setCurrentIndex(0); setIsFlipped(false); }}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: activeBox === 0 ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)',
              background: activeBox === 0 ? 'var(--color-primary-glow)' : 'rgba(255, 255, 255, 0.04)',
              color: activeBox === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Tất cả ({cards.length})
          </button>
          {[1, 2, 3, 4, 5].map(bNum => {
            const count = cards.filter(c => c.box === bNum).length;
            return (
              <button
                key={bNum}
                onClick={() => { setActiveBox(bNum); setCurrentIndex(0); setIsFlipped(false); }}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: activeBox === bNum ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)',
                  background: activeBox === bNum ? 'var(--color-primary-glow)' : 'rgba(255, 255, 255, 0.04)',
                  color: activeBox === bNum ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Hộp {bNum} ({count})
              </button>
            );
          })}
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            onClick={() => setIsCreating(!isCreating)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--color-safe)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              cursor: 'pointer'
            }}
          >
            {isCreating ? '✕ Đóng Thêm Thẻ' : '+ Thêm Thẻ Mới'}
          </button>
        </div>

        {/* Create Form */}
        {isCreating && (
          <form onSubmit={handleCreateCard} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem', border: '1px solid var(--border-glass)' }}>
            <div style={{ marginBottom: '0.8rem' }}>
              <label htmlFor={questionInputId} style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mặt trước (Câu hỏi/Khái niệm):</label>
              <input
                id={questionInputId}
                type="text"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                placeholder="Nhập câu hỏi..."
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <label htmlFor={answerInputId} style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mặt sau (Đáp án/Giải thích):</label>
              <textarea
                id={answerInputId}
                value={newAnswer}
                onChange={e => setNewAnswer(e.target.value)}
                placeholder="Nhập câu trả lời..."
                rows={3}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>
            <button type="submit" style={{ padding: '0.45rem 1rem', background: 'var(--color-primary)', color: 'var(--on-accent)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Lưu Thẻ Ghi Nhớ
            </button>
          </form>
        )}

        {/* Flashcard 3D Card Display */}
        {filteredCards.length > 0 && currentCard ? (
          <div style={{ perspective: '1000px', margin: '1rem 0 1.5rem' }}>
            <button
              type="button"
              aria-pressed={isFlipped}
              aria-label={isFlipped ? 'Úp thẻ để xem câu hỏi' : 'Lật thẻ để xem đáp án'}
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                width: '100%',
                minHeight: '200px',
                borderRadius: '16px',
                background: isFlipped ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))' : 'rgba(255, 255, 255, 0.05)',
                border: isFlipped ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-glass)',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.4s ease, background 0.3s ease',
                transform: isFlipped ? 'rotateX(360deg)' : 'none',
                position: 'relative',
                font: 'inherit'
              }}
            >
              <span style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Hộp Leitner #{currentCard.box}
              </span>
              <span style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                {isFlipped ? '💡 ĐÁP ÁN' : '❓ CÂU HỎI'} (Nhấp hoặc nhấn Enter để lật)
              </span>

              <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {isFlipped ? currentCard.answer : currentCard.question}
              </span>
            </button>

            {/* Answer Controls */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button
                onClick={() => handleAnswer(false)}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: 'var(--color-urgent)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ❌ Chưa thuộc (Về Hộp 1)
              </button>
              <button
                onClick={() => handleAnswer(true)}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--color-safe)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ✅ Đã thuộc (Lên Hộp #{Math.min(5, currentCard.box + 1)})
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Không có thẻ ghi nhớ nào trong hộp này.
          </div>
        )}
      </div>
    </div>
  );
}
