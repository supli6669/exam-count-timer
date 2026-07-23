import { useState, useEffect, useRef, useCallback } from 'react';
import SpotifyPlayer from './SpotifyPlayer';
import ThemeParticles from './ThemeParticles';
import AmbientSoundboard from './AmbientSoundboard';
import { incrementContribution } from '../utils/contributions';
import FocusStatsTab from './FocusStatsTab';
import { playSynthAlarm, STUDY_QUOTES } from './pomodoro/audioSynthesizer';
import TimerDisplay from './pomodoro/TimerDisplay';
import ThemeSelector from './pomodoro/ThemeSelector';
import AlarmSoundSettings from './pomodoro/AlarmSoundSettings';
import { getLocalDateKey } from '../utils/date';

const getStoredNumber = (key, fallback, min, max) => {
  const value = Number.parseInt(localStorage.getItem(key), 10);
  return Number.isFinite(value) && value >= min && value <= max ? value : fallback;
};

function PomodoroTimer({ isOpen, onClose, exams = [], generalTasks = [] }) {
  // Time settings (in minutes)
  const [workTime, setWorkTime] = useState(() => {
    return getStoredNumber('pomodoro_work', 25, 1, 120);
  });
  const [shortBreakTime, setShortBreakTime] = useState(() => {
    return getStoredNumber('pomodoro_short_break', 5, 1, 60);
  });
  const [longBreakTime, setLongBreakTime] = useState(() => {
    return getStoredNumber('pomodoro_long_break', 15, 1, 60);
  });

  const [alarmVolume, setAlarmVolume] = useState(() => {
    return getStoredNumber('pomodoro_alarm_volume', 50, 0, 100);
  });

  const [alarmSound, setAlarmSound] = useState(() => {
    return localStorage.getItem('pomodoro_alarm_sound') || 'sparkle';
  });

  // Settings inputs state
  const [inputWork, setInputWork] = useState(workTime.toString());
  const [inputShort, setInputShort] = useState(shortBreakTime.toString());
  const [inputLong, setInputLong] = useState(longBreakTime.toString());
  const [inputAlarmVolume, setInputAlarmVolume] = useState(alarmVolume.toString());
  const [inputAlarmSound, setInputAlarmSound] = useState(alarmSound);

  const [timerType, setTimerType] = useState('pomodoro'); // 'pomodoro' or 'stopwatch'
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [isActive, setIsActive] = useState(false);
  const [completedWorkSessions, setCompletedWorkSessions] = useState(() => {
    return getStoredNumber('pomodoro_completed_sessions', 0, 0, 3);
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pomodoro_theme') || 'cyberpunk';
  });

  const [customBg, setCustomBg] = useState(() => {
    return localStorage.getItem('pomodoro_custom_bg') || null;
  });

  const [activeTab, setActiveTab] = useState('timer'); // 'timer', 'stats', 'settings'

  const getTotalSeconds = useCallback(() => {
    if (timerType === 'stopwatch') return 0;
    if (mode === 'work') return workTime * 60;
    if (mode === 'shortBreak') return shortBreakTime * 60;
    if (mode === 'longBreak') return longBreakTime * 60;
    return workTime * 60;
  }, [timerType, mode, workTime, shortBreakTime, longBreakTime]);

  const [timeLeft, setTimeLeft] = useState(getTotalSeconds);

  // Focus Task & Subject State
  const [focusSubjectId, setFocusSubjectId] = useState(() => {
    return localStorage.getItem('pomodoro_focus_subject') || 'general';
  });
  const [focusTaskId, setFocusTaskId] = useState('general');

  // Quotes state
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * STUDY_QUOTES.length));

  // Low Power Mode
  const [lowPowerMode] = useState(() => {
    return localStorage.getItem('pomodoro_low_power') === 'true';
  });

  // Study logs history
  const [studyLogs, setStudyLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('pomodoro_study_logs');
      const logs = saved ? JSON.parse(saved) : [];
      return Array.isArray(logs) ? logs : [];
    } catch {
      return [];
    }
  });

  const secondsStudiedRef = useRef(0);
  const timerRef = useRef(null);

  const calculateSecondsForMode = useCallback((targetMode, targetType) => {
    if (targetType === 'stopwatch') return 0;
    if (targetMode === 'work') return workTime * 60;
    if (targetMode === 'shortBreak') return shortBreakTime * 60;
    if (targetMode === 'longBreak') return longBreakTime * 60;
    return workTime * 60;
  }, [workTime, shortBreakTime, longBreakTime]);

  const switchModeAndType = useCallback((newMode, newType) => {
    setIsActive(false);
    setMode(newMode);
    setTimerType(newType);
    setTimeLeft(calculateSecondsForMode(newMode, newType));
  }, [calculateSecondsForMode]);

  const handleModeChange = useCallback((newMode) => {
    switchModeAndType(newMode, timerType);
  }, [timerType, switchModeAndType]);

  const handleTimerTypeChange = useCallback((newType) => {
    switchModeAndType(mode, newType);
  }, [mode, switchModeAndType]);

  // Sync theme to localStorage & global body data-theme attribute
  useEffect(() => {
    localStorage.setItem('pomodoro_theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Study log helper
  const logAccumulatedStudyTime = useCallback(() => {
    const seconds = secondsStudiedRef.current;
    if (seconds < 5) {
      secondsStudiedRef.current = 0;
      return;
    }

    incrementContribution();

    const today = getLocalDateKey();
    let subjectName = 'Học tập chung';
    let taskText = null;
    if (focusSubjectId !== 'general') {
      const exam = exams.find(e => e.id === focusSubjectId);
      if (exam) {
        subjectName = exam.subject;
        if (focusTaskId !== 'general') {
          const task = (exam.tasks || []).find(t => t.id === focusTaskId);
          if (task) taskText = task.text;
        }
      }
    } else {
      if (focusTaskId !== 'general' && generalTasks) {
        const task = generalTasks.find(t => t.id === focusTaskId);
        if (task) taskText = task.text;
      }
    }

    const newLog = {
      timestamp: Date.now(),
      date: today,
      subjectId: focusSubjectId,
      subjectName,
      taskId: focusTaskId !== 'general' ? focusTaskId : null,
      taskText,
      seconds
    };

    const updatedLogs = [...studyLogs, newLog];
    setStudyLogs(updatedLogs);
    localStorage.setItem('pomodoro_study_logs', JSON.stringify(updatedLogs));
    window.dispatchEvent(new Event('studyLogsUpdated'));
    
    const xpGained = Math.round((seconds / 1500) * 100);
    if (xpGained > 0) {
      window.dispatchEvent(new CustomEvent('gain-xp', { detail: xpGained }));
    }
    
    secondsStudiedRef.current = 0;
  }, [focusSubjectId, focusTaskId, exams, generalTasks, studyLogs]);

  // Log study time when panel closes
  useEffect(() => {
    if (!isOpen && mode === 'work' && secondsStudiedRef.current > 0) {
      logAccumulatedStudyTime();
    }
  }, [isOpen, mode, logAccumulatedStudyTime]);

  const playAlarmSound = useCallback(() => {
    playSynthAlarm(alarmSound, alarmVolume);
  }, [alarmSound, alarmVolume]);

  const playPreviewAlarmSound = useCallback((overrideSoundId = null) => {
    const soundToPlay = overrideSoundId || inputAlarmSound;
    const volToPlay = parseInt(inputAlarmVolume, 10) || 50;
    playSynthAlarm(soundToPlay, volToPlay);
  }, [inputAlarmSound, inputAlarmVolume]);

  const handleSessionComplete = useCallback(() => {
    setIsActive(false);
    playAlarmSound();

    let targetMode = 'work';
    if (mode === 'work') {
      logAccumulatedStudyTime();
      const nextCount = completedWorkSessions + 1;
      if (nextCount >= 4) {
        setCompletedWorkSessions(0);
        localStorage.setItem('pomodoro_completed_sessions', '0');
        targetMode = 'longBreak';
      } else {
        setCompletedWorkSessions(nextCount);
        localStorage.setItem('pomodoro_completed_sessions', nextCount.toString());
        targetMode = 'shortBreak';
      }
    }
    setMode(targetMode);
    setTimeLeft(calculateSecondsForMode(targetMode, 'pomodoro'));
  }, [mode, completedWorkSessions, playAlarmSound, logAccumulatedStudyTime, calculateSecondsForMode]);

  // Timer Tick Interval Effect
  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      if (timerType === 'stopwatch') {
        setTimeLeft(prev => prev + 1);
        secondsStudiedRef.current += 1;
      } else {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimeout(handleSessionComplete, 0);
            return 0;
          }
          if (mode === 'work') {
            secondsStudiedRef.current += 1;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, timerType, handleSessionComplete]);

  const handleStartPause = useCallback(() => {
    setIsActive(prev => {
      const nextActive = !prev;
      if (nextActive && timerType === 'pomodoro' && timeLeft <= 0) {
        setTimeLeft(calculateSecondsForMode(mode, timerType));
      }
      return nextActive;
    });
  }, [timerType, mode, timeLeft, calculateSecondsForMode]);

  const handleReset = useCallback(() => {
    setIsActive(false);
    if ((timerType === 'stopwatch' || (timerType === 'pomodoro' && mode === 'work')) && secondsStudiedRef.current > 0) {
      logAccumulatedStudyTime();
    }
    if (timerType === 'stopwatch') {
      setTimeLeft(0);
    } else {
      setTimeLeft(calculateSecondsForMode(mode, timerType));
    }
  }, [timerType, mode, calculateSecondsForMode, logAccumulatedStudyTime]);

  const handleSkip = useCallback(() => {
    setIsActive(false);
    if (mode === 'work' && secondsStudiedRef.current > 0) {
      logAccumulatedStudyTime();
    }
    let targetMode = 'work';
    if (mode === 'work') {
      const nextCount = completedWorkSessions + 1;
      if (nextCount >= 4) {
        setCompletedWorkSessions(0);
        localStorage.setItem('pomodoro_completed_sessions', '0');
        targetMode = 'longBreak';
      } else {
        setCompletedWorkSessions(nextCount);
        localStorage.setItem('pomodoro_completed_sessions', nextCount.toString());
        targetMode = 'shortBreak';
      }
    }
    setMode(targetMode);
    setTimeLeft(calculateSecondsForMode(targetMode, timerType));
  }, [mode, completedWorkSessions, timerType, calculateSecondsForMode, logAccumulatedStudyTime]);

  // Save customized settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    const w = Math.max(1, Math.min(120, parseInt(inputWork, 10) || 25));
    const s = Math.max(1, Math.min(60, parseInt(inputShort, 10) || 5));
    const l = Math.max(1, Math.min(60, parseInt(inputLong, 10) || 15));
    const vol = Math.max(0, Math.min(100, parseInt(inputAlarmVolume, 10) || 50));
    const snd = inputAlarmSound;

    setWorkTime(w);
    setShortBreakTime(s);
    setLongBreakTime(l);
    setAlarmVolume(vol);
    setAlarmSound(snd);

    localStorage.setItem('pomodoro_work', w.toString());
    localStorage.setItem('pomodoro_short_break', s.toString());
    localStorage.setItem('pomodoro_long_break', l.toString());
    localStorage.setItem('pomodoro_alarm_volume', vol.toString());
    localStorage.setItem('pomodoro_alarm_sound', snd);

    if (!isActive && timerType === 'pomodoro') {
      let updatedTime = w * 60;
      if (mode === 'shortBreak') updatedTime = s * 60;
      if (mode === 'longBreak') updatedTime = l * 60;
      setTimeLeft(updatedTime);
    }

    alert('Đã lưu thiết lập thành công!');
  };

  // Custom theme background upload & removal
  const handleCustomThemeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setCustomBg(base64);
      setTheme('custom');
      localStorage.setItem('pomodoro_custom_bg', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomBg = () => {
    setCustomBg(null);
    setTheme('cyberpunk');
    localStorage.removeItem('pomodoro_custom_bg');
  };

  const getModeColor = () => {
    if (mode === 'work') return '#8b5cf6';
    if (mode === 'shortBreak') return '#10b981';
    return '#3b82f6';
  };

  const getModeLabel = () => {
    if (timerType === 'stopwatch') return 'Đang bấm giờ';
    if (mode === 'work') return 'Phiên tập trung';
    if (mode === 'shortBreak') return 'Nghỉ ngơi ngắn';
    return 'Nghỉ ngơi dài';
  };

  // Update browser tab title and taskbar countdown timer with dynamic SVG favicons
  useEffect(() => {
    let intervalId = null;

    const updateTaskbarTitle = () => {
      const totalSecs = getTotalSeconds();
      const isTimerDirty = timerType === 'stopwatch' ? timeLeft > 0 : timeLeft !== totalSecs;

      if (isActive || isTimerDirty) {
        let timeStr;
        if (timerType === 'stopwatch') {
          const hrs = Math.floor(timeLeft / 3600);
          const mins = Math.floor((timeLeft % 3600) / 60);
          const secs = timeLeft % 60;
          timeStr = hrs > 0
            ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
            : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        } else {
          const mins = Math.floor(timeLeft / 60);
          const secs = timeLeft % 60;
          timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        let emoji = '⚡';
        if (timerType === 'stopwatch') emoji = '⏱️';
        else if (mode === 'shortBreak') emoji = '☕';
        else if (mode === 'longBreak') emoji = '🍃';

        const prefix = isActive ? '' : '⏸️ ';
        const modeText = timerType === 'stopwatch' ? 'Bấm giờ' : (mode === 'work' ? 'Tập trung' : 'Nghỉ ngơi');
        document.title = `${prefix}${emoji} ${timeStr} | ${modeText} - Lịch Thi`;

        const favicon = document.querySelector("link[rel*='icon']");
        if (favicon) {
          favicon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
        }
      } else {
        // Nearest upcoming exam countdown on taskbar
        const upcomingExams = (exams || [])
          .map(e => ({ ...e, diff: new Date(e.datetime) - new Date() }))
          .filter(e => e.diff > 0)
          .sort((a, b) => a.diff - b.diff);

        if (upcomingExams.length > 0) {
          const nearest = upcomingExams[0];
          const days = Math.floor(nearest.diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((nearest.diff / (1000 * 60 * 60)) % 24);
          const mins = Math.floor((nearest.diff / (1000 * 60)) % 60);
          const secs = Math.floor((nearest.diff / 1000) % 60);

          const timeLabel = days > 0
            ? `${days}d ${hours}h`
            : (hours > 0 ? `${hours}h ${mins}m` : `${mins}m ${secs}s`);

          document.title = `🎯 Còn ${timeLabel}: ${nearest.subject} | Đồng Hồ Lịch Thi`;
          const favicon = document.querySelector("link[rel*='icon']");
          if (favicon) {
            favicon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>`;
          }
        } else {
          document.title = "Đồng Hồ Đếm Ngược Lịch Thi - Theo Dõi Lịch Thi Thời Gian Thực";
          const favicon = document.querySelector("link[rel*='icon']");
          if (favicon) {
            favicon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⏱️</text></svg>`;
          }
        }
      }
    };

    updateTaskbarTitle();

    const totalSecs = getTotalSeconds();
    const isTimerDirty = timerType === 'stopwatch' ? timeLeft > 0 : timeLeft !== totalSecs;
    if (!isActive && !isTimerDirty) {
      intervalId = setInterval(updateTaskbarTitle, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timeLeft, mode, isActive, timerType, getTotalSeconds, exams]);

  if (!isOpen) return null;

  return (
    <div className={`pomodoro-overlay ${isOpen ? 'open' : ''}`} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      background: 'rgba(5, 7, 15, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Background Particles Layer */}
      <ThemeParticles theme={theme} lowPower={lowPowerMode} />

      {/* Fullscreen Floating Close Button */}
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 1100,
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#fff',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.2s'
        }}
        title="Đóng Pomodoro (Esc)"
        aria-label="Đóng giao diện Pomodoro"
      >
        ✕
      </button>

      {/* Main Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem 1.5rem',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 1050
      }}>
        {/* Header Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'timer' ? 'active' : ''}`}
              onClick={() => setActiveTab('timer')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: activeTab === 'timer' ? 'var(--bg-glass-hover)' : 'transparent',
                color: activeTab === 'timer' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ⏱️ Đồng Hồ
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: activeTab === 'stats' ? 'var(--bg-glass-hover)' : 'transparent',
                color: activeTab === 'stats' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📊 Bảng Thống Kê
            </button>
          </div>

          {/* Inspirational Quote Widget */}
          <div
            onClick={() => setQuoteIndex(prev => (prev + 1) % STUDY_QUOTES.length)}
            style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', cursor: 'pointer', textAlign: 'right', maxWidth: '400px' }}
            title="Nhấp để đổi danh ngôn"
          >
            "{STUDY_QUOTES[quoteIndex].text}" — <strong style={{ color: 'var(--color-primary)' }}>{STUDY_QUOTES[quoteIndex].author}</strong>
          </div>
        </div>

        {/* TAB 1: TIMER VIEW */}
        {activeTab === 'timer' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <TimerDisplay
              timerType={timerType}
              onTimerTypeChange={handleTimerTypeChange}
              mode={mode}
              onModeChange={handleModeChange}
              onSwitchModeAndType={switchModeAndType}
              timeLeft={timeLeft}
              isActive={isActive}
              handleStartPause={handleStartPause}
              handleReset={handleReset}
              handleSkip={handleSkip}
              completedWorkSessions={completedWorkSessions}
              getModeColor={getModeColor}
              getModeLabel={getModeLabel}
              getTotalSeconds={getTotalSeconds}
            />

            {/* Subject / Task Selector */}
            <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                📚 Chọn môn thi tập trung:
              </label>
              <select
                value={focusSubjectId}
                onChange={(e) => {
                  setFocusSubjectId(e.target.value);
                  setFocusTaskId('general');
                  localStorage.setItem('pomodoro_focus_subject', e.target.value);
                }}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: '#fff', outline: 'none' }}
              >
                <option value="general">Học tập chung (Không chọn môn)</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.subject}</option>
                ))}
              </select>
            </div>

            {/* Audio & Spotify Integration */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <AmbientSoundboard />
              <SpotifyPlayer />
            </div>

            {/* Theme Selector */}
            <ThemeSelector
              theme={theme}
              setTheme={setTheme}
              customBg={customBg}
              onCustomThemeUpload={handleCustomThemeUpload}
              onRemoveCustomBg={handleRemoveCustomBg}
            />

            {/* Time & Alarm Settings */}
            <AlarmSoundSettings
              inputWork={inputWork}
              setInputWork={setInputWork}
              inputShort={inputShort}
              setInputShort={setInputShort}
              inputLong={inputLong}
              setInputLong={setInputLong}
              inputAlarmVolume={inputAlarmVolume}
              setInputAlarmVolume={setInputAlarmVolume}
              inputAlarmSound={inputAlarmSound}
              setInputAlarmSound={setInputAlarmSound}
              handleSaveSettings={handleSaveSettings}
              playPreviewAlarmSound={playPreviewAlarmSound}
            />
          </div>
        )}

        {/* TAB 2: STATS VIEW */}
        {activeTab === 'stats' && (
          <FocusStatsTab
            studyLogs={studyLogs}
            breakLogs={[]}
            exams={exams}
            themeColor={getModeColor()}
            onClearStats={() => {
              setStudyLogs([]);
              localStorage.removeItem('pomodoro_study_logs');
              window.dispatchEvent(new Event('studyLogsUpdated'));
            }}
          />
        )}
      </div>
    </div>
  );
}

export default PomodoroTimer;
