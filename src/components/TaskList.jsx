import { useState } from 'react';
import { flattenStudyTasks } from '../utils/focusPlanning';

export default function TaskList({ exams, generalTasks, subject, onSubjectChange, onAddTask, onToggleTask, onDeleteTask, onStart }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('open');
  const tasks = flattenStudyTasks(exams, generalTasks);
  const visible = tasks.filter(task => (subject === 'all' || task.examId === subject) && (status === 'all' || task.completed === (status === 'done')));
  const add = event => {
    event.preventDefault();
    if (!text.trim()) return;
    onAddTask(subject === 'all' ? 'general' : subject, text.trim());
    setText('');
    setStatus('open');
  };
  return <section className="simple-panel" aria-labelledby="tasks-title">
    <h2 id="tasks-title">Việc cần làm</h2>
    <p className="simple-description">Một danh sách cho việc chung và việc của từng môn. Thêm việc khi cần, đánh dấu khi xong.</p>
    <div className="simple-filters">
      <label>Môn học<select value={subject} onChange={event => onSubjectChange(event.target.value)}>
        <option value="all">Tất cả môn / thêm việc chung</option><option value="general">Việc chung</option>
        {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.subject}</option>)}
      </select></label>
      <label>Trạng thái<select value={status} onChange={event => setStatus(event.target.value)}><option value="open">Chưa xong</option><option value="done">Đã xong</option><option value="all">Tất cả</option></select></label>
    </div>
    <form className="simple-task-form" onSubmit={add}>
      <input aria-label="Việc cần làm mới" placeholder="Bạn cần làm gì?" maxLength={300} value={text} onChange={event => setText(event.target.value)} required />
      <button className="btn btn-primary" disabled={!text.trim()}>Thêm việc</button>
    </form>
    <p role="status" className="simple-description">{tasks.filter(task => !task.completed).length} việc chưa xong · Đang hiện {visible.length} việc</p>
    <ul className="simple-task-list">{visible.map(task => <li key={task.key}>
      <label className="simple-task-label"><input type="checkbox" checked={task.completed} onChange={() => onToggleTask(task.examId, task.id)} /><span className={task.completed ? 'task-done' : ''}>{task.text}<small>{task.subject}{task.deadline && !Number.isNaN(Date.parse(task.deadline)) ? ` · Hạn: ${new Date(task.deadline).toLocaleString('vi-VN')}` : ''}</small></span></label>
      <div className="simple-task-actions">{!task.completed && <button className="btn btn-secondary" aria-label={`Tập trung: ${task.text}`} onClick={() => onStart({ examId: task.examId, taskId: task.id })}>Tập trung</button>}
        <button className="btn btn-secondary" aria-label={`Xóa việc: ${task.text}`} onClick={() => onDeleteTask(task.examId, task.id)}>Xóa</button></div>
    </li>)}</ul>
    {!visible.length && <p className="simple-empty">{status === 'open' ? 'Không còn việc nào chưa xong trong mục này.' : 'Chưa có việc nào trong mục này.'}</p>}
  </section>;
}
