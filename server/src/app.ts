import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config";
import { errorHandler, notFound } from "./middleware/errors";
import { setAuthVerifier } from "./middleware/requireUser";
import { AuthService } from "./modules/auth/auth.service";
import { authRouter } from "./modules/auth/auth.routes";
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
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
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
  const auth = new AuthService(
    store,
    {
      // A guest who signs in keeps their quiz progress.
      onSignIn: (account, guestId) => (guestId ? quiz.mergeGuestInto(`g:${guestId}`, `u:${account.id}`, account.displayName) : Promise.resolve(false)),
      onRename: (account) => quiz.syncDisplayName(`u:${account.id}`, account.displayName),
    },
    opts.clock,
  );
  quiz.onAccountRename = async (userId, displayName) => {
    await auth.rename(userId.slice(2), displayName);
  };
  setAuthVerifier(async (token) => {
    const account = await auth.verify(token);
    return account ? { userId: account.id, displayName: account.displayName } : null;
  });

  app.use("/api/auth", authRouter(auth));
  app.use("/api/quiz", quizRouter(quiz));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
