const SETTINGS_KEY = 'focus_integrations_v1';
const DB_NAME = 'exam-countdown-integrations';
const STORE_NAME = 'focus-webhook-queue';

export function normalizeWebhookUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}

export function loadIntegrationSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return {
      webhookEnabled: Boolean(parsed.webhookEnabled),
      webhookUrl: normalizeWebhookUrl(parsed.webhookUrl)
    };
  } catch {
    return { webhookEnabled: false, webhookUrl: '' };
  }
}

export function saveIntegrationSettings(settings) {
  const safe = {
    webhookEnabled: Boolean(settings.webhookEnabled),
    webhookUrl: normalizeWebhookUrl(settings.webhookUrl)
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(safe));
  return safe;
}

const openQueueDb = () => new Promise((resolve, reject) => {
  if (!('indexedDB' in window)) {
    reject(new Error('IndexedDB unavailable'));
    return;
  }
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const withStore = async (mode, operation) => {
  const db = await openQueueDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function postFocusWebhook(url, payload, retries = 2) {
  const safeUrl = normalizeWebhookUrl(url);
  if (!safeUrl) throw new Error('Webhook URL không hợp lệ');

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(safeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error(`Webhook trả về HTTP ${response.status}`);
      return true;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await wait((2 ** attempt) * 1000 + Math.floor(Math.random() * 250));
      }
    }
  }
  throw lastError;
}

export async function deliverFocusEvent(payload) {
  const settings = loadIntegrationSettings();
  if (!settings.webhookEnabled || !settings.webhookUrl) return false;
  const envelope = {
    event: 'focus.session.completed',
    version: 1,
    sentAt: new Date().toISOString(),
    data: payload
  };
  try {
    await postFocusWebhook(settings.webhookUrl, envelope);
    return true;
  } catch {
    try {
      await withStore('readwrite', (store) => store.add({
        url: settings.webhookUrl,
        payload: envelope,
        queuedAt: Date.now()
      }));
    } catch {
      // The session remains saved locally even when the offline queue is unavailable.
    }
    return false;
  }
}

export async function flushFocusWebhookQueue() {
  if (!navigator.onLine) return 0;
  try {
    const entries = await withStore('readonly', (store) => store.getAll());
    let delivered = 0;
    for (const entry of entries) {
      try {
        await postFocusWebhook(entry.url, entry.payload, 0);
        await withStore('readwrite', (store) => store.delete(entry.id));
        delivered += 1;
      } catch {
        break;
      }
    }
    return delivered;
  } catch {
    return 0;
  }
}
