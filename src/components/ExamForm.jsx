import { useState, useEffect } from 'react';

function ExamForm({ exam, onSave, onClose }) {
  const [subject, setSubject] = useState('');
  const [datetime, setDatetime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (exam) {
      setSubject(exam.subject);
      // Format to yyyy-MM-ddThh:mm for datetime-local input
      const date = new Date(exam.datetime);
      const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
      setDatetime(localISOTime);
    } else {
      setSubject('');
      setDatetime('');
    }
    setError('');
  }, [exam]);

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

    onSave({
      id: exam ? exam.id : Date.now().toString(),
      subject: subject.trim(),
      datetime: selectedDate.toISOString(),
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
            <label className="form-label" htmlFor="datetime-input">Ngày & Giờ thi</label>
            <input
              id="datetime-input"
              type="datetime-local"
              className="form-input"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
            />
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
