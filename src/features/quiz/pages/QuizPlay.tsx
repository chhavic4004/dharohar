import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowRight, Flame, Info, LogOut, Square, Timer, Volume2 } from "lucide-react";
import { HISTORIAN_SECONDS, type AnswerPayload, type AnswerResult, type NextQuestionResponse } from "@shared/quiz-contract";
import { ApiRequestError } from "../api/client";
import { quizApi } from "../api/quizApi";
import { CATEGORY_META } from "../constants";
import ExplanationCard from "../components/ExplanationCard";
import QuestionView, { MediaBlock } from "../components/QuestionView";
import { Button, Card, ErrorState, Modal, ProgressBar, Spinner, cx } from "../components/ui";
import { useSpeech } from "../hooks/useSpeech";
import { useI18n } from "../i18n";
import { useCategoryLabel } from "./QuizHome";

export default function QuizPlay() {
  const { sessionId = "" } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const catLabel = useCategoryLabel();
  const { speak, stop, speaking, supported } = useSpeech();

  const [current, setCurrent] = useState<NextQuestionResponse | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [submitted, setSubmitted] = useState<AnswerPayload | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [busy, setBusy] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const submittedRef = useRef(false);
  const answeredRef = useRef(false);

  const finish = useCallback(async () => {
    setFinishing(true);
    try {
      const res = await quizApi.complete(sessionId);
      navigate(`/quiz/results/${res.attemptId}`, { replace: true, state: res });
    } catch (e) {
      setError(e as Error);
      setFinishing(false);
    }
  }, [navigate, sessionId]);

  const loadCurrent = useCallback(
    async (keepTimer = false) => {
      setError(null);
      stop();
      try {
        const next = await quizApi.currentQuestion(sessionId);
        setCurrent(next);
        if (keepTimer) return;
        setResult(null);
        setSubmitted(null);
        submittedRef.current = false;
        answeredRef.current = false;
        if (next.question.difficulty === "historian") {
          const elapsed = (Date.now() - Date.parse(next.servedAt)) / 1000;
          const left = HISTORIAN_SECONDS - elapsed;
          // Guard against a badly set device clock
          setTimeLeft(left > HISTORIAN_SECONDS || left < -5 ? HISTORIAN_SECONDS : Math.max(0, Math.round(left)));
        } else {
          setTimeLeft(null);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        if (e instanceof ApiRequestError && e.code === "quiz_finished") return finish();
        setError(e as Error);
      }
    },
    [sessionId, finish, stop],
  );

  useEffect(() => {
    loadCurrent();
  }, [loadCurrent]);

  // Switching language re-fetches the unanswered question in the new language.
  const firstLang = useRef(lang);
  useEffect(() => {
    if (firstLang.current === lang) return;
    firstLang.current = lang;
    if (!answeredRef.current) loadCurrent(true);
  }, [lang, loadCurrent]);

  const submit = useCallback(
    async (answer: AnswerPayload) => {
      if (!current || submittedRef.current) return;
      submittedRef.current = true;
      setBusy(true);
      setSubmitted(answer);
      try {
        const res = await quizApi.answer(sessionId, current.question.id, answer);
        answeredRef.current = true;
        setResult(res);
        setScore(res.score);
        setStreak(res.streak);
      } catch (e) {
        submittedRef.current = false;
        setSubmitted(null);
        setError(e as Error);
      } finally {
        setBusy(false);
      }
    },
    [current, sessionId],
  );

  // Historian countdown
  useEffect(() => {
    if (timeLeft === null || result || busy) return;
    if (timeLeft <= 0) {
      submit({ timedOut: true });
      return;
    }
    const tm = setTimeout(() => setTimeLeft((s) => (s === null ? s : s - 1)), 1000);
    return () => clearTimeout(tm);
  }, [timeLeft, result, busy, submit]);

  if (finishing) return <Spinner label={t("scoring")} />;
  if (error && !current) return <ErrorState error={error} onRetry={() => loadCurrent()} />;
  if (!current) return <Spinner label={t("loadingQuestion")} />;

  const { question, index, totalQuestions } = current;
  const meta = CATEGORY_META[question.category];
  const isHistorian = question.difficulty === "historian";
  const answeredCount = result ? result.answeredCount : index;
  const lowTime = timeLeft !== null && timeLeft <= 10;
  const readText = [question.prompt, ...(question.options ?? question.items ?? question.left ?? []).map((o) => o.text)].join(". ");

  return (
    <div className="bg-parchment min-h-[70vh] pb-16">
      {/* Stats bar */}
      <div className="sticky top-16 z-40 bg-parchment/95 backdrop-blur-sm border-b border-maroon/15 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 mb-2">
          <button onClick={() => setConfirmExit(true)} className="flex items-center gap-1.5 text-xs font-medium text-ink/60 hover:text-maroon cursor-pointer">
            <LogOut className="w-4 h-4 rtl:rotate-180" aria-hidden /> {t("exit")}
          </button>
          <span className="text-xs text-ink/60">{t("questionOf", { i: index + 1, n: totalQuestions })}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink/50">
              {t("score")} <strong className="font-serif text-base text-maroon">{score}</strong>
            </span>
            <span className={cx("inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5", streak >= 2 ? "bg-turmeric text-white" : "text-ink/50")}>
              <Flame className="w-3.5 h-3.5" aria-hidden />
              {streak}
              <span className="sr-only">{t("currentStreak")}</span>
            </span>
          </div>
        </div>
        <ProgressBar value={answeredCount / totalQuestions} className="max-w-2xl mx-auto h-1.5" label={t("a11yQuizProgress")} />
        {isHistorian && !result && timeLeft !== null && (
          <div className="max-w-2xl mx-auto mt-2 flex items-center gap-2">
            <Timer className={cx("w-4 h-4", lowTime ? "text-alert" : "text-terracotta")} aria-hidden />
            <ProgressBar value={timeLeft / HISTORIAN_SECONDS} color={lowTime ? "#A83E22" : "#C9622E"} className="flex-1 h-1.5" label={t("timeLeft")} />
            <span className={cx("text-xs tabular-nums w-8 text-end", lowTime ? "text-alert font-bold" : "text-ink/60")} aria-live={lowTime ? "assertive" : "off"}>
              {timeLeft}s
            </span>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {question.lang !== lang && lang !== "en" && (
          <p className="flex items-start gap-2 rounded-xl bg-turmeric/10 border border-turmeric/30 text-xs text-[#6b4a0e] px-3 py-2">
            <Info className="w-4 h-4 shrink-0" aria-hidden /> {t("contentFallback")}
          </p>
        )}

        {question.media && <MediaBlock media={question.media} />}

        <Card className="p-6">
          <div className="flex items-center gap-2 text-maroon text-xs uppercase tracking-widest font-medium mb-3">
            <meta.icon className="w-4 h-4" aria-hidden />
            {catLabel(question.category)}
            {isHistorian && <span className="normal-case tracking-normal text-terracotta">· {t("historian")}</span>}
            {supported && (
              <button
                type="button"
                onClick={() => (speaking ? stop() : speak(readText, question.lang))}
                className="ms-auto inline-flex items-center gap-1 normal-case tracking-normal rounded-full border border-maroon/20 px-2.5 py-1 hover:bg-maroon/5 cursor-pointer"
              >
                {speaking ? <Square className="w-3.5 h-3.5" aria-hidden /> : <Volume2 className="w-3.5 h-3.5" aria-hidden />}
                {speaking ? t("stopReading") : t("readAloud")}
              </button>
            )}
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-semibold text-ink leading-snug">{question.prompt}</h1>
        </Card>

        <QuestionView question={question} correctAnswer={result?.correctAnswer ?? null} submitted={submitted} busy={busy} onSubmit={submit} />

        {error && current && <p className="text-sm text-alert text-center">{error.message}</p>}

        {result && (
          <>
            <ExplanationCard
              correct={result.correct}
              timedOut={result.timedOut}
              correctAnswerText={result.correctAnswerText}
              explanation={result.explanation}
              source={result.source}
              links={result.links}
              pointsEarned={result.points.total}
              answerShownInline={question.type === "chronology" || question.type === "match" || question.type === "map_pin"}
            />
            <Button className="w-full py-4 font-serif text-base" onClick={result.isLast ? finish : () => loadCurrent()}>
              {result.isLast ? t("seeResults") : t("nextQuestion")} <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden />
            </Button>
          </>
        )}
      </div>

      <Modal open={confirmExit} onClose={() => setConfirmExit(false)} title={t("leaveTitle")}>
        <p className="text-sm text-ink/70 mb-5">{t("leaveBody")}</p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => setConfirmExit(false)}>
            {t("keepPlaying")}
          </Button>
          <Button onClick={() => navigate("/quiz")}>{t("leaveQuiz")}</Button>
        </div>
      </Modal>
    </div>
  );
}
