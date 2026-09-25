/**
 * Minimal HTTP client for the Dharohar API.
 *
 * Identity: until the team's login exists, every browser gets a random guest
 * id kept in localStorage and sent as X-Guest-Id. When auth lands, call
 * setAuthToken(token) after login and the same requests carry a bearer token.
 */
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "/api";
const GUEST_KEY = "dharohar.guestId";

let memoryGuestId: string | null = null;
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Fallback for older browsers
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
    // Private mode or blocked storage: keep an id for this tab only
    memoryGuestId ??= uuid();
    return memoryGuestId;
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

export async function api<T>(method: "GET" | "POST" | "PATCH", path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  else headers["X-Guest-Id"] = getGuestId();

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiRequestError(0, "network_error", "Could not reach the Dharohar server. Check your connection and try again.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data?.error;
    throw new ApiRequestError(res.status, err?.code ?? "http_error", err?.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}
