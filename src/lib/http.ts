import { getLang } from "./language";

/**
 * Shared HTTP client for the Dharohar API. Every feature (quiz, auth, and
 * teammates' modules) can use it, so identity and language are sent the same
 * way everywhere:
 *
 * - Signed in: `Authorization: Bearer <token>` (token saved in localStorage).
 * - Not signed in: a random guest id in `X-Guest-Id`, kept in localStorage.
 * - Always: `X-Lang` with the site language.
 */
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "/api";
const GUEST_KEY = "dharohar.guestId";
const TOKEN_KEY = "dharohar.token";

let memoryGuestId: string | null = null;
let authToken: string | null = readToken();
const tokenListeners = new Set<(token: string | null) => void>();

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return authToken;
}

/** Saves (or clears) the login token and tells listeners, for example the auth provider. */
export function setAuthToken(token: string | null) {
  if (token === authToken) return;
  authToken = token;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked: token lives for this tab only */
  }
  tokenListeners.forEach((l) => l(token));
}

export function onAuthTokenChange(fn: (token: string | null) => void) {
  tokenListeners.add(fn);
  return () => {
    tokenListeners.delete(fn);
  };
}

/** @deprecated The language now comes from src/lib/language.ts. Kept so older imports still compile. */
export function setRequestLang(_lang: string) {}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
  );
}

export function getGuestId(): string {
  try {
    let id = localStorage.getItem(GUEST_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(GUEST_KEY, id);
    }
    return id;
  } catch {
    memoryGuestId ??= uuid();
    return memoryGuestId;
  }
}

/** Starts a fresh guest identity (after signing out, so the next guest does not see the account's data). */
export function resetGuestId() {
  memoryGuestId = null;
  try {
    localStorage.removeItem(GUEST_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

export async function api<T>(method: Method, path: string, body?: unknown, extraHeaders?: Record<string, string>): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json", "X-Lang": getLang() };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  else headers["X-Guest-Id"] = getGuestId();
  if (extraHeaders) Object.assign(headers, extraHeaders);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiRequestError(0, "network_error", "Could not reach the Dharohar server. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data?.error;
    // Expired or revoked login: drop the token so the site falls back to guest mode.
    if (res.status === 401 && err?.code === "invalid_token" && authToken) setAuthToken(null);
    throw new ApiRequestError(res.status, err?.code ?? "http_error", err?.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}
