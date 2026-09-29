import type { Explanation } from "../../../../../shared/quiz-contract";

/** A hand-made translation of one question. Arrays follow the ORIGINAL order in the bank. */
export interface QuestionTranslation {
  prompt: string;
  options?: string[];
  items?: string[];
  pairs?: [string, string][];
  label?: string;
  explanation: Explanation;
  alt?: string;
}

export type TranslationTable = Record<string, QuestionTranslation>;
