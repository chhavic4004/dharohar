import type {
  AnswerPayload,
  CategoryId,
  CategoryStats,
  DailyAnswerResult,
  DailyState,
  Difficulty,
  PointsBreakdown,
  QuizCategoryParam,
  QuizResult,
} from "../../../shared/quiz-contract";

/** Every stored document has an id and a version used for safe concurrent updates. */
export interface BaseDoc {
  id: string;
  version: number;
}

export interface UserDoc extends BaseDoc {
  displayName: string;
  createdAt: string;
  updatedAt: string;
  xp: number;
  coins: number;
  quizzesCompleted: number;
  correctAnswers: number;
  totalAnswered: number;
  bestStreak: number;
  daily: DailyState;
  badges: { id: string; earnedAt: string }[];
  stats: Partial<Record<CategoryId, CategoryStats>>;
  mixedBest: { seeker: number | null; historian: number | null };
  categoriesPlayed: CategoryId[];
  /** Recently served question ids per "<category>:<difficulty>", newest last */
  recentQuestions: Record<string, string[]>;
}

/** How a question was laid out for this player (display position -> original index). */
export interface QuestionLayout {
  order?: number[];
  right?: number[];
}

export interface AnswerRecord {
  questionId: string;
  response: AnswerPayload;
  correct: boolean;
  timedOut: boolean;
  timeMs: number;
  points: PointsBreakdown;
}

export interface SessionDoc extends BaseDoc {
  userId: string;
  category: QuizCategoryParam;
  difficulty: Difficulty;
  questionIds: string[];
  layouts: Record<string, QuestionLayout>;
  servedAt: Record<string, string>;
  answers: AnswerRecord[];
  streak: number;
  bestStreak: number;
  score: number;
  status: "active" | "completed";
  createdAt: string;
  completedAt?: string;
  attemptId?: string;
}

export interface AttemptDoc extends BaseDoc {
  userId: string;
  sessionId: string;
  category: QuizCategoryParam;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  points: number;
  coins: number;
  completedAt: string;
  result: QuizResult;
}

export interface DailyAnswerDoc extends BaseDoc {
  userId: string;
  date: string;
  questionId: string;
  response: AnswerPayload;
  correct: boolean;
  answeredAt: string;
  result: DailyAnswerResult;
}

export interface RedemptionDoc extends BaseDoc {
  userId: string;
  rewardId: string;
  title: string;
  partner: string;
  discountLabel: string;
  code: string;
  cost: number;
  redeemedAt: string;
  expiresAt: string;
}

export type LeaderboardField = "xp" | `stats.${CategoryId}.xp`;

/**
 * Storage contract. Two implementations exist: FileStore (default, zero
 * setup) and MongoStore (set MONGODB_URI). Swap freely; the service layer
 * only talks to this interface.
 */
export interface Store {
  getUser(id: string): Promise<UserDoc | null>;
  insertUser(user: UserDoc): Promise<UserDoc>;
  /** Read-modify-write with optimistic locking. The mutator may throw to abort. */
  updateUser(id: string, mutate: (user: UserDoc) => void): Promise<UserDoc>;

  insertSession(session: SessionDoc): Promise<void>;
  getSession(id: string): Promise<SessionDoc | null>;
  updateSession(id: string, mutate: (session: SessionDoc) => void): Promise<SessionDoc>;

  insertAttempt(attempt: AttemptDoc): Promise<void>;
  getAttempt(id: string): Promise<AttemptDoc | null>;
  listAttempts(userId: string, limit: number): Promise<AttemptDoc[]>;

  getDailyAnswer(userId: string, date: string): Promise<DailyAnswerDoc | null>;
  /** Returns false if the player already answered that day. */
  insertDailyAnswer(doc: DailyAnswerDoc): Promise<boolean>;

  insertRedemption(doc: RedemptionDoc): Promise<void>;
  listRedemptions(userId: string): Promise<RedemptionDoc[]>;

  topUsers(field: LeaderboardField, limit: number): Promise<UserDoc[]>;
  countUsersAbove(field: LeaderboardField, value: number): Promise<number>;

  close(): Promise<void>;
}

export function readField(user: UserDoc, field: LeaderboardField): number {
  if (field === "xp") return user.xp;
  const cat = field.split(".")[1] as CategoryId;
  return user.stats[cat]?.xp ?? 0;
}
