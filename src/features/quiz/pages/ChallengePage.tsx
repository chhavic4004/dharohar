import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Copy, Swords, Timer, Users } from "lucide-react";
import { quizApi } from "../api/quizApi";
import { CATEGORY_META } from "../constants";
import { useApi } from "../hooks/useApi";
import { useI18n } from "../i18n";
import { Button, Card, ErrorState, Pill, Spinner, Toast, cx } from "../components/ui";
import { useCategoryLabel } from "./QuizHome";

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${Math.round(s % 60)}s` : `${Math.round(s)}s`;
}

/** Landing page for a shared challenge link: /quiz/challenge/:code */
export default function ChallengePage() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const catLabel = useCategoryLabel();
  const info = useApi(() => quizApi.challenge(code.toUpperCase()), [code]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (info.loading) return <Spinner label={t("loading")} />;
  if (info.error || !info.data) return <ErrorState error={info.error ?? new Error(t("notFound"))} onRetry={info.reload} />;
  const c = info.data;
  const meta = CATEGORY_META[c.category];
  const link = `${window.location.origin}/quiz/challenge/${c.code}`;
  const expires = new Date(c.expiresAt).toLocaleDateString(lang === "en" ? "en-IN" : `${lang}-IN`, { day: "numeric", month: "long" });

  const accept = async () => {
    setStarting(true);
    setError(null);
    try {
      const s = await quizApi.startSession({ mode: "challenge", challengeCode: c.code });
      navigate(`/quiz/play/${s.sessionId}`);
    } catch (e) {
      setError((e as Error).message);
      setStarting(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setToast(t("copied"));
    } catch {
      setToast(link);
    }
  };

  const players = [...c.players].sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds);

  return (
    <div className="bg-parchment pb-16">
      <div className="bg-ink text-parchment px-5 pt-10 pb-12 text-center">
        <Swords className="w-9 h-9 text-turmeric mx-auto mb-3" aria-hidden />
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">{c.isCreator ? t("modeChallenge") : t("challengeTitle", { name: c.creatorName })}</h1>
        <p className="text-parchment/70 text-sm mt-2 max-w-md mx-auto">
          {c.isCreator ? t("ownChallenge") : t("challengeBody", { n: c.totalQuestions, score: c.creatorScore })}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Pill className="bg-white/10 text-parchment">
            <meta.icon className="w-3.5 h-3.5" aria-hidden /> {catLabel(c.category)}
          </Pill>
          <Pill className="bg-white/10 text-parchment">{c.difficulty === "historian" ? t("historian") : t("seeker")}</Pill>
          <Pill className="bg-white/10 text-parchment font-mono tracking-widest">{c.code}</Pill>
        </div>
        <p className="text-[11px] text-parchment/50 mt-3">{t("expires", { date: expires })}</p>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-6 space-y-4">
        <Card className="p-5 space-y-3">
          {c.alreadyPlayed && !c.isCreator && <p className="text-sm text-ink/70 text-center">{t("alreadyPlayed")}</p>}
          {!c.isCreator && !c.alreadyPlayed && (
            <Button className="w-full py-4 font-serif text-base" loading={starting} onClick={accept}>
              <Swords className="w-4 h-4" aria-hidden /> {t("acceptChallenge")}
            </Button>
          )}
          <Button variant="secondary" className="w-full" onClick={copy}>
            <Copy className="w-4 h-4" aria-hidden /> {t("copyLink")}
          </Button>
          {error && <p className="text-sm text-alert text-center">{error}</p>}
        </Card>

        <Card className="p-5">
          <h2 className="font-serif font-semibold text-ink mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-maroon" aria-hidden /> {t("playersSoFar")}
          </h2>
          <ol className="divide-y divide-maroon/10">
            {players.map((p, i) => (
              <li key={`${p.displayName}-${i}`} className={cx("flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg", p.isYou && "bg-turmeric/10")}>
                <span className="w-6 text-center text-sm font-bold text-ink/50">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-ink truncate">
                  {p.displayName} {p.isYou && <span className="text-xs text-maroon">({t("you")})</span>}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-ink/50">
                  <Timer className="w-3.5 h-3.5" aria-hidden /> {fmtTime(p.timeSeconds)}
                </span>
                <span className="font-serif font-semibold text-maroon w-12 text-end">
                  {p.score}/{c.totalQuestions}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
