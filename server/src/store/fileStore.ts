import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { ApiError } from "../middleware/errors";
import {
  readField,
  type AccountDoc,
  type AttemptDoc,
  type ChallengeDoc,
  type DailyAnswerDoc,
  type OfflinePackDoc,
  type QuestionStatDoc,
  type LeaderboardField,
  type RedemptionDoc,
  type SessionDoc,
  type Store,
  type UserDoc,
} from "./types";

interface Data {
  users: Record<string, UserDoc>;
  sessions: Record<string, SessionDoc>;
  attempts: Record<string, AttemptDoc>;
  daily: Record<string, DailyAnswerDoc>;
  redemptions: Record<string, RedemptionDoc>;
  challenges: Record<string, ChallengeDoc>;
  offlinePacks: Record<string, OfflinePackDoc>;
  answerStats: Record<string, QuestionStatDoc>;
  accounts: Record<string, AccountDoc>;
}

const empty = (): Data => ({
  users: {}, sessions: {}, attempts: {}, daily: {}, redemptions: {}, challenges: {}, offlinePacks: {}, answerStats: {}, accounts: {},
});
const clone = <T>(v: T): T => structuredClone(v);

/**
 * Single-process JSON file store. Good for local development, demos and
 * hackathon judging: no database to install. All operations run
 * synchronously inside one Node process, so read-modify-write is atomic.
 * Writes are debounced and saved atomically (temp file + rename).
 *
 * Pass `null` as the path for a purely in-memory store (used by tests).
 */
export class FileStore implements Store {
  private data: Data;
  private timer: NodeJS.Timeout | null = null;

  constructor(private path: string | null) {
    this.data = empty();
    if (path && existsSync(path)) {
      this.data = { ...empty(), ...JSON.parse(readFileSync(path, "utf8")) };
    }
  }

  private persist() {
    if (!this.path || this.timer) return;
    this.timer = setTimeout(() => this.flush(), 200);
  }

  flush() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (!this.path) return;
    mkdirSync(dirname(this.path), { recursive: true });
    const tmp = `${this.path}.tmp`;
    writeFileSync(tmp, JSON.stringify(this.data));
    renameSync(tmp, this.path);
  }

  private update<T extends { version: number }>(bucket: Record<string, T>, id: string, mutate: (d: T) => void, what: string): T {
    const current = bucket[id];
    if (!current) throw new ApiError(404, "not_found", `${what} not found`);
    const next = clone(current);
    mutate(next);
    next.version = current.version + 1;
    bucket[id] = next;
    this.persist();
    return clone(next);
  }

  async getUser(id: string) {
    const u = this.data.users[id];
    return u ? clone(u) : null;
  }
  async insertUser(user: UserDoc) {
    if (this.data.users[user.id]) return clone(this.data.users[user.id]);
    this.data.users[user.id] = clone(user);
    this.persist();
    return clone(user);
  }
  async updateUser(id: string, mutate: (u: UserDoc) => void) {
    return this.update(this.data.users, id, mutate, "Player");
  }

  async insertSession(s: SessionDoc) {
    this.data.sessions[s.id] = clone(s);
    this.persist();
  }
  async getSession(id: string) {
    const s = this.data.sessions[id];
    return s ? clone(s) : null;
  }
  async updateSession(id: string, mutate: (s: SessionDoc) => void) {
    return this.update(this.data.sessions, id, mutate, "Quiz session");
  }

  async insertAttempt(a: AttemptDoc) {
    this.data.attempts[a.id] = clone(a);
    this.persist();
  }
  async getAttempt(id: string) {
    const a = this.data.attempts[id];
    return a ? clone(a) : null;
  }
  async listAttempts(userId: string, limit: number, before?: string) {
    return Object.values(this.data.attempts)
      .filter((a) => a.userId === userId && (!before || a.completedAt < before))
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .slice(0, limit)
      .map(clone);
  }

  async getDailyAnswer(userId: string, date: string) {
    const d = this.data.daily[`${userId}|${date}`];
    return d ? clone(d) : null;
  }
  async insertDailyAnswer(doc: DailyAnswerDoc) {
    const key = `${doc.userId}|${doc.date}`;
    if (this.data.daily[key]) return false;
    this.data.daily[key] = clone(doc);
    this.persist();
    return true;
  }

  async listDailyAnswers(userId: string, limit: number, before?: string) {
    return Object.values(this.data.daily)
      .filter((d) => d.userId === userId && (!before || d.answeredAt < before))
      .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
      .slice(0, limit)
      .map(clone);
  }

  async insertRedemption(doc: RedemptionDoc) {
    this.data.redemptions[doc.id] = clone(doc);
    this.persist();
  }
  async listRedemptions(userId: string) {
    return Object.values(this.data.redemptions)
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.redeemedAt.localeCompare(a.redeemedAt))
      .map(clone);
  }

  async insertChallenge(doc: ChallengeDoc) {
    this.data.challenges[doc.id] = clone(doc);
    this.persist();
  }
  async getChallenge(code: string) {
    const c = this.data.challenges[code];
    return c ? clone(c) : null;
  }
  async updateChallenge(code: string, mutate: (c: ChallengeDoc) => void) {
    return this.update(this.data.challenges, code, mutate, "Challenge");
  }

  async insertOfflinePack(doc: OfflinePackDoc) {
    this.data.offlinePacks[doc.id] = clone(doc);
    this.persist();
  }
  async getOfflinePack(id: string) {
    const p = this.data.offlinePacks[id];
    return p ? clone(p) : null;
  }
  async updateOfflinePack(id: string, mutate: (p: OfflinePackDoc) => void) {
    return this.update(this.data.offlinePacks, id, mutate, "Offline pack");
  }

  async listOfflinePacks(userId: string) {
    return Object.values(this.data.offlinePacks).filter((p) => p.userId === userId).map(clone);
  }

  async insertAccount(doc: AccountDoc) {
    const taken = Object.values(this.data.accounts).some(
      (a) => a.id === doc.id || a.email === doc.email || (doc.googleSub && a.googleSub === doc.googleSub),
    );
    if (taken) return false;
    this.data.accounts[doc.id] = clone(doc);
    this.persist();
    return true;
  }
  async getAccount(id: string) {
    const a = this.data.accounts[id];
    return a ? clone(a) : null;
  }
  async findAccountByEmail(email: string) {
    const a = Object.values(this.data.accounts).find((x) => x.email === email);
    return a ? clone(a) : null;
  }
  async findAccountByGoogleSub(sub: string) {
    const a = Object.values(this.data.accounts).find((x) => x.googleSub === sub);
    return a ? clone(a) : null;
  }
  async updateAccount(id: string, mutate: (a: AccountDoc) => void) {
    return this.update(this.data.accounts, id, mutate, "Account");
  }

  async transferUserData(from: string, to: string) {
    const d = this.data;
    for (const a of Object.values(d.attempts)) if (a.userId === from) a.userId = to;
    for (const r of Object.values(d.redemptions)) if (r.userId === from) r.userId = to;
    for (const p of Object.values(d.offlinePacks)) if (p.userId === from) p.userId = to;
    for (const s of Object.values(d.sessions)) if (s.userId === from) s.userId = to;
    for (const [key, doc] of Object.entries(d.daily)) {
      if (doc.userId !== from) continue;
      delete d.daily[key];
      const next = `${to}|${doc.date}`;
      if (!d.daily[next]) d.daily[next] = { ...doc, id: next, userId: to };
    }
    for (const c of Object.values(d.challenges)) {
      if (c.creatorId === from) c.creatorId = to;
      const hasTarget = c.players.some((p) => p.userId === to);
      c.players = c.players.filter((p) => !(hasTarget && p.userId === from)).map((p) => (p.userId === from ? { ...p, userId: to } : p));
    }
    this.persist();
  }
  async deleteUser(id: string) {
    delete this.data.users[id];
    this.persist();
  }

  async recordAnswerStat(questionId: string, correct: boolean, timeMs: number) {
    const s = (this.data.answerStats[questionId] ??= { id: questionId, answered: 0, correct: 0, totalTimeMs: 0 });
    s.answered += 1;
    if (correct) s.correct += 1;
    s.totalTimeMs += timeMs;
    this.persist();
  }
  async listAnswerStats() {
    return Object.values(this.data.answerStats).map(clone);
  }
  async totals() {
    return {
      players: Object.keys(this.data.users).length,
      quizzes: Object.keys(this.data.attempts).length,
      dailyAnswers: Object.keys(this.data.daily).length,
      redemptions: Object.keys(this.data.redemptions).length,
    };
  }

  async topUsers(field: LeaderboardField, limit: number) {
    return Object.values(this.data.users)
      .filter((u) => readField(u, field) > 0)
      .sort((a, b) => readField(b, field) - readField(a, field) || a.createdAt.localeCompare(b.createdAt))
      .slice(0, limit)
      .map(clone);
  }
  async countUsersAbove(field: LeaderboardField, value: number) {
    return Object.values(this.data.users).filter((u) => readField(u, field) > value).length;
  }

  async close() {
    this.flush();
  }
}
