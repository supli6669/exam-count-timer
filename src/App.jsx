import { persistentStorage, useStorageFailure } from './utils/persistence';
import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense, memo } from 'react';
import ExamCard from './components/ExamCard';
import Icon from './components/Icon';
import ExamForm from './components/ExamForm';
import NotificationSettings from './components/NotificationSettings';
import BackupRestore from './components/BackupRestore';
import { CATEGORIES } from './constants';
import PomodoroTimer from './components/PomodoroTimer';
import ErrorBoundary from './components/ErrorBoundary';
import { pruneOldStudyLogs, safeJsonParse } from './utils/storage';
import { migrateStudyData } from './utils/focusPlanning';
import { downloadICalFile } from './utils/icsExport';
import FlashcardsModal from './components/FlashcardsModal';
import Notes from './components/Notes';
import TaskList from './components/TaskList';
import FocusStatsTab from './components/FocusStatsTab';
import { consolidateTasks } from './utils/tasks';
import { rolloverTasks, rolloverExams, subscribeToLocalDay } from './utils/dailyPlan';
import { getLocalDateKey } from './utils/date';
import { calculateTimeLeft, filterActiveExams } from './utils/examTime';
import { useCurrentTime } from './utils/clock';

const CalendarView = lazy(() => import('./components/CalendarView'));


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

const FocusHero = memo(function FocusHero({ exams, onStart, onCreate }) {
  const now = useCurrentTime();
  const nextExam = useMemo(() => {
    return [...exams]
      .filter(exam => exam?.datetime && new Date(exam.datetime).getTime() > now)
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))[0] || null;
  }, [exams, now]);
  const nextExamTimeLeft = nextExam ? calculateTimeLeft(nextExam.datetime, now) : null;
  const nextExamDateLabel = nextExam
    ? new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(new Date(nextExam.datetime))
    : 'Chưa có lịch thi';

  return (
    <section className="focus-hero" aria-labelledby="focus-hero-title">
      <div className="focus-hero-copy">
        <span className="focus-eyebrow">KHÔNG GIAN HỌC CỦA BẠN</span>
        <h2 id="focus-hero-title">Sẵn sàng cho buổi học.</h2>
        <p>Mở đồng hồ, chọn một việc và bắt đầu theo nhịp của bạn.</p>
        <div className="focus-hero-actions">
          <button className="btn btn-primary hero-primary-action" onClick={() => onStart()}>
            <span className="play-glyph">▶</span>
            Mở đồng hồ học
          </button>
          <button className="hero-text-action" onClick={onCreate}>+ Thêm lịch thi</button>
        </div>
      </div>

      <div className="next-focus-card" aria-label="Kỳ thi sắp tới">
        <div className="next-focus-card-topline">
          <span className="focus-eyebrow">KỲ THI GẦN NHẤT</span>
        </div>
        {nextExam ? (
          <>
            <div className="next-focus-subject">{nextExam.subject}</div>
            <div className="next-focus-date">{nextExamDateLabel} · {new Date(nextExam.datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="next-focus-countdown">
              <strong>{nextExamTimeLeft?.days ?? 0}</strong><span>ngày</span>
              <strong>{String(nextExamTimeLeft?.hours ?? 0).padStart(2, '0')}</strong><span>giờ</span>
              <strong>{String(nextExamTimeLeft?.minutes ?? 0).padStart(2, '0')}</strong><span>phút</span>
            </div>
            <div className="next-focus-footer"><span>Thời gian còn lại</span></div>
          </>
        ) : (
          <div className="next-focus-empty">Thêm kỳ thi đầu tiên để bắt đầu xây dựng nhịp học của bạn.</div>
        )}
      </div>
    </section>
  );
});

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

function App() {
  const storageFailed = useStorageFailure();
  const [exams, setExams] = useState(() => {
    // Only show examples for a brand-new installation. An empty saved array is
    // a valid user choice after deleting every exam.
    if (persistentStorage.getItem('exams_countdown_list') === null) {
      return getInitialMockData();
    }
    const parsed = safeJsonParse('exams_countdown_list', []);
    return Array.isArray(parsed) ? rolloverExams(migrateStudyData(parsed, []).exams) : getInitialMockData();
  });


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc'); // date-asc, date-desc, name-asc
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return persistentStorage.getItem('notifications_enabled') === 'true';
  });
  const [viewMode, setViewMode] = useState('exams'); // exams, tasks, notes, or analytics
  const [examsView, setExamsView] = useState('card'); // 'card' or 'calendar'
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [focusNotesOpen, setFocusNotesOpen] = useState(false);
  const appRoot = useRef(null);
  useEffect(() => {
    if (!isPomodoroOpen) return;
    const previous = document.activeElement;
    const root = appRoot.current;
    root.querySelector('.pomodoro-overlay button')?.focus();
    const trap = event => {
      if (event.key !== 'Tab') return;
      const controls = [...root.querySelectorAll('.pomodoro-overlay button, .pomodoro-overlay select, .pomodoro-overlay input, .pomodoro-overlay summary, .focus-note-dock button, .focus-note-dock input, .focus-note-dock textarea')]
        .filter(element => !element.disabled && element.getClientRects().length > 0 && (element.tagName === 'SUMMARY' || !element.closest('details:not([open])')) && !(window.matchMedia('(max-width: 760px)').matches && root.querySelector('.focus-note-dock:not([hidden])') && element.closest('.pomodoro-overlay')));
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    root.addEventListener('keydown', trap);
    return () => { root.removeEventListener('keydown', trap); previous?.focus(); };
  }, [isPomodoroOpen]);
  useEffect(() => {
    if (!isPomodoroOpen || !focusNotesOpen) return;
    const previous = document.activeElement;
    appRoot.current.querySelector('.focus-note-heading button')?.focus();
    return () => { if (previous?.isConnected) previous.focus(); };
  }, [isPomodoroOpen, focusNotesOpen]);
  const viewScroll = useRef({});
  const changeView = (next) => {
    viewScroll.current[viewMode] = window.scrollY;
    setViewMode(next);
    requestAnimationFrame(() => window.scrollTo(0, viewScroll.current[next] || 0));
  };
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [taskSubject, setTaskSubject] = useState('all');
  const [generalTasks, setGeneralTasks] = useState(() => {
    const parsed = safeJsonParse('exams_general_tasks', []);
    const current = migrateStudyData([], Array.isArray(parsed) ? parsed : []).generalTasks;
    return rolloverTasks(persistentStorage.getItem('tasks_consolidated_v1') === 'true' ? current : consolidateTasks(current, safeJsonParse('daily_tasks_list', []), safeJsonParse('recurring_tasks_rule_of_3', {})));
  });



  useEffect(() => subscribeToLocalDay(() => {
    const today = getLocalDateKey();
    setGeneralTasks(tasks => rolloverTasks(tasks, today));
    setExams(items => rolloverExams(items, today));
  }), []);

  const [autoDeletePassed, setAutoDeletePassed] = useState(() => {
    const saved = persistentStorage.getItem('auto_delete_passed_exams');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    persistentStorage.setItem('auto_delete_passed_exams', autoDeletePassed.toString());
  }, [autoDeletePassed]);

  // Remove only task-less exams when they pass. Schedule the next actual expiry
  // instead of rechecking the full list every five seconds.
  useEffect(() => {
    if (!autoDeletePassed) return;

    const checkAndPrunePassed = () => {
      setExams(prevExams => {
        const active = filterActiveExams(prevExams, true);
        if (active.length !== prevExams.length) {
          return active;
        }
        return prevExams;
      });
    };

    checkAndPrunePassed();
    const nextExpiry = exams.reduce((soonest, exam) => {
      if (Array.isArray(exam?.tasks) && exam.tasks.length > 0) return soonest;
      const timestamp = new Date(exam?.datetime).getTime();
      return Number.isFinite(timestamp) && timestamp > Date.now()
        ? Math.min(soonest, timestamp)
        : soonest;
    }, Infinity);
    const maxTimeout = 2_147_483_647;
    const timeout = Number.isFinite(nextExpiry)
      ? window.setTimeout(checkAndPrunePassed, Math.min(Math.max(0, nextExpiry - Date.now()) + 100, maxTimeout))
      : null;
    window.addEventListener('focus', checkAndPrunePassed);
    return () => {
      if (timeout !== null) window.clearTimeout(timeout);
      window.removeEventListener('focus', checkAndPrunePassed);
    };
  }, [autoDeletePassed, exams]);

  // Save to LocalStorage
  useEffect(() => {
    persistentStorage.setItem('exams_countdown_list', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    if (persistentStorage.setItem('exams_general_tasks', JSON.stringify(generalTasks))) {
      persistentStorage.setItem('tasks_consolidated_v1', 'true');
    }
  }, [generalTasks]);

  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = persistentStorage.getItem('app_global_theme');
    return ['light', 'dark', 'system'].includes(saved) ? saved : 'light';
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const theme = activeTheme === 'system' ? (media.matches ? 'dark' : 'light') : activeTheme;
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      document.body.dataset.theme = theme;
    };
    apply();
    media.addEventListener('change', apply);
    persistentStorage.setItem('app_global_theme', activeTheme);
    return () => media.removeEventListener('change', apply);
  }, [activeTheme]);

  // Prune old study history on app launch
  useEffect(() => {
    pruneOldStudyLogs(180);
  }, []);

  const [username, setUsername] = useState(() => {
    return persistentStorage.getItem('pomodoro_username') || '';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);

  const getGreetingPrefix = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return 'Chào buổi sáng, ';
    if (hr >= 12 && hr < 18) return 'Chào buổi chiều, ';
    return 'Chào buổi tối, ';
  };

  const handleSaveName = () => {
    const name = tempName.trim();
    setUsername(name);
    persistentStorage.setItem('pomodoro_username', name);
    setIsEditingName(false);
  };

  // Global Escape key listener to close active modals
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFlashcardsOpen) setIsFlashcardsOpen(false);
        else if (isModalOpen) setIsModalOpen(false);
        else if (focusNotesOpen) setFocusNotesOpen(false);
        else if (isPomodoroOpen) setIsPomodoroOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isModalOpen, isPomodoroOpen, focusNotesOpen, isFlashcardsOpen]);

  // Save notification setting

  useEffect(() => {
    persistentStorage.setItem('notifications_enabled', notificationsEnabled.toString());
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
          const wasNotified = persistentStorage.getItem(notifiedKey);

          if (!wasNotified) {
            new Notification('Nhắc nhở kỳ thi', {
              body: `Môn "${exam.subject}" sẽ diễn ra vào ${hours < 1 ? 'sắp tới' : Math.floor(hours) + ' giờ nữa'}`,
              icon: '⏰',
              tag: exam.id
            });
            persistentStorage.setItem(notifiedKey, 'true');
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

  const handleOpenPomodoro = useCallback((focusTarget = null) => {
    if (focusTarget?.examId) {
      persistentStorage.setItem('pomodoro_focus_subject', focusTarget.examId);
      persistentStorage.setItem('pomodoro_focus_task', focusTarget.taskId || 'general');
      window.dispatchEvent(new CustomEvent('pomodoro-focus-target', { detail: focusTarget }));
    }
    setIsPomodoroOpen(true);
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
    setExams(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleClearPassedExams = useCallback(() => {
    const now = Date.now();
    const passedCount = exams.filter(e => new Date(e.datetime).getTime() <= now).length;
    if (passedCount === 0) {
      alert('Không có môn thi nào đã hết giờ!');
      return;
    }
    setExams(prev => filterActiveExams(prev, true));
  }, [exams]);

  // Handle adding a sub-task for an exam or general tasks
  const handleAddTask = useCallback((examId, text, deadline, estPomodoros = 1, urgent = false, important = true, plannedDate = '') => {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      completed: false,
      deadline: deadline || '',
      plannedDate,
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

  const handleToggleTask = useCallback((examId, taskId) => {
    const toggle = task => task.id === taskId ? { ...task, completed: !task.completed, completedAt: task.completed ? null : Date.now() } : task;
    if (examId === 'general') setGeneralTasks(tasks => tasks.map(toggle));
    else setExams(items => items.map(exam => exam.id === examId ? { ...exam, tasks: (exam.tasks || []).map(toggle) } : exam));
  }, []);

  const handlePlanTask = useCallback((examId, taskId, plannedDate) => {
    const update = task => task.id === taskId ? { ...task, plannedDate, carriedFromDate: undefined } : task;
    if (examId === 'general') setGeneralTasks(tasks => tasks.map(update));
    else setExams(items => items.map(exam => exam.id === examId ? { ...exam, tasks: (exam.tasks || []).map(update) } : exam));
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
    <div ref={appRoot} role={isPomodoroOpen ? 'dialog' : undefined} aria-modal={isPomodoroOpen ? true : undefined} aria-label={isPomodoroOpen ? 'Không gian học tập' : undefined} className={`app-container ${isPomodoroOpen && focusNotesOpen ? 'with-focus-notes' : ''}`}>
      {storageFailed && <div role="alert" className="storage-warning">Không lưu được dữ liệu trên thiết bị. Mở Công cụ → Sao lưu dữ liệu trước khi đóng hoặc tải lại trang.</div>}
      <div className="app-pages" inert={isPomodoroOpen}>
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
              <h1 className="brand-title" style={{ margin: 0 }}>flocus<span className="brand-title-version">góc học</span></h1>
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
                <button type="button"
                  className="editable-username"
                  onClick={() => { setTempName(username); setIsEditingName(true); }}
                  title="Nhấp để đổi tên"
                >
                  {username || 'Người học'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="header-quick-actions">
            <button className="btn btn-secondary" onClick={() => handleOpenPomodoro()}>Đồng hồ học</button>
            <details className="utility-menu">
              <summary aria-label="Mở công cụ phụ"><Icon name="menu" /> <span>Công cụ</span></summary>
              <div className="utility-menu-panel">
                <label className="utility-theme-field">
                  <span>Giao diện</span>
                  <select
                    value={activeTheme}
                    onChange={(e) => setActiveTheme(e.target.value)}
                    className="theme-selector-dropdown"
                    title="Chọn giao diện sáng hoặc tối"
                    aria-label="Chọn chủ đề giao diện"
                  >
                    <option value="system">Theo thiết bị</option>
                    <option value="light">Sáng · Giấy ấm</option>
                    <option value="dark">Tối · Trầm ấm</option>
                  </select>
                </label>
                <button
                  className="utility-action utility-export"
                  onClick={() => downloadICalFile(exams, 'lich-thi-exam-countdown.ics')}
                  title="Xuất toàn bộ lịch thi ra tập tin iCalendar (.ics)"
                >
                  <span>↗</span> Xuất lịch
                </button>
                <BackupRestore />
                <NotificationSettings
                  enabled={notificationsEnabled}
                  onToggle={setNotificationsEnabled}
                />
                <button
                  className={`btn-icon utility-icon ${isFlashcardsOpen ? 'active' : ''}`}
                  onClick={() => setIsFlashcardsOpen(!isFlashcardsOpen)}
                  title="Thẻ ghi nhớ Leitner (Flashcards)"
                  aria-label="Thẻ ghi nhớ Leitner"
                >
                  🗂️
                </button>
                <button
                  className={`btn-icon utility-icon ${isPomodoroOpen ? 'active' : ''}`}
                  onClick={() => setIsPomodoroOpen(!isPomodoroOpen)}
                  title="Đồng hồ Pomodoro"
                  aria-label="Đồng hồ Pomodoro"
                >
                  🍅
                </button>
              </div>
            </details>
          </div>

          <div className="view-mode-tabs">
            <button
              className={`view-tab-btn ${viewMode === 'exams' ? 'active' : ''}`}
              aria-current={viewMode === 'exams' ? 'page' : undefined}
              onClick={() => changeView('exams')}
              title="Quản lý lịch thi"
            >
              <Icon name="calendar" />
              Lịch thi
            </button>
            <button
              className={`view-tab-btn ${viewMode === 'tasks' ? 'active' : ''}`}
              aria-current={viewMode === 'tasks' ? 'page' : undefined}
              onClick={() => changeView('tasks')}
              title="Danh sách việc cần làm"
            >
              <Icon name="tasks" />
              Việc cần làm
            </button>
            <button
              className={`view-tab-btn ${viewMode === 'analytics' ? 'active' : ''}`}
              aria-current={viewMode === 'analytics' ? 'page' : undefined}
              onClick={() => changeView('analytics')}
              title="Thống kê học tập"
            >
              <Icon name="chart" />
              Thống kê
            </button>
            <button
              className={`view-tab-btn ${viewMode === 'notes' ? 'active' : ''}`}
              aria-current={viewMode === 'notes' ? 'page' : undefined}
              onClick={() => changeView('notes')}
              title="Sổ tay học tập"
            >
              <Icon name="note" />
              Sổ tay
            </button>
          </div>
          {viewMode === 'exams' && (
            <button className="btn btn-primary header-add-exam" onClick={handleCreateOpen}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Thêm môn thi
            </button>
          )}
        </div>
      </header>

      {viewMode === 'exams' && (
        <FocusHero exams={exams} onStart={handleOpenPomodoro} onCreate={handleCreateOpen} />
      )}

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
                <span className="stat-label">Thi trong 2 ngày</span>
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
                <span className="stat-label">Còn hơn 7 ngày</span>
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
                  color: 'var(--text-primary)',
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
                    color: 'var(--text-primary)',
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
                    color: 'var(--text-primary)',
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

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  userSelect: 'none'
                }}
                title="Tự động xóa môn hết giờ nếu không có task; môn có task được giữ lại"
              >
                <input
                  type="checkbox"
                  checked={autoDeletePassed}
                  onChange={(e) => setAutoDeletePassed(e.target.checked)}
                  style={{ accentColor: '#8b5cf6', cursor: 'pointer', width: '15px', height: '15px' }}
                />
                <span>⚡ Dọn môn hết giờ không có task</span>
              </label>

              {stats.passed > 0 && !autoDeletePassed && (
                <button
                  type="button"
                  onClick={handleClearPassedExams}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    borderRadius: '8px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Xóa các môn hết giờ không có task"
                >
                  🗑️ Dọn dẹp ({stats.passed})
                </button>
              )}

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
                      color: 'var(--text-primary)',
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
                      color: 'var(--text-primary)',
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
                    onOpenTasks={() => { setTaskSubject(exam.id); setViewMode('tasks'); }}
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

      <div hidden={viewMode !== 'tasks'}><TaskList exams={exams} generalTasks={generalTasks} subject={taskSubject} onSubjectChange={setTaskSubject} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onPlanTask={handlePlanTask} onStart={handleOpenPomodoro} /></div>
      {viewMode === 'analytics' && <FocusStatsTab exams={exams} generalTasks={generalTasks} />}
      </div>
      <div className={isPomodoroOpen ? 'focus-note-dock' : 'notes-page'} hidden={isPomodoroOpen ? !focusNotesOpen : viewMode !== 'notes'}>
        {isPomodoroOpen && <div className="focus-note-heading"><span>Sổ tay phiên học</span><button className="btn btn-secondary" onClick={() => setFocusNotesOpen(false)}>Đóng sổ tay</button></div>}
        <Notes />
      </div>

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
        onClose={() => { setIsPomodoroOpen(false); setFocusNotesOpen(false); }}
        onOpenNotes={() => setFocusNotesOpen(value => !value)}
        notesOpen={focusNotesOpen}
        exams={exams}
        generalTasks={generalTasks}
        notificationsEnabled={notificationsEnabled}
        onToggleTask={handleToggleTask}
      />

      {/* Leitner Spaced Repetition Flashcards Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
      />
    </div>
  );
}

export default App;
