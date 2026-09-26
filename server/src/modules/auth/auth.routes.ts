import { Router, type Request } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { PASSWORD_MIN_LENGTH, type AuthConfig } from "../../../../shared/auth-contract";
import { config } from "../../config";
import { ApiError } from "../../middleware/errors";
import { requireUser } from "../../middleware/requireUser";
import type { AuthService } from "./auth.service";
import { isGoogleEnabled } from "./google";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(120);
const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(128, "Password is too long.");
const displayName = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters.")
  .max(40, "Name must be at most 40 characters.")
  .regex(/^[^<>]+$/, "Name cannot contain < or >.");

/** The browser's guest id, so its quiz progress can move into the account. */
function guestIdOf(req: Request): string | null {
  const g = req.header("x-guest-id");
  return g && UUID.test(g) ? g.toLowerCase() : null;
}

function accountIdOf(req: Request): string {
  const u = req.user;
  if (!u || u.isGuest) throw new ApiError(401, "unauthenticated", "Please sign in first.");
  return u.id.slice(2);
}

/** Account routes. Mount with: app.use("/api/auth", authRouter(service)) */
export function authRouter(service: AuthService) {
  const r = Router();
  const strict = config.isTest
    ? []
    : [rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: "draft-7", legacyHeaders: false, message: { error: { code: "rate_limited", message: "Too many attempts. Please wait a few minutes and try again." } } })];

  r.get("/config", (_req, res) => {
    const body: AuthConfig = { googleClientId: isGoogleEnabled() ? config.googleClientId || "test-client" : null, passwordMinLength: PASSWORD_MIN_LENGTH };
    res.json(body);
  });

  const code = z.string().trim().regex(/^\d{6}$/, "Enter the 6 digit code.");
  const verificationId = z.string().uuid();

  // Sign up, step 1: send codes to the email and the phone. Nothing is saved yet.
  r.post("/register/start", ...strict, async (req, res) => {
    const body = z.object({ email, phone: z.string().trim().min(8).max(20), password, displayName }).parse(req.body);
    res.status(202).json(await service.startRegistration(body.email, body.phone, body.password, body.displayName));
  });

  // Sign up, step 2: both codes correct, then the account is created.
  r.post("/register/verify", ...strict, async (req, res) => {
    const body = z.object({ verificationId, emailCode: code, phoneCode: code }).parse(req.body);
    res.status(201).json(await service.completeRegistration(body.verificationId, body.emailCode, body.phoneCode, guestIdOf(req)));
  });

  r.post("/otp/resend", ...strict, async (req, res) => {
    const body = z.object({ verificationId, channel: z.enum(["email", "phone"]) }).parse(req.body);
    res.json(await service.resend(body.verificationId, body.channel));
  });

  r.post("/login", ...strict, async (req, res) => {
    const body = z.object({ identifier: z.string().trim().min(3).max(120), password: z.string().min(1).max(128) }).parse(req.body);
    res.json(await service.login(body.identifier, body.password, guestIdOf(req)));
  });

  r.post("/password/forgot", ...strict, async (req, res) => {
    const body = z.object({ email }).parse(req.body);
    res.status(202).json(await service.startPasswordReset(body.email));
  });

  r.post("/password/reset", ...strict, async (req, res) => {
    const body = z.object({ verificationId, code, newPassword: password }).parse(req.body);
    res.json(await service.completePasswordReset(body.verificationId, body.code, body.newPassword, guestIdOf(req)));
  });

  r.post("/google", ...strict, async (req, res) => {
    if (!isGoogleEnabled()) throw new ApiError(503, "google_disabled", "Google sign-in is not set up on this server.");
    const body = z.object({ credential: z.string().min(20).max(4096) }).parse(req.body);
    res.json(await service.loginWithGoogle(body.credential, guestIdOf(req)));
  });

  // Everything below needs a signed-in account.
  r.use(requireUser);

  r.get("/me", async (req, res) => {
    res.json(await service.get(accountIdOf(req)));
  });

  r.patch("/me", async (req, res) => {
    const body = z.object({ displayName }).parse(req.body);
    res.json(await service.rename(accountIdOf(req), body.displayName));
  });

  r.post("/password", ...strict, async (req, res) => {
    const body = z.object({ currentPassword: z.string().max(128).optional(), newPassword: password }).parse(req.body);
    res.json(await service.changePassword(accountIdOf(req), body.currentPassword, body.newPassword));
  });

  // Add or change the account's phone (used after Google sign-in)
  r.post("/phone/start", ...strict, async (req, res) => {
    const body = z.object({ phone: z.string().trim().min(8).max(20) }).parse(req.body);
    res.status(202).json(await service.startPhoneVerification(accountIdOf(req), body.phone));
  });

  r.post("/phone/verify", ...strict, async (req, res) => {
    const body = z.object({ verificationId, code }).parse(req.body);
    res.json(await service.completePhoneVerification(accountIdOf(req), body.verificationId, body.code));
  });

  r.post("/logout-all", async (req, res) => {
    await service.logoutEverywhere(accountIdOf(req));
    res.status(204).end();
  });

  return r;
}
