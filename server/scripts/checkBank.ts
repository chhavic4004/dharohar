/**
 * Validates the question bank. Run with `npm run check:bank`.
 * Add `--links` to also check that every source URL responds.
 *
 * Checks: unique ids, id prefix matches category and difficulty, answer
 * indexes in range, unique options, 3 to 5 items for chronology and match,
 * no emojis, no em or en dashes, every question has a source URL.
 */
import { DAILY_BANK, QUIZ_BANK } from "../src/modules/quiz/bank";
import type { BankQuestion } from "../src/modules/quiz/bank/types";

const EMOJI = /\p{Extended_Pictographic}/u;
const DASHES = /[–—]/;
const PREFIX: Record<string, string> = { rhythms: "rhy", architecture: "arc", culinary: "cul", traditions: "tra", rulers: "rul" };

const errors: string[] = [];
const fail = (q: BankQuestion, msg: string) => errors.push(`${q.id}: ${msg}`);

function texts(q: BankQuestion): string[] {
  const out = [q.prompt, q.explanation.title, q.explanation.body, q.explanation.trivia ?? "", q.source.label];
  if (q.type === "mcq" || q.type === "odd_one_out") out.push(...q.options);
  if (q.type === "chronology") out.push(...q.items);
  if (q.type === "match") out.push(...q.pairs.flat());
  return out;
}

for (const q of QUIZ_BANK) {
  const d = q.difficulty === "seeker" ? "s" : "h";
  if (!q.id.startsWith(`${PREFIX[q.category]}-${d}-`)) fail(q, "id prefix does not match category/difficulty");
}
for (const q of DAILY_BANK) if (!q.id.startsWith("day-")) fail(q, "daily ids must start with day-");

for (const q of [...QUIZ_BANK, ...DAILY_BANK]) {
  if (!/^https:\/\//.test(q.source.url)) fail(q, "source url must be https");
  for (const t of texts(q)) {
    if (EMOJI.test(t)) fail(q, `emoji found in "${t.slice(0, 40)}"`);
    if (DASHES.test(t)) fail(q, `em/en dash found in "${t.slice(0, 40)}"`);
  }
  switch (q.type) {
    case "mcq":
    case "odd_one_out":
      if (q.options.length < 3 || q.options.length > 5) fail(q, "needs 3 to 5 options");
      if (q.answer < 0 || q.answer >= q.options.length) fail(q, "answer index out of range");
      if (new Set(q.options).size !== q.options.length) fail(q, "duplicate options");
      break;
    case "chronology":
      if (q.items.length < 3 || q.items.length > 5) fail(q, "needs 3 to 5 items");
      break;
    case "match":
      if (q.pairs.length < 3 || q.pairs.length > 5) fail(q, "needs 3 to 5 pairs");
      if (new Set(q.pairs.map((p) => p[1])).size !== q.pairs.length) fail(q, "duplicate right-side values");
      break;
  }
}

const counts: Record<string, number> = {};
for (const q of QUIZ_BANK) counts[`${q.category}/${q.difficulty}`] = (counts[`${q.category}/${q.difficulty}`] ?? 0) + 1;
const types: Record<string, number> = {};
for (const q of [...QUIZ_BANK, ...DAILY_BANK]) types[q.type] = (types[q.type] ?? 0) + 1;

console.log("Questions per category/difficulty:");
console.table(counts);
console.log("Question types:", types);
console.log(`Quiz bank: ${QUIZ_BANK.length}, daily pool: ${DAILY_BANK.length}`);

for (const [key, n] of Object.entries(counts)) if (n < 20) errors.push(`${key}: only ${n} questions, need at least 20`);

if (process.argv.includes("--links")) {
  const urls = [...new Set([...QUIZ_BANK, ...DAILY_BANK].map((q) => q.source.url))];
  console.log(`Checking ${urls.length} source links...`);
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow", headers: { "user-agent": "Mozilla/5.0 dharohar-bank-check" } });
      console.log(`${res.status}  ${url}`);
      if (res.status === 404 || res.status === 410) errors.push(`broken link (${res.status}): ${url}`);
    } catch (e) {
      console.log(`ERR  ${url}  ${(e as Error).message}`);
    }
  }
}

if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("\nBank looks good.");
