/** Dates for the daily challenge are calendar days in India Standard Time. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD for the given instant, in IST. */
export function istDateKey(at: Date = new Date()): string {
  return new Date(at.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Whole days since 1970-01-01 (IST calendar). */
export function istDayNumber(at: Date = new Date()): number {
  return Math.floor((at.getTime() + IST_OFFSET_MS) / DAY_MS);
}

export function previousDateKey(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  return new Date(d.getTime() - DAY_MS).toISOString().slice(0, 10);
}

/** ISO instant of the next IST midnight after `at`. */
export function nextIstMidnight(at: Date = new Date()): string {
  const day = istDayNumber(at) + 1;
  return new Date(day * DAY_MS - IST_OFFSET_MS).toISOString();
}
