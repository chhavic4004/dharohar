import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { setGoogleVerifier } from "../src/modules/auth/google";
import { FileStore } from "../src/store/fileStore";

const GUEST = "33333333-3333-4333-8333-333333333333";
const GUEST_2 = "44444444-4444-4444-8444-444444444444";

let store: FileStore;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  store = new FileStore(null);
  app = createApp(store);
});
afterEach(() => setGoogleVerifier(null));

const register = (body: object, guest?: string) => {
  const r = request(app).post("/api/auth/register");
  return (guest ? r.set("X-Guest-Id", guest) : r).send(body);
};
const bearer = (token: string) => ({
  get: (url: string) => request(app).get(url).set("Authorization", `Bearer ${token}`),
  post: (url: string, body?: object) => request(app).post(url).set("Authorization", `Bearer ${token}`).send(body ?? {}),
  patch: (url: string, body?: object) => request(app).patch(url).set("Authorization", `Bearer ${token}`).send(body ?? {}),
});

/** Plays the Problem of the Day as a guest so there is progress to carry over. */
async function guestProgress(guest: string) {
  const daily = await request(app).get("/api/quiz/daily").set("X-Guest-Id", guest);
  const q = daily.body.question;
  const answer = q.type === "chronology" ? { order: q.items.map((i: { id: number }) => i.id) } : q.type === "match" ? { pairs: q.right.map((o: { id: number }) => o.id) } : { choice: 0 };
  const res = await request(app).post("/api/quiz/daily/answer").set("X-Guest-Id", guest).send({ answer });
  expect(res.status).toBe(200);
  return res.body.xpEarned as number;
}

describe("accounts", () => {
  it("registers, signs in and returns the account", async () => {
    const reg = await register({ email: "Ash@Example.com", password: "heritage123", displayName: "Ash" });
    expect(reg.status).toBe(201);
    expect(reg.body.account).toMatchObject({ email: "ash@example.com", displayName: "Ash", providers: ["password"] });
    expect(JSON.stringify(reg.body)).not.toContain("passwordHash");

    const login = await request(app).post("/api/auth/login").send({ email: "ash@example.com", password: "heritage123" });
    expect(login.status).toBe(200);
    const me = await bearer(login.body.token).get("/api/auth/me");
    expect(me.body.email).toBe("ash@example.com");
  });

  it("rejects duplicate emails, weak passwords and wrong passwords", async () => {
    await register({ email: "a@b.in", password: "heritage123", displayName: "Ash" });
    expect((await register({ email: "A@B.in", password: "heritage123", displayName: "Two" })).body.error.code).toBe("email_taken");
    expect((await register({ email: "c@b.in", password: "short", displayName: "Ash" })).status).toBe(400);
    const bad = await request(app).post("/api/auth/login").send({ email: "a@b.in", password: "wrongpass1" });
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe("invalid_credentials");
    const unknown = await request(app).post("/api/auth/login").send({ email: "nobody@b.in", password: "whatever12" });
    expect(unknown.body.error.code).toBe("invalid_credentials");
  });

  it("saves quiz progress on the account, not the browser", async () => {
    const reg = await register({ email: "ash@x.in", password: "heritage123", displayName: "Ash" });
    const token = reg.body.token;
    await bearer(token).post("/api/quiz/sessions", { category: "rulers", difficulty: "seeker" });
    const me = await bearer(token).get("/api/quiz/me");
    expect(me.body.displayName).toBe("Ash");
    // A different browser signing in sees the same player
    const login = await request(app).post("/api/auth/login").set("X-Guest-Id", GUEST_2).send({ email: "ash@x.in", password: "heritage123" });
    const again = await bearer(login.body.token).get("/api/quiz/me");
    expect(again.body.id).toBe(me.body.id);
  });

  it("moves a guest's progress and history into the account on sign up", async () => {
    const xp = await guestProgress(GUEST);
    const reg = await register({ email: "g@x.in", password: "heritage123", displayName: "Guest Ash" }, GUEST);
    expect(reg.body.mergedGuestProgress).toBe(true);
    const me = await bearer(reg.body.token).get("/api/quiz/me");
    expect(me.body.level.xp).toBe(xp);
    expect(me.body.daily.streak).toBe(1);
    const history = await bearer(reg.body.token).get("/api/quiz/me/history");
    expect(history.body.items).toHaveLength(1);
    expect(history.body.items[0].kind).toBe("daily");
    // The guest record is gone, so signing in again from that browser adds nothing
    const guestMe = await request(app).get("/api/quiz/me").set("X-Guest-Id", GUEST);
    expect(guestMe.body.level.xp).toBe(0);
  });

  it("adds guest progress to an account that already has some", async () => {
    const reg = await register({ email: "m@x.in", password: "heritage123", displayName: "Ash" });
    const accountXp = await (async () => {
      const t = reg.body.token;
      const d = await bearer(t).get("/api/quiz/daily");
      const q = d.body.question;
      const answer = q.type === "chronology" ? { order: q.items.map((i: { id: number }) => i.id) } : q.type === "match" ? { pairs: q.right.map((o: { id: number }) => o.id) } : { choice: 0 };
      return (await bearer(t).post("/api/quiz/daily/answer", { answer })).body.xpEarned as number;
    })();
    await guestProgress(GUEST);
    const login = await request(app).post("/api/auth/login").set("X-Guest-Id", GUEST).send({ email: "m@x.in", password: "heritage123" });
    expect(login.body.mergedGuestProgress).toBe(true);
    const me = await bearer(login.body.token).get("/api/quiz/me");
    // Same day answered twice: XP adds up, but only one daily answer is kept
    expect(me.body.level.xp).toBeGreaterThanOrEqual(accountXp);
    const history = await bearer(login.body.token).get("/api/quiz/me/history");
    expect(history.body.items.filter((i: { kind: string }) => i.kind === "daily")).toHaveLength(1);
  });

  it("renames the account and the quiz player together", async () => {
    const reg = await register({ email: "r@x.in", password: "heritage123", displayName: "Ash" });
    await bearer(reg.body.token).get("/api/quiz/me");
    const res = await bearer(reg.body.token).patch("/api/auth/me", { displayName: "Ash K" });
    expect(res.body.displayName).toBe("Ash K");
    expect((await bearer(reg.body.token).get("/api/quiz/me")).body.displayName).toBe("Ash K");
    // Renaming from the quiz profile renames the account too
    await bearer(reg.body.token).patch("/api/quiz/me", { displayName: "Ash Q" });
    expect((await bearer(reg.body.token).get("/api/auth/me")).body.displayName).toBe("Ash Q");
  });

  it("signs out every device after a password change or log out everywhere", async () => {
    const reg = await register({ email: "p@x.in", password: "heritage123", displayName: "Ash" });
    const old = reg.body.token;
    const wrong = await bearer(old).post("/api/auth/password", { currentPassword: "nope12345", newPassword: "newpass123" });
    expect(wrong.status).toBe(401);
    const changed = await bearer(old).post("/api/auth/password", { currentPassword: "heritage123", newPassword: "newpass123" });
    expect(changed.status).toBe(200);
    expect((await bearer(old).get("/api/auth/me")).status).toBe(401);
    const fresh = changed.body.token;
    expect((await bearer(fresh).get("/api/auth/me")).status).toBe(200);
    expect((await bearer(fresh).post("/api/auth/logout-all")).status).toBe(204);
    expect((await bearer(fresh).get("/api/auth/me")).status).toBe(401);
  });

  it("rejects forged tokens", async () => {
    const res = await bearer("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.bad").get("/api/quiz/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("invalid_token");
  });
});

describe("Google sign-in", () => {
  it("is off without GOOGLE_CLIENT_ID", async () => {
    expect((await request(app).get("/api/auth/config")).body.googleClientId).toBeNull();
    expect((await request(app).post("/api/auth/google").send({ credential: "x".repeat(40) })).status).toBe(503);
  });

  it("creates an account, and links Google to an existing email", async () => {
    setGoogleVerifier(async (cred) =>
      cred.startsWith("good") ? { sub: `sub-${cred}`, email: cred === "good-existing-000000000000" ? "e@x.in" : "new@x.in", emailVerified: true, name: "Ash G" } : null,
    );
    const created = await request(app).post("/api/auth/google").send({ credential: "good-new-00000000000000000" });
    expect(created.status).toBe(200);
    expect(created.body.account).toMatchObject({ email: "new@x.in", displayName: "Ash G", providers: ["google"] });

    await register({ email: "e@x.in", password: "heritage123", displayName: "Ash" });
    const linked = await request(app).post("/api/auth/google").send({ credential: "good-existing-000000000000" });
    expect(linked.body.account.providers).toEqual(["password", "google"]);

    const bad = await request(app).post("/api/auth/google").send({ credential: "bad-000000000000000000000" });
    expect(bad.status).toBe(401);
  });
});

describe("history", () => {
  it("pages through quizzes newest first", async () => {
    const reg = await register({ email: "h@x.in", password: "heritage123", displayName: "Ash" });
    const t = reg.body.token;
    for (let i = 0; i < 3; i++) {
      const s = await bearer(t).post("/api/quiz/sessions", { category: "culinary", difficulty: "seeker" });
      for (let q = 0; q < s.body.totalQuestions; q++) {
        const cur = await bearer(t).get(`/api/quiz/sessions/${s.body.sessionId}/current`);
        await bearer(t).post(`/api/quiz/sessions/${s.body.sessionId}/answers`, { questionId: cur.body.question.id, answer: { timedOut: true } });
      }
      await bearer(t).post(`/api/quiz/sessions/${s.body.sessionId}/complete`);
      await new Promise((r) => setTimeout(r, 5));
    }
    const first = await bearer(t).get("/api/quiz/me/history?limit=2");
    expect(first.body.items).toHaveLength(2);
    expect(first.body.nextBefore).toBeTruthy();
    const second = await bearer(t).get(`/api/quiz/me/history?limit=2&before=${encodeURIComponent(first.body.nextBefore)}`);
    expect(second.body.items).toHaveLength(1);
    expect(second.body.nextBefore).toBeNull();
  });
});
