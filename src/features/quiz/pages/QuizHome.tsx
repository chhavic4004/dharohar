import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, CalendarCheck, CalendarDays, Check, Flame, HandHeart, Hourglass, Lamp, Map as MapIcon, RotateCcw, Shuffle, Swords, WifiOff } from "lucide-react";
import { QUESTIONS_PER_QUIZ, type Difficulty, type QuizCategoryParam, type StartSessionRequest } from "@shared/quiz-contract";
import { quizApi } from "../api/quizApi";
import { CATEGORY_IDS, CATEGORY_META } from "../constants";
import { useApi } from "../hooks/useApi";
import { useI18n } from "../i18n";
import { Button, Card, CoinBadge, ProgressBar, SectionTitle, cx } from "../components/ui";

export function useCategoryLabel() {
  const { lang, t } = useI18n();
  return (id: QuizCategoryParam) => (id === "mixed" ? t("mixedBag") : lang === "hi" ? CATEGORY_META[id].hindi : CATEGORY_META[id].label);
}

export default function QuizHome() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const catLabel = useCategoryLabel();
  const [selected, setSelected] = useState<QuizCategoryParam | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("seeker");
  const [starting, setStarting] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const categories = useApi(() => quizApi.categories());
  const profile = useApi(() => quizApi.profile());
  const daily = useApi(() => quizApi.daily(), [lang]);

  const DIFFICULTIES = [
    { id: "seeker" as const, label: t("seeker"), hindi: "साधक", sub: t("seekerSub"), desc: t("seekerDesc"), icon: Lamp },
    { id: "historian" as const, label: t("historian"), hindi: "इतिहासकार", sub: t("historianSub"), desc: t("historianDesc"), icon: Hourglass },
  ];

  const count = (id: QuizCategoryParam) => {
    if (!categories.data) return null;
    if (id === "mixed") return categories.data.reduce((n, c) => n + c.questionCount[difficulty], 0);
    return categories.data.find((c) => c.id === id)?.questionCount[difficulty] ?? null;
  };

  const start = async (req: StartSessionRequest, key: string) => {
    setStarting(key);
    setStartError(null);
    try {
      const session = await quizApi.startSession(req);
      navigate(`/quiz/play/${session.sessionId}`, { state: session });
    } catch (e) {
      setStartError((e as Error).message);
      setStarting(null);
    }
  };

  const due = profile.data?.review.due ?? 0;

  return (
    <div className="bg-parchment pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden bg-ink pt-12 pb-16 px-5 text-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #C68A1D 0%, transparent 70%)" }} />
        <div className="relative z-10">
          <p className="text-turmeric text-xs tracking-[0.3em] uppercase font-medium mb-3 font-devanagari">{t("heroTop")}</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-parchment leading-tight mb-3">{t("heroTitle")}</h1>
          <p className="text-terracotta font-serif italic text-lg mb-1">{t("heroHindi")}</p>
          <p className="text-parchment/60 text-sm max-w-sm mx-auto leading-relaxed mt-3">{t("heroDesc")}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {[t("tagQuestions", { n: QUESTIONS_PER_QUIZ }), t("tagLevels"), t("tagTypes"), t("tagInsights")].map((tag) => (
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
              <p className="text-[11px] uppercase tracking-widest text-ink/50">{t("level", { n: profile.data.level.level })}</p>
              <p className="font-serif font-semibold text-ink group-hover:text-maroon">
                {lang === "hi" ? profile.data.level.hindi : profile.data.level.name}
              </p>
              <ProgressBar value={profile.data.level.progress} className="mt-1.5" label="Level progress" />
              <p className="text-[11px] text-ink/50 mt-1">
                {profile.data.level.nextLevelXp
                  ? t("xpOf", { xp: profile.data.level.xp, next: profile.data.level.nextLevelXp })
                  : t("topLevel", { xp: profile.data.level.xp })}
              </p>
            </Link>
            <Link to="/quiz/rewards" className="text-center hover:opacity-80">
              <CoinBadge amount={profile.data.coins} className="text-lg" />
              <p className="text-[11px] text-ink/50">{t("coins")}</p>
            </Link>
            <Link to="/quiz/daily" className="text-center hover:opacity-80">
              <span className="inline-flex items-center gap-1 text-lg font-semibold text-terracotta">
                <Flame className="w-4 h-4" aria-hidden />
                {profile.data.daily.streak}
              </span>
              <p className="text-[11px] text-ink/50">{t("dayStreak")}</p>
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
                <p className={cx("text-[11px] uppercase tracking-widest font-semibold", daily.data.answered ? "text-heritage" : "text-turmeric")}>{t("potd")}</p>
                <p className={cx("font-serif font-semibold", daily.data.answered ? "text-ink" : "text-white")}>
                  {daily.data.answered ? t("potdDone") : daily.data.streakAtRisk ? t("potdRisk", { n: daily.data.streak }) : t("potdNew")}
                </p>
              </div>
              <ArrowRight className={cx("w-5 h-5 shrink-0 rtl:rotate-180", daily.data.answered ? "text-heritage" : "text-white/80")} aria-hidden />
            </div>
          </Link>
        )}

        {/* Category selection */}
        <section aria-labelledby="choose-category">
          <SectionTitle id="choose-category">{t("chooseCategory")}</SectionTitle>
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
                    "group relative w-full rounded-2xl overflow-hidden transition-all duration-300 text-start cursor-pointer",
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
                    <div className="absolute top-3 start-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                      <Icon className="w-4 h-4" style={{ color: m.color }} aria-hidden />
                    </div>
                    {isSel && (
                      <div className="absolute top-3 end-3 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow">
                        <Check className="w-4 h-4 text-heritage" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3" style={{ backgroundColor: isSel ? m.color : "#EDE4CE" }}>
                    <p className="font-serif font-semibold text-sm leading-tight" style={{ color: isSel ? "#fff" : "#241B1D" }}>
                      {catLabel(id)}
                    </p>
                    <p className="text-xs mt-0.5 font-devanagari" style={{ color: isSel ? "rgba(255,255,255,0.8)" : "#7A1F35" }}>
                      {lang === "hi" ? m.label : m.hindi}
                    </p>
                    {n !== null && (
                      <p className="text-[11px] mt-1" style={{ color: isSel ? "rgba(255,255,255,0.7)" : "rgba(36,27,29,0.5)" }}>
                        {id === "mixed" ? t("allCategories") : t("nQuestions", { n })}
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
          <SectionTitle id="choose-difficulty">{t("selectDifficulty")}</SectionTitle>
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
                    "rounded-2xl p-5 text-start transition-all duration-200 border-2 cursor-pointer",
                    on ? "border-maroon bg-maroon text-white shadow-lg scale-[1.02]" : "border-maroon/20 bg-white/60 hover:border-maroon/50 hover:bg-white/80",
                  )}
                >
                  <Icon className={cx("w-6 h-6 mb-2", on ? "text-turmeric" : "text-maroon")} aria-hidden />
                  <p className={cx("font-serif font-bold text-base", on ? "text-white" : "text-ink")}>{d.label}</p>
                  {lang !== "hi" && <p className={cx("font-devanagari text-xs mb-1.5", on ? "text-white/70" : "text-maroon")}>{d.hindi}</p>}
                  <p className={cx("text-xs font-medium mb-2", on ? "text-parchment" : "text-terracotta")}>{d.sub}</p>
                  <p className={cx("text-xs leading-snug", on ? "text-white/80" : "text-ink/60")}>{d.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Start */}
        <div>
          <Button
            className="w-full py-4 text-lg font-serif"
            disabled={!selected}
            loading={starting === "standard"}
            onClick={() => selected && start({ mode: "standard", category: selected, difficulty }, "standard")}
          >
            {selected ? t("begin", { name: catLabel(selected) }) : t("selectToBegin")}
          </Button>
          {selected && (
            <p className="text-center text-xs text-ink/50 mt-2">
              {t("beginHint", { n: QUESTIONS_PER_QUIZ, timer: difficulty === "historian" ? t("timerHint") : t("noTimer") })}
            </p>
          )}
          {startError && <p className="text-center text-sm text-alert mt-2">{startError}</p>}
          {categories.error && <p className="text-center text-sm text-alert mt-2">{categories.error.message}</p>}
        </div>

        {/* More ways to play */}
        <section aria-labelledby="more-ways">
          <SectionTitle id="more-ways">{t("moreWays")}</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-3">
            <Card className="p-5">
              <MapIcon className="w-6 h-6 text-terracotta mb-2" aria-hidden />
              <p className="font-serif font-semibold text-ink">{t("modeMap")}</p>
              <p className="text-xs text-ink/60 mt-1 mb-3">{t("modeMapDesc")}</p>
              <div className="flex gap-2">
                <Button variant="secondary" className="px-3 py-2 flex-1" loading={starting === "map-seeker"} onClick={() => start({ mode: "map", difficulty: "seeker" }, "map-seeker")}>
                  {t("playSeeker")}
                </Button>
                <Button variant="secondary" className="px-3 py-2 flex-1" loading={starting === "map-historian"} onClick={() => start({ mode: "map", difficulty: "historian" }, "map-historian")}>
                  {t("playHistorian")}
                </Button>
              </div>
            </Card>
            <Card className="p-5 border-alert/20">
              <HandHeart className="w-6 h-6 text-alert mb-2" aria-hidden />
              <p className="font-serif font-semibold text-ink">{t("modeVulnerable")}</p>
              <p className="text-xs text-ink/60 mt-1 mb-3">{t("modeVulnerableDesc")}</p>
              <div className="flex gap-2">
                <Button variant="secondary" className="px-3 py-2 flex-1" loading={starting === "vul-seeker"} onClick={() => start({ mode: "vulnerable", difficulty: "seeker" }, "vul-seeker")}>
                  {t("playSeeker")}
                </Button>
                <Button variant="secondary" className="px-3 py-2 flex-1" loading={starting === "vul-historian"} onClick={() => start({ mode: "vulnerable", difficulty: "historian" }, "vul-historian")}>
                  {t("playHistorian")}
                </Button>
              </div>
            </Card>
            <Link to="/quiz/review" className="block">
              <Card className="p-5 h-full hover:shadow-md transition-shadow">
                <RotateCcw className="w-6 h-6 text-heritage mb-2" aria-hidden />
                <p className="font-serif font-semibold text-ink flex items-center gap-2">
                  {t("modeReview")}
                  <span className={cx("text-[11px] font-sans rounded-full px-2 py-0.5", due ? "bg-heritage text-white" : "bg-ink/10 text-ink/50")}>
                    {due ? t("reviewDue", { n: due }) : t("reviewNone")}
                  </span>
                </p>
                <p className="text-xs text-ink/60 mt-1">{t("modeReviewDesc")}</p>
              </Card>
            </Link>
            <Card className="p-5">
              <Swords className="w-6 h-6 text-maroon mb-2" aria-hidden />
              <p className="font-serif font-semibold text-ink">{t("modeChallenge")}</p>
              <p className="text-xs text-ink/60 mt-1 mb-3">{t("modeChallengeDesc")}</p>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (code.trim()) navigate(`/quiz/challenge/${code.trim().toUpperCase()}`);
                }}
              >
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8))}
                  placeholder={t("enterCode")}
                  aria-label={t("enterCode")}
                  className="flex-1 min-w-0 rounded-lg border border-maroon/25 bg-white px-3 py-2 text-sm uppercase tracking-widest focus:outline-2 focus:outline-maroon"
                />
                <Button type="submit" className="px-4 py-2" disabled={code.length < 4}>
                  {t("go")}
                </Button>
              </form>
            </Card>
            <Link to="/quiz/offline" className="block sm:col-span-2">
              <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <WifiOff className="w-6 h-6 text-ink/60 shrink-0" aria-hidden />
                <div className="flex-1">
                  <p className="font-serif font-semibold text-ink">{t("modeOffline")}</p>
                  <p className="text-xs text-ink/60 mt-0.5">{t("modeOfflineDesc")}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-ink/40 rtl:rotate-180" aria-hidden />
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
