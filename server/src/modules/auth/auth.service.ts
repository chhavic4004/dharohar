import { randomUUID } from "node:crypto";
import type { Account, AuthProvider, AuthResponse } from "../../../../shared/auth-contract";
import { ApiError } from "../../middleware/errors";
import type { AccountDoc, Store } from "../../store/types";
import { verifyGoogleCredential } from "./google";
import { DUMMY_HASH, hashPassword, verifyPassword } from "./password";
import { readToken, signToken } from "./tokens";

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

export function toAccount(a: AccountDoc): Account {
  const providers: AuthProvider[] = [];
  if (a.passwordHash) providers.push("password");
  if (a.googleSub) providers.push("google");
  return { id: a.id, email: a.email, displayName: a.displayName, avatarUrl: a.avatarUrl ?? null, providers, createdAt: a.createdAt };
}

const normEmail = (e: string) => e.trim().toLowerCase();

export class AuthService {
  constructor(
    private store: Store,
    private hooks: AuthHooks = {},
    private clock: () => Date = () => new Date(),
  ) {}

  private async issue(account: AccountDoc, guestId: string | null): Promise<AuthResponse> {
    const merged = (await this.hooks.onSignIn?.(account, guestId)) ?? false;
    const { token, expiresAt } = await signToken({ accountId: account.id, tokenVersion: account.tokenVersion }, this.clock());
    return { token, expiresAt, account: toAccount(account), mergedGuestProgress: merged };
  }

  async register(email: string, password: string, displayName: string, guestId: string | null): Promise<AuthResponse> {
    const now = this.clock().toISOString();
    const doc: AccountDoc = {
      id: randomUUID(),
      version: 0,
      email: normEmail(email),
      passwordHash: await hashPassword(password),
      displayName: displayName.trim(),
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    if (!(await this.store.insertAccount(doc))) {
      throw new ApiError(409, "email_taken", "An account with this email already exists. Try signing in instead.");
    }
    return this.issue(doc, guestId);
  }

  async login(email: string, password: string, guestId: string | null): Promise<AuthResponse> {
    const account = await this.store.findAccountByEmail(normEmail(email));
    // Always run a hash so response time does not reveal whether the email exists.
    const ok = await verifyPassword(password, account?.passwordHash ?? DUMMY_HASH);
    if (!account || !ok) {
      if (account && !account.passwordHash) {
        throw new ApiError(401, "use_google", "This account signs in with Google. Use the Google button, or set a password from your account page.");
      }
      throw new ApiError(401, "invalid_credentials", "Email or password is incorrect.");
    }
    const updated = await this.store.updateAccount(account.id, (a) => (a.lastLoginAt = this.clock().toISOString()));
    return this.issue(updated, guestId);
  }

  async loginWithGoogle(credential: string, guestId: string | null): Promise<AuthResponse> {
    const g = await verifyGoogleCredential(credential);
    if (!g) throw new ApiError(401, "invalid_google_token", "Google sign-in could not be verified. Please try again.");
    if (!g.emailVerified) throw new ApiError(401, "email_not_verified", "Your Google email address is not verified.");
    const now = this.clock().toISOString();

    let account = await this.store.findAccountByGoogleSub(g.sub);
    if (!account) {
      const byEmail = await this.store.findAccountByEmail(g.email);
      if (byEmail) {
        // Same verified email: link Google to the existing account.
        account = await this.store.updateAccount(byEmail.id, (a) => {
          a.googleSub = g.sub;
          a.avatarUrl ??= g.picture;
        });
      } else {
        const doc: AccountDoc = {
          id: randomUUID(),
          version: 0,
          email: g.email,
          googleSub: g.sub,
          displayName: (g.name ?? g.email.split("@")[0]).slice(0, 40),
          avatarUrl: g.picture,
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
    return this.issue(account, guestId);
  }

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

  async rename(accountId: string, displayName: string): Promise<Account> {
    const a = await this.store.updateAccount(accountId, (x) => {
      x.displayName = displayName.trim();
      x.updatedAt = this.clock().toISOString();
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
      x.updatedAt = this.clock().toISOString();
    });
    return this.issue(updated, null);
  }

  async logoutEverywhere(accountId: string): Promise<void> {
    await this.store.updateAccount(accountId, (x) => (x.tokenVersion += 1));
  }
}
