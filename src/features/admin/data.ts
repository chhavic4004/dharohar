import type { HeritageQuizInfo, HvsBand } from "@shared/quiz-contract";
import type { AdminKey } from "../../i18n/pages/adminHeatmap";

/**
 * Demo + derived data for the admin console (/admin-heatmap).
 * Everything that is not in the live heritage registry is DEMO data,
 * generated deterministically from the selected period so the numbers
 * stay the same on every visit.
 *
 * HVS = Heritage Vulnerability Score: higher means more at risk.
 * Bands (same as the backend): Stable 0-33, Vulnerable 34-66, Critical 67-100.
 */

export type RangeId = "7d" | "30d" | "90d" | "1y";

export const RANGES: { id: RangeId; days: number; points: number; label: AdminKey }[] = [
  { id: "7d", days: 7, points: 7, label: "range7d" },
  { id: "30d", days: 30, points: 10, label: "range30d" },
  { id: "90d", days: 90, points: 13, label: "range90d" },
  { id: "1y", days: 365, points: 12, label: "range1y" },
];

export const rangeOf = (id: RangeId) => RANGES.find((r) => r.id === id) ?? RANGES[1];

export function bandOf(score: number): HvsBand {
  if (score >= 67) return "Critical";
  if (score >= 34) return "Vulnerable";
  return "Stable";
}

export const BAND_KEY: Record<HvsBand, AdminKey> = {
  Stable: "bandStable",
  Vulnerable: "bandVulnerable",
  Critical: "bandCritical",
};

/** Heat colour for an HVS score: green (stable) -> turmeric -> alert red (critical). */
export function heatColor(score: number, alpha = 1): string {
  const stops: [number, [number, number, number]][] = [
    [0, [62, 107, 79]],
    [50, [198, 138, 29]],
    [100, [168, 62, 34]],
  ];
  const s = Math.max(0, Math.min(100, score));
  const [a, b] = s <= 50 ? [stops[0], stops[1]] : [stops[1], stops[2]];
  const t = (s - a[0]) / (b[0] - a[0]);
  const c = a[1].map((v, i) => Math.round(v + (b[1][i] - v) * t));
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
}

// ─── Deterministic randomness ────────────────────────────────────────────────

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 seeded from a string. */
export function seeded(seed: string): () => number {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random walk of n points that ends exactly at `end`. */
export function series(seed: string, n: number, end: number, spread: number, min = 0): number[] {
  const r = seeded(seed);
  const out = [end];
  for (let i = 1; i < n; i++) out.unshift(Math.max(min, out[0] + (r() - 0.5) * 2 * spread));
  return out;
}

// ─── Heritage registry fallback (used when the API is unreachable) ──────────

const trad = (id: string, name: string, hindi: string, pa: string, ur: string, state: string, score: number): HeritageQuizInfo => ({
  heritage: { id, kind: "tradition", name, hindi, names: { pa, ur }, state, hvs: { score, band: bandOf(score), isSample: true } },
  questionCount: 10,
  directCount: 4,
});

export const FALLBACK_HERITAGE: HeritageQuizInfo[] = [
  trad("kutiyattam", "Kutiyattam", "कूडियाट्टम", "ਕੂਡੀਆੱਟਮ", "کوڈیاٹم", "Kerala", 78),
  trad("thatheras", "Thathera metal craft", "ठठेरा धातु कला", "ਠਠੇਰਾ ਧਾਤ ਕਲਾ", "ٹھٹھیرا دھاتی فن", "Punjab", 76),
  trad("ramman", "Ramman", "रम्माण", "ਰੰਮਾਣ", "رمّان", "Uttarakhand", 74),
  trad("mudiyettu", "Mudiyettu", "मुडियेट्टु", "ਮੁਡੀਏੱਟੂ", "مڈیٹو", "Kerala", 71),
  trad("dhrupad", "Dhrupad", "ध्रुपद", "ਧਰੁਪਦ", "دھرپد", "India", 69),
  trad("kalbelia", "Kalbelia", "कालबेलिया", "ਕਾਲਬੇਲੀਆ", "کال بیلیا", "Rajasthan", 58),
  trad("theyyam", "Theyyam", "तेय्यम", "ਤੇਯਮ", "تییم", "Kerala", 55),
  trad("chhau", "Chhau dance", "छऊ नृत्य", "ਛਊ ਨਾਚ", "چھاؤ رقص", "Odisha, Jharkhand, West Bengal", 52),
  trad("warli", "Warli painting", "वारली चित्रकला", "ਵਾਰਲੀ ਚਿੱਤਰਕਾਰੀ", "وارلی مصوری", "Maharashtra", 51),
  trad("ladakh-chanting", "Buddhist chanting of Ladakh", "लद्दाख का बौद्ध मंत्रोच्चार", "ਲੱਦਾਖ਼ ਦਾ ਬੋਧੀ ਮੰਤਰ ਜਾਪ", "لداخ کا بودھ منتر جاپ", "Ladakh", 49),
  trad("pattachitra", "Pattachitra", "पट्टचित्र", "ਪੱਟਚਿੱਤਰ", "پٹ چتر", "Odisha", 48),
  trad("sattriya", "Sattriya", "सत्रिया", "ਸੱਤਰੀਆ", "ستریا", "Assam", 47),
  trad("yakshagana", "Yakshagana", "यक्षगान", "ਯਕਸ਼ਗਾਨ", "یکش گان", "Karnataka", 46),
  trad("kathakali", "Kathakali", "कथकली", "ਕਥਕਲੀ", "کتھکلی", "Kerala", 38),
  trad("madhubani", "Madhubani painting", "मधुबनी चित्रकला", "ਮਧੁਬਨੀ ਚਿੱਤਰਕਾਰੀ", "مدھوبنی مصوری", "Bihar", 27),
  trad("bihu", "Bihu", "बिहू", "ਬਿਹੂ", "بیہو", "Assam", 16),
  trad("garba", "Garba", "गरबा", "ਗਰਬਾ", "گربا", "Gujarat", 12),
];

export const fallbackById = new Map(FALLBACK_HERITAGE.map((h) => [h.heritage.id, h.heritage]));

/** Only entries that carry an HVS score count as "tracked traditions". */
export const tracked = (items: HeritageQuizInfo[]) => items.filter((i) => i.heritage.hvs);

export const splitStates = (state: string | undefined) =>
  (state ?? "").split(/,\s*| and /).map((s) => s.trim()).filter(Boolean);

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export type KpiId = "tracked" | "critical" | "submissions" | "verified" | "contributors" | "players";

export interface Kpi {
  id: KpiId;
  label: AdminKey;
  value: number;
  prev: number;
  series: number[];
  /** false when a rise is bad news (critical traditions) */
  upIsGood: boolean;
}

/** Monthly baselines for the demo counters. */
const BASE: Record<Exclude<KpiId, "tracked" | "critical">, number> = {
  submissions: 148,
  verified: 96,
  contributors: 312,
  players: 2840,
};

const SCALE: Record<RangeId, number> = { "7d": 0.26, "30d": 1, "90d": 2.9, "1y": 11.2 };

export function buildKpis(range: RangeId, items: HeritageQuizInfo[]): Kpi[] {
  const r = rangeOf(range);
  const rnd = seeded(`kpi-${range}`);
  const list = tracked(items);
  const trackedNow = list.length;
  const criticalNow = list.filter((i) => i.heritage.hvs!.band === "Critical").length;
  const added = Math.max(0, Math.round((r.days / 30) * 0.8 * rnd()));
  const critPrev = Math.max(0, criticalNow + Math.round((rnd() - 0.6) * 3));

  const counter = (id: keyof typeof BASE, label: AdminKey): Kpi => {
    const value = Math.round(BASE[id] * SCALE[range] * (0.9 + rnd() * 0.25));
    const prev = Math.round(value / (0.85 + rnd() * 0.35));
    return { id, label, value, prev, upIsGood: true, series: series(`${id}-${range}`, r.points, value / r.points, value / r.points / 3, 0) };
  };

  return [
    { id: "tracked", label: "kpiTracked", value: trackedNow, prev: trackedNow - added, upIsGood: true, series: Array.from({ length: r.points }, (_, i) => trackedNow - added + (added * i) / Math.max(1, r.points - 1)) },
    { id: "critical", label: "kpiCritical", value: criticalNow, prev: critPrev, upIsGood: false, series: series(`cr-${range}`, r.points, criticalNow, 0.8, 0) },
    counter("submissions", "kpiSubmissions"),
    counter("verified", "kpiVerified"),
    counter("contributors", "kpiContributors"),
    counter("players", "kpiPlayers"),
  ];
}

/** Average HVS over the period, ending at today's live average. */
export function hvsTrend(range: RangeId, avgNow: number): number[] {
  const r = rangeOf(range);
  const drift = range === "1y" ? 4 : range === "90d" ? 2.5 : 1.2;
  return series(`hvs-${range}`, r.points, avgNow, drift, 0).map((v) => Math.min(100, v));
}

/** Dates for each trend point, oldest first. */
export function trendDates(range: RangeId, now = new Date()): Date[] {
  const r = rangeOf(range);
  const step = r.days / Math.max(1, r.points - 1);
  return Array.from({ length: r.points }, (_, i) => new Date(now.getTime() - (r.points - 1 - i) * step * 86400000));
}

// ─── Regions ──────────────────────────────────────────────────────────────────

export interface RegionRow {
  state: string;
  tracked: number;
  avgHvs: number;
  critical: number;
  submissions: number;
  teams: number;
}

export function buildRegions(items: HeritageQuizInfo[], range: RangeId, deployments: Record<string, number>): RegionRow[] {
  const acc = new Map<string, { n: number; sum: number; critical: number }>();
  for (const i of tracked(items)) {
    for (const st of splitStates(i.heritage.state)) {
      const a = acc.get(st) ?? { n: 0, sum: 0, critical: 0 };
      a.n++;
      a.sum += i.heritage.hvs!.score;
      if (i.heritage.hvs!.band === "Critical") a.critical++;
      acc.set(st, a);
    }
  }
  return [...acc.entries()].map(([state, a]) => {
    const rnd = seeded(`region-${state}`);
    const monthly = 4 + rnd() * 26 * Math.min(3, a.n);
    return {
      state,
      tracked: a.n,
      avgHvs: Math.round(a.sum / a.n),
      critical: a.critical,
      submissions: Math.round(monthly * SCALE[range]),
      teams: Math.floor(rnd() * 3) + (deployments[state] ?? 0),
    };
  });
}

// ─── Submissions (moderation queue, demo) ────────────────────────────────────

export type SubStatus = "pending" | "approved" | "rejected" | "changes";
export type SubType = "story" | "recording" | "photo";

export interface Submission {
  id: string;
  type: SubType;
  title: AdminKey;
  note: AdminKey;
  contributor: string;
  heritageId: string;
  state: string;
  date: string;
  status: SubStatus;
  /** minutes for recordings, photo count for photos, words for stories */
  size: number;
}

export const DEMO_SUBMISSIONS: Submission[] = [
  { id: "SUB-2041", type: "recording", title: "sub1Title", note: "sub1Note", contributor: "c2", heritageId: "mudiyettu", state: "Kerala", date: "2026-09-28", status: "pending", size: 42 },
  { id: "SUB-2039", type: "story", title: "sub2Title", note: "sub2Note", contributor: "c1", heritageId: "thatheras", state: "Punjab", date: "2026-09-27", status: "pending", size: 1850 },
  { id: "SUB-2036", type: "photo", title: "sub3Title", note: "sub3Note", contributor: "c3", heritageId: "ramman", state: "Uttarakhand", date: "2026-09-25", status: "pending", size: 24 },
  { id: "SUB-2031", type: "story", title: "sub4Title", note: "sub4Note", contributor: "c4", heritageId: "kalbelia", state: "Rajasthan", date: "2026-09-22", status: "changes", size: 960 },
  { id: "SUB-2027", type: "recording", title: "sub5Title", note: "sub5Note", contributor: "c5", heritageId: "sattriya", state: "Assam", date: "2026-09-20", status: "approved", size: 18 },
  { id: "SUB-2024", type: "photo", title: "sub6Title", note: "sub6Note", contributor: "c6", heritageId: "warli", state: "Maharashtra", date: "2026-09-18", status: "rejected", size: 9 },
  { id: "SUB-2019", type: "recording", title: "sub7Title", note: "sub7Note", contributor: "c2", heritageId: "kutiyattam", state: "Kerala", date: "2026-09-15", status: "pending", size: 65 },
];

export const STATUS_KEY: Record<SubStatus, AdminKey> = {
  pending: "statusPending",
  approved: "statusApproved",
  rejected: "statusRejected",
  changes: "statusChanges",
};

export const TYPE_KEY: Record<SubType, AdminKey> = { story: "typeStory", recording: "typeRecording", photo: "typePhoto" };
export const SIZE_KEY: Record<SubType, AdminKey> = { story: "sizeWords", recording: "sizeMinutes", photo: "sizePhotos" };

// ─── Contributors & personas (demo) ──────────────────────────────────────────

export type Persona = "student" | "historian" | "seeker" | "educator" | "artisan";

export const PERSONA_KEY: Record<Persona, AdminKey> = {
  student: "personaStudent",
  historian: "personaHistorian",
  seeker: "personaSeeker",
  educator: "personaEducator",
  artisan: "personaArtisan",
};

const PERSONA_BASE: Record<Persona, number> = { student: 412, seeker: 238, educator: 121, historian: 86, artisan: 57 };

export function personaCounts(range: RangeId): { persona: Persona; count: number }[] {
  const rnd = seeded(`persona-${range}`);
  const grow = { "7d": 0.93, "30d": 1, "90d": 1.12, "1y": 1.45 }[range];
  return (Object.keys(PERSONA_BASE) as Persona[]).map((p) => ({ persona: p, count: Math.round(PERSONA_BASE[p] * grow * (0.95 + rnd() * 0.1)) }));
}

export interface Contributor {
  id: string;
  name: AdminKey;
  persona: Persona;
  state: string;
  base: number;
  verifiedRate: number;
}

export const CONTRIBUTORS: Contributor[] = [
  { id: "c1", name: "c1Name", persona: "historian", state: "Punjab", base: 34, verifiedRate: 94 },
  { id: "c2", name: "c2Name", persona: "educator", state: "Kerala", base: 29, verifiedRate: 90 },
  { id: "c3", name: "c3Name", persona: "student", state: "Uttarakhand", base: 23, verifiedRate: 78 },
  { id: "c4", name: "c4Name", persona: "artisan", state: "Rajasthan", base: 19, verifiedRate: 84 },
  { id: "c5", name: "c5Name", persona: "seeker", state: "Assam", base: 16, verifiedRate: 88 },
  { id: "c6", name: "c6Name", persona: "student", state: "Maharashtra", base: 12, verifiedRate: 71 },
];

export const contributorById = new Map(CONTRIBUTORS.map((c) => [c.id, c]));

export function contributions(c: Contributor, range: RangeId): number {
  const rnd = seeded(`contrib-${c.id}-${range}`);
  return Math.max(1, Math.round(c.base * SCALE[range] * (0.85 + rnd() * 0.3)));
}

// ─── Field teams (demo) ───────────────────────────────────────────────────────

export type TeamStatus = "available" | "deployed" | "returning";

export interface Team {
  id: string;
  name: AdminKey;
  base: string;
  members: number;
  status: TeamStatus;
  deployedTo?: string;
}

export const DEMO_TEAMS: Team[] = [
  { id: "t1", name: "team1", base: "Assam", members: 6, status: "available" },
  { id: "t2", name: "team2", base: "Kerala", members: 5, status: "deployed", deployedTo: "Kerala" },
  { id: "t3", name: "team3", base: "Punjab", members: 4, status: "available" },
  { id: "t4", name: "team4", base: "Maharashtra", members: 5, status: "returning" },
];

export const TEAM_STATUS_KEY: Record<TeamStatus, AdminKey> = {
  available: "teamAvailable",
  deployed: "teamDeployed",
  returning: "teamReturning",
};

// ─── Alerts (demo) ────────────────────────────────────────────────────────────

export type Severity = "critical" | "warning" | "info";
export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface AdminAlert {
  id: string;
  severity: Severity;
  label: AdminKey;
  text: AdminKey;
  heritageId?: string;
  vars: Record<string, number>;
  hoursAgo: number;
  status: AlertStatus;
}

export const DEMO_ALERTS: AdminAlert[] = [
  { id: "A-311", severity: "critical", label: "vRiseLabel", text: "vRiseText", heritageId: "thatheras", vars: { from: 71, to: 76 }, hoursAgo: 3, status: "open" },
  { id: "A-309", severity: "warning", label: "anomalyLabel", text: "anomalyText", heritageId: "pattachitra", vars: { n: 2, pct: 180 }, hoursAgo: 9, status: "open" },
  { id: "A-305", severity: "critical", label: "stallLabel", text: "stallText", heritageId: "ramman", vars: { days: 45 }, hoursAgo: 20, status: "open" },
  { id: "A-298", severity: "warning", label: "practLabel", text: "practText", heritageId: "mudiyettu", vars: { n: 40 }, hoursAgo: 30, status: "acknowledged" },
  { id: "A-294", severity: "warning", label: "backlogLabel", text: "backlogText", vars: { n: 4 }, hoursAgo: 52, status: "open" },
  { id: "A-287", severity: "info", label: "fieldLabel", text: "fieldText", heritageId: "sattriya", vars: {}, hoursAgo: 96, status: "resolved" },
];

export const SEVERITY_KEY: Record<Severity, AdminKey> = { critical: "sevCritical", warning: "sevWarning", info: "sevInfo" };
export const ALERT_STATUS_KEY: Record<AlertStatus, AdminKey> = { open: "alertOpen", acknowledged: "alertAcknowledged", resolved: "alertResolved" };
