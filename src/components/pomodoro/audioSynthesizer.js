export const ALARM_SOUND_OPTIONS = [
  { id: 'sparkle', name: 'Sparkle', emoji: '✨' },
  { id: 'train', name: 'Train Arrival', emoji: '🚄' },
  { id: 'commuter', name: 'Commuter Jingle', emoji: '🚊' },
  { id: 'gameshow', name: 'Game Show', emoji: '🎲' },
  { id: 'airport', name: 'Airport', emoji: '🛫' },
  { id: 'soft', name: 'Soft', emoji: '☁️' },
  { id: 'chime', name: 'Chime', emoji: '🔔' },
  { id: 'piano', name: 'Piano', emoji: '🎹' },
  { id: 'success', name: 'Success', emoji: '🏆' },
  { id: 'levelup', name: 'Level Up', emoji: '👾' },
  { id: 'applause', name: 'Applause', emoji: '👏' },
  { id: 'none', name: 'No Alert', emoji: '🔕' }
];

export const STUDY_QUOTES = [
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "There is no elevator to success. You have to take the stairs.", author: "Anonymous" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
  { text: "The best way to predict your future is to create it.", author: "Abraham Lincoln" },
  { text: "Genius is 1% inspiration, 99% perspiration.", author: "Thomas Edison" }
];

export const getAlarmSoundDesc = (soundId) => {
  switch (soundId) {
    case 'sparkle':
      return 'Giai điệu lấp lánh dồn dập, tạo cảm giác kỳ ảo và tươi sáng.';
    case 'commuter':
      return 'Giai điệu ga tàu công cộng (kiểu Nhật), thanh tao, dễ chịu.';
    case 'airport':
      return 'Âm báo phát thanh sân bay cổ điển, thu hút chú ý nhẹ nhàng.';
    case 'chime':
      return 'Giai điệu thiền ngân vang thanh thoát, nhẹ nhàng, báo hiệu kết thúc phiên thư thái.';
    case 'success':
      return 'Giai điệu chiến thắng hào hùng, ăn mừng hoàn thành phiên học.';
    case 'applause':
      return 'Tiếng vỗ tay giòn giã mô phỏng bằng bộ lọc tiếng ồn.';
    case 'train':
      return 'Tiếng còi tàu kép trầm ấm, báo hiệu kết thúc phiên rõ ràng.';
    case 'gameshow':
      return 'Giai điệu 8-bit retro vui nhộn của game show truyền hình.';
    case 'soft':
      return 'Tần số sóng sine trầm ấm nhẹ nhàng, không gây giật mình.';
    case 'piano':
      return 'Hòa âm phím đàn piano mộc mạc, thư thái, tự nhiên.';
    case 'levelup':
      return 'Âm thanh tăng cấp arcade cổ điển, tạo động lực ôn tập.';
    case 'none':
      return 'Không âm báo (hoàn toàn im lặng khi hết giờ).';
    default:
      return 'Âm thanh bíp điện tử dồn dập, rõ ràng, giúp đánh thức sự tập trung tức thì.';
  }
};

export const getVolumeLevelLabel = (vol) => {
  if (vol === 0) return 'Tắt tiếng 🔕';
  if (vol <= 20) return `${vol}% - Nhỏ nhẹ 🔈`;
  if (vol <= 50) return `${vol}% - Vừa phải 🔉`;
  if (vol <= 80) return `${vol}% - To rõ 🔊`;
  return `${vol}% - Rất to 📢 (Tránh giật mình)`;
};

export const playSynthAlarm = (soundId, volumePercent) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Scale volume (max 0.4 to protect hearing)
    const vol = (volumePercent / 100) * 0.4;
    if (vol <= 0 || soundId === 'none') {
      ctx.close().catch(() => {});
      return;
    }

    // Automatically close AudioContext to prevent resource leak
    setTimeout(() => {
      if (ctx.state !== 'closed') {
        ctx.close().catch(e => console.warn('Error closing AudioContext:', e));
      }
    }, 2200);

    // Helper: standard beep with optional decay/type/gain-ramp
    const playBeep = (time, freq, duration, type = 'sine', decayTime = null) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, time);
      osc.type = type;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (decayTime || duration));

      osc.start(time);
      osc.stop(time + duration);
    };

    // Helper: noise burst (applause)
    const playNoiseBurst = (time, duration, burstVol) => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, time);
      filter.Q.setValueAtTime(2, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(burstVol, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(time);
      noise.stop(time + duration);
    };

    // Helper: piano-like sound (fundamental + harmonics)
    const playPianoNote = (time, freq, duration) => {
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      const harmonics = [1, 2, 3, 4];
      const weights = [1, 0.4, 0.2, 0.1];
      harmonics.forEach((h, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.frequency.setValueAtTime(freq * h, time);
        osc.type = 'sine';
        oscGain.gain.setValueAtTime(weights[i], time);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(time);
        osc.stop(time + duration);
      });
    };

    switch (soundId) {
      case 'sparkle': {
        const sparkleNotes = [1200, 1500, 1800, 2200, 2600, 3100];
        sparkleNotes.forEach((freq, idx) => {
          playBeep(now + idx * 0.06, freq, 0.25, 'sine');
        });
        break;
      }
      case 'commuter': {
        const commuterNotes = [659.25, 880, 987.77, 1109.73, 1318.51];
        commuterNotes.forEach((freq, idx) => {
          playBeep(now + idx * 0.12, freq, 0.6, 'sine');
        });
        break;
      }
      case 'airport': {
        playBeep(now, 554.37, 0.8, 'sine'); // C#5
        playBeep(now + 0.35, 440.00, 0.8, 'sine'); // A4
        break;
      }
      case 'chime': {
        const chimeNotes = [523.25, 659.25, 783.99, 1046.50];
        chimeNotes.forEach((freq, idx) => {
          playBeep(now + idx * 0.15, freq, 0.8, 'sine');
        });
        break;
      }
      case 'success': {
        playBeep(now, 523.25, 0.15, 'triangle'); // C5
        playBeep(now + 0.15, 659.25, 0.15, 'triangle'); // E5
        playBeep(now + 0.3, 783.99, 0.15, 'triangle'); // G5
        playBeep(now + 0.45, 1046.50, 0.6, 'triangle'); // C6
        playBeep(now + 0.45, 1318.51, 0.6, 'sine'); // E6
        break;
      }
      case 'applause': {
        for (let i = 0; i < 35; i++) {
          const burstTime = now + i * 0.05 + Math.random() * 0.03;
          const duration = 0.06 + Math.random() * 0.06;
          playNoiseBurst(burstTime, duration, vol * 0.35);
        }
        break;
      }
      case 'train': {
        playBeep(now, 330, 0.4, 'triangle');
        playBeep(now, 392, 0.4, 'triangle');
        playBeep(now + 0.5, 330, 0.6, 'triangle');
        playBeep(now + 0.5, 392, 0.6, 'triangle');
        break;
      }
      case 'gameshow': {
        playBeep(now, 440, 0.1, 'square');
        playBeep(now + 0.1, 554, 0.1, 'square');
        playBeep(now + 0.2, 659, 0.15, 'square');
        playBeep(now + 0.35, 880, 0.4, 'square');
        break;
      }
      case 'soft': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(329.63, now); // E4
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.8, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        osc.start(now);
        osc.stop(now + 1.8);
        break;
      }
      case 'piano': {
        playPianoNote(now, 523.25, 1.2); // C5
        playPianoNote(now + 0.2, 659.25, 1.0); // E5
        playPianoNote(now + 0.4, 783.99, 0.8); // G5
        break;
      }
      case 'levelup': {
        const levelUpNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        levelUpNotes.forEach((freq, idx) => {
          playBeep(now + idx * 0.07, freq, 0.15, 'triangle');
        });
        break;
      }
      case 'classic':
      default: {
        playBeep(now, 880, 0.15, 'sine');
        playBeep(now + 0.2, 880, 0.15, 'sine');
        playBeep(now + 0.38, 880, 0.15, 'sine');
        playBeep(now + 0.58, 1100, 0.5, 'sine');
        break;
      }
    }
  } catch (err) {
    console.warn('Cannot play synth sound:', err);
  }
};
