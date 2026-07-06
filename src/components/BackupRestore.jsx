import { useRef } from 'react';

function BackupRestore() {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      const backupData = {};
      const keysToBackup = [
        'exams_countdown_list',
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
        'pomodoro_ambient_master',
        'pomodoro_ambient_mix',
        'pomodoro_synth_mix',
        'productivity_contributions',
        'recurring_tasks_rule_of_3',
        'pomodoro_low_power',
        'daily_tasks_list',
        'daily_tasks_last_reset',
        'pomodoro_custom_bg'
      ];

      keysToBackup.forEach(key => {
        const val = localStorage.getItem(key);
        if (val !== null) {
          backupData[key] = val;
        }
      });

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
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
        
        // Simple validation
        if (!backupData || typeof backupData !== 'object') {
          throw new Error('Định dạng file sao lưu không hợp lệ.');
        }

        const confirmImport = window.confirm('Nhập dữ liệu mới sẽ thay thế toàn bộ dữ liệu hiện tại của bạn. Bạn có muốn tiếp tục?');
        if (!confirmImport) return;

        Object.entries(backupData).forEach(([key, val]) => {
          localStorage.setItem(key, val);
        });

        alert('Nhập dữ liệu thành công! Ứng dụng sẽ tự động tải lại.');
        window.location.reload();
      } catch (err) {
        alert('Lỗi nhập dữ liệu: ' + err.message);
      }
    };
    reader.readAsText(file);
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
