import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config";
import { errorHandler, notFound } from "./middleware/errors";
import { QuizService } from "./modules/quiz/quiz.service";
import { quizRouter } from "./modules/quiz/quiz.routes";
import type { Store } from "./store/types";

export function createApp(store: Store, opts: { clock?: () => Date } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      allowedHeaders: ["Content-Type", "Authorization", "X-Guest-Id", "X-Lang", "X-Admin-Key"],
      methods: ["GET", "POST", "PATCH", "OPTIONS"],
    }),
  );
  app.use(express.json({ limit: "20kb" }));
  if (!config.isTest) {
    app.use("/api", rateLimit({ windowMs: 5 * 60 * 1000, limit: 600, standardHeaders: "draft-7", legacyHeaders: false }));
  }

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "dharohar-api", time: new Date().toISOString() });
  });

  const quiz = new QuizService(store, opts.clock);
  app.use("/api/quiz", quizRouter(quiz));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
