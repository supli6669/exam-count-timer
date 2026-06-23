import { useState, useEffect } from 'react';
import { getContributions } from '../utils/contributions';

function ContributionGraph() {
  const [contributions, setContributions] = useState(getContributions);

  // Sync state with localStorage via global event
  useEffect(() => {
    const handleUpdate = () => {
      setContributions(getContributions());
    };
    window.addEventListener('contributions-updated', handleUpdate);
    return () => {
      window.removeEventListener('contributions-updated', handleUpdate);
    };
  }, []);

  // Generate dates for the last 53 weeks (Sunday-aligned)
  const getGridDates = () => {
    const dates = [];
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 6 is Saturday
    
    // Offset to start on Sunday of the week 52 weeks ago
    const startOffset = currentDay + (52 * 7); 
    const start = new Date(today);
    start.setDate(today.getDate() - startOffset);
    
    for (let i = 0; i < 53 * 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      dates.push({
        date: d,
        dateStr,
        dayOfWeek: d.getDay()
      });
    }
    return dates;
  };

  const dates = getGridDates();
  
  // Group into 53 weeks of 7 days
  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  // Get month labels with their column index
  const getMonthLabels = () => {
    const labels = [];
    let lastMonth = -1;
    
    weeks.forEach((week, index) => {
      // Find if this week contains the start of a month
      const firstDay = week.find(day => day.date.getDate() <= 7);
      if (firstDay) {
        const month = firstDay.date.getMonth();
        if (month !== lastMonth && index < 50) { // Avoid last label overflow
          labels.push({ text: `Thg ${month + 1}`, index });
          lastMonth = month;
        }
      }
    });
    return labels;
  };

  const monthLabels = getMonthLabels();

  // Determine shading level based on commit count
  const getLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  // Stats
  const totalContributions = Object.values(contributions).reduce((sum, val) => sum + val, 0);
  
  // Max streak calculation
  const getStreak = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    let d = new Date();
    
    while (true) {
      const dateStr = d.toISOString().split('T')[0];
      if (contributions[dateStr] > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        // If it's today and 0, don't break yet (user might complete it later today)
        // But if it's yesterday and 0, break
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateStr !== todayStr) {
          break;
        }
      }
      d.setDate(d.getDate() - 1);
    }
    return maxStreak;
  };

  const streak = getStreak();

  return (
    <section className="contrib-section" aria-label="Bản đồ đóng góp học tập">
      <div className="contrib-header">
        <div>
          <h2 className="contrib-title">Lịch Sử Đóng Góp Học Tập (Study Commits)</h2>
          <p className="contrib-subtitle">
            Mỗi lần bạn hoàn thành 1 phiên Pomodoro hoặc check xong 1 mục tiêu học tập, ô lịch sẽ chuyển sang màu xanh đậm dần!
          </p>
        </div>
        <div className="contrib-summary-stats">
          <div className="contrib-stat">
            <span className="contrib-stat-val">{totalContributions}</span>
            <span className="contrib-stat-lbl">Đóng góp năm nay</span>
          </div>
          <div className="contrib-stat">
            <span className="contrib-stat-val">{streak} ngày</span>
            <span className="contrib-stat-lbl">Chuỗi học liên tục</span>
          </div>
        </div>
      </div>

      <div className="contrib-graph-card">
        <div className="contrib-graph-container">
          {/* Day of week labels */}
          <div className="contrib-days">
            <span></span>
            <span>T2</span>
            <span></span>
            <span>T4</span>
            <span></span>
            <span>T6</span>
            <span></span>
          </div>

          <div className="contrib-grid-wrapper">
            {/* Months labels row */}
            <div className="contrib-months">
              {monthLabels.map((lbl, idx) => (
                <span 
                  key={idx} 
                  className="contrib-month-label" 
                  style={{ gridColumnStart: lbl.index + 1 }}
                >
                  {lbl.text}
                </span>
              ))}
            </div>

            {/* Grid columns */}
            <div className="contrib-grid">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="contrib-column">
                  {week.map((day) => {
                    const count = contributions[day.dateStr] || 0;
                    const level = getLevel(count);
                    const formattedDate = day.date.toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    
                    return (
                      <div 
                        key={day.dateStr} 
                        className={`contrib-cell level-${level}`}
                        title={`${formattedDate}: ${count} đóng góp`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="contrib-legend">
          <span>Ít hơn</span>
          <div className="contrib-cell level-0"></div>
          <div className="contrib-cell level-1"></div>
          <div className="contrib-cell level-2"></div>
          <div className="contrib-cell level-3"></div>
          <div className="contrib-cell level-4"></div>
          <span>Nhiều hơn</span>
        </div>
      </div>
    </section>
  );
}

export default ContributionGraph;
