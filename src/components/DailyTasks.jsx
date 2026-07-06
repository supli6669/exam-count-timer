import React, { useState, useEffect } from 'react';
import { incrementContribution, decrementContribution } from '../utils/contributions';

const getLocalTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DEFAULT_DAILY_TASKS = [
  { id: 'dt-1', text: 'Uống đủ 2L nước hôm nay 💧', completed: false },
  { id: 'dt-2', text: 'Ôn tập flashcard hoặc ghi chú học tập 🧠', completed: false },
  { id: 'dt-3', text: 'Tập trung học 2 phiên Pomodoro 🍅', completed: false },
  { id: 'dt-4', text: 'Đọc sách hoặc tài liệu học tập 30 phút 📚', completed: false }
];

function DailyTasks() {
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('daily_tasks_list');
      const lastResetDate = localStorage.getItem('daily_tasks_last_reset');
      const today = getLocalTodayDate();

      let loadedTasks = savedTasks ? JSON.parse(savedTasks) : DEFAULT_DAILY_TASKS;

      // Check if day has changed since last reset
      if (lastResetDate !== today) {
        loadedTasks = loadedTasks.map(t => ({ ...t, completed: false }));
        localStorage.setItem('daily_tasks_list', JSON.stringify(loadedTasks));
        localStorage.setItem('daily_tasks_last_reset', today);
      }

      return loadedTasks;
    } catch (e) {
      console.error('Error loading daily tasks:', e);
      return DEFAULT_DAILY_TASKS;
    }
  });

  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Periodically check if the day has changed (e.g., if application is open overnight)
  useEffect(() => {
    const checkResetInterval = setInterval(() => {
      const today = getLocalTodayDate();
      const lastResetDate = localStorage.getItem('daily_tasks_last_reset');
      
      if (lastResetDate !== today) {
        setTasks(prev => {
          const reset = prev.map(t => ({ ...t, completed: false }));
          localStorage.setItem('daily_tasks_list', JSON.stringify(reset));
          localStorage.setItem('daily_tasks_last_reset', today);
          return reset;
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkResetInterval);
  }, []);

  const handleToggleTask = (id) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        if (nextCompleted) {
          // Play Dopamine chime sound and gain XP
          incrementContribution();
          window.dispatchEvent(new CustomEvent('gain-xp', { detail: 25 }));
        } else {
          decrementContribution();
        }
        return { ...task, completed: nextCompleted };
      }
      return task;
    });

    setTasks(updatedTasks);
    localStorage.setItem('daily_tasks_list', JSON.stringify(updatedTasks));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: `dt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: newTaskText.trim(),
      completed: false
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('daily_tasks_list', JSON.stringify(updatedTasks));
    setNewTaskText('');
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const handleSaveEdit = (id) => {
    if (!editingText.trim()) return;

    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, text: editingText.trim() } : task
    );

    setTasks(updatedTasks);
    localStorage.setItem('daily_tasks_list', JSON.stringify(updatedTasks));
    setEditingTaskId(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleDeleteTask = (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete && taskToDelete.completed) {
      decrementContribution();
    }

    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('daily_tasks_list', JSON.stringify(updatedTasks));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <section className="daily-tasks-section" aria-label="Việc cần làm hằng ngày">
      <div className="daily-section-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h2 className="daily-section-title">✍️ Thói Quen Hằng Ngày (Daily Habits)</h2>
            <p className="daily-section-subtitle">
              Danh sách việc làm cố định lặp lại. Reset trạng thái vào lúc <strong>00:00 mỗi ngày</strong>.
            </p>
          </div>
          <span className={`daily-column-badge ${isAllCompleted ? 'all-done' : ''}`}>
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="daily-progress-bar-container">
        <div 
          className={`daily-progress-bar-fill ${isAllCompleted ? 'all-done' : ''}`} 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Tasks list */}
      <ul className="daily-tasks-list">
        {tasks.map((task) => {
          const isEditing = editingTaskId === task.id;

          return (
            <li 
              key={task.id} 
              className={`daily-task-item ${task.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}`}
              onDoubleClick={() => !isEditing && handleStartEdit(task)}
            >
              {isEditing ? (
                <div className="daily-edit-form">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="daily-input-text"
                    maxLength={120}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(task.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    aria-label="Chỉnh sửa thói quen hàng ngày"
                  />
                  <div className="daily-edit-actions">
                    <button 
                      type="button" 
                      className="btn-icon-tiny check" 
                      onClick={() => handleSaveEdit(task.id)}
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
                  <label className="daily-task-checkbox-label">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="daily-checkbox"
                    />
                    <span className="daily-task-text">{task.text}</span>
                  </label>
                  
                  <div className="daily-task-actions">
                    <button
                      type="button"
                      className="btn-edit-task"
                      onClick={() => handleStartEdit(task)}
                      title="Chỉnh sửa thói quen"
                      aria-label="Chỉnh sửa thói quen"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    
                    <button
                      type="button"
                      className="btn-delete-task"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Xóa thói quen"
                      aria-label="Xóa thói quen"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      {/* Add form */}
      <form onSubmit={handleAddTask} className="daily-add-form">
        <input
          type="text"
          placeholder="Thêm thói quen lặp lại hàng ngày mới..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          className="daily-add-input"
          maxLength={100}
        />
        <button type="submit" className="daily-add-btn" title="Thêm thói quen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Thêm
        </button>
      </form>
    </section>
  );
}

export default React.memo(DailyTasks);
