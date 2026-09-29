/**
 * Dharohar accounts: API types shared by the frontend and backend.
 * All routes live under /api/auth.
 */

export type AuthProvider = "password" | "google";

/** Who someone is on Dharohar, chosen at sign up and changeable later. */
export const PERSONAS = ["student", "historian", "seeker", "educator", "artisan", "traveller"] as const;
export type Persona = (typeof PERSONAS)[number];
/** Used for accounts created before personas existed, and for new Google accounts. */
export const DEFAULT_PERSONA: Persona = "seeker";
export const isPersona = (v: unknown): v is Persona => typeof v === "string" && (PERSONAS as readonly string[]).includes(v);

export interface Account {
  id: string;
  email: string;
  /** E.164, for example +919876543210; null until a phone is verified */
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  displayName: string;
  /** Site language this person chose; applied when they sign in on any device */
  preferredLang: "en" | "hi" | "pa" | "ur" | null;
  avatarUrl: string | null;
  /** Always set; older accounts without one read as "seeker" */
  persona: Persona;
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

/** Step 1 of sign up: codes are sent to the email and the phone. Nothing is saved yet. */
export interface RegisterStartRequest {
  email: string;
  /** 10 digit Indian mobile, or any number with a +country code */
  phone: string;
  password: string;
  displayName: string;
  persona: Persona;
}

/** Step 2 of sign up: both codes must match. Only then is the account created. */
export interface RegisterVerifyRequest {
  verificationId: string;
  emailCode: string;
  phoneCode: string;
}

/** Returned whenever codes are sent */
export interface VerificationStarted {
  verificationId: string;
  /** Where the codes went, partly hidden: a***@gmail.com, +91 ******3210 */
  sentTo: { email?: string; phone?: string };
  expiresAt: string;
  resendAfterSeconds: number;
  /**
   * Demo mode only (no email or SMS provider configured, not production):
   * the codes, so the flow can be tried without real delivery.
   */
  devCodes?: { email?: string; phone?: string };
}

export interface LoginRequest {
  /** Email or phone number */
  identifier: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  verificationId: string;
  code: string;
  newPassword: string;
}

export interface GoogleLoginRequest {
  /** The ID token (credential) returned by Google Identity Services */
  credential: string;
}

export interface UpdateAccountRequest {
  displayName?: string;
  preferredLang?: "en" | "hi" | "pa" | "ur";
  persona?: Persona;
}

export interface ChangePasswordRequest {
  /** Not needed when the account has no password yet (Google-only) */
  currentPassword?: string;
  newPassword: string;
}

export const PASSWORD_MIN_LENGTH = 8;
