import { useMemo } from 'react';
import { useCurrentTime } from '../utils/clock';
import { rankStudySubjects } from '../utils/studyNext';
import './StudyNext.css';

export default function StudyNext({ exams, onStart, onCreate, onLevelChange }) {
  const now = useCurrentTime();
  const ranked = useMemo(() => rankStudySubjects(exams, now), [exams, now]);
  const first = ranked[0];
  const start = item => onStart({ examId: item.exam.id, taskId: item.task?.id || '' });
  return (
    <section className="study-next" aria-labelledby="study-next-title">
      <div className="study-next-main">
        <span className="focus-eyebrow">MỖI LẦN MỘT VIỆC</span>
        <h2 id="study-next-title">Chưa biết học gì? Bắt đầu ở đây.</h2>
        {first ? <>
          <p>Gợi ý theo hạn thi và mức độ nắm bài. Chỉ cần làm bước đầu, chưa cần giải quyết hết mọi môn.</p>
          <h3>{first.exam.subject}</h3>
          <p className="study-next-reason">{first.reason}</p>
          <div className="study-next-step"><strong>Việc đầu tiên</strong><p>{first.action}</p></div>
          <button className="btn btn-primary" onClick={() => start(first)}>▶ Mở phiên học môn này</button>
          <small>Chọn thời lượng rồi bấm bắt đầu trong đồng hồ. Xong một phiên, nghỉ ngắn và đánh dấu task đã làm.</small>
        </> : <>
          <p>Thêm các môn và ngày thi để có gợi ý nên học môn nào trước.</p>
          <button className="btn btn-primary" onClick={onCreate}>+ Thêm môn cần học</button>
        </>}
      </div>
      {first && <div className="study-next-order">
        <h3>Thứ tự gợi ý</h3>
        <p>Chọn mức độ của từng môn để điều chỉnh. Mặc định là “Đang ôn”.</p>
        <ol>{ranked.map((item, index) => <li key={item.exam.id}>
          <div className="study-next-subject"><span>{index + 1}. {item.exam.subject}</span><button onClick={() => start(item)} aria-label={`Học ${item.exam.subject}`}>Học →</button></div>
          <label>Mức độ nắm bài
            <select value={item.exam.studyLevel || 'learning'} onChange={event => onLevelChange(item.exam.id, event.target.value)}>
              <option value="new">Chưa nắm bài</option><option value="learning">Đang ôn</option><option value="ready">Đã khá vững</option>
            </select>
          </label>
          <small>{item.reason}</small>
        </li>)}</ol>
        <button className="hero-text-action" onClick={onCreate}>+ Thêm môn thi</button>
      </div>}
    </section>
  );
}
