import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { config } from "../../config";

const ISSUER = "dharohar";

function resolveSecret(): Uint8Array {
  if (config.authSecret) return new TextEncoder().encode(config.authSecret);
  if (config.isProd) throw new Error("AUTH_SECRET must be set in production (use at least 32 random characters).");
  // Development only: a fixed secret keeps people signed in across restarts.
  if (!config.isTest) console.warn("[auth] AUTH_SECRET is not set; using an insecure development secret.");
  return new TextEncoder().encode(config.isTest ? randomBytes(32).toString("hex") : "dharohar-dev-secret-change-me-0123456789");
}

const secret = resolveSecret();

export interface TokenClaims {
  accountId: string;
  tokenVersion: number;
}

export async function signToken(claims: TokenClaims, now = new Date()): Promise<{ token: string; expiresAt: string }> {
  const exp = new Date(now.getTime() + config.tokenDays * 86_400_000);
  const token = await new SignJWT({ ver: claims.tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.accountId)
    .setIssuer(ISSUER)
    .setIssuedAt(Math.floor(now.getTime() / 1000))
    .setExpirationTime(Math.floor(exp.getTime() / 1000))
    .sign(secret);
  return { token, expiresAt: exp.toISOString() };
}

export async function readToken(token: string): Promise<TokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { issuer: ISSUER, algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.ver !== "number") return null;
    return { accountId: payload.sub, tokenVersion: payload.ver };
  } catch {
    return null;
  }
}

/** Keyed hash for one-time codes, so a leaked database does not reveal them. */
export function hashCode(scope: string, code: string): string {
  return createHmac("sha256", secret).update(`${scope}:${code}`).digest("base64url");
}

export function codeMatches(scope: string, code: string, hash: string | undefined): boolean {
  if (!hash) return false;
  const a = Buffer.from(hashCode(scope, code));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Six random digits from a cryptographic source. */
export function newCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}
