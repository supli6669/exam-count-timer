import { useSyncExternalStore } from 'react';

let currentTime = Date.now();
let intervalId = null;
const listeners = new Set();

const notify = () => {
  currentTime = Date.now();
  listeners.forEach(listener => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  if (!intervalId) intervalId = setInterval(notify, 1000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
};

export function useCurrentTime() {
  return useSyncExternalStore(subscribe, () => currentTime, () => Date.now());
}
