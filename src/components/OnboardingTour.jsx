import { useState } from 'react';

function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('pomodoro_onboarding_completed') !== 'true';
  });
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Chào mừng bạn đến với Lịch Thi & Trạm Pomodoro! 🎉',
      emoji: '🎓',
      desc: 'Ứng dụng đồng hành học tập toàn diện giúp bạn đếm ngược lịch thi, tối ưu hóa sự tập trung và theo dõi nhịp sinh học ôn thi hiệu quả.'
    },
    {
      title: '🎯 Đếm Ngược Lịch Thi Thông Minh',
      emoji: '⏳',
      desc: 'Theo dõi thời gian thực tới các môn thi tiếp theo. Các thẻ thi sẽ tự động đổi màu theo mức độ khẩn cấp (An toàn 🟢, Sắp thi 🟡, Khẩn cấp 🔴) và tự động ẩn khi kỳ thi kết thúc.'
    },
    {
      title: '⏱️ Trạm Pomodoro & Không Gian Hoạt Ảnh',
      emoji: '🍅',
      desc: 'Tập trung học với 5 không gian nghệ thuật (Art Themes) và trình phát nhạc Spotify nhúng. Đặc biệt, bảng âm thanh môi trường Web Audio giúp bạn dễ dàng hòa mình vào thiên nhiên.'
    },
    {
      title: '📊 Bản Đồ Nhịp Sinh Học & Huy Hiệu',
      emoji: '📈',
      desc: 'Phân tích nhịp sinh học tập trung Chronotype (Sơn ca, Cú đêm,...) qua heatmap 24 giờ. Đồng thời, tích lũy XP học tập để nâng cấp Scholar và mở khóa các Huy hiệu danh giá!'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setIsOpen(false);
    localStorage.setItem('pomodoro_onboarding_completed', 'true');
  };

  return (
    <div className="onboarding-tour-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(5, 7, 12, 0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1.5rem'
    }}>
      <div className="onboarding-tour-content" style={{
        background: '#131926',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2.5rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.1)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        position: 'relative'
      }}>
        {/* Skip button */}
        <button 
          onClick={handleFinish} 
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#fff'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.4)'}
        >
          Bỏ qua
        </button>

        {/* Emoji Indicator */}
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '20px',
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          marginBottom: '0.5rem'
        }}>
          {steps[currentStep].emoji}
        </div>

        {/* Slide Title */}
        <h2 style={{
          margin: 0,
          fontSize: '1.4rem',
          fontWeight: '800',
          color: '#fff',
          lineHeight: '1.3'
        }}>
          {steps[currentStep].title}
        </h2>

        {/* Slide Description */}
        <p style={{
          margin: 0,
          fontSize: '0.92rem',
          color: '#9ca3af',
          lineHeight: '1.6',
          minHeight: '80px'
        }}>
          {steps[currentStep].desc}
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0' }}>
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              style={{
                width: currentStep === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentStep === idx ? '#8b5cf6' : 'rgba(255, 255, 255, 0.15)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
          {currentStep > 0 && (
            <button 
              onClick={handlePrev}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '12px',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              Quay lại
            </button>
          )}
          <button 
            onClick={handleNext}
            style={{
              flex: 2,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              color: '#fff',
              borderRadius: '12px',
              padding: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'none';
              e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
            }}
          >
            {currentStep === steps.length - 1 ? 'Khám phá ngay! 🚀' : 'Tiếp tục'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingTour;
