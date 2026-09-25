import type { CategoryId, Difficulty, Explanation, Source } from "../../../../../shared/quiz-contract";

interface BaseQuestion {
  /** Stable id, never reuse one. Format: <cat>-<s|h|d>-<nn> */
  id: string;
  category: CategoryId;
  difficulty: Difficulty;
  prompt: string;
  explanation: Explanation;
  source: Source;
}

export interface McqQuestion extends BaseQuestion {
  type: "mcq";
  options: string[];
  answer: number;
}

export interface OddOneOutQuestion extends BaseQuestion {
  type: "odd_one_out";
  options: string[];
  answer: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true_false";
  answer: boolean;
}

export interface ChronologyQuestion extends BaseQuestion {
  type: "chronology";
  /** Listed in the correct order, earliest first. Shuffled when served. */
  items: string[];
}

export interface MatchQuestion extends BaseQuestion {
  type: "match";
  /** [left, right] pairs in the correct pairing. Right column is shuffled when served. */
  pairs: [string, string][];
}

export type BankQuestion =
  | McqQuestion
  | OddOneOutQuestion
  | TrueFalseQuestion
  | ChronologyQuestion
  | MatchQuestion;

/** Frequently cited, authoritative sources. Reuse these so links stay consistent. */
export const SRC = {
  unescoIchIndia: { label: "UNESCO Intangible Cultural Heritage: India", url: "https://ich.unesco.org/en/state/india-IN" },
  unescoWhcIndia: { label: "UNESCO World Heritage Centre: India", url: "https://whc.unesco.org/en/statesparties/in" },
  whc: (id: number, name: string) => ({ label: `UNESCO World Heritage Centre: ${name}`, url: `https://whc.unesco.org/en/list/${id}` }),
  giRegistry: { label: "Geographical Indications Registry, Government of India: registered GIs", url: "https://ipindia.gov.in/frontend/pdf/gi/registered/State_wise_Registered_GI_of_India.pdf" },
  britannica: (slug: string, name: string) => ({ label: `Encyclopaedia Britannica: ${name}`, url: `https://www.britannica.com/${slug}` }),
  sna: { label: "Sangeet Natak Akademi", url: "https://www.sangeetnatak.gov.in/" },
  asi: { label: "Archaeological Survey of India", url: "https://asi.nic.in/" },
  indiaCulture: { label: "Ministry of Culture, Government of India", url: "https://www.indiaculture.gov.in/" },
  knowIndia: { label: "National Portal of India: Explore India", url: "https://www.india.gov.in/explore-india" },
} as const;
