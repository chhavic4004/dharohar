import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { BarChart3, CalendarDays, Check, Gift, Globe, LayoutGrid, RotateCcw, UserRound, WifiOff } from "lucide-react";
import { LANG_OPTIONS, useI18n, type StringKey } from "../i18n";
import { cx } from "./ui";

const LINKS: { to: string; label: StringKey; icon: typeof LayoutGrid; end?: boolean }[] = [
  { to: "/quiz", label: "navQuizzes", icon: LayoutGrid, end: true },
  { to: "/quiz/daily", label: "navDaily", icon: CalendarDays },
  { to: "/quiz/review", label: "navReview", icon: RotateCcw },
  { to: "/quiz/rewards", label: "navRewards", icon: Gift },
  { to: "/quiz/leaderboard", label: "navLeaderboard", icon: BarChart3 },
  { to: "/quiz/profile", label: "navProgress", icon: UserRound },
  { to: "/quiz/offline", label: "navOffline", icon: WifiOff },
];

function LanguagePicker() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const current = LANG_OPTIONS.find((l) => l.code === lang)!;
  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("language")}
        className="flex items-center gap-1.5 text-xs font-semibold text-maroon bg-maroon/5 hover:bg-maroon/10 border border-maroon/25 rounded-full px-3 py-1.5 my-2 cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5" aria-hidden /> {current.short}
      </button>
      {open && (
        <div className="absolute end-0 mt-1 w-40 bg-parchment border border-maroon/20 rounded-lg shadow-lg py-1 z-[60]">
          {LANG_OPTIONS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={cx(
                "w-full flex items-center justify-between px-3.5 py-2 text-sm text-start cursor-pointer",
                l.code === lang ? "bg-terracotta/15 text-maroon font-semibold" : "text-ink/80 hover:bg-maroon/5",
              )}
            >
              {l.label}
              {l.code === lang && <Check className="w-3.5 h-3.5 text-terracotta" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Secondary navigation shared by all quiz pages. */
export function QuizNav() {
  const { t } = useI18n();
  return (
    <nav aria-label="Quiz sections" className="bg-parchment border-b border-maroon/10">
      <div className="max-w-4xl mx-auto px-2 flex items-center gap-2">
        <div className="flex gap-1 overflow-x-auto flex-1">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition-colors",
                  isActive ? "border-maroon text-maroon" : "border-transparent text-ink/60 hover:text-maroon",
                )
              }
            >
              <Icon className="w-4 h-4" aria-hidden />
              {t(label)}
            </NavLink>
          ))}
        </div>
        <LanguagePicker />
      </div>
    </nav>
  );
}
