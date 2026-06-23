import { useState } from 'react';
import DatePicker from './DatePicker';
import { CATEGORIES } from '../constants';

function ExamForm({ exam, onSave, onClose }) {
  const getInitialDateTime = () => {
    if (exam && exam.datetime) {
      const date = new Date(exam.datetime);
      if (isNaN(date.getTime())) return '';
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date - tzOffset).toISOString().slice(0, 16);
    }
    return '';
  };

  const DEFAULT_HOURS = {
    final: 10,
    midterm: 6,
    assignment: 4,
    quiz: 2,
    other: 3
  };

  const [subject, setSubject] = useState(exam ? (exam.subject || '') : '');
  const [datetime, setDatetime] = useState(getInitialDateTime);
  const [category, setCategory] = useState(exam ? (exam.category || 'other') : 'other');
  const [targetHours, setTargetHours] = useState(exam ? (exam.targetHours || DEFAULT_HOURS[exam.category || 'other'] || 5) : 5);
  const [error, setError] = useState('');
  const [prevExam, setPrevExam] = useState(exam);

  if (exam !== prevExam) {
    setPrevExam(exam);
    if (exam) {
      setSubject(exam.subject || '');
      setCategory(exam.category || 'other');
      setTargetHours(exam.targetHours || DEFAULT_HOURS[exam.category || 'other'] || 5);
      if (exam.datetime) {
        const date = new Date(exam.datetime);
        if (!isNaN(date.getTime())) {
          const tzOffset = date.getTimezoneOffset() * 60000;
          const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);
          setDatetime(localISOTime);
        } else {
          setDatetime('');
        }
      } else {
        setDatetime('');
      }
    } else {
      setSubject('');
      setDatetime('');
      setCategory('other');
      setTargetHours(5);
    }
    setError('');
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      setError('Vui lòng nhập tên môn thi!');
      return;
    }

    if (!datetime) {
      setError('Vui lòng chọn ngày và giờ thi!');
      return;
    }

    const selectedDate = new Date(datetime);
    if (isNaN(selectedDate.getTime())) {
      setError('Ngày giờ thi không hợp lệ!');
      return;
    }

    // Validate year (2020-2100)
    const year = selectedDate.getFullYear();
    if (year < 2020 || year > 2100) {
      setError('Năm phải từ 2020 đến 2100!');
      return;
    }

    onSave({
      id: exam && exam.id ? exam.id : Date.now().toString(),
      subject: subject.trim(),
      datetime: selectedDate.toISOString(),
      category: category,
      targetHours: parseFloat(targetHours) || DEFAULT_HOURS[category] || 5,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {exam ? 'Chỉnh sửa lịch thi' : 'Thêm lịch thi mới'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Đóng modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ 
              color: '#ef4444', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              padding: '0.75rem 1rem', 
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="subject-input">Tên môn thi</label>
            <input
              id="subject-input"
              type="text"
              className="form-input"
              placeholder="Ví dụ: Giải tích 1, Lập trình Web..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength="50"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category-select">Phân loại môn thi</label>
            <select
              id="category-select"
              className="form-input"
              value={category}
              onChange={(e) => {
                const cat = e.target.value;
                setCategory(cat);
                setTargetHours(DEFAULT_HOURS[cat] || 3);
              }}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {Object.entries(CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="target-hours-input">Mục tiêu ôn tập (Số giờ học)</label>
            <input
              id="target-hours-input"
              type="number"
              min="1"
              max="100"
              className="form-input"
              placeholder="Ví dụ: 10"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ngày & Giờ thi</label>
            <DatePicker value={datetime} onChange={setDatetime} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExamForm;
