/**
 * Dharohar Quiz: API contract shared by the frontend (src/features/quiz)
 * and the backend (server/). Change a shape here and TypeScript will point
 * at every place on both sides that needs updating.
 *
 * All endpoints live under /api/quiz. Every request must identify the player
 * with either `Authorization: Bearer <token>` (once team auth exists) or an
 * `X-Guest-Id: <uuid>` header (default for now).
 */

export type CategoryId = "rhythms" | "architecture" | "culinary" | "traditions" | "rulers";
export type QuizCategoryParam = CategoryId | "mixed";
export type Difficulty = "seeker" | "historian";
export type QuestionType = "mcq" | "true_false" | "odd_one_out" | "chronology" | "match";

export const QUESTIONS_PER_QUIZ = 10;
export const HISTORIAN_SECONDS = 30;

export interface CategorySummary {
  id: CategoryId;
  label: string;
  hindi: string;
  description: string;
  questionCount: { seeker: number; historian: number };
}

export interface ChoiceOption {
  /** Display position. The server maps it back to the real answer. */
  id: number;
  text: string;
}

/** A question as the player sees it. Never contains the answer. */
export interface PublicQuestion {
  id: string;
  type: QuestionType;
  category: CategoryId;
  difficulty: Difficulty;
  prompt: string;
  /** mcq, true_false, odd_one_out */
  options?: ChoiceOption[];
  /** chronology: shuffled events to put in order, earliest first */
  items?: ChoiceOption[];
  /** match: fixed left column and shuffled right column */
  left?: ChoiceOption[];
  right?: ChoiceOption[];
}

export type AnswerPayload =
  | { choice: number }
  | { order: number[] }
  | { pairs: number[] }
  | { timedOut: true };

export interface Explanation {
  title: string;
  body: string;
  /** An extra fact shown under the main explanation */
  trivia?: string;
}

export interface Source {
  label: string;
  url: string;
}

/** The correct answer, expressed in the same display ids the player saw. */
export type CorrectAnswer = { choice: number } | { order: number[] } | { pairs: number[] };

export interface PointsBreakdown {
  base: number;
  speed: number;
  streak: number;
  total: number;
}

export interface AnswerResult {
  correct: boolean;
  timedOut: boolean;
  correctAnswer: CorrectAnswer;
  /** Plain-language version of the correct answer, for review screens */
  correctAnswerText: string;
  explanation: Explanation;
  source: Source;
  points: PointsBreakdown;
  streak: number;
  score: number;
  answeredCount: number;
  totalQuestions: number;
  isLast: boolean;
}

export interface StartSessionRequest {
  category: QuizCategoryParam;
  difficulty: Difficulty;
}

export interface SessionInfo {
  sessionId: string;
  category: QuizCategoryParam;
  difficulty: Difficulty;
  totalQuestions: number;
  timeLimitSeconds: number | null;
}

export interface NextQuestionResponse {
  index: number;
  totalQuestions: number;
  question: PublicQuestion;
  /** ISO time the server started the clock for this question */
  servedAt: string;
}

export interface ReviewItem {
  questionId: string;
  type: QuestionType;
  prompt: string;
  category: CategoryId;
  yourAnswerText: string;
  correctAnswerText: string;
  correct: boolean;
  timedOut: boolean;
  timeTakenSeconds: number;
  points: number;
  explanation: Explanation;
  source: Source;
}

export interface Badge {
  id: string;
  label: string;
  hindi: string;
  description: string;
  earnedAt?: string;
}

export interface LevelInfo {
  level: number;
  name: string;
  hindi: string;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number | null;
  progress: number; // 0 to 1
}

export interface QuizResult {
  attemptId: string;
  category: QuizCategoryParam;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  accuracy: number; // 0 to 100
  bestStreak: number;
  totalTimeSeconds: number;
  averageTimeSeconds: number;
  points: {
    base: number;
    speed: number;
    streak: number;
    perfectBonus: number;
    total: number;
  };
  coinsEarned: number;
  coinBalance: number;
  levelBefore: LevelInfo;
  levelAfter: LevelInfo;
  newBadges: Badge[];
  previousBest: number | null;
  isPersonalBest: boolean;
  rating: { title: string; hindi: string; message: string };
  byType: { type: QuestionType; correct: number; total: number }[];
  byCategory: { category: CategoryId; correct: number; total: number }[];
  review: ReviewItem[];
}

export interface CategoryStats {
  quizzes: number;
  correct: number;
  answered: number;
  xp: number;
  bestScore: { seeker: number | null; historian: number | null };
}

export interface DailyState {
  streak: number;
  longestStreak: number;
  lastDate: string | null;
  totalAnswered: number;
  totalCorrect: number;
}

export interface PlayerProfile {
  id: string;
  displayName: string;
  coins: number;
  level: LevelInfo;
  quizzesCompleted: number;
  correctAnswers: number;
  totalAnswered: number;
  bestStreak: number;
  daily: DailyState;
  badges: Badge[];
  lockedBadges: Badge[];
  stats: Partial<Record<CategoryId, CategoryStats>>;
  recentAttempts: {
    attemptId: string;
    category: QuizCategoryParam;
    difficulty: Difficulty;
    score: number;
    totalQuestions: number;
    points: number;
    completedAt: string;
  }[];
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD in IST
  question: PublicQuestion;
  answered: boolean;
  result: DailyAnswerResult | null;
  streak: number;
  longestStreak: number;
  /** true when the player answered yesterday but not yet today */
  streakAtRisk: boolean;
  nextResetAt: string;
}

export interface DailyAnswerResult {
  correct: boolean;
  correctAnswer: CorrectAnswer;
  correctAnswerText: string;
  yourAnswerText: string;
  explanation: Explanation;
  source: Source;
  coinsEarned: number;
  xpEarned: number;
  streak: number;
  longestStreak: number;
  newBadges: Badge[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  xp: number;
  level: number;
  isYou: boolean;
}

export interface LeaderboardResponse {
  scope: CategoryId | "overall";
  entries: LeaderboardEntry[];
  you: LeaderboardEntry | null;
}

export type RewardKind = "museum" | "crafts" | "travel" | "learning" | "digital";

export interface Reward {
  id: string;
  title: string;
  partner: string;
  kind: RewardKind;
  description: string;
  discountLabel: string;
  cost: number;
  minLevel: number;
  validityDays: number;
  terms: string[];
  affordable: boolean;
  unlocked: boolean;
}

export interface Redemption {
  id: string;
  rewardId: string;
  title: string;
  partner: string;
  discountLabel: string;
  code: string;
  cost: number;
  redeemedAt: string;
  expiresAt: string;
  status: "active" | "expired";
}

export interface RedeemResponse {
  redemption: Redemption;
  coinBalance: number;
}

export interface ApiError {
  error: { code: string; message: string };
}
