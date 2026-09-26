import type {
  AnswerPayload,
  CategoryId,
  CategoryStats,
  DailyAnswerResult,
  DailyState,
  Difficulty,
  PointsBreakdown,
  QuizCategoryParam,
  QuizMode,
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
  /** Spaced repetition boxes for questions answered wrongly (box 6 = mastered) */
  review: Record<string, ReviewCard>;
  challengesWon: number;
}

export interface ReviewCard {
  box: number;
  due: string;
  lastSeen: string;
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
  mode: QuizMode;
  heritageId?: string;
  challengeCode?: string;
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
  mode: QuizMode;
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

export interface ChallengeDoc extends BaseDoc {
  /** id is the share code */
  creatorId: string;
  creatorName: string;
  attemptId: string;
  category: QuizCategoryParam;
  difficulty: Difficulty;
  questionIds: string[];
  layouts: Record<string, QuestionLayout>;
  creatorScore: number;
  creatorTimeSeconds: number;
  createdAt: string;
  expiresAt: string;
  players: { userId: string; displayName: string; score: number; timeSeconds: number; playedAt: string }[];
}

export interface OfflinePackDoc extends BaseDoc {
  userId: string;
  category: QuizCategoryParam;
  difficulty: Difficulty;
  questionIds: string[];
  createdAt: string;
  expiresAt: string;
  submittedAt?: string;
  score?: number;
  xpEarned?: number;
}

/** A Dharohar login. Quiz progress for this account is the UserDoc with id "u:<account id>". */
export interface AccountDoc extends BaseDoc {
  /** Lowercased */
  email: string;
  /** scrypt hash, absent for Google-only accounts */
  passwordHash?: string;
  googleSub?: string;
  displayName: string;
  avatarUrl?: string;
  /** Bumped to sign out every device (password change, "log out everywhere") */
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface QuestionStatDoc {
  id: string;
  answered: number;
  correct: number;
  totalTimeMs: number;
}

export interface Totals {
  players: number;
  quizzes: number;
  dailyAnswers: number;
  redemptions: number;
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
  /** Newest first. `before` is an ISO time; only older attempts are returned. */
  listAttempts(userId: string, limit: number, before?: string): Promise<AttemptDoc[]>;

  getDailyAnswer(userId: string, date: string): Promise<DailyAnswerDoc | null>;
  /** Returns false if the player already answered that day. */
  insertDailyAnswer(doc: DailyAnswerDoc): Promise<boolean>;
  listDailyAnswers(userId: string, limit: number, before?: string): Promise<DailyAnswerDoc[]>;

  insertRedemption(doc: RedemptionDoc): Promise<void>;
  listRedemptions(userId: string): Promise<RedemptionDoc[]>;

  insertChallenge(doc: ChallengeDoc): Promise<void>;
  getChallenge(code: string): Promise<ChallengeDoc | null>;
  updateChallenge(code: string, mutate: (c: ChallengeDoc) => void): Promise<ChallengeDoc>;

  insertOfflinePack(doc: OfflinePackDoc): Promise<void>;
  getOfflinePack(id: string): Promise<OfflinePackDoc | null>;
  updateOfflinePack(id: string, mutate: (p: OfflinePackDoc) => void): Promise<OfflinePackDoc>;
  listOfflinePacks(userId: string): Promise<OfflinePackDoc[]>;

  /** Accounts. insertAccount returns false if the email or Google id is already used. */
  insertAccount(doc: AccountDoc): Promise<boolean>;
  getAccount(id: string): Promise<AccountDoc | null>;
  findAccountByEmail(email: string): Promise<AccountDoc | null>;
  findAccountByGoogleSub(sub: string): Promise<AccountDoc | null>;
  updateAccount(id: string, mutate: (a: AccountDoc) => void): Promise<AccountDoc>;

  /**
   * Moves everything a player owns (attempts, daily answers, rewards, offline
   * packs, sessions, challenges) from one player id to another. Used when a
   * guest signs in. Daily answers for dates the target already has are dropped.
   */
  transferUserData(fromUserId: string, toUserId: string): Promise<void>;
  deleteUser(id: string): Promise<void>;

  /** Adds one answer to a question's running totals (atomic). */
  recordAnswerStat(questionId: string, correct: boolean, timeMs: number): Promise<void>;
  listAnswerStats(): Promise<QuestionStatDoc[]>;
  totals(): Promise<Totals>;

  topUsers(field: LeaderboardField, limit: number): Promise<UserDoc[]>;
  countUsersAbove(field: LeaderboardField, value: number): Promise<number>;

  close(): Promise<void>;
}

export function readField(user: UserDoc, field: LeaderboardField): number {
  if (field === "xp") return user.xp;
  const cat = field.split(".")[1] as CategoryId;
  return user.stats[cat]?.xp ?? 0;
}
