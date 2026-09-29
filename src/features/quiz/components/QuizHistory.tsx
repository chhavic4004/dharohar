import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { CalendarDays, Gift, Loader2, Trophy, WifiOff } from "lucide-react";
import type { HistoryItem } from "@shared/quiz-contract";
import { siteText } from "../../../i18n/site";
import { quizApi } from "../api/quizApi";
import { CATEGORY_META } from "../constants";
import { I18nProvider, useI18n, type StringKey } from "../i18n";
import { useCategoryLabel } from "../pages/QuizHome";
import { cx } from "./ui";
import { localeOf } from "../../../lib/language";

const ICON = { quiz: Trophy, daily: CalendarDays, reward: Gift, offline: WifiOff } as const;

function Inner() {
  const { t, lang } = useI18n();
  const st = (k: Parameters<typeof siteText>[1], v?: Record<string, string | number>) => siteText(lang, k, v);
  const catLabel = useCategoryLabel();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = localeOf(lang);

  const load = useCallback(async (before?: string) => {
    setLoading(true);
    setError(null);
    try {
      const page = await quizApi.history(before);
      setItems((xs) => (before ? [...xs, ...page.items] : page.items));
      setNext(page.nextBefore);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const title = (h: HistoryItem) => {
    switch (h.kind) {
      case "quiz":
        return st("historyQuiz", { mode: t(`mode_${h.mode}` as StringKey), category: catLabel(h.category) });
      case "daily":
        return st("historyDaily");
      case "reward":
        return st("historyReward", { title: h.title });
      case "offline":
        return st("historyOffline", { category: catLabel(h.category) });
    }
  };

  if (!loading && !error && items.length === 0) return <p className="text-sm text-ink/60">{st("historyEmpty")}</p>;

  return (
    <div>
      <ol className="divide-y divide-maroon/10">
        {items.map((h, i) => {
          const Icon = ICON[h.kind];
          const when = new Date(h.at).toLocaleString(locale, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
          const body = (
            <>
              <span className={cx("shrink-0 w-9 h-9 rounded-full flex items-center justify-center", h.kind === "reward" ? "bg-turmeric/15 text-[#8a5f12]" : "bg-maroon/10 text-maroon")}>
                {h.kind === "quiz" ? (() => {
                  const C = CATEGORY_META[h.category].icon;
                  return <C className="w-4 h-4" aria-hidden />;
                })() : <Icon className="w-4 h-4" aria-hidden />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-ink truncate">{title(h)}</span>
                <span className="block text-xs text-ink/50">
                  {when}
                  {h.kind === "daily" && h.prompt ? ` · ${h.prompt}` : ""}
                </span>
              </span>
              <span className="text-end shrink-0">
                {h.kind === "quiz" || h.kind === "offline" ? (
                  <span className="block text-sm font-semibold text-ink">
                    {h.score}/{h.totalQuestions}
                  </span>
                ) : h.kind === "daily" ? (
                  <span className={cx("block text-sm font-semibold", h.correct ? "text-heritage" : "text-terracotta")}>
                    {h.correct ? st("historyCorrect") : st("historyWrong")}
                  </span>
                ) : (
                  <span className="block text-sm font-semibold text-[#8a5f12]">-{st("historyCoins", { n: h.cost })}</span>
                )}
                {h.kind !== "reward" && <span className="block text-[11px] text-maroon">+{h.xp} XP</span>}
              </span>
            </>
          );
          return (
            <li key={`${h.kind}-${h.at}-${i}`}>
              {h.kind === "quiz" ? (
                <Link to={`/quiz/results/${h.attemptId}`} className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-white/70">
                  {body}
                </Link>
              ) : (
                <div className="flex items-center gap-3 py-3">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
      {error && <p className="text-sm text-alert mt-2">{error}</p>}
      {loading && (
        <p className="flex justify-center py-4 text-maroon">
          <Loader2 className="w-5 h-5 animate-spin" aria-label={st("loading")} />
        </p>
      )}
      {!loading && next && (
        <button onClick={() => load(next)} className="mt-3 w-full rounded-xl border-2 border-maroon/30 text-maroon text-sm font-semibold py-2.5 hover:bg-maroon/5 cursor-pointer">
          {st("historyLoadMore")}
        </button>
      )}
    </div>
  );
}

/** Full account history (quizzes, daily problems, rewards, offline packs). Usable on any page. */
export default function QuizHistory() {
  return (
    <I18nProvider>
      <Inner />
    </I18nProvider>
  );
}
