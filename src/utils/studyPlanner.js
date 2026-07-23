import { getLocalDateKey } from './date';

const DAY_MS = 24 * 60 * 60 * 1000;

export function getDueFlashcards(cards, date = new Date()) {
  const today = getLocalDateKey(date);
  return cards.filter(card => !card.nextReviewDate || card.nextReviewDate <= today);
}

export function buildTodayStudyPlan(exams = [], generalTasks = [], cards = [], date = new Date()) {
  const now = date.getTime();
  const focusItems = [];
  exams
    .filter(exam => new Date(exam.datetime).getTime() > now)
    .forEach(exam => {
      const daysLeft = Math.max(1, Math.ceil((new Date(exam.datetime).getTime() - now) / DAY_MS));
      (exam.tasks || []).filter(task => !task.completed).forEach(task => {
        const urgency = task.deadline ? Math.max(0, 14 - Math.ceil((new Date(task.deadline).getTime() - now) / DAY_MS)) : 0;
        focusItems.push({
          id: task.id,
          type: 'task',
          subject: exam.subject,
          text: task.text,
          minutes: Math.max(25, Math.min(90, (task.estPomodoros || 1) * 25)),
          score: (30 / daysLeft) + urgency + (task.urgent ? 12 : 0) + (task.important === false ? -5 : 5)
        });
      });
    });

  generalTasks.filter(task => !task.completed).forEach(task => {
    focusItems.push({ id: task.id, type: 'task', subject: 'Việc chung', text: task.text, minutes: 25, score: (task.urgent ? 18 : 6) + (task.important === false ? -4 : 4) });
  });

  const dueCards = getDueFlashcards(cards, date);
  if (dueCards.length) {
    focusItems.push({ id: 'flashcards-due', type: 'flashcards', subject: 'Ôn ghi nhớ', text: `Ôn ${dueCards.length} thẻ đến hạn`, minutes: Math.min(30, Math.max(10, dueCards.length * 2)), score: 16 });
  }

  return focusItems.sort((a, b) => b.score - a.score).slice(0, 4);
}

export function getNextReviewDate(box, correct, date = new Date()) {
  const intervals = [0, 1, 3, 7, 14, 30];
  const nextBox = correct ? Math.min(5, box + 1) : 1;
  const next = new Date(date);
  next.setDate(next.getDate() + intervals[nextBox]);
  return { nextBox, nextReviewDate: getLocalDateKey(next) };
}
