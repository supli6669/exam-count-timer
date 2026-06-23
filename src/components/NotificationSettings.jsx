import { useState, useEffect } from 'react';

function NotificationSettings({ enabled, onToggle }) {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        onToggle(true);
      }
    }
  };

  const handleToggle = () => {
    if (permission === 'granted') {
      onToggle(!enabled);
    } else if (permission === 'default') {
      handleRequestPermission();
    }
  };

  if (!('Notification' in window)) {
    return null;
  }

  return (
    <div className="notification-settings">
      <button
        className={`btn-icon ${enabled ? 'active' : ''}`}
        onClick={handleToggle}
        title={enabled ? 'Tắt thông báo' : 'Bật thông báo'}
        aria-label={enabled ? 'Tắt thông báo' : 'Bật thông báo'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          {permission !== 'granted' && (
            <line x1="1" y1="1" x2="23" y2="23"></line>
          )}
        </svg>
      </button>
      {permission === 'denied' && (
        <span className="permission-denied">Thông báo bị chặn</span>
      )}
    </div>
  );
}

export default NotificationSettings;
