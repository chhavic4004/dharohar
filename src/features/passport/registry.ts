/**
 * Demo passport registry. Everything here is language-independent; the
 * translatable text for each record lives in src/i18n/pages/passport.ts
 * (passportDataText), keyed as `${code}_${field}`.
 */
export type PassportStatus = "verified" | "pending" | "revoked";
export type CraftCode = "KNC" | "PHK" | "MDB" | "CHN" | "PSH" | "BDR";
export type TimelineStep = "sourced" | "made" | "qc" | "certified" | "sold" | "revoked";
/** "issuer" resolves to a UI string; every other actor to `${code}_${actor}`. */
export type Actor = "artisan" | "supplier" | "qcBody" | "issuer" | "retailer" | "owner";
export type CustodyKind = "consignment" | "sale" | "handover";

export interface TimelineEvent {
  step: TimelineStep;
  /** ISO date; undefined means the step hasn't happened yet. */
  date?: string;
  actor: Actor;
}

export interface CustodyEvent {
  from: Actor;
  to: Actor;
  date: string;
  kind: CustodyKind;
}

export interface PassportRecord {
  id: string;
  code: CraftCode;
  status: PassportStatus;
  trustScore: number;
  giNo: string;
  initials: string;
  yearsOfPractice: number;
  craftDays: number;
  issued: string;
  revokedOn?: string;
  image?: string;
  /** Tailwind gradient classes for the object panel when there's no photo. */
  accent: string;
  keyId: string;
  fingerprint: string;
  audioSeconds: number;
  timeline: TimelineEvent[];
  custody: CustodyEvent[];
}

export const REGISTRY: PassportRecord[] = [
  {
    id: "DHR-8492-KNC-2024",
    code: "KNC",
    status: "verified",
    trustScore: 98,
    giNo: "3",
    initials: "MA",
    yearsOfPractice: 32,
    craftDays: 14,
    issued: "2024-03-18",
    image: "https://images.unsplash.com/photo-1588140686379-1b76a52103dc?q=80&w=1200&auto=format&fit=crop",
    accent: "from-maroon to-terracotta",
    keyId: "dhr-iss-2024-01",
    fingerprint: "7af9c657e12b1a2aec8d91a8a4cad57a3635cfdccaf2a118bfa6a94a71fc0385",
    audioSeconds: 94,
    timeline: [
      { step: "sourced", date: "2024-01-22", actor: "supplier" },
      { step: "made", date: "2024-02-05", actor: "artisan" },
      { step: "qc", date: "2024-03-11", actor: "qcBody" },
      { step: "certified", date: "2024-03-18", actor: "issuer" },
      { step: "sold", date: "2024-06-02", actor: "retailer" },
    ],
    custody: [
      { from: "artisan", to: "retailer", date: "2024-03-20", kind: "consignment" },
      { from: "retailer", to: "owner", date: "2024-06-02", kind: "sale" },
    ],
  },
  {
    id: "DHR-3107-PHK-2025",
    code: "PHK",
    status: "verified",
    trustScore: 95,
    giNo: "343",
    initials: "GK",
    yearsOfPractice: 21,
    craftDays: 45,
    issued: "2025-02-10",
    accent: "from-terracotta to-turmeric",
    keyId: "dhr-iss-2025-01",
    fingerprint: "0bacfa29472fb002b17b2bd5a4b89a88094ca66854d62e90fd4806a3e869bfed",
    audioSeconds: 128,
    timeline: [
      { step: "sourced", date: "2024-11-04", actor: "supplier" },
      { step: "made", date: "2025-01-06", actor: "artisan" },
      { step: "qc", date: "2025-02-03", actor: "qcBody" },
      { step: "certified", date: "2025-02-10", actor: "issuer" },
      { step: "sold", date: "2025-04-19", actor: "retailer" },
    ],
    custody: [
      { from: "artisan", to: "retailer", date: "2025-02-14", kind: "consignment" },
      { from: "retailer", to: "owner", date: "2025-04-19", kind: "sale" },
    ],
  },
  {
    id: "DHR-5521-MDB-2023",
    code: "MDB",
    status: "verified",
    trustScore: 97,
    giNo: "174",
    initials: "KJ",
    yearsOfPractice: 40,
    craftDays: 21,
    issued: "2023-08-14",
    accent: "from-heritage to-ink",
    keyId: "dhr-iss-2023-02",
    fingerprint: "f128eb5f1a1c2d652468dc247a112d6ee197eb9d4f68b027e81841a432325cce",
    audioSeconds: 112,
    timeline: [
      { step: "sourced", date: "2023-06-12", actor: "supplier" },
      { step: "made", date: "2023-07-10", actor: "artisan" },
      { step: "qc", date: "2023-08-07", actor: "qcBody" },
      { step: "certified", date: "2023-08-14", actor: "issuer" },
      { step: "sold", date: "2023-11-25", actor: "retailer" },
    ],
    custody: [
      { from: "artisan", to: "retailer", date: "2023-08-18", kind: "consignment" },
      { from: "retailer", to: "owner", date: "2023-11-25", kind: "sale" },
    ],
  },
  {
    id: "DHR-6618-CHN-2025",
    code: "CHN",
    status: "pending",
    trustScore: 61,
    giNo: "36",
    initials: "IP",
    yearsOfPractice: 12,
    craftDays: 6,
    issued: "2025-08-30",
    accent: "from-turmeric to-terracotta",
    keyId: "dhr-iss-2025-03",
    fingerprint: "94308c884b9ffee1ab8f8afe2941065b3c9b6b40b3984b3deeb7b91a74a58354",
    audioSeconds: 76,
    timeline: [
      { step: "sourced", date: "2025-07-28", actor: "supplier" },
      { step: "made", date: "2025-08-16", actor: "artisan" },
      { step: "qc", actor: "qcBody" },
      { step: "certified", actor: "issuer" },
      { step: "sold", actor: "retailer" },
    ],
    custody: [{ from: "artisan", to: "retailer", date: "2025-08-30", kind: "consignment" }],
  },
  {
    id: "DHR-2290-PSH-2024",
    code: "PSH",
    status: "verified",
    trustScore: 99,
    giNo: "46",
    initials: "GD",
    yearsOfPractice: 38,
    craftDays: 180,
    issued: "2024-12-02",
    accent: "from-ink to-maroon",
    keyId: "dhr-iss-2024-04",
    fingerprint: "e1818d0b7462af64ba0074ea336d830ae461243f6278820c9b8b55f8733ee2c5",
    audioSeconds: 141,
    timeline: [
      { step: "sourced", date: "2024-03-15", actor: "supplier" },
      { step: "made", date: "2024-10-20", actor: "artisan" },
      { step: "qc", date: "2024-11-25", actor: "qcBody" },
      { step: "certified", date: "2024-12-02", actor: "issuer" },
      { step: "sold", date: "2025-01-14", actor: "retailer" },
    ],
    custody: [
      { from: "artisan", to: "retailer", date: "2024-12-05", kind: "handover" },
      { from: "retailer", to: "owner", date: "2025-01-14", kind: "sale" },
    ],
  },
  {
    id: "DHR-7734-BDR-2022",
    code: "BDR",
    status: "revoked",
    trustScore: 12,
    giNo: "83",
    initials: "SR",
    yearsOfPractice: 27,
    craftDays: 30,
    issued: "2022-05-09",
    revokedOn: "2023-03-06",
    accent: "from-ink to-heritage",
    keyId: "dhr-iss-2022-02",
    fingerprint: "19674505ee668ce5f46e4ddc09efce21fb46f02a54316cb48268ead456242022",
    audioSeconds: 88,
    timeline: [
      { step: "sourced", date: "2022-02-14", actor: "supplier" },
      { step: "made", date: "2022-03-28", actor: "artisan" },
      { step: "qc", date: "2022-05-02", actor: "qcBody" },
      { step: "certified", date: "2022-05-09", actor: "issuer" },
      { step: "sold", date: "2023-01-17", actor: "retailer" },
      { step: "revoked", date: "2023-03-06", actor: "issuer" },
    ],
    custody: [
      { from: "artisan", to: "retailer", date: "2022-05-12", kind: "consignment" },
      { from: "retailer", to: "owner", date: "2023-01-17", kind: "sale" },
    ],
  },
];

export const FEATURED_ID = REGISTRY[0].id;

/** Demo numbers for the stats strip. */
export const REGISTRY_STATS = { issued: 12480, artisans: 3215, crafts: 146, states: 24 };

export const ID_PATTERN = /^DHR-\d{4}-[A-Z]{3}-\d{4}$/;

/**
 * Turns whatever the visitor typed or scanned into a candidate ID:
 * trims, upper-cases, accepts a pasted verification link (?id=…),
 * and tolerates spaces or missing dashes ("dhr 8492 knc 2024").
 */
export function normalizeId(raw: string): string {
  let s = raw.trim();
  try {
    if (/^https?:\/\//i.test(s)) {
      const fromUrl = new URL(s).searchParams.get("id");
      if (fromUrl) s = fromUrl;
    }
  } catch {
    /* not a URL */
  }
  s = s.toUpperCase().replace(/[\s_–—]+/g, "-").replace(/-+/g, "-");
  const compact = s.replace(/-/g, "");
  const m = /^DHR(\d{4})([A-Z]{3})(\d{4})$/.exec(compact);
  return m ? `DHR-${m[1]}-${m[2]}-${m[3]}` : s;
}

export function isValidId(id: string): boolean {
  return ID_PATTERN.test(id);
}

export function findPassport(id: string): PassportRecord | undefined {
  return REGISTRY.find((p) => p.id === id);
}

/** Deterministic pseudo-random bar heights (0.15–1) for the fake waveform. */
export function waveform(seed: string, bars: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out: number[] = [];
  for (let i = 0; i < bars; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ i;
    const r = ((h >>> 0) % 1000) / 1000;
    const env = Math.sin((i / bars) * Math.PI) * 0.5 + 0.5;
    out.push(Math.max(0.15, Math.min(1, r * env + 0.1)));
  }
  return out;
}
