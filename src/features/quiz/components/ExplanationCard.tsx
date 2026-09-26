import { Link } from "react-router";
import { BookOpen, CheckCircle2, Clock, ExternalLink, HandHeart, Lightbulb, MapPin, PlayCircle, Square, Volume2, XCircle } from "lucide-react";
import type { Explanation, HeritageLink, Source } from "@shared/quiz-contract";
import { ARCHIVE_LINKS } from "../constants";
import { useSpeech } from "../hooks/useSpeech";
import { useI18n } from "../i18n";
import { cx } from "./ui";

interface Props {
  correct: boolean;
  timedOut?: boolean;
  correctAnswerText: string;
  explanation: Explanation;
  source: Source;
  links?: HeritageLink[];
  pointsEarned?: number;
  /** Chronology, match and map questions already mark the correct answer inline */
  answerShownInline?: boolean;
}

const BAND_STYLE = {
  Stable: "bg-heritage/10 text-heritage border-heritage/30",
  Vulnerable: "bg-turmeric/15 text-[#8a5f12] border-turmeric/40",
  Critical: "bg-alert/10 text-alert border-alert/30",
} as const;

/** Links from an answer into the archive, the map, and a quiz about that tradition. */
export function HeritageLinks({ links, compact }: { links: HeritageLink[]; compact?: boolean }) {
  const { t, lang } = useI18n();
  if (!links.length) return null;
  const atRisk = links.find((l) => l.hvs && l.hvs.band !== "Stable");
  return (
    <div className="space-y-2.5">
      {links.slice(0, compact ? 2 : 4).map((l) => (
        <div key={l.id} className="rounded-xl border border-maroon/10 bg-parchment/50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm text-ink me-auto">
              {lang === "hi" && l.hindi ? l.hindi : l.name}
              {l.state && <span className="font-normal text-ink/50"> · {l.state}</span>}
            </p>
            {l.hvs && (
              <span className={cx("text-[11px] font-semibold rounded-full border px-2 py-0.5", BAND_STYLE[l.hvs.band])} title={l.hvs.isSample ? t("hvsSample") : undefined}>
                {t("hvs", { score: l.hvs.score, band: t(`band_${l.hvs.band}`) })}
                {l.hvs.isSample && <span className="font-normal opacity-70"> ({t("hvsSample")})</span>}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
            <Link to={ARCHIVE_LINKS.archive(l)} className="inline-flex items-center gap-1 text-maroon hover:underline">
              <BookOpen className="w-3.5 h-3.5" aria-hidden /> {t("exploreArchive")}
            </Link>
            {l.location && (
              <Link to={ARCHIVE_LINKS.map(l)} className="inline-flex items-center gap-1 text-maroon hover:underline">
                <MapPin className="w-3.5 h-3.5" aria-hidden /> {t("viewOnMap")}
              </Link>
            )}
            {!compact && (
              <Link to={ARCHIVE_LINKS.quiz(l)} className="inline-flex items-center gap-1 text-maroon hover:underline">
                <PlayCircle className="w-3.5 h-3.5" aria-hidden /> {t("quizOnThis")}
              </Link>
            )}
            {l.archive?.recordingUrl && (
              <a href={l.archive.recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-maroon hover:underline">
                <Volume2 className="w-3.5 h-3.5" aria-hidden /> Recording
              </a>
            )}
          </div>
        </div>
      ))}
      {atRisk && !compact && (
        <div className="flex items-start gap-3 rounded-xl bg-maroon text-white p-3.5">
          <HandHeart className="w-5 h-5 shrink-0 mt-0.5 text-turmeric" aria-hidden />
          <div className="text-sm">
            <p>{t("helpPreserve")}</p>
            <Link to={ARCHIVE_LINKS.preserve(atRisk)} className="inline-block mt-1.5 font-semibold underline text-turmeric">
              {t("preserveStory")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The explanation shown under the options once an answer is checked.
 * Always fully visible, never collapsed, so every player gets the full context.
 */
export default function ExplanationCard({ correct, timedOut, correctAnswerText, explanation, source, links = [], pointsEarned, answerShownInline }: Props) {
  const { t } = useI18n();
  const { speak, stop, speaking, supported } = useSpeech();
  const status = timedOut
    ? { icon: Clock, title: t("timeUp"), tone: "text-alert", bg: "bg-alert/10 border-alert/30" }
    : correct
      ? { icon: CheckCircle2, title: t("correct"), tone: "text-heritage", bg: "bg-heritage/10 border-heritage/30" }
      : { icon: XCircle, title: t("notQuite"), tone: "text-terracotta", bg: "bg-terracotta/10 border-terracotta/30" };
  const Icon = status.icon;
  const readText = [explanation.title, explanation.body, explanation.trivia].filter(Boolean).join(". ");

  return (
    <section aria-live="polite" className="rounded-2xl border border-turmeric/40 overflow-hidden shadow-sm bg-white/85 animate-[fadeIn_0.3s_ease-out]">
      <div className={cx("flex items-start gap-3 px-5 py-4 border-b", status.bg)}>
        <Icon className={cx("w-6 h-6 shrink-0 mt-0.5", status.tone)} aria-hidden />
        <div className="flex-1 min-w-0">
          <p className={cx("font-serif font-semibold text-base", status.tone)}>{status.title}</p>
          {!correct && !answerShownInline && <p className="text-sm text-ink/80 mt-0.5">{t("correctAnswerIs", { a: correctAnswerText })}</p>}
          {!correct && answerShownInline && <p className="text-sm text-ink/80 mt-0.5">{t("markedAbove")}</p>}
        </div>
        {pointsEarned !== undefined && pointsEarned > 0 && (
          <span className="shrink-0 rounded-full bg-heritage text-white text-xs font-semibold px-2.5 py-1">{t("pts", { n: pointsEarned })}</span>
        )}
      </div>

      <div className="px-5 py-5 space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#8a5f12]">
              <BookOpen className="w-4 h-4" aria-hidden /> {t("heritageInsight")}
            </p>
            {supported && (
              <button
                type="button"
                onClick={() => (speaking ? stop() : speak(readText))}
                className="inline-flex items-center gap-1.5 rounded-full border border-maroon/20 px-2.5 py-1 text-xs text-maroon hover:bg-maroon/5 cursor-pointer"
              >
                {speaking ? <Square className="w-3.5 h-3.5" aria-hidden /> : <Volume2 className="w-3.5 h-3.5" aria-hidden />}
                {speaking ? t("stopReading") : t("readAloud")}
              </button>
            )}
          </div>
          <h3 className="font-serif text-lg font-semibold text-ink leading-snug mb-2">{explanation.title}</h3>
          <p className="text-[15px] text-ink/85 leading-relaxed">{explanation.body}</p>
        </div>

        {explanation.trivia && (
          <div className="flex gap-3 rounded-xl bg-turmeric/10 border border-turmeric/25 p-3.5">
            <Lightbulb className="w-5 h-5 text-turmeric shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-[#8a5f12] mb-0.5">{t("didYouKnow")}</p>
              <p className="text-sm text-ink/75 leading-relaxed">{explanation.trivia}</p>
            </div>
          </div>
        )}

        <HeritageLinks links={links} />

        <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-maroon hover:text-terracotta hover:underline">
          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
          {t("source")}: {source.label}
        </a>
      </div>
    </section>
  );
}
