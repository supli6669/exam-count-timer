/**
 * Utility functions for local storage data validation and maintenance
 */

/**
 * Validates backup JSON structure before restoring data to local storage.
 * Returns { valid: boolean, error?: string }
 */
export function validateBackupJSON(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Tập tin JSON không chứa cấu trúc đối tượng hợp lệ.' };
  }

  // Known valid keys that are expected in backups
  const knownKeys = [
    'exams_countdown_list',
    'exams_general_tasks',
    'app_global_theme',
    'notifications_enabled',
    'pomodoro_work',
    'pomodoro_short_break',
    'pomodoro_long_break',
    'pomodoro_study_logs',
    'pomodoro_user_xp',
    'pomodoro_user_level',
    'pomodoro_username',
    'app_leitner_flashcards',
    'app_study_streak_data',
    'exam_countdown_notes',
    'daily_tasks_list',
    'recurring_tasks_list',
    'pomodoro_custom_bg',
    'pomodoro_custom_theme_data'
  ];

  const hasAtLeastOneValidKey = Object.keys(data).some(key => knownKeys.includes(key));
  if (!hasAtLeastOneValidKey) {
    return { valid: false, error: 'Tập tin sao lưu không chứa bất kỳ dữ liệu cấu hình hợp lệ nào của ứng dụng.' };
  }

  // Helper to parse if value is a JSON string
  const parseIfString = (val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  };


  // Validate exams array if present
  if (data.exams_countdown_list) {
    const exams = parseIfString(data.exams_countdown_list);
    if (!Array.isArray(exams)) {
      return { valid: false, error: 'Danh sách môn thi (exams_countdown_list) phải là một mảng.' };
    }
    for (const exam of exams) {
      if (!exam || !exam.id || !exam.subject || !exam.datetime) {
        return { valid: false, error: 'Phát hiện môn thi thiếu thông tin bắt buộc (id, subject, datetime).' };
      }
      if (isNaN(new Date(exam.datetime).getTime())) {
        return { valid: false, error: `Thời gian thi không hợp lệ cho môn: ${exam.subject}` };
      }
    }
  }

  // Validate study logs array if present
  if (data.pomodoro_study_logs) {
    const logs = parseIfString(data.pomodoro_study_logs);
    if (!Array.isArray(logs)) {
      return { valid: false, error: 'Nhật ký học tập (pomodoro_study_logs) phải là một mảng.' };
    }
  }

  return { valid: true };
}

/**
 * Prunes study logs older than maxDays (default 180 days)
 * to keep LocalStorage lightweight and under browser quota.
 */
export function pruneOldStudyLogs(maxDays = 180) {
  try {
    const raw = localStorage.getItem('pomodoro_study_logs');
    if (!raw) return;
    const logs = JSON.parse(raw);
    if (!Array.isArray(logs) || logs.length === 0) return;

    const cutoffTime = Date.now() - (maxDays * 24 * 60 * 60 * 1000);
    const filteredLogs = logs.filter(log => log.timestamp && log.timestamp >= cutoffTime);

    if (filteredLogs.length < logs.length) {
      localStorage.setItem('pomodoro_study_logs', JSON.stringify(filteredLogs));
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
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Failed to parse LocalStorage key "${key}", using fallback:`, err);
    return fallback;
  }
}
