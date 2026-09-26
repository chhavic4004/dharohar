import { randomBytes } from "node:crypto";
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
