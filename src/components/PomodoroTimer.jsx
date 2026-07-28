import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import SpotifyPlayer from './SpotifyPlayer';
import ThemeParticles from './ThemeParticles';
import AmbientSoundboard from './AmbientSoundboard';
import { incrementContribution } from '../utils/contributions';
import FocusStatsTab from './FocusStatsTab';
import { playSynthAlarm, STUDY_QUOTES } from './pomodoro/audioSynthesizer';
import TimerDisplay from './pomodoro/TimerDisplay';
import FloatingTimer from './pomodoro/FloatingTimer';
import DistractionParkingLot from './pomodoro/DistractionParkingLot';
import BreakCoach from './pomodoro/BreakCoach';
import ThemeSelector from './pomodoro/ThemeSelector';
import AlarmSoundSettings from './pomodoro/AlarmSoundSettings';
import { getLocalDateKey } from '../utils/date';
import {
  getCountdownSeconds,
  getElapsedWholeSeconds,
  getStopwatchSeconds
} from '../utils/timer';
import { deliverFocusEvent } from '../utils/integrations';

const getStoredNumber = (key, fallback, min, max) => {
  const value = Number.parseInt(localStorage.getItem(key), 10);
  return Number.isFinite(value) && value >= min && value <= max ? value : fallback;
};

const ANIMEDORO_WORK_MINUTES = 50;
const ANIMEDORO_BREAK_MINUTES = 20;

function PomodoroTimer({
  isOpen,
  onClose,
  exams = [],
  generalTasks = [],
  notificationsEnabled = false
}) {
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

  const [timerType, setTimerType] = useState('pomodoro'); // pomodoro, animedoro, or stopwatch
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
  const [miniWindow, setMiniWindow] = useState(null);

  const getTotalSeconds = useCallback(() => {
    if (timerType === 'stopwatch') return 0;
    if (timerType === 'animedoro') {
      return (mode === 'work' ? ANIMEDORO_WORK_MINUTES : ANIMEDORO_BREAK_MINUTES) * 60;
    }
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
  const [focusTaskId, setFocusTaskId] = useState(() => {
    return localStorage.getItem('pomodoro_focus_task') || 'general';
  });
  const availableFocusTasks = useMemo(() => {
    if (focusSubjectId === 'general') return generalTasks;
    return exams.find((exam) => exam.id === focusSubjectId)?.tasks || [];
  }, [focusSubjectId, exams, generalTasks]);

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
  const deadlineAtRef = useRef(null);
  const stopwatchStartedAtRef = useRef(null);
  const lastDisplayedTimeRef = useRef(null);
  const completionScheduledRef = useRef(false);
  const miniWindowRef = useRef(null);

  const calculateSecondsForMode = useCallback((targetMode, targetType) => {
    if (targetType === 'stopwatch') return 0;
    if (targetType === 'animedoro') {
      return (targetMode === 'work' ? ANIMEDORO_WORK_MINUTES : ANIMEDORO_BREAK_MINUTES) * 60;
    }
    if (targetMode === 'work') return workTime * 60;
    if (targetMode === 'shortBreak') return shortBreakTime * 60;
    if (targetMode === 'longBreak') return longBreakTime * 60;
    return workTime * 60;
  }, [workTime, shortBreakTime, longBreakTime]);

  useEffect(() => {
    const syncFocusTarget = (event) => {
      const target = event.detail;
      if (!target?.examId || !target?.taskId) return;
      setFocusSubjectId(target.examId);
      setFocusTaskId(target.taskId);
    };
    window.addEventListener('pomodoro-focus-target', syncFocusTarget);
    return () => window.removeEventListener('pomodoro-focus-target', syncFocusTarget);
  }, []);

  const switchModeAndType = useCallback((newMode, newType) => {
    setIsActive(false);
    setMode(newMode);
    setTimerType(newType);
    const nextSeconds = calculateSecondsForMode(newMode, newType);
    deadlineAtRef.current = null;
    stopwatchStartedAtRef.current = null;
    lastDisplayedTimeRef.current = nextSeconds;
    setTimeLeft(nextSeconds);
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
    void deliverFocusEvent(newLog);
    
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

  const showSessionNotification = useCallback(async (completedMode) => {
    if (!notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;

    const wasWorkSession = completedMode === 'work';
    const title = wasWorkSession ? 'Hoàn thành phiên tập trung!' : 'Hết giờ nghỉ!';
    const options = {
      body: wasWorkSession
        ? 'Làm tốt lắm. Đến lúc nghỉ một chút rồi.'
        : 'Sẵn sàng quay lại học nhé.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'pomodoro-session-complete',
      renotify: true,
      data: { url: window.location.href }
    };

    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) {
        await registration.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
    } catch {
      try {
        new Notification(title, options);
      } catch {
        // The alarm and in-app state still work if the OS blocks notifications.
      }
    }
  }, [notificationsEnabled]);

  const handleSessionComplete = useCallback(() => {
    setIsActive(false);
    playAlarmSound();
    void showSessionNotification(mode);

    let targetMode = 'work';
    if (mode === 'work') {
      logAccumulatedStudyTime();
      const nextCount = completedWorkSessions + 1;
      if (timerType === 'animedoro') {
        const normalizedCount = nextCount >= 4 ? 0 : nextCount;
        setCompletedWorkSessions(normalizedCount);
        localStorage.setItem('pomodoro_completed_sessions', normalizedCount.toString());
        targetMode = 'shortBreak';
      } else if (nextCount >= 4) {
        setCompletedWorkSessions(0);
        localStorage.setItem('pomodoro_completed_sessions', '0');
        targetMode = 'longBreak';
      } else {
        setCompletedWorkSessions(nextCount);
        localStorage.setItem('pomodoro_completed_sessions', nextCount.toString());
        targetMode = 'shortBreak';
      }
    }
    const nextSeconds = calculateSecondsForMode(targetMode, timerType);
    deadlineAtRef.current = null;
    stopwatchStartedAtRef.current = null;
    lastDisplayedTimeRef.current = nextSeconds;
    setMode(targetMode);
    setTimeLeft(nextSeconds);
  }, [mode, timerType, completedWorkSessions, playAlarmSound, showSessionNotification, logAccumulatedStudyTime, calculateSecondsForMode]);

  // Derive the display from absolute time anchors. The callback may be delayed by
  // Edge in a background tab without making the timer itself lose elapsed time.
  useEffect(() => {
    if (!isActive) return;

    completionScheduledRef.current = false;
    const startingSeconds = lastDisplayedTimeRef.current ?? 0;
    if (timerType === 'stopwatch') {
      if (!Number.isFinite(stopwatchStartedAtRef.current)) {
        stopwatchStartedAtRef.current = Date.now() - startingSeconds * 1000;
      }
    } else if (!Number.isFinite(deadlineAtRef.current)) {
      deadlineAtRef.current = Date.now() + startingSeconds * 1000;
    }

    const tick = () => {
      const now = Date.now();
      const previous = lastDisplayedTimeRef.current ?? 0;
      const next = timerType === 'stopwatch'
        ? getStopwatchSeconds(stopwatchStartedAtRef.current, now)
        : getCountdownSeconds(deadlineAtRef.current, now);

      const elapsedSeconds = timerType === 'stopwatch'
        ? getElapsedWholeSeconds(previous, next)
        : getElapsedWholeSeconds(next, previous);
      if ((timerType === 'stopwatch' || mode === 'work') && elapsedSeconds > 0) {
        secondsStudiedRef.current += elapsedSeconds;
      }

      lastDisplayedTimeRef.current = next;
      setTimeLeft(current => current === next ? current : next);

      if (timerType !== 'stopwatch' && next === 0 && !completionScheduledRef.current) {
        completionScheduledRef.current = true;
        handleSessionComplete();
      }
    };

    tick();
    const intervalHost = miniWindow && !miniWindow.closed ? miniWindow : window;
    timerRef.current = intervalHost.setInterval(tick, 1000);
    const handleVisibilityChange = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    miniWindow?.document.addEventListener('visibilitychange', tick);

    return () => {
      if (timerRef.current) intervalHost.clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      miniWindow?.document.removeEventListener('visibilitychange', tick);
    };
  }, [isActive, mode, timerType, miniWindow, handleSessionComplete]);

  const handleStartPause = useCallback(() => {
    const now = Date.now();
    if (isActive) {
      const next = timerType === 'stopwatch'
        ? getStopwatchSeconds(stopwatchStartedAtRef.current, now)
        : getCountdownSeconds(deadlineAtRef.current, now);
      const previous = lastDisplayedTimeRef.current ?? next;
      const elapsedSeconds = timerType === 'stopwatch'
        ? getElapsedWholeSeconds(previous, next)
        : getElapsedWholeSeconds(next, previous);
      if ((timerType === 'stopwatch' || mode === 'work') && elapsedSeconds > 0) {
        secondsStudiedRef.current += elapsedSeconds;
      }
      lastDisplayedTimeRef.current = next;
      setTimeLeft(next);
      deadlineAtRef.current = null;
      stopwatchStartedAtRef.current = null;
      setIsActive(false);
      return;
    }

    const startSeconds = timerType !== 'stopwatch' && timeLeft <= 0
      ? calculateSecondsForMode(mode, timerType)
      : timeLeft;
    if (startSeconds !== timeLeft) setTimeLeft(startSeconds);

    if (timerType === 'stopwatch') {
      stopwatchStartedAtRef.current = now - startSeconds * 1000;
      deadlineAtRef.current = null;
    } else {
      deadlineAtRef.current = now + startSeconds * 1000;
      stopwatchStartedAtRef.current = null;
    }
    lastDisplayedTimeRef.current = startSeconds;
    setIsActive(true);
  }, [isActive, timerType, mode, timeLeft, calculateSecondsForMode]);

  const handleReset = useCallback(() => {
    setIsActive(false);
    if ((timerType === 'stopwatch' || (timerType !== 'stopwatch' && mode === 'work')) && secondsStudiedRef.current > 0) {
      logAccumulatedStudyTime();
    }
    const nextSeconds = timerType === 'stopwatch' ? 0 : calculateSecondsForMode(mode, timerType);
    deadlineAtRef.current = null;
    stopwatchStartedAtRef.current = null;
    lastDisplayedTimeRef.current = nextSeconds;
    setTimeLeft(nextSeconds);
  }, [timerType, mode, calculateSecondsForMode, logAccumulatedStudyTime]);

  const handleSkip = useCallback(() => {
    setIsActive(false);
    if (mode === 'work' && secondsStudiedRef.current > 0) {
      logAccumulatedStudyTime();
    }
    let targetMode = 'work';
    if (mode === 'work') {
      const nextCount = completedWorkSessions + 1;
      if (timerType === 'animedoro') {
        const normalizedCount = nextCount >= 4 ? 0 : nextCount;
        setCompletedWorkSessions(normalizedCount);
        localStorage.setItem('pomodoro_completed_sessions', normalizedCount.toString());
        targetMode = 'shortBreak';
      } else if (nextCount >= 4) {
        setCompletedWorkSessions(0);
        localStorage.setItem('pomodoro_completed_sessions', '0');
        targetMode = 'longBreak';
      } else {
        setCompletedWorkSessions(nextCount);
        localStorage.setItem('pomodoro_completed_sessions', nextCount.toString());
        targetMode = 'shortBreak';
      }
    }
    const nextSeconds = calculateSecondsForMode(targetMode, timerType);
    deadlineAtRef.current = null;
    stopwatchStartedAtRef.current = null;
    lastDisplayedTimeRef.current = nextSeconds;
    setMode(targetMode);
    setTimeLeft(nextSeconds);
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
      lastDisplayedTimeRef.current = updatedTime;
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
    if (timerType === 'animedoro') return '#f59e0b';
    if (mode === 'work') return '#8b5cf6';
    if (mode === 'shortBreak') return '#10b981';
    return '#3b82f6';
  };

  const getModeLabel = () => {
    if (timerType === 'stopwatch') return 'Đang bấm giờ';
    if (timerType === 'animedoro') return mode === 'work' ? 'Animedoro tập trung' : 'Animedoro giải trí';
    if (mode === 'work') return 'Phiên tập trung';
    if (mode === 'shortBreak') return 'Nghỉ ngơi ngắn';
    return 'Nghỉ ngơi dài';
  };

  const closeMiniTimer = useCallback(() => {
    const activeMiniWindow = miniWindowRef.current;
    miniWindowRef.current = null;
    setMiniWindow(null);
    if (activeMiniWindow && !activeMiniWindow.closed) {
      activeMiniWindow.close();
    }
  }, []);

  const openMiniTimer = useCallback(async () => {
    const existingWindow = miniWindowRef.current;
    if (existingWindow && !existingWindow.closed) {
      existingWindow.focus();
      return;
    }

    try {
      let timerWindow;
      if ('documentPictureInPicture' in window) {
        timerWindow = await window.documentPictureInPicture.requestWindow({
          width: 340,
          height: 220
        });
      } else {
        timerWindow = window.open(
          '',
          'exam-countdown-mini-timer',
          'popup=yes,width=340,height=220,resizable=yes'
        );
      }

      if (!timerWindow) {
        window.alert('Edge đang chặn cửa sổ mini. Hãy cho phép pop-up cho trang này rồi thử lại.');
        return;
      }

      timerWindow.document.title = 'Đồng hồ học tập';
      timerWindow.document.documentElement.lang = 'vi';
      timerWindow.document.body.replaceChildren();
      const root = timerWindow.document.createElement('div');
      root.id = 'mini-timer-root';
      timerWindow.document.body.appendChild(root);

      const handleMiniWindowClosed = () => {
        if (miniWindowRef.current === timerWindow) {
          miniWindowRef.current = null;
          setMiniWindow(null);
        }
      };
      timerWindow.addEventListener('pagehide', handleMiniWindowClosed, { once: true });
      timerWindow.addEventListener('beforeunload', handleMiniWindowClosed, { once: true });

      miniWindowRef.current = timerWindow;
      setMiniWindow(timerWindow);
    } catch (error) {
      if (error?.name !== 'NotAllowedError') {
        console.warn('Không thể mở đồng hồ mini:', error);
      }
    }
  }, []);

  const handleStartPauseWithMini = useCallback(() => {
    if (!isActive) {
      void openMiniTimer();
    }
    handleStartPause();
  }, [isActive, openMiniTimer, handleStartPause]);

  useEffect(() => {
    return () => {
      const activeMiniWindow = miniWindowRef.current;
      if (activeMiniWindow && !activeMiniWindow.closed) {
        activeMiniWindow.close();
      }
    };
  }, []);

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

  // The timer is a full-screen dialog. Keep the page behind it still so it
  // never creates a second competing scrollbar.
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const miniTimerRoot = miniWindow && !miniWindow.closed
    ? miniWindow.document.getElementById('mini-timer-root')
    : null;
  const miniTimerPortal = miniTimerRoot
    ? createPortal(
      <FloatingTimer
        timeLeft={timeLeft}
        isActive={isActive}
        modeLabel={getModeLabel()}
        modeColor={getModeColor()}
        timerType={timerType}
        onStartPause={handleStartPauseWithMini}
        onReset={handleReset}
        onClose={closeMiniTimer}
      />,
      miniTimerRoot
    )
    : null;

  if (!isOpen) return miniTimerPortal;

  return (
    <>
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
      <div className="pomodoro-content" style={{
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
              handleStartPause={handleStartPauseWithMini}
              handleReset={handleReset}
              handleSkip={handleSkip}
              onOpenMiniTimer={openMiniTimer}
              isMiniTimerOpen={Boolean(miniTimerRoot)}
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
                  localStorage.removeItem('pomodoro_focus_task');
                }}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: '#fff', outline: 'none' }}
              >
                <option value="general">Học tập chung (Không chọn môn)</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.subject}</option>
                ))}
              </select>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', margin: '0.8rem 0 0.4rem' }}>
                ✅ Gắn phiên này với nhiệm vụ:
              </label>
              <select
                value={focusTaskId}
                onChange={(event) => {
                  setFocusTaskId(event.target.value);
                  if (event.target.value === 'general') {
                    localStorage.removeItem('pomodoro_focus_task');
                  } else {
                    localStorage.setItem('pomodoro_focus_task', event.target.value);
                  }
                }}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: '#fff', outline: 'none' }}
              >
                <option value="general">Không gắn nhiệm vụ cụ thể</option>
                {availableFocusTasks.filter((task) => !task.completed).map((task) => (
                  <option key={task.id} value={task.id}>{task.text} · 🍅 {task.estPomodoros || 1}</option>
                ))}
              </select>
            </div>

            {timerType !== 'stopwatch' && mode !== 'work' && (
              <BreakCoach mode={mode} timerType={timerType} />
            )}

            <DistractionParkingLot />

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
    {miniTimerPortal}
    </>
  );
}

export default PomodoroTimer;
