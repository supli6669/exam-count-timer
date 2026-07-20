import { memo, useRef } from 'react';

const ART_THEMES = [
  { id: 'cyberpunk', name: 'Cyberpunk Alley', emoji: '🏙️', desc: 'Mưa neon rực rỡ & giọt nước hạt né tránh chuột' },
  { id: 'sakura', name: 'Sakura Library', emoji: '🌸', desc: 'Hoa đào rơi thơ mộng & né tránh con trỏ chuột' },
  { id: 'lofi', name: 'Lofi Cafe', emoji: '☕', desc: 'Bụi nắng ấm cúng & xoáy hạt theo thao tác chuột' },
  { id: 'space', name: 'Space Odyssey', emoji: '🌌', desc: 'Vũ trụ huyền ảo & dải ngân hà tương tác lấp lánh' },
  { id: 'nature', name: 'Nature Cabin', emoji: '🌲', desc: 'Tàn lửa bập bùng & không khí rừng nguyên sinh' },
];

function ThemeSelector({ theme, setTheme, customBg, onCustomThemeUpload, onRemoveCustomBg }) {
  const fileInputRef = useRef(null);

  return (
    <div className="theme-selector-section" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🎨 Chọn Không Gian Nghệ Thuật (Art Themes)
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {ART_THEMES.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0.75rem 0.5rem',
              borderRadius: '12px',
              background: theme === t.id ? 'rgba(255, 255, 255, 0.12)' : 'var(--bg-glass)',
              border: theme === t.id ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{t.emoji}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Custom Theme Background Upload */}
      <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>🖼️ Hình nền & Theme Tùy chỉnh</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Tải ảnh riêng & tự động trích xuất bảng màu nghệ thuật</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                color: '#fff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Tải ảnh lên
            </button>
            {customBg && (
              <button
                type="button"
                onClick={onRemoveCustomBg}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Xóa ảnh
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onCustomThemeUpload}
        />
      </div>
    </div>
  );
}

export default memo(ThemeSelector);
