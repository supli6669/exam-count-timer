import { useState, useEffect } from 'react';

function ExamCard({ exam, onEdit, onDelete }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(exam.datetime) - new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPassed: true,
      totalMs: difference
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isPassed: false,
        totalMs: difference
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [exam.datetime]);

  // Determine urgency class & label
  let statusClass = 'status-safe';
  let badgeClass = 'safe';
  let badgeLabel = 'Còn xa';

  if (timeLeft.isPassed) {
    statusClass = 'status-passed';
    badgeClass = 'passed';
    badgeLabel = 'Đã diễn ra';
  } else {
    const totalDays = timeLeft.totalMs / (1000 * 60 * 60 * 24);
    if (totalDays < 2) {
      statusClass = 'status-urgent';
      badgeClass = 'urgent';
      badgeLabel = 'Khẩn cấp';
    } else if (totalDays < 7) {
      statusClass = 'status-warning';
      badgeClass = 'warning';
      badgeLabel = 'Sắp thi';
    }
  }

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} - ${day}/${month}/${year}`;
  };

  return (
    <div className={`exam-card ${statusClass}`}>
      <div className="exam-card-header">
        <div className="exam-info">
          <h3 className="exam-title">{exam.subject}</h3>
          <span className="exam-datetime">
            <svg viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 3H7v5h5v-5z"/>
            </svg>
            {formatDate(exam.datetime)}
          </span>
        </div>
        <span className={`urgency-badge ${badgeClass}`}>{badgeLabel}</span>
      </div>

      <div className="countdown-display">
        <div className="countdown-unit">
          <span className="countdown-value">
            {timeLeft.isPassed ? 0 : timeLeft.days}
          </span>
          <span className="countdown-label">Ngày</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-value">
            {timeLeft.isPassed ? 0 : timeLeft.hours}
          </span>
          <span className="countdown-label">Giờ</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-value">
            {timeLeft.isPassed ? 0 : timeLeft.minutes}
          </span>
          <span className="countdown-label">Phút</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-value">
            {timeLeft.isPassed ? 0 : timeLeft.seconds}
          </span>
          <span className="countdown-label">Giây</span>
        </div>
      </div>

      <div className="exam-card-actions">
        <button 
          className="btn-icon edit" 
          onClick={() => onEdit(exam)} 
          title="Sửa thông tin"
          aria-label={`Sửa môn ${exam.subject}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button 
          className="btn-icon delete" 
          onClick={() => onDelete(exam.id)} 
          title="Xóa lịch thi"
          aria-label={`Xóa môn ${exam.subject}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ExamCard;
