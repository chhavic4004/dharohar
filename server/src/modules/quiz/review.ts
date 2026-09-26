import type { ReviewSummary } from "../../../../shared/quiz-contract";
import type { ReviewCard } from "../../store/types";
import { SCORING } from "./gamification";

const DAY = 86_400_000;
export const MASTERED_BOX = 6;

/**
 * Leitner-style spaced repetition. A wrong answer puts the question in box 0,
 * due immediately, so it shows up in Revise straight away. Each correct
 * answer when it is due moves it up a box and schedules the next review
 * (1, 3, 7, 14, 30 days). Getting it right in box 5 marks it mastered.
 * Returns true when this answer mastered the card. O(1).
 */
export function applyReview(cards: Record<string, ReviewCard>, questionId: string, correct: boolean, now: Date): boolean {
  const nowIso = now.toISOString();
  const card = cards[questionId];
  if (!correct) {
    cards[questionId] = { box: 0, due: nowIso, lastSeen: nowIso };
    return false;
  }
  if (!card || card.box >= MASTERED_BOX) return false;
  if (new Date(card.due) > now) {
    card.lastSeen = nowIso;
    return false;
  }
  const box = card.box + 1;
  if (box >= MASTERED_BOX) {
    cards[questionId] = { box: MASTERED_BOX, due: nowIso, lastSeen: nowIso };
    return true;
  }
  cards[questionId] = { box, due: new Date(now.getTime() + SCORING.reviewIntervalsDays[box - 1] * DAY).toISOString(), lastSeen: nowIso };
  return false;
}

export function dueQuestionIds(cards: Record<string, ReviewCard>, now: Date): string[] {
  return Object.entries(cards)
    .filter(([, c]) => c.box < MASTERED_BOX && new Date(c.due) <= now)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .map(([id]) => id);
}

export function summarize(cards: Record<string, ReviewCard>, now: Date): ReviewSummary {
  const list = Object.values(cards);
  const learning = list.filter((c) => c.box < MASTERED_BOX);
  const upcoming = learning.filter((c) => new Date(c.due) > now).map((c) => c.due).sort();
  return {
    due: learning.filter((c) => new Date(c.due) <= now).length,
    learning: learning.length,
    mastered: list.length - learning.length,
    nextDueAt: upcoming[0] ?? null,
  };
}
