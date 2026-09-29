/**
 * Checks one translation file against its English bank file.
 * Usage: npx tsx scripts/checkTranslation.ts <hi|pa|ur> <rhythms|architecture|culinary|traditions|rulers|visual|daily>
 */
import { architectureQuestions } from "../src/modules/quiz/bank/architecture";
import { culinaryQuestions } from "../src/modules/quiz/bank/culinary";
import { dailyQuestions } from "../src/modules/quiz/bank/daily";
import { rhythmsQuestions } from "../src/modules/quiz/bank/rhythms";
import { rulersQuestions } from "../src/modules/quiz/bank/rulers";
import { traditionsQuestions } from "../src/modules/quiz/bank/traditions";
import { visualQuestions } from "../src/modules/quiz/bank/visual";
import type { BankQuestion } from "../src/modules/quiz/bank/types";
import type { TranslationTable } from "../src/modules/quiz/i18n/types";

const [lang, cat] = process.argv.slice(2);
const BANK: Record<string, BankQuestion[]> = {
  rhythms: rhythmsQuestions, architecture: architectureQuestions, culinary: culinaryQuestions,
  traditions: traditionsQuestions, rulers: rulersQuestions, visual: visualQuestions, daily: dailyQuestions,
};
const SCRIPT: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, pa: /[਀-੿]/, ur: /[؀-ۿ]/ };
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const DASHES = /[–—]/;

const mod = await import(`../src/modules/quiz/i18n/${lang}/${cat}.ts`);
const table = Object.values(mod)[0] as TranslationTable;
const qs = BANK[cat];
const errors: string[] = [];
for (const q of qs) {
  const t = table[q.id];
  const e = (m: string) => errors.push(`${q.id}: ${m}`);
  if (!t) { e("missing"); continue; }
  const texts = [t.prompt, t.explanation?.title, t.explanation?.body, t.explanation?.trivia ?? "", ...(t.options ?? []), ...(t.items ?? []), ...(t.pairs?.flat() ?? []), t.label ?? "", t.alt ?? ""];
  for (const s of texts) {
    if (typeof s !== "string") e("non-string value");
    else { if (EMOJI.test(s)) e("emoji"); if (DASHES.test(s)) e(`dash in "${s.slice(0, 30)}"`); }
  }
  if (!SCRIPT[lang].test(t.prompt) || !SCRIPT[lang].test(t.explanation.body) || !SCRIPT[lang].test(t.explanation.title)) e("prompt/title/body not in target script");
  if ((q.type === "mcq" || q.type === "odd_one_out") && t.options?.length !== q.options.length) e("options count");
  if (q.type === "true_false" && (t.options || t.items || t.pairs)) e("true_false must only have prompt/explanation");
  if (q.type === "chronology" && t.items?.length !== q.items.length) e("items count");
  if (q.type === "match" && t.pairs?.length !== q.pairs.length) e("pairs count");
  if (q.type === "match" && t.pairs && new Set(t.pairs.map((p) => p[1])).size !== t.pairs.length) e("duplicate right side");
  if (q.type === "map_pin" && !t.label) e("label missing");
  if (!!t.explanation.trivia !== !!q.explanation.trivia) e("trivia presence differs");
  if (!!q.media !== !!t.alt) e("alt presence differs from media");
}
for (const id of Object.keys(table)) if (!qs.some((q) => q.id === id)) errors.push(`${id}: not in ${cat} bank`);
console.log(errors.length ? errors.join("\n") : `OK: ${Object.keys(table).length}/${qs.length} ${lang} ${cat}`);
process.exit(errors.length ? 1 : 0);
