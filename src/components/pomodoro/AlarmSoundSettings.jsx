import { memo } from 'react';
import { ALARM_SOUND_OPTIONS, getAlarmSoundDesc, getVolumeLevelLabel } from './audioSynthesizer';

function AlarmSoundSettings({
  inputWork,
  setInputWork,
  inputShort,
  setInputShort,
  inputLong,
  setInputLong,
  inputAlarmVolume,
  setInputAlarmVolume,
  inputAlarmSound,
  setInputAlarmSound,
  handleSaveSettings,
  playPreviewAlarmSound
}) {
  return (
    <div className="alarm-settings-section" style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--bg-glass)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        ⚙️ Đặt Lại Thời Gian & Chuông Báo
      </h3>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Time Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>🎯 Tập trung (phút)</label>
            <input
              type="number"
              min="1"
              max="120"
              value={inputWork}
              onChange={(e) => setInputWork(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>☕ Nghỉ ngắn (phút)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={inputShort}
              onChange={(e) => setInputShort(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>🌴 Nghỉ dài (phút)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={inputLong}
              onChange={(e) => setInputLong(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: '#fff' }}
            />
          </div>
        </div>

        {/* Alarm sound selection */}
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.4rem' }}>
            🔔 Kiểu Chuông Báo (Web Audio Synthesizer)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto', paddingRight: '0.2rem' }}>
            {ALARM_SOUND_OPTIONS.map(snd => (
              <button
                key={snd.id}
                type="button"
                onClick={() => { setInputAlarmSound(snd.id); playPreviewAlarmSound(snd.id); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  background: inputAlarmSound === snd.id ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  border: inputAlarmSound === snd.id ? '1px solid #8b5cf6' : '1px solid transparent',
                  color: '#fff',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>{snd.emoji}</span>
                <span style={{ fontWeight: inputAlarmSound === snd.id ? 700 : 400 }}>{snd.name}</span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontStyle: 'italic' }}>
            {getAlarmSoundDesc(inputAlarmSound)}
          </p>
        </div>

        {/* Alarm Volume Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#fff', marginBottom: '0.3rem' }}>
            <span>🔊 Âm Lượng Chuông Báo:</span>
            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{getVolumeLevelLabel(parseInt(inputAlarmVolume, 10) || 0)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={inputAlarmVolume}
            onChange={(e) => { setInputAlarmVolume(e.target.value); playPreviewAlarmSound(); }}
            style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, alignSelf: 'flex-start' }}
        >
          💾 Lưu Thiết Lập
        </button>
      </form>
    </div>
  );
}

export default memo(AlarmSoundSettings);
