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

const SYNTH_SOUNDS = [
  {
    id: 'alpha',
    name: 'Sóng Alpha',
    subName: '10Hz',
    emoji: '🧘',
    type: 'binaural',
    baseFreq: 150,
    beatFreq: 10,
    desc: 'Thư giãn sâu, ghi nhớ & siêu học tập'
  },
  {
    id: 'beta',
    name: 'Sóng Beta',
    subName: '16Hz',
    emoji: '⚡',
    type: 'binaural',
    baseFreq: 150,
    beatFreq: 16,
    desc: 'Tập trung cao độ & phân tích logic'
  },
  {
    id: 'theta',
    name: 'Sóng Theta',
    subName: '6Hz',
    emoji: '🌙',
    type: 'binaural',
    baseFreq: 150,
    beatFreq: 6,
    desc: 'Thiền định & kích hoạt sáng tạo'
  },
  {
    id: 'white',
    name: 'Tiếng ồn trắng',
    subName: 'White',
    emoji: '💨',
    type: 'noise',
    desc: 'Triệt tiêu mọi tạp âm xung quanh'
  },
  {
    id: 'pink',
    name: 'Tiếng ồn hồng',
    subName: 'Pink',
    emoji: '🍃',
    type: 'noise',
    desc: 'Cân bằng âm thanh, êm dịu dễ tập trung'
  },
  {
    id: 'brown',
    name: 'Tiếng ồn nâu',
    subName: 'Brown',
    emoji: '🌊',
    type: 'noise',
    desc: 'Tiếng rào trầm ấm như mưa giông lớn'
  }
];

// Helper to pre-generate noise buffers programmatically (100% offline & client-side)
const createNoiseBuffer = (ctx, type) => {
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // compensation for volume
      b6 = white * 0.115926;
    }
  } else if (type === 'brown') {
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // compensation for volume loss
    }
  }
  return noiseBuffer;
};

function AmbientSoundboard() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Master volume state
  const [masterVolume, setMasterVolume] = useState(() => {
    const saved = localStorage.getItem('pomodoro_ambient_master');
    return saved ? parseFloat(saved) : 1.0;
  });

  // Standard sounds state
  const [soundMix, setSoundMix] = useState(() => {
    const saved = localStorage.getItem('pomodoro_ambient_mix');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing ambient mix:', e);
      }
    }
    const initial = {};
    SOUNDS.forEach((s) => {
      initial[s.id] = { playing: false, volume: 0.5 };
    });
    return initial;
  });

  // Synthesized brainwave & noise state
  const [synthMix, setSynthMix] = useState(() => {
    const saved = localStorage.getItem('pomodoro_synth_mix');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing synth mix:', e);
      }
    }
    const initial = {};
    SYNTH_SOUNDS.forEach((s) => {
      initial[s.id] = { playing: false, volume: 0.3 };
    });
    return initial;
  });

  const audioInstances = useRef({});
  const synthInstances = useRef({});
  const audioCtxRef = useRef(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro_ambient_master', masterVolume.toString());
  }, [masterVolume]);

  useEffect(() => {
    localStorage.setItem('pomodoro_ambient_mix', JSON.stringify(soundMix));
  }, [soundMix]);

  useEffect(() => {
    localStorage.setItem('pomodoro_synth_mix', JSON.stringify(synthMix));
  }, [synthMix]);

  // Handle standard audio instances playing & volume changes
  useEffect(() => {
    SOUNDS.forEach((sound) => {
      const config = soundMix[sound.id] || { playing: false, volume: 0.5 };
      let audio = audioInstances.current[sound.id];

      if (config.playing) {
        if (!audio) {
          audio = new Audio(sound.url);
          audio.loop = true;
          audioInstances.current[sound.id] = audio;
        }
        
        audio.volume = config.volume * masterVolume; // Scale by master volume

        if (audio.paused) {
          audio.play().catch((err) => {
            console.warn(`Autoplay blocked for sound: ${sound.name}`, err);
            setSoundMix(prev => ({
              ...prev,
              [sound.id]: { ...prev[sound.id], playing: false }
            }));
          });
        }
      } else {
        if (audio && !audio.paused) {
          audio.pause();
        }
      }
    });
  }, [soundMix, masterVolume]);

  // Sync synthesized sounds volume changes dynamically when masterVolume or synthMix changes
  useEffect(() => {
    Object.keys(synthInstances.current).forEach((key) => {
      const instance = synthInstances.current[key];
      const config = synthMix[key] || { playing: false, volume: 0.3 };
      if (instance && instance.gainNode) {
        instance.gainNode.gain.setValueAtTime(config.volume * masterVolume, audioCtxRef.current?.currentTime || 0);
      }
    });
  }, [masterVolume, synthMix]);

  // Lazy initialize AudioContext on user interaction
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopSynthSound = (soundId) => {
    const instance = synthInstances.current[soundId];
    if (instance) {
      if (instance.type === 'binaural') {
        instance.oscillators.forEach(osc => {
          try { osc.stop(); } catch (e) {}
          try { osc.disconnect(); } catch (e) {}
        });
        instance.panners.forEach(pan => {
          try { pan.disconnect(); } catch (e) {}
        });
      } else if (instance.type === 'noise') {
        try { instance.source.stop(); } catch (e) {}
        try { instance.source.disconnect(); } catch (e) {}
      }
      try { instance.gainNode.disconnect(); } catch (e) {}
      delete synthInstances.current[soundId];
    }
  };

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
      if (audioInstances.current[soundId]) {
        audioInstances.current[soundId].volume = vol * masterVolume;
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

  // Synthesized sounds control
  const handleToggleSynthSound = (soundId) => {
    setSynthMix((prev) => {
      const current = prev[soundId] || { playing: false, volume: 0.3 };
      const nextPlaying = !current.playing;

      if (nextPlaying) {
        try {
          const sound = SYNTH_SOUNDS.find(s => s.id === soundId);
          if (sound) {
            const ctx = getAudioContext();
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(current.volume * masterVolume, ctx.currentTime);

            if (sound.type === 'binaural') {
              // Left channel oscillator
              const oscL = ctx.createOscillator();
              oscL.type = 'sine';
              oscL.frequency.setValueAtTime(sound.baseFreq, ctx.currentTime);

              const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
              if (pannerL) {
                pannerL.pan.setValueAtTime(-1, ctx.currentTime);
                oscL.connect(pannerL);
                pannerL.connect(gainNode);
              } else {
                oscL.connect(gainNode);
              }

              // Right channel oscillator
              const oscR = ctx.createOscillator();
              oscR.type = 'sine';
              oscR.frequency.setValueAtTime(sound.baseFreq + sound.beatFreq, ctx.currentTime);

              const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
              if (pannerR) {
                pannerR.pan.setValueAtTime(1, ctx.currentTime);
                oscR.connect(pannerR);
                pannerR.connect(gainNode);
              } else {
                oscR.connect(gainNode);
              }

              gainNode.connect(ctx.destination);
              oscL.start();
              oscR.start();

              synthInstances.current[soundId] = {
                oscillators: [oscL, oscR],
                panners: pannerL && pannerR ? [pannerL, pannerR] : [],
                gainNode,
                type: 'binaural'
              };
            } else if (sound.type === 'noise') {
              const buffer = createNoiseBuffer(ctx, soundId);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.loop = true;

              source.connect(gainNode);
              gainNode.connect(ctx.destination);
              source.start();

              synthInstances.current[soundId] = {
                source,
                gainNode,
                type: 'noise'
              };
            }
          }
        } catch (err) {
          console.error('Failed to play synthesized sound:', err);
          return prev;
        }
      } else {
        stopSynthSound(soundId);
      }

      return {
        ...prev,
        [soundId]: {
          ...current,
          playing: nextPlaying
        }
      };
    });
  };

  const handleSynthVolumeChange = (soundId, volumeVal) => {
    const vol = parseFloat(volumeVal);
    setSynthMix((prev) => {
      const current = prev[soundId] || { playing: false, volume: 0.3 };
      const instance = synthInstances.current[soundId];
      if (instance && instance.gainNode) {
        instance.gainNode.gain.setValueAtTime(vol * masterVolume, audioCtxRef.current?.currentTime || 0);
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

  const handleMuteAll = () => {
    // Mute standard
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

    // Mute synths
    setSynthMix((prev) => {
      const updated = {};
      Object.keys(prev).forEach((key) => {
        stopSynthSound(key);
        updated[key] = {
          ...prev[key],
          playing: false
        };
      });
      return updated;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Standard sounds cleanup
      Object.keys(audioInstances.current).forEach((key) => {
        const audio = audioInstances.current[key];
        if (audio) {
          audio.pause();
        }
      });

      // Synthesized sounds cleanup
      Object.keys(synthInstances.current).forEach((key) => {
        stopSynthSound(key);
      });

      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  const isAnyPlaying = 
    Object.values(soundMix).some(s => s.playing) || 
    Object.values(synthMix).some(s => s.playing);

  return (
    <div className="soundboard-container">
      <div className="soundboard-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🎧</span>
          <span className="soundboard-title">Âm Thanh Môi Trường & Sóng Não</span>
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
          {/* Master Volume Control */}
          <div className="soundboard-master-volume">
            <span className="master-vol-label">🔊 Âm lượng tổng:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="sound-volume-slider master-slider"
              aria-label="Âm lượng tổng"
            />
            <span className="master-vol-percent">{Math.round(masterVolume * 100)}%</span>
          </div>

          {/* Nature Loops */}
          <div className="soundboard-section-title">🏞️ Âm thanh tự nhiên</div>
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
                      {config.volume * masterVolume > 0 ? (
                        config.volume * masterVolume > 0.5 ? (
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
                      aria-label={`Âm lượng ${sound.name}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Web Audio API Brainwave Synthesizer */}
          <div className="soundboard-section-title" style={{ marginTop: '1.25rem' }}>🧠 Sóng não & Tiếng ồn trắng</div>
          <div className="soundboard-grid">
            {SYNTH_SOUNDS.map((sound) => {
              const config = synthMix[sound.id] || { playing: false, volume: 0.3 };
              return (
                <div key={sound.id} className={`sound-row ${config.playing ? 'active' : ''}`} title={sound.desc}>
                  <button
                    type="button"
                    className={`sound-btn ${config.playing ? 'playing' : ''}`}
                    onClick={() => handleToggleSynthSound(sound.id)}
                  >
                    <span className="sound-emoji">{sound.emoji}</span>
                    <div className="sound-label-group">
                      <span className="sound-name">{sound.name}</span>
                      <span className="sound-subname">{sound.subName}</span>
                    </div>
                  </button>
                  <div className="sound-volume-slider-container">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="volume-icon">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      {config.volume * masterVolume > 0 ? (
                        config.volume * masterVolume > 0.5 ? (
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
                      onChange={(e) => handleSynthVolumeChange(sound.id, e.target.value)}
                      className="sound-volume-slider"
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
