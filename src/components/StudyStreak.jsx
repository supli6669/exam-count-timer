import { useState } from 'react';
import { getLocalDateKey, localDateFromKey } from '../utils/date';


const BADGES = [
  {
    id: 'badge_first_step',
    title: 'Bước Đầu Tiên',
    icon: '🌱',
    description: 'Hoàn thành phiên Pomodoro hoặc nhiệm vụ học tập đầu tiên.',
    check: (xp, streak) => xp >= 25 || streak >= 1
  },
  {
    id: 'badge_night_owl',
    title: 'Cú Đêm Siêng Năng',
    icon: '🌙',
    description: 'Tập trung học tập vào buổi tối (sau 22:00).',
    check: (xp) => xp >= 100
  },
  {
    id: 'badge_streak_3',
    title: 'Ngọn Lửa Bùng Cháy',
    icon: '🔥',
    description: 'Duy trì chuỗi học tập liên tục trong 3 ngày.',
    check: (xp, streak) => streak >= 3
  },
  {
    id: 'badge_streak_7',
    title: 'Chiến Binh 7 Ngày',
    icon: '⚡',
    description: 'Duy trì chuỗi học tập liên tục suốt 7 ngày.',
    check: (xp, streak) => streak >= 7
  },
  {
    id: 'badge_focus_master',
    title: 'Bậc Thầy Tập Trung',
    icon: '👑',
    description: 'Tích lũy 1,000 XP từ các phiên Pomodoro.',
    check: (xp) => xp >= 1000
  },
  {
    id: 'badge_legend',
    title: 'Huyền Thoại Học Đường',
    icon: '💎',
    description: 'Đạt mốc 3,000 XP tích lũy.',
    check: (xp) => xp >= 3000
  }
];

function getStreakData() {
  try {
    const raw = localStorage.getItem('app_study_streak_data');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not parse streak data:', e);
  }
  return { currentStreak: 1, lastStudyDate: getLocalDateKey(), freezeActive: false };
}

function recordStudySession() {
  const todayStr = getLocalDateKey();
  const data = getStreakData();

  if (data.lastStudyDate === todayStr) {
    return data; // Already recorded today
  }

  const lastDate = localDateFromKey(data.lastStudyDate);
  const today = localDateFromKey(todayStr);
  const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

  let newStreak = data.currentStreak;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1; // Reset streak if missed more than 1 day
  }

  const updated = {
    currentStreak: newStreak,
    lastStudyDate: todayStr,
    freezeActive: false
  };

  localStorage.setItem('app_study_streak_data', JSON.stringify(updated));
  return updated;
}

export default function StudyStreak({ userXP = 0 }) {
  const [streakInfo] = useState(() => recordStudySession());
  const [isModalOpen, setIsModalOpen] = useState(false);


  const unlockedCount = BADGES.filter(b => b.check(userXP, streakInfo.currentStreak)).length;

  const getFlameColor = (streak) => {
    if (streak >= 7) return 'linear-gradient(135deg, #a855f7, #ec4899)';
    if (streak >= 3) return 'linear-gradient(135deg, #f97316, #ef4444)';
    return 'linear-gradient(135deg, #3b82f6, #06b6d4)';
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="streak-badge-btn"
        title="Xem thành tích & chuỗi học tập liên tục"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.85rem',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-glass)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.88rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)'
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: getFlameColor(streakInfo.currentStreak),
            boxShadow: '0 0 10px rgba(249, 115, 22, 0.4)',
            fontSize: '0.85rem',
            animation: streakInfo.currentStreak >= 3 ? 'pulse 2s infinite ease-in-out' : 'none'
          }}
        >
          🔥
        </span>
        <span>{streakInfo.currentStreak} Ngày Chuỗi</span>
        <span style={{
          fontSize: '0.75rem',
          background: 'rgba(139, 92, 246, 0.2)',
          color: '#a78bfa',
          padding: '0.15rem 0.4rem',
          borderRadius: '10px'
        }}>
          🏆 {unlockedCount}/{BADGES.length}
        </span>
      </button>

      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.8rem',
              borderRadius: '20px',
              border: '1px solid var(--border-glass-focus)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              background: 'var(--bg-secondary)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🔥</span> Thành Tích & Chuỗi Học Tập
                </h2>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Duy trì học tập mỗi ngày để giữ vững chuỗi ngọn lửa!
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Streak Status Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.2rem',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(139, 92, 246, 0.12))',
              border: '1px solid rgba(249, 115, 22, 0.25)',
              marginBottom: '1.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#fdba74', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Chuỗi Hiện Tại
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.1rem' }}>
                  {streakInfo.currentStreak} Ngày Liên Tiếp 🔥
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Phiên học gần nhất: {streakInfo.lastStudyDate}
                </div>
              </div>
              <div style={{
                fontSize: '2.5rem',
                animation: 'bounce 2s infinite'
              }}>
                🏆
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', margin: '0 0 1rem', color: 'var(--text-primary)' }}>
              Danh Sách Huy Hiệu ({unlockedCount}/{BADGES.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {BADGES.map((badge) => {
                const isUnlocked = badge.check(userXP, streakInfo.currentStreak);
                return (
                  <div
                    key={badge.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.9rem 1.1rem',
                      borderRadius: '14px',
                      background: isUnlocked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: isUnlocked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                      opacity: isUnlocked ? 1 : 0.65,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      fontSize: '1.8rem',
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: isUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {badge.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isUnlocked ? '#34d399' : 'var(--text-primary)' }}>
                          {badge.title}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '8px',
                          background: isUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          color: isUnlocked ? '#34d399' : 'var(--text-muted)'
                        }}>
                          {isUnlocked ? 'Đã Đạt' : 'Khóa'}
                        </span>
                      </div>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
