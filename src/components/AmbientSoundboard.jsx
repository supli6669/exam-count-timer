import { useState, useEffect, useRef } from 'react';

const SOUNDS = [
  {
    id: 'rain',
    name: 'Mưa rơi',
    emoji: '🌧️',
    url: 'https://www.soundjay.com/nature/sounds/rain-07.mp3'
  },
  {
    id: 'forest',
    name: 'Gió rừng',
    emoji: '🌲',
    url: 'https://www.soundjay.com/nature/sounds/forest-wind-01.mp3'
  },
  {
    id: 'ocean',
    name: 'Sóng biển',
    emoji: '🌊',
    url: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3'
  },
  {
    id: 'fire',
    name: 'Lửa trại',
    emoji: '🔥',
    url: 'https://www.soundjay.com/nature/sounds/fire-1.mp3'
  },
  {
    id: 'stream',
    name: 'Suối chảy',
    emoji: '💧',
    url: 'https://www.soundjay.com/nature/sounds/river-1.mp3'
  }
];

function AmbientSoundboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [soundMix, setSoundMix] = useState(() => {
    const saved = localStorage.getItem('pomodoro_ambient_mix');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing ambient mix:', e);
      }
    }
    // Default configuration: all muted, volume 0.5
    const initial = {};
    SOUNDS.forEach((s) => {
      initial[s.id] = { playing: false, volume: 0.5 };
    });
    return initial;
  });

  const audioInstances = useRef({});

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro_ambient_mix', JSON.stringify(soundMix));
  }, [soundMix]);

  // Handle audio instantiation, playing/pausing and volume changes
  useEffect(() => {
    SOUNDS.forEach((sound) => {
      const config = soundMix[sound.id] || { playing: false, volume: 0.5 };
      let audio = audioInstances.current[sound.id];

      if (config.playing) {
        // Create audio instance if it doesn't exist
        if (!audio) {
          audio = new Audio(sound.url);
          audio.loop = true;
          audioInstances.current[sound.id] = audio;
        }
        
        // Update volume
        audio.volume = config.volume;

        // Play audio safely
        if (audio.paused) {
          audio.play().catch((err) => {
            console.warn(`Autoplay blocked for sound: ${sound.name}`, err);
            // If play fails, revert playing state to false to keep UI in sync
            setSoundMix(prev => ({
              ...prev,
              [sound.id]: { ...prev[sound.id], playing: false }
            }));
          });
        }
      } else {
        // Pause audio if it exists and is playing
        if (audio && !audio.paused) {
          audio.pause();
        }
      }
    });

    // Clean up function on component unmount: stop all playing sounds
    return () => {
      Object.keys(audioInstances.current).forEach((key) => {
        const audio = audioInstances.current[key];
        if (audio) {
          audio.pause();
        }
      });
    };
  }, [soundMix]);

  const handleToggleSound = (soundId) => {
    setSoundMix((prev) => {
      const current = prev[soundId] || { playing: false, volume: 0.5 };
      return {
        ...prev,
        [soundId]: {
          ...current,
          playing: !current.playing
        }
      };
    });
  };

  const handleVolumeChange = (soundId, volumeVal) => {
    const vol = parseFloat(volumeVal);
    setSoundMix((prev) => {
      const current = prev[soundId] || { playing: false, volume: 0.5 };
      
      // Update running audio element volume immediately if it exists
      if (audioInstances.current[soundId]) {
        audioInstances.current[soundId].volume = vol;
      }

      return {
        ...prev,
        [soundId]: {
          ...current,
          volume: vol
        }
      };
    });
  };

  // Mute all sounds helper
  const handleMuteAll = () => {
    setSoundMix((prev) => {
      const updated = {};
      Object.keys(prev).forEach((key) => {
        updated[key] = {
          ...prev[key],
          playing: false
        };
      });
      return updated;
    });
  };

  const isAnyPlaying = Object.values(soundMix).some(s => s.playing);

  return (
    <div className="soundboard-container">
      <div className="soundboard-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🎧</span>
          <span className="soundboard-title">Âm Thanh Môi Trường</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isAnyPlaying && (
            <button 
              type="button" 
              className="soundboard-mute-all-btn" 
              onClick={(e) => {
                e.stopPropagation();
                handleMuteAll();
              }}
              title="Tắt tất cả âm thanh"
            >
              Mute All
            </button>
          )}
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
      </div>

      {isOpen && (
        <div className="soundboard-content">
          <div className="soundboard-grid">
            {SOUNDS.map((sound) => {
              const config = soundMix[sound.id] || { playing: false, volume: 0.5 };
              return (
                <div key={sound.id} className={`sound-row ${config.playing ? 'active' : ''}`}>
                  <button
                    type="button"
                    className={`sound-btn ${config.playing ? 'playing' : ''}`}
                    onClick={() => handleToggleSound(sound.id)}
                    title={config.playing ? `Tạm dừng ${sound.name}` : `Phát ${sound.name}`}
                  >
                    <span className="sound-emoji">{sound.emoji}</span>
                    <span className="sound-name">{sound.name}</span>
                  </button>
                  <div className="sound-volume-slider-container">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="volume-icon">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      {config.volume > 0 ? (
                        config.volume > 0.5 ? (
                          <>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          </>
                        ) : (
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        )
                      ) : null}
                    </svg>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={config.volume}
                      onChange={(e) => handleVolumeChange(sound.id, e.target.value)}
                      className="sound-volume-slider"
                      disabled={!config.playing}
                      aria-label={`Âm lượng ${sound.name}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AmbientSoundboard;
