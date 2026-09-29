
const HERITAGE_KEYWORDS = [
  // Heritage and culture
  "heritage", "culture", "cultural", "tradition",
  "traditional", "custom", "customs", "folklore",
  "civilization", "civilisation", "intangible",

  // Monuments and places
  "monument", "temple", "palace", "fort", "fortress",
  "mosque", "church", "tomb", "mausoleum", "museum",
  "heritage site", "archaeological", "architecture",
  "architectural", "building", "jharokha", "pillar",
  "pillars", "dome", "minar", "stupa", "stepwell",
  "window", "windows", "facade", "ventilation",
  "screen", "lattice", "design", "feature", "features",
  "structure", "purpose", "symbolism", "significance",
  "decoration", "decorations",

  // History
  "history", "historical", "dynasty", "king", "queen",
  "emperor", "ruler", "built", "constructed", "founded",
  "commissioned", "century", "ancient", "medieval",
  "mughal", "rajput", "maratha",

  // Arts and crafts
  "art", "painting", "sculpture", "craft", "handicraft",
  "textile", "weaving", "embroidery", "pottery",
  "music", "dance", "classical", "performing arts",
  "instrument", "folk art",

  // Festivals and practices
  "festival", "festivals", "ritual", "rituals",
  "celebration", "celebrations", "ceremony",
  "ceremonies", "wedding", "food heritage",

  // Heritage preservation
  "preservation", "conservation", "restoration",
  "unesco", "world heritage", "heritage protection",
  "cultural identity", "oral history"
];

const INJECTION_PATTERNS = [
  /ignore (all |any )?(previous |prior )?instructions/i,
  /disregard (all |your )?(rules|instructions)/i,
  /forget (all |your )?(rules|instructions)/i,
  /act as (an? )?(unrestricted|different|general)/i,
  /reveal (your )?(system prompt|hidden instructions)/i,
  /show (me )?(your )?(system prompt|hidden instructions)/i,
  /developer message/i,
  /bypass (your )?(restrictions|rules|filters)/i,
  /override (your )?(instructions|rules|restrictions)/i
];

export function checkHeritageScope(question, monumentId = null) {
  if (typeof question !== "string") {
    return {
      allowed: false,
      reason: "invalid_input"
    };
  }

  const text = question.trim().toLowerCase();

  if (!text) {
    return {
      allowed: false,
      reason: "empty_question"
    };
  }

  if (text.length > 500) {
    return {
      allowed: false,
      reason: "question_too_long"
    };
  }

  // Reject obvious attempts to override instructions.
  if (INJECTION_PATTERNS.some(pattern => pattern.test(text))) {
    return {
      allowed: false,
      reason: "instruction_override"
    };
  }

  // Check for heritage-related keywords.
  const hasHeritageKeyword = HERITAGE_KEYWORDS.some(keyword =>
    text.includes(keyword)
  );

  if (hasHeritageKeyword) {
    return {
      allowed: true,
      reason: "heritage_topic_detected"
    };
  }

  // Allow likely follow-up questions when a monument is selected.
  // Examples: "Who built it?" and "Why is it famous?"
  const hasContextReference =
    /\b(it|its|they|them|this|that|these|those)\b/i.test(text);

  const hasFollowupForm =
    /^(who|what|when|where|why|how|which|can you|could you|tell me|explain)\b/i.test(text);

  const hasMonumentContext =
    typeof monumentId === "string" &&
    monumentId.trim().length > 0;

  if (
    hasMonumentContext &&
    hasContextReference &&
    hasFollowupForm
  ) {
    return {
      allowed: true,
      reason: "monument_followup_detected"
    };
  }

  return {
    allowed: false,
    reason: "outside_heritage_scope"
  };
}