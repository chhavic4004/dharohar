import { NavLink } from "react-router";
import { BarChart3, CalendarDays, Gift, LayoutGrid, RotateCcw, UserRound, WifiOff } from "lucide-react";
import { useI18n, type StringKey } from "../i18n";
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

/** Secondary navigation shared by all quiz pages. The language is chosen in the site header. */
export function QuizNav() {
  const { t } = useI18n();
  return (
    <nav aria-label={t("a11ySections")} className="bg-parchment border-b border-maroon/10">
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
      </div>
    </nav>
  );
}
