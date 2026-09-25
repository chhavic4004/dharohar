import type { Badge, CategoryId, Difficulty, LevelInfo, PointsBreakdown } from "../../../../shared/quiz-contract";
import { HISTORIAN_SECONDS } from "../../../../shared/quiz-contract";

// ─── Scoring ──────────────────────────────────────────────────────────────────
// Tune the game here. Every number the player sees comes from this block.

export const SCORING = {
  base: { seeker: 10, historian: 20 } as Record<Difficulty, number>,
  /** Historian only: 1 point per 3 seconds left on the clock, up to 10 */
  speedDivisor: 3,
  speedMax: 10,
  /** Bonus per correct answer once the in-quiz streak reaches this length */
  streakThreshold: 3,
  streakBonus: 5,
  perfectBonus: { seeker: 50, historian: 100 } as Record<Difficulty, number>,
  /** Coins earned = floor(total points / coinDivisor) */
  coinDivisor: 10,
  /** Grace period for network delay before an answer counts as timed out */
  graceSeconds: 3,
  daily: { xpCorrect: 15, xpWrong: 5, coinsCorrect: 5, coinsWrong: 1, streakCoinCap: 7 },
};

export function answerPoints(difficulty: Difficulty, correct: boolean, secondsTaken: number, newStreak: number): PointsBreakdown {
  if (!correct) return { base: 0, speed: 0, streak: 0, total: 0 };
  const base = SCORING.base[difficulty];
  const speed =
    difficulty === "historian"
      ? Math.min(SCORING.speedMax, Math.round(Math.max(0, HISTORIAN_SECONDS - secondsTaken) / SCORING.speedDivisor))
      : 0;
  const streak = newStreak >= SCORING.streakThreshold ? SCORING.streakBonus : 0;
  return { base, speed, streak, total: base + speed + streak };
}

// ─── Levels ───────────────────────────────────────────────────────────────────

const LEVELS: { xp: number; name: string; hindi: string }[] = [
  { xp: 0, name: "Novice Explorer", hindi: "नवीन खोजी" },
  { xp: 300, name: "Curious Learner", hindi: "जिज्ञासु शिष्य" },
  { xp: 800, name: "Heritage Seeker", hindi: "धरोहर अन्वेषक" },
  { xp: 1600, name: "Cultural Scholar", hindi: "सांस्कृतिक विद्वान" },
  { xp: 3000, name: "Keeper of Lore", hindi: "लोककथा रक्षक" },
  { xp: 5000, name: "Heritage Master", hindi: "धरोहर गुरु" },
  { xp: 8000, name: "Dharohar Laureate", hindi: "धरोहर रत्न" },
];

export function levelFor(xp: number): LevelInfo {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].xp) idx = i;
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1];
  return {
    level: idx + 1,
    name: current.name,
    hindi: current.hindi,
    xp,
    currentLevelXp: current.xp,
    nextLevelXp: next?.xp ?? null,
    progress: next ? (xp - current.xp) / (next.xp - current.xp) : 1,
  };
}

// ─── Result rating ────────────────────────────────────────────────────────────

export function ratingFor(accuracy: number): { title: string; hindi: string; message: string } {
  if (accuracy === 100) return { title: "Flawless Run", hindi: "संपूर्ण", message: "Every answer right. You clearly know this part of India's heritage well." };
  if (accuracy >= 80) return { title: "Cultural Scholar", hindi: "सांस्कृतिक विद्वान", message: "An excellent score. A little more reading and you will be at the top." };
  if (accuracy >= 60) return { title: "Heritage Seeker", hindi: "धरोहर अन्वेषक", message: "A solid result. Go through the answers below to fill the gaps." };
  if (accuracy >= 40) return { title: "Curious Learner", hindi: "जिज्ञासु शिष्य", message: "A good start. The explanations below are worth a read before your next attempt." };
  return { title: "Just Getting Started", hindi: "नवीन खोजी", message: "Everyone starts somewhere. Review the answers and try again; the second round is always better." };
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const SCHOLAR: Record<CategoryId, { label: string; hindi: string; topic: string }> = {
  rhythms: { label: "Scholar of Ragas", hindi: "राग विद्वान", topic: "Rhythms & Ragas" },
  architecture: { label: "Scholar of Stone", hindi: "स्थापत्य विद्वान", topic: "Architectural Marvels" },
  culinary: { label: "Scholar of Spice", hindi: "पाक विद्वान", topic: "Culinary Roots" },
  traditions: { label: "Scholar of Lore", hindi: "लोककथा विद्वान", topic: "Living Traditions & Lore" },
  rulers: { label: "Scholar of Empires", hindi: "इतिहास विद्वान", topic: "Rulers & Empires" },
};

export const BADGES: Badge[] = [
  { id: "first-steps", label: "First Steps", hindi: "पहला कदम", description: "Complete your first quiz." },
  { id: "on-a-roll", label: "On a Roll", hindi: "लगातार सही", description: "Get 5 answers right in a row in one quiz." },
  { id: "flawless", label: "Flawless", hindi: "निर्दोष", description: "Score 100 percent in any quiz." },
  { id: "archive-master", label: "Archive Master", hindi: "अभिलेख स्वामी", description: "Score 100 percent in a Historian quiz." },
  { id: "quick-mind", label: "Quick Mind", hindi: "तीव्र बुद्धि", description: "Score 80 percent or more in a Historian quiz with an average answer time under 10 seconds." },
  { id: "across-india", label: "Across India", hindi: "भारत भ्रमण", description: "Complete a quiz in all five categories." },
  { id: "century", label: "Century", hindi: "शतक", description: "Answer 100 questions correctly in total." },
  ...(Object.keys(SCHOLAR) as CategoryId[]).map((cat) => ({
    id: `scholar-${cat}`,
    label: SCHOLAR[cat].label,
    hindi: SCHOLAR[cat].hindi,
    description: `Score 80 percent or more in a Historian quiz on ${SCHOLAR[cat].topic}.`,
  })),
  { id: "daily-3", label: "Steady Lamp", hindi: "स्थिर दीप", description: "Keep a 3 day Problem of the Day streak." },
  { id: "daily-7", label: "Week of Wisdom", hindi: "ज्ञान सप्ताह", description: "Keep a 7 day Problem of the Day streak." },
  { id: "daily-30", label: "Month of Devotion", hindi: "साधना मास", description: "Keep a 30 day Problem of the Day streak." },
];

export const badgeById = new Map(BADGES.map((b) => [b.id, b]));
