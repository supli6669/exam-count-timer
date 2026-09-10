import { memo, useEffect, useMemo, useState } from 'react';
import AmbientSoundboard from './AmbientSoundboard';
import SpotifyPlayer from './SpotifyPlayer';
import { useCurrentTime } from '../utils/clock';
import {
  createDefaultFocusPlan,
  FOCUS_PLANNER_STORAGE_KEY,
  flattenStudyTasks,
  normalizeFocusPlan
} from '../utils/focusPlanning';

const ORDER_KEY = 'focus_workspace_widget_order_v1';
const DEFAULT_ORDER = ['timer', 'tasks', 'notes', 'calendar', 'sounds', 'music'];

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
};

const loadOrder = () => {
  const value = readJson(ORDER_KEY, DEFAULT_ORDER);
  if (!Array.isArray(value)) return DEFAULT_ORDER;
  return [...new Set([...value.filter((id) => DEFAULT_ORDER.includes(id)), ...DEFAULT_ORDER])];
};

function WorkspaceCanvas({ exams = [], generalTasks = [], onOpenPomodoro }) {
  const now = useCurrentTime();
  const [order, setOrder] = useState(loadOrder);
  const [dragging, setDragging] = useState(null);
  const [note, setNote] = useState(() => localStorage.getItem('focus_workspace_scratchpad') || '');
  const tasks = useMemo(() => flattenStudyTasks(exams, generalTasks), [exams, generalTasks]);
  const taskMap = useMemo(() => new Map(tasks.map((task) => [task.key, task])), [tasks]);
  const plan = normalizeFocusPlan(readJson(FOCUS_PLANNER_STORAGE_KEY, createDefaultFocusPlan()));
  const todayTasks = plan.today.priorityTaskKeys.map((key) => taskMap.get(key)).filter(Boolean);
  const upcoming = useMemo(() => exams
    .map((exam) => ({ ...exam, time: new Date(exam.datetime).getTime() }))
    .filter((exam) => exam.time > now)
    .sort((a, b) => a.time - b.time)
    .slice(0, 3), [exams, now]);

  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }, [order]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      localStorage.setItem('focus_workspace_scratchpad', note);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [note]);

  const move = (id, direction) => {
    setOrder((current) => {
      const from = current.indexOf(id);
      const to = from + direction;
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const drop = (target) => {
    if (!dragging || dragging === target) {
      setDragging(null);
      return;
    }
    setOrder((current) => {
      const next = current.filter((id) => id !== dragging);
      next.splice(next.indexOf(target), 0, dragging);
      return next;
    });
    setDragging(null);
  };

  const widgets = {
    timer: {
      title: 'Timer',
      icon: '⏱️',
      content: (
        <div className="workspace-clock">
          <strong>{new Date(now).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
          <span>Sẵn sàng cho phiên tập trung tiếp theo?</span>
          <button type="button" className="btn btn-primary" onClick={() => onOpenPomodoro?.()}>Mở Focus Mode</button>
        </div>
      )
    },
    tasks: {
      title: 'Ưu tiên hôm nay',
      icon: '🎯',
      content: todayTasks.length ? (
        <ol className="workspace-priorities">
          {todayTasks.map((task) => (
            <li key={task.key}>
              <span><strong>{task.text}</strong><small>{task.subject} · 🍅 {task.estPomodoros}</small></span>
              <button type="button" onClick={() => onOpenPomodoro?.({ examId: task.examId, taskId: task.taskId })}>Học</button>
            </li>
          ))}
        </ol>
      ) : <p className="focus-empty">Chọn ba ưu tiên trong tab Kế hoạch.</p>
    },
    notes: {
      title: 'Ghi chú nhanh',
      icon: '📝',
      content: (
        <textarea
          className="workspace-scratchpad"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ý tưởng, công thức, việc cần nhớ…"
          aria-label="Ghi chú nhanh trong không gian học"
        />
      )
    },
    calendar: {
      title: 'Lịch thi gần nhất',
      icon: '📅',
      content: upcoming.length ? (
        <ul className="workspace-exams">
          {upcoming.map((exam) => (
            <li key={exam.id}>
              <strong>{exam.subject}</strong>
              <time dateTime={exam.datetime}>{new Date(exam.datetime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</time>
            </li>
          ))}
        </ul>
      ) : <p className="focus-empty">Không có lịch thi sắp tới.</p>
    },
    sounds: { title: 'Sound mixer', icon: '🌧️', content: <AmbientSoundboard /> },
    music: { title: 'Nhạc tập trung', icon: '🎵', content: <SpotifyPlayer /> }
  };

  return (
    <main className="workspace-canvas" aria-label="Không gian học tuỳ biến">
      <div className="workspace-canvas-heading">
        <div><h2>Không gian học của bạn</h2><p>Kéo widget hoặc dùng nút mũi tên để sắp xếp.</p></div>
        <button type="button" onClick={() => setOrder(DEFAULT_ORDER)}>Khôi phục bố cục</button>
      </div>
      <div className="workspace-widget-grid">
        {order.map((id, index) => (
          <section
            key={id}
            className={`workspace-widget glass-panel workspace-${id} ${dragging === id ? 'is-dragging' : ''}`}
            draggable
            onDragStart={() => setDragging(id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => drop(id)}
          >
            <header>
              <h3><span aria-hidden="true">{widgets[id].icon}</span> {widgets[id].title}</h3>
              <div>
                <button type="button" disabled={index === 0} onClick={() => move(id, -1)} aria-label={`Đưa ${widgets[id].title} lên`}>←</button>
                <button type="button" disabled={index === order.length - 1} onClick={() => move(id, 1)} aria-label={`Đưa ${widgets[id].title} xuống`}>→</button>
              </div>
            </header>
            {widgets[id].content}
          </section>
        ))}
      </div>
    </main>
  );
}

export default memo(WorkspaceCanvas);
