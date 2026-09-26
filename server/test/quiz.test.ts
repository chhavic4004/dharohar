import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import type { AnswerPayload, CorrectAnswer, QuizResult } from "../../shared/quiz-contract";
import { createApp } from "../src/app";
import { getQuestion, QUIZ_BANK } from "../src/modules/quiz/bank";
import { correctAnswerFor } from "../src/modules/quiz/present";
import { FileStore } from "../src/store/fileStore";

process.env.NODE_ENV = "test";

const GUEST_A = "11111111-1111-4111-8111-111111111111";
const GUEST_B = "22222222-2222-4222-8222-222222222222";

let store: FileStore;
let now: Date;
let app: ReturnType<typeof createApp>;

const as = (guest: string) => ({
  get: (url: string) => request(app).get(url).set("X-Guest-Id", guest),
  post: (url: string, body?: object) => request(app).post(url).set("X-Guest-Id", guest).send(body ?? {}),
  patch: (url: string, body?: object) => request(app).patch(url).set("X-Guest-Id", guest).send(body ?? {}),
});

const toPayload = (c: CorrectAnswer): AnswerPayload => ("point" in c ? { point: c.point } : c);
const wrongPayload = (c: CorrectAnswer): AnswerPayload => {
  if ("choice" in c) return { choice: c.choice === 0 ? 1 : 0 };
  if ("order" in c) return { order: [...c.order].reverse() };
  if ("point" in c) return { point: { lat: c.point.lat > 20 ? 8.5 : 34, lng: c.point.lng > 85 ? 70 : 95 } };
  return { pairs: [...c.pairs].reverse() };
};

async function playQuiz(
  guest: string,
  category: string,
  difficulty: string,
  opts: { wrongAt?: number[]; secondsPerAnswer?: number; body?: object; lang?: string } = {},
) {
  const start = await as(guest).post("/api/quiz/sessions", opts.body ?? { category, difficulty });
  expect(start.status).toBe(201);
  const { sessionId, totalQuestions } = start.body;
  const seen: string[] = [];
  for (let i = 0; i < totalQuestions; i++) {
    const cur = await as(guest).get(`/api/quiz/sessions/${sessionId}/current${opts.lang ? `?lang=${opts.lang}` : ""}`);
    expect(cur.status).toBe(200);
    const qid = cur.body.question.id as string;
    seen.push(qid);
    const session = (await store.getSession(sessionId))!;
    const correct = correctAnswerFor(getQuestion(qid)!, session.layouts[qid]);
    now = new Date(now.getTime() + (opts.secondsPerAnswer ?? 5) * 1000);
    const answer = opts.wrongAt?.includes(i) ? wrongPayload(correct) : toPayload(correct);
    const res = await as(guest).post(`/api/quiz/sessions/${sessionId}/answers${opts.lang ? `?lang=${opts.lang}` : ""}`, { questionId: qid, answer });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(!opts.wrongAt?.includes(i));
  }
  const done = await as(guest).post(`/api/quiz/sessions/${sessionId}/complete${opts.lang ? `?lang=${opts.lang}` : ""}`);
  expect(done.status).toBe(200);
  return { result: done.body as QuizResult, seen, sessionId };
}

beforeEach(() => {
  store = new FileStore(null);
  now = new Date("2026-09-26T06:00:00Z");
  app = createApp(store, { clock: () => now });
});

describe("categories and auth", () => {
  it("rejects requests without a player id", async () => {
    const res = await request(app).get("/api/quiz/categories");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("unauthenticated");
  });

  it("lists five categories with at least 20 questions per difficulty", async () => {
    const res = await as(GUEST_A).get("/api/quiz/categories");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
    for (const c of res.body) {
      expect(c.questionCount.seeker).toBeGreaterThanOrEqual(20);
      expect(c.questionCount.historian).toBeGreaterThanOrEqual(20);
    }
  });
});

describe("quiz session", () => {
  it("never sends the answer to the client", async () => {
    const start = await as(GUEST_A).post("/api/quiz/sessions", { category: "rulers", difficulty: "seeker" });
    const cur = await as(GUEST_A).get(`/api/quiz/sessions/${start.body.sessionId}/current`);
    const text = JSON.stringify(cur.body);
    expect(text).not.toMatch(/"answer"|"explanation"|"pairs"|"source"/);
  });

  it("plays a perfect Seeker quiz and awards points, coins and badges", async () => {
    const { result } = await playQuiz(GUEST_A, "architecture", "seeker");
    expect(result.score).toBe(10);
    expect(result.accuracy).toBe(100);
    // 10 x base 10, streak bonus from the 3rd answer (8 x 5), perfect bonus 50
    expect(result.points).toEqual({ base: 100, speed: 0, streak: 40, perfectBonus: 50, total: 190 });
    expect(result.coinsEarned).toBe(19);
    expect(result.newBadges.map((b) => b.id)).toEqual(expect.arrayContaining(["first-steps", "flawless", "on-a-roll"]));
    expect(result.review).toHaveLength(10);
    expect(result.review.every((r) => r.explanation.body.length > 20 && r.source.url.startsWith("https://"))).toBe(true);

    const me = await as(GUEST_A).get("/api/quiz/me");
    expect(me.body.coins).toBe(19);
    expect(me.body.level.xp).toBe(190);
    expect(me.body.stats.architecture.bestScore.seeker).toBe(10);
  });

  it("gives Historian speed bonuses and resets the streak on a wrong answer", async () => {
    const { result } = await playQuiz(GUEST_A, "culinary", "historian", { wrongAt: [2], secondsPerAnswer: 6 });
    expect(result.score).toBe(9);
    expect(result.bestStreak).toBe(7);
    // 24s left -> 8 speed points per correct answer
    expect(result.points.speed).toBe(72);
    expect(result.points.perfectBonus).toBe(0);
  });

  it("counts a late Historian answer as timed out", async () => {
    const start = await as(GUEST_A).post("/api/quiz/sessions", { category: "rhythms", difficulty: "historian" });
    const id = start.body.sessionId;
    const cur = await as(GUEST_A).get(`/api/quiz/sessions/${id}/current`);
    const qid = cur.body.question.id;
    const session = (await store.getSession(id))!;
    now = new Date(now.getTime() + 40_000);
    const res = await as(GUEST_A).post(`/api/quiz/sessions/${id}/answers`, {
      questionId: qid,
      answer: correctAnswerFor(getQuestion(qid)!, session.layouts[qid]),
    });
    expect(res.body.correct).toBe(false);
    expect(res.body.timedOut).toBe(true);
  });

  it("rejects answering twice or out of order", async () => {
    const start = await as(GUEST_A).post("/api/quiz/sessions", { category: "rulers", difficulty: "seeker" });
    const id = start.body.sessionId;
    const cur = await as(GUEST_A).get(`/api/quiz/sessions/${id}/current`);
    const qid = cur.body.question.id;
    const session = (await store.getSession(id))!;
    const answer = toPayload(correctAnswerFor(getQuestion(qid)!, session.layouts[qid]));
    const first = await as(GUEST_A).post(`/api/quiz/sessions/${id}/answers`, { questionId: qid, answer });
    expect(first.status).toBe(200);
    const again = await as(GUEST_A).post(`/api/quiz/sessions/${id}/answers`, { questionId: qid, answer });
    expect(again.status).toBe(409);
    const wrongId = await as(GUEST_A).post(`/api/quiz/sessions/${id}/answers`, { questionId: "day-01", answer });
    expect(wrongId.status).toBe(409);
  });

  it("does not let another player read or answer your session", async () => {
    const start = await as(GUEST_A).post("/api/quiz/sessions", { category: "rulers", difficulty: "seeker" });
    const res = await as(GUEST_B).get(`/api/quiz/sessions/${start.body.sessionId}/current`);
    expect(res.status).toBe(404);
  });

  it("serves fresh questions on the second play", async () => {
    const one = await playQuiz(GUEST_A, "traditions", "seeker");
    const two = await playQuiz(GUEST_A, "traditions", "seeker");
    const overlap = one.seen.filter((id) => two.seen.includes(id));
    expect(overlap).toHaveLength(0);
    expect(two.result.previousBest).toBe(10);
  });

  it("supports a mixed quiz across categories", async () => {
    const { result } = await playQuiz(GUEST_A, "mixed", "seeker");
    expect(result.byCategory.length).toBeGreaterThan(1);
  });

  it("validates answer shape for chronology and match questions", async () => {
    const chrono = QUIZ_BANK.find((q) => q.type === "chronology")!;
    const s = await as(GUEST_A).post("/api/quiz/sessions", { category: chrono.category, difficulty: chrono.difficulty });
    const id = s.body.sessionId;
    // Force the chronology question to be current by reading until we reach one or give up.
    const cur = await as(GUEST_A).get(`/api/quiz/sessions/${id}/current`);
    const q = cur.body.question;
    const bad = q.type === "chronology" || q.type === "match" ? { order: [0, 0, 1] } : { choice: 99 };
    const res = await as(GUEST_A).post(`/api/quiz/sessions/${id}/answers`, { questionId: q.id, answer: bad });
    expect(res.status).toBe(400);
  });
});

describe("problem of the day", () => {
  it("shows every player the same question and allows one answer per day", async () => {
    const a = await as(GUEST_A).get("/api/quiz/daily");
    const b = await as(GUEST_B).get("/api/quiz/daily");
    expect(a.body.question).toEqual(b.body.question);
    expect(a.body.answered).toBe(false);

    const ans = await as(GUEST_A).post("/api/quiz/daily/answer", { answer: a.body.question.type === "chronology" ? { order: a.body.question.items.map((i: { id: number }) => i.id) } : a.body.question.type === "match" ? { pairs: a.body.question.right.map((i: { id: number }) => i.id) } : { choice: 0 } });
    expect(ans.status).toBe(200);
    expect(ans.body.streak).toBe(1);
    expect(ans.body.explanation.body.length).toBeGreaterThan(20);

    const again = await as(GUEST_A).post("/api/quiz/daily/answer", { answer: { choice: 0 } });
    expect(again.status).toBe(409);
  });

  it("builds a streak on consecutive days and resets after a missed day", async () => {
    const answerToday = async () => {
      const d = await as(GUEST_A).get("/api/quiz/daily");
      const q = d.body.question;
      const answer = q.type === "chronology" ? { order: q.items.map((i: { id: number }) => i.id) } : q.type === "match" ? { pairs: q.right.map((i: { id: number }) => i.id) } : { choice: 0 };
      return (await as(GUEST_A).post("/api/quiz/daily/answer", { answer })).body;
    };
    expect((await answerToday()).streak).toBe(1);
    now = new Date(now.getTime() + 86_400_000);
    expect((await as(GUEST_A).get("/api/quiz/daily")).body.streakAtRisk).toBe(true);
    expect((await answerToday()).streak).toBe(2);
    now = new Date(now.getTime() + 86_400_000);
    const third = await answerToday();
    expect(third.streak).toBe(3);
    expect(third.newBadges.map((b: { id: string }) => b.id)).toContain("daily-3");
    now = new Date(now.getTime() + 2 * 86_400_000);
    expect((await as(GUEST_A).get("/api/quiz/daily")).body.streak).toBe(0);
    expect((await answerToday()).streak).toBe(1);
  });

  it("uses a different question on the next day", async () => {
    const d1 = await as(GUEST_A).get("/api/quiz/daily");
    now = new Date(now.getTime() + 86_400_000);
    const d2 = await as(GUEST_A).get("/api/quiz/daily");
    expect(d2.body.question.id).not.toBe(d1.body.question.id);
  });
});

describe("rewards", () => {
  it("blocks redemption without enough coins, then allows it", async () => {
    const poor = await as(GUEST_A).post("/api/quiz/rewards/audio-guide/redeem");
    expect(poor.status).toBe(402);

    for (let i = 0; i < 5; i++) await playQuiz(GUEST_A, "rulers", "historian", { secondsPerAnswer: 3 });
    const me = await as(GUEST_A).get("/api/quiz/me");
    expect(me.body.coins).toBeGreaterThanOrEqual(80);

    const ok = await as(GUEST_A).post("/api/quiz/rewards/audio-guide/redeem");
    expect(ok.status).toBe(201);
    expect(ok.body.redemption.code).toMatch(/^DHR-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(ok.body.coinBalance).toBe(me.body.coins - 80);

    const wallet = await as(GUEST_A).get("/api/quiz/me/redemptions");
    expect(wallet.body).toHaveLength(1);
    expect(wallet.body[0].status).toBe("active");
  });

  it("locks higher rewards behind levels", async () => {
    const res = await as(GUEST_A).post("/api/quiz/rewards/homestay/redeem");
    expect(res.status).toBe(403);
  });
});

describe("leaderboard and profile", () => {
  it("ranks players by XP and hides other players' ids", async () => {
    await playQuiz(GUEST_A, "rulers", "seeker");
    await playQuiz(GUEST_B, "rulers", "seeker", { wrongAt: [0, 1, 2] });
    await as(GUEST_A).patch("/api/quiz/me", { displayName: "Ash" });
    const lb = await as(GUEST_B).get("/api/quiz/leaderboard");
    expect(lb.body.entries[0].displayName).toBe("Ash");
    expect(lb.body.entries[0].userId).toBe("");
    expect(lb.body.you.rank).toBe(2);
    const cat = await as(GUEST_B).get("/api/quiz/leaderboard?scope=rulers");
    expect(cat.body.entries).toHaveLength(2);
  });

  it("validates display names", async () => {
    const res = await as(GUEST_A).patch("/api/quiz/me", { displayName: "<script>" });
    expect(res.status).toBe(400);
  });
});

describe("modes", () => {
  it("runs a map challenge graded by distance", async () => {
    const { result } = await playQuiz(GUEST_A, "", "seeker", { body: { mode: "map", difficulty: "seeker" }, wrongAt: [1] });
    expect(result.mode).toBe("map");
    expect(result.byType.every((t) => t.type === "map_pin")).toBe(true);
    expect(result.review[1].correct).toBe(false);
    expect(result.review[1].yourAnswerText).toMatch(/km from/);
  });

  it("builds a Save the Vulnerable quiz from traditions with a high HVS", async () => {
    const { result } = await playQuiz(GUEST_A, "", "seeker", { body: { mode: "vulnerable", difficulty: "seeker" } });
    expect(result.mode).toBe("vulnerable");
    const hvs = result.review.flatMap((r) => r.links).map((l) => l.hvs?.score ?? 0);
    expect(Math.max(...hvs)).toBeGreaterThanOrEqual(34);
  });

  it("links answers to the archive and quizzes about one tradition", async () => {
    const info = await as(GUEST_A).get("/api/quiz/heritage/konark");
    expect(info.body.questionCount).toBeGreaterThanOrEqual(3);
    const start = await as(GUEST_A).post("/api/quiz/sessions", { mode: "heritage", heritageId: "konark" });
    expect(start.status).toBe(201);
    const cur = await as(GUEST_A).get(`/api/quiz/sessions/${start.body.sessionId}/current`);
    const qid = cur.body.question.id;
    const session = (await store.getSession(start.body.sessionId))!;
    const res = await as(GUEST_A).post(`/api/quiz/sessions/${start.body.sessionId}/answers`, {
      questionId: qid,
      answer: toPayload(correctAnswerFor(getQuestion(qid)!, session.layouts[qid])),
    });
    expect(res.body.links.map((l: { id: string }) => l.id)).toContain("konark");
  });

  it("tops up short heritage quizzes with related questions, linked ones first", async () => {
    const info = await as(GUEST_A).get("/api/quiz/heritage/phulkari");
    expect(info.body.directCount).toBe(1);
    expect(info.body.questionCount).toBe(5);
    const start = await as(GUEST_A).post("/api/quiz/sessions", { mode: "heritage", heritageId: "phulkari" });
    expect(start.body.totalQuestions).toBe(5);
    const cur = await as(GUEST_A).get(`/api/quiz/sessions/${start.body.sessionId}/current`);
    expect(getQuestion(cur.body.question.id)!.links).toContain("phulkari");
  });

  it("lets missed questions be revised straight away, then after 1 day", async () => {
    await playQuiz(GUEST_A, "rulers", "seeker", { wrongAt: [0, 1, 2] });
    let me = await as(GUEST_A).get("/api/quiz/me");
    expect(me.body.review.learning).toBe(3);
    expect(me.body.review.due).toBe(3);

    // First revision is available immediately
    let { result } = await playQuiz(GUEST_A, "", "seeker", { body: { mode: "review" } });
    expect(result.totalQuestions).toBe(3);
    me = await as(GUEST_A).get("/api/quiz/me");
    expect(me.body.review.due).toBe(0);
    expect(me.body.review.learning).toBe(3);
    expect((await as(GUEST_A).post("/api/quiz/sessions", { mode: "review" })).status).toBe(409);

    // Next review comes back after a day
    now = new Date(now.getTime() + 86_400_000 + 1000);
    me = await as(GUEST_A).get("/api/quiz/me");
    expect(me.body.review.due).toBe(3);
    ({ result } = await playQuiz(GUEST_A, "", "seeker", { body: { mode: "review", difficulty: "seeker" } }));
    expect(result.totalQuestions).toBe(3);
  });

  it("puts a question missed during revision straight back into Revise", async () => {
    await playQuiz(GUEST_A, "rulers", "seeker", { wrongAt: [0] });
    await playQuiz(GUEST_A, "", "seeker", { body: { mode: "review" }, wrongAt: [0] });
    const me = await as(GUEST_A).get("/api/quiz/me");
    expect(me.body.review.due).toBe(1);
  });

  it("lets a friend replay the exact same quiz as a challenge", async () => {
    const mine = await playQuiz(GUEST_A, "culinary", "seeker", { wrongAt: [0, 1] });
    const ch = await as(GUEST_A).post("/api/quiz/challenges", { attemptId: mine.result.attemptId });
    expect(ch.status).toBe(201);
    expect(ch.body.creatorScore).toBe(8);

    const theirs = await playQuiz(GUEST_B, "", "", { body: { mode: "challenge", challengeCode: ch.body.code } });
    expect(theirs.seen).toEqual(mine.seen);
    expect(theirs.result.challenge?.youWon).toBe(true);
    expect(theirs.result.newBadges.map((b) => b.id)).toContain("challenger");

    const again = await as(GUEST_B).post("/api/quiz/sessions", { mode: "challenge", challengeCode: ch.body.code });
    expect(again.status).toBe(409);
    const info = await as(GUEST_A).get(`/api/quiz/challenges/${ch.body.code}`);
    expect(info.body.players).toHaveLength(2);
    expect(info.body.players[0]).toMatchObject({ score: 10, isYou: false });
    expect(info.body.players[1]).toMatchObject({ score: 8, isYou: true });
    expect(JSON.stringify(info.body)).not.toContain("userId");
  });
});

describe("languages", () => {
  it("serves questions and explanations in Hindi", async () => {
    const start = await as(GUEST_A).post("/api/quiz/sessions", { category: "architecture", difficulty: "seeker" });
    const cur = await as(GUEST_A).get(`/api/quiz/sessions/${start.body.sessionId}/current?lang=hi`);
    expect(cur.body.question.lang).toBe("hi");
    expect(cur.body.question.prompt).toMatch(/[\u0900-\u097F]/);
    const { result } = await playQuiz(GUEST_B, "traditions", "seeker", { lang: "hi" });
    expect(result.review[0].explanation.body).toMatch(/[\u0900-\u097F]/);
    expect(result.newBadges.map((b) => b.id)).toContain("polyglot");
  });

  it("falls back to English when no translation is available", async () => {
    const daily = await as(GUEST_A).get("/api/quiz/daily?lang=pa");
    expect(daily.body.question.lang).toBe("en");
  });
});

describe("offline packs", () => {
  it("downloads a pack with answers and syncs results once", async () => {
    const pack = await as(GUEST_A).post("/api/quiz/offline/packs", { category: "rhythms", difficulty: "seeker" });
    expect(pack.status).toBe(201);
    expect(pack.body.questions).toHaveLength(10);
    expect(pack.body.questions.some((q: { type: string }) => q.type === "map_pin")).toBe(false);
    const answers = pack.body.questions.map((q: { id: string; answer: object }, i: number) => ({
      questionId: q.id,
      answer: i === 0 && "choice" in q.answer ? { choice: ((q.answer as { choice: number }).choice + 1) % 2 } : q.answer,
      timeMs: 4000,
    }));
    const sync = await as(GUEST_A).post(`/api/quiz/offline/packs/${pack.body.packId}/submit`, { answers });
    expect(sync.status).toBe(200);
    expect(sync.body.score).toBeGreaterThanOrEqual(9);
    expect(sync.body.xpEarned).toBe(sync.body.score * 5);
    const again = await as(GUEST_A).post(`/api/quiz/offline/packs/${pack.body.packId}/submit`, { answers });
    expect(again.body.alreadySynced).toBe(true);
    const me = await as(GUEST_A).get("/api/quiz/me");
    expect(me.body.level.xp).toBe(sync.body.xpEarned);
    expect(me.body.coins).toBe(0);
  });
});

describe("admin analytics", () => {
  it("is disabled without ADMIN_KEY and reports stats with it", async () => {
    delete process.env.ADMIN_KEY;
    expect((await request(app).get("/api/quiz/admin/stats")).status).toBe(404);
    process.env.ADMIN_KEY = "test-key";
    for (let i = 0; i < 3; i++) await playQuiz(i === 0 ? GUEST_A : GUEST_B, "rulers", "seeker", { wrongAt: [0] });
    expect((await request(app).get("/api/quiz/admin/stats").set("X-Admin-Key", "nope")).status).toBe(401);
    const res = await request(app).get("/api/quiz/admin/stats").set("X-Admin-Key", "test-key");
    expect(res.status).toBe(200);
    expect(res.body.totals.quizzes).toBe(3);
    expect(res.body.totals.answers).toBe(30);
    expect(res.body.byCategory[0].category).toBe("rulers");
    delete process.env.ADMIN_KEY;
  });
});
