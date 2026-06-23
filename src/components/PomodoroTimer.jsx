import { useState, useEffect, useRef } from 'react';

function PomodoroTimer({ isOpen, onClose }) {
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
  
  // Time left in seconds
  const [timeLeft, setTimeLeft] = useState(() => workTime * 60);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Custom inputs for settings form
  const [inputWork, setInputWork] = useState(workTime);
  const [inputShort, setInputShort] = useState(shortBreakTime);
  const [inputLong, setInputLong] = useState(longBreakTime);

  const timerRef = useRef(null);

  // Get total duration for the current mode in seconds
  const getTotalSeconds = () => {
    if (mode === 'work') return workTime * 60;
    if (mode === 'shortBreak') return shortBreakTime * 60;
    return longBreakTime * 60;
  };

  // Sync timeLeft when modes or settings change during render (avoids useEffect setState warnings)
  const [prevSettingsKey, setPrevSettingsKey] = useState(`${mode}-${workTime}-${shortBreakTime}-${longBreakTime}`);
  const currentSettingsKey = `${mode}-${workTime}-${shortBreakTime}-${longBreakTime}`;
  if (currentSettingsKey !== prevSettingsKey) {
    setPrevSettingsKey(currentSettingsKey);
    if (!isActive) {
      setTimeLeft(getTotalSeconds());
    }
  }

  // Synthesis alert tone using Web Audio API
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
      sendPushNotification('Hết giờ tập trung!', 'Cơ thể bạn cần nghỉ ngơi. Hãy chuyển sang chế độ Nghỉ ngắn.');
      setMode('shortBreak');
    } else {
      sendPushNotification('Hết giờ nghỉ ngơi!', 'Thời gian thư giãn đã hết. Sẵn sàng tập trung học bài nhé.');
      setMode('work');
    }
  };

  // Use a mutable ref to hold the latest session end callback to avoid exhaustive-deps warning in timer effect
  const handleSessionEndRef = useRef(handleSessionEnd);
  useEffect(() => {
    handleSessionEndRef.current = handleSessionEnd;
  });

  // Timer Tick Logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
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
  }, [isActive]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(getTotalSeconds());
  };

  const handleSkip = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMode('shortBreak');
    } else if (mode === 'shortBreak') {
      setMode('longBreak');
    } else {
      setMode('work');
    }
  };

  // Save customized time configurations
  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    // Validation: 1 to 60 minutes
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

  // Format timeLeft to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate SVG Progress Circular Ring parameters
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

  return (
    <div className={`pomodoro-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Sidebar Header */}
      <div className="pomodoro-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🍅</span>
          <h2 className="pomodoro-title">Hẹn Giờ Pomodoro</h2>
        </div>
        <button className="btn-icon" onClick={onClose} aria-label="Đóng Pomodoro">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Main Mode Toggle Buttons */}
      <div className="pomodoro-modes">
        <button 
          className={`pomodoro-mode-btn ${mode === 'work' ? 'active' : ''}`}
          onClick={() => { setIsActive(false); setMode('work'); }}
        >
          Tập trung
        </button>
        <button 
          className={`pomodoro-mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
          onClick={() => { setIsActive(false); setMode('shortBreak'); }}
        >
          Nghỉ ngắn
        </button>
        <button 
          className={`pomodoro-mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
          onClick={() => { setIsActive(false); setMode('longBreak'); }}
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
              stroke={mode === 'work' ? '#ef4444' : '#10b981'}
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

      {/* Main Timer Controls */}
      <div className="pomodoro-controls">
        <button className="btn btn-secondary btn-icon-only" onClick={handleReset} title="Làm mới">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
          </svg>
        </button>

        <button 
          className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'} btn-start-pause`}
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
              <button type="submit" className="btn btn-primary">
                Áp dụng
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PomodoroTimer;
