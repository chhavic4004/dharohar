import path from "node:path";
import cors from "cors";
import express, { type RequestHandler } from "express";
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

export interface WebExtras {
  /** Heritage story map endpoints (/api/stories, /api/partition-path). Reads the raw body, so it runs before the JSON parser. */
  mapApi?: RequestHandler;
  /** AI chatbot (POST /api/ask) */
  ask?: RequestHandler;
  /** Built website folder to serve, with a single-page-app fallback */
  webDir?: string;
}

export function createApp(store: Store, opts: { clock?: () => Date; web?: WebExtras } = {}) {
  const app = express();
  const web = opts.web ?? {};
  app.disable("x-powered-by");
  // Behind Render/Railway/Nginx: trust the first proxy so rate limits see the real client IP
  app.set("trust proxy", 1);
  app.use(
    helmet({
      // The website loads map tiles, fonts, images and media from other sites
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    cors({
      origin: config.corsOrigins,
      allowedHeaders: ["Content-Type", "Authorization", "X-Guest-Id", "X-Lang", "X-Admin-Key"],
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    }),
  );
  if (web.mapApi) app.use(["/api/stories", "/api/partition-path"], web.mapApi);
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
  if (web.ask) app.post("/api/ask", web.ask);

  if (web.webDir) {
    const dir = web.webDir;
    app.use(express.static(dir, { index: false, maxAge: "1h" }));
    // Any other page (not /api, not a file) gets the app shell so client-side routes work on refresh
    app.get(/^\/(?!api\/)(?!.*\.[A-Za-z0-9]+$).*/, (_req, res) => res.sendFile(path.join(dir, "index.html")));
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
