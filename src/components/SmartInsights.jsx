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
    
    // Custom event to update logs when pomodoro completes in the same tab
    window.addEventListener('studyLogsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studyLogsUpdated', handleStorageChange);
    };
  }, []);

  // Recalculate if studyLogs changed elsewhere
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('pomodoro_study_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length !== studyLogs.length) {
          setStudyLogs(parsed);
        }
      }
    }, 5000); // Check every 5s

    return () => clearInterval(interval);
  }, [studyLogs]);

  // Calculate subject study time
  const getSubjectStudyMinutes = (subjectId) => {
    const logs = studyLogs.filter(log => log.subjectId === subjectId);
    const totalSeconds = logs.reduce((sum, log) => sum + log.seconds, 0);
    return Math.round(totalSeconds / 60);
  };

  // Calculate historical study speed
  const totalCompletedTasks = exams.reduce((sum, exam) => {
    return sum + (exam.tasks ? exam.tasks.filter(t => t.completed).length : 0);
  }, 0);

  const totalStudyMinutes = Math.round(studyLogs.reduce((sum, log) => sum + log.seconds, 0) / 60);

  // Speed factor: average minutes spent per completed task
  const averageMinutesPerTask = totalCompletedTasks > 0 
    ? Math.max(20, Math.min(90, Math.round(totalStudyMinutes / totalCompletedTasks))) 
    : 40; // Default to 40 minutes per task

  // Dynamic target calculation based on exam category base hours + task workload * speed factor
  const getTargetPrepMinutes = (exam) => {
    const BASE_MINUTES = {
      final: 240,       // 4 hours base
      midterm: 150,     // 2.5 hours base
      assignment: 180,  // 3 hours base
      quiz: 60,         // 1 hour base
      other: 90         // 1.5 hours base
    };
    const base = BASE_MINUTES[exam.category || 'other'] || 120;
    const taskCount = exam.tasks ? exam.tasks.length : 0;
    return base + (taskCount * averageMinutesPerTask);
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
      
      const baseMinutes = {
        final: 240,
        midterm: 150,
        assignment: 180,
        quiz: 60,
        other: 90
      }[exam.category || 'other'] || 120;
      
      const taskCount = exam.tasks ? exam.tasks.length : 0;

      // Warning assessment
      let alertLevel = 'safe'; // 'safe' | 'warning' | 'danger'
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

      // Recommended daily minutes to reach target
      const remainingMins = Math.max(0, targetPrepMinutes - accumulatedMins);
      const dailyRecommended = daysLeft > 0 ? Math.ceil(remainingMins / daysLeft) : 0;

      return {
        ...exam,
        daysLeft,
        accumulatedMins,
        targetPrepMinutes,
        baseMinutes,
        taskCount,
        alertLevel,
        alertText,
        dailyRecommended,
        progressPercent: Math.min(100, Math.round((accumulatedMins / targetPrepMinutes) * 100))
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft); // Order by closest exam date

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
              <p className="insights-subtitle">Tự động phân tích và đưa ra kế hoạch học tập tối ưu</p>
            </div>
          </div>
        </div>

        {/* Growth Motivation Banner */}
        <div className={`insights-growth-banner type-${growthInsight.type}`}>
          <span className="growth-emoji">{growthInsight.emoji}</span>
          <span className="growth-text">{growthInsight.text}</span>
        </div>

        {/* Recommendations list */}
        <div className="insights-content">
          <h3 className="insights-section-heading">🎯 Đề xuất lịch ôn tập hôm nay:</h3>
          
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

                {/* Progress bar to target */}
                <div className="insights-progress-section">
                  <div className="insights-progress-labels">
                    <span>Đã học: <strong>{item.accumulatedMins} phút</strong></span>
                    <span>Mục tiêu: {item.targetPrepMinutes} phút ({(item.targetPrepMinutes / 60).toFixed(1)}h)</span>
                  </div>
                  <div className="insights-progress-bar">
                    <div 
                      className="insights-progress-fill" 
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                    📐 Ước tính: {(item.baseMinutes / 60).toFixed(1)}h (cơ bản) + {item.taskCount} task x {averageMinutesPerTask}m
                  </div>
                </div>

                {/* Daily Suggestion Text */}
                <div className="insights-suggestion-box">
                  {item.dailyRecommended > 0 ? (
                    <>
                      💡 Khuyên học hôm nay: <strong>{item.dailyRecommended} phút</strong> để kịp mục tiêu thi.
                    </>
                  ) : (
                    <>
                      🎉 Đã tích lũy đủ mục tiêu ôn tập ({(item.targetPrepMinutes / 60).toFixed(1)} giờ) cho môn này!
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SmartInsights;
