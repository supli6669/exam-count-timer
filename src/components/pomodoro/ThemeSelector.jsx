import { memo, useRef } from 'react';

const SCENES = [
  { id: 'calm', name: 'Nền đơn giản', color: '#a0aaa4' },
  { id: 'cyberpunk', name: 'Xanh chàm', color: '#6c7fbc' },
  { id: 'sakura', name: 'Hồng hoa đào', color: '#c58797' },
  { id: 'lofi', name: 'Nâu cà phê', color: '#ab855f' },
  { id: 'space', name: 'Tím đêm', color: '#9987be' },
  { id: 'nature', name: 'Xanh rừng', color: '#729d83' },
];

function ThemeSelector({ theme, setTheme, customBg, onCustomThemeUpload, onRemoveCustomBg }) {
  const fileInput = useRef(null);
  return <section className="theme-selector-section">
    <h3>Màu nền phiên học</h3>
    <div className="scene-presets">
      {SCENES.map(scene => <button key={scene.id} className="scene-choice" aria-pressed={theme === scene.id} onClick={() => setTheme(scene.id)}>
        <span className="scene-swatch" style={{ background: scene.color }} aria-hidden="true" />{scene.name}
      </button>)}
      {customBg && <button className="scene-choice" aria-pressed={theme === 'custom'} onClick={() => setTheme('custom')}>Ảnh của bạn</button>}
    </div>
    <div className="custom-scene">
      <div><strong>Ảnh của bạn</strong><p className="simple-description">Dùng ảnh tĩnh làm nền cho phiên học.</p></div>
      <div><button className="btn btn-secondary" onClick={() => fileInput.current?.click()}>Tải ảnh lên</button>
        {customBg && <button className="btn btn-secondary" onClick={onRemoveCustomBg}>Xóa ảnh</button>}</div>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={onCustomThemeUpload} aria-label="Chọn ảnh nền" />
    </div>
  </section>;
}
export default memo(ThemeSelector);
