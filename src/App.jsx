import { useState, useEffect, useCallback } from 'react';
import ExamCard from './components/ExamCard';
import ExamForm from './components/ExamForm';
import NotificationSettings from './components/NotificationSettings';
import BackupRestore from './components/BackupRestore';
import CalendarView from './components/CalendarView';
import { CATEGORIES } from './constants';
import PomodoroTimer from './components/PomodoroTimer';
import RecurringTasks from './components/RecurringTasks';
import SmartInsights from './components/SmartInsights';
import ContributionGraph from './components/ContributionGraph';
import { incrementContribution, decrementContribution } from './utils/contributions';
import OnboardingTour from './components/OnboardingTour';
import PriorityMatrix from './components/PriorityMatrix';

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
  const [exams, setExams] = useState(() => {
    const saved = localStorage.getItem('exams_countdown_list');
    return saved ? JSON.parse(saved) : getInitialMockData();
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc'); // date-asc, date-desc, name-asc
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications_enabled') === 'true';
  });
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'calendar'
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [generalTasks, setGeneralTasks] = useState(() => {
    const saved = localStorage.getItem('exams_general_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('exams_countdown_list', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('exams_general_tasks', JSON.stringify(generalTasks));
  }, [generalTasks]);

  const [username, setUsername] = useState(() => {
    return localStorage.getItem('pomodoro_username') || '';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);

  const [userXP, setUserXP] = useState(() => {
    const saved = localStorage.getItem('pomodoro_user_xp');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [userLevel, setUserLevel] = useState(() => {
    const saved = localStorage.getItem('pomodoro_user_level');
    return saved ? parseInt(saved, 10) : 1;
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

  const gainXP = useCallback((amount) => {
    setUserXP(prevXP => {
      const nextXP = prevXP + amount;
      localStorage.setItem('pomodoro_user_xp', nextXP.toString());
      
      let level = 1;
      let xpNeeded = level * 500;
      let tempXP = nextXP;
      while (tempXP >= xpNeeded) {
        tempXP -= xpNeeded;
        level++;
        xpNeeded = level * 500;
      }
      
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
      const amount = e.detail || 0;
      if (amount > 0) {
        gainXP(amount);
        playSuccessChime();
      }
    };
    window.addEventListener('gain-xp', handleGainXP);
    return () => {
      window.removeEventListener('gain-xp', handleGainXP);
    };
  }, [gainXP]);

  // Auto-remove exams that have already passed
  useEffect(() => {
    const cleanupPassed = () => {
      const now = new Date();
      setExams(prev => {
        const remaining = prev.filter(exam => new Date(exam.datetime) > now);
        // Only update if something was actually removed
        if (remaining.length < prev.length) {
          return remaining;
        }
        return prev;
      });
    };

    // Check immediately on mount
    cleanupPassed();

    // Then check every 30 seconds
    const interval = setInterval(cleanupPassed, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleCreateOpen = (defaultDate = null) => {
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
  };

  // Handle open modal for editing
  const handleEditOpen = (exam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  // Handle saving new/edited exam
  const handleSaveExam = (savedExam) => {
    if (editingExam) {
      setExams(exams.map(e => e.id === savedExam.id ? savedExam : e));
    } else {
      setExams([...exams, savedExam]);
    }
    setIsModalOpen(false);
    setEditingExam(null);
  };

  // Handle delete
  const handleDeleteExam = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch thi này không?')) {
      setExams(exams.filter(e => e.id !== id));
    }
  };

  // Handle adding a sub-task for an exam or general tasks
  const handleAddTask = (examId, text, deadline, estPomodoros = 1, urgent = false, important = true) => {
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
      setExams(exams.map(exam => {
        if (exam.id === examId) {
          return {
            ...exam,
            tasks: [...(exam.tasks || []), newTask]
          };
        }
        return exam;
      }));
    }
  };

  // Handle toggling sub-task completed status
  const handleToggleTask = (examId, taskId) => {
    if (examId === 'general') {
      const task = generalTasks.find(t => t.id === taskId);
      if (task) {
        if (!task.completed) {
          incrementContribution();
          window.dispatchEvent(new CustomEvent('gain-xp', { detail: 50 }));
        } else {
          decrementContribution();
        }
      }
      setGeneralTasks(generalTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed, completedAt: !task.completed ? Date.now() : null };
        }
        return task;
      }));
    } else {
      const exam = exams.find(e => e.id === examId);
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

      setExams(exams.map(exam => {
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
      }));
    }
  };

  // Handle deleting a sub-task
  const handleDeleteTask = (examId, taskId) => {
    if (examId === 'general') {
      setGeneralTasks(generalTasks.filter(task => task.id !== taskId));
    } else {
      setExams(exams.map(exam => {
        if (exam.id === examId) {
          return {
            ...exam,
            tasks: (exam.tasks || []).filter(task => task.id !== taskId)
          };
        }
        return exam;
      }));
    }
  };

  // Handle updating a sub-task's priority
  const handleUpdateTaskPriority = (examId, taskId, urgent, important) => {
    if (examId === 'general') {
      setGeneralTasks(generalTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, urgent, important };
        }
        return task;
      }));
    } else {
      setExams(exams.map(exam => {
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
  };

  // Dynamic status counts
  const getStats = () => {
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
  };

  const stats = getStats();

  // Filter & Sort logic
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (exam.category || 'other') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedExams = [...filteredExams].sort((a, b) => {
    if (sortBy === 'date-asc') {
      return new Date(a.datetime) - new Date(b.datetime);
    } else if (sortBy === 'date-desc') {
      return new Date(b.datetime) - new Date(a.datetime);
    } else if (sortBy === 'name-asc') {
      return a.subject.localeCompare(b.subject, 'vi');
    }
    return 0;
  });

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
          <BackupRestore />
          <NotificationSettings 
            enabled={notificationsEnabled} 
            onToggle={setNotificationsEnabled} 
          />
          <button
            className={`btn-icon ${isPomodoroOpen ? 'active' : ''}`}
            onClick={() => setIsPomodoroOpen(!isPomodoroOpen)}
            title="Đồng hồ Pomodoro"
            aria-label="Đồng hồ Pomodoro"
          >
            <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>🍅</span>
          </button>
          <div className="view-mode-tabs">
            <button
              className={`view-tab-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Xem dạng thẻ môn thi"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Danh sách
            </button>
            <button
              className={`view-tab-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
              title="Xem lịch thi"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Lịch thi
            </button>
            <button
              className={`view-tab-btn ${viewMode === 'matrix' ? 'active' : ''}`}
              onClick={() => setViewMode('matrix')}
              title="Xem ma trận ưu tiên công việc"
            >
              <span style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center' }}>🎯</span>
              Ma trận ưu tiên
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleCreateOpen}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm môn thi
          </button>
        </div>
      </header>

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

      {/* Mục Tiêu Định Kỳ (Rule of 3) */}
      <RecurringTasks />

      {/* Search & Sort Panel */}
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
        </div>
      </section>

      {/* Main Grid View */}
      {viewMode === 'card' && (
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
      )}

      {viewMode === 'calendar' && (
        <CalendarView 
          exams={sortedExams} 
          onEdit={handleEditOpen}
          onDelete={handleDeleteExam}
          onCreate={handleCreateOpen}
        />
      )}

      {viewMode === 'matrix' && (
        <PriorityMatrix
          exams={exams}
          generalTasks={generalTasks}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onUpdateTaskPriority={handleUpdateTaskPriority}
        />
      )}

      {/* Trình Phân Tích & Cảnh Báo Học Tập Thông Minh */}
      <SmartInsights exams={exams} />

      {/* Lịch Sử Đóng Góp Học Tập (GitHub-style Commit Graph) */}
      <ContributionGraph />

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
    </div>
  );
}

export default App;
