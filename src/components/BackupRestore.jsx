import { persistentStorage } from '../utils/persistence';
import { useRef } from 'react';
import { validateBackupJSON } from '../utils/storage';
import { getLocalDateKey } from '../utils/date';

import { BACKUP_KEYS, restoreBackup } from '../utils/backup';

function BackupRestore() {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      const backupData = {};
      BACKUP_KEYS.forEach(key => {
        const val = persistentStorage.getItem(key);
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
    if (file.size > 5 * 1024 * 1024) {
      alert('Tệp sao lưu quá lớn. Giới hạn là 5 MB.');
      e.target.value = '';
      return;
    }

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

        restoreBackup(backupData, window.localStorage);

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
