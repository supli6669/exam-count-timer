import { useState, useEffect } from 'react';

function SmartInsights({ exams = [] }) {
  const [studyLogs, setStudyLogs] = useState(() => {
    const saved = localStorage.getItem('pomodoro_study_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Reload logs when component mounts or when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('pomodoro_study_logs');
      setStudyLogs(saved ? JSON.parse(saved) : []);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('studyLogsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studyLogsUpdated', handleStorageChange);
    };
  }, []);

  // Sync logs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('pomodoro_study_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length !== studyLogs.length) {
          setStudyLogs(parsed);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [studyLogs]);

  // Calculate subject study time
  const getSubjectStudyMinutes = (subjectId) => {
    const logs = studyLogs.filter(log => log.subjectId === subjectId);
    const totalSeconds = logs.reduce((sum, log) => sum + log.seconds, 0);
    return Math.round(totalSeconds / 60);
  };

  // Dynamic target calculation based on credits
  const getTargetPrepMinutes = (exam) => {
    const FACTOR_MINUTES = {
      final: 180,       // 3 hours per credit
      midterm: 120,     // 2 hours per credit
      assignment: 90,   // 1.5 hours per credit
      quiz: 45,         // 45 mins per credit
      other: 60         // 1 hour per credit
    };
    const factor = FACTOR_MINUTES[exam.category || 'other'] || 60;
    const credits = exam.credits || 3;
    return credits * factor;
  };

  const now = new Date();

  // Upcoming exams analysis
  const insights = exams
    .filter(exam => new Date(exam.datetime) > now)
    .map(exam => {
      const examDate = new Date(exam.datetime);
      const diffMs = examDate - now;
      const daysLeft = diffMs / (1000 * 60 * 60 * 24);
      const accumulatedMins = getSubjectStudyMinutes(exam.id);
      const targetPrepMinutes = getTargetPrepMinutes(exam);
      
      const factorMinutes = {
        final: 180,
        midterm: 120,
        assignment: 90,
        quiz: 45,
        other: 60
      }[exam.category || 'other'] || 60;
      
      const credits = exam.credits || 3;

      // Warning assessment
      let alertLevel = 'safe';
      let alertText = 'Tiến độ bình thường';

      if (daysLeft < 3) {
        if (accumulatedMins < targetPrepMinutes * 0.6) {
          alertLevel = 'danger';
          alertText = '🚨 CẦN ÔN THI GẤP!';
        } else {
          alertLevel = 'safe';
          alertText = '✅ Sẵn sàng thi';
        }
      } else if (daysLeft < 7) {
        if (accumulatedMins < targetPrepMinutes * 0.3) {
          alertLevel = 'warning';
          alertText = '⚠️ Ít học bài';
        } else {
          alertLevel = 'safe';
          alertText = '✅ Đang ôn tốt';
        }
      }

      // Recommended daily minutes
      const remainingMins = Math.max(0, targetPrepMinutes - accumulatedMins);
      const dailyRecommended = daysLeft > 0 ? Math.ceil(remainingMins / daysLeft) : 0;

      const tasks = exam.tasks || [];
      const completedTasks = tasks.filter(t => t.completed).length;
      const totalTasks = tasks.length;
      const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...exam,
        daysLeft,
        accumulatedMins,
        targetPrepMinutes,
        factorMinutes,
        credits,
        alertLevel,
        alertText,
        dailyRecommended,
        progressPercent: Math.min(100, Math.round((accumulatedMins / targetPrepMinutes) * 100)),
        completedTasks,
        totalTasks,
        taskPercent
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Chronotype Analysis
  const getChronotypeData = () => {
    const hourStats = Array(24).fill(0);
    studyLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const hour = logDate.getHours();
      hourStats[hour] += Math.round(log.seconds / 60);
    });

    let morningMins = 0;   // 5:00 - 11:59
    let afternoonMins = 0; // 12:00 - 17:59
    let nightMins = 0;     // 18:00 - 4:59

    hourStats.forEach((mins, hour) => {
      if (hour >= 5 && hour < 12) {
        morningMins += mins;
      } else if (hour >= 12 && hour < 18) {
        afternoonMins += mins;
      } else {
        nightMins += mins;
      }
    });

    let type = 'neutral';
    let title = 'Nhịp Sinh Học Ôn Tập';
    let emoji = '⏰';
    let description = 'Hoàn thành thêm một vài phiên học để hệ thống phân tích nhịp sinh học của bạn.';

    const totalStudied = morningMins + afternoonMins + nightMins;

    if (totalStudied > 10) {
      if (morningMins >= afternoonMins && morningMins >= nightMins) {
        type = 'morning';
        title = 'Sơn Ca Đón Sớm (Early Bird)';
        emoji = '🌅';
        description = 'Bạn học tập hiệu quả nhất vào buổi sáng. Hãy tận dụng khoảng thời gian từ 8h đến 11h sáng để giải quyết các môn ôn tập khó nhằn nhất nhé!';
      } else if (afternoonMins >= morningMins && afternoonMins >= nightMins) {
        type = 'afternoon';
        title = 'Chiến Binh Chiều Tà (Afternoon Warrior)';
        emoji = '☀️';
        description = 'Bạn tập trung cực kỳ tốt vào buổi chiều. Khung giờ từ 14h đến 17h là lúc trí óc bạn hoạt động tối ưu để ôn luyện và giải đề.';
      } else {
        type = 'night';
        title = 'Cú Đêm Ôn Luyện (Night Owl)';
        emoji = '🦉';
        description = 'Bạn là một chú cú đêm thực thụ! Sự yên tĩnh của không gian từ 20h đến nửa đêm giúp bạn tiếp thu kiến thức tốt và làm bài hiệu quả nhất.';
      }
    }

    return { hourStats, type, title, emoji, description, totalStudied };
  };

  const chronotype = getChronotypeData();
  const maxHourMins = Math.max(...chronotype.hourStats, 1);

  // Growth Analysis (Today vs. Yesterday)
  const getGrowthInsight = () => {
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayLogs = studyLogs.filter(log => log.date === todayStr);
    const yesterdayLogs = studyLogs.filter(log => log.date === yesterdayStr);

    const todayMins = Math.round(todayLogs.reduce((sum, log) => sum + log.seconds, 0) / 60);
    const yesterdayMins = Math.round(yesterdayLogs.reduce((sum, log) => sum + log.seconds, 0) / 60);

    if (todayMins > yesterdayMins) {
      const diff = todayMins - yesterdayMins;
      return {
        type: 'positive',
        emoji: '📈',
        text: `Hôm nay bạn học nhiều hơn hôm qua ${diff} phút! Giữ phong độ nhé.`
      };
    } else if (todayMins < yesterdayMins && yesterdayMins > 0) {
      const diff = yesterdayMins - todayMins;
      return {
        type: 'negative',
        emoji: '📉',
        text: `Hôm nay tiến độ học đang chậm hơn hôm qua ${diff} phút. Thêm 1 phiên Pomodoro nào!`
      };
    } else if (todayMins === 0 && yesterdayMins === 0) {
      return {
        type: 'neutral',
        emoji: '🎯',
        text: 'Hôm nay chưa học phiên Pomodoro nào. Hãy bắt đầu ngay để kích hoạt chuỗi tích lũy!'
      };
    } else {
      return {
        type: 'neutral',
        emoji: '🔥',
        text: `Hôm nay bạn đã ôn tập được ${todayMins} phút. Bằng chỉ số ngày hôm qua!`
      };
    }
  };

  const growthInsight = getGrowthInsight();

  if (insights.length === 0) {
    return (
      <section className="smart-insights-section" aria-label="Smart Study Insights">
        <div className="insights-card empty-insights">
          <span style={{ fontSize: '1.5rem' }}>🧠</span>
          <h3>Trình Phân Tích Thông Minh</h3>
          <p>Không có môn thi sắp tới nào để phân tích dữ liệu học tập. Hãy thêm lịch thi để nhận gợi ý!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="smart-insights-section" aria-label="Trình phân tích học tập thông minh">
      <div className="insights-card">
        <div className="insights-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="insights-icon">🧠</span>
            <div>
              <h2 className="insights-title">Trình Phân Tích & Cảnh Báo Ôn Thi</h2>
              <p className="insights-subtitle">Tự động phân tích dữ liệu và gợi ý lộ trình tập trung</p>
            </div>
          </div>
        </div>

        {/* Growth Motivation Banner */}
        <div className={`insights-growth-banner type-${growthInsight.type}`}>
          <span className="growth-emoji">{growthInsight.emoji}</span>
          <span className="growth-text">{growthInsight.text}</span>
        </div>

        {/* Recommendations List */}
        <div className="insights-content">
          <h3 className="insights-section-heading">🎯 Đề xuất ôn thi hôm nay:</h3>
          <div className="insights-grid">
            {insights.map((item) => (
              <div key={item.id} className={`insights-item alert-${item.alertLevel}`}>
                <div className="insights-item-top">
                  <div>
                    <h4 className="insights-item-subject">{item.subject}</h4>
                    <span className="insights-item-days">Còn {Math.ceil(item.daysLeft)} ngày thi</span>
                  </div>
                  <span className={`insights-badge ${item.alertLevel}`}>
                    {item.alertText}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="insights-progress-section">
                  <div className="insights-progress-labels" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    <span>Đã học: <strong>{item.accumulatedMins}/{item.targetPrepMinutes} phút</strong> ({item.progressPercent}%)</span>
                    <span>Nhiệm vụ: <strong>{item.completedTasks}/{item.totalTasks} việc</strong> ({item.taskPercent}%)</span>
                  </div>
                  <div className="insights-progress-bar">
                    <div 
                      className="insights-progress-fill" 
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                    📐 Ước tính: {item.credits || 3} tín chỉ x {item.factorMinutes} phút/tín chỉ
                  </div>
                </div>

                {/* Daily Suggestion */}
                <div className="insights-suggestion-box">
                  {item.dailyRecommended > 0 ? (
                    <>
                      💡 Khuyên ôn hôm nay: <strong>{item.dailyRecommended} phút</strong> để đảm bảo kịp mục tiêu thi.
                    </>
                  ) : (
                    <>
                      🎉 Đã đạt mục tiêu ôn thi tích lũy cho môn học này!
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chronotype & Heatmap Section */}
        <div className="insights-chronotype-section">
          <div className="chrono-header">
            <span className="chrono-emoji" style={{ fontSize: '1.4rem' }}>{chronotype.emoji}</span>
            <div>
              <h4 className="chrono-title">{chronotype.title}</h4>
              <p className="chrono-desc">{chronotype.description}</p>
            </div>
          </div>

          <div className="heatmap-container">
            <div className="heatmap-label-row">
              <span className="heatmap-section-title">📊 Bản đồ nhiệt tập trung (24 giờ):</span>
              <span className="heatmap-legend">
                <span>Ít học</span>
                <span className="legend-box level-0"></span>
                <span className="legend-box level-1"></span>
                <span className="legend-box level-2"></span>
                <span className="legend-box level-3"></span>
                <span className="legend-box level-4"></span>
                <span>Chăm học</span>
              </span>
            </div>

            <div className="heatmap-grid">
              {chronotype.hourStats.map((mins, hour) => {
                let levelClass = 'level-0';
                if (mins > 0) {
                  const ratio = mins / maxHourMins;
                  if (ratio <= 0.25) levelClass = 'level-1';
                  else if (ratio <= 0.5) levelClass = 'level-2';
                  else if (ratio <= 0.75) levelClass = 'level-3';
                  else levelClass = 'level-4';
                }

                const hourStr = String(hour).padStart(2, '0') + ':00';

                return (
                  <div 
                    key={hour} 
                    className={`heatmap-cell ${levelClass}`}
                    title={`${hourStr}: ${mins} phút tập trung`}
                  >
                    <span className="cell-tooltip">{hourStr}<br /><strong>{mins} phút</strong></span>
                  </div>
                );
              })}
            </div>
            
            <div className="heatmap-time-axis">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>23:00</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default SmartInsights;
