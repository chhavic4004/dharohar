import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowRight, Flame, LogOut, Timer } from "lucide-react";
import { HISTORIAN_SECONDS, type AnswerPayload, type AnswerResult, type NextQuestionResponse } from "@shared/quiz-contract";
import { ApiRequestError } from "../api/client";
import { quizApi } from "../api/quizApi";
import { CATEGORY_META } from "../constants";
import ExplanationCard from "../components/ExplanationCard";
import QuestionView from "../components/QuestionView";
import { Button, Card, ErrorState, Modal, ProgressBar, Spinner, cx } from "../components/ui";

export default function QuizPlay() {
  const { sessionId = "" } = useParams();
  const navigate = useNavigate();

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

  const loadCurrent = useCallback(async () => {
    setError(null);
    try {
      const next = await quizApi.currentQuestion(sessionId);
      setCurrent(next);
      setResult(null);
      setSubmitted(null);
      submittedRef.current = false;
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
  }, [sessionId, finish]);

  useEffect(() => {
    loadCurrent();
  }, [loadCurrent]);

  const submit = useCallback(
    async (answer: AnswerPayload) => {
      if (!current || submittedRef.current) return;
      submittedRef.current = true;
      setBusy(true);
      setSubmitted(answer);
      try {
        const res = await quizApi.answer(sessionId, current.question.id, answer);
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
    const t = setTimeout(() => setTimeLeft((s) => (s === null ? s : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, result, busy, submit]);

  if (finishing) return <Spinner label="Scoring your answers" />;
  if (error && !current) return <ErrorState error={error} onRetry={loadCurrent} />;
  if (!current) return <Spinner label="Loading your question" />;

  const { question, index, totalQuestions } = current;
  const meta = CATEGORY_META[question.category];
  const isHistorian = question.difficulty === "historian";
  const answeredCount = result ? result.answeredCount : index;
  const lowTime = timeLeft !== null && timeLeft <= 10;

  return (
    <div className="bg-parchment min-h-[70vh] pb-16">
      {/* Stats bar */}
      <div className="sticky top-16 z-40 bg-parchment/95 backdrop-blur-sm border-b border-maroon/15 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 mb-2">
          <button
            onClick={() => setConfirmExit(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-ink/60 hover:text-maroon cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden /> Exit
          </button>
          <span className="text-xs text-ink/60">
            Question <strong className="text-ink">{index + 1}</strong> of {totalQuestions}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink/50">
              Score <strong className="font-serif text-base text-maroon">{score}</strong>
            </span>
            <span className={cx("inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5", streak >= 2 ? "bg-turmeric text-white" : "text-ink/50")}>
              <Flame className="w-3.5 h-3.5" aria-hidden />
              {streak}
              <span className="sr-only">answer streak</span>
            </span>
          </div>
        </div>
        <ProgressBar value={answeredCount / totalQuestions} className="max-w-2xl mx-auto h-1.5" label="Quiz progress" />
        {isHistorian && !result && timeLeft !== null && (
          <div className="max-w-2xl mx-auto mt-2 flex items-center gap-2">
            <Timer className={cx("w-4 h-4", lowTime ? "text-alert" : "text-terracotta")} aria-hidden />
            <ProgressBar value={timeLeft / HISTORIAN_SECONDS} color={lowTime ? "#A83E22" : "#C9622E"} className="flex-1 h-1.5" label="Time left" />
            <span className={cx("text-xs tabular-nums w-8 text-right", lowTime ? "text-alert font-bold" : "text-ink/60")} aria-live={lowTime ? "assertive" : "off"}>
              {timeLeft}s
            </span>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <Card className="p-6">
          <p className="flex items-center gap-2 text-maroon text-xs uppercase tracking-widest font-medium mb-3">
            <meta.icon className="w-4 h-4" aria-hidden />
            {meta.label}
            {isHistorian && <span className="ml-auto normal-case tracking-normal text-terracotta">Historian</span>}
          </p>
          <h1 className="font-serif text-xl sm:text-2xl font-semibold text-ink leading-snug">{question.prompt}</h1>
        </Card>

        <QuestionView
          question={question}
          correctAnswer={result?.correctAnswer ?? null}
          submitted={submitted}
          busy={busy}
          onSubmit={submit}
        />

        {error && current && <p className="text-sm text-alert text-center">{error.message}</p>}

        {result && (
          <>
            <ExplanationCard
              correct={result.correct}
              timedOut={result.timedOut}
              correctAnswerText={result.correctAnswerText}
              explanation={result.explanation}
              source={result.source}
              answerShownInline={question.type === "chronology" || question.type === "match"}
              pointsEarned={result.points.total}
            />
            <Button className="w-full py-4 font-serif text-base" onClick={result.isLast ? finish : loadCurrent}>
              {result.isLast ? "See my results" : "Next question"} <ArrowRight className="w-4 h-4" aria-hidden />
            </Button>
          </>
        )}
      </div>

      <Modal open={confirmExit} onClose={() => setConfirmExit(false)} title="Leave this quiz?">
        <p className="text-sm text-ink/70 mb-5">
          Your answers so far will not count towards points or coins unless you finish the quiz.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => setConfirmExit(false)}>
            Keep playing
          </Button>
          <Button onClick={() => navigate("/quiz")}>Leave quiz</Button>
        </div>
      </Modal>
    </div>
  );
}
