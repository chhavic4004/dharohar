import { randomUUID } from "node:crypto";
import { DEFAULT_PERSONA, isPersona, type Account, type AuthProvider, type AuthResponse, type Persona, type VerificationStarted } from "../../../../shared/auth-contract";
import { config } from "../../config";
import { ApiError } from "../../middleware/errors";
import type { AccountDoc, OtpDoc, Store } from "../../store/types";
import { verifyGoogleCredential } from "./google";
import { DUMMY_HASH, hashPassword, verifyPassword } from "./password";
import { getSenders, type Purpose } from "./senders";
import { codeMatches, hashCode, newCode, readToken, signToken } from "./tokens";

/**
 * Hooks into other modules. The quiz uses these to move guest progress into
 * the account and keep display names in step. Other features can add their
 * own the same way in app.ts.
 */
export interface AuthHooks {
  /** guestId is the raw X-Guest-Id UUID, if the browser sent one */
  onSignIn?: (account: AccountDoc, guestId: string | null) => Promise<boolean>;
  onRename?: (account: AccountDoc) => Promise<void>;
}

const OTP_MINUTES = 10;
const RESEND_SECONDS = 30;
const MAX_ATTEMPTS = 5;
const MAX_SENDS = 5;

export function toAccount(a: AccountDoc): Account {
  const providers: AuthProvider[] = [];
  if (a.passwordHash) providers.push("password");
  if (a.googleSub) providers.push("google");
  return {
    id: a.id,
    email: a.email,
    phone: a.phone ?? null,
    emailVerified: !!a.emailVerified,
    phoneVerified: !!(a.phone && a.phoneVerified),
    displayName: a.displayName,
    preferredLang: a.preferredLang ?? null,
    avatarUrl: a.avatarUrl ?? null,
    persona: isPersona(a.persona) ? a.persona : DEFAULT_PERSONA,
    providers,
    createdAt: a.createdAt,
  };
}

const normEmail = (e: string) => e.trim().toLowerCase();

/**
 * Accepts "98765 43210", "+91-98765-43210", "09876543210" or any "+<country><number>".
 * Returns E.164 (+919876543210) or null if it is not a valid mobile number.
 */
export function normalizePhone(raw: string): string | null {
  const s = raw.replace(/[\s\-().]/g, "");
  if (/^[6-9]\d{9}$/.test(s)) return `+91${s}`;
  if (/^0[6-9]\d{9}$/.test(s)) return `+91${s.slice(1)}`;
  if (/^91[6-9]\d{9}$/.test(s)) return `+${s}`;
  if (/^\+91[6-9]\d{9}$/.test(s)) return s;
  if (/^\+(?!91)[1-9]\d{7,14}$/.test(s)) return s;
  return null;
}

export function maskEmail(e: string) {
  const [user, domain] = e.split("@");
  return `${user.slice(0, 1)}${"*".repeat(Math.max(2, user.length - 1))}@${domain}`;
}
export function maskPhone(p: string) {
  return `${p.slice(0, p.length - 10)} ******${p.slice(-4)}`;
}

export class AuthService {
  constructor(
    private store: Store,
    private hooks: AuthHooks = {},
    private clock: () => Date = () => new Date(),
  ) {}

  private now() {
    return this.clock();
  }

  private async issue(account: AccountDoc, guestId: string | null): Promise<AuthResponse> {
    const merged = (await this.hooks.onSignIn?.(account, guestId)) ?? false;
    const { token, expiresAt } = await signToken({ accountId: account.id, tokenVersion: account.tokenVersion }, this.now());
    return { token, expiresAt, account: toAccount(account), mergedGuestProgress: merged };
  }

  // ─── One-time codes ─────────────────────────────────────────────────────────

  /** Sends fresh codes on the given channels and stores their hashes on the check. */
  private async send(doc: OtpDoc, channels: { email?: boolean; phone?: boolean }): Promise<VerificationStarted> {
    const senders = getSenders();
    const devCodes: { email?: string; phone?: string } = {};
    const purpose: Purpose = doc.purpose;

    for (const ch of ["email", "phone"] as const) {
      if (!channels[ch]) continue;
      const live = ch === "email" ? senders.live.email : senders.live.sms;
      if (!live && config.isProd && !config.allowDemoOtp) {
        throw new ApiError(503, "delivery_unavailable", ch === "email" ? "Email verification is not set up on this server yet." : "SMS verification is not set up on this server yet.");
      }
      const code = newCode();
      const target = ch === "email" ? doc.email! : doc.phone!;
      try {
        if (ch === "email") await senders.email(target, code, purpose);
        else await senders.sms(target, code, purpose);
      } catch (e) {
        console.error(`[otp] ${ch} delivery failed:`, (e as Error).message);
        throw new ApiError(502, "delivery_failed", ch === "email" ? "We could not send the email. Check the address and try again." : "We could not send the SMS. Check the number and try again.");
      }
      if (ch === "email") doc.emailCodeHash = hashCode(`${doc.id}:email`, code);
      else doc.phoneCodeHash = hashCode(`${doc.id}:phone`, code);
      if (!live) devCodes[ch] = code;
    }
    return {
      verificationId: doc.id,
      sentTo: {
        ...(channels.email && doc.email ? { email: maskEmail(doc.email) } : {}),
        ...(channels.phone && doc.phone ? { phone: maskPhone(doc.phone) } : {}),
      },
      expiresAt: doc.expiresAt,
      resendAfterSeconds: RESEND_SECONDS,
      ...(Object.keys(devCodes).length ? { devCodes } : {}),
    };
  }

  private freshOtp(purpose: OtpDoc["purpose"], fields: Partial<OtpDoc>): OtpDoc {
    const now = this.now();
    return {
      id: randomUUID(),
      version: 0,
      purpose,
      attempts: 0,
      sends: 1,
      lastSentAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + OTP_MINUTES * 60_000).toISOString(),
      ...fields,
    };
  }

  /** Loads a live check or explains why it cannot be used. */
  private async liveOtp(id: string, purpose: OtpDoc["purpose"]): Promise<OtpDoc> {
    const doc = await this.store.getOtp(id);
    if (!doc || doc.purpose !== purpose) throw new ApiError(400, "verification_invalid", "This code has expired. Please request a new one.");
    if (new Date(doc.expiresAt) < this.now()) {
      await this.store.deleteOtp(id);
      throw new ApiError(400, "verification_expired", "This code has expired. Please request a new one.");
    }
    if (doc.attempts >= MAX_ATTEMPTS) {
      await this.store.deleteOtp(id);
      throw new ApiError(429, "too_many_attempts", "Too many wrong codes. Please start again.");
    }
    return doc;
  }

  private async failAttempt(id: string, message = "That code is not correct. Please check and try again."): Promise<never> {
    const doc = await this.store.updateOtp(id, (o) => (o.attempts += 1));
    const left = MAX_ATTEMPTS - doc.attempts;
    throw new ApiError(400, "invalid_code", left > 0 ? `${message} ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong codes. Please start again.");
  }

  async resend(verificationId: string, channel: "email" | "phone"): Promise<VerificationStarted> {
    const doc = await this.store.getOtp(verificationId);
    if (!doc || new Date(doc.expiresAt) < this.now()) throw new ApiError(400, "verification_expired", "This code has expired. Please start again.");
    if ((channel === "email" && !doc.email) || (channel === "phone" && !doc.phone)) throw new ApiError(400, "invalid_request", "Nothing to resend.");
    const wait = RESEND_SECONDS - (this.now().getTime() - new Date(doc.lastSentAt).getTime()) / 1000;
    if (wait > 0) throw new ApiError(429, "resend_too_soon", `Please wait ${Math.ceil(wait)} seconds before asking for a new code.`);
    if (doc.sends >= MAX_SENDS) throw new ApiError(429, "too_many_sends", "Too many codes sent. Please start again in a few minutes.");

    // A reset check for an unknown email pretends to resend (no account enumeration).
    if (doc.purpose === "reset" && !doc.accountId) {
      return { verificationId: doc.id, sentTo: { email: maskEmail(doc.email!) }, expiresAt: doc.expiresAt, resendAfterSeconds: RESEND_SECONDS };
    }
    const next = structuredClone(doc);
    const started = await this.send(next, { [channel]: true });
    await this.store.updateOtp(doc.id, (o) => {
      if (channel === "email") o.emailCodeHash = next.emailCodeHash;
      else o.phoneCodeHash = next.phoneCodeHash;
      o.sends += 1;
      o.lastSentAt = this.now().toISOString();
      o.expiresAt = new Date(this.now().getTime() + OTP_MINUTES * 60_000).toISOString();
    });
    return { ...started, expiresAt: new Date(this.now().getTime() + OTP_MINUTES * 60_000).toISOString() };
  }

  // ─── Sign up (email + phone both verified) ──────────────────────────────────

  async startRegistration(email: string, rawPhone: string, password: string, displayName: string, persona: Persona = DEFAULT_PERSONA): Promise<VerificationStarted> {
    const phone = normalizePhone(rawPhone);
    if (!phone) throw new ApiError(400, "invalid_phone", "Enter a valid mobile number, for example 98765 43210.");
    const e = normEmail(email);
    if (await this.store.findAccountByEmail(e)) throw new ApiError(409, "email_taken", "An account with this email already exists. Try signing in instead.");
    if (await this.store.findAccountByPhone(phone)) throw new ApiError(409, "phone_taken", "This mobile number is already linked to an account.");

    const doc = this.freshOtp("register", { email: e, phone, pending: { displayName: displayName.trim(), passwordHash: await hashPassword(password), persona } });
    const started = await this.send(doc, { email: true, phone: true });
    await this.store.insertOtp(doc);
    return started;
  }

  async completeRegistration(verificationId: string, emailCode: string, phoneCode: string, guestId: string | null): Promise<AuthResponse> {
    const doc = await this.liveOtp(verificationId, "register");
    const emailOk = codeMatches(`${doc.id}:email`, emailCode, doc.emailCodeHash);
    const phoneOk = codeMatches(`${doc.id}:phone`, phoneCode, doc.phoneCodeHash);
    if (!emailOk || !phoneOk) {
      await this.failAttempt(doc.id, !emailOk && !phoneOk ? "Both codes are not correct." : !emailOk ? "The email code is not correct." : "The SMS code is not correct.");
    }

    const now = this.now().toISOString();
    const account: AccountDoc = {
      id: randomUUID(),
      version: 0,
      email: doc.email!,
      emailVerified: true,
      phone: doc.phone!,
      phoneVerified: true,
      passwordHash: doc.pending!.passwordHash,
      displayName: doc.pending!.displayName,
      persona: isPersona(doc.pending!.persona) ? doc.pending!.persona : DEFAULT_PERSONA,
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    const inserted = await this.store.insertAccount(account);
    await this.store.deleteOtp(doc.id);
    if (!inserted) throw new ApiError(409, "email_taken", "This email or mobile number was just registered. Try signing in instead.");
    return this.issue(account, guestId);
  }

  // ─── Sign in ────────────────────────────────────────────────────────────────

  /** identifier is an email or a phone number */
  async login(identifier: string, password: string, guestId: string | null): Promise<AuthResponse> {
    const phone = identifier.includes("@") ? null : normalizePhone(identifier);
    const account = phone ? await this.store.findAccountByPhone(phone) : await this.store.findAccountByEmail(normEmail(identifier));
    // Always run a hash so response time does not reveal whether the account exists.
    const ok = await verifyPassword(password, account?.passwordHash ?? DUMMY_HASH);
    if (!account || !ok) {
      if (account && !account.passwordHash) {
        throw new ApiError(401, "use_google", "This account signs in with Google. Use the Google button, or reset your password to add one.");
      }
      throw new ApiError(401, "invalid_credentials", "Email, phone or password is incorrect.");
    }
    const updated = await this.store.updateAccount(account.id, (a) => (a.lastLoginAt = this.now().toISOString()));
    return this.issue(updated, guestId);
  }

  async loginWithGoogle(credential: string, guestId: string | null): Promise<AuthResponse> {
    const g = await verifyGoogleCredential(credential);
    if (!g) throw new ApiError(401, "invalid_google_token", "Google sign-in could not be verified. Please try again.");
    if (!g.emailVerified) throw new ApiError(401, "email_not_verified", "Your Google email address is not verified.");
    const now = this.now().toISOString();

    let account = await this.store.findAccountByGoogleSub(g.sub);
    if (!account) {
      const byEmail = await this.store.findAccountByEmail(g.email);
      if (byEmail) {
        // Same verified email: link Google to the existing account.
        account = await this.store.updateAccount(byEmail.id, (a) => {
          a.googleSub = g.sub;
          a.emailVerified = true;
          a.avatarUrl ??= g.picture;
        });
      } else {
        const doc: AccountDoc = {
          id: randomUUID(),
          version: 0,
          email: g.email,
          emailVerified: true,
          googleSub: g.sub,
          displayName: (g.name ?? g.email.split("@")[0]).slice(0, 40),
          avatarUrl: g.picture,
          persona: DEFAULT_PERSONA,
          tokenVersion: 0,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
        };
        if (!(await this.store.insertAccount(doc))) throw new ApiError(409, "conflict", "Please try signing in again.");
        account = doc;
      }
    }
    account = await this.store.updateAccount(account.id, (a) => (a.lastLoginAt = now));
    // The website asks Google users without a verified phone to add one next.
    return this.issue(account, guestId);
  }

  // ─── Forgot password ────────────────────────────────────────────────────────

  /** Always answers the same way, whether or not the email has an account. */
  async startPasswordReset(email: string): Promise<VerificationStarted> {
    const e = normEmail(email);
    const account = await this.store.findAccountByEmail(e);
    const doc = this.freshOtp("reset", { email: e, accountId: account?.id });
    if (account) {
      const started = await this.send(doc, { email: true });
      await this.store.insertOtp(doc);
      return started;
    }
    await this.store.insertOtp(doc);
    return { verificationId: doc.id, sentTo: { email: maskEmail(e) }, expiresAt: doc.expiresAt, resendAfterSeconds: RESEND_SECONDS };
  }

  async completePasswordReset(verificationId: string, code: string, newPassword: string, guestId: string | null): Promise<AuthResponse> {
    const doc = await this.liveOtp(verificationId, "reset");
    if (!doc.accountId || !codeMatches(`${doc.id}:email`, code, doc.emailCodeHash)) await this.failAttempt(doc.id);
    const hash = await hashPassword(newPassword);
    const account = await this.store.updateAccount(doc.accountId!, (a) => {
      a.passwordHash = hash;
      a.emailVerified = true;
      a.tokenVersion += 1; // signs out every other device
      a.updatedAt = this.now().toISOString();
    });
    await this.store.deleteOtp(doc.id);
    return this.issue(account, guestId);
  }

  // ─── Adding or changing a phone (signed in) ─────────────────────────────────

  async startPhoneVerification(accountId: string, rawPhone: string): Promise<VerificationStarted> {
    const phone = normalizePhone(rawPhone);
    if (!phone) throw new ApiError(400, "invalid_phone", "Enter a valid mobile number, for example 98765 43210.");
    const other = await this.store.findAccountByPhone(phone);
    if (other && other.id !== accountId) throw new ApiError(409, "phone_taken", "This mobile number is already linked to another account.");
    const doc = this.freshOtp("phone", { accountId, phone });
    const started = await this.send(doc, { phone: true });
    await this.store.insertOtp(doc);
    return started;
  }

  async completePhoneVerification(accountId: string, verificationId: string, code: string): Promise<Account> {
    const doc = await this.liveOtp(verificationId, "phone");
    if (doc.accountId !== accountId || !codeMatches(`${doc.id}:phone`, code, doc.phoneCodeHash)) await this.failAttempt(doc.id);
    const other = await this.store.findAccountByPhone(doc.phone!);
    if (other && other.id !== accountId) throw new ApiError(409, "phone_taken", "This mobile number is already linked to another account.");
    const account = await this.store.updateAccount(accountId, (a) => {
      a.phone = doc.phone;
      a.phoneVerified = true;
      a.updatedAt = this.now().toISOString();
    });
    await this.store.deleteOtp(doc.id);
    return toAccount(account);
  }

  // ─── Session and profile ────────────────────────────────────────────────────

  /** Used by requireUser for every bearer token. */
  async verify(token: string): Promise<AccountDoc | null> {
    const claims = await readToken(token);
    if (!claims) return null;
    const account = await this.store.getAccount(claims.accountId);
    if (!account || account.tokenVersion !== claims.tokenVersion) return null;
    return account;
  }

  async get(accountId: string): Promise<Account> {
    const a = await this.store.getAccount(accountId);
    if (!a) throw new ApiError(404, "not_found", "Account not found");
    return toAccount(a);
  }

  async setPreferredLang(accountId: string, lang: "en" | "hi" | "pa" | "ur"): Promise<Account> {
    const a = await this.store.updateAccount(accountId, (x) => {
      x.preferredLang = lang;
      x.updatedAt = this.now().toISOString();
    });
    return toAccount(a);
  }

  async setPersona(accountId: string, persona: Persona): Promise<Account> {
    const a = await this.store.updateAccount(accountId, (x) => {
      x.persona = persona;
      x.updatedAt = this.now().toISOString();
    });
    return toAccount(a);
  }

  async rename(accountId: string, displayName: string): Promise<Account> {
    const a = await this.store.updateAccount(accountId, (x) => {
      x.displayName = displayName.trim();
      x.updatedAt = this.now().toISOString();
    });
    await this.hooks.onRename?.(a);
    return toAccount(a);
  }

  /** Changing the password signs out every other device and returns a fresh token. */
  async changePassword(accountId: string, currentPassword: string | undefined, newPassword: string): Promise<AuthResponse> {
    const a = await this.store.getAccount(accountId);
    if (!a) throw new ApiError(404, "not_found", "Account not found");
    if (a.passwordHash && !(await verifyPassword(currentPassword ?? "", a.passwordHash))) {
      throw new ApiError(401, "invalid_credentials", "Your current password is incorrect.");
    }
    const hash = await hashPassword(newPassword);
    const updated = await this.store.updateAccount(accountId, (x) => {
      x.passwordHash = hash;
      x.tokenVersion += 1;
      x.updatedAt = this.now().toISOString();
    });
    return this.issue(updated, null);
  }

  async logoutEverywhere(accountId: string): Promise<void> {
    await this.store.updateAccount(accountId, (x) => (x.tokenVersion += 1));
  }
}
