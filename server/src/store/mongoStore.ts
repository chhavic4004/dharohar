import { MongoClient, type Collection, type Db, type Document } from "mongodb";
import { ApiError } from "../middleware/errors";
import type {
  AccountDoc,
  AttemptDoc,
  BaseDoc,
  ChallengeDoc,
  DailyAnswerDoc,
  OfflinePackDoc,
  QuestionStatDoc,
  LeaderboardField,
  RedemptionDoc,
  SessionDoc,
  Store,
  UserDoc,
} from "./types";

type Stored<T extends BaseDoc> = Omit<T, "id"> & { _id: string };

const toStored = <T extends BaseDoc>(doc: T): Stored<T> => {
  const { id, ...rest } = doc;
  return { _id: id, ...rest } as Stored<T>;
};
const fromStored = <T extends BaseDoc>(doc: Document | null): T | null => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest } as T;
};

const MAX_RETRIES = 8;

/**
 * MongoDB implementation. Collections: quiz_users, quiz_sessions,
 * quiz_attempts, quiz_daily_answers, quiz_redemptions. All prefixed with
 * `quiz_` so they never collide with other modules sharing the database.
 */
export class MongoStore implements Store {
  private constructor(
    private client: MongoClient,
    private db: Db,
  ) {}

  static async connect(uri: string, dbName: string): Promise<MongoStore> {
    const client = new MongoClient(uri);
    await client.connect();
    const store = new MongoStore(client, client.db(dbName));
    await store.ensureIndexes();
    return store;
  }

  // Collections are untyped at the driver level; documents are converted with toStored/fromStored.
  private col(name: string): Collection<Document> {
    return this.db.collection(name);
  }
  private get users() { return this.col("quiz_users"); }
  private get sessions() { return this.col("quiz_sessions"); }
  private get attempts() { return this.col("quiz_attempts"); }
  private get daily() { return this.col("quiz_daily_answers"); }
  private get redemptions() { return this.col("quiz_redemptions"); }
  private get challenges() { return this.col("quiz_challenges"); }
  private get offlinePacks() { return this.col("quiz_offline_packs"); }
  private get answerStats() { return this.col("quiz_answer_stats"); }
  /** Site-wide logins, so not prefixed with quiz_ */
  private get accounts() { return this.col("accounts"); }

  private async ensureIndexes() {
    await Promise.all([
      this.users.createIndex({ xp: -1 }),
      this.attempts.createIndex({ userId: 1, completedAt: -1 }),
      this.daily.createIndex({ userId: 1, date: 1 }, { unique: true }),
      this.redemptions.createIndex({ userId: 1, redeemedAt: -1 }),
      this.daily.createIndex({ userId: 1, answeredAt: -1 }),
      this.offlinePacks.createIndex({ userId: 1 }),
      this.accounts.createIndex({ email: 1 }, { unique: true }),
      this.accounts.createIndex({ googleSub: 1 }, { unique: true, partialFilterExpression: { googleSub: { $type: "string" } } }),
      this.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }).catch(() => undefined),
    ]);
  }

  /** Optimistic-locking update: retry if someone else changed the doc meanwhile. */
  private async update<T extends BaseDoc>(col: Collection<Document>, id: string, mutate: (d: T) => void, what: string): Promise<T> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const current = fromStored<T>(await col.findOne({ _id: id } as Document));
      if (!current) throw new ApiError(404, "not_found", `${what} not found`);
      const next = structuredClone(current);
      mutate(next);
      next.version = current.version + 1;
      const res = await col.replaceOne({ _id: id, version: current.version } as Document, toStored(next) as Document);
      if (res.matchedCount === 1) return next;
    }
    throw new ApiError(409, "conflict", `${what} is being updated elsewhere. Please retry.`);
  }

  async getUser(id: string) {
    return fromStored<UserDoc>(await this.users.findOne({ _id: id } as Document));
  }
  async insertUser(user: UserDoc) {
    try {
      await this.users.insertOne(toStored(user) as never);
      return user;
    } catch (e) {
      if ((e as { code?: number }).code === 11000) return (await this.getUser(user.id))!;
      throw e;
    }
  }
  updateUser(id: string, mutate: (u: UserDoc) => void) {
    return this.update(this.users, id, mutate, "Player");
  }

  async insertSession(s: SessionDoc) {
    await this.sessions.insertOne({ ...toStored(s), createdAt: new Date(s.createdAt) } as never);
  }
  async getSession(id: string) {
    const s = fromStored<SessionDoc>(await this.sessions.findOne({ _id: id } as Document));
    if (s && (s.createdAt as unknown) instanceof Date) s.createdAt = (s.createdAt as unknown as Date).toISOString();
    return s;
  }
  async updateSession(id: string, mutate: (s: SessionDoc) => void) {
    // createdAt is stored as a Date for the TTL index; keep it that way on replace.
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const current = await this.getSession(id);
      if (!current) throw new ApiError(404, "not_found", "Quiz session not found");
      const next = structuredClone(current);
      mutate(next);
      next.version = current.version + 1;
      const res = await this.sessions.replaceOne(
        { _id: id, version: current.version } as Document,
        { ...toStored(next), createdAt: new Date(next.createdAt) } as never,
      );
      if (res.matchedCount === 1) return next;
    }
    throw new ApiError(409, "conflict", "Quiz session is being updated elsewhere. Please retry.");
  }

  async insertAttempt(a: AttemptDoc) {
    await this.attempts.insertOne(toStored(a) as never);
  }
  async getAttempt(id: string) {
    return fromStored<AttemptDoc>(await this.attempts.findOne({ _id: id } as Document));
  }
  async listAttempts(userId: string, limit: number, before?: string) {
    const docs = await this.attempts.find({ userId, ...(before ? { completedAt: { $lt: before } } : {}) } as Document).sort({ completedAt: -1 }).limit(limit).toArray();
    return docs.map((d) => fromStored<AttemptDoc>(d)!);
  }

  async getDailyAnswer(userId: string, date: string) {
    return fromStored<DailyAnswerDoc>(await this.daily.findOne({ userId, date } as Document));
  }
  async insertDailyAnswer(doc: DailyAnswerDoc) {
    try {
      await this.daily.insertOne(toStored(doc) as never);
      return true;
    } catch (e) {
      if ((e as { code?: number }).code === 11000) return false;
      throw e;
    }
  }

  async listDailyAnswers(userId: string, limit: number, before?: string) {
    const docs = await this.daily
      .find({ userId, ...(before ? { answeredAt: { $lt: before } } : {}) } as Document)
      .sort({ answeredAt: -1 })
      .limit(limit)
      .toArray();
    return docs.map((d) => fromStored<DailyAnswerDoc>(d)!);
  }

  async insertRedemption(doc: RedemptionDoc) {
    await this.redemptions.insertOne(toStored(doc) as never);
  }
  async listRedemptions(userId: string) {
    const docs = await this.redemptions.find({ userId } as Document).sort({ redeemedAt: -1 }).toArray();
    return docs.map((d) => fromStored<RedemptionDoc>(d)!);
  }

  async insertChallenge(doc: ChallengeDoc) {
    await this.challenges.insertOne(toStored(doc) as never);
  }
  async getChallenge(code: string) {
    return fromStored<ChallengeDoc>(await this.challenges.findOne({ _id: code } as Document));
  }
  updateChallenge(code: string, mutate: (c: ChallengeDoc) => void) {
    return this.update(this.challenges, code, mutate, "Challenge");
  }

  async insertOfflinePack(doc: OfflinePackDoc) {
    await this.offlinePacks.insertOne(toStored(doc) as never);
  }
  async getOfflinePack(id: string) {
    return fromStored<OfflinePackDoc>(await this.offlinePacks.findOne({ _id: id } as Document));
  }
  updateOfflinePack(id: string, mutate: (p: OfflinePackDoc) => void) {
    return this.update(this.offlinePacks, id, mutate, "Offline pack");
  }

  async listOfflinePacks(userId: string) {
    const docs = await this.offlinePacks.find({ userId } as Document).toArray();
    return docs.map((d) => fromStored<OfflinePackDoc>(d)!);
  }

  async insertAccount(doc: AccountDoc) {
    try {
      await this.accounts.insertOne(toStored(doc) as never);
      return true;
    } catch (e) {
      if ((e as { code?: number }).code === 11000) return false;
      throw e;
    }
  }
  async getAccount(id: string) {
    return fromStored<AccountDoc>(await this.accounts.findOne({ _id: id } as Document));
  }
  async findAccountByEmail(email: string) {
    return fromStored<AccountDoc>(await this.accounts.findOne({ email } as Document));
  }
  async findAccountByGoogleSub(sub: string) {
    return fromStored<AccountDoc>(await this.accounts.findOne({ googleSub: sub } as Document));
  }
  updateAccount(id: string, mutate: (a: AccountDoc) => void) {
    return this.update(this.accounts, id, mutate, "Account");
  }

  async transferUserData(from: string, to: string) {
    const f = { userId: from } as Document;
    const set = { $set: { userId: to } };
    await Promise.all([
      this.attempts.updateMany(f, set),
      this.redemptions.updateMany(f, set),
      this.offlinePacks.updateMany(f, set),
      this.sessions.updateMany(f, set),
      this.challenges.updateMany({ creatorId: from } as Document, { $set: { creatorId: to } }),
    ]);
    // Challenges the target already played keep the target's entry.
    await this.challenges.updateMany({ "players.userId": { $all: [from, to] } } as Document, { $pull: { players: { userId: from } } } as Document);
    await this.challenges.updateMany(
      { "players.userId": from } as Document,
      { $set: { "players.$[p].userId": to } } as Document,
      { arrayFilters: [{ "p.userId": from }] },
    );
    const daily = await this.daily.find(f).toArray();
    for (const raw of daily) {
      const doc = fromStored<DailyAnswerDoc>(raw)!;
      const id = `${to}|${doc.date}`;
      await this.daily.insertOne(toStored({ ...doc, id, userId: to }) as never).catch((e) => {
        if ((e as { code?: number }).code !== 11000) throw e;
      });
    }
    await this.daily.deleteMany(f);
  }
  async deleteUser(id: string) {
    await this.users.deleteOne({ _id: id } as Document);
  }

  async recordAnswerStat(questionId: string, correct: boolean, timeMs: number) {
    await this.answerStats.updateOne(
      { _id: questionId } as Document,
      { $inc: { answered: 1, correct: correct ? 1 : 0, totalTimeMs: timeMs } },
      { upsert: true },
    );
  }
  async listAnswerStats() {
    const docs = await this.answerStats.find({}).toArray();
    return docs.map((d) => ({ id: String(d._id), answered: d.answered ?? 0, correct: d.correct ?? 0, totalTimeMs: d.totalTimeMs ?? 0 }) as QuestionStatDoc);
  }
  async totals() {
    const [players, quizzes, dailyAnswers, redemptions] = await Promise.all([
      this.users.estimatedDocumentCount(),
      this.attempts.estimatedDocumentCount(),
      this.daily.estimatedDocumentCount(),
      this.redemptions.estimatedDocumentCount(),
    ]);
    return { players, quizzes, dailyAnswers, redemptions };
  }

  async topUsers(field: LeaderboardField, limit: number) {
    const docs = await this.users
      .find({ [field]: { $gt: 0 } } as Document)
      .sort({ [field]: -1, createdAt: 1 })
      .limit(limit)
      .toArray();
    return docs.map((d) => fromStored<UserDoc>(d)!);
  }
  async countUsersAbove(field: LeaderboardField, value: number) {
    return this.users.countDocuments({ [field]: { $gt: value } } as Document);
  }

  async close() {
    await this.client.close();
  }
}
