import { getLocalDateKey } from './date.js';

export function getDueFlashcards(cards, date = new Date()) {
  const today = getLocalDateKey(date);
  return cards.filter(card => !card.nextReviewDate || card.nextReviewDate <= today);
}

export function getNextReviewDate(box, correct, date = new Date()) {
  const intervals = [0, 1, 3, 7, 14, 30];
  const nextBox = correct ? Math.min(5, box + 1) : 1;
  const next = new Date(date);
  next.setDate(next.getDate() + intervals[nextBox]);
  return { nextBox, nextReviewDate: getLocalDateKey(next) };
}
