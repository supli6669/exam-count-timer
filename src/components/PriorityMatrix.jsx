import { useState } from 'react';

function PriorityMatrix({ exams, generalTasks = [], onAddTask, onToggleTask, onDeleteTask, onUpdateTaskPriority }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hideCompleted, setHideCompleted] = useState(true);

  // States for quick-add forms in each quadrant
  const [quickAddTexts, setQuickAddTexts] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const [quickAddExams, setQuickAddExams] = useState({ q1: 'general', q2: 'general', q3: 'general', q4: 'general' });

  // Format task deadline beautifully
  const formatTaskDeadline = (deadlineStr) => {
    if (!deadlineStr) return '';
    const d = new Date(deadlineStr);
    const now = new Date();
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const isSameDay = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    if (d < now && !isSameDay) {
      return `Trễ: ${day}/${month} ${hours}:${minutes}`;
    }
    if (isSameDay) {
      const label = d < now ? 'Trễ hôm nay' : 'Hôm nay';
      return `${label}, ${hours}:${minutes}`;
    }
    if (isTomorrow) {
      return `Ngày mai, ${hours}:${minutes}`;
    }
    return `${day}/${month} ${hours}:${minutes}`;
  };

  // Compile all tasks from exams and general tasks
  const allTasks = [];

  // 1. Tasks from exams
  exams.forEach(exam => {
    const examTasks = exam.tasks || [];
    examTasks.forEach(task => {
      allTasks.push({
        ...task,
        examId: exam.id,
        subject: exam.subject,
        category: exam.category || 'other',
        // Fallback for tasks created before this feature
        urgent: task.urgent !== undefined ? task.urgent : false,
        important: task.important !== undefined ? task.important : true
      });
    });
  });

  // 2. General tasks
  generalTasks.forEach(task => {
    allTasks.push({
      ...task,
      examId: 'general',
      subject: 'Nhiệm vụ chung',
      category: 'general',
      urgent: task.urgent !== undefined ? task.urgent : false,
      important: task.important !== undefined ? task.important : true
    });
  });

  // Filter tasks based on search query and completion status
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompletion = hideCompleted ? !task.completed : true;
    return matchesSearch && matchesCompletion;
  });

  // Categorize tasks into 4 quadrants
  const quadrants = {
    q1: filteredTasks.filter(t => t.urgent && t.important),    // Urgent & Important
    q2: filteredTasks.filter(t => !t.urgent && t.important),   // Not Urgent but Important
    q3: filteredTasks.filter(t => t.urgent && !t.important),   // Urgent but Not Important
    q4: filteredTasks.filter(t => !t.urgent && !t.important)   // Not Urgent & Not Important
  };

  const handleQuickAddSubmit = (e, qKey) => {
    e.preventDefault();
    const text = quickAddTexts[qKey].trim();
    if (!text) return;

    const examId = quickAddExams[qKey];
    const urgent = qKey === 'q1' || qKey === 'q3';
    const important = qKey === 'q1' || qKey === 'q2';

    onAddTask(examId, text, '', 1, urgent, important);
    
    // Clear input
    setQuickAddTexts(prev => ({ ...prev, [qKey]: '' }));
  };

  const handleMoveTask = (task, targetQ) => {
    const urgent = targetQ === 'q1' || targetQ === 'q3';
    const important = targetQ === 'q1' || targetQ === 'q2';
    onUpdateTaskPriority(task.examId, task.id, urgent, important);
  };

  const getQuadrantKey = (task) => {
    if (task.urgent && task.important) return 'q1';
    if (!task.urgent && task.important) return 'q2';
    if (task.urgent && !task.important) return 'q3';
    return 'q4';
  };

  // Render a single task item
  const renderTaskItem = (task) => {
    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed;
    const formattedDeadline = task.deadline ? formatTaskDeadline(task.deadline) : '';
    const currentQ = getQuadrantKey(task);

    return (
      <div key={task.id} className={`matrix-task-item ${task.completed ? 'completed' : ''}`}>
        <div className="matrix-task-item-left">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleTask(task.examId, task.id)}
            className="matrix-task-checkbox"
            aria-label={`Hoàn thành ${task.text}`}
          />
          <div className="matrix-task-content">
            <span className="matrix-task-text">{task.text}</span>
            <div className="matrix-task-meta">
              <span 
                className="matrix-task-subject-tag"
                style={{
                  color: task.examId === 'general' ? '#a855f7' : 'var(--text-secondary)',
                  borderColor: task.examId === 'general' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.08)'
                }}
              >
                {task.subject}
              </span>
              {task.estPomodoros > 0 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} title={`Dự kiến: ${task.estPomodoros} phiên Pomodoro`}>
                  🍅 {task.estPomodoros}
                </span>
              )}
              {task.deadline && (
                <span className={`matrix-task-deadline ${isOverdue ? 'overdue' : ''}`}>
                  ⏰ {formattedDeadline}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="matrix-task-actions">
          {/* Quick quadrant changer */}
          <select
            value={currentQ}
            onChange={(e) => handleMoveTask(task, e.target.value)}
            className="priority-select-mini"
            title="Đổi góc phần tư"
          >
            <option value="q1">🔴 Q1: Làm ngay</option>
            <option value="q2">🟣 Q2: Lên lịch</option>
            <option value="q3">🟢 Q3: Làm nhanh</option>
            <option value="q4">⚪ Q4: Loại bỏ</option>
          </select>

          {/* Delete button */}
          <button
            className="btn-delete-task"
            onClick={() => onDeleteTask(task.examId, task.id)}
            title="Xóa nhiệm vụ"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              cursor: 'pointer',
              lineHeight: 1,
              marginLeft: '0.4rem'
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="priority-matrix-container">
      {/* Header Panel with Filters */}
      <div className="matrix-header-panel">
        <div>
          <h2 className="matrix-info-title">🎯 Ma trận ưu tiên công việc (Eisenhower)</h2>
          <p className="matrix-info-subtitle">Sắp xếp các đầu việc ôn tập khoa học để tối ưu hóa thời gian tập trung.</p>
        </div>
        <div className="matrix-filters">
          <input
            type="text"
            placeholder="Tìm kiếm nhiệm vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="matrix-search-input"
            aria-label="Tìm kiếm nhiệm vụ trong ma trận"
          />
          <label className="matrix-filter-checkbox">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
            />
            Ẩn việc đã xong
          </label>
        </div>
      </div>

      {/* 2x2 Quadrants Grid */}
      <div className="priority-matrix-grid">
        {/* Q1: Urgent & Important */}
        <div className="matrix-quadrant quadrant-q1">
          <div className="quadrant-header-container">
            <div className="quadrant-title-area">
              <h3 className="quadrant-title">
                <span>🔴 Q1: Làm ngay</span>
              </h3>
              <span className="quadrant-desc">Khẩn cấp & Quan trọng (Làm ngay lập tức)</span>
            </div>
            <span className="quadrant-count">{quadrants.q1.length}</span>
          </div>

          <div className="quadrant-tasks">
            {quadrants.q1.length > 0 ? (
              quadrants.q1.map(renderTaskItem)
            ) : (
              <div className="matrix-empty-text">Không có nhiệm vụ nào cần làm ngay. 🎉</div>
            )}
          </div>

          <form className="matrix-quick-add-form" onSubmit={(e) => handleQuickAddSubmit(e, 'q1')}>
            <input
              type="text"
              placeholder="Thêm nhanh việc vào Q1..."
              value={quickAddTexts.q1}
              onChange={(e) => setQuickAddTexts(prev => ({ ...prev, q1: e.target.value }))}
              className="matrix-quick-add-input"
              required
            />
            <div className="matrix-quick-add-row">
              <select
                value={quickAddExams.q1}
                onChange={(e) => setQuickAddExams(prev => ({ ...prev, q1: e.target.value }))}
                className="matrix-quick-add-select"
                aria-label="Chọn môn học liên kết"
              >
                <option value="general">Nhiệm vụ chung</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.subject}</option>
                ))}
              </select>
              <button type="submit" className="matrix-quick-add-submit-btn">Thêm</button>
            </div>
          </form>
        </div>

        {/* Q2: Not Urgent but Important */}
        <div className="matrix-quadrant quadrant-q2">
          <div className="quadrant-header-container">
            <div className="quadrant-title-area">
              <h3 className="quadrant-title">
                <span>🟣 Q2: Lên lịch</span>
              </h3>
              <span className="quadrant-desc">Quan trọng nhưng Chưa gấp (Lên kế hoạch)</span>
            </div>
            <span className="quadrant-count">{quadrants.q2.length}</span>
          </div>

          <div className="quadrant-tasks">
            {quadrants.q2.length > 0 ? (
              quadrants.q2.map(renderTaskItem)
            ) : (
              <div className="matrix-empty-text">Chưa có nhiệm vụ lên lịch. Lập kế hoạch nào! 📅</div>
            )}
          </div>

          <form className="matrix-quick-add-form" onSubmit={(e) => handleQuickAddSubmit(e, 'q2')}>
            <input
              type="text"
              placeholder="Thêm nhanh việc vào Q2..."
              value={quickAddTexts.q2}
              onChange={(e) => setQuickAddTexts(prev => ({ ...prev, q2: e.target.value }))}
              className="matrix-quick-add-input"
              required
            />
            <div className="matrix-quick-add-row">
              <select
                value={quickAddExams.q2}
                onChange={(e) => setQuickAddExams(prev => ({ ...prev, q2: e.target.value }))}
                className="matrix-quick-add-select"
                aria-label="Chọn môn học liên kết"
              >
                <option value="general">Nhiệm vụ chung</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.subject}</option>
                ))}
              </select>
              <button type="submit" className="matrix-quick-add-submit-btn">Thêm</button>
            </div>
          </form>
        </div>

        {/* Q3: Urgent but Not Important */}
        <div className="matrix-quadrant quadrant-q3">
          <div className="quadrant-header-container">
            <div className="quadrant-title-area">
              <h3 className="quadrant-title">
                <span>🟢 Q3: Làm nhanh</span>
              </h3>
              <span className="quadrant-desc">Khẩn cấp nhưng Ít quan trọng (Làm nhanh / Nhờ vả)</span>
            </div>
            <span className="quadrant-count">{quadrants.q3.length}</span>
          </div>

          <div className="quadrant-tasks">
            {quadrants.q3.length > 0 ? (
              quadrants.q3.map(renderTaskItem)
            ) : (
              <div className="matrix-empty-text">Không có việc khẩn cấp ít quan trọng.</div>
            )}
          </div>

          <form className="matrix-quick-add-form" onSubmit={(e) => handleQuickAddSubmit(e, 'q3')}>
            <input
              type="text"
              placeholder="Thêm nhanh việc vào Q3..."
              value={quickAddTexts.q3}
              onChange={(e) => setQuickAddTexts(prev => ({ ...prev, q3: e.target.value }))}
              className="matrix-quick-add-input"
              required
            />
            <div className="matrix-quick-add-row">
              <select
                value={quickAddExams.q3}
                onChange={(e) => setQuickAddExams(prev => ({ ...prev, q3: e.target.value }))}
                className="matrix-quick-add-select"
                aria-label="Chọn môn học liên kết"
              >
                <option value="general">Nhiệm vụ chung</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.subject}</option>
                ))}
              </select>
              <button type="submit" className="matrix-quick-add-submit-btn">Thêm</button>
            </div>
          </form>
        </div>

        {/* Q4: Not Urgent & Not Important */}
        <div className="matrix-quadrant quadrant-q4">
          <div className="quadrant-header-container">
            <div className="quadrant-title-area">
              <h3 className="quadrant-title">
                <span>⚪ Q4: Loại bỏ</span>
              </h3>
              <span className="quadrant-desc">Chưa gấp & Ít quan trọng (Hạn chế / Xóa bỏ)</span>
            </div>
            <span className="quadrant-count">{quadrants.q4.length}</span>
          </div>

          <div className="quadrant-tasks">
            {quadrants.q4.length > 0 ? (
              quadrants.q4.map(renderTaskItem)
            ) : (
              <div className="matrix-empty-text">Góc phần tư trống. Bạn đang tập trung rất tốt! 🧘</div>
            )}
          </div>

          <form className="matrix-quick-add-form" onSubmit={(e) => handleQuickAddSubmit(e, 'q4')}>
            <input
              type="text"
              placeholder="Thêm nhanh việc vào Q4..."
              value={quickAddTexts.q4}
              onChange={(e) => setQuickAddTexts(prev => ({ ...prev, q4: e.target.value }))}
              className="matrix-quick-add-input"
              required
            />
            <div className="matrix-quick-add-row">
              <select
                value={quickAddExams.q4}
                onChange={(e) => setQuickAddExams(prev => ({ ...prev, q4: e.target.value }))}
                className="matrix-quick-add-select"
                aria-label="Chọn môn học liên kết"
              >
                <option value="general">Nhiệm vụ chung</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.subject}</option>
                ))}
              </select>
              <button type="submit" className="matrix-quick-add-submit-btn">Thêm</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PriorityMatrix;
