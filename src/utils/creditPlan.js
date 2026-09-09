export const PLAN_KEY = 'credit_study_plan_v1';

export function normalizeSubjects(value) {
  if (!Array.isArray(value)) return [];
  const used = new Set();
  return value.filter(s => s && typeof s.subject === 'string' && s.subject.trim()).map((s, i) => {
    let id = String(s.id || `subject-${i}`);
    while (used.has(id)) id += `-${i}`;
    used.add(id);
    return { id, subject: s.subject.trim().slice(0, 100), credits: Math.min(20, Math.max(1, Math.round(Number(s.credits) || 3))) };
  });
}

export function createCreditPlan(subjects, { days, minutes, session }, id) {
  const courses = normalizeSubjects(subjects);
  if (!courses.length) throw new Error('Thêm ít nhất một môn học.');
  if (!Number.isInteger(days) || days < 1 || days > 7 || !Number.isInteger(minutes) || minutes < 15 || minutes > 480 || ![25, 30, 45, 50].includes(session)) throw new Error('Kiểm tra số buổi và thời gian học.');
  const slots = [];
  for (let day = 0; day < days; day++) {
    let remaining = minutes;
    while (remaining >= 15) {
      const duration = Math.min(session, remaining);
      remaining -= duration;
      const rest = remaining >= 20 ? 5 : 0;
      remaining -= rest;
      slots.push({ day, minutes: duration, rest });
      if (!rest) break;
    }
  }
  const totalCredits = courses.reduce((sum, s) => sum + s.credits, 0);
  const allocated = Object.fromEntries(courses.map(s => [s.id, 0]));
  let elapsed = 0;
  const sessions = slots.map((slot, index) => {
    elapsed += slot.minutes;
    // Largest current deficit spreads higher-credit courses across the week.
    const course = [...courses].sort((a, b) =>
      (elapsed * b.credits / totalCredits - allocated[b.id]) - (elapsed * a.credits / totalCredits - allocated[a.id])
    )[0];
    allocated[course.id] += slot.minutes;
    return { ...slot, id: `${id}-${index}`, subjectId: course.id, subject: course.subject };
  });
  return { id, subjects: courses, config: { days, minutes, session }, sessions, done: [], timer: null, selected: null };
}

export function timerRemaining(timer, now) {
  return timer.deadline ? Math.max(0, Math.ceil((timer.deadline - now) / 1000)) : timer.remaining;
}

export function finishTimer(plan) {
  const timer = plan.timer;
  if (!timer) return plan;
  if (timer.kind === 'rest') return { ...plan, timer: null, selected: null };
  const session = plan.sessions.find(s => s.id === timer.sessionId);
  if (!session) return { ...plan, timer: null };
  return { ...plan, done: [...new Set([...plan.done, session.id])], selected: null,
    timer: session.rest ? { kind: 'rest', sessionId: session.id, remaining: session.rest * 60, deadline: null } : null };
}

export function isValidPlan(p) {
  return Boolean(p && typeof p.id === 'string' && p.config && Number.isInteger(p.config.days) &&
    p.config.days >= 1 && p.config.days <= 7 && Number.isInteger(p.config.minutes) && p.config.minutes >= 15 && p.config.minutes <= 480 &&
    [25, 30, 45, 50].includes(p.config.session) && Array.isArray(p.subjects) && p.subjects.length &&
    p.subjects.every(s => s && typeof s.id === 'string' && typeof s.subject === 'string' && s.subject.trim() && Number.isInteger(s.credits) && s.credits >= 1 && s.credits <= 20) &&
    new Set(p.subjects.map(s => s.id)).size === p.subjects.length &&
    Array.isArray(p.sessions) && p.sessions.length && p.sessions.every(s => s && typeof s.id === 'string' &&
      typeof s.subject === 'string' && p.subjects.some(subject => subject.id === s.subjectId) && Number.isInteger(s.minutes) && s.minutes >= 15 && s.minutes <= p.config.session && Number.isInteger(s.day) && s.day >= 0 && s.day < p.config.days && [0, 5].includes(s.rest)) &&
    new Set(p.sessions.map(s => s.id)).size === p.sessions.length &&
    Array.from({ length: p.config.days }, (_, day) => p.sessions.filter(s => s.day === day).reduce((sum, s) => sum + s.minutes + s.rest, 0)).every(total => total > 0 && total <= p.config.minutes) &&
    Array.isArray(p.done) && p.done.every(id => p.sessions.some(s => s.id === id)) && (!p.timer || (['work', 'rest'].includes(p.timer.kind) &&
      p.sessions.some(s => s.id === p.timer.sessionId) && Number.isFinite(p.timer.remaining) && p.timer.remaining >= 0 &&
      (p.timer.deadline === null || Number.isFinite(p.timer.deadline)))));
}
