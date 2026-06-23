import { useState, useEffect } from 'react';

// Helpers to get period identifiers
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const getCurrentPeriodIds = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  
  return {
    daily: `${year}-${month}-${date}`,
    weekly: `${year}-W${getWeekNumber(now)}`,
    monthly: `${year}-${month}`,
    yearly: `${year}`
  };
};

const DEFAULT_GOALS = {
  daily: {
    periodId: '',
    title: 'Mục tiêu Hàng Ngày',
    emoji: '☀️',
    tasks: [
      { id: 'd1', text: 'Tập trung học 1 phiên Pomodoro', completed: false },
      { id: 'd2', text: 'Ôn lại ghi chú hoặc công thức cốt lõi', completed: false },
      { id: 'd3', text: 'Đọc ít nhất 10 trang sách hoặc tài liệu', completed: false }
    ]
  },
  weekly: {
    periodId: '',
    title: 'Mục tiêu Hàng Tuần',
    emoji: '📅',
    tasks: [
      { id: 'w1', text: 'Giải ít nhất 1 đề thi thử trọn vẹn', completed: false },
      { id: 'w2', text: 'Tổng hợp và hệ thống lại kiến thức trong tuần', completed: false },
      { id: 'w3', text: 'Lập kế hoạch học tập chi tiết cho tuần tiếp theo', completed: false }
    ]
  },
  monthly: {
    periodId: '',
    title: 'Mục tiêu Hàng Tháng',
    emoji: '🎯',
    tasks: [
      { id: 'm1', text: 'Hoàn thành đề cương chi tiết cho tất cả môn thi', completed: false },
      { id: 'm2', text: 'Đọc xong 1 cuốn sách chuyên ngành/bổ trợ', completed: false },
      { id: 'm3', text: 'Đánh giá tiến độ học tập và điều chỉnh phương pháp', completed: false }
    ]
  },
  yearly: {
    periodId: '',
    title: 'Mục tiêu Hàng Năm',
    emoji: '🏆',
    tasks: [
      { id: 'y1', text: 'Đạt điểm số mục tiêu (GPA >= 3.6 hoặc tương đương)', completed: false },
      { id: 'y2', text: 'Hoàn thành 1 chứng chỉ học thuật hoặc kỹ năng mới', completed: false },
      { id: 'y3', text: 'Xây dựng thành công 2 dự án cá nhân thực tế', completed: false }
    ]
  }
};

const getPeriodLabel = (key) => {
  const now = new Date();
  const formatNum = (num) => String(num).padStart(2, '0');

  if (key === 'daily') {
    return `Hôm nay: ${formatNum(now.getDate())}/${formatNum(now.getMonth() + 1)}`;
  }
  
  if (key === 'weekly') {
    const tempNow = new Date();
    const day = tempNow.getDay();
    const diffToMonday = tempNow.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(tempNow.setDate(diffToMonday));
    const sunday = new Date(tempNow.setDate(monday.getDate() + 6));
    
    return `Tuần này: ${formatNum(monday.getDate())}/${formatNum(monday.getMonth() + 1)} - ${formatNum(sunday.getDate())}/${formatNum(sunday.getMonth() + 1)}`;
  }
  
  if (key === 'monthly') {
    return `Tháng này: ${formatNum(now.getMonth() + 1)}/${now.getFullYear()}`;
  }
  
  if (key === 'yearly') {
    return `Năm nay: ${now.getFullYear()}`;
  }
  
  return '';
};

function RecurringTasks() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('recurring_tasks_rule_of_3');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure structure is correct
        const periods = getCurrentPeriodIds();
        let changed = false;
        
        const updatedData = { ...parsed };
        
        // Check and reset expired periods
        Object.keys(periods).forEach((key) => {
          if (!updatedData[key]) {
            updatedData[key] = { ...DEFAULT_GOALS[key] };
            updatedData[key].periodId = periods[key];
            changed = true;
          } else if (updatedData[key].periodId !== periods[key]) {
            // Period changed! Reset completions
            updatedData[key] = {
              ...updatedData[key],
              periodId: periods[key],
              tasks: updatedData[key].tasks.map(t => ({ ...t, completed: false }))
            };
            changed = true;
          }
        });
        
        if (changed) {
          localStorage.setItem('recurring_tasks_rule_of_3', JSON.stringify(updatedData));
        }
        return updatedData;
      }
    } catch (e) {
      console.error('Error loading recurring tasks:', e);
    }
    
    // Default fallback
    const periods = getCurrentPeriodIds();
    const initial = { ...DEFAULT_GOALS };
    Object.keys(periods).forEach(key => {
      initial[key] = {
        ...initial[key],
        periodId: periods[key]
      };
    });
    localStorage.setItem('recurring_tasks_rule_of_3', JSON.stringify(initial));
    return initial;
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Check period expiration periodically (e.g., if application runs overnight)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const periods = getCurrentPeriodIds();
      let changed = false;
      
      setData(prev => {
        const updated = { ...prev };
        Object.keys(periods).forEach(key => {
          if (updated[key] && updated[key].periodId !== periods[key]) {
            updated[key] = {
              ...updated[key],
              periodId: periods[key],
              tasks: updated[key].tasks.map(t => ({ ...t, completed: false }))
            };
            changed = true;
          }
        });
        
        if (changed) {
          localStorage.setItem('recurring_tasks_rule_of_3', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }, 60000); // check every minute

    return () => clearInterval(checkInterval);
  }, []);

  const handleToggleTask = (category, taskId) => {
    setData(prev => {
      const updatedCategory = {
        ...prev[category],
        tasks: prev[category].tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      };
      
      const updatedData = {
        ...prev,
        [category]: updatedCategory
      };
      
      localStorage.setItem('recurring_tasks_rule_of_3', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const handleSaveEdit = (category, taskId) => {
    if (!editingText.trim()) return;
    
    setData(prev => {
      const updatedCategory = {
        ...prev[category],
        tasks: prev[category].tasks.map(task => 
          task.id === taskId ? { ...task, text: editingText.trim() } : task
        )
      };
      
      const updatedData = {
        ...prev,
        [category]: updatedCategory
      };
      
      localStorage.setItem('recurring_tasks_rule_of_3', JSON.stringify(updatedData));
      return updatedData;
    });
    
    setEditingTaskId(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const renderTaskColumn = (key, goalCategory) => {
    const completedCount = goalCategory.tasks.filter(t => t.completed).length;
    const progressPercent = (completedCount / 3) * 100;
    const isAllCompleted = completedCount === 3;

    return (
      <div key={key} className={`recurring-column ${isAllCompleted ? 'all-completed' : ''}`}>
        <div className="recurring-column-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{goalCategory.emoji}</span>
              <h3 className="recurring-column-title">{goalCategory.title}</h3>
            </div>
            <span className="recurring-period-label">{getPeriodLabel(key)}</span>
          </div>
          <span className="recurring-column-badge">{completedCount}/3</span>
        </div>

        {/* Progress bar */}
        <div className="recurring-progress-bar-container">
          <div 
            className="recurring-progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Tasks list */}
        <ul className="recurring-tasks-list">
          {goalCategory.tasks.map((task) => {
            const isEditing = editingTaskId === task.id;

            return (
              <li 
                key={task.id} 
                className={`recurring-task-item ${task.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}`}
                onDoubleClick={() => !isEditing && handleStartEdit(task)}
              >
                {isEditing ? (
                  <div className="recurring-edit-form">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="recurring-input-text"
                      maxLength={120}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(key, task.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      aria-label="Chỉnh sửa nội dung mục tiêu"
                    />
                    <div className="recurring-edit-actions">
                      <button 
                        type="button" 
                        className="btn-icon-tiny check" 
                        onClick={() => handleSaveEdit(key, task.id)}
                        title="Lưu"
                      >
                        ✓
                      </button>
                      <button 
                        type="button" 
                        className="btn-icon-tiny cancel" 
                        onClick={handleCancelEdit}
                        title="Hủy"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="recurring-task-checkbox-label">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(key, task.id)}
                        className="recurring-checkbox"
                      />
                      <span className="recurring-task-text">{task.text}</span>
                    </label>
                    
                    <button
                      type="button"
                      className="btn-edit-task"
                      onClick={() => handleStartEdit(task)}
                      title="Chỉnh sửa mục tiêu"
                      aria-label="Chỉnh sửa mục tiêu"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <section className="recurring-tasks-section" aria-label="Mục tiêu định kỳ Rule of 3">
      <div className="recurring-section-header">
        <div>
          <h2 className="recurring-section-title">Mục Tiêu Định Kỳ (Rule of 3)</h2>
          <p className="recurring-section-subtitle">
            Học tập tập trung bằng cách chọn ra đúng <strong>3 việc quan trọng nhất</strong> cho mỗi chu kỳ. Double click hoặc nhấn nút cây bút để sửa.
          </p>
        </div>
      </div>

      <div className="recurring-grid">
        {Object.entries(data).map(([key, category]) => renderTaskColumn(key, category))}
      </div>
    </section>
  );
}

export default RecurringTasks;
