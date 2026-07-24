import { useRef } from 'react';
import { validateBackupJSON } from '../utils/storage';
import { getLocalDateKey } from '../utils/date';

const BACKUP_KEYS = [
  'exams_countdown_list',
  'exams_general_tasks',
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
  'pomodoro_focus_subject',
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
  'app_study_streak_data',
  'exam_countdown_notes',
  'pomodoro_onboarding_completed'
];

function BackupRestore() {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      const backupData = {};
      BACKUP_KEYS.forEach(key => {
        const val = localStorage.getItem(key);
        if (val !== null) {
          backupData[key] = val;
        }
      });

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = getLocalDateKey();
      a.href = url;
      a.download = `exam_countdown_backup_${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Đã xảy ra lỗi khi sao lưu dữ liệu: ' + err.message);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        
        // Strict validation schema check
        const validation = validateBackupJSON(backupData);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const confirmImport = window.confirm('Nhập dữ liệu mới sẽ thay thế toàn bộ dữ liệu hiện tại của bạn. Bạn có muốn tiếp tục?');
        if (!confirmImport) return;

        // An import is a complete application snapshot. Remove app keys that
        // are absent from the selected backup so stale data cannot survive.
        BACKUP_KEYS.forEach(key => localStorage.removeItem(key));

        Object.entries(backupData).forEach(([key, val]) => {
          if (!BACKUP_KEYS.includes(key)) return;
          const stringVal = typeof val === 'string' ? val : JSON.stringify(val);
          localStorage.setItem(key, stringVal);
        });


        alert('Nhập dữ liệu thành công! Ứng dụng sẽ tự động tải lại.');
        window.location.reload();
      } catch (err) {
        alert('Lỗi nhập dữ liệu: ' + err.message);
      }
    };
    reader.onerror = () => {
      alert('Không thể đọc tệp sao lưu. Vui lòng thử lại với một tệp JSON hợp lệ.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="backup-restore-container" style={{ display: 'flex', gap: '0.4rem' }}>
      <button
        type="button"
        className="btn-icon"
        onClick={handleExport}
        title="Sao lưu dữ liệu (Export JSON)"
        aria-label="Sao lưu dữ liệu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </button>

      <button
        type="button"
        className="btn-icon"
        onClick={() => fileInputRef.current?.click()}
        title="Khôi phục dữ liệu (Import JSON)"
        aria-label="Khôi phục dữ liệu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default BackupRestore;
