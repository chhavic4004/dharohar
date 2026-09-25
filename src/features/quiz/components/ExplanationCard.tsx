import { BookOpen, CheckCircle2, Clock, ExternalLink, Lightbulb, XCircle } from "lucide-react";
import type { Explanation, Source } from "@shared/quiz-contract";
import { cx } from "./ui";

interface Props {
  correct: boolean;
  timedOut?: boolean;
  correctAnswerText: string;
  explanation: Explanation;
  source: Source;
  pointsEarned?: number;
  /** Chronology and match questions already mark the correct answer inline */
  answerShownInline?: boolean;
}

/**
 * The explanation shown under the options once an answer is checked.
 * Always fully visible, never collapsed, so every player gets the full context.
 */
export default function ExplanationCard({ correct, timedOut, correctAnswerText, explanation, source, pointsEarned, answerShownInline }: Props) {
  const status = timedOut
    ? { icon: Clock, title: "Time is up", tone: "text-alert", bg: "bg-alert/10 border-alert/30" }
    : correct
      ? { icon: CheckCircle2, title: "Correct", tone: "text-heritage", bg: "bg-heritage/10 border-heritage/30" }
      : { icon: XCircle, title: "Not quite", tone: "text-terracotta", bg: "bg-terracotta/10 border-terracotta/30" };
  const Icon = status.icon;

  return (
    <section aria-live="polite" className="rounded-2xl border border-turmeric/40 overflow-hidden shadow-sm bg-white/85 animate-[fadeIn_0.3s_ease-out]">
      <div className={cx("flex items-start gap-3 px-5 py-4 border-b", status.bg)}>
        <Icon className={cx("w-6 h-6 shrink-0 mt-0.5", status.tone)} aria-hidden />
        <div className="flex-1 min-w-0">
          <p className={cx("font-serif font-semibold text-base", status.tone)}>{status.title}</p>
          {!correct && !answerShownInline && (
            <p className="text-sm text-ink/80 mt-0.5">
              The correct answer is <strong className="text-ink">{correctAnswerText}</strong>.
            </p>
          )}
          {!correct && answerShownInline && <p className="text-sm text-ink/80 mt-0.5">The correct answers are marked in green above.</p>}
        </div>
        {pointsEarned !== undefined && pointsEarned > 0 && (
          <span className="shrink-0 rounded-full bg-heritage text-white text-xs font-semibold px-2.5 py-1">+{pointsEarned} pts</span>
        )}
      </div>

      <div className="px-5 py-5 space-y-4">
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#8a5f12] mb-1.5">
            <BookOpen className="w-4 h-4" aria-hidden /> Heritage insight
          </p>
          <h3 className="font-serif text-lg font-semibold text-ink leading-snug mb-2">{explanation.title}</h3>
          <p className="text-[15px] text-ink/85 leading-relaxed">{explanation.body}</p>
        </div>

        {explanation.trivia && (
          <div className="flex gap-3 rounded-xl bg-turmeric/10 border border-turmeric/25 p-3.5">
            <Lightbulb className="w-5 h-5 text-turmeric shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-[#8a5f12] mb-0.5">Did you know?</p>
              <p className="text-sm text-ink/75 leading-relaxed">{explanation.trivia}</p>
            </div>
          </div>
        )}

        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-maroon hover:text-terracotta hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
          Source: {source.label}
        </a>
      </div>
    </section>
  );
}
