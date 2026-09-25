import { Router } from "express";
import { z } from "zod";
import { requireUser } from "../../middleware/requireUser";
import type { QuizService } from "./quiz.service";

const categoryParam = z.enum(["rhythms", "architecture", "culinary", "traditions", "rulers", "mixed"]);
const scopeParam = z.enum(["overall", "rhythms", "architecture", "culinary", "traditions", "rulers"]);
const difficulty = z.enum(["seeker", "historian"]);
const index = z.number().int().min(0).max(10);

const answerPayload = z.union([
  z.object({ choice: index }).strict(),
  z.object({ order: z.array(index).min(2).max(6) }).strict(),
  z.object({ pairs: z.array(index).min(2).max(6) }).strict(),
  z.object({ timedOut: z.literal(true) }).strict(),
]);

const uuid = z.string().uuid();

/**
 * Quiz routes. Mount with: app.use("/api/quiz", quizRouter(service))
 * Every route requires a player (see middleware/requireUser.ts).
 */
export function quizRouter(service: QuizService): Router {
  const r = Router();
  r.use(requireUser);

  r.get("/categories", (_req, res) => {
    res.json(service.listCategories());
  });

  r.post("/sessions", async (req, res) => {
    const body = z.object({ category: categoryParam, difficulty }).parse(req.body);
    res.status(201).json(await service.startSession(req.user!, body.category, body.difficulty));
  });

  r.get("/sessions/:id/current", async (req, res) => {
    res.json(await service.currentQuestion(req.user!, uuid.parse(req.params.id)));
  });

  r.post("/sessions/:id/answers", async (req, res) => {
    const body = z.object({ questionId: z.string().min(1).max(40), answer: answerPayload }).parse(req.body);
    res.json(await service.submitAnswer(req.user!, uuid.parse(req.params.id), body.questionId, body.answer));
  });

  r.post("/sessions/:id/complete", async (req, res) => {
    res.json(await service.completeSession(req.user!, uuid.parse(req.params.id)));
  });

  r.get("/attempts/:id", async (req, res) => {
    res.json(await service.getAttempt(req.user!, uuid.parse(req.params.id)));
  });

  r.get("/daily", async (req, res) => {
    res.json(await service.getDaily(req.user!));
  });

  r.post("/daily/answer", async (req, res) => {
    const body = z.object({ answer: answerPayload }).parse(req.body);
    res.json(await service.answerDaily(req.user!, body.answer));
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
