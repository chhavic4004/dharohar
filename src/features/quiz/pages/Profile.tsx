import { useState } from "react";
import { Link } from "react-router";
import { Award, Check, CloudUpload, Flame, Lock, Pencil, RotateCcw, Target, Trophy } from "lucide-react";
import { siteText } from "../../../i18n/site";
import { quizApi } from "../api/quizApi";
import { CATEGORY_IDS, CATEGORY_META } from "../constants";
import { useApi } from "../hooks/useApi";
import { useI18n, type StringKey } from "../i18n";
import { Button, Card, CoinBadge, ErrorState, ProgressBar, Spinner, cx } from "../components/ui";
import { useCategoryLabel, useLevelName } from "./QuizHome";
import { localeOf } from "../../../lib/language";

export default function Profile() {
  const { t, lang } = useI18n();
  const locale = localeOf(lang);
  const catLabel = useCategoryLabel();
  const levelName = useLevelName();
  const profile = useApi(() => quizApi.profile(), [lang]);
  const wallet = useApi(() => quizApi.redemptions(), [lang]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  if (profile.loading) return <Spinner label={t("loadingProgress")} />;
  if (profile.error || !profile.data) return <ErrorState error={profile.error ?? new Error(t("notFound"))} onRetry={profile.reload} />;
  const p = profile.data;
  const accuracy = p.totalAnswered ? Math.round((p.correctAnswers / p.totalAnswered) * 100) : 0;
  const hasCert = wallet.data?.some((w) => w.rewardId === "supporter-certificate" && w.status === "active") ?? false;
  const hi = lang === "hi";

  const saveName = async () => {
    setSaving(true);
    setNameError(null);
    try {
      profile.setData(await quizApi.rename(name.trim()));
      setEditing(false);
    } catch (e) {
      setNameError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-parchment pb-16">
      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-5">
        {/* Identity and level */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-14 h-14 rounded-full bg-maroon text-white flex items-center justify-center font-serif text-xl font-bold">
              {p.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={24}
                    aria-label={t("editName")}
                    className="flex-1 min-w-[140px] rounded-lg border border-maroon/30 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-maroon"
                    autoFocus
                  />
                  <Button className="px-4 py-2" loading={saving} disabled={name.trim().length < 2} onClick={saveName}>
                    {t("save")}
                  </Button>
                  <Button variant="ghost" className="px-3 py-2" onClick={() => setEditing(false)}>
                    {t("cancel")}
                  </Button>
                  {nameError && <p className="w-full text-xs text-alert">{nameError}</p>}
                </div>
              ) : (
                <h1 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                  {p.displayName}
                  <button
                    onClick={() => {
                      setName(p.displayName);
                      setEditing(true);
                    }}
                    className="p-1 rounded hover:bg-maroon/10 cursor-pointer"
                    aria-label={t("editName")}
                  >
                    <Pencil className="w-4 h-4 text-maroon" />
                  </button>
                </h1>
              )}
              <p className="text-sm text-ink/60">
                {t("level", { n: p.level.level })}: {levelName(p.level.level)}{" "}
                {lang === "en" && <span className="font-devanagari text-maroon/80">{p.level.hindi}</span>}
              </p>
              <ProgressBar value={p.level.progress} className="mt-2" label={t("level", { n: p.level.level })} />
              <p className="text-xs text-ink/50 mt-1">
                {p.level.nextLevelXp ? t("xpToNext", { n: p.level.nextLevelXp - p.level.xp, l: p.level.level + 1 }) : t("topReached")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-center">
            <div className="rounded-xl bg-parchment/70 p-3">
              <CoinBadge amount={p.coins} className="text-lg" />
              <p className="text-[11px] text-ink/50">{t("coins")}</p>
            </div>
            <div className="rounded-xl bg-parchment/70 p-3">
              <p className="font-serif text-lg font-semibold text-ink">{p.quizzesCompleted}</p>
              <p className="text-[11px] text-ink/50">{t("quizzes")}</p>
            </div>
            <div className="rounded-xl bg-parchment/70 p-3">
              <p className="font-serif text-lg font-semibold text-ink flex items-center justify-center gap-1">
                <Target className="w-4 h-4 text-maroon" aria-hidden />
                {accuracy}%
              </p>
              <p className="text-[11px] text-ink/50">{t("accuracy")}</p>
            </div>
            <div className="rounded-xl bg-parchment/70 p-3">
              <p className="font-serif text-lg font-semibold text-ink flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-terracotta" aria-hidden />
                {p.daily.streak}
              </p>
              <p className="text-[11px] text-ink/50">{t("dailyStreakBest", { n: p.daily.longestStreak })}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {hasCert ? (
              <Link to="/quiz/certificate" className="inline-flex items-center gap-1.5 rounded-full bg-turmeric/15 text-[#8a5f12] text-xs font-semibold px-3 py-1.5 hover:bg-turmeric/25">
                <Award className="w-3.5 h-3.5" aria-hidden /> {t("openCertificate")}
              </Link>
            ) : (
              <Link to="/quiz/rewards" className="inline-flex items-center gap-1.5 rounded-full bg-white/70 text-maroon text-xs font-semibold px-3 py-1.5 hover:bg-white border border-maroon/15">
                <Award className="w-3.5 h-3.5" aria-hidden /> {t("certRedeemFirst")}
              </Link>
            )}
          </div>
        </Card>

        {/* Guests: nudge to create an account so progress is saved */}
        {p.id.startsWith("g:") && (
          <Card className="p-5 border-turmeric/40 bg-turmeric/10 flex flex-wrap items-center gap-4">
            <CloudUpload className="w-7 h-7 text-[#8a5f12] shrink-0" aria-hidden />
            <div className="flex-1 min-w-[200px]">
              <p className="font-serif font-semibold text-ink">{siteText(lang, "guestTitle")}</p>
              <p className="text-xs text-ink/65 mt-0.5">{siteText(lang, "guestBody")}</p>
            </div>
            <Link to="/login?mode=signup&next=/quiz/profile" className="rounded-xl bg-maroon text-white text-sm font-semibold px-4 py-2.5 hover:bg-terracotta">
              {siteText(lang, "guestCta")}
            </Link>
          </Card>
        )}

        {/* Spaced repetition summary */}
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-serif font-semibold text-ink flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-terracotta" aria-hidden /> {t("reviewTitle")}
            </h2>
            <Link to="/quiz/review" className="text-sm font-semibold text-maroon underline">
              {p.review.due > 0 ? t("startReview", { n: p.review.due }) : t("navReview")}
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {(
              [
                ["dueNow", p.review.due, "text-terracotta"],
                ["learning", p.review.learning, "text-maroon"],
                ["mastered", p.review.mastered, "text-heritage"],
              ] as [StringKey, number, string][]
            ).map(([k, v, c]) => (
              <div key={k} className="rounded-xl bg-parchment/70 p-3">
                <p className={cx("font-serif text-xl font-semibold", c)}>{v}</p>
                <p className="text-[11px] text-ink/50">{t(k)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Category mastery */}
        <Card className="p-5">
          <h2 className="font-serif font-semibold text-ink mb-4">{t("categoryMastery")}</h2>
          <div className="space-y-4">
            {CATEGORY_IDS.map((id) => {
              const s = p.stats[id];
              const m = CATEGORY_META[id];
              const acc = s && s.answered ? s.correct / s.answered : 0;
              return (
                <div key={id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2 text-ink">
                      <m.icon className="w-4 h-4" style={{ color: m.color }} aria-hidden /> {catLabel(id)}
                    </span>
                    <span className="text-xs text-ink/50">
                      {s ? `${Math.round(acc * 100)}% · ${s.bestScore.seeker ?? "-"} / ${s.bestScore.historian ?? "-"}` : t("notPlayed")}
                    </span>
                  </div>
                  <ProgressBar value={acc} color={m.color} label={catLabel(id)} />
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-ink/40 mt-3">{t("bestShown")}</p>
        </Card>

        {/* Badges */}
        <Card className="p-5">
          <h2 className="font-serif font-semibold text-ink mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-turmeric" aria-hidden /> {t("badges")}{" "}
            <span className="text-sm font-sans font-normal text-ink/50">{t("ofTotal", { a: p.badges.length, b: p.badges.length + p.lockedBadges.length })}</span>
          </h2>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {[...p.badges.map((b) => ({ ...b, earned: true })), ...p.lockedBadges.map((b) => ({ ...b, earned: false }))].map((b) => (
              <li key={b.id} className={cx("flex items-start gap-3 rounded-xl p-3 border", b.earned ? "bg-turmeric/10 border-turmeric/30" : "bg-white/50 border-maroon/10")}>
                <div className={cx("shrink-0 w-9 h-9 rounded-full flex items-center justify-center", b.earned ? "bg-turmeric text-white" : "bg-ink/10 text-ink/40")}>
                  {b.earned ? <Check className="w-4 h-4" aria-hidden /> : <Lock className="w-4 h-4" aria-hidden />}
                </div>
                <div>
                  <p className={cx("text-sm font-semibold", b.earned ? "text-ink" : "text-ink/60")}>
                    {hi ? b.hindi : b.label} {lang === "en" && <span className="font-devanagari text-xs font-normal text-maroon/70">{b.hindi}</span>}
                  </p>
                  <p className="text-xs text-ink/55">{b.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* History */}
        <Card className="p-5">
          <h2 className="font-serif font-semibold text-ink mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-maroon" aria-hidden /> {t("recentQuizzes")}
          </h2>
          {p.recentAttempts.length === 0 ? (
            <p className="text-sm text-ink/60">
              {t("noQuizzes")}{" "}
              <Link to="/quiz" className="text-maroon underline">
                {t("startFirst")}
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-maroon/10">
              {p.recentAttempts.map((a) => (
                <li key={a.attemptId}>
                  <Link to={`/quiz/results/${a.attemptId}`} className="flex items-center gap-3 py-3 hover:bg-white/60 rounded-lg px-2 -mx-2">
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-ink">
                        {a.mode === "standard" ? catLabel(a.category) : t(`mode_${a.mode}` as StringKey)}{" "}
                        <span className="text-xs text-ink/50">· {a.difficulty === "historian" ? t("historian") : t("seeker")}</span>
                      </span>
                      <span className="block text-xs text-ink/50">
                        {new Date(a.completedAt).toLocaleString(locale, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {a.score}/{a.totalQuestions}
                    </span>
                    <span className="text-xs text-maroon w-16 text-end">+{a.points} XP</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
