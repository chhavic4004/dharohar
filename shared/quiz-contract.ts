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
export type QuestionType = "mcq" | "true_false" | "odd_one_out" | "chronology" | "match" | "map_pin";

/** UI and content languages. Hindi content is hand-translated; others use the translation service when configured. */
export type Lang = "en" | "hi" | "pa" | "ur";
export const LANGS: Lang[] = ["en", "hi", "pa", "ur"];

/**
 * How a quiz is assembled.
 * standard: by category and difficulty. review: questions you got wrong, when due.
 * map: map pin questions. vulnerable: traditions with a high vulnerability score.
 * heritage: questions about one tradition or site. challenge: replay a friend's exact quiz.
 */
export type QuizMode = "standard" | "review" | "map" | "vulnerable" | "heritage" | "challenge";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface QuestionMedia {
  kind: "image" | "audio";
  url: string;
  alt: string;
  credit: string;
  creditUrl: string;
}

export type HvsBand = "Stable" | "Vulnerable" | "Critical";

export interface HeritageLink {
  id: string;
  kind: "tradition" | "site" | "food";
  name: string;
  hindi?: string;
  state?: string;
  location?: LatLng;
  /** Heritage Vulnerability Score (0 to 100, higher means more at risk) */
  hvs?: { score: number; band: HvsBand; isSample: boolean };
  archive?: { storyCount?: number; recordingUrl?: string };
}

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
  /** map_pin: where to centre the map */
  map?: { center: LatLng; zoom: number };
  media?: QuestionMedia;
  /** Language the question text is in (may fall back to English) */
  lang: Lang;
}

export type AnswerPayload =
  | { choice: number }
  | { order: number[] }
  | { pairs: number[] }
  | { point: LatLng }
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
export type CorrectAnswer =
  | { choice: number }
  | { order: number[] }
  | { pairs: number[] }
  | { point: LatLng; radiusKm: number; label: string; distanceKm?: number };

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
  links: HeritageLink[];
  points: PointsBreakdown;
  streak: number;
  score: number;
  answeredCount: number;
  totalQuestions: number;
  isLast: boolean;
}

export interface StartSessionRequest {
  mode?: QuizMode;
  category?: QuizCategoryParam;
  difficulty?: Difficulty;
  heritageId?: string;
  challengeCode?: string;
}

export interface SessionInfo {
  sessionId: string;
  mode: QuizMode;
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
  links: HeritageLink[];
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

export interface ChallengeComparison {
  code: string;
  creatorName: string;
  creatorScore: number;
  creatorTimeSeconds: number;
  youWon: boolean | null; // null = tie
  isCreator: boolean;
}

export interface QuizResult {
  attemptId: string;
  mode: QuizMode;
  heritage?: HeritageLink;
  challenge?: ChallengeComparison;
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
  review: ReviewSummary;
  recentAttempts: {
    attemptId: string;
    mode: QuizMode;
    category: QuizCategoryParam;
    difficulty: Difficulty;
    score: number;
    totalQuestions: number;
    points: number;
    completedAt: string;
  }[];
}

/** Spaced repetition: missed questions come back after 1, 3, 7, 14 and 30 days. */
export interface ReviewSummary {
  due: number;
  learning: number;
  mastered: number;
  nextDueAt: string | null;
}

// ─── Heritage (archive) links ────────────────────────────────────────────────

export interface HeritageQuizInfo {
  heritage: HeritageLink;
  /** Questions in one heritage quiz (linked questions, topped up with related ones) */
  questionCount: number;
  /** Questions directly about this entry */
  directCount: number;
}

// ─── Challenges ──────────────────────────────────────────────────────────────

export interface ChallengeInfo {
  code: string;
  creatorName: string;
  category: QuizCategoryParam;
  difficulty: Difficulty;
  totalQuestions: number;
  creatorScore: number;
  expiresAt: string;
  isCreator: boolean;
  alreadyPlayed: boolean;
  players: { displayName: string; score: number; timeSeconds: number; isYou: boolean }[];
}

// ─── Offline packs ───────────────────────────────────────────────────────────

/** A question with its answer key, for playing offline. Answers use original (unshuffled) positions. */
export interface OfflineQuestion {
  id: string;
  type: QuestionType;
  category: CategoryId;
  prompt: string;
  options?: string[];
  items?: string[];
  left?: string[];
  right?: string[];
  answer: { choice: number } | { order: number[] } | { pairs: number[] };
  correctAnswerText: string;
  explanation: Explanation;
  source: Source;
  media?: QuestionMedia;
}

export interface OfflinePack {
  packId: string;
  category: QuizCategoryParam;
  difficulty: Difficulty;
  lang: Lang;
  createdAt: string;
  expiresAt: string;
  questions: OfflineQuestion[];
}

export interface OfflineSubmission {
  answers: { questionId: string; answer: { choice: number } | { order: number[] } | { pairs: number[] }; timeMs: number }[];
}

export interface OfflineSyncResult {
  packId: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  alreadySynced: boolean;
}

// ─── Admin analytics ─────────────────────────────────────────────────────────

export interface QuestionStat {
  questionId: string;
  prompt: string;
  category: CategoryId;
  type: QuestionType;
  answered: number;
  correct: number;
  accuracy: number;
  avgTimeSeconds: number;
}

export interface AdminStats {
  totals: { players: number; quizzes: number; answers: number; dailyAnswers: number; redemptions: number };
  byCategory: { category: CategoryId; answered: number; accuracy: number }[];
  byType: { type: QuestionType; answered: number; accuracy: number }[];
  hardest: QuestionStat[];
  easiest: QuestionStat[];
  /** Traditions and sites people know least about: where awareness work is needed */
  awarenessGaps: { heritage: HeritageLink; answered: number; accuracy: number }[];
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
  links: HeritageLink[];
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
