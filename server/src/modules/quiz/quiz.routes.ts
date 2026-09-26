import { Router, type Request } from "express";
import { z } from "zod";
import { LANGS, type Lang } from "../../../../shared/quiz-contract";
import { ApiError } from "../../middleware/errors";
import { requireUser } from "../../middleware/requireUser";
import type { QuizService } from "./quiz.service";

const categoryParam = z.enum(["rhythms", "architecture", "culinary", "traditions", "rulers", "mixed"]);
const scopeParam = z.enum(["overall", "rhythms", "architecture", "culinary", "traditions", "rulers"]);
const difficulty = z.enum(["seeker", "historian"]);
const mode = z.enum(["standard", "review", "map", "vulnerable", "heritage", "challenge"]);
const index = z.number().int().min(0).max(10);
const point = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).strict();

const answerPayload = z.union([
  z.object({ choice: index }).strict(),
  z.object({ order: z.array(index).min(2).max(6) }).strict(),
  z.object({ pairs: z.array(index).min(2).max(6) }).strict(),
  z.object({ point }).strict(),
  z.object({ timedOut: z.literal(true) }).strict(),
]);

const offlineAnswer = z.union([
  z.object({ choice: index }).strict(),
  z.object({ order: z.array(index).min(2).max(6) }).strict(),
  z.object({ pairs: z.array(index).min(2).max(6) }).strict(),
]);

const uuid = z.string().uuid();
const code = z.string().trim().min(4).max(12).regex(/^[A-Za-z0-9]+$/);

/** Language from `?lang=` or the `X-Lang` header. Defaults to English. */
function langOf(req: Request): Lang {
  const raw = String(req.query.lang ?? req.header("x-lang") ?? "en").toLowerCase();
  return (LANGS as string[]).includes(raw) ? (raw as Lang) : "en";
}

/**
 * Quiz routes. Mount with: app.use("/api/quiz", quizRouter(service))
 * Every route requires a player (see middleware/requireUser.ts), except
 * /admin/stats which needs the X-Admin-Key header.
 */
export function quizRouter(service: QuizService): Router {
  const r = Router();

  // Admin analytics, protected by ADMIN_KEY (disabled when the key is not set)
  r.get("/admin/stats", async (req, res) => {
    const key = process.env.ADMIN_KEY?.trim();
    if (!key) throw new ApiError(404, "not_found", "Admin analytics are disabled. Set ADMIN_KEY on the server to enable them.");
    if (req.header("x-admin-key") !== key) throw new ApiError(401, "invalid_admin_key", "Wrong admin key.");
    res.json(await service.adminStats());
  });

  r.use(requireUser);

  r.get("/categories", (_req, res) => {
    res.json(service.listCategories());
  });

  /** For other modules: how many quiz questions exist about these traditions or sites. ?ids=a,b,c */
  r.get("/heritage", (req, res) => {
    const ids = String(req.query.ids ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50);
    res.json(service.heritageInfo(ids));
  });

  r.get("/heritage/:id", (req, res) => {
    const info = service.heritageInfo([req.params.id]);
    if (!info.length) throw new ApiError(404, "not_found", "That tradition or site was not found.");
    res.json(info[0]);
  });

  r.post("/sessions", async (req, res) => {
    const body = z
      .object({
        mode: mode.optional(),
        category: categoryParam.optional(),
        difficulty: difficulty.optional(),
        heritageId: z.string().max(60).optional(),
        challengeCode: code.optional(),
      })
      .parse(req.body);
    res.status(201).json(await service.startSession(req.user!, body));
  });

  r.get("/sessions/:id/current", async (req, res) => {
    res.json(await service.currentQuestion(req.user!, uuid.parse(req.params.id), langOf(req)));
  });

  r.post("/sessions/:id/answers", async (req, res) => {
    const body = z.object({ questionId: z.string().min(1).max(40), answer: answerPayload }).parse(req.body);
    res.json(await service.submitAnswer(req.user!, uuid.parse(req.params.id), body.questionId, body.answer, langOf(req)));
  });

  r.post("/sessions/:id/complete", async (req, res) => {
    res.json(await service.completeSession(req.user!, uuid.parse(req.params.id), langOf(req)));
  });

  r.get("/attempts/:id", async (req, res) => {
    res.json(await service.getAttempt(req.user!, uuid.parse(req.params.id)));
  });

  r.post("/challenges", async (req, res) => {
    const body = z.object({ attemptId: uuid }).parse(req.body);
    res.status(201).json(await service.createChallenge(req.user!, body.attemptId));
  });

  r.get("/challenges/:code", async (req, res) => {
    res.json(await service.getChallengeInfo(req.user!, code.parse(req.params.code)));
  });

  r.get("/daily", async (req, res) => {
    res.json(await service.getDaily(req.user!, langOf(req)));
  });

  r.post("/daily/answer", async (req, res) => {
    const body = z.object({ answer: answerPayload }).parse(req.body);
    res.json(await service.answerDaily(req.user!, body.answer, langOf(req)));
  });

  r.post("/offline/packs", async (req, res) => {
    const body = z.object({ category: categoryParam, difficulty }).parse(req.body);
    res.status(201).json(await service.createOfflinePack(req.user!, body.category, body.difficulty, langOf(req)));
  });

  r.post("/offline/packs/:id/submit", async (req, res) => {
    const body = z
      .object({
        answers: z
          .array(z.object({ questionId: z.string().min(1).max(40), answer: offlineAnswer, timeMs: z.number().int().min(0).max(3_600_000) }))
          .max(20),
      })
      .parse(req.body);
    res.json(await service.submitOfflinePack(req.user!, uuid.parse(req.params.id), body));
  });

  r.get("/me", async (req, res) => {
    res.json(await service.getProfile(req.user!));
  });

  r.patch("/me", async (req, res) => {
    const body = z
      .object({
        displayName: z
          .string()
          .trim()
          .min(2, "Name must be at least 2 characters")
          .max(24, "Name must be at most 24 characters")
          .regex(/^[\p{L}\p{M}\p{N} ._'-]+$/u, "Use letters, numbers and spaces only"),
      })
      .parse(req.body);
    res.json(await service.updateDisplayName(req.user!, body.displayName));
  });

  r.get("/leaderboard", async (req, res) => {
    const q = z.object({ scope: scopeParam.default("overall"), limit: z.coerce.number().int().min(5).max(50).default(20) }).parse(req.query);
    res.json(await service.leaderboard(req.user!, q.scope, q.limit));
  });

  r.get("/rewards", async (req, res) => {
    res.json(await service.listRewards(req.user!));
  });

  r.post("/rewards/:id/redeem", async (req, res) => {
    const id = z.string().min(1).max(60).parse(req.params.id);
    res.status(201).json(await service.redeem(req.user!, id));
  });

  r.get("/me/redemptions", async (req, res) => {
    res.json(await service.listRedemptions(req.user!));
  });

  return r;
}
