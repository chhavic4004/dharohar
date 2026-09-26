import type { Lang } from "../../../../../shared/quiz-contract";
import type { BankQuestion } from "../bank/types";
import { HI } from "./hi";
import { translateTexts } from "./translator";
import type { QuestionTranslation } from "./types";

const TABLES: Partial<Record<Lang, Record<string, QuestionTranslation>>> = { hi: HI };

function apply(q: BankQuestion, t: QuestionTranslation): BankQuestion {
  const out = { ...q, prompt: t.prompt, explanation: t.explanation } as BankQuestion;
  if (q.media && t.alt) out.media = { ...q.media, alt: t.alt };
  switch (out.type) {
    case "mcq":
    case "odd_one_out":
      if (t.options?.length === out.options.length) out.options = t.options;
      break;
    case "chronology":
      if (t.items?.length === out.items.length) out.items = t.items;
      break;
    case "match":
      if (t.pairs?.length === out.pairs.length) out.pairs = t.pairs;
      break;
    case "map_pin":
      if (t.label) out.label = t.label;
      break;
  }
  return out;
}

function textsOf(q: BankQuestion): string[] {
  const list = [q.prompt, q.explanation.title, q.explanation.body, q.explanation.trivia ?? ""];
  if (q.type === "mcq" || q.type === "odd_one_out") list.push(...q.options);
  if (q.type === "chronology") list.push(...q.items);
  if (q.type === "match") list.push(...q.pairs.flat());
  if (q.type === "map_pin") list.push(q.label);
  return list;
}

function rebuild(q: BankQuestion, tr: string[]): QuestionTranslation {
  let i = 0;
  const next = () => tr[i++];
  const t: QuestionTranslation = {
    prompt: next(),
    explanation: { title: next(), body: next(), trivia: next() || undefined },
  };
  if (q.type === "mcq" || q.type === "odd_one_out") t.options = q.options.map(next);
  if (q.type === "chronology") t.items = q.items.map(next);
  if (q.type === "match") t.pairs = q.pairs.map(() => [next(), next()] as [string, string]);
  if (q.type === "map_pin") t.label = next();
  return t;
}

/**
 * Returns the question in the requested language plus the language actually
 * used. Order: hand-made translation, then machine translation, then English.
 */
export async function localize(q: BankQuestion, lang: Lang): Promise<{ q: BankQuestion; lang: Lang }> {
  if (lang === "en") return { q, lang: "en" };
  const manual = TABLES[lang]?.[q.id];
  if (manual) return { q: apply(q, manual), lang };
  const tr = await translateTexts(textsOf(q), lang);
  if (tr) return { q: apply(q, rebuild(q, tr)), lang };
  return { q, lang: "en" };
}

export function hasManualTranslation(lang: Lang, id: string): boolean {
  return Boolean(TABLES[lang]?.[id]);
}

export { TABLES as TRANSLATION_TABLES };
