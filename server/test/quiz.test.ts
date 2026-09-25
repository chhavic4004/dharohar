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

const toPayload = (c: CorrectAnswer): AnswerPayload => c;
const wrongPayload = (c: CorrectAnswer): AnswerPayload => {
  if ("choice" in c) return { choice: c.choice === 0 ? 1 : 0 };
  if ("order" in c) return { order: [...c.order].reverse() };
  return { pairs: [...c.pairs].reverse() };
};

async function playQuiz(guest: string, category: string, difficulty: string, opts: { wrongAt?: number[]; secondsPerAnswer?: number } = {}) {
  const start = await as(guest).post("/api/quiz/sessions", { category, difficulty });
  expect(start.status).toBe(201);
  const { sessionId, totalQuestions } = start.body;
  const seen: string[] = [];
  for (let i = 0; i < totalQuestions; i++) {
    const cur = await as(guest).get(`/api/quiz/sessions/${sessionId}/current`);
    expect(cur.status).toBe(200);
    const qid = cur.body.question.id as string;
    seen.push(qid);
    const session = (await store.getSession(sessionId))!;
    const correct = correctAnswerFor(getQuestion(qid)!, session.layouts[qid]);
    now = new Date(now.getTime() + (opts.secondsPerAnswer ?? 5) * 1000);
    const answer = opts.wrongAt?.includes(i) ? wrongPayload(correct) : toPayload(correct);
    const res = await as(guest).post(`/api/quiz/sessions/${sessionId}/answers`, { questionId: qid, answer });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(!opts.wrongAt?.includes(i));
  }
  const done = await as(guest).post(`/api/quiz/sessions/${sessionId}/complete`);
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
    const answer = correctAnswerFor(getQuestion(qid)!, session.layouts[qid]);
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
