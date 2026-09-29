import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  Award,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Flame,
  Gift,
  LayoutGrid,
  RotateCcw,
  Share2,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import type { QuizResult } from "@shared/quiz-contract";
import { quizApi } from "../api/quizApi";
import { CATEGORY_META } from "../constants";
import { HeritageLinks } from "../components/ExplanationCard";
import { Button, Card, CoinBadge, ErrorState, ProgressBar, Spinner, Toast, cx } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { useI18n, useDisplayName } from "../i18n";
import { useCategoryLabel, useLevelName } from "./QuizHome";

function ScoreRing({ score, total }: { score: number; total: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = total ? score / total : 0;
  return (
    <svg viewBox="0 0 120 120" className="w-36 h-36" role="img" aria-label={`${score} / ${total}`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="#fff"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
      <text x="60" y="58" textAnchor="middle" fontSize="30" fontWeight="700" fill="#fff" style={{ fontFamily: "var(--font-serif)" }}>
        {score}
      </text>
      <text x="60" y="80" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.75)">
        / {total}
      </text>
    </svg>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="text-center">
      <Icon className="w-4 h-4 text-maroon mx-auto mb-1" aria-hidden />
      <p className="font-serif text-lg font-semibold text-ink">{value}</p>
      <p className="text-[11px] text-ink/50">{label}</p>
    </div>
  );
}

function Results({ result }: { result: QuizResult }) {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const levelName = useLevelName();
  const showName = useDisplayName();
  const catLabel = useCategoryLabel();
  const [open, setOpen] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "wrong">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const meta = CATEGORY_META[result.category];
  const barColor = meta.color === "#241B1D" ? "#7A1F35" : meta.color;
  const leveledUp = result.levelAfter.level > result.levelBefore.level;
  const wrongCount = result.totalQuestions - result.score;
  const review = filter === "wrong" ? result.review.filter((r) => !r.correct) : result.review;
  const title = result.mode === "standard" ? catLabel(result.category) : result.heritage ? result.heritage.name : t(`mode_${result.mode}`);
  const allLinks = [...new Map(result.review.flatMap((r) => r.links).map((l) => [l.id, l])).values()];

  const restart = async (difficulty: "seeker" | "historian") => {
    setBusy(difficulty);
    try {
      const s =
        result.mode === "standard" || result.mode === "challenge" || result.mode === "review"
          ? await quizApi.startStandard(result.category, difficulty)
          : await quizApi.startSession({ mode: result.mode, difficulty, heritageId: result.heritage?.id });
      navigate(`/quiz/play/${s.sessionId}`, { state: s });
    } catch (e) {
      setToast((e as Error).message);
      setBusy(null);
    }
  };

  const copy = async (text: string, msg: string) => {
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setToast(msg);
      }
    } catch {
      /* user cancelled */
    }
  };

  const share = () =>
    copy(t("shareText", { score: result.score, total: result.totalQuestions, acc: result.accuracy, cat: title }), t("shareCopied"));

  const challenge = async () => {
    setBusy("challenge");
    try {
      const ch = await quizApi.createChallenge(result.attemptId);
      const link = `${window.location.origin}/quiz/challenge/${ch.code}`;
      await copy(`${t("challengeTitle", { name: showName(ch.creatorName) })}: ${link}`, t("challengeCreated"));
      navigate(`/quiz/challenge/${ch.code}`);
    } catch (e) {
      setToast((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-parchment pb-16">
      {/* Hero */}
      <div className="relative pt-10 pb-14 px-5 text-center overflow-hidden" style={{ backgroundColor: meta.color }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 50% 80%, #F3ECDA 0%, transparent 65%)" }} />
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-white/70 text-xs uppercase tracking-[0.25em] mb-2">
            {title} · {result.difficulty === "historian" ? t("historian") : t("seeker")}
          </p>
          <ScoreRing score={result.score} total={result.totalQuestions} />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-3">{lang === "hi" ? result.rating.hindi : result.rating.title}</h1>
          {lang === "en" && <p className="font-devanagari text-white/75 text-sm">{result.rating.hindi}</p>}
          <p className="text-white/85 text-sm max-w-md mt-2">{result.rating.message}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {result.isPersonalBest && result.previousBest !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 text-white text-xs px-3 py-1">
                <TrendingUp className="w-3.5 h-3.5" aria-hidden /> {t("newPersonalBest", { n: result.previousBest })}
              </span>
            )}
            {leveledUp && (
              <span className="inline-flex items-center gap-1 rounded-full bg-turmeric text-white text-xs px-3 py-1">
                <Sparkles className="w-3.5 h-3.5" aria-hidden /> {t("levelUp", { name: levelName(result.levelAfter.level) })}
              </span>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-parchment" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-5">
        {/* Challenge comparison */}
        {result.challenge && !result.challenge.isCreator && (
          <Card className={cx("p-5 border-2", result.challenge.youWon ? "border-heritage/40" : "border-maroon/20")}>
            <p className="text-xs uppercase tracking-widest text-ink/50 mb-3 flex items-center gap-2">
              <Swords className="w-4 h-4" aria-hidden /> {t("vsFriend", { name: showName(result.challenge.creatorName) })}
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className={cx("rounded-xl p-3", result.challenge.youWon ? "bg-heritage/10" : "bg-parchment")}>
                <p className="text-xs text-ink/50">{t("yourScore")}</p>
                <p className="font-serif text-3xl font-bold text-ink">{result.score}</p>
                <p className="text-[11px] text-ink/50">{result.totalTimeSeconds}s</p>
              </div>
              <div className={cx("rounded-xl p-3", result.challenge.youWon === false ? "bg-heritage/10" : "bg-parchment")}>
                <p className="text-xs text-ink/50">{showName(result.challenge.creatorName)}</p>
                <p className="font-serif text-3xl font-bold text-ink">{result.challenge.creatorScore}</p>
                <p className="text-[11px] text-ink/50">{result.challenge.creatorTimeSeconds}s</p>
              </div>
            </div>
            <p className="text-sm text-center mt-3 font-semibold text-ink">
              {result.challenge.youWon === null ? t("tie") : result.challenge.youWon ? t("youWon") : t("youLost", { name: showName(result.challenge.creatorName) })}
            </p>
          </Card>
        )}

        {/* Quick stats */}
        <Card className="p-5 grid grid-cols-4 gap-2">
          <Stat icon={Target} label={t("accuracy")} value={`${result.accuracy}%`} />
          <Stat icon={Flame} label={t("bestStreak")} value={String(result.bestStreak)} />
          <Stat icon={Clock} label={t("avgPerQuestion")} value={`${result.averageTimeSeconds}s`} />
          <Stat icon={X} label={t("missed")} value={String(wrongCount)} />
        </Card>

        {/* Rewards earned */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-semibold text-ink">{t("whatYouEarned")}</h2>
            <CoinBadge amount={result.coinsEarned} className="text-base" />
          </div>
          <dl className="text-sm space-y-2">
            {(
              [
                [t("xpCorrect"), result.points.base, true],
                [t("xpSpeed"), result.points.speed, false],
                [t("xpStreak"), result.points.streak, false],
                [t("xpPerfect"), result.points.perfectBonus, false],
              ] as const
            )
              .filter(([, v, always]) => v > 0 || always)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-ink/60">{k}</dt>
                  <dd className="font-medium text-ink">+{v} XP</dd>
                </div>
              ))}
            <div className="flex justify-between border-t border-maroon/10 pt-2 font-semibold">
              <dt>{t("total")}</dt>
              <dd className="text-maroon">{result.points.total} XP</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-xl bg-parchment/70 p-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-ink">
                {t("level", { n: result.levelAfter.level })}: {levelName(result.levelAfter.level)}
              </span>
              <span className="text-ink/50">
                {result.levelAfter.nextLevelXp ? t("xpOf", { xp: result.levelAfter.xp, next: result.levelAfter.nextLevelXp }) : t("topReached")}
              </span>
            </div>
            <ProgressBar value={result.levelAfter.progress} label={t("a11yLevelProgress")} />
            <p className="text-xs text-ink/60 mt-2">
              {t("coinBalance", { n: result.coinBalance })}{" "}
              <Link to="/quiz/rewards" className="text-maroon underline">
                {t("spendCoins")}
              </Link>
            </p>
          </div>
        </Card>

        {/* New badges */}
        {result.newBadges.length > 0 && (
          <Card className="p-5 border-turmeric/40 bg-turmeric/5">
            <h2 className="font-serif font-semibold text-ink mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-turmeric" aria-hidden /> {t("badgesUnlocked")}
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2.5">
              {result.newBadges.map((b) => (
                <li key={b.id} className="flex items-start gap-3 rounded-xl bg-white/80 p-3 border border-turmeric/30">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-turmeric/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#8a5f12]" aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink">
                      {lang === "hi" ? b.hindi : b.label} {lang === "en" && <span className="font-devanagari text-xs text-maroon/80">{b.hindi}</span>}
                    </p>
                    <p className="text-xs text-ink/60">{b.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Breakdown */}
        <Card className="p-5">
          <h2 className="font-serif font-semibold text-ink mb-3">{t("byType")}</h2>
          <div className="space-y-3">
            {result.byType.map((ty) => (
              <div key={ty.type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink/70">{t(`type_${ty.type}`)}</span>
                  <span className="font-medium text-ink">
                    {ty.correct} / {ty.total}
                  </span>
                </div>
                <ProgressBar value={ty.correct / ty.total} color={barColor} label={t(`type_${ty.type}`)} />
              </div>
            ))}
          </div>
          {result.byCategory.length > 1 && (
            <>
              <h3 className="font-serif font-semibold text-ink mt-5 mb-3 text-sm">{t("byCategory")}</h3>
              <div className="space-y-3">
                {result.byCategory.map((c) => (
                  <div key={c.category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ink/70">{catLabel(c.category)}</span>
                      <span className="font-medium">
                        {c.correct} / {c.total}
                      </span>
                    </div>
                    <ProgressBar value={c.correct / c.total} color={CATEGORY_META[c.category].color} label={catLabel(c.category)} />
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Traditions in this quiz */}
        {allLinks.length > 0 && (
          <Card className="p-5">
            <h2 className="font-serif font-semibold text-ink mb-3">{t("exploreArchive")}</h2>
            <HeritageLinks links={allLinks.slice(0, 4)} />
          </Card>
        )}

        {/* Review */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif font-semibold text-ink">{t("reviewAnswers")}</h2>
            <div className="flex rounded-lg border border-maroon/20 overflow-hidden text-xs" role="tablist">
              {(["all", "wrong"] as const).map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={cx("px-3 py-1.5 cursor-pointer", filter === f ? "bg-maroon text-white" : "text-maroon hover:bg-maroon/5")}
                >
                  {f === "all" ? `${t("all")} (${result.totalQuestions})` : `${t("missedTab")} (${wrongCount})`}
                </button>
              ))}
            </div>
          </div>
          {review.length === 0 && <p className="text-sm text-ink/60 text-center py-6">{t("nothingMissed")}</p>}
          <ul className="space-y-2.5">
            {review.map((r) => {
              const i = result.review.indexOf(r);
              const isOpen = open === i;
              return (
                <li key={r.questionId} className={cx("rounded-xl border overflow-hidden bg-white/70", r.correct ? "border-heritage/30" : "border-terracotta/30")}>
                  <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="w-full flex items-start gap-3 p-4 text-start cursor-pointer hover:bg-white">
                    <span
                      className={cx("shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white mt-0.5", r.correct ? "bg-heritage" : "bg-terracotta")}
                      aria-label={r.correct ? t("correct") : t("notQuite")}
                    >
                      {r.correct ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-ink leading-snug">{r.prompt}</span>
                      <span className="block text-xs mt-1.5 text-ink/60">
                        {t("yourAnswer")}: <span className={r.correct ? "text-heritage" : "text-terracotta"}>{r.yourAnswerText}</span>
                      </span>
                      {!r.correct && (
                        <span className="block text-xs text-heritage mt-0.5">
                          {t("correctLabel")}: {r.correctAnswerText}
                        </span>
                      )}
                    </span>
                    <ChevronDown className={cx("w-4 h-4 text-maroon shrink-0 mt-1 transition-transform", isOpen && "rotate-180")} aria-hidden />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-maroon/10 bg-parchment/40 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-[#8a5f12] mt-2 mb-1">{r.explanation.title}</p>
                        <p className="text-sm text-ink/80 leading-relaxed">{r.explanation.body}</p>
                        {r.explanation.trivia && <p className="text-xs text-ink/60 italic mt-2">{r.explanation.trivia}</p>}
                      </div>
                      {r.links.length > 0 && <HeritageLinks links={r.links} compact />}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/50">
                        <span>
                          {t(`type_${r.type}`)} · {r.timedOut ? t("timedOut") : `${r.timeTakenSeconds}s`} · +{r.points} XP
                        </span>
                        <a href={r.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-maroon hover:underline">
                          <ExternalLink className="w-3 h-3" aria-hidden /> {r.source.label}
                        </a>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Next steps */}
        <section className="space-y-3">
          <h2 className="font-serif font-semibold text-ink">{t("whatNext")}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button className="col-span-2 py-4 font-serif text-base" loading={busy === result.difficulty} onClick={() => restart(result.difficulty)}>
              <RotateCcw className="w-4 h-4" aria-hidden /> {t("playAgain")}
            </Button>
            {result.difficulty === "seeker" && result.mode !== "heritage" && result.mode !== "review" && (
              <Button variant="gold" className="col-span-2" loading={busy === "historian"} onClick={() => restart("historian")}>
                {t("tryHistorian")}
              </Button>
            )}
            <Button variant="secondary" className="col-span-2" loading={busy === "challenge"} onClick={challenge}>
              <Swords className="w-4 h-4" aria-hidden /> {t("challengeFriend")}
            </Button>
            <Button variant="secondary" onClick={() => navigate("/quiz")}>
              <LayoutGrid className="w-4 h-4" aria-hidden /> {t("changeCategory")}
            </Button>
            <Button variant="secondary" onClick={share}>
              <Share2 className="w-4 h-4" aria-hidden /> {t("shareScore")}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/quiz/daily")}>
              <CalendarDays className="w-4 h-4" aria-hidden /> {t("potd")}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/quiz/rewards")}>
              <Gift className="w-4 h-4" aria-hidden /> {t("navRewards")}
            </Button>
          </div>
        </section>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

export default function QuizResults() {
  const { attemptId = "" } = useParams();
  const location = useLocation();
  const { t } = useI18n();
  const fromState = (location.state as QuizResult | null) ?? null;
  const fetched = useApi(() => (fromState?.attemptId === attemptId ? Promise.resolve(fromState) : quizApi.attempt(attemptId)), [attemptId]);

  if (fetched.loading) return <Spinner label={t("loadingResult")} />;
  if (fetched.error || !fetched.data) return <ErrorState error={fetched.error ?? new Error("Result not found")} onRetry={fetched.reload} />;
  return <Results result={fetched.data} />;
}
