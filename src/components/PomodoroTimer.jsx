import { useState, useEffect, useRef } from 'react';
import SpotifyPlayer from './SpotifyPlayer';
import ThemeParticles from './ThemeParticles';
import AmbientSoundboard from './AmbientSoundboard';
import { incrementContribution } from '../utils/contributions';

const ALARM_SOUND_OPTIONS = [
  { id: 'sparkle', name: 'Sparkle', emoji: '✨' },
  { id: 'train', name: 'Train Arrival', emoji: '🚄' },
  { id: 'commuter', name: 'Commuter Jingle', emoji: '🚊' },
  { id: 'gameshow', name: 'Game Show', emoji: '🎲' },
  { id: 'airport', name: 'Airport', emoji: '🛫' },
  { id: 'soft', name: 'Soft', emoji: '☁️' },
  { id: 'chime', name: 'Chime', emoji: '🔔' },
  { id: 'piano', name: 'Piano', emoji: '🎹' },
  { id: 'success', name: 'Success', emoji: '🏆' },
  { id: 'levelup', name: 'Level Up', emoji: '👾' },
  { id: 'applause', name: 'Applause', emoji: '👏' },
  { id: 'none', name: 'No Alert', emoji: '🔕' }
];

const getAlarmSoundDesc = (soundId) => {
  switch (soundId) {
    case 'sparkle':
      return 'Giai điệu lấp lánh dồn dập, tạo cảm giác kỳ ảo và tươi sáng.';
    case 'commuter':
      return 'Giai điệu ga tàu công cộng (kiểu Nhật), thanh tao, dễ chịu.';
    case 'airport':
      return 'Âm báo phát thanh sân bay cổ điển, thu hút chú ý nhẹ nhàng.';
    case 'chime':
      return 'Giai điệu thiền ngân vang thanh thoát, nhẹ nhàng, báo hiệu kết thúc phiên thư thái.';
    case 'success':
      return 'Giai điệu chiến thắng hào hùng, ăn mừng hoàn thành phiên học.';
    case 'applause':
      return 'Tiếng vỗ tay giòn giã mô phỏng bằng bộ lọc tiếng ồn.';
    case 'train':
      return 'Tiếng còi tàu kép trầm ấm, báo hiệu kết thúc phiên rõ ràng.';
    case 'gameshow':
      return 'Giai điệu 8-bit retro vui nhộn của game show truyền hình.';
    case 'soft':
      return 'Tần số sóng sine trầm ấm nhẹ nhàng, không gây giật mình.';
    case 'piano':
      return 'Hòa âm phím đàn piano mộc mạc, thư thái, tự nhiên.';
    case 'levelup':
      return 'Âm thanh tăng cấp arcade cổ điển, tạo động lực ôn tập.';
    case 'none':
      return 'Không âm báo (hoàn toàn im lặng khi hết giờ).';
    default:
      return 'Âm thanh bíp điện tử dồn dập, rõ ràng, giúp đánh thức sự tập trung tức thì.';
  }
};

const getVolumeLevelLabel = (vol) => {
  if (vol === 0) return 'Tắt tiếng 🔕';
  if (vol <= 20) return `${vol}% - Nhỏ nhẹ 🔈`;
  if (vol <= 50) return `${vol}% - Vừa phải 🔉`;
  if (vol <= 80) return `${vol}% - To rõ 🔊`;
  return `${vol}% - Rất to 📢 (Tránh giật mình)`;
};

const playSynthAlarm = (soundId, volumePercent) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Scale volume (max 0.4 to protect hearing)
    const vol = (volumePercent / 100) * 0.4;
    if (vol <= 0 || soundId === 'none') return;

    // Helper: standard beep with optional decay/type/gain-ramp
    const playBeep = (time, freq, duration, type = 'sine', decayTime = null) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, time);
      osc.type = type;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (decayTime || duration));

      osc.start(time);
      osc.stop(time + duration);
    };

    // Helper: noise burst (applause)
    const playNoiseBurst = (time, duration, burstVol) => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, time);
      filter.Q.setValueAtTime(2, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(burstVol, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(time);
      noise.stop(time + duration);
    };

    // Helper: piano-like sound (fundamental + harmonics)
    const playPianoNote = (time, freq, duration) => {
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      const harmonics = [1, 2, 3, 4];
      const weights = [1, 0.4, 0.2, 0.1];
      harmonics.forEach((h, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.frequency.setValueAtTime(freq * h, time);
        osc.type = 'sine';
        oscGain.gain.setValueAtTime(weights[i], time);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(time);
        osc.stop(time + duration);
      });
    };

    switch (soundId) {
      case 'sparkle': {
        const sparkleNotes = [1200, 1500, 1800, 2200, 2600, 3100];
        sparkleNotes.forEach((freq, idx) => {
          playBeep(now + idx * 0.06, freq, 0.25, 'sine');
        });
        break;
      }
      case 'commuter': {
        const commuterNotes = [659.25, 880, 987.77, 1109.73, 1318.51];
        commuterNotes.forEach((freq, idx) => {
          playBeep(now + idx * 0.12, freq, 0.6, 'sine');
        });
        break;
      }
      case 'airport': {
        playBeep(now, 554.37, 0.8, 'sine'); // C#5
        playBeep(now + 0.35, 440.00, 0.8, 'sine'); // A4
        break;
      }
      case 'chime': {
        const chimeNotes = [523.25, 659.25, 783.99, 1046.50];
        chimeNotes.forEach((freq, idx) => {
          playBeep(now + idx * 0.15, freq, 0.8, 'sine');
        });
        break;
      }
      case 'success': {
        playBeep(now, 523.25, 0.15, 'triangle'); // C5
        playBeep(now + 0.15, 659.25, 0.15, 'triangle'); // E5
        playBeep(now + 0.3, 783.99, 0.15, 'triangle'); // G5
        playBeep(now + 0.45, 1046.50, 0.6, 'triangle'); // C6
        playBeep(now + 0.45, 1318.51, 0.6, 'sine'); // E6
        break;
      }
      case 'applause': {
        for (let i = 0; i < 35; i++) {
          const burstTime = now + i * 0.05 + Math.random() * 0.03;
          const duration = 0.06 + Math.random() * 0.06;
          playNoiseBurst(burstTime, duration, vol * 0.35);
        }
        break;
      }
      case 'train': {
        playBeep(now, 330, 0.4, 'triangle');
        playBeep(now, 392, 0.4, 'triangle');
        playBeep(now + 0.5, 330, 0.6, 'triangle');
        playBeep(now + 0.5, 392, 0.6, 'triangle');
        break;
      }
      case 'gameshow': {
        playBeep(now, 440, 0.1, 'square');
        playBeep(now + 0.1, 554, 0.1, 'square');
        playBeep(now + 0.2, 659, 0.15, 'square');
        playBeep(now + 0.35, 880, 0.4, 'square');
        break;
      }
      case 'soft': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(329.63, now); // E4
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.8, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        osc.start(now);
        osc.stop(now + 1.8);
        break;
      }
      case 'piano': {
        playPianoNote(now, 523.25, 1.2); // C5
        playPianoNote(now + 0.2, 659.25, 1.0); // E5
        playPianoNote(now + 0.4, 783.99, 0.8); // G5
        break;
      }
      case 'levelup': {
        const levelUpNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        levelUpNotes.forEach((freq, idx) => {
          playBeep(now + idx * 0.07, freq, 0.15, 'triangle');
        });
        break;
      }
      case 'classic':
      default: {
        playBeep(now, 880, 0.15, 'sine');
        playBeep(now + 0.2, 880, 0.15, 'sine');
        playBeep(now + 0.38, 880, 0.15, 'sine');
        playBeep(now + 0.58, 1100, 0.5, 'sine');
        break;
      }
    }
  } catch (err) {
    console.warn('Cannot play synth sound:', err);
  }
};

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
  const [alarmVolume, setAlarmVolume] = useState(() => {
    const saved = localStorage.getItem('pomodoro_alarm_volume');
    return saved ? parseInt(saved, 10) : 50;
  });
  const [alarmSound, setAlarmSound] = useState(() => {
    return localStorage.getItem('pomodoro_alarm_sound') || 'classic';
  });

  const [mode, setMode] = useState('work'); // 'work' | 'shortBreak' | 'longBreak'
  const [isActive, setIsActive] = useState(false);
  const [completedWorkSessions, setCompletedWorkSessions] = useState(() => {
    const saved = localStorage.getItem('pomodoro_completed_sessions');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [breakLogs, setBreakLogs] = useState(() => {
    const saved = localStorage.getItem('pomodoro_break_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [historySubTab, setHistorySubTab] = useState('day');
  const [focusRange, setFocusRange] = useState('today'); // 'today' | 'week' | 'fourWeeks'

  // Active Tab: 'timer' | 'stats'
  const [activeTab, setActiveTab] = useState('timer');
  const [statsMode, setStatsMode] = useState('week'); // 'week' | 'month' | 'year'
  const [statsDateOffset, setStatsDateOffset] = useState(0); // 0 = current, -1 = previous, etc.

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
  const [inputAlarmVolume, setInputAlarmVolume] = useState(alarmVolume);
  const [inputAlarmSound, setInputAlarmSound] = useState(alarmSound);

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

    incrementContribution();

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
    window.dispatchEvent(new Event('studyLogsUpdated'));
    
    // Reset ref counter
    secondsStudiedRef.current = 0;
  };

  // Log on panel close
  useEffect(() => {
    if (!isOpen && mode === 'work' && secondsStudiedRef.current > 0) {
      logAccumulatedStudyTime();
    }
  }, [isOpen]);

  // Play session finished alarm
  const playAlarmSound = () => {
    playSynthAlarm(alarmSound, alarmVolume);
  };

  // Play preview alarm based on current unapplied inputs in settings
  const playPreviewAlarmSound = (overrideSoundId = null) => {
    const targetSound = overrideSoundId && typeof overrideSoundId === 'string' ? overrideSoundId : inputAlarmSound;
    playSynthAlarm(targetSound, inputAlarmVolume);
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
      // Log break session completed
      const today = new Date().toISOString().split('T')[0];
      const newBreak = { timestamp: Date.now(), date: today, type: mode };
      const updatedBreaks = [...breakLogs, newBreak];
      setBreakLogs(updatedBreaks);
      localStorage.setItem('pomodoro_break_logs', JSON.stringify(updatedBreaks));

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

    setIsSettingsOpen(false);
  };

  const handleCancelSettings = () => {
    setInputWork(workTime);
    setInputShort(shortBreakTime);
    setInputLong(longBreakTime);
    setInputAlarmVolume(alarmVolume);
    setInputAlarmSound(alarmSound);
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

  // Range calculation functions
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

  // Nav Label
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
    
    // Year
    if (statsDateOffset === 0) return 'Năm nay';
    if (statsDateOffset === -1) return 'Năm ngoái';
    const range = getYearRange(statsDateOffset);
    return `Năm ${range.year}`;
  };

  // Helper to sum seconds in range
  const getRangeTotalMinutes = (range) => {
    const rangeLogs = studyLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= range.start && logTime <= range.end;
    });
    return Math.round(rangeLogs.reduce((sum, log) => sum + log.seconds, 0) / 60);
  };

  // Calculate comparison values
  const getComparisonData = () => {
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
    
    const currTotal = getRangeTotalMinutes(currRange);
    const prevTotal = getRangeTotalMinutes(prevRange);
    
    let pctChange = 0;
    if (prevTotal > 0) {
      pctChange = Math.round(((currTotal - prevTotal) / prevTotal) * 100);
    } else if (currTotal > 0) {
      pctChange = 100;
    }
    return { currTotal, prevTotal, pctChange };
  };

  const comparison = getComparisonData();

  // Summary and logs for selected period
  const getSelectedPeriodSummary = () => {
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
  };

  const periodSummary = getSelectedPeriodSummary();

  // Subject breakdown for selected period
  const getSelectedPeriodSubjectStats = (periodLogs) => {
    const subjectMap = {};
    periodLogs.forEach(log => {
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

  const subjectBreakdown = getSelectedPeriodSubjectStats(periodSummary.logs);

  // Group data for the chart based on selected mode
  const getChartData = () => {
    if (statsMode === 'week') {
      const days = [];
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const range = getWeekRange(statsDateOffset);
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(range.start);
        d.setDate(range.start.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        
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
    
    // Year Mode: 12 months
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
  };

  const getStreakData = () => {
    const dates = Array.from(new Set(studyLogs.map(l => l.date))).sort();
    if (dates.length === 0) return { current: 0, longest: 0 };
    
    const parseLocalDate = (dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    };

    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Calculate current streak
    let current = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let hasToday = dates.includes(todayStr);
    let hasYesterday = dates.includes(yesterdayStr);
    
    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? new Date() : yesterday;
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
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
    
    // Sort dates ascending
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
  };

  const getActiveMetrics = () => {
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

    const streak = getStreakData();
    
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
  };

  const getHistoryList = () => {
    const list = [];
    const now = new Date();
    
    if (historySubTab === 'day') {
      // Last 7 days
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
      // Last 4 weeks
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
      // Last 6 months
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
  };

  const activeMetrics = getActiveMetrics();

  const chartData = getChartData();
  const maxMinutes = Math.max(...chartData.map(s => s.minutes), 30);

  const formatChartValue = (mins) => {
    if (mins === 0) return '0m';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  const getChartPoints = () => {
    const W = 600;
    const H = 220;
    const paddingX = 50;
    const topY = 40;
    const bottomY = 160;
    const plotHeight = bottomY - topY; // 120
    
    if (chartData.length === 0) return [];
    
    return chartData.map((day, idx) => {
      const x = chartData.length > 1
        ? paddingX + (idx / (chartData.length - 1)) * (W - 2 * paddingX)
        : W / 2;
      const y = maxMinutes > 0
        ? bottomY - (day.minutes / maxMinutes) * plotHeight
        : bottomY;
      return { x, y, label: day.label, subLabel: day.subLabel, minutes: day.minutes };
    });
  };

  const points = getChartPoints();
  
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
      
      {/* Canvas particle effect overlay */}
      <ThemeParticles theme={activeTheme} />
      
      {/* Dark overlay for contrast */}
      <div className="pomodoro-tint-overlay" />

      {/* Floating Close Button */}
      <button className="pomodoro-close-btn" onClick={onClose} aria-label="Đóng Pomodoro">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div className={`pomodoro-sidebar-content tab-${activeTab}`}>
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
          {isOpen && <AmbientSoundboard />}

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
                Cấu hình thời gian & Chuông báo
              </button>
            ) : (
              <form className="pomodoro-settings-form" onSubmit={handleSaveSettings}>
                <h3 className="settings-form-title">Cài đặt Pomodoro & Chuông báo</h3>
                
                <div className="settings-field">
                  <label htmlFor="settings-work">Tập trung (phút)</label>
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
                  <label htmlFor="settings-short">Nghỉ ngắn (phút)</label>
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
                  <label htmlFor="settings-long">Nghỉ dài (phút)</label>
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

                <div className="settings-field" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="settings-alarm-vol">Âm lượng chuông</label>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#8b5cf6' }}>
                      {getVolumeLevelLabel(inputAlarmVolume)}
                    </span>
                  </div>
                  <input 
                    id="settings-alarm-vol"
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    value={inputAlarmVolume} 
                    onChange={(e) => setInputAlarmVolume(parseInt(e.target.value, 10))}
                    onMouseUp={() => playPreviewAlarmSound()}
                    onTouchEnd={() => playPreviewAlarmSound()}
                    className="sound-volume-slider"
                    style={{
                      width: '100%',
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${inputAlarmVolume}%, rgba(255, 255, 255, 0.12) ${inputAlarmVolume}%, rgba(255, 255, 255, 0.12) 100%)`
                    }}
                  />
                </div>

                <div className="settings-field" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.6rem' }}>
                  <label>Kiểu âm báo</label>
                  <div className="alarm-sound-grid">
                    {ALARM_SOUND_OPTIONS.map((opt) => {
                      const isActive = inputAlarmSound === opt.id;
                      return (
                        <div 
                          key={opt.id} 
                          className={`alarm-sound-option ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            setInputAlarmSound(opt.id);
                            playPreviewAlarmSound(opt.id);
                          }}
                        >
                          <div className="alarm-sound-radio">
                            <div className="alarm-sound-radio-inner" />
                          </div>
                          <span className="alarm-sound-label">
                            {opt.emoji} {opt.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="alarm-sound-desc-box" style={{
                    marginTop: '0.25rem',
                    padding: '0.6rem 0.8rem',
                    background: 'rgba(10, 14, 23, 0.4)',
                    border: '1px dashed rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.45',
                    textAlign: 'left'
                  }}>
                    <span style={{ color: '#fff', fontWeight: '700' }}>Đặc trưng:</span> {getAlarmSoundDesc(inputAlarmSound)}
                  </div>
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
                      borderColor: statsMode === modeOpt ? getThemeColor() : '',
                      boxShadow: statsMode === modeOpt ? `0 0 8px ${getThemeColor()}30` : ''
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

            <div className="stats-chart-wrapper" style={{ marginTop: '1rem', width: '100%', overflowX: 'auto' }}>
              <div style={{ minWidth: '450px', width: '100%' }}>
                <svg viewBox="0 0 600 220" width="100%" height="220" style={{ display: 'block', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="chartFillGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={getThemeColor()} stopOpacity="0.45" />
                      <stop offset="100%" stopColor={getThemeColor()} stopOpacity="0.0" />
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
                      <path d={lineD} fill="none" stroke={getThemeColor()} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Circles, Values and Labels */}
                      {points.map((p, idx) => (
                        <g key={idx}>
                          {/* Dot Circle */}
                          <circle cx={p.x} cy={p.y} r="5.5" fill="#ffffff" stroke={getThemeColor()} strokeWidth="3" />

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
              <p className="breakdown-empty-text">Chưa có dữ liệu học tập cho chu kỳ này.</p>
            )}
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
              {getHistoryList().map((item, idx) => (
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
