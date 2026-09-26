import {
  HISTORIAN_SECONDS,
  QUESTIONS_PER_QUIZ,
  type AdminStats,
  type AnswerPayload,
  type AnswerResult,
  type Badge,
  type CategoryId,
  type CategoryStats,
  type ChallengeComparison,
  type ChallengeInfo,
  type DailyAnswerResult,
  type DailyChallenge,
  type Difficulty,
  type HeritageLink,
  type HeritageQuizInfo,
  type Lang,
  type LeaderboardResponse,
  type NextQuestionResponse,
  type OfflinePack,
  type OfflineQuestion,
  type OfflineSubmission,
  type OfflineSyncResult,
  type PlayerProfile,
  type QuestionStat,
  type QuestionType,
  type QuizCategoryParam,
  type QuizMode,
  type QuizResult,
  type RedeemResponse,
  type Redemption,
  type Reward,
  type ReviewItem,
  type SessionInfo,
  type StartSessionRequest,
} from "../../../../shared/quiz-contract";
import { ApiError } from "../../middleware/errors";
import type { RequestUser } from "../../middleware/requireUser";
import { istDateKey, istDayNumber, nextIstMidnight, previousDateKey } from "../../utils/date";
import { couponCode, newId, seededShuffle, shuffle } from "../../utils/random";
import type { AnswerRecord, LeaderboardField, QuestionLayout, RedemptionDoc, SessionDoc, Store, UserDoc } from "../../store/types";
import {
  categorySummaries,
  CATEGORIES,
  DAILY_BANK,
  getQuestion,
  QUIZ_BANK,
  questionsFor,
  questionsForHeritage,
  type BankQuestion,
} from "./bank";
import { answerPoints, BADGES, badgeById, levelFor, ratingFor, SCORING } from "./gamification";
import { heritageLinks } from "./heritage/adapter";
import { heritageById, toLink } from "./heritage/registry";
import { localize } from "./i18n";
import { correctAnswerFor, correctAnswerText, createLayout, grade, identityLayout, responseText, toPublic } from "./present";
import { applyReview, dueQuestionIds, summarize } from "./review";
import { REWARDS, rewardById } from "./rewards.catalog";

const RECENT_LIMIT = 20;
const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
const CHALLENGE_DAYS = 14;
const OFFLINE_PACK_DAYS = 7;
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function emptyStats(): CategoryStats {
  return { quizzes: 0, correct: 0, answered: 0, xp: 0, bestScore: { seeker: null, historian: null } };
}

function newUser(user: RequestUser, now: string): UserDoc {
  return {
    id: user.id,
    version: 0,
    displayName: user.displayName ?? `Explorer ${user.id.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase()}`,
    createdAt: now,
    updatedAt: now,
    xp: 0,
    coins: 0,
    quizzesCompleted: 0,
    correctAnswers: 0,
    totalAnswered: 0,
    bestStreak: 0,
    daily: { streak: 0, longestStreak: 0, lastDate: null, totalAnswered: 0, totalCorrect: 0 },
    badges: [],
    stats: {},
    mixedBest: { seeker: null, historian: null },
    categoriesPlayed: [],
    recentQuestions: {},
    review: {},
    challengesWon: 0,
  };
}

/** Fills fields added after a player's record was first created. */
function normalize(u: UserDoc): UserDoc {
  u.review ??= {};
  u.challengesWon ??= 0;
  u.mixedBest ??= { seeker: null, historian: null };
  u.categoriesPlayed ??= [];
  u.recentQuestions ??= {};
  return u;
}

function mustGet(id: string): BankQuestion {
  const q = getQuestion(id);
  if (!q) throw new ApiError(500, "bank_mismatch", `Question ${id} is no longer in the bank`);
  return q;
}

function award(user: UserDoc, ids: string[], now: string): Badge[] {
  const have = new Set(user.badges.map((b) => b.id));
  const fresh: Badge[] = [];
  for (const id of ids) {
    if (have.has(id) || !badgeById.has(id)) continue;
    user.badges.push({ id, earnedAt: now });
    fresh.push({ ...badgeById.get(id)!, earnedAt: now });
  }
  return fresh;
}

function randomCode(length = 6): string {
  return Array.from({ length }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
}

function isVulnerable(q: BankQuestion): boolean {
  return (q.links ?? []).some((id) => (heritageById.get(id)?.sampleHvs ?? 0) >= 34);
}

export class QuizService {
  constructor(
    private store: Store,
    private clock: () => Date = () => new Date(),
  ) {}

  private nowIso() {
    return this.clock().toISOString();
  }

  // ─── Players ────────────────────────────────────────────────────────────────

  async ensureUser(user: RequestUser): Promise<UserDoc> {
    const existing = await this.store.getUser(user.id);
    return normalize(existing ?? (await this.store.insertUser(newUser(user, this.nowIso()))));
  }

  private async updateUser(id: string, mutate: (u: UserDoc) => void) {
    return this.store.updateUser(id, (u) => mutate(normalize(u)));
  }

  private effectiveDailyStreak(u: UserDoc, today: string): number {
    const last = u.daily.lastDate;
    if (!last) return 0;
    return last === today || last === previousDateKey(today) ? u.daily.streak : 0;
  }

  async getProfile(user: RequestUser): Promise<PlayerProfile> {
    const u = await this.ensureUser(user);
    const attempts = await this.store.listAttempts(u.id, 10);
    const earned = new Set(u.badges.map((b) => b.id));
    return {
      id: u.id,
      displayName: u.displayName,
      coins: u.coins,
      level: levelFor(u.xp),
      quizzesCompleted: u.quizzesCompleted,
      correctAnswers: u.correctAnswers,
      totalAnswered: u.totalAnswered,
      bestStreak: u.bestStreak,
      daily: { ...u.daily, streak: this.effectiveDailyStreak(u, istDateKey(this.clock())) },
      badges: u.badges.filter((b) => badgeById.has(b.id)).map((b) => ({ ...badgeById.get(b.id)!, earnedAt: b.earnedAt })),
      lockedBadges: BADGES.filter((b) => !earned.has(b.id)),
      stats: u.stats,
      review: summarize(u.review, this.clock()),
      recentAttempts: attempts.map((a) => ({
        attemptId: a.id,
        mode: a.mode ?? "standard",
        category: a.category,
        difficulty: a.difficulty,
        score: a.score,
        totalQuestions: a.totalQuestions,
        points: a.points,
        completedAt: a.completedAt,
      })),
    };
  }

  async updateDisplayName(user: RequestUser, displayName: string): Promise<PlayerProfile> {
    await this.ensureUser(user);
    await this.updateUser(user.id, (u) => {
      u.displayName = displayName;
      u.updatedAt = this.nowIso();
    });
    return this.getProfile(user);
  }

  // ─── Heritage (archive links) ───────────────────────────────────────────────

  listCategories() {
    return categorySummaries();
  }

  heritageInfo(ids: string[]): HeritageQuizInfo[] {
    return heritageLinks(ids).map((heritage) => ({ heritage, questionCount: questionsForHeritage(heritage.id).length }));
  }

  // ─── Quiz sessions ──────────────────────────────────────────────────────────

  /** Picks up to n questions, preferring ones this player has not seen recently. O(pool). */
  private pickFresh(u: UserDoc, pool: BankQuestion[], key: string, n = QUESTIONS_PER_QUIZ): BankQuestion[] {
    const recent = new Set(u.recentQuestions[key] ?? []);
    const unseen = shuffle(pool.filter((q) => !recent.has(q.id)));
    const seen = shuffle(pool.filter((q) => recent.has(q.id)));
    return [...unseen, ...seen].slice(0, Math.min(n, pool.length));
  }

  async startSession(user: RequestUser, req: StartSessionRequest): Promise<SessionInfo> {
    const u = await this.ensureUser(user);
    const mode: QuizMode = req.mode ?? "standard";
    let category: QuizCategoryParam = req.category ?? "mixed";
    let difficulty: Difficulty = req.difficulty ?? "seeker";
    let picked: BankQuestion[] = [];
    let layouts: Record<string, QuestionLayout> | null = null;
    let recentKey: string | null = null;

    switch (mode) {
      case "standard": {
        if (!req.category || !req.difficulty) throw new ApiError(400, "invalid_request", "Choose a category and difficulty.");
        recentKey = `${category}:${difficulty}`;
        picked = this.pickFresh(u, questionsFor(category, difficulty), recentKey);
        break;
      }
      case "map": {
        category = "mixed";
        recentKey = `map:${difficulty}`;
        picked = this.pickFresh(u, QUIZ_BANK.filter((q) => q.type === "map_pin" && q.difficulty === difficulty), recentKey);
        break;
      }
      case "vulnerable": {
        category = "mixed";
        recentKey = `vulnerable:${difficulty}`;
        picked = this.pickFresh(u, QUIZ_BANK.filter((q) => q.difficulty === difficulty && isVulnerable(q)), recentKey);
        break;
      }
      case "heritage": {
        if (!req.heritageId || !heritageById.has(req.heritageId)) throw new ApiError(404, "not_found", "That tradition or site was not found.");
        category = "mixed";
        difficulty = "seeker";
        picked = shuffle(questionsForHeritage(req.heritageId)).slice(0, QUESTIONS_PER_QUIZ);
        break;
      }
      case "review": {
        category = "mixed";
        difficulty = "seeker";
        picked = dueQuestionIds(u.review, this.clock())
          .map((id) => getQuestion(id))
          .filter((q): q is BankQuestion => !!q)
          .slice(0, QUESTIONS_PER_QUIZ);
        if (!picked.length) throw new ApiError(409, "nothing_due", "Nothing to revise right now. Missed questions come back here when they are due.");
        break;
      }
      case "challenge": {
        const ch = req.challengeCode ? await this.store.getChallenge(req.challengeCode.toUpperCase()) : null;
        if (!ch) throw new ApiError(404, "not_found", "Challenge not found. Check the code and try again.");
        if (new Date(ch.expiresAt) < this.clock()) throw new ApiError(410, "expired", "This challenge has expired.");
        if (ch.players.some((p) => p.userId === u.id)) throw new ApiError(409, "already_played", "You have already played this challenge.");
        category = ch.category;
        difficulty = ch.difficulty;
        picked = ch.questionIds.map(mustGet);
        layouts = ch.layouts;
        break;
      }
    }

    if (picked.length === 0) throw new ApiError(404, "no_questions", "No questions are available for this selection yet.");
    if (!layouts) {
      layouts = {};
      for (const q of picked) layouts[q.id] = createLayout(q);
    }

    const id = newId();
    await this.store.insertSession({
      id,
      version: 0,
      userId: u.id,
      mode,
      heritageId: req.heritageId,
      challengeCode: mode === "challenge" ? req.challengeCode!.toUpperCase() : undefined,
      category,
      difficulty,
      questionIds: picked.map((q) => q.id),
      layouts,
      servedAt: {},
      answers: [],
      streak: 0,
      bestStreak: 0,
      score: 0,
      status: "active",
      createdAt: this.nowIso(),
    });

    if (recentKey) {
      const key = recentKey;
      await this.updateUser(u.id, (doc) => {
        doc.recentQuestions[key] = [...(doc.recentQuestions[key] ?? []), ...picked.map((q) => q.id)].slice(-RECENT_LIMIT);
      });
    }

    return {
      sessionId: id,
      mode,
      category,
      difficulty,
      totalQuestions: picked.length,
      timeLimitSeconds: difficulty === "historian" ? HISTORIAN_SECONDS : null,
    };
  }

  private async ownSession(user: RequestUser, sessionId: string) {
    const s = await this.store.getSession(sessionId);
    if (!s || s.userId !== user.id) throw new ApiError(404, "not_found", "Quiz session not found");
    s.mode ??= "standard";
    return s;
  }

  /** The question the player should answer now. Safe to call again after a page refresh. */
  async currentQuestion(user: RequestUser, sessionId: string, lang: Lang = "en"): Promise<NextQuestionResponse> {
    const s = await this.ownSession(user, sessionId);
    const index = s.answers.length;
    if (s.status === "completed" || index >= s.questionIds.length)
      throw new ApiError(409, "quiz_finished", "All questions are answered. Finish the quiz to see your result.");

    const qid = s.questionIds[index];
    let servedAt = s.servedAt[qid];
    if (!servedAt) {
      servedAt = this.nowIso();
      await this.store.updateSession(sessionId, (doc) => {
        doc.servedAt[qid] ??= servedAt!;
      });
    }
    const local = await localize(mustGet(qid), lang);
    return { index, totalQuestions: s.questionIds.length, question: toPublic(local.q, s.layouts[qid], local.lang), servedAt };
  }

  async submitAnswer(user: RequestUser, sessionId: string, questionId: string, payload: AnswerPayload, lang: Lang = "en"): Promise<AnswerResult> {
    const s = await this.ownSession(user, sessionId);
    const index = s.answers.length;
    if (s.status === "completed" || index >= s.questionIds.length) throw new ApiError(409, "quiz_finished", "This quiz is already finished.");
    if (s.questionIds[index] !== questionId) throw new ApiError(409, "out_of_order", "That is not the current question.");
    const servedAt = s.servedAt[questionId];
    if (!servedAt) throw new ApiError(409, "not_served", "Load the question before answering it.");

    const q = mustGet(questionId);
    const layout = s.layouts[questionId];
    const now = this.clock();
    const seconds = Math.max(0, (now.getTime() - new Date(servedAt).getTime()) / 1000);
    const overTime = s.difficulty === "historian" && seconds > HISTORIAN_SECONDS + SCORING.graceSeconds;
    const timedOut = "timedOut" in payload || overTime;
    const correct = timedOut ? false : grade(q, layout, payload);
    const newStreak = correct ? s.streak + 1 : 0;
    const points = answerPoints(s.difficulty, correct, seconds, newStreak);

    const record: AnswerRecord = {
      questionId,
      response: timedOut ? { timedOut: true } : payload,
      correct,
      timedOut,
      timeMs: Math.round(seconds * 1000),
      points,
    };

    const updated = await this.store.updateSession(sessionId, (doc) => {
      if (doc.answers.length !== index) throw new ApiError(409, "already_answered", "This question was already answered.");
      doc.answers.push(record);
      doc.streak = newStreak;
      doc.bestStreak = Math.max(doc.bestStreak, newStreak);
      if (correct) doc.score += 1;
    });

    await Promise.all([
      this.store.recordAnswerStat(questionId, correct, record.timeMs),
      this.updateUser(user.id, (u) => {
        if (applyReview(u.review, questionId, correct, now)) award(u, ["second-chance"], now.toISOString());
      }),
    ]);

    const local = await localize(q, lang);
    return {
      correct,
      timedOut,
      correctAnswer: correctAnswerFor(q, layout, timedOut ? undefined : payload),
      correctAnswerText: correctAnswerText(local.q, local.lang),
      explanation: local.q.explanation,
      source: q.source,
      links: heritageLinks(q.links),
      points,
      streak: updated.streak,
      score: updated.score,
      answeredCount: updated.answers.length,
      totalQuestions: updated.questionIds.length,
      isLast: updated.answers.length === updated.questionIds.length,
    };
  }

  async completeSession(user: RequestUser, sessionId: string, lang: Lang = "en"): Promise<QuizResult> {
    const s = await this.ownSession(user, sessionId);
    if (s.status === "completed" && s.attemptId) return (await this.store.getAttempt(s.attemptId))!.result;
    if (s.answers.length < s.questionIds.length) throw new ApiError(409, "quiz_incomplete", "Answer every question before finishing.");

    const now = this.nowIso();
    const total = s.questionIds.length;
    const perfect = s.score === total && total >= QUESTIONS_PER_QUIZ;
    const sum = (k: "base" | "speed" | "streak") => s.answers.reduce((n, a) => n + a.points[k], 0);
    const points = { base: sum("base"), speed: sum("speed"), streak: sum("streak"), perfectBonus: perfect ? SCORING.perfectBonus[s.difficulty] : 0, total: 0 };
    points.total = points.base + points.speed + points.streak + points.perfectBonus;
    const coinsEarned = Math.floor(points.total / SCORING.coinDivisor);
    const accuracy = Math.round((s.score / total) * 100);
    const totalMs = s.answers.reduce((n, a) => n + a.timeMs, 0);
    const totalSeconds = Math.round(totalMs / 1000);

    const byType = new Map<QuestionType, { correct: number; total: number }>();
    const byCategory = new Map<CategoryId, { correct: number; total: number; xp: number }>();
    const review: ReviewItem[] = [];
    for (const a of s.answers) {
      const q = mustGet(a.questionId);
      const local = await localize(q, lang);
      const t = byType.get(q.type) ?? { correct: 0, total: 0 };
      t.total++;
      if (a.correct) t.correct++;
      byType.set(q.type, t);
      const c = byCategory.get(q.category) ?? { correct: 0, total: 0, xp: 0 };
      c.total++;
      if (a.correct) c.correct++;
      c.xp += a.points.total;
      byCategory.set(q.category, c);
      review.push({
        questionId: q.id,
        type: q.type,
        prompt: local.q.prompt,
        category: q.category,
        yourAnswerText: responseText(local.q, s.layouts[q.id], a.response, local.lang),
        correctAnswerText: correctAnswerText(local.q, local.lang),
        correct: a.correct,
        timedOut: a.timedOut,
        timeTakenSeconds: Math.round(a.timeMs / 100) / 10,
        points: a.points.total,
        explanation: local.q.explanation,
        source: q.source,
        links: heritageLinks(q.links),
      });
    }

    // Challenge comparison
    let challenge: ChallengeComparison | undefined;
    if (s.mode === "challenge" && s.challengeCode) {
      const code = s.challengeCode;
      const me = await this.ensureUser(user);
      const ch = await this.store.updateChallenge(code, (doc) => {
        if (!doc.players.some((p) => p.userId === user.id))
          doc.players.push({ userId: user.id, displayName: me.displayName, score: s.score, timeSeconds: totalSeconds, playedAt: now });
      });
      const beatCreator = s.score > ch.creatorScore || (s.score === ch.creatorScore && totalSeconds < ch.creatorTimeSeconds);
      const tie = s.score === ch.creatorScore && totalSeconds === ch.creatorTimeSeconds;
      challenge = {
        code,
        creatorName: ch.creatorName,
        creatorScore: ch.creatorScore,
        creatorTimeSeconds: ch.creatorTimeSeconds,
        youWon: tie ? null : beatCreator,
        isCreator: ch.creatorId === user.id,
      };
    }

    const attemptId = newId();
    let levelBefore = levelFor(0);
    let previousBest: number | null = null;
    let newBadges: Badge[] = [];
    let coinBalance = 0;

    const userAfter = await this.updateUser(user.id, (u) => {
      levelBefore = levelFor(u.xp);
      if (s.mode === "standard")
        previousBest = s.category === "mixed" ? u.mixedBest[s.difficulty] : (u.stats[s.category]?.bestScore[s.difficulty] ?? null);

      u.xp += points.total;
      u.coins += coinsEarned;
      u.quizzesCompleted += 1;
      u.correctAnswers += s.score;
      u.totalAnswered += total;
      u.bestStreak = Math.max(u.bestStreak, s.bestStreak);
      u.updatedAt = now;

      for (const [cat, c] of byCategory) {
        const st = u.stats[cat] ?? emptyStats();
        st.correct += c.correct;
        st.answered += c.total;
        st.xp += c.xp;
        u.stats[cat] = st;
      }
      if (s.mode === "standard") {
        if (s.category === "mixed") {
          u.mixedBest[s.difficulty] = Math.max(u.mixedBest[s.difficulty] ?? 0, s.score);
        } else {
          const st = u.stats[s.category] ?? emptyStats();
          st.quizzes += 1;
          st.bestScore[s.difficulty] = Math.max(st.bestScore[s.difficulty] ?? 0, s.score);
          u.stats[s.category] = st;
          if (!u.categoriesPlayed.includes(s.category)) u.categoriesPlayed.push(s.category);
        }
      }
      if (challenge?.youWon && !challenge.isCreator) u.challengesWon += 1;

      const ids = ["first-steps"];
      if (s.bestStreak >= 5) ids.push("on-a-roll");
      if (perfect) ids.push("flawless");
      if (perfect && s.difficulty === "historian") ids.push("archive-master");
      if (s.difficulty === "historian" && accuracy >= 80 && total >= QUESTIONS_PER_QUIZ && totalMs / total < 10_000) ids.push("quick-mind");
      if (s.mode === "standard" && s.difficulty === "historian" && accuracy >= 80 && s.category !== "mixed") ids.push(`scholar-${s.category}`);
      if (CATEGORY_IDS.every((c) => u.categoriesPlayed.includes(c))) ids.push("across-india");
      if (u.correctAnswers >= 100) ids.push("century");
      if (s.mode === "map" && accuracy >= 80) ids.push("cartographer");
      if (s.mode === "vulnerable" && accuracy >= 80) ids.push("guardian");
      if (challenge?.youWon && !challenge.isCreator) ids.push("challenger");
      if (lang !== "en") ids.push("polyglot");
      newBadges = award(u, ids, now);
      coinBalance = u.coins;
    });

    const heritage = s.heritageId && heritageById.has(s.heritageId) ? toLink(heritageById.get(s.heritageId)!) : undefined;
    const result: QuizResult = {
      attemptId,
      mode: s.mode,
      heritage,
      challenge,
      category: s.category,
      difficulty: s.difficulty,
      score: s.score,
      totalQuestions: total,
      accuracy,
      bestStreak: s.bestStreak,
      totalTimeSeconds: totalSeconds,
      averageTimeSeconds: Math.round(totalMs / total / 100) / 10,
      points,
      coinsEarned,
      coinBalance,
      levelBefore,
      levelAfter: levelFor(userAfter.xp),
      newBadges,
      previousBest,
      isPersonalBest: s.mode === "standard" && (previousBest === null || s.score > previousBest),
      rating: ratingFor(accuracy),
      byType: [...byType].map(([type, v]) => ({ type, ...v })),
      byCategory: [...byCategory].map(([category, v]) => ({ category, correct: v.correct, total: v.total })),
      review,
    };

    await this.store.insertAttempt({
      id: attemptId,
      version: 0,
      userId: user.id,
      sessionId,
      mode: s.mode,
      category: s.category,
      difficulty: s.difficulty,
      score: s.score,
      totalQuestions: total,
      points: points.total,
      coins: coinsEarned,
      completedAt: now,
      result,
    });
    await this.store.updateSession(sessionId, (doc) => {
      doc.status = "completed";
      doc.completedAt = now;
      doc.attemptId = attemptId;
    });
    return result;
  }

  async getAttempt(user: RequestUser, attemptId: string): Promise<QuizResult> {
    const a = await this.store.getAttempt(attemptId);
    if (!a || a.userId !== user.id) throw new ApiError(404, "not_found", "Result not found");
    return a.result;
  }

  // ─── Challenges ─────────────────────────────────────────────────────────────

  async createChallenge(user: RequestUser, attemptId: string): Promise<ChallengeInfo> {
    const u = await this.ensureUser(user);
    const attempt = await this.store.getAttempt(attemptId);
    if (!attempt || attempt.userId !== u.id) throw new ApiError(404, "not_found", "Result not found");
    const session = await this.store.getSession(attempt.sessionId);
    if (!session) throw new ApiError(404, "not_found", "The quiz for this result is no longer available.");

    let code = randomCode();
    for (let i = 0; i < 5 && (await this.store.getChallenge(code)); i++) code = randomCode();
    const now = this.clock();
    await this.store.insertChallenge({
      id: code,
      version: 0,
      creatorId: u.id,
      creatorName: u.displayName,
      attemptId,
      category: session.category,
      difficulty: session.difficulty,
      questionIds: session.questionIds,
      layouts: session.layouts,
      creatorScore: attempt.score,
      creatorTimeSeconds: attempt.result.totalTimeSeconds,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + CHALLENGE_DAYS * 86_400_000).toISOString(),
      players: [],
    });
    return this.getChallengeInfo(user, code);
  }

  async getChallengeInfo(user: RequestUser, code: string): Promise<ChallengeInfo> {
    const ch = await this.store.getChallenge(code.toUpperCase());
    if (!ch) throw new ApiError(404, "not_found", "Challenge not found. Check the code and try again.");
    return {
      code: ch.id,
      creatorName: ch.creatorName,
      category: ch.category,
      difficulty: ch.difficulty,
      totalQuestions: ch.questionIds.length,
      creatorScore: ch.creatorScore,
      expiresAt: ch.expiresAt,
      isCreator: ch.creatorId === user.id,
      alreadyPlayed: ch.players.some((p) => p.userId === user.id),
      players: [...ch.players]
        .sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds)
        .slice(0, 20)
        .map((p) => ({ displayName: p.displayName, score: p.score, timeSeconds: p.timeSeconds, isYou: p.userId === user.id })),
    };
  }

  // ─── Problem of the Day ─────────────────────────────────────────────────────

  /** Same question for every player on a given IST day; the full pool is used before any repeat. */
  private dailyQuestionFor(date: Date): { q: BankQuestion; layout: QuestionLayout; dateKey: string } {
    const day = istDayNumber(date);
    const n = DAILY_BANK.length;
    const cycle = Math.floor(day / n);
    const order = seededShuffle(DAILY_BANK.map((q) => q.id), `daily-cycle-${cycle}`);
    const q = mustGet(order[day % n]);
    const dateKey = istDateKey(date);
    const layout = createLayout(q, (arr) => seededShuffle(arr, `${dateKey}:${q.id}`));
    return { q, layout, dateKey };
  }

  async getDaily(user: RequestUser, lang: Lang = "en"): Promise<DailyChallenge> {
    const u = await this.ensureUser(user);
    const now = this.clock();
    const { q, layout, dateKey } = this.dailyQuestionFor(now);
    const answer = await this.store.getDailyAnswer(u.id, dateKey);
    const local = await localize(q, lang);
    return {
      date: dateKey,
      question: toPublic(local.q, layout, local.lang),
      answered: !!answer,
      result: answer?.result ?? null,
      streak: this.effectiveDailyStreak(u, dateKey),
      longestStreak: u.daily.longestStreak,
      streakAtRisk: !answer && u.daily.lastDate === previousDateKey(dateKey),
      nextResetAt: nextIstMidnight(now),
    };
  }

  async answerDaily(user: RequestUser, payload: AnswerPayload, lang: Lang = "en"): Promise<DailyAnswerResult> {
    const u = await this.ensureUser(user);
    const now = this.clock();
    const { q, layout, dateKey } = this.dailyQuestionFor(now);
    if (await this.store.getDailyAnswer(u.id, dateKey))
      throw new ApiError(409, "already_answered", "You have already answered today's problem. Come back tomorrow.");
    if ("timedOut" in payload) throw new ApiError(400, "invalid_answer", "The daily problem has no timer.");

    const correct = grade(q, layout, payload);
    const local = await localize(q, lang);
    const d = SCORING.daily;
    const nowIso = now.toISOString();
    let result!: DailyAnswerResult;

    await this.updateUser(u.id, (doc) => {
      const continues = doc.daily.lastDate === previousDateKey(dateKey);
      const streak = continues ? doc.daily.streak + 1 : 1;
      const streakCoins = correct ? Math.min(streak, d.streakCoinCap) : 0;
      const coins = (correct ? d.coinsCorrect : d.coinsWrong) + streakCoins;
      const xp = correct ? d.xpCorrect : d.xpWrong;
      doc.daily = {
        streak,
        longestStreak: Math.max(doc.daily.longestStreak, streak),
        lastDate: dateKey,
        totalAnswered: doc.daily.totalAnswered + 1,
        totalCorrect: doc.daily.totalCorrect + (correct ? 1 : 0),
      };
      doc.coins += coins;
      doc.xp += xp;
      doc.updatedAt = nowIso;
      const ids: string[] = [];
      if (streak >= 3) ids.push("daily-3");
      if (streak >= 7) ids.push("daily-7");
      if (streak >= 30) ids.push("daily-30");
      result = {
        correct,
        correctAnswer: correctAnswerFor(q, layout, payload),
        correctAnswerText: correctAnswerText(local.q, local.lang),
        yourAnswerText: responseText(local.q, layout, payload, local.lang),
        explanation: local.q.explanation,
        source: q.source,
        links: heritageLinks(q.links),
        coinsEarned: coins,
        xpEarned: xp,
        streak,
        longestStreak: doc.daily.longestStreak,
        newBadges: award(doc, ids, nowIso),
      };
    });

    const inserted = await this.store.insertDailyAnswer({
      id: `${u.id}|${dateKey}`,
      version: 0,
      userId: u.id,
      date: dateKey,
      questionId: q.id,
      response: payload,
      correct,
      answeredAt: nowIso,
      result,
    });
    if (!inserted) throw new ApiError(409, "already_answered", "You have already answered today's problem.");
    await this.store.recordAnswerStat(q.id, correct, 0);
    return result;
  }

  // ─── Offline packs ──────────────────────────────────────────────────────────

  private async toOffline(q: BankQuestion, lang: Lang): Promise<OfflineQuestion> {
    const local = await localize(q, lang);
    const lq = local.q;
    const base = {
      id: q.id,
      type: q.type,
      category: q.category,
      prompt: lq.prompt,
      correctAnswerText: correctAnswerText(lq, local.lang),
      explanation: lq.explanation,
      source: q.source,
      ...(q.media?.kind === "image" ? { media: q.media } : {}),
    };
    switch (lq.type) {
      case "mcq":
      case "odd_one_out":
        return { ...base, options: lq.options, answer: { choice: lq.answer } };
      case "true_false": {
        const pub = toPublic(lq, {}, local.lang);
        return { ...base, options: pub.options!.map((o) => o.text), answer: { choice: lq.answer ? 0 : 1 } };
      }
      case "chronology":
        return { ...base, items: lq.items, answer: { order: lq.items.map((_, i) => i) } };
      case "match":
        return { ...base, left: lq.pairs.map((p) => p[0]), right: lq.pairs.map((p) => p[1]), answer: { pairs: lq.pairs.map((_, i) => i) } };
      case "map_pin":
        throw new Error("Map questions are not available offline");
    }
  }

  async createOfflinePack(user: RequestUser, category: QuizCategoryParam, difficulty: Difficulty, lang: Lang = "en"): Promise<OfflinePack> {
    const u = await this.ensureUser(user);
    // Map pins need map tiles and audio needs streaming, so both stay online-only.
    const pool = questionsFor(category, difficulty).filter((q) => q.type !== "map_pin" && q.media?.kind !== "audio");
    const picked = this.pickFresh(u, pool, `offline:${category}:${difficulty}`);
    const now = this.clock();
    const id = newId();
    const expiresAt = new Date(now.getTime() + OFFLINE_PACK_DAYS * 86_400_000).toISOString();
    await this.store.insertOfflinePack({
      id,
      version: 0,
      userId: u.id,
      category,
      difficulty,
      questionIds: picked.map((q) => q.id),
      createdAt: now.toISOString(),
      expiresAt,
    });
    return {
      packId: id,
      category,
      difficulty,
      lang,
      createdAt: now.toISOString(),
      expiresAt,
      questions: await Promise.all(picked.map((q) => this.toOffline(q, lang))),
    };
  }

  async submitOfflinePack(user: RequestUser, packId: string, submission: OfflineSubmission): Promise<OfflineSyncResult> {
    const pack = await this.store.getOfflinePack(packId);
    if (!pack || pack.userId !== user.id) throw new ApiError(404, "not_found", "Offline pack not found");
    if (pack.submittedAt) return { packId, score: pack.score ?? 0, totalQuestions: pack.questionIds.length, xpEarned: pack.xpEarned ?? 0, alreadySynced: true };
    if (new Date(pack.expiresAt) < this.clock()) throw new ApiError(410, "expired", "This offline pack expired before it was synced.");

    const allowed = new Set(pack.questionIds);
    const seen = new Set<string>();
    let score = 0;
    const now = this.clock();
    const graded: { id: string; correct: boolean; timeMs: number }[] = [];
    for (const a of submission.answers) {
      if (!allowed.has(a.questionId) || seen.has(a.questionId)) continue;
      seen.add(a.questionId);
      const q = mustGet(a.questionId);
      let correct = false;
      try {
        correct = grade(q, identityLayout(q), a.answer);
      } catch {
        correct = false;
      }
      if (correct) score++;
      graded.push({ id: q.id, correct, timeMs: Math.max(0, Math.min(a.timeMs, 600_000)) });
    }
    const xpEarned = score * SCORING.offlineXpPerCorrect;

    await this.updateUser(user.id, (u) => {
      u.xp += xpEarned;
      u.correctAnswers += score;
      u.totalAnswered += graded.length;
      for (const g of graded) {
        applyReview(u.review, g.id, g.correct, now);
        const q = mustGet(g.id);
        const st = u.stats[q.category] ?? emptyStats();
        st.answered += 1;
        if (g.correct) st.correct += 1;
        st.xp += g.correct ? SCORING.offlineXpPerCorrect : 0;
        u.stats[q.category] = st;
      }
      u.updatedAt = now.toISOString();
    });
    await Promise.all(graded.map((g) => this.store.recordAnswerStat(g.id, g.correct, g.timeMs)));
    await this.store.updateOfflinePack(packId, (p) => {
      p.submittedAt = now.toISOString();
      p.score = score;
      p.xpEarned = xpEarned;
    });
    return { packId, score, totalQuestions: pack.questionIds.length, xpEarned, alreadySynced: false };
  }

  // ─── Leaderboard ────────────────────────────────────────────────────────────

  async leaderboard(user: RequestUser, scope: CategoryId | "overall", limit = 20): Promise<LeaderboardResponse> {
    const u = await this.ensureUser(user);
    const field: LeaderboardField = scope === "overall" ? "xp" : `stats.${scope}.xp`;
    const valueOf = (doc: UserDoc) => (scope === "overall" ? doc.xp : doc.stats[scope]?.xp ?? 0);
    const top = await this.store.topUsers(field, limit);
    const entries = top.map((doc, i) => ({
      rank: i + 1,
      userId: doc.id,
      displayName: doc.displayName,
      xp: valueOf(doc),
      level: levelFor(doc.xp).level,
      isYou: doc.id === u.id,
    }));
    let you = entries.find((e) => e.isYou) ?? null;
    if (!you && valueOf(u) > 0) {
      you = {
        rank: (await this.store.countUsersAbove(field, valueOf(u))) + 1,
        userId: u.id,
        displayName: u.displayName,
        xp: valueOf(u),
        level: levelFor(u.xp).level,
        isYou: true,
      };
    }
    // Never expose other players' internal ids
    return { scope, entries: entries.map((e) => ({ ...e, userId: e.isYou ? e.userId : "" })), you };
  }

  // ─── Rewards ────────────────────────────────────────────────────────────────

  async listRewards(user: RequestUser): Promise<Reward[]> {
    const u = await this.ensureUser(user);
    const level = levelFor(u.xp).level;
    return REWARDS.map((r) => ({ ...r, affordable: u.coins >= r.cost, unlocked: level >= r.minLevel }));
  }

  private toRedemption(r: RedemptionDoc): Redemption {
    return {
      id: r.id,
      rewardId: r.rewardId,
      title: r.title,
      partner: r.partner,
      discountLabel: r.discountLabel,
      code: r.code,
      cost: r.cost,
      redeemedAt: r.redeemedAt,
      expiresAt: r.expiresAt,
      status: new Date(r.expiresAt) < this.clock() ? "expired" : "active",
    };
  }

  async redeem(user: RequestUser, rewardId: string): Promise<RedeemResponse> {
    await this.ensureUser(user);
    const reward = rewardById.get(rewardId);
    if (!reward) throw new ApiError(404, "not_found", "Reward not found");
    const now = this.clock();

    // Coins are checked and deducted in one atomic update.
    const u = await this.updateUser(user.id, (doc) => {
      if (levelFor(doc.xp).level < reward.minLevel)
        throw new ApiError(403, "level_locked", `Reach level ${reward.minLevel} to unlock this reward.`);
      if (doc.coins < reward.cost)
        throw new ApiError(402, "insufficient_coins", `You need ${reward.cost - doc.coins} more coins for this reward.`);
      doc.coins -= reward.cost;
      doc.updatedAt = now.toISOString();
    });

    const doc: RedemptionDoc = {
      id: newId(),
      version: 0,
      userId: user.id,
      rewardId,
      title: reward.title,
      partner: reward.partner,
      discountLabel: reward.discountLabel,
      code: couponCode(),
      cost: reward.cost,
      redeemedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + reward.validityDays * 86_400_000).toISOString(),
    };
    await this.store.insertRedemption(doc);
    return { redemption: this.toRedemption(doc), coinBalance: u.coins };
  }

  async listRedemptions(user: RequestUser): Promise<Redemption[]> {
    return (await this.store.listRedemptions(user.id)).map((r) => this.toRedemption(r));
  }

  // ─── Admin analytics ────────────────────────────────────────────────────────

  async adminStats(): Promise<AdminStats> {
    const [stats, totals] = await Promise.all([this.store.listAnswerStats(), this.store.totals()]);
    const rows: QuestionStat[] = [];
    const cat = new Map<CategoryId, { answered: number; correct: number }>();
    const typ = new Map<QuestionType, { answered: number; correct: number }>();
    const her = new Map<string, { answered: number; correct: number }>();
    let answers = 0;
    for (const s of stats) {
      const q = getQuestion(s.id);
      if (!q || s.answered === 0) continue;
      answers += s.answered;
      rows.push({
        questionId: q.id,
        prompt: q.prompt,
        category: q.category,
        type: q.type,
        answered: s.answered,
        correct: s.correct,
        accuracy: Math.round((s.correct / s.answered) * 100),
        avgTimeSeconds: Math.round(s.totalTimeMs / s.answered / 100) / 10,
      });
      const add = <K>(m: Map<K, { answered: number; correct: number }>, k: K) => {
        const v = m.get(k) ?? { answered: 0, correct: 0 };
        v.answered += s.answered;
        v.correct += s.correct;
        m.set(k, v);
      };
      add(cat, q.category);
      add(typ, q.type);
      for (const h of q.links ?? []) add(her, h);
    }
    const pct = (v: { answered: number; correct: number }) => Math.round((v.correct / Math.max(1, v.answered)) * 100);
    const minAnswers = 3;
    const eligible = rows.filter((r) => r.answered >= minAnswers);
    const heritageMap = new Map<string, HeritageLink>(heritageLinks([...her.keys()]).map((l) => [l.id, l]));
    return {
      totals: { ...totals, answers },
      byCategory: [...cat].map(([category, v]) => ({ category, answered: v.answered, accuracy: pct(v) })),
      byType: [...typ].map(([type, v]) => ({ type, answered: v.answered, accuracy: pct(v) })),
      hardest: [...eligible].sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered).slice(0, 10),
      easiest: [...eligible].sort((a, b) => b.accuracy - a.accuracy || b.answered - a.answered).slice(0, 10),
      awarenessGaps: [...her]
        .filter(([id, v]) => v.answered >= minAnswers && heritageMap.has(id))
        .map(([id, v]) => ({ heritage: heritageMap.get(id)!, answered: v.answered, accuracy: pct(v) }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 10),
    };
  }
}

export type { SessionDoc };
