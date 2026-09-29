import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "../../config";

export interface GoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

export type GoogleVerifier = (credential: string) => Promise<GoogleIdentity | null>;

const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

/** Verifies a Google Identity Services ID token against Google's public keys. */
const verifyWithGoogle: GoogleVerifier = async (credential) => {
  if (!config.googleClientId) return null;
  try {
    const { payload } = await jwtVerify(credential, JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: config.googleClientId,
    });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    return {
      sub: payload.sub,
      email: payload.email.toLowerCase(),
      emailVerified: payload.email_verified === true,
      name: typeof payload.name === "string" ? payload.name : undefined,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
    };
  } catch {
    return null;
  }
};

let verifier: GoogleVerifier = verifyWithGoogle;

/** Tests replace the verifier; pass null to restore the real one. */
export function setGoogleVerifier(fn: GoogleVerifier | null) {
  verifier = fn ?? verifyWithGoogle;
}

export function verifyGoogleCredential(credential: string) {
  return verifier(credential);
}

export function isGoogleEnabled(): boolean {
  return verifier !== verifyWithGoogle || !!config.googleClientId;
}
