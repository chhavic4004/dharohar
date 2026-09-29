import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

// dotenv v18 can report zero injected variables in this workspace; parse the
// local file explicitly while preserving any environment variables already set.
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env"),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    for (const [key, value] of Object.entries(dotenv.parse(fs.readFileSync(envPath)))) {
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI?.trim() || "",
  mongoDb: process.env.MONGODB_DB?.trim() || "dharohar",
  dataFile: process.env.DATA_FILE?.trim() || "data/db.json",
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173,http://localhost:8443")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  isTest: process.env.NODE_ENV === "test",
  isProd: process.env.NODE_ENV === "production",
  /** Folder with the built website (vite build). When set and present, this server also serves the site. */
  webDir: process.env.WEB_DIR?.trim() || "",
  /**
   * Show OTP codes on the website when no email/SMS provider is set, even in
   * production. Meant for hackathon demos only; leave off for real users.
   */
  allowDemoOtp: process.env.ALLOW_DEMO_OTP === "true",
  /** Secret used to sign login tokens. Required in production. */
  authSecret: process.env.AUTH_SECRET?.trim() || "",
  /** OAuth client id from Google Cloud Console. Google sign-in is off without it. */
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || "",
  tokenDays: Number(process.env.AUTH_TOKEN_DAYS ?? 30),
  /** OTP email: Brevo or Resend. Without a key, codes are printed to the console (development only). */
  email: {
    brevoKey: process.env.BREVO_API_KEY?.trim() || "",
    resendKey: process.env.RESEND_API_KEY?.trim() || "",
    from: process.env.EMAIL_FROM?.trim() || "",
    fromName: process.env.EMAIL_FROM_NAME?.trim() || "Dharohar",
  },
  /** OTP SMS: Twilio or Fast2SMS. Without a key, codes are printed to the console (development only). */
  sms: {
    twilioSid: process.env.TWILIO_ACCOUNT_SID?.trim() || "",
    twilioToken: process.env.TWILIO_AUTH_TOKEN?.trim() || "",
    twilioFrom: process.env.TWILIO_FROM?.trim() || "",
    fast2smsKey: process.env.FAST2SMS_API_KEY?.trim() || "",
  },
};
