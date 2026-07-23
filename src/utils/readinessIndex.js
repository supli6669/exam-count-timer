/**
 * Utility for calculating Exam Readiness Index (ERI) Score (0 - 100%)
 * Based on Coverage (task completion), Study Volume (Pomodoro hours logged), and Time Remaining (Urgency).
 */

export function calculateExamReadiness(exam, studyLogs = []) {
  if (!exam) return { score: 0, level: 'low', label: 'Chưa chuẩn bị', color: '#f43f5e' };

  const tasks = exam.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  if (totalTasks === 0 && studyLogs.length === 0) {
    return { score: null, level: 'unknown', label: 'Chưa đủ dữ liệu', color: '#94a3b8', coveragePercent: 0, totalFocusMinutes: 0 };
  }

  // 1. Task Coverage Score (0 - 50 points)
  const coverageScore = totalTasks > 0 ? (completedTasks / totalTasks) * 50 : 25;

  // 2. Study Volume Score from Pomodoro logs (0 - 35 points)
  // Calculate total focus minutes logged for this exam subject
  const subjectLogs = studyLogs.filter(log =>
    log.subject && log.subject.toLowerCase() === exam.subject.toLowerCase()
  );
  const totalFocusMinutes = subjectLogs.reduce((acc, log) => acc + (log.durationMinutes || 25), 0);
  const targetFocusMinutes = (exam.credits || 3) * 120; // 2 hours per credit target
  const volumeScore = Math.min(35, (totalFocusMinutes / Math.max(1, targetFocusMinutes)) * 35);

  // 3. Time Urgency Stability Score (0 - 15 points)
  const now = Date.now();
  const examTime = new Date(exam.datetime).getTime();
  const hoursLeft = (examTime - now) / (1000 * 60 * 60);

  let urgencyScore = 15;
  if (hoursLeft < 24) {
    urgencyScore = completedTasks === totalTasks ? 15 : 5;
  } else if (hoursLeft < 72) {
    urgencyScore = 10;
  }

  // Aggregate total score
  const totalScore = Math.min(100, Math.round(coverageScore + volumeScore + urgencyScore));

  let level = 'low';
  let label = 'Nguy cơ cao';
  let color = '#f43f5e'; // Rose / Red

  if (totalScore >= 75) {
    level = 'high';
    label = 'Sẵn sàng thi!';
    color = '#10b981'; // Emerald / Green
  } else if (totalScore >= 50) {
    level = 'medium';
    label = 'Tiến độ tốt';
    color = '#f59e0b'; // Amber / Yellow
  }

  return {
    score: totalScore,
    level,
    label,
    color,
    coveragePercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    totalFocusMinutes
  };
}
