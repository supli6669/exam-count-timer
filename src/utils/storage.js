import { persistentStorage } from './persistence.js';
import { BACKUP_KEYS } from './backup.js';
import { isSafeBackground, parseSpotifyUrl } from './urls.js';

/**
 * Utility functions for local storage data validation and maintenance
 */

/**
 * Validates backup JSON structure before restoring data to local storage.
 * Returns { valid: boolean, error?: string }
 */
export function validateBackupJSON(data) {
  const fail = key => ({ valid: false, error: `Dữ liệu sao lưu không hợp lệ: ${key}.` });
  if (!data || typeof data !== 'object' || Array.isArray(data)) return fail('cấu trúc JSON');
  if (!Object.keys(data).some(key => BACKUP_KEYS.includes(key))) return fail('không có dữ liệu ứng dụng');
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const id = value => typeof value === 'string' && value.length > 0;
  const text = value => typeof value === 'string';
  const date = value => text(value) && Number.isFinite(Date.parse(value));
  const task = value => record(value) && id(value.id) && text(value.text) &&
    (value.completed === undefined || typeof value.completed === 'boolean');
  const array = (value, check) => Array.isArray(value) && value.every(check);
  const schemas = {
    exams_countdown_list: value => array(value, exam => record(exam) && id(exam.id) && text(exam.subject) && date(exam.datetime) &&
      (exam.tasks === undefined || array(exam.tasks, task))),
    exams_general_tasks: value => array(value, task),
    daily_tasks_list: value => array(value, task),
    exam_countdown_notes: value => array(value, note => record(note) && id(note.id) && text(note.title) && text(note.content) &&
      Number.isFinite(note.updatedAt) && Number.isFinite(new Date(note.updatedAt).getTime()) && (note.tags === undefined || array(note.tags, text))),
    app_leitner_flashcards: value => array(value, card => record(card) && id(card.id) && text(card.question) && text(card.answer) &&
      Number.isInteger(card.box) && card.box >= 1 && card.box <= 5 && (!card.nextReviewDate || date(card.nextReviewDate))),
    pomodoro_study_logs: value => array(value, log => record(log) && Number.isFinite(log.timestamp) &&
      Number.isFinite(log.seconds) && log.seconds >= 0),
    app_global_theme: value => ['light', 'dark', 'system'].includes(value),
    pomodoro_custom_bg: value => value === null || value === '' || isSafeBackground(value),
    pomodoro_spotify_url: value => Boolean(parseSpotifyUrl(value)),
  };
  for (const [key, raw] of Object.entries(data)) {
    if (!BACKUP_KEYS.includes(key)) continue;
    let value = raw;
    if (typeof raw === 'string') {
      try { value = JSON.parse(raw); } catch { /* Plain text preferences are valid. */ }
    }
    if (schemas[key] && !schemas[key](value)) return fail(key);
    if (['notifications_enabled', 'auto_delete_passed_exams', 'tasks_consolidated_v1', 'notes_consolidated_v1'].includes(key) && typeof value !== 'boolean') return fail(key);
    if (['pomodoro_work', 'pomodoro_short_break', 'pomodoro_long_break'].includes(key) &&
        (!Number.isInteger(value) || value < 1 || value > (key === 'pomodoro_work' ? 120 : 60))) return fail(key);
  }
  return { valid: true };
}

/**
 * Prunes study logs older than maxDays (default 180 days)
 * to keep LocalStorage lightweight and under browser quota.
 */
export function pruneOldStudyLogs(maxDays = 180) {
  try {
    const raw = persistentStorage.getItem('pomodoro_study_logs');
    if (!raw) return;
    const logs = JSON.parse(raw);
    if (!Array.isArray(logs) || logs.length === 0) return;

    const cutoffTime = Date.now() - (maxDays * 24 * 60 * 60 * 1000);
    const filteredLogs = logs.filter(log => log && log.timestamp && log.timestamp >= cutoffTime);

    if (filteredLogs.length < logs.length) {
      persistentStorage.setItem('pomodoro_study_logs', JSON.stringify(filteredLogs));
      console.log(`Pruned ${logs.length - filteredLogs.length} old study logs older than ${maxDays} days.`);
    }
  } catch (err) {
    console.warn('Could not prune study logs:', err);
  }
}

/**
 * Safely parses a LocalStorage JSON item with a fallback value.
 */
export function safeJsonParse(key, fallback) {
  try {
    const item = persistentStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Failed to parse LocalStorage key "${key}", using fallback:`, err);
    return fallback;
  }
}
