import { useState, useSyncExternalStore } from 'react';
import { flattenStudyTasks } from '../utils/focusPlanning';

import { getLocalDateKey, localDateFromKey } from '../utils/date';
import { subscribeToLocalDay } from '../utils/dailyPlan';

export default function TaskList({ exams, generalTasks, subject, onSubjectChange, onAddTask, onToggleTask, onDeleteTask, onPlanTask, onStart }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('open');
  const [scope, setScope] = useState('daily');
  const today = useSyncExternalStore(subscribeToLocalDay, getLocalDateKey, getLocalDateKey);
  const [selectedDate, setDate] = useState('');
  const date = selectedDate || today;
  const tasks = flattenStudyTasks(exams, generalTasks);
  const scoped = tasks.filter(task => (subject === 'all' || task.examId === subject) && (scope === 'all' || (scope === 'daily' ? task.plannedDate === date : !task.plannedDate)));
  const done = scoped.filter(task => task.completed).length;
  const visible = scoped.filter(task => status === 'all' || task.completed === (status === 'done'));
  const add = event => {
    event.preventDefault();
    if (!text.trim()) return;
    onAddTask(subject === 'all' ? 'general' : subject, text.trim(), '', 1, false, true, scope === 'daily' ? date : '');
    setText('');
    setStatus('open');
  };
  return <section className="simple-panel" aria-labelledby="tasks-title">
    <h2 id="tasks-title">Việc cần làm</h2>
    <p className="simple-description">Việc chưa hoàn thành sẽ tự dồn sang ngày tiếp theo. Chọn việc cần tập trung và đánh dấu khi hoàn thành.</p>
    <div className="daily-plan-controls">
      <div className="daily-plan-tabs" role="group" aria-label="Chế độ xem công việc">
        {[['daily', 'Daily Plan'], ['unplanned', 'Chưa lên lịch'], ['all', 'Tất cả việc']].map(([value, label]) => <button key={value} className={`btn ${scope === value ? 'btn-primary' : 'btn-secondary'}`} aria-pressed={scope === value} onClick={() => setScope(value)}>{label}</button>)}
      </div>
      {scope === 'daily' && <div className="daily-plan-date"><label>Ngày kế hoạch<input type="date" value={date} onChange={event => { if (event.target.value) setDate(event.target.value === today ? '' : event.target.value); }} /></label><button className="btn btn-secondary" onClick={() => setDate('')}>Hôm nay</button></div>}
    </div>
    {scope === 'daily' && <div className="daily-plan-progress"><span role="status">{done}/{scoped.length} việc đã hoàn thành trong ngày{subject !== 'all' ? ' · Theo môn đã chọn' : ''}</span><progress aria-label="Tiến độ kế hoạch trong ngày" value={done} max={scoped.length || 1} /></div>}
    <div className="simple-filters">
      <label>Môn học<select value={subject} onChange={event => onSubjectChange(event.target.value)}>
        <option value="all">Tất cả môn / thêm việc chung</option><option value="general">Việc chung</option>
        {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.subject}</option>)}
      </select></label>
      <label>Trạng thái<select value={status} onChange={event => setStatus(event.target.value)}><option value="open">Chưa xong</option><option value="done">Đã xong</option><option value="all">Tất cả</option></select></label>
    </div>
    <form className="simple-task-form" onSubmit={add}>
      <input aria-label="Việc cần làm mới" placeholder="Bạn cần làm gì?" maxLength={300} value={text} onChange={event => setText(event.target.value)} required />
      <button className="btn btn-primary" disabled={!text.trim()}>{scope === 'daily' ? 'Thêm vào ngày này' : 'Thêm việc'}</button>
    </form>
    <p role="status" className="simple-description">{scoped.length - done} việc chưa xong trong mục này · Đang hiện {visible.length} việc</p>
    <ul className="simple-task-list">{visible.map(task => <li key={task.key}>
      <label className="simple-task-label"><input type="checkbox" checked={task.completed} onChange={() => onToggleTask(task.examId, task.id)} /><span className={task.completed ? 'task-done' : ''}>{task.text}<small>{task.subject}{task.carriedFromDate && ` · Dồn từ ngày ${localDateFromKey(task.carriedFromDate).toLocaleDateString('vi-VN')}`}{task.deadline && !Number.isNaN(Date.parse(task.deadline)) ? ` · Hạn: ${new Date(task.deadline).toLocaleString('vi-VN')}` : ''}</small></span></label>
      <div className="simple-task-actions"><label className="task-plan-date">Ngày làm<input type="date" aria-label={`Ngày làm: ${task.text}`} value={task.plannedDate || ''} onChange={event => onPlanTask(task.examId, task.id, event.target.value)} /></label>{task.plannedDate && <button className="btn btn-secondary" aria-label={`Bỏ lịch: ${task.text}`} onClick={() => onPlanTask(task.examId, task.id, '')}>Bỏ lịch</button>}{!task.completed && <button className="btn btn-secondary" aria-label={`Tập trung: ${task.text}`} onClick={() => onStart({ examId: task.examId, taskId: task.id })}>Tập trung</button>}
        <button className="btn btn-secondary" aria-label={`Xóa việc: ${task.text}`} onClick={() => onDeleteTask(task.examId, task.id)}>Xóa</button></div>
    </li>)}</ul>
    {!visible.length && <p className="simple-empty">{scope === 'daily' && !scoped.length ? 'Ngày này chưa có kế hoạch. Thêm việc mới hoặc mở “Chưa lên lịch” để chọn ngày làm cho việc có sẵn.' : 'Không có việc nào phù hợp với bộ lọc.'}</p>}
  </section>;
}
