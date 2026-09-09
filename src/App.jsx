import { useEffect, useRef, useState } from 'react';
import { createCreditPlan, finishTimer, isValidPlan, normalizeSubjects, PLAN_KEY, timerRemaining } from './utils/creditPlan';
import './study.css';

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
const initialPlan = () => { const p = read(PLAN_KEY, null); return isValidPlan(p) ? p : null; };
const draftKey = 'credit_study_draft_v1';
const format = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

export default function App() {
  const [plan, setPlan] = useState(initialPlan);
  const [subjects, setSubjects] = useState(() => initialPlan()?.subjects || normalizeSubjects(read(draftKey, null)?.subjects || read('exams_countdown_list', [])));
  const [config, setConfig] = useState(() => initialPlan()?.config || { days: 6, minutes: 100, session: 30 });
  const [editing, setEditing] = useState(() => !initialPlan());
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('3');
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [day, setDay] = useState(0);
  const nameInput = useRef(null);
  const importInput = useRef(null);
  const timer = plan?.timer;
  const running = Boolean(timer?.deadline);
  const seconds = timer ? timerRemaining(timer, now) : 0;

  useEffect(() => {
    if (!plan) return;
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); }
    catch {
      // Surface an external storage failure; this only runs when a write fails.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageError('Không lưu được trên trình duyệt này. Hãy tải bản sao trong phần thiết lập.');
    }
  }, [plan]);

  useEffect(() => {
    try { localStorage.setItem(draftKey, JSON.stringify({ subjects })); }
    catch { /* The plan save surfaces storage failures when a schedule is created. */ }
  }, [subjects]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const time = Date.now(); setNow(time);
      setPlan(current => current?.timer?.deadline && time >= current.timer.deadline ? finishTimer(current) : current);
    };
    const interval = setInterval(tick, 250);
    window.addEventListener('focus', tick); document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(interval); window.removeEventListener('focus', tick); document.removeEventListener('visibilitychange', tick); };
  }, [running]);

  useEffect(() => {
    document.title = timer ? `${format(seconds)} · ${timer.kind === 'rest' ? 'Nghỉ ngắn' : 'Đang học'} — Nhịp học` : 'Nhịp học — Học theo tín chỉ';
  }, [timer, seconds]);

  const done = new Set(plan?.done || []);
  const upcoming = plan?.sessions.find(s => s.id === plan.selected && !done.has(s.id)) || plan?.sessions.find(s => !done.has(s.id));
  const currentSession = timer ? plan.sessions.find(s => s.id === timer.sessionId) : upcoming;
  const total = plan?.sessions.reduce((sum, s) => sum + s.minutes, 0) || 0;
  const learned = plan?.sessions.reduce((sum, s) => sum + (done.has(s.id) ? s.minutes : 0), 0) || 0;
  const restTotal = plan?.sessions.reduce((sum, s) => sum + s.rest, 0) || 0;
  const remainingCount = plan?.sessions.filter(s => !done.has(s.id)).length || 0;

  function toggleTimer() {
    const time = Date.now(); setNow(time);
    setPlan(p => {
      if (p.timer) {
        const remaining = timerRemaining(p.timer, time);
        if (remaining === 0) return finishTimer(p);
        return { ...p, timer: { ...p.timer, remaining, deadline: p.timer.deadline ? null : time + remaining * 1000 } };
      }
      if (!upcoming) return p;
      return { ...p, timer: { kind: 'work', sessionId: upcoming.id, remaining: upcoming.minutes * 60, deadline: time + upcoming.minutes * 60000 } };
    });
  }

  function addSubject(event) {
    event.preventDefault();
    if (!name.trim()) { setError('Nhập tên môn học.'); nameInput.current?.focus(); return; }
    setSubjects(s => [...s, { id: crypto.randomUUID(), subject: name.trim(), credits: Number(credits) }]);
    setName(''); setError(''); nameInput.current?.focus();
  }

  function generate(event) {
    event.preventDefault();
    if (plan?.timer) { setError('Kết thúc hoặc dừng phiên hiện tại trước khi đổi lịch.'); return; }
    if (subjects.some(s => !s.subject.trim())) { setError('Mỗi môn cần có tên.'); return; }
    if (plan?.done.length && !window.confirm('Tạo lịch mới và đặt lại tiến độ? Tải bản sao trước nếu muốn giữ lịch hiện tại.')) return;
    try {
      const next = createCreditPlan(subjects, config, crypto.randomUUID());
      setPlan(next); setEditing(false); setDay(0); setError('');
    } catch (e) { setError(e.message); }
  }

  function exportPlan() {
    const snapshot = { ...plan, timer: plan.timer ? { ...plan.timer, remaining: timerRemaining(plan.timer, Date.now()), deadline: null } : null };
    const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'nhip-hoc.json'; a.click(); URL.revokeObjectURL(url);
  }

  async function importPlan(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 1000000) throw new Error('Bản sao quá lớn.');
      const value = JSON.parse(await file.text());
      if (!isValidPlan(value)) throw new Error('Bản sao không hợp lệ.');
      if (plan && !window.confirm('Thay lịch hiện tại bằng bản sao này?')) return;
      const restored = { ...value, timer: value.timer ? { ...value.timer, deadline: null } : null };
      setPlan(restored); setSubjects(restored.subjects); setConfig(restored.config); setDay(0); setEditing(false); setError('');
    } catch (e) { setError(e.message || 'Không đọc được bản sao.'); }
  }

  return <div className="study-app">
    <header className="study-header"><a href="#main" className="study-brand">nhịp học<span>Mỗi lần một môn.</span></a>
      {plan && <button className="quiet" onClick={() => { setSubjects(plan.subjects); setConfig(plan.config); setEditing(!editing); setError(''); }}>{editing ? '← Về lịch học' : 'Môn & thời gian'}</button>}
    </header>
    <main id="main">
      {storageError && <p role="alert" className="study-error">{storageError}</p>}
      {error && <p role="alert" className="study-error">{error}</p>}
      {editing ? <section className="setup">
        <div className="eyebrow">THIẾT LẬP NHỊP HỌC</div><h1>Để việc chia giờ<br />nhẹ đầu hơn.</h1>
        <p className="intro">Thêm môn và tín chỉ. Chọn thời gian rảnh. Lịch học sẽ chia thành từng phiên, không cần deadline.</p>
        <section className="setup-section"><h2>01 / Môn đang học</h2>
          {!subjects.length && <p className="muted">Bắt đầu với các môn m muốn dành thời gian trong tuần.</p>}
          {subjects.map(s => <div className="subject-editor" key={s.id}>
            <input aria-label={`Tên môn ${s.subject}`} maxLength={100} value={s.subject} onChange={e => setSubjects(list => list.map(item => item.id === s.id ? { ...item, subject: e.target.value } : item))} />
            <label><select aria-label={`Tín chỉ ${s.subject}`} value={s.credits} onChange={e => setSubjects(list => list.map(item => item.id === s.id ? { ...item, credits: Number(e.target.value) } : item))}>{Array.from({ length: 20 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select><span>tín chỉ</span></label>
            <button className="quiet" aria-label={`Bỏ môn ${s.subject} khỏi lịch mới`} onClick={() => setSubjects(list => list.filter(item => item.id !== s.id))}>×</button>
          </div>)}
          <form className="add-subject" onSubmit={addSubject}>
            <input ref={nameInput} aria-label="Tên môn mới" placeholder="Tên môn, ví dụ: Giải tích" value={name} maxLength={100} onChange={e => setName(e.target.value)} required />
            <select aria-label="Tín chỉ môn mới" value={credits} onChange={e => setCredits(e.target.value)}>{Array.from({ length: 20 }, (_, i) => <option key={i} value={i + 1}>{i + 1} tín chỉ</option>)}</select>
            <button type="submit" className="secondary">+ Thêm</button>
          </form>
        </section>
        <form onSubmit={generate} className="setup-section"><h2>02 / Thời gian của m</h2>
          <div className="settings-grid">
            <label>Buổi mỗi tuần<select value={config.days} onChange={e => setConfig(c => ({ ...c, days: Number(e.target.value) }))}>{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} buổi</option>)}</select></label>
            <label>Phút mỗi buổi, gồm nghỉ<input type="number" min="15" max="480" required value={config.minutes} onChange={e => setConfig(c => ({ ...c, minutes: e.target.value === '' ? '' : Number(e.target.value) }))} /></label>
            <label>Mỗi phiên tập trung<select value={config.session} onChange={e => setConfig(c => ({ ...c, session: Number(e.target.value) }))}>{[25,30,45,50].map(n => <option key={n} value={n}>{n} phút</option>)}</select></label>
          </div>
          <p className="muted">Nghỉ 5 phút giữa các phiên. Tín chỉ quyết định tỷ lệ giờ học; thời lượng được làm tròn theo phiên. Buổi chưa học vẫn ở đó để học tiếp.</p>
          <button className="primary" disabled={!subjects.length || Boolean(timer)}>{plan ? 'Tạo lại lịch học' : 'Chia lịch cho mình →'}</button>
          {timer && <p className="muted">Về lịch học để kết thúc hoặc dừng phiên trước khi tạo lại lịch.</p>}
        </form>
        <div className="backup-actions">{plan && <button className="quiet" onClick={exportPlan}>Tải bản sao</button>}<button className="quiet" onClick={() => importInput.current?.click()} disabled={Boolean(timer)}>Khôi phục bản sao</button><input ref={importInput} type="file" accept="application/json,.json" hidden onChange={importPlan} /></div>
      </section> : <>
        <section className="focus-panel" aria-labelledby="focus-title">
          <div className="eyebrow">{timer?.kind === 'rest' ? 'ĐÃ XONG MỘT PHIÊN' : remainingCount ? 'VIỆC TIẾP THEO' : 'HOÀN THÀNH LỊCH HỌC'}</div>
          <h1 id="focus-title">{timer?.kind === 'rest' ? 'Nghỉ một chút nhé.' : currentSession?.subject || 'Tuần này, làm tốt rồi.'}</h1>
          <p className="intro">{timer?.kind === 'rest' ? 'Rời màn hình, uống nước. Bắt đầu giờ nghỉ khi sẵn sàng.' : currentSession ? `${currentSession.minutes} phút tập trung · Buổi ${currentSession.day + 1}. Chọn một phần nhỏ của môn này để học.` : 'M có thể tạo lịch mới khi sẵn sàng cho vòng tiếp theo.'}</p>
          {(timer || upcoming) && <><div className="study-clock" aria-label={`${timer ? seconds : upcoming.minutes * 60} giây còn lại`}>{format(timer ? seconds : upcoming.minutes * 60)}</div>
            <div className="focus-actions"><button className="primary" onClick={toggleTimer}>{running ? 'Tạm dừng' : timer?.kind === 'rest' ? 'Bắt đầu / tiếp tục nghỉ' : timer ? 'Tiếp tục' : 'Bắt đầu học →'}</button>
              {timer ? <button className="quiet" onClick={() => {
                if (timer.kind === 'rest' || window.confirm('Dừng phiên này? Phiên chưa hoàn thành sẽ vẫn nằm trong lịch.')) setPlan(p => ({ ...p, timer: null }));
              }}>{timer.kind === 'rest' ? 'Bỏ qua nghỉ' : 'Dừng phiên'}</button> : <button className="quiet" onClick={() => {
                const open = plan.sessions.filter(s => !done.has(s.id)); const index = open.findIndex(s => s.id === upcoming.id);
                setPlan(p => ({ ...p, selected: open[(index + 1) % open.length].id }));
              }} disabled={remainingCount < 2}>Đổi môn / phiên</button>}
            </div></>}
          {!timer && !upcoming && <button className="primary" onClick={() => { setSubjects(plan.subjects); setConfig(plan.config); setEditing(true); }}>Lên lịch vòng tiếp theo →</button>}
          <p className="timer-status" role="status">{timer ? running ? 'Đồng hồ đang chạy · tự lưu khi rời trang' : 'Đang tạm dừng' : remainingCount ? 'Hết phiên mới chuyển môn. Không cần học hết mọi môn trong một buổi.' : `${learned} phút học đã hoàn thành.`}</p>
        </section>
        <section className="schedule-section"><div className="section-heading"><h2>Lịch của m</h2><span>{learned} / {total} phút học</span></div>
          <progress max={total || 1} value={learned} aria-label="Tiến độ học" />
          <p className="muted allocation-note">{total} phút học + {restTotal} phút nghỉ / {plan.config.days * plan.config.minutes} phút đã dành. Phút dư để chuyển tiếp.</p>
          {plan.subjects.some(s => !plan.sessions.some(item => item.subjectId === s.id)) && <p className="study-error" role="status">Quỹ thời gian chưa đủ chia lượt cho tất cả môn. Vào Môn & thời gian để tăng số buổi hoặc giảm thời lượng phiên.</p>}
          <div className="day-buttons" aria-label="Chọn buổi học">{Array.from({ length: plan.config.days }, (_, i) => <button key={i} aria-pressed={day === i} onClick={() => setDay(i)}>Buổi {i + 1}{plan.sessions.filter(s => s.day === i).every(s => done.has(s.id)) ? ' ✓' : ''}</button>)}</div>
          <ol className="session-list">{plan.sessions.filter(s => s.day === day).map((s, i) => <li key={s.id} className={done.has(s.id) ? 'completed' : ''}>
            <span className="session-number">{done.has(s.id) ? '✓' : String(i + 1).padStart(2, '0')}</span><div><strong>{s.subject}</strong><small>{s.minutes} phút{s.rest ? ` · sau đó nghỉ ${s.rest} phút` : ''}</small></div>
            <button className="quiet" disabled={Boolean(timer) || done.has(s.id)} onClick={() => { setPlan(p => ({ ...p, selected: s.id })); document.getElementById('focus-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>{done.has(s.id) ? 'Đã học' : upcoming?.id === s.id ? 'Tiếp theo' : 'Chọn'}</button>
          </li>)}</ol>
        </section>
        <details className="allocation"><summary>Chia thời gian theo tín chỉ</summary>{plan.subjects.map(s => {
          const amount = plan.sessions.filter(item => item.subjectId === s.id).reduce((sum, item) => sum + item.minutes, 0);
          return <div key={s.id}><span>{s.subject} <small>· {s.credits} tín chỉ</small></span><strong>{amount} phút</strong></div>;
        })}<p className="muted">Tỷ lệ được làm tròn theo phiên, không phải số phút bắt buộc. Môn chưa có lượt: tăng quỹ giờ hoặc giảm thời lượng phiên.</p></details>
      </>}
    </main><footer>Lưu trên thiết bị này · Không cần deadline</footer>
  </div>;
}
