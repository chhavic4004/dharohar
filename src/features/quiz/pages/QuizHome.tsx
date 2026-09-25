import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, CalendarCheck, CalendarDays, Check, Flame, Hourglass, Lamp, Shuffle } from "lucide-react";
import { QUESTIONS_PER_QUIZ, type Difficulty, type QuizCategoryParam } from "@shared/quiz-contract";
import { quizApi } from "../api/quizApi";
import { CATEGORY_IDS, CATEGORY_META } from "../constants";
import { useApi } from "../hooks/useApi";
import { Button, Card, CoinBadge, ProgressBar, SectionTitle, cx } from "../components/ui";

const DIFFICULTIES: { id: Difficulty; label: string; hindi: string; sub: string; desc: string; icon: typeof Lamp }[] = [
  {
    id: "seeker",
    label: "Seeker",
    hindi: "साधक",
    sub: "Casual, no time limit",
    desc: "Explore at your own pace with heritage context after every answer.",
    icon: Lamp,
  },
  {
    id: "historian",
    label: "Historian",
    hindi: "इतिहासकार",
    sub: "Timed, 30 seconds per question",
    desc: "Race against time. Every second counts in the archives.",
    icon: Hourglass,
  },
];

export default function QuizHome() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<QuizCategoryParam | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("seeker");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const categories = useApi(() => quizApi.categories());
  const profile = useApi(() => quizApi.profile());
  const daily = useApi(() => quizApi.daily());

  const count = (id: QuizCategoryParam) => {
    if (!categories.data) return null;
    if (id === "mixed") return categories.data.reduce((n, c) => n + c.questionCount[difficulty], 0);
    return categories.data.find((c) => c.id === id)?.questionCount[difficulty] ?? null;
  };

  const start = async () => {
    if (!selected) return;
    setStarting(true);
    setStartError(null);
    try {
      const session = await quizApi.startSession(selected, difficulty);
      navigate(`/quiz/play/${session.sessionId}`, { state: session });
    } catch (e) {
      setStartError((e as Error).message);
      setStarting(false);
    }
  };

  const meta = selected ? CATEGORY_META[selected] : null;

  return (
    <div className="bg-parchment pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden bg-ink pt-12 pb-16 px-5 text-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #C68A1D 0%, transparent 70%)" }} />
        <div className="relative z-10">
          <p className="text-turmeric text-xs tracking-[0.3em] uppercase font-medium mb-3 font-devanagari">भारत की अमर धरोहर</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-parchment leading-tight mb-3">Heritage &amp; Culture Quiz</h1>
          <p className="text-terracotta font-serif italic text-lg mb-1">धरोहर प्रश्नोत्तरी</p>
          <p className="text-parchment/60 text-sm max-w-sm mx-auto leading-relaxed mt-3">
            Test your knowledge of India's living traditions, art, architecture, cuisine, and rulers.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {[`${QUESTIONS_PER_QUIZ} Questions`, "2 Difficulty Levels", "5 Question Types", "Heritage Insights"].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-parchment/80 text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-parchment" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-8">
        {/* Player strip */}
        {profile.data && (
          <Card className="p-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to="/quiz/profile" className="flex-1 min-w-[180px] group">
              <p className="text-[11px] uppercase tracking-widest text-ink/50">Level {profile.data.level.level}</p>
              <p className="font-serif font-semibold text-ink group-hover:text-maroon">
                {profile.data.level.name} <span className="font-devanagari text-sm text-maroon/80">{profile.data.level.hindi}</span>
              </p>
              <ProgressBar value={profile.data.level.progress} className="mt-1.5" label="Progress to next level" />
              <p className="text-[11px] text-ink/50 mt-1">
                {profile.data.level.nextLevelXp
                  ? `${profile.data.level.xp} / ${profile.data.level.nextLevelXp} XP`
                  : `${profile.data.level.xp} XP, top level reached`}
              </p>
            </Link>
            <Link to="/quiz/rewards" className="text-center hover:opacity-80">
              <CoinBadge amount={profile.data.coins} className="text-lg" />
              <p className="text-[11px] text-ink/50">Coins</p>
            </Link>
            <Link to="/quiz/daily" className="text-center hover:opacity-80">
              <span className="inline-flex items-center gap-1 text-lg font-semibold text-terracotta">
                <Flame className="w-4 h-4" aria-hidden />
                {profile.data.daily.streak}
              </span>
              <p className="text-[11px] text-ink/50">Day streak</p>
            </Link>
          </Card>
        )}

        {/* Problem of the Day */}
        {daily.data && (
          <Link
            to="/quiz/daily"
            className={cx(
              "block rounded-2xl p-5 border-2 transition-all hover:shadow-lg",
              daily.data.answered ? "bg-heritage/10 border-heritage/30" : "bg-gradient-to-br from-maroon to-[#5c1728] border-maroon text-white",
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cx("shrink-0 w-12 h-12 rounded-xl flex items-center justify-center", daily.data.answered ? "bg-heritage text-white" : "bg-white/15")}>
                {daily.data.answered ? <CalendarCheck className="w-6 h-6" /> : <CalendarDays className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cx("text-[11px] uppercase tracking-widest font-semibold", daily.data.answered ? "text-heritage" : "text-turmeric")}>
                  Problem of the Day
                </p>
                <p className={cx("font-serif font-semibold", daily.data.answered ? "text-ink" : "text-white")}>
                  {daily.data.answered
                    ? "Done for today. A new question unlocks at midnight."
                    : daily.data.streakAtRisk
                      ? `Answer today to keep your ${daily.data.streak} day streak alive`
                      : "One new question every day. Build your streak."}
                </p>
              </div>
              <ArrowRight className={cx("w-5 h-5 shrink-0", daily.data.answered ? "text-heritage" : "text-white/80")} aria-hidden />
            </div>
          </Link>
        )}

        {/* Category selection */}
        <section aria-labelledby="choose-category">
          <SectionTitle id="choose-category">Choose a Category</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...CATEGORY_IDS, "mixed" as const].map((id) => {
              const m = CATEGORY_META[id];
              const isSel = selected === id;
              const Icon = m.icon;
              const n = count(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelected(id)}
                  aria-pressed={isSel}
                  className={cx(
                    "group relative w-full rounded-2xl overflow-hidden transition-all duration-300 text-left cursor-pointer",
                    isSel ? "scale-[1.02] shadow-xl" : "hover:scale-[1.02] hover:shadow-lg shadow-md",
                  )}
                  style={{ outline: isSel ? `2px solid ${m.color}` : "none", outlineOffset: "2px" }}
                >
                  <div className="relative h-32 bg-ink">
                    {m.image ? (
                      <img src={m.image} alt="" loading="lazy" className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundImage: "repeating-linear-gradient(45deg, #2e2426 0 12px, #241B1D 12px 24px)" }}>
                        <Shuffle className="w-10 h-10 text-turmeric/80" aria-hidden />
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${m.color}dd 0%, transparent 60%)` }} />
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                      <Icon className="w-4 h-4" style={{ color: m.color }} aria-hidden />
                    </div>
                    {isSel && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow">
                        <Check className="w-4 h-4 text-heritage" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3" style={{ backgroundColor: isSel ? m.color : "#EDE4CE" }}>
                    <p className="font-serif font-semibold text-sm leading-tight" style={{ color: isSel ? "#fff" : "#241B1D" }}>
                      {m.label}
                    </p>
                    <p className="text-xs mt-0.5 font-devanagari" style={{ color: isSel ? "rgba(255,255,255,0.8)" : "#7A1F35" }}>
                      {m.hindi}
                    </p>
                    {n !== null && (
                      <p className="text-[11px] mt-1" style={{ color: isSel ? "rgba(255,255,255,0.7)" : "rgba(36,27,29,0.5)" }}>
                        {id === "mixed" ? "All categories" : `${n} questions`}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Difficulty */}
        <section aria-labelledby="choose-difficulty">
          <SectionTitle id="choose-difficulty">Select Difficulty</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIFFICULTIES.map((d) => {
              const on = difficulty === d.id;
              const Icon = d.icon;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  aria-pressed={on}
                  className={cx(
                    "rounded-2xl p-5 text-left transition-all duration-200 border-2 cursor-pointer",
                    on ? "border-maroon bg-maroon text-white shadow-lg scale-[1.02]" : "border-maroon/20 bg-white/60 hover:border-maroon/50 hover:bg-white/80",
                  )}
                >
                  <Icon className={cx("w-6 h-6 mb-2", on ? "text-turmeric" : "text-maroon")} aria-hidden />
                  <p className={cx("font-serif font-bold text-base", on ? "text-white" : "text-ink")}>{d.label}</p>
                  <p className={cx("font-devanagari text-xs mb-1.5", on ? "text-white/70" : "text-maroon")}>{d.hindi}</p>
                  <p className={cx("text-xs font-medium mb-2", on ? "text-parchment" : "text-terracotta")}>{d.sub}</p>
                  <p className={cx("text-xs leading-snug", on ? "text-white/80" : "text-ink/60")}>{d.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Start */}
        <div>
          <Button className="w-full py-4 text-lg font-serif" disabled={!selected} loading={starting} onClick={start}>
            {meta ? `Begin: ${meta.label}` : "Select a Category to Begin"}
          </Button>
          {selected && (
            <p className="text-center text-xs text-ink/50 mt-2">
              {QUESTIONS_PER_QUIZ} questions · {difficulty === "historian" ? "30 second timer, bonus points for speed" : "No time limit"} · earn XP and coins
            </p>
          )}
          {startError && <p className="text-center text-sm text-alert mt-2">{startError}</p>}
          {categories.error && <p className="text-center text-sm text-alert mt-2">{categories.error.message}</p>}
        </div>
      </div>
    </div>
  );
}
