import { memo } from 'react';

function TimerDisplay({ timerType, mode, onSwitchModeAndType, timeLeft, isActive, handleStartPause, handleReset, handleSkip, onOpenMiniTimer, isMiniTimerOpen, getModeLabel, getTotalSeconds }) {
  const total = getTotalSeconds();
  const progress = total > 0 ? Math.min(100, Math.max(0, (total - timeLeft) / total * 100)) : 0;
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  return <section className="pomodoro-timer-section" aria-label="Đồng hồ học">
    <div className="timer-mode-row">
      <label className="timer-type-label">Kiểu đồng hồ
        <select value={timerType} onChange={event => onSwitchModeAndType('work', event.target.value)}>
          <option value="pomodoro">Pomodoro</option><option value="stopwatch">Bấm giờ</option><option value="animedoro">Animedoro · 50/20</option>
        </select>
      </label>
      {timerType !== 'stopwatch' && <div className="timer-mode-buttons">
        {[['work', 'Tập trung'], ['shortBreak', 'Nghỉ ngắn'], ...(timerType === 'pomodoro' ? [['longBreak', 'Nghỉ dài']] : [])].map(([id, label]) =>
          <button className={`mode-btn ${mode === id ? 'active' : ''}`} key={id} aria-pressed={mode === id} onClick={() => onSwitchModeAndType(id, timerType)}>{label}</button>
        )}
      </div>}
    </div>
    <p className="timer-mode-label">{getModeLabel()}</p>
    <div className="timer-digits" role="timer" aria-label={`${minutes} phút ${seconds} giây`}>{minutes}<span>:</span>{seconds}</div>
    {timerType !== 'stopwatch' && <div className="timer-progress" aria-hidden="true"><div style={{ transform: `scaleX(${progress / 100})` }} /></div>}
    <div className="timer-main-actions">
      <button className="btn btn-primary timer-start" onClick={handleStartPause}>{isActive ? 'Ⅱ  Tạm dừng' : '▷  Bắt đầu'}</button>
      <button className="btn btn-secondary" onClick={handleReset}>Đặt lại</button>
    </div>
    <div className="timer-extra-actions">
      <button onClick={onOpenMiniTimer}>{isMiniTimerOpen ? 'Xem đồng hồ mini ↗' : 'Mở đồng hồ mini ↗'}</button>
      {timerType !== 'stopwatch' && <button onClick={handleSkip}>Chuyển phiên →</button>}
    </div>
  </section>;
}
export default memo(TimerDisplay);
