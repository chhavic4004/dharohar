import { useState } from "react";
import { Trophy } from "lucide-react";
import type { CategoryId } from "@shared/quiz-contract";
import { quizApi } from "../api/quizApi";
import { CATEGORY_IDS } from "../constants";
import { useApi } from "../hooks/useApi";
import { Card, ErrorState, Spinner, cx } from "../components/ui";
import { useI18n, useDisplayName } from "../i18n";
import { useCategoryLabel } from "./QuizHome";

const MEDAL = ["#C68A1D", "#9aa3ad", "#b0714a"];

export default function Leaderboard() {
  const { t } = useI18n();
  const showName = useDisplayName();
  const catLabel = useCategoryLabel();
  const [scope, setScope] = useState<CategoryId | "overall">("overall");
  const board = useApi(() => quizApi.leaderboard(scope), [scope]);

  return (
    <div className="bg-parchment pb-16">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
          <Trophy className="w-7 h-7 text-turmeric" aria-hidden /> {t("leaderboard")}
        </h1>
        <p className="text-sm text-ink/60 mt-1">{t("leaderboardIntro")}</p>

        <div className="flex gap-2 overflow-x-auto mt-5 pb-1" role="tablist">
          {(["overall", ...CATEGORY_IDS] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={scope === s}
              onClick={() => setScope(s)}
              className={cx(
                "whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer",
                scope === s ? "bg-maroon text-white" : "bg-white/70 text-maroon hover:bg-white",
              )}
            >
              {s === "overall" ? t("overall") : catLabel(s)}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {board.loading ? (
            <Spinner label={t("loading")} />
          ) : board.error ? (
            <ErrorState error={board.error} onRetry={board.reload} />
          ) : board.data!.entries.length === 0 ? (
            <Card className="p-8 text-center text-sm text-ink/60">{t("noScores")}</Card>
          ) : (
            <Card className="overflow-hidden">
              <ol>
                {board.data!.entries.map((e) => (
                  <li
                    key={`${e.rank}-${e.displayName}`}
                    className={cx("flex items-center gap-3 px-4 py-3 border-b border-maroon/5 last:border-0", e.isYou && "bg-turmeric/10")}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={e.rank <= 3 ? { backgroundColor: MEDAL[e.rank - 1], color: "#fff" } : { color: "rgba(36,27,29,0.5)" }}
                    >
                      {e.rank}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-ink truncate">
                        {showName(e.displayName)}
                        {e.isYou && <span className="text-xs text-maroon ms-1.5">({t("you")})</span>}
                      </span>
                      <span className="block text-xs text-ink/50">{t("level", { n: e.level })}</span>
                    </span>
                    <span className="font-serif font-semibold text-maroon">{e.xp.toLocaleString("en-IN")} XP</span>
                  </li>
                ))}
              </ol>
              {board.data!.you && !board.data!.entries.some((e) => e.isYou) && (
                <div className="flex items-center gap-3 px-4 py-3 bg-turmeric/10 border-t border-maroon/10">
                  <span className="w-8 text-center text-sm font-bold text-ink/60">{board.data!.you.rank}</span>
                  <span className="flex-1 font-medium text-ink">{t("youLabel")}</span>
                  <span className="font-serif font-semibold text-maroon">{board.data!.you.xp} XP</span>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
