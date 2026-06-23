import { useState, useEffect, useRef } from 'react';
import SpotifyPlayer from './SpotifyPlayer';

function PomodoroTimer({ isOpen, onClose, exams = [] }) {
  // Load custom time settings (in minutes) or default values
  const [workTime, setWorkTime] = useState(() => {
    const saved = localStorage.getItem('pomodoro_work');
    return saved ? parseInt(saved, 10) : 25;
  });
  const [shortBreakTime, setShortBreakTime] = useState(() => {
    const saved = localStorage.getItem('pomodoro_short_break');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [longBreakTime, setLongBreakTime] = useState(() => {
    const saved = localStorage.getItem('pomodoro_long_break');
    return saved ? parseInt(saved, 10) : 15;
  });

  const [mode, setMode] = useState('work'); // 'work' | 'shortBreak' | 'longBreak'
  const [isActive, setIsActive] = useState(false);
  const [completedWorkSessions, setCompletedWorkSessions] = useState(() => {
    const saved = localStorage.getItem('pomodoro_completed_sessions');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Active Tab: 'timer' | 'stats'
  const [activeTab, setActiveTab] = useState('timer');

  // Active Theme: 'default' | 'lofi-cafe' | 'cyberpunk-alley' | 'sakura-library' | 'space-odyssey' | 'nature-cabin'
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('pomodoro_theme') || 'default';
  });

  // Focus Subject ID: 'general' or exam.id
  const [focusSubjectId, setFocusSubjectId] = useState(() => {
    return localStorage.getItem('pomodoro_focus_subject') || 'general';
  });

  // Save selected subject
  useEffect(() => {
    localStorage.setItem('pomodoro_focus_subject', focusSubjectId);
  }, [focusSubjectId]);

  // Load and state for study logs
  const [studyLogs, setStudyLogs] = useState(() => {
    const saved = localStorage.getItem('pomodoro_study_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Ref to track seconds accumulated in the current session
  const secondsStudiedRef = useRef(0);

  // Time left in seconds
  const [timeLeft, setTimeLeft] = useState(() => workTime * 60);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Custom inputs for settings form
  const [inputWork, setInputWork] = useState(workTime);
  const [inputShort, setInputShort] = useState(shortBreakTime);
  const [inputLong, setInputLong] = useState(longBreakTime);

  const timerRef = useRef(null);

  // Save completed sessions to LocalStorage
  useEffect(() => {
    localStorage.setItem('pomodoro_completed_sessions', completedWorkSessions.toString());
  }, [completedWorkSessions]);

  // Get total duration for the current mode in seconds
  const getTotalSeconds = () => {
    if (mode === 'work') return workTime * 60;
    if (mode === 'shortBreak') return shortBreakTime * 60;
    return longBreakTime * 60;
  };

  // Sync timeLeft when modes or settings change during render
  const [prevSettingsKey, setPrevSettingsKey] = useState(`${mode}-${workTime}-${shortBreakTime}-${longBreakTime}`);
  const currentSettingsKey = `${mode}-${workTime}-${shortBreakTime}-${longBreakTime}`;
  if (currentSettingsKey !== prevSettingsKey) {
    setPrevSettingsKey(currentSettingsKey);
    if (!isActive) {
      setTimeLeft(getTotalSeconds());
    }
  }

  // Study log helper
  const logAccumulatedStudyTime = () => {
    const seconds = secondsStudiedRef.current;
    if (seconds < 5) {
      secondsStudiedRef.current = 0;
      return; // Ignore logs less than 5 seconds to avoid noise
    }

    const today = new Date().toISOString().split('T')[0];
    let subjectName = 'Học tập chung';
    if (focusSubjectId !== 'general') {
      const exam = exams.find(e => e.id === focusSubjectId);
      if (exam) subjectName = exam.subject;
    }

    const newLog = {
      timestamp: Date.now(),
      date: today,
      subjectId: focusSubjectId,
      subjectName,
      seconds
    };

    const updatedLogs = [...studyLogs, newLog];
    setStudyLogs(updatedLogs);
    localStorage.setItem('pomodoro_study_logs', JSON.stringify(updatedLogs));
    
    // Reset ref counter
    secondsStudiedRef.current = 0;
  };

  // Log on panel close
  useEffect(() => {
    if (!isOpen && mode === 'work' && secondsStudiedRef.current > 0) {
      logAccumulatedStudyTime();
    }
  }, [isOpen]);

  // Synth alert tone using Web Audio API
  const playAlarmSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const playBeep = (time, freq, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = freq;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.start(time);
        osc.stop(time + duration);
      };

      const now = ctx.currentTime;
      playBeep(now, 880, 0.15);
      playBeep(now + 0.2, 880, 0.15);
      playBeep(now + 0.4, 880, 0.15);
      playBeep(now + 0.6, 1100, 0.5);
    } catch (err) {
      console.warn('Cannot play synth sound:', err);
    }
  };

  // Push notifications
  const sendPushNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '⏰'
      });
    }
  };

  // Handle Session Completed
  const handleSessionEnd = () => {
    setIsActive(false);
    playAlarmSound();

    if (mode === 'work') {
      // Log completed study time
      logAccumulatedStudyTime();

      const nextCount = completedWorkSessions + 1;
      if (nextCount >= 4) {
        setCompletedWorkSessions(0);
        sendPushNotification('Hết giờ tập trung!', 'Chúc mừng bạn đã hoàn thành 4 phiên! Hãy nghỉ ngơi dài hơn.');
        setMode('longBreak');
      } else {
        setCompletedWorkSessions(nextCount);
        sendPushNotification('Hết giờ tập trung!', 'Cơ thể bạn cần nghỉ ngơi. Hãy chuyển sang chế độ Nghỉ ngắn.');
        setMode('shortBreak');
      }
    } else {
      sendPushNotification('Hết giờ nghỉ ngơi!', 'Thời gian thư giãn đã hết. Sẵn sàng tập trung học bài nhé.');
      setMode('work');
    }
  };

  const handleSessionEndRef = useRef(handleSessionEnd);
  useEffect(() => {
    handleSessionEndRef.current = handleSessionEnd;
  });

  // Timer Tick Logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (mode === 'work') {
          secondsStudiedRef.current += 1;
        }
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionEndRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === 'work' && secondsStudiedRef.current > 0) {
      logAccumulatedStudyTime();
    }
    setTimeLeft(getTotalSeconds());
  };

  const handleSkip = () => {
    setIsActive(false);
    if (mode === 'work' && secondsStudiedRef.current > 0) {
      logAccumulatedStudyTime();
    }
    if (mode === 'work') {
      const nextCount = completedWorkSessions + 1;
      if (nextCount >= 4) {
        setCompletedWorkSessions(0);
        setMode('longBreak');
      } else {
        setCompletedWorkSessions(nextCount);
        setMode('shortBreak');
      }
    } else {
      setMode('work');
    }
  };

  // Save customized time configurations
  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    const w = Math.max(1, Math.min(60, parseInt(inputWork, 10) || 25));
    const s = Math.max(1, Math.min(60, parseInt(inputShort, 10) || 5));
    const l = Math.max(1, Math.min(60, parseInt(inputLong, 10) || 15));

    setWorkTime(w);
    setShortBreakTime(s);
    setLongBreakTime(l);

    localStorage.setItem('pomodoro_work', w.toString());
    localStorage.setItem('pomodoro_short_break', s.toString());
    localStorage.setItem('pomodoro_long_break', l.toString());

    setIsSettingsOpen(false);
  };

  const handleCancelSettings = () => {
    setInputWork(workTime);
    setInputShort(shortBreakTime);
    setInputLong(longBreakTime);
    setIsSettingsOpen(false);
  };

  const handleThemeChange = (themeId) => {
    setActiveTheme(themeId);
    localStorage.setItem('pomodoro_theme', themeId);
  };

  const handleClearStats = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử thống kê học tập không?')) {
      setStudyLogs([]);
      localStorage.removeItem('pomodoro_study_logs');
    }
  };

  // Format timeLeft to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Stats Calculations
  const getLast7DaysStats = () => {
    const stats = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayLogs = studyLogs.filter(log => log.date === dateStr);
      const totalSeconds = dayLogs.reduce((sum, log) => sum + log.seconds, 0);
      const totalMinutes = Math.round(totalSeconds / 60);
      
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayName = dayNames[d.getDay()];
      
      stats.push({
        date: dateStr,
        dayName,
        minutes: totalMinutes
      });
    }
    return stats;
  };

  const getSubjectStats = () => {
    const subjectMap = {};
    studyLogs.forEach(log => {
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
  };

  const weeklyStats = getLast7DaysStats();
  const maxMinutes = Math.max(...weeklyStats.map(s => s.minutes), 30); // default scaling min to 30 mins
  const totalFocusSeconds = studyLogs.reduce((sum, log) => sum + log.seconds, 0);
  const totalFocusMinutes = Math.round(totalFocusSeconds / 60);
  const totalFocusHours = (totalFocusSeconds / 3600).toFixed(1);
  const subjectBreakdown = getSubjectStats();

  // Circular Progress Circular Ring parameters
  const totalSeconds = getTotalSeconds();
  const radius = 85;
  const circumference = 2 * Math.PI * radius; // ~534.07
  const progress = totalSeconds > 0 ? (timeLeft / totalSeconds) : 0;
  const strokeDashoffset = circumference - progress * circumference;

  // Visual text for modes
  const getModeLabel = () => {
    if (mode === 'work') return 'Thời gian Tập trung';
    if (mode === 'shortBreak') return 'Nghỉ ngắn';
    return 'Nghỉ dài';
  };

  // Color mapping based on theme and mode
  const getThemeColor = () => {
    if (mode !== 'work') {
      return mode === 'shortBreak' ? '#10b981' : '#3b82f6';
    }
    switch (activeTheme) {
      case 'lofi-cafe': return '#f59e0b';      // Warm amber
      case 'cyberpunk-alley': return '#ec4899';  // Neon pink
      case 'sakura-library': return '#f472b6';   // Sakura pink
      case 'space-odyssey': return '#06b6d4';    // Neon cyan
      case 'nature-cabin': return '#10b981';     // Forest green
      default: return '#ef4444';                 // Default red
    }
  };

  return (
    <div className={`pomodoro-sidebar ${isOpen ? 'open' : ''} theme-${activeTheme}`}>
      {/* Background image overlay if activeTheme is chosen */}
      {activeTheme !== 'default' && (
        <div 
          className="pomodoro-theme-bg" 
          style={{ backgroundImage: `url(/${activeTheme}.png)` }} 
        />
      )}
      
      {/* Dark overlay for contrast */}
      <div className="pomodoro-tint-overlay" />

      {/* Floating Close Button */}
      <button className="pomodoro-close-btn" onClick={onClose} aria-label="Đóng Pomodoro">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div className="pomodoro-sidebar-content">
        {/* Sidebar Header */}
      <div className="pomodoro-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🍅</span>
          <h2 className="pomodoro-title">Trạm Tập Trung Pomodoro</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="pomodoro-tabs">
        <button 
          className={`pomodoro-tab-btn ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          ⏱️ Đồng hồ
        </button>
        <button 
          className={`pomodoro-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Thống kê học tập
        </button>
      </div>

      {activeTab === 'timer' ? (
        /* TIMER TAB CONTENTS */
        <>
          {/* Focus Subject Selector */}
          <div className="focus-subject-selector">
            <label htmlFor="focus-subject-select">🎯 Đang tập trung cho môn:</label>
            <select 
              id="focus-subject-select"
              value={focusSubjectId} 
              onChange={(e) => setFocusSubjectId(e.target.value)}
              disabled={isActive}
              className="form-input"
            >
              <option value="general">Học tập chung (Không chọn môn)</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.subject}</option>
              ))}
            </select>
          </div>

          {/* Main Mode Toggle Buttons */}
          <div className="pomodoro-modes">
            <button 
              className={`pomodoro-mode-btn ${mode === 'work' ? 'active' : ''}`}
              onClick={() => { 
                if (mode === 'work' && secondsStudiedRef.current > 0) logAccumulatedStudyTime();
                setIsActive(false); 
                setMode('work'); 
              }}
            >
              Tập trung
            </button>
            <button 
              className={`pomodoro-mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
              onClick={() => { 
                if (mode === 'work' && secondsStudiedRef.current > 0) logAccumulatedStudyTime();
                setIsActive(false); 
                setMode('shortBreak'); 
              }}
            >
              Nghỉ ngắn
            </button>
            <button 
              className={`pomodoro-mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
              onClick={() => { 
                if (mode === 'work' && secondsStudiedRef.current > 0) logAccumulatedStudyTime();
                setIsActive(false); 
                setMode('longBreak'); 
                setCompletedWorkSessions(0); 
              }}
            >
              Nghỉ dài
            </button>
          </div>

          {/* Circular Progress & Timer */}
          <div className="pomodoro-display-container">
            <div className="progress-ring-container">
              <svg width="200" height="200" className="progress-ring">
                <circle 
                  className="progress-ring-bg"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="8"
                  fill="transparent"
                  r={radius}
                  cx="100"
                  cy="100"
                />
                <circle 
                  className={`progress-ring-bar ${mode}`}
                  stroke={getThemeColor()}
                  strokeWidth="8"
                  fill="transparent"
                  r={radius}
                  cx="100"
                  cy="100"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  style={{ transition: 'stroke-dashoffset 0.3s linear' }}
                />
              </svg>
              <div className="progress-ring-text">
                <span className="pomodoro-timer-digits">{formatTime(timeLeft)}</span>
                <span className="pomodoro-timer-label">{getModeLabel()}</span>
              </div>
            </div>
          </div>

          {/* Session Progress Dots */}
          <div className="pomodoro-progress-dots-container">
            <div className="pomodoro-dots-indicator">
              {[0, 1, 2].map((idx) => (
                <span 
                  key={idx} 
                  className={`indicator-dot ${idx < completedWorkSessions ? 'active' : ''}`}
                  style={{ backgroundColor: idx < completedWorkSessions ? getThemeColor() : '' }}
                  title={`Phiên tập trung ${idx + 1}`}
                ></span>
              ))}
              <span 
                className={`indicator-dot long-break-dot ${completedWorkSessions === 3 ? 'next' : ''}`}
                title="Nghỉ dài"
              ></span>
            </div>
            <div className="pomodoro-remaining-text">
              {completedWorkSessions < 3 ? (
                <>Còn <strong>{3 - completedWorkSessions}</strong> lần Nghỉ ngắn nữa đến Nghỉ dài</>
              ) : (
                <>Đợt nghỉ tiếp theo sẽ là <strong>Nghỉ dài</strong>! ☕</>
              )}
            </div>
          </div>

          {/* Main Timer Controls */}
          <div className="pomodoro-controls">
            <button className="btn btn-secondary btn-icon-only" onClick={handleReset} title="Làm mới">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
            </button>

            <button 
              className={`btn btn-start-pause`}
              style={{ 
                backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : getThemeColor(),
                borderColor: getThemeColor(),
                color: '#fff',
                boxShadow: isActive ? 'none' : `0 0 15px ${getThemeColor()}50`
              }}
              onClick={handleStartPause}
            >
              {isActive ? (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                  </svg>
                  Tạm dừng
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Bắt đầu
                </>
              )}
            </button>

            <button className="btn btn-secondary btn-icon-only" onClick={handleSkip} title="Bỏ qua phiên">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
          </div>

          {/* Theme Selector Section */}
          <div className="pomodoro-theme-selector">
            <span className="theme-selector-label">🖼️ Không gian học tập:</span>
            <div className="theme-options">
              {[
                { id: 'default', name: 'Mặc định', emoji: '🌌' },
                { id: 'lofi-cafe', name: 'Lofi Café', emoji: '☕' },
                { id: 'cyberpunk-alley', name: 'Cyberpunk', emoji: '🌃' },
                { id: 'sakura-library', name: 'Sakura', emoji: '🌸' },
                { id: 'space-odyssey', name: 'Vũ trụ', emoji: '🚀' },
                { id: 'nature-cabin', name: 'Nhà gỗ', emoji: '🌲' }
              ].map(t => (
                <button 
                  key={t.id}
                  className={`theme-opt-btn ${activeTheme === t.id ? 'active' : ''}`}
                  onClick={() => handleThemeChange(t.id)}
                  title={t.name}
                  style={{
                    borderColor: activeTheme === t.id ? getThemeColor() : '',
                    boxShadow: activeTheme === t.id ? `0 0 8px ${getThemeColor()}50` : ''
                  }}
                >
                  <span className="theme-emoji">{t.emoji}</span>
                  <span className="theme-name">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {isOpen && <SpotifyPlayer />}

          {/* Collapsible Settings Area */}
          <div className="pomodoro-settings-section">
            {!isSettingsOpen ? (
              <button 
                className="btn btn-secondary btn-settings-toggle"
                onClick={() => setIsSettingsOpen(true)}
                style={{ width: '100%' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Tùy chỉnh thời gian
              </button>
            ) : (
              <form className="pomodoro-settings-form" onSubmit={handleSaveSettings}>
                <h3 className="settings-form-title">Cấu hình thời lượng (Phút)</h3>
                
                <div className="settings-field">
                  <label htmlFor="settings-work">Tập trung</label>
                  <input 
                    id="settings-work"
                    type="number" 
                    min="1" 
                    max="60" 
                    value={inputWork}
                    onChange={(e) => setInputWork(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="settings-field">
                  <label htmlFor="settings-short">Nghỉ ngắn</label>
                  <input 
                    id="settings-short"
                    type="number" 
                    min="1" 
                    max="60" 
                    value={inputShort} 
                    onChange={(e) => setInputShort(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="settings-field">
                  <label htmlFor="settings-long">Nghỉ dài</label>
                  <input 
                    id="settings-long"
                    type="number" 
                    min="1" 
                    max="60" 
                    value={inputLong} 
                    onChange={(e) => setInputLong(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="settings-form-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCancelSettings}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: getThemeColor(), borderColor: getThemeColor() }}>
                    Áp dụng
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      ) : (
        /* STATS TAB CONTENTS */
        <div className="pomodoro-stats-tab">
          <h3 className="stats-tab-title">📊 Thời gian học tập 7 ngày qua</h3>
          
          {/* Weekly Bar Chart */}
          <div className="stats-chart-wrapper">
            <div className="stats-chart">
              {weeklyStats.map((day, idx) => {
                const heightPercent = (day.minutes / maxMinutes) * 100;
                return (
                  <div key={idx} className="chart-column">
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{ 
                          height: `${Math.max(4, heightPercent)}%`,
                          background: `linear-gradient(180deg, ${getThemeColor()}dd, ${getThemeColor()}33)`,
                          boxShadow: day.minutes > 0 ? `0 0 8px ${getThemeColor()}60` : 'none'
                        }}
                        title={`${day.minutes} phút`}
                      >
                        {day.minutes > 0 && <span className="bar-value">{day.minutes}m</span>}
                      </div>
                    </div>
                    <span className="chart-label">{day.dayName}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Stats Summary Cards */}
          <div className="stats-summary-grid">
            <div className="stats-summary-card">
              <span className="summary-value" style={{ color: getThemeColor() }}>
                {totalFocusHours}h
              </span>
              <span className="summary-label">Tổng giờ học</span>
            </div>
            <div className="stats-summary-card">
              <span className="summary-value" style={{ color: getThemeColor() }}>
                {totalFocusMinutes}
              </span>
              <span className="summary-label">Tổng số phút</span>
            </div>
            <div className="stats-summary-card">
              <span className="summary-value" style={{ color: getThemeColor() }}>
                {studyLogs.length}
              </span>
              <span className="summary-label">Số phiên đã lưu</span>
            </div>
          </div>
          
          {/* Study Breakdown by Subject */}
          <div className="stats-subject-breakdown">
            <h4 className="breakdown-title">📚 Chi tiết theo môn học</h4>
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
                            background: getThemeColor(),
                            boxShadow: `0 0 6px ${getThemeColor()}40`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="breakdown-empty-text">Chưa có dữ liệu học tập theo môn học.</p>
            )}
          </div>
          
          {/* Clear stats button */}
          <div className="stats-actions">
            <button className="btn btn-secondary btn-clear-stats" onClick={handleClearStats}>
              🧹 Xóa lịch sử học tập
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default PomodoroTimer;
