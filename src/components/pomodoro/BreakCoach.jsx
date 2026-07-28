import { memo, useMemo } from 'react';

const SHORT_BREAK_STEPS = [
  ['💧', 'Uống nước', 'Một vài ngụm nước, tránh mở mạng xã hội.'],
  ['👀', 'Thư giãn mắt', 'Nhìn một vật xa khoảng 6 mét trong 20 giây.'],
  ['🧍', 'Đứng dậy', 'Thả lỏng vai và đi vài bước.']
];

const LONG_BREAK_STEPS = [
  ['🌿', 'Rời màn hình', 'Đi sang một không gian khác trong vài phút.'],
  ['🫁', 'Thở 4–4', 'Hít vào 4 giây, thở ra 4 giây, lặp lại 5 lần.'],
  ['🥗', 'Nạp lại năng lượng', 'Uống nước hoặc ăn nhẹ; đừng bắt đầu nội dung dài.']
];

function BreakCoach({ mode, timerType }) {
  const steps = useMemo(
    () => mode === 'longBreak' || timerType === 'animedoro'
      ? LONG_BREAK_STEPS
      : SHORT_BREAK_STEPS,
    [mode, timerType]
  );

  return (
    <section className="break-coach glass-panel" aria-labelledby="break-coach-title">
      <div>
        <span className="break-coach-kicker">Nghỉ có chủ đích</span>
        <h3 id="break-coach-title">Để não nghỉ thật, không chỉ đổi sang màn hình khác</h3>
      </div>
      <ol>
        {steps.map(([icon, title, detail]) => (
          <li key={title}>
            <span aria-hidden="true">{icon}</span>
            <div><strong>{title}</strong><small>{detail}</small></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default memo(BreakCoach);
