import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import ExamCard from './components/ExamCard';
import ExamForm from './components/ExamForm';
import NotificationSettings from './components/NotificationSettings';
import BackupRestore from './components/BackupRestore';
import { CATEGORIES } from './constants';
import PomodoroTimer from './components/PomodoroTimer';
import RecurringTasks from './components/RecurringTasks';
import DailyTasks from './components/DailyTasks';
import ContributionGraph from './components/ContributionGraph';
import { incrementContribution, decrementContribution } from './utils/contributions';
import OnboardingTour from './components/OnboardingTour';
import ErrorBoundary from './components/ErrorBoundary';
import { pruneOldStudyLogs, safeJsonParse } from './utils/storage';
import StudyStreak from './components/StudyStreak';
import { downloadICalFile } from './utils/icsExport';
import FlashcardsModal from './components/FlashcardsModal';
import TodayStudyPlan from './components/TodayStudyPlan';
import MockExamModal from './components/MockExamModal';

const CalendarView = lazy(() => import('./components/CalendarView'));

const SmartInsights = lazy(() => import('./components/SmartInsights'));
const PriorityMatrix = lazy(() => import('./components/PriorityMatrix'));

const ComponentLoader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    gap: '1rem',
    color: 'var(--text-secondary)'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid rgba(255, 255, 255, 0.1)',
      borderTop: '3px solid #8b5cf6',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Đang tải giao diện...</span>
  </div>
);

// Initial mock data set relative to current date (June 2026)
const getInitialMockData = () => {
  const now = Date.now();
  return [
    {
      id: 'mock-1',
      subject: 'Cơ sở dữ liệu',
      datetime: new Date(now + 1.25 * 24 * 60 * 60 * 1000).toISOString(), // ~30 hours from now (Urgent)
      category: 'midterm'
    },
    {
      id: 'mock-2',
      subject: 'Cấu trúc dữ liệu & Giải thuật',
      datetime: new Date(now + 4.5 * 24 * 60 * 60 * 1000).toISOString(), // ~4.5 days from now (Warning)
      category: 'final'
    },
    {
      id: 'mock-3',
      subject: 'Mạng máy tính',
      datetime: new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now (Safe)
      category: 'quiz'
    },
    {
      id: 'mock-4',
      subject: 'Nhập môn Trí tuệ nhân tạo',
      datetime: new Date(now + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now (Safe)
      category: 'assignment'
    }
  ];
};

const MAX_USER_XP = 100_000_000;

const getStoredInteger = (key, fallback, min, max) => {
  const value = Number(localStorage.getItem(key));
  return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
};

const getLevelForXP = (xp) => {
  let level = 1;
  let xpNeeded = level * 500;
  let remainingXP = xp;
  while (remainingXP >= xpNeeded) {
    remainingXP -= xpNeeded;
    level++;
    xpNeeded = level * 500;
  }
  return level;
};

function App() {
  const [exams, setExams] = useState(() => {
    // Only show examples for a brand-new installation. An empty saved array is
    // a valid user choice after deleting every exam.
    if (localStorage.getItem('exams_countdown_list') === null) {
      return getInitialMockData();
    }
    const parsed = safeJsonParse('exams_countdown_list', []);
    return Array.isArray(parsed) ? parsed : getInitialMockData();
  });


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc'); // date-asc, date-desc, name-asc
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications_enabled') === 'true';
  });
  const [viewMode, setViewMode] = useState('exams'); // 'exams', 'tasks', or 'analytics'
  const [examsView, setExamsView] = useState('card'); // 'card' or 'calendar'
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isMockExamOpen, setIsMockExamOpen] = useState(false);
  const [generalTasks, setGeneralTasks] = useState(() => {
    return safeJsonParse('exams_general_tasks', []);
  });



  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('exams_countdown_list', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('exams_general_tasks', JSON.stringify(generalTasks));
  }, [generalTasks]);

  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('app_global_theme') || 'cyberpunk';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', activeTheme);
    localStorage.setItem('app_global_theme', activeTheme);
  }, [activeTheme]);

  // Prune old study history on app launch
  useEffect(() => {
    pruneOldStudyLogs(180);
  }, []);

  const [username, setUsername] = useState(() => {
    return localStorage.getItem('pomodoro_username') || '';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);

  const [userXP, setUserXP] = useState(() => {
    return getStoredInteger('pomodoro_user_xp', 0, 0, MAX_USER_XP);
  });

  const [userLevel, setUserLevel] = useState(() => {
    const savedXP = getStoredInteger('pomodoro_user_xp', 0, 0, MAX_USER_XP);
    return getLevelForXP(savedXP);
  });

  const getGreetingPrefix = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return 'Chào buổi sáng, ';
    if (hr >= 12 && hr < 18) return 'Chào buổi chiều, ';
    return 'Chào buổi tối, ';
  };

  const getXPProgress = () => {
    let level = 1;
    let xpNeeded = level * 500;
    let accumulated = userXP;
    while (accumulated >= xpNeeded) {
      accumulated -= xpNeeded;
      level++;
      xpNeeded = level * 500;
    }
    return {
      current: accumulated,
      needed: xpNeeded,
      percent: Math.min(100, Math.round((accumulated / xpNeeded) * 100))
    };
  };

  const handleSaveName = () => {
    const name = tempName.trim();
    setUsername(name);
    localStorage.setItem('pomodoro_username', name);
    setIsEditingName(false);
  };

  // Global Escape key listener to close active modals
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        else if (isPomodoroOpen) setIsPomodoroOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isModalOpen, isPomodoroOpen]);

  const gainXP = useCallback((amount) => {
    const validAmount = Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;
    if (validAmount === 0) return;

    setUserXP(prevXP => {
      const nextXP = Math.min(MAX_USER_XP, prevXP + validAmount);
      localStorage.setItem('pomodoro_user_xp', nextXP.toString());
      
      const level = getLevelForXP(nextXP);
      
      setUserLevel(prevLevel => {
        if (level > prevLevel) {
          localStorage.setItem('pomodoro_user_level', level.toString());
          playLevelUpSound();
          alert(`Chúc mừng! Bạn đã thăng cấp lên Cấp ${level}! 🏆`);
        }
        return level;
      });
      
      return nextXP;
    });
  }, []);

  const playLevelUpSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(261.63, now);
      osc.frequency.setValueAtTime(329.63, now + 0.1);
      osc.frequency.setValueAtTime(392.00, now + 0.2);
      osc.frequency.setValueAtTime(523.25, now + 0.3);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
      
      setTimeout(() => ctx.close().catch(() => {}), 1000);
    } catch (e) {
      console.warn(e);
    }
  };

  const playSuccessChime = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
      
      setTimeout(() => ctx.close().catch(() => {}), 500);
    } catch (e) {
      console.warn(e);
    }
  };

  // Sync XP and listen to global gain-xp events
  useEffect(() => {
    const handleGainXP = (e) => {
      const amount = Number(e.detail);
      if (Number.isFinite(amount) && amount > 0) {
        gainXP(amount);
        playSuccessChime();
      }
    };
    window.addEventListener('gain-xp', handleGainXP);
    return () => {
      window.removeEventListener('gain-xp', handleGainXP);
    };
  }, [gainXP]);

  // Save notification setting

  useEffect(() => {
    localStorage.setItem('notifications_enabled', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  // Check and send notifications
  useEffect(() => {
    if (!notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const checkNotifications = () => {
      const now = new Date();
      exams.forEach(exam => {
        const examDate = new Date(exam.datetime);
        const diff = examDate - now;
        const hours = diff / (1000 * 60 * 60);

        // Notify if exam is within 24 hours and hasn't been notified yet
        if (hours > 0 && hours <= 24) {
          const notifiedKey = `notified_${exam.id}`;
          const wasNotified = localStorage.getItem(notifiedKey);
          
          if (!wasNotified) {
            new Notification('Nhắc nhở kỳ thi', {
              body: `Môn "${exam.subject}" sẽ diễn ra vào ${hours < 1 ? 'sắp tới' : Math.floor(hours) + ' giờ nữa'}`,
              icon: '⏰',
              tag: exam.id
            });
            localStorage.setItem(notifiedKey, 'true');
          }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkNotifications, 60000);
    checkNotifications(); // Initial check

    return () => clearInterval(interval);
  }, [exams, notificationsEnabled]);

  const handleCreateOpen = useCallback((defaultDate = null) => {
    if (defaultDate && typeof defaultDate === 'string') {
      setEditingExam({
        id: '',
        subject: '',
        datetime: defaultDate,
        category: 'other'
      });
    } else {
      setEditingExam(null);
    }
    setIsModalOpen(true);
  }, []);

  // Handle open modal for editing
  const handleEditOpen = useCallback((exam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  }, []);

  // Handle saving new/edited exam (Fixed bug where editingExam with empty id was treated as editing)
  const handleSaveExam = useCallback((savedExam) => {
    if (editingExam && editingExam.id) {
      setExams(prev => prev.map(e => e.id === savedExam.id ? savedExam : e));
    } else {
      setExams(prev => [...prev, savedExam]);
    }
    setIsModalOpen(false);
    setEditingExam(null);
  }, [editingExam]);

  // Handle delete
  const handleDeleteExam = useCallback((id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch thi này không?')) {
      setExams(prev => prev.filter(e => e.id !== id));
    }
  }, []);

  // Handle adding a sub-task for an exam or general tasks
  const handleAddTask = useCallback((examId, text, deadline, estPomodoros = 1, urgent = false, important = true) => {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      completed: false,
      deadline: deadline || '',
      estPomodoros: parseInt(estPomodoros, 10) || 1,
      urgent,
      important,
      completedAt: null
    };

    if (examId === 'general') {
      setGeneralTasks(prev => [...prev, newTask]);
    } else {
      setExams(prev => prev.map(exam => {
        if (exam.id === examId) {
          return {
            ...exam,
            tasks: [...(exam.tasks || []), newTask]
          };
        }
        return exam;
      }));
    }
  }, []);

  // Handle toggling sub-task completed status
  const handleToggleTask = useCallback((examId, taskId) => {
    if (examId === 'general') {
      setGeneralTasks(prev => {
        const task = prev.find(t => t.id === taskId);
        if (task) {
          if (!task.completed) {
            incrementContribution();
            window.dispatchEvent(new CustomEvent('gain-xp', { detail: 50 }));
          } else {
            decrementContribution();
          }
        }
        return prev.map(t => {
          if (t.id === taskId) {
            return { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null };
          }
          return t;
        });
      });
    } else {
      setExams(prev => {
        const exam = prev.find(e => e.id === examId);
        if (exam) {
          const task = (exam.tasks || []).find(t => t.id === taskId);
          if (task) {
            if (!task.completed) {
              incrementContribution();
              window.dispatchEvent(new CustomEvent('gain-xp', { detail: 50 }));
            } else {
              decrementContribution();
            }
          }
        }
        return prev.map(exam => {
          if (exam.id === examId) {
            return {
              ...exam,
              tasks: (exam.tasks || []).map(task => {
                if (task.id === taskId) {
                  return { ...task, completed: !task.completed, completedAt: !task.completed ? Date.now() : null };
                }
                return task;
              })
            };
          }
          return exam;
        });
      });
    }
  }, []);

  // Handle deleting a sub-task
  const handleDeleteTask = useCallback((examId, taskId) => {
    if (examId === 'general') {
      setGeneralTasks(prev => prev.filter(task => task.id !== taskId));
    } else {
      setExams(prev => prev.map(exam => {
        if (exam.id === examId) {
          return {
            ...exam,
            tasks: (exam.tasks || []).filter(task => task.id !== taskId)
          };
        }
        return exam;
      }));
    }
  }, []);

  // Handle updating a sub-task's priority
  const handleUpdateTaskPriority = useCallback((examId, taskId, urgent, important) => {
    if (examId === 'general') {
      setGeneralTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return { ...task, urgent, important };
        }
        return task;
      }));
    } else {
      setExams(prev => prev.map(exam => {
        if (exam.id === examId) {
          return {
            ...exam,
            tasks: (exam.tasks || []).map(task => {
              if (task.id === taskId) {
                return { ...task, urgent, important };
              }
              return task;
            })
          };
        }
        return exam;
      }));
    }
  }, []);

  // Dynamic status counts (Memoized)
  const stats = useMemo(() => {
    let urgent = 0;
    let warning = 0;
    let safe = 0;
    let passed = 0;

    const now = new Date();

    exams.forEach(exam => {
      const diff = new Date(exam.datetime) - now;
      if (diff <= 0) {
        passed++;
      } else {
        const days = diff / (1000 * 60 * 60 * 24);
        if (days < 2) {
          urgent++;
        } else if (days < 7) {
          warning++;
        } else {
          safe++;
        }
      }
    });

    return { total: exams.length, urgent, warning, safe, passed };
  }, [exams]);

  // Filter & Sort logic (Memoized)
  const sortedExams = useMemo(() => {
    const filtered = exams.filter(exam => {
      const matchesSearch = exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || (exam.category || 'other') === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.datetime) - new Date(b.datetime);
      } else if (sortBy === 'date-desc') {
        return new Date(b.datetime) - new Date(a.datetime);
      } else if (sortBy === 'name-asc') {
        return a.subject.localeCompare(b.subject, 'vi');
      }
      return 0;
    });
  }, [exams, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="app-container">
      <OnboardingTour />
      {/* App Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo-container">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.15.8-.13-4.5-2.7V7z" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 className="brand-title" style={{ margin: 0 }}>Đồng Hồ Lịch Thi</h1>
              <span className="level-badge">Cấp {userLevel}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
              <span>{getGreetingPrefix()}</span>
              {isEditingName ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                  autoFocus
                  className="username-input-inline"
                  maxLength={15}
                  aria-label="Tên hiển thị"
                />
              ) : (
                <span 
                  className="editable-username" 
                  onClick={() => { setTempName(username); setIsEditingName(true); }}
                  title="Nhấp để đổi tên"
                >
                  {username || 'Người học'}
                </span>
              )}
              <span>! Chúc ôn tập tốt. 📝</span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="header-xp-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.70rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span>Tiến độ kinh nghiệm</span>
            <span>{getXPProgress().current} / {getXPProgress().needed} XP</span>
          </div>
          <div style={{ height: '5px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${getXPProgress().percent}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
              borderRadius: '3px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
        <div className="header-actions">
          <StudyStreak userXP={userXP} />
          {/* Global Theme Selector */}
          <select
            value={activeTheme}
            onChange={(e) => setActiveTheme(e.target.value)}
            className="theme-selector-dropdown"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            title="Đổi chủ đề giao diện nghệ thuật"
            aria-label="Chọn chủ đề giao diện"
          >
            <option value="cyberpunk">🏙️ Cyberpunk</option>
            <option value="sakura">🌸 Sakura Library</option>
            <option value="lofi">☕ Lofi Cafe</option>
            <option value="space">🌌 Space Odyssey</option>
            <option value="nature">🌲 Nature Cabin</option>
          </select>
          <button
            onClick={() => downloadICalFile(exams, 'lich-thi-exam-countdown.ics')}
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backdropFilter: 'blur(8px)'
            }}
            title="Xuất toàn bộ lịch thi ra tập tin iCalendar (.ics) cho Google/Apple Calendar"
          >
            📅 Xuất Lịch (.ics)
          </button>
          <BackupRestore />
          <NotificationSettings 
            enabled={notificationsEnabled} 
            onToggle={setNotificationsEnabled} 
          />
          <button
            className={`btn-icon ${isFlashcardsOpen ? 'active' : ''}`}
            onClick={() => setIsFlashcardsOpen(!isFlashcardsOpen)}
            title="Thẻ ghi nhớ Leitner (Flashcards)"
            aria-label="Thẻ ghi nhớ Leitner"
            style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}
          >
            <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>🗂️</span>
          </button>
          <button
            className={`btn-icon ${isPomodoroOpen ? 'active' : ''}`}
            onClick={() => setIsPomodoroOpen(!isPomodoroOpen)}
            title="Đồng hồ Pomodoro"
            aria-label="Đồng hồ Pomodoro"
          >
            <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>🍅</span>
          </button>
          <button className="btn-icon" onClick={() => setIsMockExamOpen(true)} title="Mock Exam" aria-label="Mở Mock Exam" style={{ background: 'rgba(59,130,246,.14)', color: '#93c5fd', border: '1px solid rgba(59,130,246,.3)' }}>📝</button>

          <div className="view-mode-tabs">
            <button
              className={`view-tab-btn ${viewMode === 'exams' ? 'active' : ''}`}
              onClick={() => setViewMode('exams')}
              title="Quản lý lịch thi"
            >
              <span style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', marginRight: '0.35rem' }}>📅</span>
              Lịch thi
            </button>
            <button
              className={`view-tab-btn ${viewMode === 'tasks' ? 'active' : ''}`}
              onClick={() => setViewMode('tasks')}
              title="Kế hoạch & Thói quen học tập"
            >
              <span style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', marginRight: '0.35rem' }}>🎯</span>
              Kế hoạch & Thói quen
            </button>
            <button
              className={`view-tab-btn ${viewMode === 'analytics' ? 'active' : ''}`}
              onClick={() => setViewMode('analytics')}
              title="Phân tích & Tiến độ học tập"
            >
              <span style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', marginRight: '0.35rem' }}>📊</span>
              Phân tích & Tiến độ
            </button>
          </div>
          {viewMode === 'exams' && (
            <button className="btn btn-primary" onClick={handleCreateOpen}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Thêm môn thi
            </button>
          )}
        </div>
      </header>

      {/* TAB 1: LỊCH THI */}
      {viewMode === 'exams' && (
        <>
          {/* Statistics Bar */}
          <section className="stats-bar" aria-label="Thống kê lịch thi">
            <div className="stat-card">
              <div className="stat-icon primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Tổng số môn</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon urgent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.urgent}</span>
                <span className="stat-label">Khẩn cấp (&lt; 2 ngày)</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.warning}</span>
                <span className="stat-label">Sắp diễn ra (&lt; 7 ngày)</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon safe">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.safe}</span>
                <span className="stat-label">Thời gian an toàn</span>
              </div>
            </div>
          </section>

          {/* Search, Sort & View Mode Toggle Panel */}
          <section 
            className="filter-panel" 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm môn thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.95rem',
                  width: '100%',
                  outline: 'none'
                }}
                aria-label="Tìm kiếm môn thi"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Phân loại:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  aria-label="Phân loại môn thi"
                >
                  <option value="all">Tất cả</option>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  aria-label="Tiêu chí sắp xếp"
                >
                  <option value="date-asc">Thời gian thi (gần nhất)</option>
                  <option value="date-desc">Thời gian thi (xa nhất)</option>
                  <option value="name-asc">Tên môn thi (A-Z)</option>
                </select>
              </div>

              {/* Sub-view Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.75rem', marginLeft: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Xem:</span>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-glass)' }}>
                  <button
                    type="button"
                    onClick={() => setExamsView('card')}
                    style={{
                      background: examsView === 'card' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                      border: 'none',
                      color: '#fff',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    📇 Thẻ
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamsView('calendar')}
                    style={{
                      background: examsView === 'calendar' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                      border: 'none',
                      color: '#fff',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    📅 Lịch
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Main Exams Display */}
          {examsView === 'card' ? (
            <main className="exams-grid">
              {sortedExams.length > 0 ? (
                sortedExams.map(exam => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onEdit={handleEditOpen}
                    onDelete={handleDeleteExam}
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <h2 className="empty-text">Không tìm thấy lịch thi nào</h2>
                  <p className="empty-subtext">
                    {searchQuery 
                      ? 'Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.' 
                      : 'Bắt đầu bằng cách thêm một môn thi mới vào danh sách theo dõi của bạn!'}
                  </p>
                  {!searchQuery && (
                    <button className="btn btn-primary" onClick={handleCreateOpen}>
                      Thêm môn thi đầu tiên
                    </button>
                  )}
                </div>
              )}
            </main>
          ) : (
            <ErrorBoundary>
              <Suspense fallback={<ComponentLoader />}>
                <CalendarView 
                  exams={sortedExams} 
                  onEdit={handleEditOpen}
                  onDelete={handleDeleteExam}
                  onCreate={handleCreateOpen}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </>
      )}

      {/* TAB 2: KẾ HOẠCH & THÓI QUEN */}
      {viewMode === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TodayStudyPlan exams={exams} generalTasks={generalTasks} onOpenFlashcards={() => setIsFlashcardsOpen(true)} onOpenPomodoro={() => setIsPomodoroOpen(true)} />
          <ErrorBoundary>
            <Suspense fallback={<ComponentLoader />}>
              <PriorityMatrix
                exams={exams}
                generalTasks={generalTasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onUpdateTaskPriority={handleUpdateTaskPriority}
              />
            </Suspense>
          </ErrorBoundary>
          <div className="goals-and-daily-container">
            <RecurringTasks />
            <DailyTasks />
          </div>
        </div>
      )}

      {/* TAB 3: PHÂN TÍCH & TIẾN ĐỘ */}
      {viewMode === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ErrorBoundary>
            <Suspense fallback={<ComponentLoader />}>
              <SmartInsights exams={exams} />
            </Suspense>
          </ErrorBoundary>
          <ContributionGraph />
        </div>
      )}

      {/* Add / Edit Modal Form */}
      {isModalOpen && (
        <ExamForm
          exam={editingExam}
          onSave={handleSaveExam}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Pomodoro Timer Sidebar */}
      <PomodoroTimer 
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        exams={exams}
        generalTasks={generalTasks}
        onToggleTask={handleToggleTask}
      />

      {/* Leitner Spaced Repetition Flashcards Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
      />
      <MockExamModal isOpen={isMockExamOpen} onClose={() => setIsMockExamOpen(false)} exams={exams} />
    </div>
  );
}

export default App;
