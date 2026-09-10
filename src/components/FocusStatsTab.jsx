import { memo, useEffect, useState } from 'react';
import { safeJsonParse } from '../utils/storage';
import { summarizeStudyStats } from '../utils/studyStats';

const minutes = seconds => `${Math.round(seconds / 60)} phút`;
const readLogs = () => safeJsonParse('pomodoro_study_logs', []);

export default memo(function FocusStatsTab({ studyLogs, exams = [], generalTasks = [], onClearStats }) {
  const [savedLogs, setSavedLogs] = useState(readLogs);
  useEffect(() => {
    if (studyLogs !== undefined) return;
    const refresh = () => setSavedLogs(readLogs());
    window.addEventListener('studyLogsUpdated', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('studyLogsUpdated', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [studyLogs]);
  const stats = summarizeStudyStats(studyLogs ?? savedLogs);
  const tasks = [...generalTasks, ...exams.flatMap(exam => exam.tasks || [])];
  const maximum = Math.max(1, ...stats.days.map(day => day.seconds));
  return <section className="simple-panel" aria-label="Thống kê học tập">
    <h2>Thống kê học tập</h2>
    <p className="simple-description">Thời gian đã ghi nhận từ đồng hồ và số việc đã hoàn thành.</p>
    <div className="simple-stat-grid">{[['Hôm nay', minutes(stats.today)], ['7 ngày gần nhất', minutes(stats.week)], ['Lịch sử đang lưu', minutes(stats.total)], ['Việc đã xong', `${tasks.filter(task => task.completed).length} / ${tasks.length}`]].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
    <h3>7 ngày gần nhất</h3>
    <ul className="simple-bars">{stats.days.map(day => <li key={day.date}><span>{day.date.slice(8)}/{day.date.slice(5, 7)}</span><progress max={maximum} value={day.seconds} aria-label={`Thời gian học ngày ${day.date}`} /><span>{minutes(day.seconds)}</span></li>)}</ul>
    <h3>Thời gian theo môn</h3>
    {stats.subjects.length ? <ul className="simple-subject-stats">{stats.subjects.map(([subject, seconds]) => <li key={subject}><span>{subject}</span><strong>{minutes(seconds)}</strong></li>)}</ul> : <p className="simple-empty">Chưa có thời gian học được ghi nhận. Bắt đầu một phiên Pomodoro để theo dõi tại đây.</p>}
    <p className="simple-description">Lịch sử chi tiết được giữ tối đa 180 ngày.</p>
    {onClearStats && <button className="btn btn-secondary" onClick={() => { if (window.confirm('Xóa lịch sử thời gian học đã lưu?')) onClearStats(); }}>Xóa lịch sử học</button>}
  </section>;
});
