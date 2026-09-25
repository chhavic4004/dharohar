import { randomBytes, randomInt, randomUUID, createHash } from "node:crypto";

export const newId = () => randomUUID();

/** Fisher-Yates shuffle using crypto randomness. Returns a new array. O(n). */
export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deterministic shuffle from a string seed (same seed, same order). O(n). */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  let state = createHash("sha256").update(seed).digest().readUInt32LE(0) || 1;
  const next = () => {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffled index order that is never the identity (so answers are never pre-sorted). */
export function nonIdentityPermutation(n: number, rand: (arr: number[]) => number[] = shuffle): number[] {
  const identity = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return identity;
  for (let tries = 0; tries < 10; tries++) {
    const p = rand(identity);
    if (p.some((v, i) => v !== i)) return p;
  }
  return [...identity.slice(1), identity[0]];
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I

export function couponCode(): string {
  const bytes = randomBytes(8);
  const chars = [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]);
  return `DHR-${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}
