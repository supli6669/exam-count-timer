import { memo } from 'react';

function TimerDisplay({
  timerType,
  mode,
  onModeChange,
  onTimerTypeChange,
  timeLeft,
  isActive,
  handleStartPause,
  handleReset,
  handleSkip,
  completedWorkSessions,
  getModeColor,
  getModeLabel,
  getTotalSeconds
}) {
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSecs = getTotalSeconds();
  const progressPercent = totalSecs > 0 ? ((totalSecs - timeLeft) / totalSecs) * 100 : 0;
  const strokeDashoffset = 879.64 - (879.64 * (timerType === 'stopwatch' ? 100 : progressPercent)) / 100;

  return (
    <div className="pomodoro-timer-section" style={{ textAlign: 'center', margin: '0.5rem 0 1rem 0' }}>
      {/* Mode Selector Header */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`mode-btn ${timerType === 'pomodoro' && mode === 'work' ? 'active' : ''}`}
          onClick={() => { onTimerTypeChange('pomodoro'); onModeChange('work'); }}
          style={{ borderColor: timerType === 'pomodoro' && mode === 'work' ? getModeColor() : 'transparent' }}
        >
          🎯 Tập trung
        </button>
        <button
          type="button"
          className={`mode-btn ${timerType === 'pomodoro' && mode === 'shortBreak' ? 'active' : ''}`}
          onClick={() => { onTimerTypeChange('pomodoro'); onModeChange('shortBreak'); }}
          style={{ borderColor: timerType === 'pomodoro' && mode === 'shortBreak' ? getModeColor() : 'transparent' }}
        >
          ☕ Nghỉ ngắn
        </button>
        <button
          type="button"
          className={`mode-btn ${timerType === 'pomodoro' && mode === 'longBreak' ? 'active' : ''}`}
          onClick={() => { onTimerTypeChange('pomodoro'); onModeChange('longBreak'); }}
          style={{ borderColor: timerType === 'pomodoro' && mode === 'longBreak' ? getModeColor() : 'transparent' }}
        >
          🌴 Nghỉ dài
        </button>
        <button
          type="button"
          className={`mode-btn ${timerType === 'stopwatch' ? 'active' : ''}`}
          onClick={() => { onTimerTypeChange('stopwatch'); }}
          style={{ borderColor: timerType === 'stopwatch' ? '#10b981' : 'transparent' }}
        >
          ⏱️ Bấm giờ
        </button>
      </div>

      {/* SVG Radial Clock Display */}
      <div className="radial-timer-container" style={{ position: 'relative', width: '240px', height: '240px', margin: '0 auto 1.25rem' }}>
        <svg width="240" height="240" viewBox="0 0 300 300" style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 12px ${getModeColor()}55)` }}>
          <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="12" />
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke={getModeColor()}
            strokeWidth="12"
            strokeDasharray="879.64"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
        </svg>

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: getModeColor(), letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            {getModeLabel()}
          </span>
          <span style={{ fontSize: '3.2rem', fontWeight: 800, letterSpacing: '-1px', color: '#fff', textShadow: '0 0 20px rgba(0,0,0,0.5)', fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </span>
          {timerType === 'pomodoro' && (
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.2rem' }}>
              Chu kỳ: {completedWorkSessions}/4 🍅
            </span>
          )}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleStartPause}
          className="btn btn-primary"
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1.05rem',
            fontWeight: 700,
            borderRadius: '12px',
            background: isActive ? 'linear-gradient(135deg, #ef4444, #f43f5e)' : `linear-gradient(135deg, ${getModeColor()}, #8b5cf6)`,
            boxShadow: `0 4px 20px ${getModeColor()}44`,
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isActive ? '⏸️ Tạm dừng' : '▶️ Bắt đầu'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="btn-icon"
          title="Đặt lại đồng hồ"
          aria-label="Đặt lại đồng hồ"
          style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', width: '44px', height: '44px' }}
        >
          🔄
        </button>
        {timerType === 'pomodoro' && (
          <button
            type="button"
            onClick={handleSkip}
            className="btn-icon"
            title="Bỏ qua phiên hiện tại"
            aria-label="Bỏ qua phiên hiện tại"
            style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', width: '44px', height: '44px' }}
          >
            ⏭️
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(TimerDisplay);
