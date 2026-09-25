import { useState } from "react";
import { Link } from "react-router";
import { Award, Check, Flame, Lock, Pencil, Target, Trophy } from "lucide-react";
import { quizApi } from "../api/quizApi";
import { CATEGORY_IDS, CATEGORY_META } from "../constants";
import { useApi } from "../hooks/useApi";
import { Button, Card, CoinBadge, ErrorState, ProgressBar, Spinner, cx } from "../components/ui";

export default function Profile() {
  const profile = useApi(() => quizApi.profile());
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  if (profile.loading) return <Spinner label="Loading your progress" />;
  if (profile.error || !profile.data) return <ErrorState error={profile.error ?? new Error("Not found")} onRetry={profile.reload} />;
  const p = profile.data;
  const accuracy = p.totalAnswered ? Math.round((p.correctAnswers / p.totalAnswered) * 100) : 0;

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
                    aria-label="Display name"
                    className="flex-1 min-w-[140px] rounded-lg border border-maroon/30 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-maroon"
                    autoFocus
                  />
                  <Button className="px-4 py-2" loading={saving} disabled={name.trim().length < 2} onClick={saveName}>
                    Save
                  </Button>
                  <Button variant="ghost" className="px-3 py-2" onClick={() => setEditing(false)}>
                    Cancel
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
                    aria-label="Edit display name"
                  >
                    <Pencil className="w-4 h-4 text-maroon" />
                  </button>
                </h1>
              )}
              <p className="text-sm text-ink/60">
                Level {p.level.level}: {p.level.name} <span className="font-devanagari text-maroon/80">{p.level.hindi}</span>
              </p>
              <ProgressBar value={p.level.progress} className="mt-2" label="Level progress" />
              <p className="text-xs text-ink/50 mt-1">
                {p.level.nextLevelXp ? `${p.level.nextLevelXp - p.level.xp} XP to level ${p.level.level + 1}` : "Top level reached"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-center">
            <div className="rounded-xl bg-parchment/70 p-3">
              <CoinBadge amount={p.coins} className="text-lg" />
              <p className="text-[11px] text-ink/50">Coins</p>
            </div>
            <div className="rounded-xl bg-parchment/70 p-3">
              <p className="font-serif text-lg font-semibold text-ink">{p.quizzesCompleted}</p>
              <p className="text-[11px] text-ink/50">Quizzes</p>
            </div>
            <div className="rounded-xl bg-parchment/70 p-3">
              <p className="font-serif text-lg font-semibold text-ink flex items-center justify-center gap-1">
                <Target className="w-4 h-4 text-maroon" aria-hidden />
                {accuracy}%
              </p>
              <p className="text-[11px] text-ink/50">Accuracy</p>
            </div>
            <div className="rounded-xl bg-parchment/70 p-3">
              <p className="font-serif text-lg font-semibold text-ink flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-terracotta" aria-hidden />
                {p.daily.streak}
              </p>
              <p className="text-[11px] text-ink/50">Daily streak (best {p.daily.longestStreak})</p>
            </div>
          </div>
        </Card>

        {/* Category mastery */}
        <Card className="p-5">
          <h2 className="font-serif font-semibold text-ink mb-4">Category mastery</h2>
          <div className="space-y-4">
            {CATEGORY_IDS.map((id) => {
              const s = p.stats[id];
              const m = CATEGORY_META[id];
              const acc = s && s.answered ? s.correct / s.answered : 0;
              return (
                <div key={id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2 text-ink">
                      <m.icon className="w-4 h-4" style={{ color: m.color }} aria-hidden /> {m.label}
                    </span>
                    <span className="text-xs text-ink/50">
                      {s ? `${Math.round(acc * 100)}% · best ${s.bestScore.seeker ?? "-"} / ${s.bestScore.historian ?? "-"}` : "Not played yet"}
                    </span>
                  </div>
                  <ProgressBar value={acc} color={m.color} label={`${m.label} accuracy`} />
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-ink/40 mt-3">Best scores shown as Seeker / Historian.</p>
        </Card>

        {/* Badges */}
        <Card className="p-5">
          <h2 className="font-serif font-semibold text-ink mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-turmeric" aria-hidden /> Badges{" "}
            <span className="text-sm font-sans font-normal text-ink/50">
              {p.badges.length} of {p.badges.length + p.lockedBadges.length}
            </span>
          </h2>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {[...p.badges.map((b) => ({ ...b, earned: true })), ...p.lockedBadges.map((b) => ({ ...b, earned: false }))].map((b) => (
              <li key={b.id} className={cx("flex items-start gap-3 rounded-xl p-3 border", b.earned ? "bg-turmeric/10 border-turmeric/30" : "bg-white/50 border-maroon/10")}>
                <div className={cx("shrink-0 w-9 h-9 rounded-full flex items-center justify-center", b.earned ? "bg-turmeric text-white" : "bg-ink/10 text-ink/40")}>
                  {b.earned ? <Check className="w-4 h-4" aria-hidden /> : <Lock className="w-4 h-4" aria-hidden />}
                </div>
                <div>
                  <p className={cx("text-sm font-semibold", b.earned ? "text-ink" : "text-ink/60")}>
                    {b.label} <span className="font-devanagari text-xs font-normal text-maroon/70">{b.hindi}</span>
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
            <Trophy className="w-5 h-5 text-maroon" aria-hidden /> Recent quizzes
          </h2>
          {p.recentAttempts.length === 0 ? (
            <p className="text-sm text-ink/60">
              No quizzes yet.{" "}
              <Link to="/quiz" className="text-maroon underline">
                Start your first one
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-maroon/10">
              {p.recentAttempts.map((a) => (
                <li key={a.attemptId}>
                  <Link to={`/quiz/results/${a.attemptId}`} className="flex items-center gap-3 py-3 hover:bg-white/60 rounded-lg px-2 -mx-2">
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-ink">
                        {CATEGORY_META[a.category].label}{" "}
                        <span className="text-xs text-ink/50">· {a.difficulty === "historian" ? "Historian" : "Seeker"}</span>
                      </span>
                      <span className="block text-xs text-ink/50">
                        {new Date(a.completedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {a.score}/{a.totalQuestions}
                    </span>
                    <span className="text-xs text-maroon w-16 text-right">+{a.points} XP</span>
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
