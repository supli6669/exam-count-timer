import { memo } from 'react';
import { CATEGORIES } from '../constants';
import { downloadICalFile } from '../utils/icsExport';
import { calculateExamReadiness } from '../utils/readinessIndex';
import { useCurrentTime } from '../utils/clock';
import { calculateTimeLeft } from '../utils/examTime';

const ExamCountdown = memo(function ExamCountdown({ datetime }) {
  const now = useCurrentTime();
  const timeLeft = calculateTimeLeft(datetime, now);
  const isFarFuture = !timeLeft.isPassed && timeLeft.days > 365;

  if (isFarFuture) {
    return (
      <div style={{ margin: '1.25rem 0', padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,.03)', borderRadius: '14px' }}>
        Còn hơn một năm mới đến kỳ thi — hãy thêm đề cương và task để bắt đầu chuẩn bị dần.
      </div>
    );
  }

  return (
    <div className="countdown-display">
      <div className="countdown-unit">
        <span className="countdown-value">{timeLeft.isPassed ? 0 : timeLeft.days}</span>
        <span className="countdown-label">Ngày</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-value">{timeLeft.isPassed ? 0 : timeLeft.hours}</span>
        <span className="countdown-label">Giờ</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-value">{timeLeft.isPassed ? 0 : timeLeft.minutes}</span>
        <span className="countdown-label">Phút</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-value">{timeLeft.isPassed ? 0 : timeLeft.seconds}</span>
        <span className="countdown-label">Giây</span>
      </div>
    </div>
  );
});

function ExamCard({ exam, onEdit, onDelete, onOpenTasks }) {
  // The full card is intentionally not subscribed to the one-second clock.
  // Only ExamCountdown updates each second, keeping task forms and ERI content still.
  const timeLeft = calculateTimeLeft(exam.datetime);
  // Get day of week in Vietnamese
  const getDayOfWeek = (dateStr) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

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
    const dayOfWeek = getDayOfWeek(dateStr);
    return `${dayOfWeek}, ${hours}:${minutes} - ${day}/${month}/${year}`;
  };

  const catKey = exam.category || 'other';
  const catInfo = CATEGORIES[catKey] || CATEGORIES.other;

  const tasks = exam.tasks || [];
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const readiness = calculateExamReadiness(exam);
  return (
    <div className={`exam-card ${statusClass}`}>
      <div className="exam-card-header">
        <div className="exam-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <h3 className="exam-title" style={{ margin: 0 }}>{exam.subject}</h3>
            <span className={`category-tag ${catInfo.class}`}>{catInfo.name}</span>
            <span className="credits-tag" style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.15rem 0.4rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              borderRadius: '6px'
            }}>
              {exam.credits || 3} tín chỉ
            </span>
          </div>
          <span className="exam-datetime">
            <svg viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 3H7v5h5v-5z"/>
            </svg>
            {formatDate(exam.datetime)}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
          <span className={`urgency-badge ${badgeClass}`}>{badgeLabel}</span>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.15rem 0.5rem',
            borderRadius: '12px',
            background: `${readiness.color}18`,
            color: readiness.color,
            border: `1px solid ${readiness.color}40`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }} title={readiness.score === null ? 'Thêm task hoặc ghi nhận phiên học để tính ERI.' : `Chỉ số ERI Sẵn Sàng: ${readiness.score}%`}>
            📊 {readiness.score === null ? readiness.label : `ERI: ${readiness.score}% (${readiness.label})`}
          </span>
        </div>
      </div>


      <ExamCountdown datetime={exam.datetime} />

      {/* Task Completion Progress Bar (Always Visible) */}
      <div className="exam-tasks-progress-container" style={{ marginTop: '0.8rem' }}>
        <div className="tasks-progress-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
          <span>Tiến độ hoàn thành</span>
          <span>{completedTasksCount}/{totalTasksCount} việc ({progressPercent}%)</span>
        </div>
        <div className="tasks-progress-track" style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <div className="tasks-progress-fill" style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>


      {/* Collapsible Tasks Section */}
      <div className="exam-card-actions">
        <button 
          className="btn btn-secondary btn-tasks-toggle-text"
          onClick={onOpenTasks}
          title="Xem danh sách việc cần làm"
          style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.8rem', justifyContent: 'center' }}
        >
          📋 {totalTasksCount > 0 ? `Nhiệm vụ (${completedTasksCount}/${totalTasksCount})` : 'Việc cần làm'}
        </button>
        
        <button 
          className="btn-icon calendar-export" 
          onClick={() => downloadICalFile(exam, `lich-thi-${exam.subject.toLowerCase().replace(/\s+/g, '-')}.ics`)} 
          title="Xuất file iCalendar (.ics) để đồng bộ Google/Apple Calendar"
          aria-label={`Xuất lịch thi môn ${exam.subject} ra file ics`}
          style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.25)' }}
        >
          📅
        </button>
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

export default memo(ExamCard);
