import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { ApiError } from "../middleware/errors";
import {
  readField,
  type AttemptDoc,
  type DailyAnswerDoc,
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
}

const empty = (): Data => ({ users: {}, sessions: {}, attempts: {}, daily: {}, redemptions: {} });
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
  async listAttempts(userId: string, limit: number) {
    return Object.values(this.data.attempts)
      .filter((a) => a.userId === userId)
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
