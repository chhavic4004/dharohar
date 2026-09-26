import type { OfflinePack, OfflineSubmission, OfflineSyncResult } from "@shared/quiz-contract";
import { quizApi } from "../api/quizApi";

/**
 * Offline packs live in localStorage so they survive reloads without a
 * network. Results are queued and synced when the device is back online.
 */
export interface StoredPack {
  pack: OfflinePack;
  result?: { answers: OfflineSubmission["answers"]; score: number; playedAt: string };
  synced?: OfflineSyncResult;
}

const KEY = "dharohar.offlinePacks";
const listeners = new Set<() => void>();

export function readPacks(): StoredPack[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as StoredPack[];
  } catch {
    return [];
  }
}

function writePacks(packs: StoredPack[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(packs));
  } catch {
    /* storage full or blocked */
  }
  listeners.forEach((l) => l());
}

export function onPacksChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function savePack(pack: OfflinePack) {
  writePacks([{ pack }, ...readPacks().filter((p) => p.pack.packId !== pack.packId)].slice(0, 10));
}

export function removePack(packId: string) {
  writePacks(readPacks().filter((p) => p.pack.packId !== packId));
}

export function saveResult(packId: string, result: NonNullable<StoredPack["result"]>) {
  writePacks(readPacks().map((p) => (p.pack.packId === packId ? { ...p, result } : p)));
}

let syncing = false;

/** Sends any played-but-unsynced packs to the server. Safe to call often. */
export async function syncPending(): Promise<number> {
  if (syncing || (typeof navigator !== "undefined" && !navigator.onLine)) return 0;
  syncing = true;
  let done = 0;
  try {
    for (const p of readPacks()) {
      if (!p.result || p.synced) continue;
      try {
        const synced = await quizApi.syncOfflinePack(p.pack.packId, { answers: p.result.answers });
        writePacks(readPacks().map((x) => (x.pack.packId === p.pack.packId ? { ...x, synced } : x)));
        done++;
      } catch {
        /* try again next time */
      }
    }
  } finally {
    syncing = false;
  }
  return done;
}

export function startBackgroundSync(): () => void {
  const run = () => void syncPending();
  run();
  window.addEventListener("online", run);
  return () => window.removeEventListener("online", run);
}
