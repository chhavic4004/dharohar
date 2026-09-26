import type { CategoryId, CategorySummary, Difficulty } from "../../../../../shared/quiz-contract";
import { architectureQuestions } from "./architecture";
import { culinaryQuestions } from "./culinary";
import { dailyQuestions } from "./daily";
import { rhythmsQuestions } from "./rhythms";
import { rulersQuestions } from "./rulers";
import { traditionsQuestions } from "./traditions";
import type { BankQuestion } from "./types";
import { QUESTION_LINKS } from "./links";
import { visualQuestions } from "./visual";
import { heritageById } from "../heritage/registry";

export type { BankQuestion } from "./types";

/**
 * Category copy. Descriptions are shown on the lobby cards and must stay
 * exactly as written in the design.
 */
export const CATEGORIES: Omit<CategorySummary, "questionCount">[] = [
  { id: "rhythms", label: "Rhythms & Ragas", hindi: "राग और ताल", description: "Classical music, dance forms and the instruments that carry them." },
  { id: "architecture", label: "Architectural Marvels", hindi: "स्थापत्य चमत्कार", description: "Temples, tombs, forts and cities that shaped India's skyline." },
  { id: "culinary", label: "Culinary Roots", hindi: "पाककला की जड़ें", description: "Spices, grains and dishes with a story and a place of origin." },
  { id: "traditions", label: "Living Traditions & Lore", hindi: "परम्परा और लोककथा", description: "Festivals, crafts and rituals that are still practised today." },
  { id: "rulers", label: "Rulers & Empires", hindi: "राजा और साम्राज्य", description: "Dynasties, battles and the people who ruled the subcontinent." },
];

export const QUIZ_BANK: BankQuestion[] = [
  ...rhythmsQuestions,
  ...architectureQuestions,
  ...culinaryQuestions,
  ...traditionsQuestions,
  ...rulersQuestions,
  ...visualQuestions,
];

export const DAILY_BANK: BankQuestion[] = dailyQuestions;

const byId = new Map<string, BankQuestion>();
for (const q of [...QUIZ_BANK, ...DAILY_BANK]) {
  if (byId.has(q.id)) throw new Error(`Duplicate question id in bank: ${q.id}`);
  const links = QUESTION_LINKS[q.id];
  if (links) {
    for (const id of links) if (!heritageById.has(id)) throw new Error(`Unknown heritage id "${id}" linked from ${q.id}`);
    q.links = links;
  }
  byId.set(q.id, q);
}

/** Questions that mention a given tradition, site or food. */
export function questionsForHeritage(heritageId: string): BankQuestion[] {
  return QUIZ_BANK.filter((q) => q.links?.includes(heritageId));
}

/** Smallest heritage quiz we serve. Short lists are topped up with related questions. */
export const HERITAGE_QUIZ_MIN = 5;

/**
 * Questions for a heritage quiz: everything linked to the entry first, then
 * questions about other traditions and sites from the same state, then the
 * same category. Linked questions always come first in the returned list.
 */
export function heritageQuizPool(heritageId: string): { direct: BankQuestion[]; related: BankQuestion[] } {
  const direct = questionsForHeritage(heritageId);
  if (direct.length >= HERITAGE_QUIZ_MIN) return { direct, related: [] };
  const seen = new Set(direct.map((q) => q.id));
  const state = heritageById.get(heritageId)?.state;
  const cats = new Set(direct.map((q) => q.category));
  const sameState = state
    ? QUIZ_BANK.filter((q) => !seen.has(q.id) && q.type !== "map_pin" && (q.links ?? []).some((id) => id !== heritageId && heritageById.get(id)?.state === state))
    : [];
  sameState.forEach((q) => seen.add(q.id));
  const sameCat = QUIZ_BANK.filter((q) => !seen.has(q.id) && q.type !== "map_pin" && q.difficulty === "seeker" && cats.has(q.category) && (q.links?.length ?? 0) > 0);
  return { direct, related: [...sameState, ...sameCat] };
}

export function getQuestion(id: string): BankQuestion | undefined {
  return byId.get(id);
}

export function questionsFor(category: CategoryId | "mixed", difficulty: Difficulty): BankQuestion[] {
  return QUIZ_BANK.filter(
    (q) => q.difficulty === difficulty && (category === "mixed" || q.category === category),
  );
}

export function categorySummaries(): CategorySummary[] {
  return CATEGORIES.map((cat) => ({
    ...cat,
    questionCount: {
      seeker: questionsFor(cat.id, "seeker").length,
      historian: questionsFor(cat.id, "historian").length,
    },
  }));
}
