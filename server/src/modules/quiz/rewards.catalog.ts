import type { RewardKind } from "../../../../shared/quiz-contract";

/**
 * PROTOTYPE reward catalog. Partners are illustrative samples, not real
 * businesses. Replace with real partner offers (or load from the database)
 * once agreements exist.
 */
export interface RewardDef {
  id: string;
  title: string;
  partner: string;
  kind: RewardKind;
  description: string;
  discountLabel: string;
  cost: number;
  minLevel: number;
  validityDays: number;
  terms: string[];
}

const PROTOTYPE_TERM = "Prototype offer for demonstration. Partner redemption will go live once agreements are signed.";

export const REWARDS: RewardDef[] = [
  {
    id: "supporter-certificate",
    title: "Heritage Supporter Certificate",
    partner: "Dharohar",
    kind: "digital",
    description: "A printable certificate with your name, level and badges, to celebrate your learning.",
    discountLabel: "Free",
    cost: 60,
    minLevel: 1,
    validityDays: 365,
    terms: ["One certificate per level reached.", PROTOTYPE_TERM],
  },
  {
    id: "audio-guide",
    title: "Monument Audio Guide",
    partner: "Sample partner: Heritage audio guides",
    kind: "digital",
    description: "Unlock a narrated audio tour for one monument of your choice.",
    discountLabel: "1 free guide",
    cost: 80,
    minLevel: 1,
    validityDays: 60,
    terms: ["Valid for one monument.", PROTOTYPE_TERM],
  },
  {
    id: "heritage-walk",
    title: "Guided Old City Walk",
    partner: "Sample partner: Local heritage walk collective",
    kind: "travel",
    description: "Money off a guided walking tour through a historic neighbourhood, led by local storytellers.",
    discountLabel: "Rs 100 off",
    cost: 120,
    minLevel: 1,
    validityDays: 45,
    terms: ["Minimum booking value Rs 400.", "One code per booking.", PROTOTYPE_TERM],
  },
  {
    id: "museum-pass",
    title: "Museum Entry Discount",
    partner: "Sample partner: City museums network",
    kind: "museum",
    description: "A discount on entry tickets at participating museums and galleries.",
    discountLabel: "20% off entry",
    cost: 150,
    minLevel: 2,
    validityDays: 30,
    terms: ["Valid for up to 2 tickets.", "Not valid on special exhibitions.", PROTOTYPE_TERM],
  },
  {
    id: "book-voucher",
    title: "Heritage Books Voucher",
    partner: "Sample partner: Independent booksellers",
    kind: "learning",
    description: "Money off books on Indian history, art, music and food.",
    discountLabel: "Rs 150 off",
    cost: 200,
    minLevel: 2,
    validityDays: 60,
    terms: ["Minimum order value Rs 600.", PROTOTYPE_TERM],
  },
  {
    id: "handloom",
    title: "Handloom Purchase Discount",
    partner: "Sample partner: Weavers' cooperative",
    kind: "crafts",
    description: "A discount on handwoven sarees, stoles and fabrics bought directly from weavers.",
    discountLabel: "15% off",
    cost: 250,
    minLevel: 3,
    validityDays: 45,
    terms: ["Maximum discount Rs 750.", "Applies to handloom products only.", PROTOTYPE_TERM],
  },
  {
    id: "craft-workshop",
    title: "Artisan Craft Workshop",
    partner: "Sample partner: Artisan workshop studio",
    kind: "learning",
    description: "Learn block printing, pottery or painting from a master artisan, at a reduced fee.",
    discountLabel: "25% off",
    cost: 300,
    minLevel: 3,
    validityDays: 60,
    terms: ["Subject to seat availability.", PROTOTYPE_TERM],
  },
  {
    id: "homestay",
    title: "Heritage Homestay Night",
    partner: "Sample partner: Heritage homestays",
    kind: "travel",
    description: "A discount on a night's stay in a restored traditional home.",
    discountLabel: "10% off",
    cost: 500,
    minLevel: 4,
    validityDays: 90,
    terms: ["Valid on one night per booking.", "Blackout dates may apply.", PROTOTYPE_TERM],
  },
];

export const rewardById = new Map(REWARDS.map((r) => [r.id, r]));
