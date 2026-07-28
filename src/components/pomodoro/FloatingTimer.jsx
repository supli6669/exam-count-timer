import { memo } from 'react';

const formatTime = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function FloatingTimer({
  timeLeft,
  isActive,
  modeLabel,
  modeColor,
  timerType,
  onStartPause,
  onReset,
  onClose
}) {
  return (
    <>
      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        html, body, #mini-timer-root { width: 100%; height: 100%; margin: 0; }
        body {
          overflow: hidden;
          background:
            radial-gradient(circle at 20% 0%, color-mix(in srgb, ${modeColor} 28%, transparent), transparent 48%),
            linear-gradient(145deg, #0f1222, #080a12);
          color: #fff;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        button {
          border: 0;
          color: inherit;
          font: inherit;
          cursor: pointer;
          transition: transform 120ms ease, background 120ms ease, opacity 120ms ease;
        }
        button:hover { transform: translateY(-1px); }
        button:active { transform: scale(.97); }
      `}</style>
      <main
        aria-label="Đồng hồ mini"
        style={{
          height: '100%',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          gap: '8px',
          padding: '14px 16px 16px'
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span
              aria-hidden="true"
              style={{
                width: '9px',
                height: '9px',
                flex: '0 0 auto',
                borderRadius: '50%',
                background: isActive ? modeColor : '#94a3b8',
                boxShadow: isActive ? `0 0 12px ${modeColor}` : 'none'
              }}
            />
            <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
              {modeLabel}
            </strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng đồng hồ mini"
            title="Đóng đồng hồ mini"
            style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'rgba(255,255,255,.09)' }}
          >
            ×
          </button>
        </header>

        <section style={{ display: 'grid', placeItems: 'center', minHeight: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div
              aria-live="off"
              style={{
                fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
                fontSize: 'clamp(38px, 18vw, 62px)',
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-3px',
                fontVariantNumeric: 'tabular-nums',
                textShadow: `0 0 24px color-mix(in srgb, ${modeColor} 48%, transparent)`
              }}
            >
              {formatTime(timeLeft)}
            </div>
            <div style={{ marginTop: '8px', color: '#aeb7ca', fontSize: '12px' }}>
              {isActive ? 'Đang chạy theo thời gian thực' : 'Đang tạm dừng'}
            </div>
          </div>
        </section>

        <footer style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={onStartPause}
            style={{
              minWidth: '128px',
              padding: '9px 16px',
              borderRadius: '10px',
              background: isActive ? '#e74c64' : modeColor,
              fontWeight: 750,
              boxShadow: `0 6px 18px color-mix(in srgb, ${isActive ? '#e74c64' : modeColor} 25%, transparent)`
            }}
          >
            {isActive ? 'Tạm dừng' : timerType === 'stopwatch' && timeLeft > 0 ? 'Tiếp tục' : 'Bắt đầu'}
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Đặt lại đồng hồ"
            title="Đặt lại"
            style={{ width: '40px', borderRadius: '10px', background: 'rgba(255,255,255,.09)', fontSize: '18px' }}
          >
            ↻
          </button>
        </footer>
      </main>
    </>
  );
}

export default memo(FloatingTimer);
