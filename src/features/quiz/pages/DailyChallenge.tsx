import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Award, CalendarDays, Coins, Flame, Trophy } from "lucide-react";
import type { AnswerPayload, DailyAnswerResult } from "@shared/quiz-contract";
import { quizApi } from "../api/quizApi";
import { CATEGORY_META } from "../constants";
import ExplanationCard from "../components/ExplanationCard";
import QuestionView from "../components/QuestionView";
import { Card, ErrorState, Spinner, cx } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { useI18n } from "../i18n";
import { useCategoryLabel } from "./QuizHome";
import { localeOf } from "../../../lib/language";

function useCountdown(target: string | undefined) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  if (!target) return "";
  const ms = Math.max(0, Date.parse(target) - now);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function DailyChallenge() {
  const { t, lang } = useI18n();
  const catLabel = useCategoryLabel();
  const daily = useApi(() => quizApi.daily(), [lang]);
  const [submitted, setSubmitted] = useState<AnswerPayload | null>(null);
  const [answer, setAnswer] = useState<DailyAnswerResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const countdown = useCountdown(daily.data?.nextResetAt);

  if (daily.loading) return <Spinner label={t("fetchingDaily")} />;
  if (daily.error || !daily.data) return <ErrorState error={daily.error ?? new Error("Not found")} onRetry={daily.reload} />;

  const d = daily.data;
  const result = answer ?? d.result;
  const streak = result?.streak ?? d.streak;
  const longest = Math.max(result?.longestStreak ?? 0, d.longestStreak);
  const meta = CATEGORY_META[d.question.category];
  const dateLabel = new Date(`${d.date}T00:00:00+05:30`).toLocaleDateString(localeOf(lang), { weekday: "long", day: "numeric", month: "long" });

  const submit = async (payload: AnswerPayload) => {
    setBusy(true);
    setError(null);
    setSubmitted(payload);
    try {
      setAnswer(await quizApi.answerDaily(payload));
    } catch (e) {
      setSubmitted(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-parchment pb-16">
      <div className="bg-ink text-parchment px-5 pt-10 pb-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 30%, #C9622E 0%, transparent 60%)" }} />
        <div className="relative">
          <p className="text-turmeric text-xs tracking-[0.3em] uppercase mb-2 flex items-center justify-center gap-2">
            <CalendarDays className="w-4 h-4" aria-hidden /> {t("potd")}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">{dateLabel}</h1>
          {lang === "en" && <p className="font-devanagari text-terracotta mt-1">{t("todaysQuestion")}</p>}
          <div className="flex justify-center gap-6 mt-6">
            <div>
              <p className="flex items-center justify-center gap-1.5 text-3xl font-serif font-bold text-white">
                <Flame className={cx("w-7 h-7", streak > 0 ? "text-terracotta" : "text-parchment/30")} aria-hidden />
                {streak}
              </p>
              <p className="text-xs text-parchment/60">{t("currentStreak")}</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1.5 text-3xl font-serif font-bold text-white">
                <Trophy className="w-6 h-6 text-turmeric" aria-hidden />
                {longest}
              </p>
              <p className="text-xs text-parchment/60">{t("longestStreak")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-5 relative space-y-5">
        {!result && d.streakAtRisk && (
          <div className="rounded-xl bg-terracotta text-white text-sm px-4 py-3 shadow-md">
            {t("streakEnds", { n: d.streak })}
          </div>
        )}

        <Card className="p-6">
          <p className="flex items-center gap-2 text-maroon text-xs uppercase tracking-widest font-medium mb-3">
            <meta.icon className="w-4 h-4" aria-hidden /> {catLabel(d.question.category)}
          </p>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-ink leading-snug">{d.question.prompt}</h2>
        </Card>

        <QuestionView
          question={d.question}
          correctAnswer={result?.correctAnswer ?? null}
          submitted={answer ? submitted : null}
          busy={busy}
          onSubmit={submit}
        />
        {error && <p className="text-sm text-alert text-center">{error}</p>}

        {result && (
          <>
            {!answer && (
              <p className="text-sm text-ink/60 text-center">
                {t("youAnswered")}: <strong className={result.correct ? "text-heritage" : "text-terracotta"}>{result.yourAnswerText}</strong>
              </p>
            )}
            <ExplanationCard
              correct={result.correct}
              correctAnswerText={result.correctAnswerText}
              explanation={result.explanation}
              source={result.source}
              links={result.links}
              answerShownInline={d.question.type === "chronology" || d.question.type === "match" || d.question.type === "map_pin"}
            />
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-around gap-4 text-center">
                <div>
                  <p className="flex items-center gap-1 justify-center font-serif text-xl font-semibold text-[#8a5f12]">
                    <Coins className="w-5 h-5 text-turmeric" aria-hidden />+{result.coinsEarned}
                  </p>
                  <p className="text-xs text-ink/50">{t("coins")}</p>
                </div>
                <div>
                  <p className="font-serif text-xl font-semibold text-maroon">+{result.xpEarned}</p>
                  <p className="text-xs text-ink/50">XP</p>
                </div>
                <div>
                  <p className="font-serif text-xl font-semibold text-ink">{countdown}</p>
                  <p className="text-xs text-ink/50">{t("untilNext")}</p>
                </div>
              </div>
              {result.newBadges.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {result.newBadges.map((b) => (
                    <span key={b.id} className="inline-flex items-center gap-1.5 rounded-full bg-turmeric/15 text-[#8a5f12] text-xs font-semibold px-3 py-1.5">
                      <Award className="w-3.5 h-3.5" aria-hidden /> {t("newBadge", { name: lang === "hi" ? b.hindi : b.label })}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-ink/50 text-center mt-4">
                {t("dailyRule")}{" "}
                <Link to="/quiz" className="text-maroon underline">
                  {t("playFull")}
                </Link>{" "}
                {t("whileWait")}
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
