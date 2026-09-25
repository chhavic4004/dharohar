import { NavLink } from "react-router";
import { BarChart3, CalendarDays, Gift, LayoutGrid, UserRound } from "lucide-react";
import { cx } from "./ui";

const LINKS = [
  { to: "/quiz", label: "Quizzes", icon: LayoutGrid, end: true },
  { to: "/quiz/daily", label: "Daily", icon: CalendarDays },
  { to: "/quiz/rewards", label: "Rewards", icon: Gift },
  { to: "/quiz/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { to: "/quiz/profile", label: "My Progress", icon: UserRound },
];

/** Secondary navigation shared by all quiz pages. */
export function QuizNav() {
  return (
    <nav aria-label="Quiz sections" className="bg-parchment border-b border-maroon/10">
      <div className="max-w-3xl mx-auto px-2 flex gap-1 overflow-x-auto">
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
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
