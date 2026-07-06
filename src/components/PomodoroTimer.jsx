import { useState, useEffect, useRef } from 'react';
import SpotifyPlayer from './SpotifyPlayer';
import ThemeParticles from './ThemeParticles';
import AmbientSoundboard from './AmbientSoundboard';
import { incrementContribution } from '../utils/contributions';
import FocusStatsTab from './FocusStatsTab';

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

const STUDY_QUOTES = [
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "There is no elevator to success. You have to take the stairs.", author: "Anonymous" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
  { text: "The best way to predict your future is to create it.", author: "Abraham Lincoln" },
  { text: "Genius is 1% inspiration, 99% perspiration.", author: "Thomas Edison" }
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
    if (vol <= 0 || soundId === 'none') {
      ctx.close().catch(() => {});
      return;
    }

    // Automatically close AudioContext to prevent resource leak
    setTimeout(() => {
      if (ctx.state !== 'closed') {
        ctx.close().catch(e => console.warn('Error closing AudioContext:', e));
      }
    }, 2200);

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

function PomodoroTimer({ isOpen, onClose, exams = [], generalTasks = [], onToggleTask }) {
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

  // Active Tab: 'timer' | 'stats'
  const [activeTab, setActiveTab] = useState('timer');

  // Active Theme: 'default' | 'lofi-cafe' | 'cyberpunk-alley' | 'sakura-library' | 'space-odyssey' | 'nature-cabin' | 'custom'
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('pomodoro_theme') || 'default';
  });

  const [customBg, setCustomBg] = useState(() => {
    return localStorage.getItem('pomodoro_custom_bg') || '';
  });

  const [customThemeData, setCustomThemeData] = useState(() => {
    const saved = localStorage.getItem('pomodoro_custom_theme_data');
    return saved ? JSON.parse(saved) : null;
  });

  const customBgInputRef = useRef(null);

  // Focus Subject ID: 'general' or exam.id
  const [focusSubjectId, setFocusSubjectId] = useState(() => {
    return localStorage.getItem('pomodoro_focus_subject') || 'general';
  });

  // Focus Task ID: 'general' or task.id
  const [focusTaskId, setFocusTaskId] = useState(() => {
    return localStorage.getItem('pomodoro_focus_task') || 'general';
  });

  // Save selected subject
  useEffect(() => {
    localStorage.setItem('pomodoro_focus_subject', focusSubjectId);
  }, [focusSubjectId]);

  // Save selected task
  useEffect(() => {
    localStorage.setItem('pomodoro_focus_task', focusTaskId);
  }, [focusTaskId]);

  const [isStopwatch, setIsStopwatch] = useState(() => {
    return localStorage.getItem('pomodoro_is_stopwatch') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('pomodoro_is_stopwatch', isStopwatch.toString());
  }, [isStopwatch]);

  // Sync extracted custom color theme with global CSS variables when custom theme is active
  useEffect(() => {
    if (activeTheme === 'custom') {
      const h = customThemeData ? customThemeData.h : 270;
      const s = customThemeData ? customThemeData.s : 0.75;
      const l = customThemeData ? customThemeData.l : 0.58;
      
      const hComp = (h + 180) % 360;
      const primaryColor = `hsl(${hComp}, 85%, 58%)`;
      const primaryGlow = `hsla(${hComp}, 85%, 58%, 0.45)`;

      const bgPrimary = `hsl(${h}, 15%, 5%)`;
      const bgSecondary = `hsl(${h}, 15%, 8%)`;
      const bgGlass = `hsla(${h}, 20%, 12%, 0.45)`;
      const borderGlass = `hsla(${h}, 30%, 50%, 0.15)`;

      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-primary-glow', primaryGlow);
      document.documentElement.style.setProperty('--bg-primary', bgPrimary);
      document.documentElement.style.setProperty('--bg-secondary', bgSecondary);
      document.documentElement.style.setProperty('--bg-glass', bgGlass);
      document.documentElement.style.setProperty('--border-glass', borderGlass);
      document.body.style.backgroundColor = bgPrimary;
    } else {
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-primary-glow');
      document.documentElement.style.removeProperty('--bg-primary');
      document.documentElement.style.removeProperty('--bg-secondary');
      document.documentElement.style.removeProperty('--bg-glass');
      document.documentElement.style.removeProperty('--border-glass');
      document.body.style.backgroundColor = '';
    }

    return () => {
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-primary-glow');
      document.documentElement.style.removeProperty('--bg-primary');
      document.documentElement.style.removeProperty('--bg-secondary');
      document.documentElement.style.removeProperty('--bg-glass');
      document.documentElement.style.removeProperty('--border-glass');
      document.body.style.backgroundColor = '';
    };
  }, [activeTheme, customThemeData]);

  const [currentQuote, setCurrentQuote] = useState(() => {
    const idx = Math.floor(Math.random() * STUDY_QUOTES.length);
    return STUDY_QUOTES[idx];
  });

  const changeQuote = () => {
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * STUDY_QUOTES.length);
    } while (STUDY_QUOTES[nextIdx].text === currentQuote.text && STUDY_QUOTES.length > 1);
    setCurrentQuote(STUDY_QUOTES[nextIdx]);
  };

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
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false);
  
  const [lowPowerMode, setLowPowerMode] = useState(() => {
    return localStorage.getItem('pomodoro_low_power') === 'true';
  });

  // Custom inputs for settings form
  const [inputWork, setInputWork] = useState(workTime);
  const [inputShort, setInputShort] = useState(shortBreakTime);
  const [inputLong, setInputLong] = useState(longBreakTime);
  const [inputAlarmVolume, setInputAlarmVolume] = useState(alarmVolume);
  const [inputAlarmSound, setInputAlarmSound] = useState(alarmSound);
  const [inputLowPower, setInputLowPower] = useState(lowPowerMode);

  const timerRef = useRef(null);

  // Save completed sessions to LocalStorage
  useEffect(() => {
    localStorage.setItem('pomodoro_completed_sessions', completedWorkSessions.toString());
  }, [completedWorkSessions]);

  // Update browser tab title and favicon to show countdown timer (Windows taskbar)
  useEffect(() => {
    const totalSecs = mode === 'work' ? workTime * 60 : (mode === 'shortBreak' ? shortBreakTime * 60 : longBreakTime * 60);
    const isTimerDirty = timeLeft !== totalSecs;
    
    if (isActive || isTimerDirty) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      
      let emoji = '⚡';
      if (mode === 'shortBreak') emoji = '☕';
      if (mode === 'longBreak') emoji = '🍃';
      
      const prefix = isActive ? '' : '⏸️ ';
      document.title = `${prefix}${emoji} ${timeStr} | Đồng Hồ Lịch Thi`;
      
      const favicon = document.querySelector("link[rel*='icon']");
      if (favicon) {
        favicon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
      }
    } else {
      document.title = "Đồng Hồ Đếm Ngược Lịch Thi - Theo Dõi Lịch Thi Thời Gian Thực";
      const favicon = document.querySelector("link[rel*='icon']");
      if (favicon) {
        favicon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⏱️</text></svg>`;
      }
    }

    return () => {
      document.title = "Đồng Hồ Đếm Ngược Lịch Thi - Theo Dõi Lịch Thi Thời Gian Thực";
      const favicon = document.querySelector("link[rel*='icon']");
      if (favicon) {
        favicon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⏱️</text></svg>`;
      }
    };
  }, [timeLeft, mode, isActive, workTime, shortBreakTime, longBreakTime]);

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
    
    // Dispatch custom event to award XP (100 XP per 25 mins = 1500 seconds)
    const xpGained = Math.round((seconds / 1500) * 100);
    if (xpGained > 0) {
      window.dispatchEvent(new CustomEvent('gain-xp', { detail: xpGained }));
    }
    
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
        
        if (isStopwatch) {
          setTimeLeft((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleSessionEndRef.current();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, isStopwatch]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === 'work' && secondsStudiedRef.current > 0) {
      logAccumulatedStudyTime();
    }
    setTimeLeft(isStopwatch ? 0 : getTotalSeconds());
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

  // Keyboard shortcuts listener when panel is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'SELECT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable
      );
      if (isInputActive) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleStartPause();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        const newVal = !lowPowerMode;
        setLowPowerMode(newVal);
        setInputLowPower(newVal);
        localStorage.setItem('pomodoro_low_power', newVal.toString());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleStartPause, handleSkip, onClose, lowPowerMode]);

  // Save customized time configurations
  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    const w = Math.max(1, Math.min(60, parseInt(inputWork, 10) || 25));
    const s = Math.max(1, Math.min(60, parseInt(inputShort, 10) || 5));
    const l = Math.max(1, Math.min(60, parseInt(inputLong, 10) || 15));
    const vol = Math.max(0, Math.min(100, parseInt(inputAlarmVolume, 10) || 50));
    const snd = inputAlarmSound;
    const lowPower = inputLowPower;

    setWorkTime(w);
    setShortBreakTime(s);
    setLongBreakTime(l);
    setAlarmVolume(vol);
    setAlarmSound(snd);
    setLowPowerMode(lowPower);

    localStorage.setItem('pomodoro_work', w.toString());
    localStorage.setItem('pomodoro_short_break', s.toString());
    localStorage.setItem('pomodoro_long_break', l.toString());
    localStorage.setItem('pomodoro_alarm_volume', vol.toString());
    localStorage.setItem('pomodoro_alarm_sound', snd);
    localStorage.setItem('pomodoro_low_power', lowPower.toString());

    setIsSettingsOpen(false);
  };

  const handleCancelSettings = () => {
    setInputWork(workTime);
    setInputShort(shortBreakTime);
    setInputLong(longBreakTime);
    setInputAlarmVolume(alarmVolume);
    setInputAlarmSound(alarmSound);
    setInputLowPower(lowPowerMode);
    setIsSettingsOpen(false);
  };

  const handleThemeChange = (themeId) => {
    setActiveTheme(themeId);
    localStorage.setItem('pomodoro_theme', themeId);
  };

  const extractDominantColor = (imgElement) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgElement, 0, 0, 16, 16);
      
      const imgData = ctx.getImageData(0, 0, 16, 16).data;
      
      let bestColor = null;
      let maxVibrancy = -1;
      const hueBuckets = new Array(360).fill(0);
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      let maxS = 0;

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i+1];
        const b = imgData[i+2];
        const a = imgData[i+3];
        
        if (a < 150) continue;

        rSum += r;
        gSum += g;
        bSum += b;
        count++;

        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        const delta = max - min;
        
        const l = (max + min) / 2;
        let s = 0;
        if (max !== min) {
          s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        }
        
        let h = 0;
        if (delta !== 0) {
          if (max === rNorm) {
            h = ((gNorm - bNorm) / delta) % 6;
          } else if (max === gNorm) {
            h = (bNorm - rNorm) / delta + 2;
          } else {
            h = (rNorm - gNorm) / delta + 4;
          }
          h = Math.round(h * 60);
          if (h < 0) h += 360;
        }

        if (s > maxS) maxS = s;

        if (s > 0.05) {
          hueBuckets[h]++;
        }

        if (s > 0.25 && l > 0.35 && l < 0.75) {
          const vibrancy = s * (1 - Math.abs(2 * l - 1));
          if (vibrancy > maxVibrancy) {
            maxVibrancy = vibrancy;
            bestColor = { h, s, l };
          }
        }
      }

      if (bestColor) {
        return { h: bestColor.h, s: bestColor.s, l: bestColor.l };
      }

      let dominantHue = -1;
      let maxHueCount = 0;
      for (let h = 0; h < 360; h++) {
        if (hueBuckets[h] > maxHueCount) {
          maxHueCount = hueBuckets[h];
          dominantHue = h;
        }
      }

      if (dominantHue !== -1 && maxS > 0.1) {
        return { h: dominantHue, s: 0.75, l: 0.58 };
      }
      
      return { h: 270, s: 0.75, l: 0.58 };
    } catch (e) {
      console.warn('Error extracting color:', e);
      return { h: 270, s: 0.75, l: 0.58 };
    }
  };

  const handleCustomBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
        
        const themeData = extractDominantColor(img);

        try {
          localStorage.setItem('pomodoro_custom_bg', compressedBase64);
          localStorage.setItem('pomodoro_custom_theme_data', JSON.stringify(themeData));
          setCustomBg(compressedBase64);
          setCustomThemeData(themeData);
        } catch (err) {
          console.error('Failed to save to localStorage:', err);
          alert('Không thể lưu ảnh do dung lượng quá lớn hoặc trình duyệt đầy bộ nhớ. Vui lòng chọn ảnh khác nhỏ hơn.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomBg = () => {
    localStorage.removeItem('pomodoro_custom_bg');
    localStorage.removeItem('pomodoro_custom_theme_data');
    setCustomBg('');
    setCustomThemeData(null);
  };

  const handleClearStats = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử thống kê học tập không?')) {
      setStudyLogs([]);
      localStorage.removeItem('pomodoro_study_logs');
    }
  };

  // Format timeLeft to HH:MM:SS or MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Circular Progress Circular Ring parameters
  const totalSeconds = getTotalSeconds();

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
      case 'custom': return '#a855f7';           // Premium purple
      default: return '#ef4444';                 // Default red
    }
  };

  return (
    <div className={`pomodoro-sidebar ${isOpen ? 'open' : ''} theme-${activeTheme}`}>
      {/* Background image overlay if activeTheme is chosen */}
      {activeTheme !== 'default' && (
        <div 
          className="pomodoro-theme-bg" 
          style={{ 
            backgroundImage: activeTheme === 'custom' 
              ? (customBg ? `url(${customBg})` : 'none') 
              : `url(/${activeTheme}.png)` 
          }} 
        />
      )}
      
      {/* Canvas particle effect overlay */}
      <ThemeParticles theme={activeTheme === 'custom' ? 'lofi-cafe' : activeTheme} lowPowerMode={lowPowerMode} />
      
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🍅</span>
            <h2 className="pomodoro-title">Trạm Tập Trung Pomodoro</h2>
          </div>
          <button 
            type="button"
            className="keyboard-help-btn"
            onClick={() => setIsShortcutHelpOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: '600',
              transition: 'var(--transition-smooth)'
            }}
            title="Xem danh sách phím tắt"
          >
            ⌨️ Phím tắt
          </button>
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
              onChange={(e) => {
                setFocusSubjectId(e.target.value);
                setFocusTaskId('general');
              }}
              disabled={isActive}
              className="form-input"
            >
              <option value="general">Học tập chung (Không chọn môn)</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.subject}</option>
              ))}
            </select>
          </div>

          {/* Focus Task Selector */}
          {(() => {
            let tasks = [];
            let label = "📋 Chọn nhiệm vụ cần hoàn thành:";
            if (focusSubjectId !== 'general') {
              const selectedExam = exams.find(e => e.id === focusSubjectId);
              tasks = selectedExam?.tasks || [];
            } else {
              tasks = generalTasks || [];
              label = "📋 Chọn nhiệm vụ chung cần hoàn thành:";
            }
            if (tasks.length === 0) return null;
            return (
              <div className="focus-task-selector" style={{ marginTop: '0.6rem', marginBottom: '0.2rem' }}>
                <label htmlFor="focus-task-select" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                  {label}
                </label>
                <select 
                  id="focus-task-select"
                  value={focusTaskId} 
                  onChange={(e) => setFocusTaskId(e.target.value)}
                  disabled={isActive}
                  className="form-input"
                  style={{ marginTop: '0.2rem' }}
                >
                  <option value="general">Nhiệm vụ chung (Không chọn cụ thể)</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.text} {task.completed ? '✅' : ''}
                    </option>
                  ))}
                </select>
              </div>
            );
          })()}

          {/* Countdown vs Stopwatch Toggle */}
          <div className="pomodoro-mode-toggle-group">
            <button 
              type="button"
              className={`pomodoro-mode-toggle-btn ${!isStopwatch ? 'active' : ''}`}
              onClick={() => {
                setIsActive(false);
                setIsStopwatch(false);
                setTimeLeft(getTotalSeconds());
              }}
            >
              ⏳ Đếm ngược
            </button>
            <button 
              type="button"
              className={`pomodoro-mode-toggle-btn ${isStopwatch ? 'active' : ''}`}
              onClick={() => {
                setIsActive(false);
                setIsStopwatch(true);
                setTimeLeft(0);
              }}
            >
              ⏱️ Bấm giờ (Đếm xuôi)
            </button>
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

          {/* Large Digital Timer & Progress Bar */}
          <div className="pomodoro-display-container">
            <div className="pomodoro-timer-large">{formatTime(timeLeft)}</div>
            <span className="pomodoro-timer-label" style={{ marginTop: '0.4rem', marginBottom: '1rem' }}>{getModeLabel()}</span>
            
            {!isStopwatch && (
              <div className="pomodoro-timer-progress-container" style={{ width: '100%', maxWidth: '300px', margin: '0 auto 1rem auto' }} title={`${totalSeconds > 0 ? Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100) : 0}% hoàn thành`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)', marginBottom: '5px', fontWeight: '600' }}>
                  <span>Tiến độ phiên</span>
                  <span>{totalSeconds > 0 ? Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100) : 0}%</span>
                </div>
                <div className="pomodoro-timer-progress-track" style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    className="pomodoro-timer-progress-fill" 
                    style={{ 
                      height: '100%', 
                      width: `${totalSeconds > 0 ? Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100) : 0}%`, 
                      backgroundColor: getThemeColor(), 
                      borderRadius: '3px',
                      transition: 'width 0.3s linear',
                      boxShadow: `0 0 10px ${getThemeColor()}`
                    }} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Session Progress Dots */}
          {!isStopwatch && (
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
          )}

          {/* Motivation Quote Banner */}
          <div className="pomodoro-quote-container" onClick={changeQuote} title="Nhấp để đổi câu châm ngôn">
            <p className="pomodoro-quote-text">“{currentQuote.text}”</p>
            <p className="pomodoro-quote-author">— {currentQuote.author || 'Khuyết danh'}</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span className="theme-selector-label" style={{ margin: 0 }}>🖼️ Không gian học tập:</span>
              <button 
                type="button"
                className="low-power-toggle-btn"
                onClick={() => {
                  const newVal = !lowPowerMode;
                  setLowPowerMode(newVal);
                  setInputLowPower(newVal);
                  localStorage.setItem('pomodoro_low_power', newVal.toString());
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: lowPowerMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${lowPowerMode ? '#10b981' : 'rgba(255, 255, 255, 0.15)'}`,
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  color: lowPowerMode ? '#34d399' : 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: lowPowerMode ? '0 0 10px rgba(16, 185, 129, 0.2)' : 'none'
                }}
                title={lowPowerMode ? "Tắt tiết kiệm pin để hiển thị hiệu ứng động" : "Bật tiết kiệm pin để tắt hiệu ứng động"}
              >
                {lowPowerMode ? '🔋 Tiết kiệm pin: BẬT' : '🔌 Tiết kiệm pin: TẮT'}
              </button>
            </div>
            <div className="theme-options">
              {[
                { id: 'default', name: 'Mặc định', emoji: '🌌' },
                { id: 'lofi-cafe', name: 'Lofi Café', emoji: '☕' },
                { id: 'cyberpunk-alley', name: 'Cyberpunk', emoji: '🌃' },
                { id: 'sakura-library', name: 'Sakura', emoji: '🌸' },
                { id: 'space-odyssey', name: 'Vũ trụ', emoji: '🚀' },
                { id: 'nature-cabin', name: 'Nhà gỗ', emoji: '🌲' },
                { id: 'custom', name: 'Tùy chỉnh', emoji: '🖼️' }
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

            {activeTheme === 'custom' && (
              <div className="custom-theme-upload-container">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                  <button
                    type="button"
                    className="btn btn-secondary custom-bg-upload-btn"
                    onClick={() => customBgInputRef.current?.click()}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    📁 Chọn ảnh nền
                  </button>
                  {customBg && (
                    <button
                      type="button"
                      className="btn-icon-tiny delete-custom-bg-btn"
                      onClick={handleRemoveCustomBg}
                      title="Xóa ảnh nền tùy chỉnh"
                      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', padding: 0 }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={customBgInputRef}
                  onChange={handleCustomBgUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <p className="custom-bg-tip">
                  Dùng ảnh JPG/PNG phong cảnh. Ảnh sẽ được tối ưu hóa để lưu offline.
                </p>
              </div>
            )}
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

                <div className="settings-field" style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', gap: '0.5rem', marginTop: '0.4rem', marginBottom: '0.4rem' }}>
                  <label htmlFor="settings-low-power" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                    🔋 Tiết kiệm pin tối đa (Tắt Canvas hạt)
                  </label>
                  <input 
                    id="settings-low-power"
                    type="checkbox" 
                    checked={inputLowPower} 
                    onChange={(e) => setInputLowPower(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#8b5cf6' }}
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
        <FocusStatsTab
          studyLogs={studyLogs}
          breakLogs={breakLogs}
          exams={exams}
          themeColor={getThemeColor()}
          onClearStats={handleClearStats}
        />
      )}
      </div>
      {isShortcutHelpOpen && (
        <div className="modal-overlay" onClick={() => setIsShortcutHelpOpen(false)} style={{ zIndex: 2100 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', padding: '1.75rem', gap: '1.25rem' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: '1.25rem' }}>⌨️ Phím tắt Trạm Pomodoro</h3>
              <button 
                type="button" 
                onClick={() => setIsShortcutHelpOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                &times;
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[
                { keys: ['Space'], desc: 'Bắt đầu / Tạm dừng đồng hồ' },
                { keys: ['Esc'], desc: 'Đóng Trạm tập trung' },
                { keys: ['S'], desc: 'Bỏ qua (Skip) phiên học' },
                { keys: ['L'], desc: 'Bật / Tắt nhanh Tiết kiệm pin' }
              ].map(item => (
                <div key={item.desc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{item.desc}</span>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    {item.keys.map(k => (
                      <kbd key={k} style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: '5px',
                        padding: '2px 8px',
                        fontSize: '0.78rem',
                        color: '#a78bfa',
                        fontFamily: 'inherit',
                        boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
                        fontWeight: '600'
                      }}>{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={() => setIsShortcutHelpOpen(false)} 
              style={{ width: '100%', backgroundColor: getThemeColor(), borderColor: getThemeColor() }}
            >
              Đóng bảng trợ giúp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PomodoroTimer;
