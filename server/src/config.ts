import "dotenv/config";

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
