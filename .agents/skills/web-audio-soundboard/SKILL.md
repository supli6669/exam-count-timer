---
name: web-audio-soundboard
description: Best practices for Web Audio API synthesis, procedural sound generation, ambient soundscapes, and low-latency UI sound feedback in React.
---

# Web Audio API & Sound Design Guidelines

Use this skill when implementing audio synthesizers, ambient noise generators (white/pink/brown noise), alarm ringers, or UI feedback sounds in Web and React applications.

## 1. AudioContext Lifecycle Management

### Autoplay Policy Handling
- Browsers suspend `AudioContext` until a user gesture (click/tap) occurs.
- Always check `audioCtx.state === 'suspended'` and call `audioCtx.resume()` inside user interaction handlers.
- Hold audio node references using React `useRef` to prevent re-creating AudioContext on re-renders.

---

## 2. Procedural Audio Synthesis Patterns

### Noise Synthesizer (White / Pink / Brown Noise)
Synthesize audio procedurally without external MP3 files for zero-latency, offline-capable soundscapes.

```js
// Procedural White/Brown Noise Generator
const createBrownNoiseBuffer = (audioCtx, duration = 5) => {
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; // Boost gain
  }
  return buffer;
};
```

### Alarm & Chime Oscillators
- Combine sine and triangle waves with exponential gain decay for crisp, pleasant notification tones:
  ```js
  const playChime = (audioCtx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  };
  ```

---

## 3. Performance & Memory Safety

- **Cleanup Disconnected Nodes**: Always call `osc.stop()`, `node.disconnect()` when stopping ambient sounds or unmounting components to avoid Web Audio memory leaks.
- **Audio Thread Offloading**: Use `AudioWorkletNode` instead of deprecated `ScriptProcessorNode` for heavy realtime signal processing.
