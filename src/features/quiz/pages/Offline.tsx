import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CloudUpload, Download, Play, Trash2, WifiOff } from "lucide-react";
import type { AnswerPayload, CorrectAnswer, Difficulty, OfflineQuestion, PublicQuestion, QuizCategoryParam } from "@shared/quiz-contract";
import { quizApi } from "../api/quizApi";
import { CATEGORY_IDS, CATEGORY_META } from "../constants";
import ExplanationCard from "../components/ExplanationCard";
import QuestionView, { MediaBlock } from "../components/QuestionView";
import { Button, Card, Pill, ProgressBar, cx } from "../components/ui";
import { useI18n } from "../i18n";
import { onPacksChange, readPacks, removePack, savePack, saveResult, syncPending, type StoredPack } from "../offline/storage";
import { useCategoryLabel } from "./QuizHome";

type Answer = { choice: number } | { order: number[] } | { pairs: number[] };

function useOnline() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

function usePacks() {
  const [packs, setPacks] = useState<StoredPack[]>(readPacks);
  useEffect(() => {
    const off = onPacksChange(() => setPacks(readPacks()));
    return () => {
      off();
    };
  }, []);
  return packs;
}

function shuffled<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Converts a stored question into the same shape the online player uses.
 * Option ids are the original indexes, so grading against the answer key
 * (and on the server during sync) needs no mapping.
 */
function toPublic(q: OfflineQuestion, lang: PublicQuestion["lang"]): PublicQuestion {
  const opts = (xs: string[] | undefined, mix: boolean) => {
    if (!xs) return undefined;
    const list = xs.map((text, id) => ({ id, text }));
    return mix ? shuffled(list) : list;
  };
  return {
    id: q.id,
    type: q.type,
    category: q.category,
    difficulty: "seeker",
    prompt: q.prompt,
    options: opts(q.options, q.type !== "true_false"),
    items: opts(q.items, true),
    left: opts(q.left, false),
    right: opts(q.right, true),
    media: q.media,
    lang,
  };
}

function isCorrect(q: OfflineQuestion, a: Answer): boolean {
  if ("choice" in q.answer && "choice" in a) return q.answer.choice === a.choice;
  if ("order" in q.answer && "order" in a) return a.order.length === q.answer.order.length && a.order.every((v, i) => v === i);
  if ("pairs" in q.answer && "pairs" in a) return a.pairs.length === q.answer.pairs.length && a.pairs.every((v, i) => v === i);
  return false;
}

function LocalPlayer({ stored, onExit }: { stored: StoredPack; onExit: () => void }) {
  const { t } = useI18n();
  const { pack } = stored;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: Answer; timeMs: number }[]>([]);
  const [submitted, setSubmitted] = useState<Answer | null>(null);
  const [shownAt, setShownAt] = useState(Date.now());
  const [done, setDone] = useState<number | null>(null);

  const q = pack.questions[index];
  const pub = useMemo(() => toPublic(q, pack.lang), [q, pack.lang]);
  const correctAnswer: CorrectAnswer | null = submitted ? q.answer : null;
  const correct = submitted ? isCorrect(q, submitted) : false;
  const score = answers.filter((a) => isCorrect(pack.questions.find((x) => x.id === a.questionId)!, a.answer)).length;

  const submit = (payload: AnswerPayload) => {
    if (submitted || "timedOut" in payload || "point" in payload) return;
    setSubmitted(payload);
    setAnswers((xs) => [...xs, { questionId: q.id, answer: payload, timeMs: Date.now() - shownAt }]);
  };

  const next = () => {
    if (index + 1 >= pack.questions.length) {
      saveResult(pack.packId, { answers, score, playedAt: new Date().toISOString() });
      setDone(score);
      void syncPending();
      return;
    }
    setIndex(index + 1);
    setSubmitted(null);
    setShownAt(Date.now());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done !== null) {
    return (
      <Card className="p-6 text-center space-y-4">
        <CheckCircle2 className="w-10 h-10 text-heritage mx-auto" aria-hidden />
        <p className="font-serif text-3xl font-bold text-ink">
          {done}/{pack.questions.length}
        </p>
        <p className="text-sm text-ink/65">{t("offlineResult", { score: done, total: pack.questions.length })}</p>
        <Button className="w-full" onClick={onExit}>
          {t("backToPacks")}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs text-ink/60">
        <button onClick={onExit} className="inline-flex items-center gap-1 hover:text-maroon cursor-pointer">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden /> {t("backToPacks")}
        </button>
        <span>{t("questionOf", { i: index + 1, n: pack.questions.length })}</span>
        <span>
          {t("score")} <strong className="font-serif text-base text-maroon">{score}</strong>
        </span>
      </div>
      <ProgressBar value={(index + (submitted ? 1 : 0)) / pack.questions.length} className="h-1.5" />
      {q.media && <MediaBlock media={q.media} />}
      <Card className="p-6">
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-ink leading-snug">{q.prompt}</h2>
      </Card>
      <QuestionView key={q.id} question={pub} correctAnswer={correctAnswer} submitted={submitted} onSubmit={submit} />
      {submitted && (
        <>
          <ExplanationCard
            correct={correct}
            correctAnswerText={q.correctAnswerText}
            explanation={q.explanation}
            source={q.source}
            answerShownInline={q.type === "chronology" || q.type === "match"}
          />
          <Button className="w-full py-4 font-serif text-base" onClick={next}>
            {index + 1 >= pack.questions.length ? t("finishPack") : t("next")} <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden />
          </Button>
        </>
      )}
    </div>
  );
}

/** Download quiz packs while online, play them anywhere, sync XP later. */
export default function Offline() {
  const { t, lang } = useI18n();
  const catLabel = useCategoryLabel();
  const online = useOnline();
  const packs = usePacks();
  const [category, setCategory] = useState<QuizCategoryParam>("mixed");
  const [difficulty, setDifficulty] = useState<Difficulty>("seeker");
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const locale = lang === "en" ? "en-IN" : `${lang}-IN`;

  const download = async () => {
    setBusy(true);
    setError(null);
    try {
      savePack(await quizApi.offlinePack(category, difficulty));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const active = packs.find((p) => p.pack.packId === playing);

  return (
    <div className="bg-parchment pb-16">
      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-5">
        {!online && (
          <p className="flex items-center gap-2 rounded-xl bg-ink text-parchment text-sm px-4 py-3" role="status">
            <WifiOff className="w-4 h-4 shrink-0" aria-hidden /> {t("youAreOffline")}
          </p>
        )}

        {active ? (
          <LocalPlayer stored={active} onExit={() => setPlaying(null)} />
        ) : (
          <>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
                <WifiOff className="w-7 h-7 text-maroon" aria-hidden /> {t("offlineTitle")}
              </h1>
              <p className="text-sm text-ink/65 mt-2 leading-relaxed">{t("offlineIntro")}</p>
              <p className="text-xs text-ink/50 mt-1">{t("offlineNote")}</p>
            </div>

            <Card className="p-5 space-y-4">
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("chooseCategory")}>
                {(["mixed", ...CATEGORY_IDS] as QuizCategoryParam[]).map((c) => {
                  const Icon = CATEGORY_META[c].icon;
                  return (
                    <button
                      key={c}
                      role="radio"
                      aria-checked={category === c}
                      onClick={() => setCategory(c)}
                      className={cx(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium cursor-pointer",
                        category === c ? "bg-maroon text-white" : "bg-white/70 text-maroon hover:bg-white",
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" aria-hidden /> {catLabel(c)}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2" role="radiogroup" aria-label={t("selectDifficulty")}>
                {(["seeker", "historian"] as const).map((d) => (
                  <button
                    key={d}
                    role="radio"
                    aria-checked={difficulty === d}
                    onClick={() => setDifficulty(d)}
                    className={cx(
                      "flex-1 rounded-xl border-2 px-3 py-2 text-sm font-semibold cursor-pointer",
                      difficulty === d ? "border-maroon bg-maroon/5 text-maroon" : "border-maroon/15 text-ink/60 hover:border-maroon/40",
                    )}
                  >
                    {t(d)}
                  </button>
                ))}
              </div>
              <Button className="w-full" onClick={download} loading={busy} disabled={!online}>
                <Download className="w-4 h-4" aria-hidden /> {t("downloadPack")}
              </Button>
              {!online && <p className="text-xs text-ink/50 text-center">{t("offlineUnavailable")}</p>}
              {error && <p className="text-sm text-alert text-center">{error}</p>}
            </Card>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif font-semibold text-ink">{t("yourPacks")}</h2>
                {online && packs.some((p) => p.result && !p.synced) && (
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5"
                    loading={syncing}
                    onClick={async () => {
                      setSyncing(true);
                      await syncPending();
                      setSyncing(false);
                    }}
                  >
                    <CloudUpload className="w-4 h-4" aria-hidden /> {t("syncNow")}
                  </Button>
                )}
              </div>
              {packs.length === 0 ? (
                <Card className="p-6 text-center text-sm text-ink/60">{t("noPacks")}</Card>
              ) : (
                <ul className="space-y-3">
                  {packs.map((p) => {
                    const Icon = CATEGORY_META[p.pack.category].icon;
                    const expired = Date.parse(p.pack.expiresAt) < Date.now();
                    return (
                      <Card key={p.pack.packId} className="p-4 flex flex-wrap items-center gap-3">
                        <Icon className="w-6 h-6 text-maroon shrink-0" aria-hidden />
                        <div className="flex-1 min-w-[160px]">
                          <p className="text-sm font-semibold text-ink">
                            {catLabel(p.pack.category)} <span className="text-ink/50 font-normal">· {t(p.pack.difficulty)}</span>
                          </p>
                          <p className="text-xs text-ink/50">
                            {t("nQuestions", { n: p.pack.questions.length })} ·{" "}
                            {t("packExpires", { date: new Date(p.pack.expiresAt).toLocaleDateString(locale, { day: "numeric", month: "short" }) })}
                          </p>
                          {p.synced ? (
                            <Pill className="bg-heritage/10 text-heritage mt-1.5">{t("synced", { xp: p.synced.xpEarned })}</Pill>
                          ) : p.result ? (
                            <Pill className="bg-turmeric/15 text-[#8a5f12] mt-1.5">
                              {p.result.score}/{p.pack.questions.length} · {t("playedWaiting")}
                            </Pill>
                          ) : expired ? (
                            <Pill className="bg-ink/10 text-ink/60 mt-1.5">{t("expired")}</Pill>
                          ) : null}
                        </div>
                        {!p.result && !expired && (
                          <Button className="px-4 py-2" onClick={() => setPlaying(p.pack.packId)}>
                            <Play className="w-4 h-4" aria-hidden /> {t("play")}
                          </Button>
                        )}
                        <button
                          onClick={() => removePack(p.pack.packId)}
                          className="p-2 rounded-lg text-ink/50 hover:text-alert hover:bg-alert/10 cursor-pointer"
                          aria-label={t("deletePack")}
                          title={t("deletePack")}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </button>
                      </Card>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
