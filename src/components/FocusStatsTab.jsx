import React, { useState, useMemo } from 'react';
import { getLocalDateKey } from '../utils/date';

// Range calculation helpers (Pure functions defined outside component)
const getWeekRange = (offset) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sun
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek + (offset * 7));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getMonthRange = (offset) => {
  const today = new Date();
  const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end, year: d.getFullYear(), month: d.getMonth() };
};

const getYearRange = (offset) => {
  const today = new Date();
  const targetYear = today.getFullYear() + offset;
  const start = new Date(targetYear, 0, 1, 0, 0, 0, 0);
  const end = new Date(targetYear, 11, 31, 23, 59, 59, 999);
  return { start, end, year: targetYear };
};

// Helper to sum seconds in range (Pure function defined outside component)
const getRangeTotalMinutes = (studyLogs, range) => {
  const rangeLogs = studyLogs.filter(log => {
    const logTime = new Date(log.timestamp);
    return logTime >= range.start && logTime <= range.end;
  });
  return Math.round(rangeLogs.reduce((sum, log) => sum + log.seconds, 0) / 60);
};

const FocusStatsTab = React.memo(({
  studyLogs = [],
  breakLogs = [],
  exams = [],
  themeColor = '#8b5cf6',
  onClearStats = () => {}
}) => {
  // Local UI states for filters and tabs
  const [focusRange, setFocusRange] = useState('today'); // 'today' | 'week' | 'fourWeeks'
  const [statsMode, setStatsMode] = useState('week'); // 'week' | 'month' | 'year'
  const [statsDateOffset, setStatsDateOffset] = useState(0); 
  const [historySubTab, setHistorySubTab] = useState('day'); // 'day' | 'week' | 'month'

  // Nav Label for stats period
  const getNavigationLabel = () => {
    if (statsMode === 'week') {
      if (statsDateOffset === 0) return 'Tuần này';
      if (statsDateOffset === -1) return 'Tuần trước';
      const range = getWeekRange(statsDateOffset);
      const formatNum = (num) => String(num).padStart(2, '0');
      return `${formatNum(range.start.getDate())}/${formatNum(range.start.getMonth() + 1)} - ${formatNum(range.end.getDate())}/${formatNum(range.end.getMonth() + 1)}`;
    }
    
    if (statsMode === 'month') {
      if (statsDateOffset === 0) return 'Tháng này';
      if (statsDateOffset === -1) return 'Tháng trước';
      const range = getMonthRange(statsDateOffset);
      return `Tháng ${range.month + 1}, ${range.year}`;
    }
    
    if (statsDateOffset === 0) return 'Năm nay';
    if (statsDateOffset === -1) return 'Năm ngoái';
    const range = getYearRange(statsDateOffset);
    return `Năm ${range.year}`;
  };

  // Streak calculations memoized
  const streak = useMemo(() => {
    const dates = Array.from(new Set(studyLogs.map(l => l.date))).sort();
    if (dates.length === 0) return { current: 0, longest: 0 };
    
    const parseLocalDate = (dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    };

    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Calculate current streak
    let current = 0;
    const todayStr = getLocalDateKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateKey(yesterday);
    
    let hasToday = dates.includes(todayStr);
    let hasYesterday = dates.includes(yesterdayStr);
    
    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? new Date() : yesterday;
      while (true) {
        const checkStr = getLocalDateKey(checkDate);
        if (dates.includes(checkStr)) {
          current++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longest = 0;
    let temp = 0;
    
    const sortedDates = dates.map(d => parseLocalDate(d).getTime());
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        temp = 1;
      } else {
        const diff = (sortedDates[i] - sortedDates[i - 1]) / oneDayMs;
        if (Math.round(diff) === 1) {
          temp++;
        } else if (Math.round(diff) > 1) {
          if (temp > longest) longest = temp;
          temp = 1;
        }
      }
    }
    if (temp > longest) longest = temp;
    
    return { current, longest };
  }, [studyLogs]);

  // Active Metrics memoized
  const activeMetrics = useMemo(() => {
    const nowMs = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayStart = startOfToday.getTime();
    
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const fourWeeksMs = 28 * 24 * 60 * 60 * 1000;
    
    let start, end, prevStart, prevEnd;
    
    if (focusRange === 'today') {
      start = todayStart;
      end = nowMs;
      prevStart = yesterdayStart;
      prevEnd = todayStart;
    } else if (focusRange === 'week') {
      start = nowMs - oneWeekMs;
      end = nowMs;
      prevStart = nowMs - 2 * oneWeekMs;
      prevEnd = nowMs - oneWeekMs;
    } else {
      start = nowMs - fourWeeksMs;
      end = nowMs;
      prevStart = nowMs - 2 * fourWeeksMs;
      prevEnd = nowMs - fourWeeksMs;
    }

    const getStatsForPeriod = (startTime, endTime) => {
      const rangeLogs = studyLogs.filter(log => log.timestamp >= startTime && log.timestamp <= endTime);
      const seconds = rangeLogs.reduce((sum, log) => sum + log.seconds, 0);
      
      const sessions = rangeLogs.length;
      const breaks = breakLogs.filter(b => b.timestamp >= startTime && b.timestamp <= endTime).length;
      
      let tasksCompleted = 0;
      exams.forEach(exam => {
        (exam.tasks || []).forEach(task => {
          if (task.completed && task.completedAt && task.completedAt >= startTime && task.completedAt <= endTime) {
            tasksCompleted++;
          }
        });
      });

      return { seconds, sessions, breaks, tasksCompleted };
    };
    
    const curr = getStatsForPeriod(start, end);
    const prev = getStatsForPeriod(prevStart, prevEnd);
    
    const getPctChange = (cValue, pValue) => {
      if (pValue === 0) return cValue > 0 ? 100 : 0;
      return Math.round(((cValue - pValue) / pValue) * 100);
    };

    const formatFocusTime = (s) => {
      if (s === 0) return '0m';
      if (s < 3600) return `${Math.round(s / 60)}m`;
      const h = Math.floor(s / 3600);
      const m = Math.round((s % 3600) / 60);
      return m === 0 ? `${h}h` : `${h}h ${m}m`;
    };
    
    return {
      focusTimeStr: formatFocusTime(curr.seconds),
      focusTimeChange: getPctChange(curr.seconds, prev.seconds),
      tasksCompleted: curr.tasksCompleted,
      tasksCompletedChange: getPctChange(curr.tasksCompleted, prev.tasksCompleted),
      sessions: curr.sessions,
      sessionsChange: getPctChange(curr.sessions, prev.sessions),
      breaks: curr.breaks,
      breaksChange: getPctChange(curr.breaks, prev.breaks),
      streakCurrent: streak.current,
      streakLongest: streak.longest
    };
  }, [studyLogs, breakLogs, exams, focusRange, streak]);

  // Comparison data memoized
  const comparison = useMemo(() => {
    let currRange, prevRange;
    if (statsMode === 'week') {
      currRange = getWeekRange(statsDateOffset);
      prevRange = getWeekRange(statsDateOffset - 1);
    } else if (statsMode === 'month') {
      currRange = getMonthRange(statsDateOffset);
      prevRange = getMonthRange(statsDateOffset - 1);
    } else {
      currRange = getYearRange(statsDateOffset);
      prevRange = getYearRange(statsDateOffset - 1);
    }
    
    const currTotal = getRangeTotalMinutes(studyLogs, currRange);
    const prevTotal = getRangeTotalMinutes(studyLogs, prevRange);
    
    let pctChange = 0;
    if (prevTotal > 0) {
      pctChange = Math.round(((currTotal - prevTotal) / prevTotal) * 100);
    } else if (currTotal > 0) {
      pctChange = 100;
    }
    return { currTotal, prevTotal, pctChange };
  }, [studyLogs, statsMode, statsDateOffset]);

  // Period summary memoized
  const periodSummary = useMemo(() => {
    let range;
    if (statsMode === 'week') range = getWeekRange(statsDateOffset);
    else if (statsMode === 'month') range = getMonthRange(statsDateOffset);
    else range = getYearRange(statsDateOffset);
    
    const logs = studyLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= range.start && logTime <= range.end;
    });
    
    const seconds = logs.reduce((sum, log) => sum + log.seconds, 0);
    const minutes = Math.round(seconds / 60);
    const hours = (seconds / 3600).toFixed(1);
    const sessions = logs.length;
    
    return { minutes, hours, sessions, logs };
  }, [studyLogs, statsMode, statsDateOffset]);

  // Badges calculations memoized
  const unlockedBadges = useMemo(() => {
    const unlocked = {};

    // 1. Cú Đêm Ôn Luyện 🦉: Học bài sau 22h tối
    const hasNightStudy = studyLogs.some(log => {
      const logHour = new Date(log.timestamp).getHours();
      return logHour >= 22 || logHour < 4;
    });
    if (hasNightStudy) unlocked.nightOwl = true;

    // 2. Sơn Ca Chăm Chỉ 🌅: Học bài trước 8h sáng
    const hasMorningStudy = studyLogs.some(log => {
      const logHour = new Date(log.timestamp).getHours();
      return logHour >= 5 && logHour < 8;
    });
    if (hasMorningStudy) unlocked.earlyBird = true;

    // 3. Siêu Chiến Binh ⚔️: Học liên tục 3 phiên Pomodoro (sessions) trong ngày
    const sessionsPerDate = {};
    studyLogs.forEach(log => {
      sessionsPerDate[log.date] = (sessionsPerDate[log.date] || 0) + 1;
    });
    const hasThreeSessions = Object.values(sessionsPerDate).some(count => count >= 3);
    if (hasThreeSessions) unlocked.warrior = true;

    // 4. Kỷ Lục Gia 🏆: Đạt streak học tập từ 5 ngày trở lên
    if (streak.longest >= 5) unlocked.streakMaster = true;

    // 5. Dọn Sạch Đề Cương 🧹: Hoàn thành tổng cộng 10 việc cần làm
    let totalCompletedTasks = 0;
    exams.forEach(exam => {
      (exam.tasks || []).forEach(task => {
        if (task.completed) totalCompletedTasks++;
      });
    });
    if (totalCompletedTasks >= 10) unlocked.taskSlayer = true;

    return unlocked;
  }, [studyLogs, streak.longest, exams]);

  // Subject breakdown stats memoized
  const subjectBreakdown = useMemo(() => {
    const subjectMap = {};
    periodSummary.logs.forEach(log => {
      if (!subjectMap[log.subjectId]) {
        subjectMap[log.subjectId] = {
          subjectName: log.subjectName,
          seconds: 0
        };
      }
      subjectMap[log.subjectId].seconds += log.seconds;
    });
    
    return Object.keys(subjectMap).map(id => ({
      id,
      name: subjectMap[id].subjectName,
      minutes: Math.round(subjectMap[id].seconds / 60)
    })).sort((a, b) => b.minutes - a.minutes);
  }, [periodSummary.logs]);

  // Chart data memoized
  const chartData = useMemo(() => {
    if (statsMode === 'week') {
      const days = [];
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const range = getWeekRange(statsDateOffset);
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(range.start);
        d.setDate(range.start.getDate() + i);
        const dateStr = getLocalDateKey(d);
        
        const dayLogs = studyLogs.filter(log => log.date === dateStr);
        const totalMinutes = Math.round(dayLogs.reduce((sum, log) => sum + log.seconds, 0) / 60);
        
        days.push({
          label: dayNames[d.getDay()],
          subLabel: `${d.getDate()}/${d.getMonth() + 1}`,
          minutes: totalMinutes
        });
      }
      return days;
    }
    
    if (statsMode === 'month') {
      const range = getMonthRange(statsDateOffset);
      const weeks = [
        { label: 'T1', subLabel: '1-7', startDay: 1, endDay: 7, minutes: 0 },
        { label: 'T2', subLabel: '8-14', startDay: 8, endDay: 14, minutes: 0 },
        { label: 'T3', subLabel: '15-21', startDay: 15, endDay: 21, minutes: 0 },
        { label: 'T4', subLabel: '22-28', startDay: 22, endDay: 28, minutes: 0 },
        { label: 'T5', subLabel: '29+', startDay: 29, endDay: 31, minutes: 0 }
      ];
      
      const logs = studyLogs.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= range.start && logTime <= range.end;
      });
      
      logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        const day = logDate.getDate();
        const mins = log.seconds / 60;
        const targetWeek = weeks.find(w => day >= w.startDay && day <= w.endDay);
        if (targetWeek) targetWeek.minutes += mins;
      });
      
      weeks.forEach(w => {
        w.minutes = Math.round(w.minutes);
      });
      return weeks;
    }
    
    // Year Mode
    const range = getYearRange(statsDateOffset);
    const months = [
      { label: 'T1', subLabel: 'Jan', monthIndex: 0, minutes: 0 },
      { label: 'T2', subLabel: 'Feb', monthIndex: 1, minutes: 0 },
      { label: 'T3', subLabel: 'Mar', monthIndex: 2, minutes: 0 },
      { label: 'T4', subLabel: 'Apr', monthIndex: 3, minutes: 0 },
      { label: 'T5', subLabel: 'May', monthIndex: 4, minutes: 0 },
      { label: 'T6', subLabel: 'Jun', monthIndex: 5, minutes: 0 },
      { label: 'T7', subLabel: 'Jul', monthIndex: 6, minutes: 0 },
      { label: 'T8', subLabel: 'Aug', monthIndex: 7, minutes: 0 },
      { label: 'T9', subLabel: 'Sep', monthIndex: 8, minutes: 0 },
      { label: 'T10', subLabel: 'Oct', monthIndex: 9, minutes: 0 },
      { label: 'T11', subLabel: 'Nov', monthIndex: 10, minutes: 0 },
      { label: 'T12', subLabel: 'Dec', monthIndex: 11, minutes: 0 }
    ];
    
    const logs = studyLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= range.start && logTime <= range.end;
    });
    
    logs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const m = logDate.getMonth();
      const mins = log.seconds / 60;
      months[m].minutes += mins;
    });
    
    months.forEach(m => {
      m.minutes = Math.round(m.minutes);
    });
    return months;
  }, [studyLogs, statsMode, statsDateOffset]);

  const maxMinutes = useMemo(() => {
    return Math.max(...chartData.map(s => s.minutes), 30);
  }, [chartData]);

  // Chart point and Bezier curves memoized
  const chartCurveData = useMemo(() => {
    const W = 600;
    const paddingX = 50;
    const topY = 40;
    const bottomY = 160;
    const plotHeight = bottomY - topY; // 120
    
    if (chartData.length === 0) return { points: [], lineD: '', fillD: '' };
    
    const points = chartData.map((day, idx) => {
      const x = chartData.length > 1
        ? paddingX + (idx / (chartData.length - 1)) * (W - 2 * paddingX)
        : W / 2;
      const y = maxMinutes > 0
        ? bottomY - (day.minutes / maxMinutes) * plotHeight
        : bottomY;
      return { x, y, label: day.label, subLabel: day.subLabel, minutes: day.minutes };
    });

    let lineD = '';
    let fillD = '';
    if (points.length > 0) {
      lineD = `M ${points[0].x} ${points[0].y}`;
      if (points.length > 1) {
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const cp1x = p0.x + (p1.x - p0.x) / 2;
          const cp1y = p0.y;
          const cp2x = p0.x + (p1.x - p0.x) / 2;
          const cp2y = p1.y;
          lineD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
      }
      fillD = `${lineD} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`;
    }

    return { points, lineD, fillD };
  }, [chartData, maxMinutes]);

  // History List memoized
  const historyList = useMemo(() => {
    const list = [];
    const now = new Date();
    
    if (historySubTab === 'day') {
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dayStart = d.getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;
        
        const dayLogs = studyLogs.filter(l => l.timestamp >= dayStart && l.timestamp <= dayEnd);
        const sec = dayLogs.reduce((sum, l) => sum + l.seconds, 0);
        const mins = Math.round(sec / 60);
        const hr = (sec / 3600).toFixed(1);
        const timeStr = sec === 0 ? '0m' : sec < 3600 ? `${mins}m` : `${hr}h`;

        let tasks = 0;
        exams.forEach(exam => {
          (exam.tasks || []).forEach(t => {
            if (t.completed && t.completedAt && t.completedAt >= dayStart && t.completedAt <= dayEnd) {
              tasks++;
            }
          });
        });

        const dayName = i === 0 ? 'Hôm nay' : i === 1 ? 'Hôm qua' : `${d.getDate()}/${d.getMonth() + 1}`;
        list.push({ label: dayName, timeStr, tasks, sessions: dayLogs.length });
      }
    } else if (historySubTab === 'week') {
      for (let i = 0; i < 4; i++) {
        const wStart = new Date();
        wStart.setDate(now.getDate() - now.getDay() - (i * 7));
        wStart.setHours(0, 0, 0, 0);
        const wStartMs = wStart.getTime();
        const wEndMs = wStartMs + 7 * 24 * 60 * 60 * 1000 - 1;
        
        const weekLogs = studyLogs.filter(l => l.timestamp >= wStartMs && l.timestamp <= wEndMs);
        const sec = weekLogs.reduce((sum, l) => sum + l.seconds, 0);
        const mins = Math.round(sec / 60);
        const hr = (sec / 3600).toFixed(1);
        const timeStr = sec === 0 ? '0m' : sec < 3600 ? `${mins}m` : `${hr}h`;

        let tasks = 0;
        exams.forEach(exam => {
          (exam.tasks || []).forEach(t => {
            if (t.completed && t.completedAt && t.completedAt >= wStartMs && t.completedAt <= wEndMs) {
              tasks++;
            }
          });
        });

        const wEnd = new Date(wEndMs);
        const label = i === 0 ? 'Tuần này' : `Tuần ${wStart.getDate()}/${wStart.getMonth() + 1} - ${wEnd.getDate()}/${wEnd.getMonth() + 1}`;
        list.push({ label, timeStr, tasks, sessions: weekLogs.length });
      }
    } else if (historySubTab === 'month') {
      for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mStartMs = d.getTime();
        const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const mEndMs = nextMonth.getTime() - 1;
        
        const monthLogs = studyLogs.filter(l => l.timestamp >= mStartMs && l.timestamp <= mEndMs);
        const sec = monthLogs.reduce((sum, l) => sum + l.seconds, 0);
        const mins = Math.round(sec / 60);
        const hr = (sec / 3600).toFixed(1);
        const timeStr = sec === 0 ? '0m' : sec < 3600 ? `${mins}m` : `${hr}h`;

        let tasks = 0;
        exams.forEach(exam => {
          (exam.tasks || []).forEach(t => {
            if (t.completed && t.completedAt && t.completedAt >= mStartMs && t.completedAt <= mEndMs) {
              tasks++;
            }
          });
        });

        const label = i === 0 ? 'Tháng này' : `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
        list.push({ label, timeStr, tasks, sessions: monthLogs.length });
      }
    }
    
    return list;
  }, [studyLogs, exams, historySubTab]);

  const formatChartValue = (mins) => {
    if (mins === 0) return '0m';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  const { points, lineD, fillD } = chartCurveData;

  return (
    <div className="pomodoro-stats-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Section 1: All Focus Stats */}
      <div className="focus-stats-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <h4 className="stats-section-title">📊 All Focus Stats</h4>
            <p className="stats-section-subtitle">Get a full breakdown of your focus time, sessions, and tasks — along with improvement insights.</p>
          </div>
          <div className="focus-range-selector" style={{ display: 'flex', gap: '4px', background: 'rgba(0, 0, 0, 0.25)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {['today', 'week', 'fourWeeks'].map(rangeOpt => (
              <button
                key={rangeOpt}
                onClick={() => setFocusRange(rangeOpt)}
                className={`focus-range-btn ${focusRange === rangeOpt ? 'active' : ''}`}
                style={{
                  background: focusRange === rangeOpt ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'transparent',
                  color: focusRange === rangeOpt ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '7px',
                  fontSize: '0.76rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {rangeOpt === 'today' ? 'Today' : rangeOpt === 'week' ? '1 Week' : '4 Weeks'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Cards */}
        <div className="focus-stats-cards-grid">
          {/* Card 1: Focus Time */}
          <div className="focus-stat-card focus-time-card">
            <div className="card-header">
              <span className="card-title">Focus Time</span>
              <span className="card-icon">⚡</span>
            </div>
            <div className="card-value">{activeMetrics.focusTimeStr}</div>
            <div className="card-trend">
              {activeMetrics.focusTimeChange >= 0 ? `↗ ${activeMetrics.focusTimeChange}%` : `↘ ${Math.abs(activeMetrics.focusTimeChange)}%`}
            </div>
          </div>

          {/* Card 2: Tasks Completed */}
          <div className="focus-stat-card focus-tasks-card">
            <div className="card-header">
              <span className="card-title">Tasks Completed</span>
              <span className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            </div>
            <div className="card-value">{activeMetrics.tasksCompleted}</div>
            <div className="card-trend">
              {activeMetrics.tasksCompletedChange >= 0 ? `↗ ${activeMetrics.tasksCompletedChange}%` : `↘ ${Math.abs(activeMetrics.tasksCompletedChange)}%`}
            </div>
          </div>

          {/* Card 3: Sessions */}
          <div className="focus-stat-card focus-sessions-card">
            <div className="card-header">
              <span className="card-title">Sessions</span>
              <span className="card-icon">⏱️</span>
            </div>
            <div className="card-value">{activeMetrics.sessions}</div>
            <div className="card-trend">
              {activeMetrics.sessionsChange >= 0 ? `↗ ${activeMetrics.sessionsChange}%` : `↘ ${Math.abs(activeMetrics.sessionsChange)}%`}
            </div>
          </div>

          {/* Card 4: Streak */}
          <div className="focus-stat-card focus-streak-card">
            <div className="card-header">
              <span className="card-title">Streak</span>
              <span className="card-icon">🔥</span>
            </div>
            <div className="card-value">{activeMetrics.streakCurrent} days</div>
            <div className="card-trend" style={{ opacity: 0.9 }}>
              Longest: {activeMetrics.streakLongest}
            </div>
          </div>

          {/* Card 5: Breaks */}
          <div className="focus-stat-card focus-breaks-card">
            <div className="card-header">
              <span className="card-title">Breaks</span>
              <span className="card-icon">☕</span>
            </div>
            <div className="card-value">{activeMetrics.breaks}</div>
            <div className="card-trend">
              {activeMetrics.breaksChange >= 0 ? `↗ ${activeMetrics.breaksChange}%` : `↘ ${Math.abs(activeMetrics.breaksChange)}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Visual Chart */}
      <div className="focus-chart-section" style={{ background: 'rgba(10, 14, 23, 0.35)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1.25rem' }}>
        <h4 className="stats-section-title">📈 Visual Chart</h4>
        <p className="stats-section-subtitle">Spot patterns and track your focus flow over time.</p>

        <div className="stats-tab-header" style={{ marginTop: '0.5rem', background: 'rgba(0, 0, 0, 0.25)' }}>
          <div className="stats-period-selector">
            {['week', 'month', 'year'].map(modeOpt => (
              <button
                key={modeOpt}
                className={`period-btn ${statsMode === modeOpt ? 'active' : ''}`}
                onClick={() => { setStatsMode(modeOpt); setStatsDateOffset(0); }}
                style={{ 
                  borderColor: statsMode === modeOpt ? themeColor : '',
                  boxShadow: statsMode === modeOpt ? `0 0 8px ${themeColor}30` : ''
                }}
              >
                {modeOpt === 'week' ? 'Tuần' : modeOpt === 'month' ? 'Tháng' : 'Năm'}
              </button>
            ))}
          </div>

          <div className="stats-navigation">
            <button className="nav-btn" onClick={() => setStatsDateOffset(prev => prev - 1)}>
              ◀
            </button>
            <span className="nav-current-label">
              {getNavigationLabel()}
            </span>
            <button 
              className="nav-btn" 
              onClick={() => setStatsDateOffset(prev => prev + 1)} 
              disabled={statsDateOffset >= 0}
            >
              ▶
            </button>
          </div>

          <div className="stats-comparison">
            <span className="comparison-title">Thời lượng học: </span>
            <span className={`comparison-badge ${comparison.pctChange >= 0 ? 'increase' : 'decrease'}`} style={{
              color: comparison.pctChange >= 0 ? '#10b981' : '#f87171',
              background: comparison.pctChange >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(248, 113, 113, 0.1)'
            }}>
              {comparison.pctChange >= 0 ? `↑ ${comparison.pctChange}%` : `↓ ${Math.abs(comparison.pctChange)}%`}
            </span>
            <span className="comparison-text">
              {statsMode === 'week' ? 'so với tuần trước' : statsMode === 'month' ? 'so với tháng trước' : 'so với năm trước'}
            </span>
          </div>
        </div>

        <div className="stats-chart-wrapper" style={{ marginTop: '1rem', width: '100%', overflow: 'hidden' }}>
          <svg viewBox="0 0 600 220" width="100%" height="220" style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id="chartFillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={themeColor} stopOpacity="0.45" />
                <stop offset="100%" stopColor={themeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="50" y1="40" x2="550" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <line x1="50" y1="100" x2="550" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <line x1="50" y1="160" x2="550" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

            {points.length > 0 && (
              <>
                {/* Gradient Fill under curve */}
                <path d={fillD} fill="url(#chartFillGradient)" />

                {/* Stroke Line Curve */}
                <path d={lineD} fill="none" stroke={themeColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Circles, Values and Labels */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    {/* Dot Circle */}
                    <circle cx={p.x} cy={p.y} r="5.5" fill="#ffffff" stroke={themeColor} strokeWidth="3" />

                    {/* Value above the dot */}
                    <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="700" fontFamily="inherit">
                      {p.minutes > 0 ? formatChartValue(p.minutes) : ''}
                    </text>

                    {/* Primary label */}
                    <text x={p.x} y="185" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="600" fontFamily="inherit">
                      {p.label}
                    </text>

                    {/* Sublabel */}
                    <text x={p.x} y="200" textAnchor="middle" fill="var(--text-secondary)" fontSize="9.5" fontFamily="inherit">
                      {p.subLabel}
                    </text>
                  </g>
                ))}
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Section 3: Chi tiết theo môn học */}
      <div className="stats-subject-breakdown" style={{ background: 'rgba(10, 14, 23, 0.35)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1.25rem' }}>
        <h4 className="stats-section-title">📚 Chi tiết theo môn học</h4>
        <p className="stats-section-subtitle">Tỉ lệ phân bổ thời gian ôn tập cho từng môn học.</p>
        {subjectBreakdown.length > 0 ? (
          <div className="breakdown-list">
            {subjectBreakdown.map((subject, idx) => {
              const maxSubMins = Math.max(...subjectBreakdown.map(s => s.minutes), 1);
              const widthPercent = (subject.minutes / maxSubMins) * 100;
              return (
                <div key={idx} className="breakdown-item">
                  <div className="breakdown-item-info">
                    <span className="breakdown-subject-name">{subject.name}</span>
                    <span className="breakdown-subject-time">{subject.minutes} phút</span>
                  </div>
                  <div className="breakdown-progress-track">
                    <div 
                      className="breakdown-progress-fill"
                      style={{ 
                        width: `${widthPercent}%`,
                        background: themeColor,
                        boxShadow: `0 0 6px ${themeColor}40`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="breakdown-empty-text">Chưa có dữ liệu học tập cho chu kỳ này.</p>
        )}
      </div>

      {/* Section: Bảng Huy Hiệu Thành Tích (Focus Badges) */}
      <div className="focus-badges-section" style={{ background: 'rgba(10, 14, 23, 0.35)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1.25rem' }}>
        <h4 className="stats-section-title">🏆 Huy hiệu Thành thích</h4>
        <p className="stats-section-subtitle">Chinh phục các thử thách học tập để mở khóa huy hiệu danh giá.</p>
        
        <div className="focus-badges-grid">
          {[
            { id: 'nightOwl', name: 'Cú Đêm Ôn Luyện', desc: 'Học bài sau 22:00 đêm', icon: '🦉' },
            { id: 'earlyBird', name: 'Sơn Ca Chăm Chỉ', desc: 'Học bài từ 05:00 - 08:00 sáng', icon: '🌅' },
            { id: 'warrior', name: 'Siêu Chiến Binh', desc: 'Học 3 phiên Pomodoro trong 1 ngày', icon: '⚔️' },
            { id: 'streakMaster', name: 'Kỷ Lục Gia', desc: 'Duy trì học liên tục 5 ngày trở lên', icon: '🏆' },
            { id: 'taskSlayer', name: 'Dọn Sạch Đề Cương', desc: 'Hoàn thành 10 nhiệm vụ môn học', icon: '🧹' }
          ].map(badge => {
            const isUnlocked = unlockedBadges[badge.id];
            return (
              <div key={badge.id} className={`focus-badge-item ${isUnlocked ? 'unlocked' : ''}`} title={badge.desc}>
                <span className="focus-badge-icon">{badge.icon}</span>
                <span className="focus-badge-name">{badge.name}</span>
                <span className="focus-badge-desc">{badge.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Focus History */}
      <div className="focus-history-section">
        <h4 className="stats-section-title">📜 Focus History</h4>
        <p className="stats-section-subtitle">See your daily, weekly, and monthly progress.</p>
        
        <div className="history-subtabs">
          {['day', 'week', 'month'].map(tabOpt => (
            <button
              key={tabOpt}
              className={`history-subtab-btn ${historySubTab === tabOpt ? 'active' : ''}`}
              onClick={() => setHistorySubTab(tabOpt)}
              style={{
                color: historySubTab === tabOpt ? '#fff' : '',
                background: historySubTab === tabOpt ? 'rgba(255, 255, 255, 0.1)' : ''
              }}
            >
              {tabOpt === 'day' ? 'Ngày' : tabOpt === 'week' ? 'Tuần' : 'Tháng'}
            </button>
          ))}
        </div>

        <div className="history-list">
          {historyList.map((item, idx) => (
            <div key={idx} className="history-item">
              <span className="history-item-label">{item.label}</span>
              <div className="history-item-metrics">
                <span className="history-metric" title="Thời gian tập trung">⏱️ {item.timeStr}</span>
                <span className="history-metric" title="Phiên học">🍅 {item.sessions}</span>
                <span className="history-metric" title="Nhiệm vụ hoàn thành">✅ {item.tasks}</span>
              </div>
            </div>
          ))}
          
          <div className="history-coming-soon">
            ⏳ Năm & Trọn đời (Sắp ra mắt 🚀)
          </div>
        </div>
      </div>
      
      {/* Action button */}
      <div className="stats-actions">
        <button className="btn btn-secondary btn-clear-stats" onClick={onClearStats}>
          🧹 Xóa lịch sử học tập
        </button>
      </div>
    </div>
  );
});

FocusStatsTab.displayName = 'FocusStatsTab';

export default FocusStatsTab;
