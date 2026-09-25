import type { CategoryId, CategorySummary, Difficulty } from "../../../../../shared/quiz-contract";
import { architectureQuestions } from "./architecture";
import { culinaryQuestions } from "./culinary";
import { dailyQuestions } from "./daily";
import { rhythmsQuestions } from "./rhythms";
import { rulersQuestions } from "./rulers";
import { traditionsQuestions } from "./traditions";
import type { BankQuestion } from "./types";

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
];

export const DAILY_BANK: BankQuestion[] = dailyQuestions;

const byId = new Map<string, BankQuestion>();
for (const q of [...QUIZ_BANK, ...DAILY_BANK]) {
  if (byId.has(q.id)) throw new Error(`Duplicate question id in bank: ${q.id}`);
  byId.set(q.id, q);
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
