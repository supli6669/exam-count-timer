import { useState, useMemo, useEffect } from 'react';
import { CATEGORIES } from '../constants';

function CalendarView({ exams, onEdit, onDelete, onCreate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [, setTick] = useState(0);

  // Real-time tick for updating countdowns in details popup
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Group exams by date based on local date
  const examsByDate = useMemo(() => {
    const grouped = {};
    exams.forEach(exam => {
      const examDate = new Date(exam.datetime);
      const dateKey = `${examDate.getFullYear()}-${examDate.getMonth()}-${examDate.getDate()}`;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(exam);
    });
    // Sort exams within each day by time
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    });
    return grouped;
  }, [exams]);

  // Derive selected day exams directly in render (avoids useEffect syncing warnings)
  const selectedDayExams = useMemo(() => {
    if (!selectedDateStr) return null;
    const parts = selectedDateStr.split('-');
    if (parts.length !== 3) return null;
    const dKey = `${parts[0]}-${parseInt(parts[1]) - 1}-${parseInt(parts[2])}`;
    const dayExams = examsByDate[dKey] || [];
    return dayExams.length > 0 ? dayExams : null;
  }, [examsByDate, selectedDateStr]);

  const handleMonthChange = (e) => {
    setCurrentDate(new Date(year, parseInt(e.target.value), 1));
  };

  const handleYearChange = (e) => {
    setCurrentDate(new Date(parseInt(e.target.value), month, 1));
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const diff = new Date(exam.datetime) - now;
    const days = diff / (1000 * 60 * 60 * 24);

    if (diff <= 0) return 'passed';
    if (days < 2) return 'urgent';
    if (days < 7) return 'warning';
    return 'safe';
  };

  // Helper to format remaining time
  const getRemainingTimeText = (datetimeStr) => {
    const difference = new Date(datetimeStr) - new Date();
    if (difference <= 0) {
      return 'Đã diễn ra';
    }
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    let parts = [];
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0 || days > 0) parts.push(`${hours} giờ`);
    parts.push(`${minutes} phút`);
    parts.push(`${seconds} giây`);

    return `Còn ${parts.join(' ')}`;
  };

  const handleDayClick = (day) => {
    const dateKey = `${year}-${month}-${day}`;
    const dayExams = examsByDate[dateKey] || [];

    if (dayExams.length > 0) {
      setSelectedDateStr(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    } else {
      // Direct create on that day (defaulting to 09:00 AM)
      const targetDate = new Date(year, month, day, 9, 0);
      const tzOffset = targetDate.getTimezoneOffset() * 60000;
      const localISOTime = new Date(targetDate - tzOffset).toISOString().slice(0, 16);
      onCreate(localISOTime);
    }
  };

  const handleAddForDay = () => {
    const parts = selectedDateStr.split('-');
    if (parts.length === 3) {
      const targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 9, 0);
      const tzOffset = targetDate.getTimezoneOffset() * 60000;
      const localISOTime = new Date(targetDate - tzOffset).toISOString().slice(0, 16);
      onCreate(localISOTime);
      // Close the details modal when opening form
      setSelectedDateStr('');
    }
  };

  const calendarDays = [];

  // Empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Generate Year range (2020-2100)
  const years = [];
  for (let y = 2020; y <= 2100; y++) {
    years.push(y);
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header-panel">
        <div className="calendar-header-selectors">
          <button className="btn-icon" onClick={goToPreviousMonth} aria-label="Tháng trước">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div className="calendar-selectors">
            <select value={month} onChange={handleMonthChange} aria-label="Chọn tháng" className="calendar-select">
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
            <select value={year} onChange={handleYearChange} aria-label="Chọn năm" className="calendar-select">
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button className="btn-icon" onClick={goToNextMonth} aria-label="Tháng sau">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        
        <button className="btn btn-secondary btn-today" onClick={goToToday}>
          Hôm nay
        </button>
      </div>
      
      <div className="calendar-grid">
        {/* Day names header */}
        {dayNames.map((day, index) => (
          <div key={index} className="calendar-day-name">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="calendar-day empty"></div>;
          }
          
          const dateKey = `${year}-${month}-${day}`;
          const dayExams = examsByDate[dateKey] || [];
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          
          return (
            <div 
              key={index} 
              className={`calendar-day ${isToday ? 'today' : ''} ${dayExams.length > 0 ? 'has-exams' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <div className="calendar-day-header">
                <span className="day-number">{day}</span>
                <span className="add-exam-hover-btn" title="Thêm môn thi cho ngày này" onClick={(e) => {
                  e.stopPropagation();
                  const targetDate = new Date(year, month, day, 9, 0);
                  const tzOffset = targetDate.getTimezoneOffset() * 60000;
                  const localISOTime = new Date(targetDate - tzOffset).toISOString().slice(0, 16);
                  onCreate(localISOTime);
                }}>+</span>
              </div>
              <div className="day-exams-container">
                {dayExams.slice(0, 3).map((exam) => {
                  const catInfo = CATEGORIES[exam.category || 'other'] || CATEGORIES.other;
                  const status = getExamStatus(exam);
                  const examTime = new Date(exam.datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      key={exam.id}
                      className={`calendar-exam-badge ${catInfo.class} status-border-${status}`}
                      title={`${examTime} - ${exam.subject}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open details modal
                        setSelectedDateStr(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                      }}
                    >
                      <span className={`exam-status-dot ${status}`}></span>
                      <span className="exam-badge-time">{examTime}</span>
                      <span className="exam-badge-subject">{exam.subject}</span>
                    </div>
                  );
                })}
                {dayExams.length > 3 && (
                  <span className="more-exams-badge">+{dayExams.length - 3} môn khác</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="calendar-legend-container">
        <div className="calendar-legend">
          <span className="legend-title">Trạng thái:</span>
          <div className="legend-item">
            <span className="legend-dot urgent"></span>
            <span>Khẩn cấp (&lt; 2 ngày)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot warning"></span>
            <span>Sắp thi (&lt; 7 ngày)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot safe"></span>
            <span>An toàn</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot passed"></span>
            <span>Đã thi</span>
          </div>
        </div>

        <div className="calendar-legend categories">
          <span className="legend-title">Phân loại:</span>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <div key={key} className="legend-item">
              <span className={`legend-cat-badge ${cat.class}`}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDayExams && (
        <div className="modal-overlay" onClick={() => { setSelectedDateStr(''); }}>
          <div className="modal-content day-details-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Lịch thi ngày {selectedDateStr.split('-').reverse().join('/')}</h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Tổng số: {selectedDayExams.length} môn thi
                </p>
              </div>
              <button className="btn-icon" onClick={() => { setSelectedDateStr(''); }} aria-label="Đóng chi tiết">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="day-details-list">
              {selectedDayExams.map(exam => {
                const catInfo = CATEGORIES[exam.category || 'other'] || CATEGORIES.other;
                const status = getExamStatus(exam);
                const examDate = new Date(exam.datetime);
                const timeStr = examDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={exam.id} className={`day-details-item status-border-${status}`}>
                    <div className="details-item-main">
                      <div className="details-item-title-row">
                        <h3 className="details-item-title">{exam.subject}</h3>
                        <span className={`category-tag ${catInfo.class}`}>{catInfo.name}</span>
                      </div>
                      <div className="details-item-info">
                        <span className="details-item-time">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          Thời gian: {timeStr}
                        </span>
                        <span className={`details-item-countdown ${status}`}>
                          {getRemainingTimeText(exam.datetime)}
                        </span>
                      </div>
                    </div>
                    <div className="details-item-actions">
                      <button 
                        className="btn-icon edit" 
                        onClick={() => {
                          onEdit(exam);
                        }} 
                        title="Sửa môn thi"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="btn-icon delete" 
                        onClick={() => onDelete(exam.id)} 
                        title="Xóa môn thi"
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
              })}
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => { setSelectedDateStr(''); }}>
                Đóng
              </button>
              <button className="btn btn-primary" onClick={handleAddForDay}>
                Thêm môn thi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
