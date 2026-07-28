import { memo, useEffect, useMemo, useState } from 'react';
import {
  buildFocusCsv,
  createDefaultFocusPlan,
  estimatePlanFinish,
  FOCUS_PLANNER_STORAGE_KEY,
  FOCUS_TEMPLATES_STORAGE_KEY,
  flattenStudyTasks,
  normalizeFocusPlan,
  summarizeFocusLogs
} from '../utils/focusPlanning';

const WIDGET_ORDER_KEY = 'focus_widget_order_v1';
const DEFAULT_WIDGET_ORDER = ['plan', 'insights', 'templates'];

const readJson = (key, fallback) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const loadLogs = () => {
  const value = readJson('pomodoro_study_logs', []);
  return Array.isArray(value) ? value : [];
};

const loadTemplates = () => {
  const value = readJson(FOCUS_TEMPLATES_STORAGE_KEY, []);
  return Array.isArray(value) ? value.slice(0, 20) : [];
};

const loadWidgetOrder = () => {
  const value = readJson(WIDGET_ORDER_KEY, DEFAULT_WIDGET_ORDER);
  if (!Array.isArray(value)) return DEFAULT_WIDGET_ORDER;
  const known = value.filter((id) => DEFAULT_WIDGET_ORDER.includes(id));
  return [...new Set([...known, ...DEFAULT_WIDGET_ORDER])];
};

const getSelectedTasks = (keys, taskMap) => keys.map((key) => taskMap.get(key)).filter(Boolean);

function FocusRing({ minutes, goal }) {
  const percent = Math.min(100, Math.round((minutes / Math.max(goal, 1)) * 100));
  const circumference = 2 * Math.PI * 50;
  const offset = circumference * (1 - percent / 100);
  return (
    <div className="focus-ring" aria-label={`${minutes} trên ${goal} phút tập trung hôm nay`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="focus-ring-track" cx="60" cy="60" r="50" />
        <circle
          className="focus-ring-progress"
          cx="60"
          cy="60"
          r="50"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="focus-ring-value">
        <strong>{percent}%</strong>
        <span>{minutes}/{goal} phút</span>
      </div>
    </div>
  );
}

function WidgetFrame({ id, title, icon, index, total, dragging, onDragStart, onDrop, onMove, children }) {
  return (
    <section
      className={`focus-widget glass-panel ${dragging ? 'is-dragging' : ''}`}
      draggable
      onDragStart={() => onDragStart(id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(id)}
    >
      <header className="focus-widget-header">
        <div>
          <h2><span aria-hidden="true">{icon}</span> {title}</h2>
          <span className="focus-widget-drag-hint">Kéo để đổi vị trí</span>
        </div>
        <div className="focus-widget-order-actions" aria-label={`Đổi vị trí ${title}`}>
          <button type="button" onClick={() => onMove(id, -1)} disabled={index === 0} aria-label={`Đưa ${title} lên`}>↑</button>
          <button type="button" onClick={() => onMove(id, 1)} disabled={index === total - 1} aria-label={`Đưa ${title} xuống`}>↓</button>
        </div>
      </header>
      {children}
    </section>
  );
}

function TaskChecklist({ title, tasks, selectedKeys, onToggle, max = 3 }) {
  return (
    <fieldset className="focus-task-picker">
      <legend>{title} <span>Tối đa {max}</span></legend>
      {tasks.length === 0 ? (
        <p className="focus-empty">Chưa có nhiệm vụ đang mở.</p>
      ) : (
        <div className="focus-task-picker-list">
          {tasks.map((task) => {
            const checked = selectedKeys.includes(task.key);
            const disabled = !checked && selectedKeys.length >= max;
            return (
              <label key={task.key} className={checked ? 'selected' : ''}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(task.key)}
                />
                <span>
                  <strong>{task.text}</strong>
                  <small>{task.subject} · 🍅 {task.estPomodoros}</small>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

function FocusPlanner({ exams = [], generalTasks = [], onOpenPomodoro, onAddTask }) {
  const [plan, setPlan] = useState(() => normalizeFocusPlan(
    readJson(FOCUS_PLANNER_STORAGE_KEY, createDefaultFocusPlan())
  ));
  const [logs, setLogs] = useState(loadLogs);
  const [templates, setTemplates] = useState(loadTemplates);
  const [widgetOrder, setWidgetOrder] = useState(loadWidgetOrder);
  const [draggingId, setDraggingId] = useState(null);
  const [templateDraft, setTemplateDraft] = useState({ text: '', examId: 'general', estPomodoros: 1 });

  const tasks = useMemo(() => flattenStudyTasks(exams, generalTasks), [exams, generalTasks]);
  const openTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const taskMap = useMemo(() => new Map(tasks.map((task) => [task.key, task])), [tasks]);
  const summary = useMemo(() => summarizeFocusLogs(logs, tasks), [logs, tasks]);
  const selectedTodayTasks = useMemo(
    () => getSelectedTasks(plan.today.priorityTaskKeys, taskMap),
    [plan.today.priorityTaskKeys, taskMap]
  );
  const finishEstimate = useMemo(
    () => estimatePlanFinish(selectedTodayTasks, summary.totalMinutes),
    [selectedTodayTasks, summary.totalMinutes]
  );

  useEffect(() => {
    localStorage.setItem(FOCUS_PLANNER_STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    localStorage.setItem(FOCUS_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  useEffect(() => {
    const refreshLogs = () => setLogs(loadLogs());
    const refreshPlan = () => setPlan((current) => normalizeFocusPlan(current));
    window.addEventListener('studyLogsUpdated', refreshLogs);
    window.addEventListener('storage', refreshLogs);
    document.addEventListener('visibilitychange', refreshPlan);
    return () => {
      window.removeEventListener('studyLogsUpdated', refreshLogs);
      window.removeEventListener('storage', refreshLogs);
      document.removeEventListener('visibilitychange', refreshPlan);
    };
  }, []);

  const patchDay = (day, patch) => {
    setPlan((current) => ({
      ...current,
      [day]: { ...current[day], ...patch }
    }));
  };

  const togglePriority = (day, key) => {
    const selected = plan[day].priorityTaskKeys;
    const next = selected.includes(key)
      ? selected.filter((item) => item !== key)
      : [...selected, key].slice(0, 3);
    patchDay(day, { priorityTaskKeys: next });
  };

  const startTask = (task) => {
    if (!task) {
      onOpenPomodoro?.();
      return;
    }
    onOpenPomodoro?.({ examId: task.examId, taskId: task.taskId });
  };

  const saveTemplate = (event) => {
    event.preventDefault();
    const text = templateDraft.text.trim();
    if (!text) return;
    setTemplates((current) => [{
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      examId: templateDraft.examId,
      estPomodoros: Math.min(12, Math.max(1, Number(templateDraft.estPomodoros) || 1))
    }, ...current].slice(0, 20));
    setTemplateDraft((current) => ({ ...current, text: '' }));
  };

  const applyTemplate = (template) => {
    onAddTask?.(
      template.examId,
      template.text,
      '',
      template.estPomodoros,
      false,
      true
    );
  };

  const exportCsv = () => {
    const blob = new Blob([`\ufeff${buildFocusCsv(logs)}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `focus-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const moveWidget = (id, direction) => {
    setWidgetOrder((current) => {
      const from = current.indexOf(id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const dropWidget = (targetId) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }
    setWidgetOrder((current) => {
      const next = current.filter((id) => id !== draggingId);
      const targetIndex = next.indexOf(targetId);
      next.splice(targetIndex, 0, draggingId);
      return next;
    });
    setDraggingId(null);
  };

  const mostImportantTask = taskMap.get(plan.today.mostImportantTaskKey);
  const finishTime = finishEstimate.finishAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const widgets = {
    plan: (
      <>
        <div className="focus-plan-grid">
          <div className="focus-ring-panel">
            <FocusRing minutes={summary.totalMinutes} goal={plan.dailyGoalMinutes} />
            <label className="focus-goal-input">
              Mục tiêu hôm nay
              <span>
                <input
                  type="number"
                  min="15"
                  max="720"
                  step="15"
                  value={plan.dailyGoalMinutes}
                  onChange={(event) => setPlan((current) => ({
                    ...current,
                    dailyGoalMinutes: Math.min(720, Math.max(15, Number(event.target.value) || 15))
                  }))}
                />
                phút
              </span>
            </label>
          </div>
          <div className="focus-mit-panel">
            <label htmlFor="focus-mit">⭐ Việc quan trọng nhất hôm nay</label>
            <select
              id="focus-mit"
              value={plan.today.mostImportantTaskKey}
              onChange={(event) => patchDay('today', { mostImportantTaskKey: event.target.value })}
            >
              <option value="">Chọn một nhiệm vụ…</option>
              {openTasks.map((task) => (
                <option key={task.key} value={task.key}>{task.subject} · {task.text}</option>
              ))}
            </select>
            <button type="button" className="btn btn-primary" onClick={() => startTask(mostImportantTask)}>
              ▶ Bắt đầu việc quan trọng nhất
            </button>
            <p>
              {selectedTodayTasks.length
                ? `${finishEstimate.remainingMinutes} phút còn lại · dự kiến xong lúc ${finishTime}`
                : 'Chọn tối đa 3 nhiệm vụ để app dự báo thời gian hoàn thành.'}
            </p>
          </div>
        </div>
        <TaskChecklist
          title="Ba việc ưu tiên hôm nay"
          tasks={openTasks}
          selectedKeys={plan.today.priorityTaskKeys}
          onToggle={(key) => togglePriority('today', key)}
        />
        <details className="focus-tomorrow-plan">
          <summary>🌙 Lập kế hoạch ngày mai trong 2 phút</summary>
          <label>
            Việc quan trọng nhất ngày mai
            <select
              value={plan.tomorrow.mostImportantTaskKey}
              onChange={(event) => patchDay('tomorrow', { mostImportantTaskKey: event.target.value })}
            >
              <option value="">Chọn một nhiệm vụ…</option>
              {openTasks.map((task) => (
                <option key={task.key} value={task.key}>{task.subject} · {task.text}</option>
              ))}
            </select>
          </label>
          <TaskChecklist
            title="Ba việc ưu tiên ngày mai"
            tasks={openTasks}
            selectedKeys={plan.tomorrow.priorityTaskKeys}
            onToggle={(key) => togglePriority('tomorrow', key)}
          />
        </details>
      </>
    ),
    insights: (
      <>
        <div className="focus-metric-row">
          <div><strong>{summary.totalMinutes}</strong><span>phút hôm nay</span></div>
          <div><strong>{summary.sessions}</strong><span>phiên hôm nay</span></div>
          <div><strong>{finishEstimate.plannedMinutes}</strong><span>phút đã lên kế hoạch</span></div>
          <button type="button" onClick={exportCsv}>⇩ Xuất CSV</button>
        </div>
        <div className="focus-accuracy-table-wrap">
          <table className="focus-accuracy-table">
            <thead>
              <tr><th>Nhiệm vụ</th><th>Dự kiến</th><th>Thực tế</th><th>Chênh lệch</th></tr>
            </thead>
            <tbody>
              {summary.taskAccuracy.length ? summary.taskAccuracy.slice(0, 8).map((task) => (
                <tr key={task.key}>
                  <td><strong>{task.text}</strong><small>{task.subject}</small></td>
                  <td>{task.estimatedMinutes}p</td>
                  <td>{task.actualMinutes}p</td>
                  <td className={task.varianceMinutes > 0 ? 'over' : 'under'}>
                    {task.varianceMinutes > 0 ? '+' : ''}{task.varianceMinutes}p
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="focus-empty">Hoàn thành một phiên gắn với task để xem độ chính xác kế hoạch.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    ),
    templates: (
      <>
        <form className="focus-template-form" onSubmit={saveTemplate}>
          <input
            value={templateDraft.text}
            onChange={(event) => setTemplateDraft((current) => ({ ...current, text: event.target.value }))}
            placeholder="Ví dụ: Làm 20 câu trắc nghiệm"
            maxLength="120"
            aria-label="Tên mẫu nhiệm vụ"
          />
          <select
            value={templateDraft.examId}
            onChange={(event) => setTemplateDraft((current) => ({ ...current, examId: event.target.value }))}
            aria-label="Môn cho mẫu nhiệm vụ"
          >
            <option value="general">Nhiệm vụ chung</option>
            {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.subject}</option>)}
          </select>
          <label>
            🍅
            <input
              type="number"
              min="1"
              max="12"
              value={templateDraft.estPomodoros}
              onChange={(event) => setTemplateDraft((current) => ({ ...current, estPomodoros: event.target.value }))}
              aria-label="Số Pomodoro dự kiến"
            />
          </label>
          <button type="submit">Lưu mẫu</button>
        </form>
        <div className="focus-template-list">
          {templates.length ? templates.map((template) => (
            <article key={template.id}>
              <div><strong>{template.text}</strong><small>🍅 {template.estPomodoros}</small></div>
              <div>
                <button type="button" onClick={() => applyTemplate(template)}>+ Thêm task</button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => setTemplates((current) => current.filter((item) => item.id !== template.id))}
                  aria-label={`Xóa mẫu ${template.text}`}
                >
                  ×
                </button>
              </div>
            </article>
          )) : <p className="focus-empty">Lưu các nhiệm vụ lặp lại để thêm lại bằng một lần bấm.</p>}
        </div>
      </>
    )
  };

  const widgetMeta = {
    plan: { title: 'Focus Loop hôm nay', icon: '🎯' },
    insights: { title: 'Dự kiến và thực tế', icon: '📐' },
    templates: { title: 'Mẫu nhiệm vụ', icon: '🧩' }
  };

  return (
    <div className="focus-planner-dashboard">
      {widgetOrder.map((id, index) => (
        <WidgetFrame
          key={id}
          id={id}
          title={widgetMeta[id].title}
          icon={widgetMeta[id].icon}
          index={index}
          total={widgetOrder.length}
          dragging={draggingId === id}
          onDragStart={setDraggingId}
          onDrop={dropWidget}
          onMove={moveWidget}
        >
          {widgets[id]}
        </WidgetFrame>
      ))}
    </div>
  );
}

export default memo(FocusPlanner);
