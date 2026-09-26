/**
 * Dharohar accounts: API types shared by the frontend and backend.
 * All routes live under /api/auth.
 */

export type AuthProvider = "password" | "google";

export interface Account {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  /** Ways this account can sign in */
  providers: AuthProvider[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  /** ISO time the token stops working */
  expiresAt: string;
  account: Account;
  /** true when this browser's guest progress was moved into the account */
  mergedGuestProgress: boolean;
}

export interface AuthConfig {
  /** Google sign-in is available when the server has GOOGLE_CLIENT_ID */
  googleClientId: string | null;
  passwordMinLength: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  /** The ID token (credential) returned by Google Identity Services */
  credential: string;
}

export interface ChangePasswordRequest {
  /** Not needed when the account has no password yet (Google-only) */
  currentPassword?: string;
  newPassword: string;
}

export const PASSWORD_MIN_LENGTH = 8;
