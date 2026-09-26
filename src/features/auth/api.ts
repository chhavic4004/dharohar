import type { Account, AuthConfig, AuthResponse, VerificationStarted } from "@shared/auth-contract";
import { api } from "../../lib/http";

/** Every account call. The browser's guest id is sent automatically, so guest progress can move into the account. */
export const authApi = {
  config: () => api<AuthConfig>("GET", "/auth/config"),

  /** Sign up step 1: sends a code to the email and one to the phone */
  registerStart: (email: string, phone: string, password: string, displayName: string) =>
    api<VerificationStarted>("POST", "/auth/register/start", { email, phone, password, displayName }),
  /** Sign up step 2: creates the account once both codes are correct */
  registerVerify: (verificationId: string, emailCode: string, phoneCode: string) =>
    api<AuthResponse>("POST", "/auth/register/verify", { verificationId, emailCode, phoneCode }),
  resend: (verificationId: string, channel: "email" | "phone") =>
    api<VerificationStarted>("POST", "/auth/otp/resend", { verificationId, channel }),

  /** identifier: email or phone number */
  login: (identifier: string, password: string) => api<AuthResponse>("POST", "/auth/login", { identifier, password }),
  google: (credential: string) => api<AuthResponse>("POST", "/auth/google", { credential }),

  forgotPassword: (email: string) => api<VerificationStarted>("POST", "/auth/password/forgot", { email }),
  resetPassword: (verificationId: string, code: string, newPassword: string) =>
    api<AuthResponse>("POST", "/auth/password/reset", { verificationId, code, newPassword }),

  phoneStart: (phone: string) => api<VerificationStarted>("POST", "/auth/phone/start", { phone }),
  phoneVerify: (verificationId: string, code: string) => api<Account>("POST", "/auth/phone/verify", { verificationId, code }),

  me: () => api<Account>("GET", "/auth/me"),
  rename: (displayName: string) => api<Account>("PATCH", "/auth/me", { displayName }),
  changePassword: (newPassword: string, currentPassword?: string) =>
    api<AuthResponse>("POST", "/auth/password", { newPassword, ...(currentPassword ? { currentPassword } : {}) }),
  logoutAll: () => api<void>("POST", "/auth/logout-all"),
};
