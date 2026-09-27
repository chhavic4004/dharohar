import { useState } from "react";
import { heritageName } from "../heritageText";
import { useNavigate, useParams } from "react-router";
import { quizApi } from "../api/quizApi";
import { useApi } from "../hooks/useApi";
import { useI18n } from "../i18n";
import { HeritageLinks } from "../components/ExplanationCard";
import { Button, Card, ErrorState, Spinner } from "../components/ui";

/** A short quiz about one tradition or site: /quiz/heritage/:id. Linked from archive pages. */
export default function HeritageQuiz() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const info = useApi(() => quizApi.heritage(id), [id, lang]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (info.loading) return <Spinner label={t("loading")} />;
  if (info.error || !info.data) return <ErrorState error={info.error ?? new Error(t("notFound"))} onRetry={info.reload} />;
  const { heritage: h, questionCount, directCount } = info.data;
  const name = heritageName(h, lang);

  const start = async () => {
    setStarting(true);
    setError(null);
    try {
      const s = await quizApi.startSession({ mode: "heritage", heritageId: h.id });
      navigate(`/quiz/play/${s.sessionId}`);
    } catch (e) {
      setError((e as Error).message);
      setStarting(false);
    }
  };

  return (
    <div className="bg-parchment pb-16">
      <div className="max-w-xl mx-auto px-4 pt-8 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-terracotta font-semibold">{t("mode_heritage")}</p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1">{t("heritageQuizTitle", { name })}</h1>
          {lang === "en" && h.hindi && <p className="font-devanagari text-maroon/80 mt-0.5">{h.hindi}</p>}
          <p className="text-sm text-ink/65 mt-2">
            {directCount < questionCount ? t("heritageQuizIntroMixed", { n: questionCount, d: directCount }) : t("heritageQuizIntro", { n: questionCount })}          </p>
        </div>

        <Card className="p-5">
          <HeritageLinks links={[h]} />
        </Card>

        <Card className="p-5 space-y-4">
          <Button className="w-full py-4 font-serif text-base" loading={starting} onClick={start}>
            {t("startHeritage")}
          </Button>
          {error && <p className="text-sm text-alert text-center">{error}</p>}
        </Card>
      </div>
    </div>
  );
}
