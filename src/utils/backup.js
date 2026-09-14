export const BACKUP_KEYS = [
  'auto_delete_passed_exams',
  'pomodoro_spotify_url',
  'exams_countdown_list',
  'exams_general_tasks',
  'tasks_consolidated_v1',
  'notes_consolidated_v1',
  'app_global_theme',
  'notifications_enabled',
  'pomodoro_work',
  'pomodoro_short_break',
  'pomodoro_long_break',
  'pomodoro_alarm_volume',
  'pomodoro_alarm_sound',
  'pomodoro_completed_sessions',
  'pomodoro_break_logs',
  'pomodoro_theme',
  'pomodoro_timer_type',
  'pomodoro_focus_subject',
  'pomodoro_focus_task',
  'pomodoro_study_logs',
  'pomodoro_user_xp',
  'pomodoro_user_level',
  'pomodoro_username',
  'pomodoro_ambient_master',
  'pomodoro_ambient_mix',
  'pomodoro_synth_mix',
  'productivity_contributions',
  'recurring_tasks_rule_of_3',
  'pomodoro_low_power',
  'daily_tasks_list',
  'daily_tasks_last_reset',
  'pomodoro_custom_bg',
  'pomodoro_custom_theme_data',
  'app_leitner_flashcards',
  'mock_exam_results',
  'app_study_streak_data',
  'exam_countdown_notes',
  'pomodoro_onboarding_completed',
  'focus_planner_v1',
  'focus_task_templates_v1',
  'focus_distractions_v1',
  'focus_widget_order_v1',
  'focus_workspace_widget_order_v1',
  'focus_workspace_scratchpad',
  'focus_integrations_v1',
  'study_room_display_name',
  'study_room_blocked_ids'
];


// Roll back every touched key if quota or storage access fails mid-restore.
export function restoreBackup(data, storage) {
  const entries = BACKUP_KEYS.map(key => [key, Object.hasOwn(data, key)
    ? (typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key])) : null]);
  const previous = BACKUP_KEYS.map(key => [key, storage.getItem(key)]);
  try {
    for (const [key, value] of entries) {
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, value);
    }
  } catch (error) {
    try {
      // Free imported values first, so the previous snapshot fits again.
      for (const [key] of entries) storage.removeItem(key);
      for (const [key, value] of previous) if (value !== null) storage.setItem(key, value);
    } catch {
      throw new Error('Không thể khôi phục dữ liệu cũ. Giữ trang đang mở và sao lưu dữ liệu trước khi tải lại.', { cause: error });
    }
    throw new Error('Không thể nhập dữ liệu (bộ nhớ đầy hoặc bị chặn). Dữ liệu cũ đã được giữ lại.', { cause: error });
  }
}
