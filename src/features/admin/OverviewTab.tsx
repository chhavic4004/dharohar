import { AlertTriangle, BarChart, Send, TrendingDown, TrendingUp, Users } from "lucide-react";
import type { HeritageQuizInfo } from "@shared/quiz-contract";
import { CHART_COLORS, StackedBar, TrendChart } from "./charts";
import { BAND_KEY, hvsTrend, rangeOf, splitStates, tracked, trendDates, type RangeId } from "./data";
import { useAdminText } from "./useAdminText";

const BAND_COLOR = { Stable: CHART_COLORS.heritage, Vulnerable: CHART_COLORS.turmeric, Critical: CHART_COLORS.alert } as const;
const BAND_TEXT = { Stable: "text-heritage", Vulnerable: "text-turmeric", Critical: "text-alert" } as const;

export default function OverviewTab({ items, range, onDirectTeam }: { items: HeritageQuizInfo[]; range: RangeId; onDirectTeam: (state?: string) => void }) {
  const { t, locale, num, pct, date, place, heritage } = useAdminText();
  const list = tracked(items).sort((a, b) => b.heritage.hvs!.score - a.heritage.hvs!.score);
  const avg = list.length ? list.reduce((s, i) => s + i.heritage.hvs!.score, 0) / list.length : 0;
  const trend = hvsTrend(range, avg);
  const dates = trendDates(range).map((d) => date(d, rangeOf(range).id === "1y" ? { month: "short", year: "2-digit" } : { day: "numeric", month: "short" }));
  const change = trend[trend.length - 1] - trend[0];
  const counts = { Stable: 0, Vulnerable: 0, Critical: 0 };
  for (const i of list) counts[i.heritage.hvs!.band]++;
  const top = list.slice(0, 5);
  const worst = top[0];
  const worstState = splitStates(worst?.heritage.state)[0];
  const isSample = list.some((i) => i.heritage.hvs!.isSample);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* HVS trend */}
      <section className="lg:col-span-2 bg-[#241b1d] border border-parchment/10 rounded-xl p-5 sm:p-6" aria-labelledby="trend-h">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 id="trend-h" className="font-serif text-xl">{t("trendTitle")}</h2>
            <p className="text-parchment/55 text-sm mt-1">{t("trendDesc")}</p>
          </div>
          <div className="text-end">
            <div className="font-serif text-3xl tabular-nums">{num(avg)}</div>
            <div className={`text-xs flex items-center gap-1 justify-end ${change > 0 ? "text-alert" : "text-heritage"}`}>
              {change > 0 ? <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" /> : <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />}
              {t("trendChange", { v: change.toLocaleString(locale, { signDisplay: "exceptZero", maximumFractionDigits: 1 }) })}
            </div>
          </div>
        </div>
        <TrendChart
          values={trend}
          xLabels={dates}
          valueLabel={num}
          ariaLabel={t("trendAria", { from: num(trend[0]), to: num(avg) })}
          bandLabels={{ stable: t("bandStable"), vulnerable: t("bandVulnerable"), critical: t("bandCritical") }}
        />
        <p className="text-[11px] text-parchment/40 mt-2">{t("hvsExplain")}</p>
      </section>

      {/* Urgent intervention card */}
      <section className="bg-[#241b1d] border border-alert/30 rounded-xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(168,62,34,0.1)]" aria-labelledby="urgent-h">
        <div className="absolute top-0 end-0 p-4 opacity-10" aria-hidden="true">
          <AlertTriangle className="w-24 h-24 text-alert" />
        </div>
        {worst ? (
          <div className="relative z-10">
            <div className="text-alert font-bold tracking-wider text-xs mb-2">{t("urgentBanner")}</div>
            <h2 id="urgent-h" className="font-serif text-2xl mb-1">{heritage(worst.heritage)}</h2>
            <p className="text-sm text-parchment/60 mb-6">
              {t("scoreLine", { state: place(worst.heritage.state), score: num(worst.heritage.hvs!.score), band: t(BAND_KEY[worst.heritage.hvs!.band]) })}
            </p>
            <div className="space-y-4 mb-8">
              <Meter icon={<Users className="w-3 h-3 inline me-1" />} label={t("ageDecay")} value={t("critical")} valueClass="text-alert" width={85} barClass="bg-alert" note={t("ageNote", { pct: pct(85), age: num(65) })} />
              <Meter icon={<TrendingDown className="w-3 h-3 inline me-1" />} label={t("submissionRate")} value={t("submissionDelta", { pct: pct(-40, true) })} valueClass="text-turmeric" width={20} barClass="bg-turmeric" />
              <Meter icon={<BarChart className="w-3 h-3 inline me-1" />} label={t("queryGap")} value={t("high")} valueClass="text-parchment" width={60} barClass="bg-parchment/80" note={t("queryNote")} />
            </div>
            <button
              type="button"
              onClick={() => onDirectTeam(worstState)}
              className="print:hidden w-full bg-alert/20 text-alert border border-alert/50 py-3 rounded text-sm font-medium hover:bg-alert hover:text-white focus-visible:outline-2 focus-visible:outline-turmeric transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" aria-hidden="true" /> {t("directTeam")}
            </button>
          </div>
        ) : (
          <p className="text-parchment/60 text-sm">{t("noData")}</p>
        )}
      </section>

      {/* Band distribution */}
      <section className="bg-[#241b1d] border border-parchment/10 rounded-xl p-6" aria-labelledby="band-h">
        <h2 id="band-h" className="font-serif text-xl mb-1">{t("bandTitle")}</h2>
        <p className="text-parchment/55 text-sm mb-5">{t("bandDesc", { n: num(list.length) })}</p>
        <StackedBar
          parts={(["Critical", "Vulnerable", "Stable"] as const).map((b) => ({
            label: `${t(BAND_KEY[b])} · ${t(b === "Critical" ? "legendCritical" : b === "Vulnerable" ? "legendVulnerable" : "legendStable")}`,
            value: counts[b],
            color: BAND_COLOR[b],
            display: `${num(counts[b])} (${pct(list.length ? (counts[b] / list.length) * 100 : 0)})`,
          }))}
        />
        {isSample && <p className="text-[11px] text-parchment/40 mt-4">{t("sampleNote")}</p>}
      </section>

      {/* Top 5 at risk */}
      <section className="lg:col-span-2 bg-[#241b1d] border border-parchment/10 rounded-xl p-6" aria-labelledby="top-h">
        <h2 id="top-h" className="font-serif text-xl mb-4">{t("topRiskTitle")}</h2>
        <ol className="space-y-3">
          {top.map((i, k) => {
            const h = i.heritage;
            const band = h.hvs!.band;
            return (
              <li key={h.id} className="flex items-center gap-3 sm:gap-4">
                <span className="w-7 h-7 shrink-0 rounded-full bg-white/5 border border-white/10 grid place-items-center text-xs tabular-nums">{num(k + 1)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium truncate">{heritage(h)}</span>
                    <span className={`text-sm tabular-nums shrink-0 ${BAND_TEXT[band]}`}>{t("hvsValue", { score: num(h.hvs!.score) })}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="h-1.5 flex-1 bg-black/40 rounded-full overflow-hidden">
                      <div data-keep className="h-full rounded-full" style={{ width: `${h.hvs!.score}%`, background: BAND_COLOR[band] }} />
                    </div>
                    <span className="text-xs text-parchment/50 shrink-0 w-32 sm:w-44 truncate text-end">{place(h.state)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function Meter({ icon, label, value, valueClass, width, barClass, note }: { icon: React.ReactNode; label: string; value: string; valueClass: string; width: number; barClass: string; note?: string }) {
  return (
    <div>
      <div className="flex justify-between gap-2 text-xs mb-1">
        <span className="text-parchment/60">
          {icon}
          {label}
        </span>
        <span className={valueClass}>{value}</span>
      </div>
      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
        <div data-keep className={`h-full ${barClass}`} style={{ width: `${width}%` }} />
      </div>
      {note && <div className="text-[10px] text-parchment/40 mt-1">{note}</div>}
    </div>
  );
}
