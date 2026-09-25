import {
  HISTORIAN_SECONDS,
  QUESTIONS_PER_QUIZ,
  type AnswerPayload,
  type AnswerResult,
  type Badge,
  type CategoryId,
  type CategoryStats,
  type DailyAnswerResult,
  type DailyChallenge,
  type Difficulty,
  type LeaderboardResponse,
  type NextQuestionResponse,
  type PlayerProfile,
  type QuestionType,
  type QuizCategoryParam,
  type QuizResult,
  type RedeemResponse,
  type Redemption,
  type Reward,
  type ReviewItem,
  type SessionInfo,
} from "../../../../shared/quiz-contract";
import { ApiError } from "../../middleware/errors";
import type { RequestUser } from "../../middleware/requireUser";
import { istDateKey, istDayNumber, nextIstMidnight, previousDateKey } from "../../utils/date";
import { couponCode, newId, seededShuffle, shuffle } from "../../utils/random";
import type { AnswerRecord, LeaderboardField, QuestionLayout, RedemptionDoc, Store, UserDoc } from "../../store/types";
import { categorySummaries, CATEGORIES, DAILY_BANK, getQuestion, questionsFor, type BankQuestion } from "./bank";
import { answerPoints, BADGES, badgeById, levelFor, ratingFor, SCORING } from "./gamification";
import { correctAnswerFor, correctAnswerText, createLayout, grade, responseText, toPublic } from "./present";
import { REWARDS, rewardById } from "./rewards.catalog";

const RECENT_LIMIT = 20;
const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

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
  };
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
    return (await this.store.getUser(user.id)) ?? this.store.insertUser(newUser(user, this.nowIso()));
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
      badges: u.badges.map((b) => ({ ...badgeById.get(b.id)!, earnedAt: b.earnedAt })).filter((b) => b.id),
      lockedBadges: BADGES.filter((b) => !earned.has(b.id)),
      stats: u.stats,
      recentAttempts: attempts.map((a) => ({
        attemptId: a.id,
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
    await this.store.updateUser(user.id, (u) => {
      u.displayName = displayName;
      u.updatedAt = this.nowIso();
    });
    return this.getProfile(user);
  }

  // ─── Quiz sessions ──────────────────────────────────────────────────────────

  listCategories() {
    return categorySummaries();
  }

  /**
   * Picks QUESTIONS_PER_QUIZ questions, preferring ones this player has not
   * seen recently, so repeat plays feel new. O(n) in the pool size.
   */
  async startSession(user: RequestUser, category: QuizCategoryParam, difficulty: Difficulty): Promise<SessionInfo> {
    const u = await this.ensureUser(user);
    const pool = questionsFor(category, difficulty);
    if (pool.length === 0) throw new ApiError(404, "no_questions", "No questions are available for this selection yet.");

    const key = `${category}:${difficulty}`;
    const recent = new Set(u.recentQuestions[key] ?? []);
    const unseen = shuffle(pool.filter((q) => !recent.has(q.id)));
    const seen = shuffle(pool.filter((q) => recent.has(q.id)));
    const picked = [...unseen, ...seen].slice(0, Math.min(QUESTIONS_PER_QUIZ, pool.length));

    const layouts: Record<string, QuestionLayout> = {};
    for (const q of picked) layouts[q.id] = createLayout(q);

    const id = newId();
    await this.store.insertSession({
      id,
      version: 0,
      userId: u.id,
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

    await this.store.updateUser(u.id, (doc) => {
      const list = [...(doc.recentQuestions[key] ?? []), ...picked.map((q) => q.id)];
      doc.recentQuestions[key] = list.slice(-RECENT_LIMIT);
    });

    return {
      sessionId: id,
      category,
      difficulty,
      totalQuestions: picked.length,
      timeLimitSeconds: difficulty === "historian" ? HISTORIAN_SECONDS : null,
    };
  }

  private async ownSession(user: RequestUser, sessionId: string) {
    const s = await this.store.getSession(sessionId);
    if (!s || s.userId !== user.id) throw new ApiError(404, "not_found", "Quiz session not found");
    return s;
  }

  /** The question the player should answer now. Safe to call again after a page refresh. */
  async currentQuestion(user: RequestUser, sessionId: string): Promise<NextQuestionResponse> {
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
    return { index, totalQuestions: s.questionIds.length, question: toPublic(mustGet(qid), s.layouts[qid]), servedAt };
  }

  async submitAnswer(user: RequestUser, sessionId: string, questionId: string, payload: AnswerPayload): Promise<AnswerResult> {
    const s = await this.ownSession(user, sessionId);
    const index = s.answers.length;
    if (s.status === "completed" || index >= s.questionIds.length) throw new ApiError(409, "quiz_finished", "This quiz is already finished.");
    if (s.questionIds[index] !== questionId) throw new ApiError(409, "out_of_order", "That is not the current question.");
    const servedAt = s.servedAt[questionId];
    if (!servedAt) throw new ApiError(409, "not_served", "Load the question before answering it.");

    const q = mustGet(questionId);
    const layout = s.layouts[questionId];
    const seconds = Math.max(0, (this.clock().getTime() - new Date(servedAt).getTime()) / 1000);
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

    return {
      correct,
      timedOut,
      correctAnswer: correctAnswerFor(q, layout),
      correctAnswerText: correctAnswerText(q),
      explanation: q.explanation,
      source: q.source,
      points,
      streak: updated.streak,
      score: updated.score,
      answeredCount: updated.answers.length,
      totalQuestions: updated.questionIds.length,
      isLast: updated.answers.length === updated.questionIds.length,
    };
  }

  async completeSession(user: RequestUser, sessionId: string): Promise<QuizResult> {
    const s = await this.ownSession(user, sessionId);
    if (s.status === "completed" && s.attemptId) return (await this.store.getAttempt(s.attemptId))!.result;
    if (s.answers.length < s.questionIds.length) throw new ApiError(409, "quiz_incomplete", "Answer every question before finishing.");

    const now = this.nowIso();
    const total = s.questionIds.length;
    const perfect = s.score === total;
    const sum = (k: "base" | "speed" | "streak") => s.answers.reduce((n, a) => n + a.points[k], 0);
    const points = { base: sum("base"), speed: sum("speed"), streak: sum("streak"), perfectBonus: perfect ? SCORING.perfectBonus[s.difficulty] : 0, total: 0 };
    points.total = points.base + points.speed + points.streak + points.perfectBonus;
    const coinsEarned = Math.floor(points.total / SCORING.coinDivisor);
    const accuracy = Math.round((s.score / total) * 100);
    const totalMs = s.answers.reduce((n, a) => n + a.timeMs, 0);

    const byType = new Map<QuestionType, { correct: number; total: number }>();
    const byCategory = new Map<CategoryId, { correct: number; total: number; xp: number }>();
    const review: ReviewItem[] = s.answers.map((a) => {
      const q = mustGet(a.questionId);
      const t = byType.get(q.type) ?? { correct: 0, total: 0 };
      t.total++;
      if (a.correct) t.correct++;
      byType.set(q.type, t);
      const c = byCategory.get(q.category) ?? { correct: 0, total: 0, xp: 0 };
      c.total++;
      if (a.correct) c.correct++;
      c.xp += a.points.total;
      byCategory.set(q.category, c);
      return {
        questionId: q.id,
        type: q.type,
        prompt: q.prompt,
        category: q.category,
        yourAnswerText: responseText(q, s.layouts[q.id], a.response),
        correctAnswerText: correctAnswerText(q),
        correct: a.correct,
        timedOut: a.timedOut,
        timeTakenSeconds: Math.round(a.timeMs / 100) / 10,
        points: a.points.total,
        explanation: q.explanation,
        source: q.source,
      };
    });

    const attemptId = newId();
    let levelBefore = levelFor(0);
    let previousBest: number | null = null;
    let newBadges: Badge[] = [];
    let coinBalance = 0;

    const userAfter = await this.store.updateUser(user.id, (u) => {
      levelBefore = levelFor(u.xp);
      previousBest =
        s.category === "mixed" ? u.mixedBest[s.difficulty] : (u.stats[s.category]?.bestScore[s.difficulty] ?? null);

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
      if (s.category === "mixed") {
        u.mixedBest[s.difficulty] = Math.max(u.mixedBest[s.difficulty] ?? 0, s.score);
      } else {
        const st = u.stats[s.category] ?? emptyStats();
        st.quizzes += 1;
        st.bestScore[s.difficulty] = Math.max(st.bestScore[s.difficulty] ?? 0, s.score);
        u.stats[s.category] = st;
        if (!u.categoriesPlayed.includes(s.category)) u.categoriesPlayed.push(s.category);
      }

      const ids = ["first-steps"];
      if (s.bestStreak >= 5) ids.push("on-a-roll");
      if (perfect) ids.push("flawless");
      if (perfect && s.difficulty === "historian") ids.push("archive-master");
      if (s.difficulty === "historian" && accuracy >= 80 && totalMs / total < 10_000) ids.push("quick-mind");
      if (s.difficulty === "historian" && accuracy >= 80 && s.category !== "mixed") ids.push(`scholar-${s.category}`);
      if (CATEGORY_IDS.every((c) => u.categoriesPlayed.includes(c))) ids.push("across-india");
      if (u.correctAnswers >= 100) ids.push("century");
      newBadges = award(u, ids, now);
      coinBalance = u.coins;
    });

    const result: QuizResult = {
      attemptId,
      category: s.category,
      difficulty: s.difficulty,
      score: s.score,
      totalQuestions: total,
      accuracy,
      bestStreak: s.bestStreak,
      totalTimeSeconds: Math.round(totalMs / 1000),
      averageTimeSeconds: Math.round(totalMs / total / 100) / 10,
      points,
      coinsEarned,
      coinBalance,
      levelBefore,
      levelAfter: levelFor(userAfter.xp),
      newBadges,
      previousBest,
      isPersonalBest: previousBest === null ? true : s.score > previousBest,
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

  async getDaily(user: RequestUser): Promise<DailyChallenge> {
    const u = await this.ensureUser(user);
    const now = this.clock();
    const { q, layout, dateKey } = this.dailyQuestionFor(now);
    const answer = await this.store.getDailyAnswer(u.id, dateKey);
    const streak = this.effectiveDailyStreak(u, dateKey);
    return {
      date: dateKey,
      question: toPublic(q, layout),
      answered: !!answer,
      result: answer?.result ?? null,
      streak,
      longestStreak: u.daily.longestStreak,
      streakAtRisk: !answer && u.daily.lastDate === previousDateKey(dateKey),
      nextResetAt: nextIstMidnight(now),
    };
  }

  async answerDaily(user: RequestUser, payload: AnswerPayload): Promise<DailyAnswerResult> {
    const u = await this.ensureUser(user);
    const now = this.clock();
    const { q, layout, dateKey } = this.dailyQuestionFor(now);
    if (await this.store.getDailyAnswer(u.id, dateKey))
      throw new ApiError(409, "already_answered", "You have already answered today's problem. Come back tomorrow.");
    if ("timedOut" in payload) throw new ApiError(400, "invalid_answer", "The daily problem has no timer.");

    const correct = grade(q, layout, payload);
    const d = SCORING.daily;
    const nowIso = now.toISOString();
    let result!: DailyAnswerResult;

    const updated = await this.store.updateUser(u.id, (doc) => {
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
        correctAnswer: correctAnswerFor(q, layout),
        correctAnswerText: correctAnswerText(q),
        yourAnswerText: responseText(q, layout, payload),
        explanation: q.explanation,
        source: q.source,
        coinsEarned: coins,
        xpEarned: xp,
        streak,
        longestStreak: doc.daily.longestStreak,
        newBadges: award(doc, ids, nowIso),
      };
    });
    void updated;

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
    return result;
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
    const u = await this.store.updateUser(user.id, (doc) => {
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
}
