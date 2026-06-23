import { useState, useEffect } from 'react';

const PRESETS = [
  {
    id: 'lofi',
    name: 'Lofi Study',
    emoji: '☕',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0',
    color: 'linear-gradient(135deg, #ff7e5f, #feb47b)'
  },
  {
    id: 'classical',
    name: 'Classical Focus',
    emoji: '🎻',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Ueb2mjuCm1?utm_source=generator&theme=0',
    color: 'linear-gradient(135deg, #2b5876, #4e4376)'
  },
  {
    id: 'ambient',
    name: 'Deep Focus',
    emoji: '🌌',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKFBeeJ71J?utm_source=generator&theme=0',
    color: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'
  },
  {
    id: 'nature',
    name: 'Nature Sounds',
    emoji: '🌧️',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    color: 'linear-gradient(135deg, #11998e, #38ef7d)'
  }
];

function SpotifyPlayer() {
  const [currentUrl, setCurrentUrl] = useState(() => {
    const saved = localStorage.getItem('pomodoro_spotify_url');
    return saved || PRESETS[0].url;
  });

  const [customInput, setCustomInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('pomodoro_spotify_url', currentUrl);
  }, [currentUrl]);

  const parseSpotifyUrl = (url) => {
    if (!url) return '';
    const trimmed = url.trim();

    // If it's already an iframe or direct embed url
    if (trimmed.includes('spotify.com/embed/')) {
      return trimmed;
    }

    const playlistRegex = /spotify\.com\/playlist\/([a-zA-Z0-9]+)/;
    const albumRegex = /spotify\.com\/album\/([a-zA-Z0-9]+)/;
    const trackRegex = /spotify\.com\/track\/([a-zA-Z0-9]+)/;

    let match = trimmed.match(playlistRegex);
    if (match) {
      return `https://open.spotify.com/embed/playlist/${match[1]}?utm_source=generator&theme=0`;
    }

    match = trimmed.match(albumRegex);
    if (match) {
      return `https://open.spotify.com/embed/album/${match[1]}?utm_source=generator&theme=0`;
    }

    match = trimmed.match(trackRegex);
    if (match) {
      return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator&theme=0`;
    }

    return '';
  };

  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    setError('');

    if (!customInput) {
      setError('Vui lòng nhập đường dẫn Spotify.');
      return;
    }

    const embedUrl = parseSpotifyUrl(customInput);
    if (embedUrl) {
      setCurrentUrl(embedUrl);
      setCustomInput('');
    } else {
      setError('Đường dẫn không hợp lệ. Vui lòng nhập link Playlist, Album hoặc Track từ Spotify.');
    }
  };

  // Find if current url matches any preset
  const activePresetId = PRESETS.find(preset => preset.url.includes(currentUrl.split('?')[0]))?.id || 'custom';

  return (
    <div className="spotify-player-container">
      <div className="spotify-player-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🎵</span>
          <span className="spotify-player-title">Nhạc Tập Trung (Spotify)</span>
        </div>
        <button 
          className="btn-collapse" 
          aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
          type="button"
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            style={{ 
              width: '16px', 
              height: '16px', 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="spotify-player-content">
          {/* Preset Buttons Grid */}
          <div className="spotify-presets-grid">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`spotify-preset-btn ${activePresetId === preset.id ? 'active' : ''}`}
                style={{ '--preset-glow-color': preset.id === 'lofi' ? 'rgba(255, 126, 95, 0.4)' : preset.id === 'classical' ? 'rgba(78, 67, 118, 0.4)' : preset.id === 'ambient' ? 'rgba(44, 83, 100, 0.4)' : 'rgba(56, 239, 125, 0.4)' }}
                onClick={() => {
                  setError('');
                  setCurrentUrl(preset.url);
                }}
              >
                <span className="preset-emoji">{preset.emoji}</span>
                <span className="preset-name">{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Embedded Spotify IFrame */}
          <div className="spotify-iframe-wrapper">
            <iframe
              className="spotify-iframe"
              src={currentUrl}
              width="100%"
              height="80"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify Focus Player"
            ></iframe>
          </div>

          {/* Custom Link Form */}
          <form className="spotify-custom-form" onSubmit={handleApplyCustomUrl}>
            <div className="spotify-input-group">
              <input
                type="text"
                placeholder="Dán link Spotify (Playlist, Album, Bài hát)..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="spotify-input"
                aria-label="Đường dẫn Spotify tùy chỉnh"
              />
              <button type="submit" className="btn btn-primary spotify-apply-btn">
                Áp dụng
              </button>
            </div>
            {error && <div className="spotify-error-msg">{error}</div>}
          </form>
        </div>
      )}
    </div>
  );
}

export default SpotifyPlayer;
