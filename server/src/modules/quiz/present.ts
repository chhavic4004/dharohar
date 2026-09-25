/**
 * Turns bank questions into what the player sees, and grades answers.
 *
 * Options are shuffled per player. The player only ever sees display
 * positions (0, 1, 2...), and the layout that maps them back to the real
 * answer stays on the server, so the correct answer can't be read from the
 * network tab.
 */
import type { AnswerPayload, CorrectAnswer, PublicQuestion } from "../../../../shared/quiz-contract";
import { ApiError } from "../../middleware/errors";
import { nonIdentityPermutation, shuffle } from "../../utils/random";
import type { QuestionLayout } from "../../store/types";
import type { BankQuestion } from "./bank";

const TF = ["True", "False"];
const ARROW = " → ";

export function createLayout(q: BankQuestion, rand: (a: number[]) => number[] = shuffle): QuestionLayout {
  switch (q.type) {
    case "mcq":
    case "odd_one_out":
      return { order: rand(q.options.map((_, i) => i)) };
    case "true_false":
      return {};
    case "chronology":
      return { order: nonIdentityPermutation(q.items.length, rand) };
    case "match":
      return { right: nonIdentityPermutation(q.pairs.length, rand) };
  }
}

export function toPublic(q: BankQuestion, layout: QuestionLayout): PublicQuestion {
  const base = { id: q.id, type: q.type, category: q.category, difficulty: q.difficulty, prompt: q.prompt };
  switch (q.type) {
    case "mcq":
    case "odd_one_out":
      return { ...base, options: layout.order!.map((orig, id) => ({ id, text: q.options[orig] })) };
    case "true_false":
      return { ...base, options: TF.map((text, id) => ({ id, text })) };
    case "chronology":
      return { ...base, items: layout.order!.map((orig, id) => ({ id, text: q.items[orig] })) };
    case "match":
      return {
        ...base,
        left: q.pairs.map((p, id) => ({ id, text: p[0] })),
        right: layout.right!.map((orig, id) => ({ id, text: q.pairs[orig][1] })),
      };
  }
}

function isPermutation(arr: unknown, n: number): arr is number[] {
  return Array.isArray(arr) && arr.length === n && new Set(arr).size === n && arr.every((v) => Number.isInteger(v) && v >= 0 && v < n);
}

function invalid(msg: string): never {
  throw new ApiError(400, "invalid_answer", msg);
}

/** Returns whether the answer is correct. Throws 400 if the payload does not fit the question. */
export function grade(q: BankQuestion, layout: QuestionLayout, payload: AnswerPayload): boolean {
  switch (q.type) {
    case "mcq":
    case "odd_one_out": {
      if (!("choice" in payload) || !Number.isInteger(payload.choice) || payload.choice < 0 || payload.choice >= q.options.length)
        invalid("Pick one of the options.");
      return layout.order![payload.choice] === q.answer;
    }
    case "true_false": {
      if (!("choice" in payload) || (payload.choice !== 0 && payload.choice !== 1)) invalid("Choose True or False.");
      return (payload.choice === 0) === q.answer;
    }
    case "chronology": {
      if (!("order" in payload) || !isPermutation(payload.order, q.items.length)) invalid("Place every item exactly once.");
      return payload.order.every((displayId, pos) => layout.order![displayId] === pos);
    }
    case "match": {
      if (!("pairs" in payload) || !isPermutation(payload.pairs, q.pairs.length)) invalid("Match every item exactly once.");
      return payload.pairs.every((rightDisplayId, leftIdx) => layout.right![rightDisplayId] === leftIdx);
    }
  }
}

export function correctAnswerFor(q: BankQuestion, layout: QuestionLayout): CorrectAnswer {
  switch (q.type) {
    case "mcq":
    case "odd_one_out":
      return { choice: layout.order!.indexOf(q.answer) };
    case "true_false":
      return { choice: q.answer ? 0 : 1 };
    case "chronology":
      return { order: q.items.map((_, orig) => layout.order!.indexOf(orig)) };
    case "match":
      return { pairs: q.pairs.map((_, leftIdx) => layout.right!.indexOf(leftIdx)) };
  }
}

export function correctAnswerText(q: BankQuestion): string {
  switch (q.type) {
    case "mcq":
    case "odd_one_out":
      return q.options[q.answer];
    case "true_false":
      return q.answer ? "True" : "False";
    case "chronology":
      return q.items.join(ARROW);
    case "match":
      return q.pairs.map(([l, r]) => `${l}: ${r}`).join("; ");
  }
}

export function responseText(q: BankQuestion, layout: QuestionLayout, payload: AnswerPayload): string {
  if ("timedOut" in payload) return "No answer (time ran out)";
  switch (q.type) {
    case "mcq":
    case "odd_one_out":
      return "choice" in payload ? q.options[layout.order![payload.choice]] ?? "" : "";
    case "true_false":
      return "choice" in payload ? TF[payload.choice] ?? "" : "";
    case "chronology":
      return "order" in payload ? payload.order.map((d) => q.items[layout.order![d]]).join(ARROW) : "";
    case "match":
      return "pairs" in payload ? payload.pairs.map((d, i) => `${q.pairs[i][0]}: ${q.pairs[layout.right![d]][1]}`).join("; ") : "";
  }
}
