import type { RequestHandler } from "express";
import { ApiError } from "./errors";

/**
 * Identifies the player for every quiz request.
 *
 * Integration point for the team's auth: call `setAuthVerifier` once at
 * startup with a function that turns a bearer token into a user id. Until
 * then, players are identified by an `X-Guest-Id` UUID that the frontend
 * creates and keeps in localStorage.
 */
export interface RequestUser {
  id: string;
  isGuest: boolean;
  displayName?: string;
}

export type AuthVerifier = (token: string) => Promise<{ userId: string; displayName?: string } | null>;

let verifier: AuthVerifier | null = null;

export function setAuthVerifier(fn: AuthVerifier | null) {
  verifier = fn;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const requireUser: RequestHandler = async (req, _res, next) => {
  const auth = req.header("authorization");
  if (auth?.startsWith("Bearer ") && verifier) {
    const result = await verifier(auth.slice(7).trim());
    if (!result) throw new ApiError(401, "invalid_token", "Your session has expired. Please sign in again.");
    req.user = { id: `u:${result.userId}`, isGuest: false, displayName: result.displayName };
    return next();
  }
  const guest = req.header("x-guest-id");
  if (guest && UUID.test(guest)) {
    req.user = { id: `g:${guest.toLowerCase()}`, isGuest: true };
    return next();
  }
  throw new ApiError(401, "unauthenticated", "Send an X-Guest-Id header (UUID) or a bearer token.");
};
