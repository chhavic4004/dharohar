import { useState, type FormEvent } from "react";
import { heritageName, stateName } from "../heritageText";
import { BarChart3, KeyRound } from "lucide-react";
import type { AdminStats, QuestionStat } from "@shared/quiz-contract";
import { ApiRequestError } from "../api/client";
import { quizApi } from "../api/quizApi";
import { CATEGORY_META } from "../constants";
import { useI18n, type StringKey } from "../i18n";
import { Button, Card, ProgressBar, SectionTitle } from "../components/ui";
import { useCategoryLabel } from "./QuizHome";

const KEY = "dharohar.adminKey";

function accColor(a: number) {
  return a < 40 ? "#A83E22" : a < 70 ? "#C68A1D" : "#3E6B4F";
}

function StatList({ items }: { items: QuestionStat[] }) {
  const { t } = useI18n();
  const catLabel = useCategoryLabel();
  if (!items.length) return <p className="text-sm text-ink/50">-</p>;
  return (
    <ul className="divide-y divide-maroon/10">
      {items.map((q) => (
        <li key={q.questionId} className="py-3">
          <p className="text-sm text-ink leading-snug">{q.prompt}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <ProgressBar value={q.accuracy / 100} color={accColor(q.accuracy)} className="flex-1 h-1.5" />
            <span className="text-xs font-semibold tabular-nums w-10 text-end" style={{ color: accColor(q.accuracy) }}>
              {q.accuracy}%
            </span>
          </div>
          <p className="text-[11px] text-ink/45 mt-1">
            {catLabel(q.category)} · {t(`type_${q.type}` as StringKey)} · {q.answered} {t("answered")} · {q.avgTimeSeconds}s · {q.questionId}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** Content team dashboard. Protected by ADMIN_KEY on the server. */
export default function Admin() {
  const { t, lang } = useI18n();
  const catLabel = useCategoryLabel();
  const [key, setKey] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setStats(await quizApi.adminStats(key));
      try {
        sessionStorage.setItem(KEY, key);
      } catch {
        /* ignore */
      }
    } catch (err) {
      setError(err instanceof ApiRequestError && (err.status === 401 || err.status === 403) ? t("adminWrongKey") : (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-parchment pb-16">
      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-maroon" aria-hidden /> {t("adminTitle")}
          </h1>
          <p className="text-sm text-ink/60 mt-1">{t("adminIntro")}</p>
        </div>

        <Card className="p-4">
          <form onSubmit={load} className="flex flex-wrap gap-2 items-center">
            <KeyRound className="w-4 h-4 text-maroon" aria-hidden />
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={t("adminKey")}
              aria-label={t("adminKey")}
              className="flex-1 min-w-[180px] rounded-lg border border-maroon/30 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-maroon"
            />
            <Button type="submit" className="px-4 py-2" loading={busy} disabled={!key}>
              {t("loadStats")}
            </Button>
          </form>
          {error && <p className="text-sm text-alert mt-2">{error}</p>}
        </Card>

        {stats && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(
                [
                  ["players", stats.totals.players],
                  ["quizzes", stats.totals.quizzes],
                  ["answers", stats.totals.answers],
                  ["dailyAnswers", stats.totals.dailyAnswers],
                  ["redemptions", stats.totals.redemptions],
                ] as [StringKey, number][]
              ).map(([k, v]) => (
                <Card key={k} className="p-4 text-center">
                  <p className="font-serif text-2xl font-bold text-ink">{v.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-ink/55">{t(k)}</p>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5">
                <h2 className="font-serif font-semibold text-ink mb-3">{t("byCategory")}</h2>
                <ul className="space-y-3">
                  {stats.byCategory.map((c) => {
                    const m = CATEGORY_META[c.category];
                    return (
                      <li key={c.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-1.5">
                            <m.icon className="w-4 h-4" style={{ color: m.color }} aria-hidden /> {catLabel(c.category)}
                          </span>
                          <span className="text-xs text-ink/55">
                            {c.accuracy}% · {c.answered}
                          </span>
                        </div>
                        <ProgressBar value={c.accuracy / 100} color={m.color} className="h-1.5" />
                      </li>
                    );
                  })}
                </ul>
              </Card>
              <Card className="p-5">
                <h2 className="font-serif font-semibold text-ink mb-3">{t("byType")}</h2>
                <ul className="space-y-3">
                  {stats.byType.map((c) => (
                    <li key={c.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t(`type_${c.type}` as StringKey)}</span>
                        <span className="text-xs text-ink/55">
                          {c.accuracy}% · {c.answered}
                        </span>
                      </div>
                      <ProgressBar value={c.accuracy / 100} color={accColor(c.accuracy)} className="h-1.5" />
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <section>
              <SectionTitle>{t("awarenessGaps")}</SectionTitle>
              <p className="text-sm text-ink/60 text-center -mt-2 mb-4">{t("awarenessIntro")}</p>
              <Card className="p-5">
                {stats.awarenessGaps.length === 0 ? (
                  <p className="text-sm text-ink/50">-</p>
                ) : (
                  <ul className="divide-y divide-maroon/10">
                    {stats.awarenessGaps.map((g) => (
                      <li key={g.heritage.id} className="py-3 flex items-center gap-3">
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-ink">{heritageName(g.heritage, lang)}</span>
                          <span className="block text-[11px] text-ink/45">
                            {g.heritage.state ? stateName(g.heritage.state, lang) : g.heritage.kind}
                            {g.heritage.hvs ? ` · HVS ${g.heritage.hvs.score} (${t(`band_${g.heritage.hvs.band}` as StringKey)})` : ""} · {g.answered} {t("answered")}
                          </span>
                        </span>
                        <span className="font-semibold text-sm tabular-nums" style={{ color: accColor(g.accuracy) }}>
                          {g.accuracy}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </section>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5">
                <h2 className="font-serif font-semibold text-ink mb-1">{t("hardest")}</h2>
                <StatList items={stats.hardest} />
              </Card>
              <Card className="p-5">
                <h2 className="font-serif font-semibold text-ink mb-1">{t("easiest")}</h2>
                <StatList items={stats.easiest} />
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
