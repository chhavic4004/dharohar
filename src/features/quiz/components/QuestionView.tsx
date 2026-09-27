import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, ExternalLink, Volume2, X } from "lucide-react";
import type { AnswerPayload, CorrectAnswer, PublicQuestion, QuestionMedia } from "@shared/quiz-contract";
import { useI18n } from "../i18n";
import { Button, Spinner, cx } from "./ui";

// Leaflet is only loaded when a map question appears.
const MapPinInput = lazy(() => import("./MapPinInput"));

interface Props {
  question: PublicQuestion;
  /** Set after the answer is checked */
  correctAnswer: CorrectAnswer | null;
  submitted: AnswerPayload | null;
  busy?: boolean;
  onSubmit: (answer: AnswerPayload) => void;
}

const LETTERS = ["A", "B", "C", "D", "E"];

export function MediaBlock({ media }: { media: QuestionMedia }) {
  const { t } = useI18n();
  if (media.kind === "audio") {
    return (
      <figure className="rounded-2xl bg-white/80 border border-maroon/10 p-4">
        <div className="flex items-center gap-3 mb-3 text-maroon">
          <Volume2 className="w-5 h-5" aria-hidden />
          <span className="text-sm font-medium">{media.alt}</span>
        </div>
        <audio controls preload="none" src={media.url} className="w-full">
          <track kind="captions" />
        </audio>
        <figcaption className="text-[11px] text-ink/50 mt-2">
          {t("audioCredit")}:{" "}
          <a href={media.creditUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-maroon">
            {media.credit}
          </a>
        </figcaption>
      </figure>
    );
  }
  return (
    <figure className="rounded-2xl overflow-hidden bg-ink shadow-md">
      <img src={media.url} alt={media.alt} loading="lazy" className="w-full max-h-80 object-contain bg-ink" />
      <figcaption className="bg-white/90 text-[11px] text-ink/55 px-3 py-1.5 flex items-center gap-1">
        {t("imageCredit")}:
        <a href={media.creditUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline hover:text-maroon">
          {media.credit} <ExternalLink className="w-3 h-3" aria-hidden />
        </a>
      </figcaption>
    </figure>
  );
}

/** Renders any question type, both while answering and after the answer is revealed. */
export default function QuestionView({ question, correctAnswer, submitted, busy, onSubmit }: Props) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
        {t(`type_${question.type}`)}
        <span className="normal-case tracking-normal font-normal text-ink/50"> · {t(`hint_${question.type}`)}</span>
      </p>
      {(question.type === "mcq" || question.type === "odd_one_out" || question.type === "true_false") && (
        <ChoiceOptions question={question} correctAnswer={correctAnswer} submitted={submitted} busy={busy} onSubmit={onSubmit} />
      )}
      {question.type === "chronology" && (
        <Chronology question={question} correctAnswer={correctAnswer} submitted={submitted} busy={busy} onSubmit={onSubmit} />
      )}
      {question.type === "match" && <Match question={question} correctAnswer={correctAnswer} submitted={submitted} busy={busy} onSubmit={onSubmit} />}
      {question.type === "map_pin" && (
        <Suspense fallback={<Spinner />}>
          <MapPinInput question={question} correctAnswer={correctAnswer} submitted={submitted} busy={busy} onSubmit={onSubmit} />
        </Suspense>
      )}
    </div>
  );
}

function ChoiceOptions({ question, correctAnswer, submitted, busy, onSubmit }: Props) {
  const { t } = useI18n();
  const revealed = correctAnswer !== null;
  const correctId = correctAnswer && "choice" in correctAnswer ? correctAnswer.choice : -1;
  const chosenId = submitted && "choice" in submitted ? submitted.choice : -1;
  const isTF = question.type === "true_false";

  return (
    <div className={cx("gap-2.5", isTF ? "grid grid-cols-2" : "flex flex-col")} role="group" aria-label={t("a11yOptions")}>
      {question.options!.map((opt, idx) => {
        const isCorrect = revealed && opt.id === correctId;
        const isWrongPick = revealed && opt.id === chosenId && chosenId !== correctId;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={revealed || busy}
            onClick={() => onSubmit({ choice: opt.id })}
            aria-pressed={opt.id === chosenId}
            className={cx(
              "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-start transition-all duration-200",
              !revealed && "border-maroon/15 bg-white/70 hover:border-maroon/50 hover:bg-white hover:shadow-md cursor-pointer disabled:cursor-wait",
              isCorrect && "border-heritage bg-heritage/10 shadow-md",
              isWrongPick && "border-terracotta bg-terracotta/10",
              revealed && !isCorrect && !isWrongPick && "border-maroon/10 bg-white/40 opacity-60",
            )}
          >
            <span
              className={cx(
                "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                isCorrect ? "bg-heritage text-white" : isWrongPick ? "bg-terracotta text-white" : "bg-maroon/10 text-maroon",
              )}
              aria-hidden
            >
              {isCorrect ? <Check className="w-4 h-4" /> : isWrongPick ? <X className="w-4 h-4" /> : isTF ? (idx === 0 ? "T" : "F") : LETTERS[idx]}
            </span>
            <span className="text-sm sm:text-base text-ink leading-snug">{opt.text}</span>
            {isCorrect && <span className="sr-only">(correct answer)</span>}
            {isWrongPick && <span className="sr-only">(your answer, incorrect)</span>}
          </button>
        );
      })}
    </div>
  );
}

function Chronology({ question, correctAnswer, submitted, busy, onSubmit }: Props) {
  const { t } = useI18n();
  const items = question.items!;
  const [order, setOrder] = useState<number[]>(() => items.map((i) => i.id));
  useEffect(() => setOrder(items.map((i) => i.id)), [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const revealed = correctAnswer !== null;
  const shown = revealed && submitted && "order" in submitted ? submitted.order : order;
  const correctOrder = correctAnswer && "order" in correctAnswer ? correctAnswer.order : [];
  const text = (id: number) => items.find((i) => i.id === id)?.text ?? "";

  const move = (pos: number, dir: -1 | 1) => {
    const next = [...order];
    const target = pos + dir;
    if (target < 0 || target >= next.length) return;
    [next[pos], next[target]] = [next[target], next[pos]];
    setOrder(next);
  };

  return (
    <div>
      <ol className="space-y-2" aria-label={t("a11yOrder")}>
        {shown.map((id, pos) => {
          const right = revealed && correctOrder[pos] === id;
          return (
            <li
              key={id}
              className={cx(
                "flex items-center gap-3 p-3 rounded-xl border-2 bg-white/80 transition-colors",
                !revealed && "border-maroon/15",
                revealed && right && "border-heritage bg-heritage/10",
                revealed && !right && "border-terracotta bg-terracotta/10",
              )}
            >
              <span className="shrink-0 w-7 h-7 rounded-full bg-maroon/10 text-maroon text-xs font-bold flex items-center justify-center">{pos + 1}</span>
              <span className="flex-1 text-sm sm:text-base text-ink">{text(id)}</span>
              {!revealed ? (
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(pos, -1)}
                    disabled={pos === 0 || busy}
                    aria-label={`${t("moveUp")}: ${text(id)}`}
                    className="p-2 rounded-lg hover:bg-maroon/10 text-maroon disabled:opacity-25 cursor-pointer disabled:cursor-default"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(pos, 1)}
                    disabled={pos === shown.length - 1 || busy}
                    aria-label={`${t("moveDown")}: ${text(id)}`}
                    className="p-2 rounded-lg hover:bg-maroon/10 text-maroon disabled:opacity-25 cursor-pointer disabled:cursor-default"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </span>
              ) : right ? (
                <Check className="w-5 h-5 text-heritage" aria-label={t("a11yCorrectPos")} />
              ) : (
                <X className="w-5 h-5 text-terracotta" aria-label={t("a11yWrongPos")} />
              )}
            </li>
          );
        })}
      </ol>
      {revealed && !shown.every((id, pos) => correctOrder[pos] === id) && (
        <div className="mt-3 rounded-xl bg-heritage/10 border border-heritage/30 p-3">
          <p className="text-xs font-semibold text-heritage mb-1.5">{t("correctOrder")}</p>
          <ol className="text-sm text-ink/80 list-decimal list-inside space-y-0.5">
            {correctOrder.map((id) => (
              <li key={id}>{text(id)}</li>
            ))}
          </ol>
        </div>
      )}
      {!revealed && (
        <Button className="w-full mt-4" onClick={() => onSubmit({ order })} loading={busy}>
          {t("submitOrder")}
        </Button>
      )}
    </div>
  );
}

function Match({ question, correctAnswer, submitted, busy, onSubmit }: Props) {
  const { t } = useI18n();
  const left = question.left!;
  const right = question.right!;
  const [picks, setPicks] = useState<(number | null)[]>(() => left.map(() => null));
  useEffect(() => setPicks(left.map(() => null)), [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const revealed = correctAnswer !== null;
  const shown = revealed && submitted && "pairs" in submitted ? submitted.pairs : picks;
  const correctPairs = correctAnswer && "pairs" in correctAnswer ? correctAnswer.pairs : [];
  const rightText = (id: number | null) => right.find((r) => r.id === id)?.text ?? "";
  const complete = picks.every((p) => p !== null);

  return (
    <div>
      <div className="space-y-2.5">
        {left.map((l, i) => {
          const value = shown[i];
          const ok = revealed && value === correctPairs[i];
          return (
            <div
              key={l.id}
              className={cx(
                "grid grid-cols-1 sm:grid-cols-2 gap-2 items-center p-3 rounded-xl border-2 bg-white/80",
                !revealed && "border-maroon/15",
                revealed && ok && "border-heritage bg-heritage/10",
                revealed && !ok && "border-terracotta bg-terracotta/10",
              )}
            >
              <label htmlFor={`match-${question.id}-${i}`} className="text-sm sm:text-base font-medium text-ink">
                {l.text}
              </label>
              {!revealed ? (
                <select
                  id={`match-${question.id}-${i}`}
                  value={value ?? ""}
                  disabled={busy}
                  onChange={(e) => {
                    const v = e.target.value === "" ? null : Number(e.target.value);
                    setPicks((prev) => prev.map((p, j) => (j === i ? v : p === v ? null : p)));
                  }}
                  className="w-full rounded-lg border border-maroon/25 bg-parchment/60 px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-maroon cursor-pointer"
                >
                  <option value="">{t("selectMatch")}</option>
                  {right.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.text}
                      {picks.includes(r.id) && picks[i] !== r.id ? ` (${t("used")})` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm">
                  <span className={cx("inline-flex items-center gap-1.5", ok ? "text-heritage font-semibold" : "text-terracotta line-through")}>
                    {ok ? <Check className="w-4 h-4" aria-hidden /> : <X className="w-4 h-4" aria-hidden />}
                    {rightText(value)}
                  </span>
                  {!ok && <span className="block text-heritage font-semibold mt-0.5">{rightText(correctPairs[i])}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!revealed && (
        <Button className="w-full mt-4" disabled={!complete} loading={busy} onClick={() => onSubmit({ pairs: picks as number[] })}>
          {complete ? t("submitMatches") : t("matchAll", { n: left.length })}
        </Button>
      )}
    </div>
  );
}
