import type { Account, AuthConfig, AuthResponse } from "@shared/auth-contract";
import { api } from "../../lib/http";

/** Every account call. The browser's guest id is sent automatically, so guest progress can move into the account. */
export const authApi = {
  config: () => api<AuthConfig>("GET", "/auth/config"),
  register: (email: string, password: string, displayName: string) =>
    api<AuthResponse>("POST", "/auth/register", { email, password, displayName }),
  login: (email: string, password: string) => api<AuthResponse>("POST", "/auth/login", { email, password }),
  google: (credential: string) => api<AuthResponse>("POST", "/auth/google", { credential }),
  me: () => api<Account>("GET", "/auth/me"),
  rename: (displayName: string) => api<Account>("PATCH", "/auth/me", { displayName }),
  changePassword: (newPassword: string, currentPassword?: string) =>
    api<AuthResponse>("POST", "/auth/password", { newPassword, ...(currentPassword ? { currentPassword } : {}) }),
  logoutAll: () => api<void>("POST", "/auth/logout-all"),
};
