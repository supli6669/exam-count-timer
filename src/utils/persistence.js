import { useSyncExternalStore } from 'react';

const listeners = new Set();
const failedKeys = new Set();
function report(key, failed) {
  if (failed) failedKeys.add(key); else failedKeys.delete(key);
  listeners.forEach(listener => listener());
}

export function createSafeStorage(getStorage) {
  const pending = new Map();
  return {
    getItem(key) {
      if (pending.has(key)) return pending.get(key);
      try { return getStorage().getItem(key); } catch { return null; }
    },
    setItem(key, value) {
      const serialized = String(value);
      try {
        getStorage().setItem(key, serialized);
        pending.delete(key);
        report(key, false);
        return true;
      } catch {
        pending.set(key, serialized);
        report(key, true);
        return false;
      }
    },
    removeItem(key) {
      try {
        getStorage().removeItem(key);
        pending.delete(key);
        report(key, false);
      } catch {
        pending.set(key, null);
        report(key, true);
      }
    }
  };
}

export const persistentStorage = createSafeStorage(() => window.localStorage);
export const transientStorage = createSafeStorage(() => window.sessionStorage);
const subscribe = listener => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export function useStorageFailure() {
  return useSyncExternalStore(subscribe, () => failedKeys.size > 0, () => false);
}
