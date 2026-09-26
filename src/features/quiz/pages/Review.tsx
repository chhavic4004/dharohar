import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { CheckCircle2, Clock, RotateCcw, Sprout } from "lucide-react";
import { quizApi } from "../api/quizApi";
import { useApi } from "../hooks/useApi";
import { useI18n } from "../i18n";
import { Button, Card, ErrorState, Spinner } from "../components/ui";

const STEPS = [1, 3, 7, 14, 30];

/** Spaced repetition hub: missed questions come back on a Leitner schedule. */
export default function Review() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const profile = useApi(() => quizApi.profile());
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (profile.loading) return <Spinner label={t("loading")} />;
  if (profile.error || !profile.data) return <ErrorState error={profile.error ?? new Error(t("notFound"))} onRetry={profile.reload} />;
  const r = profile.data.review;
  const empty = r.due + r.learning + r.mastered === 0;
  const nextWhen = r.nextDueAt
    ? new Date(r.nextDueAt).toLocaleString(lang === "en" ? "en-IN" : `${lang}-IN`, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : null;

  const start = async () => {
    setStarting(true);
    setError(null);
    try {
      const s = await quizApi.startSession({ mode: "review" });
      navigate(`/quiz/play/${s.sessionId}`);
    } catch (e) {
      setError((e as Error).message);
      setStarting(false);
    }
  };

  return (
    <div className="bg-parchment pb-16">
      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <RotateCcw className="w-7 h-7 text-terracotta" aria-hidden /> {t("reviewTitle")}
          </h1>
          <p className="text-sm text-ink/65 mt-2 leading-relaxed">{t("reviewIntro")}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <Clock className="w-5 h-5 text-terracotta mx-auto mb-1" aria-hidden />
            <p className="font-serif text-2xl font-bold text-ink">{r.due}</p>
            <p className="text-xs text-ink/55">{t("dueNow")}</p>
          </Card>
          <Card className="p-4 text-center">
            <Sprout className="w-5 h-5 text-maroon mx-auto mb-1" aria-hidden />
            <p className="font-serif text-2xl font-bold text-ink">{r.learning}</p>
            <p className="text-xs text-ink/55">{t("learning")}</p>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-heritage mx-auto mb-1" aria-hidden />
            <p className="font-serif text-2xl font-bold text-ink">{r.mastered}</p>
            <p className="text-xs text-ink/55">{t("mastered")}</p>
          </Card>
        </div>

        {/* Schedule strip */}
        <Card className="p-5">
          <ol className="flex items-center justify-between gap-1" aria-label="Review schedule in days">
            {STEPS.map((d, i) => (
              <li key={d} className="flex-1 flex items-center">
                <span className="w-10 h-10 shrink-0 rounded-full bg-maroon/10 text-maroon text-xs font-bold flex items-center justify-center">{d}d</span>
                {i < STEPS.length - 1 && <span className="flex-1 h-0.5 bg-maroon/15 mx-1" aria-hidden />}
              </li>
            ))}
            <li className="shrink-0">
              <CheckCircle2 className="w-8 h-8 text-heritage" aria-hidden />
            </li>
          </ol>
        </Card>

        {empty ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-ink/65 mb-4">{t("nothingYet")}</p>
            <Link to="/quiz" className="text-maroon font-semibold underline">
              {t("playFull")}
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            <Button className="w-full py-4 font-serif text-base" disabled={r.due === 0} loading={starting} onClick={start}>
              {r.due > 0 ? t("startReview", { n: Math.min(r.due, 10) }) : t("reviewNone")}
            </Button>
            {r.due === 0 && nextWhen && <p className="text-xs text-center text-ink/55">{t("nextDue", { when: nextWhen })}</p>}
            {error && <p className="text-sm text-alert text-center">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
