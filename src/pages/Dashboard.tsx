import { useCallback, useMemo, useState } from "react";
import { Activity, AlertTriangle, ChevronRight, Info, Layers, RefreshCw, Search, ShieldAlert, SlidersHorizontal, X } from "lucide-react";
import type { HvsBand } from "@shared/quiz-contract";
import { Reveal } from "../components/Reveal";
import { usePageText } from "../i18n/page";
import { dashboardText } from "../i18n/pages/dashboard";
import type { SiteLang } from "../lib/language";
import { heritageName, stateName } from "../features/quiz/heritageText";
import { BANDS, KINDS, searchText, sortEntries, type HeritageKind, type SortKey, type VulnEntry } from "../features/vulnerability/data";
import { useVulnerabilityData } from "../features/vulnerability/useVulnerabilityData";
import { BandPill, KIND_ICON, KindBadge, SourceBadge } from "../features/vulnerability/Badges";
import StateSummary, { stateStats } from "../features/vulnerability/StateSummary";
import DetailsDrawer from "../features/vulnerability/DetailsDrawer";
import { BAND_CLASS, BAND_KEY, TAB_KEY, type DashKey, type T } from "../features/vulnerability/ui";

type Tab = "all" | HeritageKind;
const SORTS: { id: SortKey; key: DashKey }[] = [
  { id: "risk-desc", key: "sortRiskDesc" },
  { id: "risk-asc", key: "sortRiskAsc" },
  { id: "name", key: "sortName" },
  { id: "state", key: "sortState" },
];
const KPI_KEY: Record<HvsBand, DashKey> = { Critical: "kpiCritical", Vulnerable: "kpiVulnerable", Stable: "kpiStable" };

const inputCls =
  "w-full bg-white border border-maroon/20 rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta";

export default function Dashboard() {
  const { t, lang, dir, locale } = usePageText(dashboardText);
  const { entries, status, retry } = useVulnerabilityData();
  const fmt = useCallback((n: number) => n.toLocaleString(locale), [locale]);

  const [tab, setTab] = useState<Tab>("all");
  const [state, setState] = useState("all");
  const [bands, setBands] = useState<Set<HvsBand>>(new Set());
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("risk-desc");
  const [openId, setOpenId] = useState<string | null>(null);

  const loading = status === "loading" && entries.length === 0;

  const inTab = useMemo(() => (tab === "all" ? entries : entries.filter((e) => e.kind === tab)), [entries, tab]);

  const kpis = useMemo(() => {
    const count = (b: HvsBand) => inTab.filter((e) => e.band === b).length;
    const avg = inTab.length ? Math.round(inTab.reduce((s, e) => s + e.score, 0) / inTab.length) : 0;
    return { total: inTab.length, Critical: count("Critical"), Vulnerable: count("Vulnerable"), Stable: count("Stable"), avg };
  }, [inTab]);

  const stateOptions = useMemo(
    () => stateStats(entries).map((s) => s.state).sort((a, b) => stateName(a, lang).localeCompare(stateName(b, lang), locale)),
    [entries, lang, locale],
  );

  const searchIndex = useMemo(() => new Map(entries.map((e) => [e.id, searchText(e)])), [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const xs = inTab.filter(
      (e) =>
        (state === "all" || e.states.includes(state)) &&
        (bands.size === 0 || bands.has(e.band)) &&
        (!q || (searchIndex.get(e.id) ?? "").includes(q) || heritageName(e.link, lang).toLocaleLowerCase().includes(q)),
    );
    return sortEntries(xs, sort, lang, locale);
  }, [inTab, state, bands, query, sort, lang, locale, searchIndex]);

  const hasFilters = state !== "all" || bands.size > 0 || query.trim() !== "";
  const clearFilters = () => {
    setState("all");
    setBands(new Set());
    setQuery("");
  };
  const toggleBand = (b: HvsBand) =>
    setBands((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });

  const open = entries.find((e) => e.id === openId) ?? null;
  const closeDrawer = useCallback(() => setOpenId(null), []);

  const tabs: { id: Tab; key: DashKey; count: number }[] = [
    { id: "all", key: "tabAll", count: entries.length },
    ...KINDS.map((k) => ({ id: k as Tab, key: TAB_KEY[k], count: entries.filter((e) => e.kind === k).length })),
  ];

  return (
    <div dir={dir} className="flex-1 bg-parchment py-10 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-maroon mb-2 flex items-center gap-3">
              {t("title")} <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-alert shrink-0" />
            </h1>
            <p className="text-ink/70 max-w-2xl text-lg">{t("intro")}</p>
            <p className="text-ink/60 max-w-2xl text-sm mt-2">{t("introExplorer")}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-maroon/20 shadow-sm card-shadow text-xs text-ink/80 max-w-sm w-full md:w-auto">
            <div className="font-medium text-maroon mb-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> {t("formulaTitle")}
            </div>
            <code className="bg-parchment px-2 py-1 rounded block text-maroon font-medium mb-1">{t("formula")}</code>
            <code className="bg-parchment/60 px-2 py-1 rounded block text-ink/80 mb-1">{t("formulaHvs")}</code>
            <div className="opacity-70">{t("formulaNote")}</div>
          </div>
        </Reveal>

        <div className="bg-turmeric/20 text-ink px-4 py-3 rounded-md border border-turmeric/40 text-sm font-medium mb-6 flex items-start gap-3">
          <Activity className="w-5 h-5 shrink-0 text-turmeric mt-0.5" />
          <p>{t("disclaimer")}</p>
        </div>

        {status === "fallback" && (
          <div role="alert" className="bg-alert/5 border border-alert/25 rounded-md px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-alert shrink-0" aria-hidden />
            <div className="flex-1 text-sm">
              <div className="font-semibold text-alert">{t("errorTitle")}</div>
              <div className="text-ink/70">{t("errorBody")}</div>
            </div>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-md bg-maroon text-parchment text-sm font-medium hover:bg-maroon/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            >
              <RefreshCw className="w-4 h-4" aria-hidden /> {t("retry")}
            </button>
          </div>
        )}

        {/* Category tabs */}
        <div role="tablist" aria-label={t("categoryLabel")} className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((x) => {
            const Icon = x.id === "all" ? Layers : KIND_ICON[x.id];
            const active = tab === x.id;
            return (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(x.id)}
                className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ${
                  active ? "bg-maroon text-parchment border-maroon" : "bg-white text-ink/80 border-maroon/15 hover:border-maroon/40"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden />
                {t(x.key)}
                {!loading && <span className={`text-xs tabular-nums ${active ? "text-parchment/70" : "text-ink/45"}`}>{fmt(x.count)}</span>}
              </button>
            );
          })}
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
          {loading ? (
            Array.from({ length: 5 }, (_, i) => <div key={i} className="h-24 rounded-xl bg-white/70 border border-maroon/10 animate-pulse" />)
          ) : (
            <>
              <Kpi label={t("kpiTotal")} value={fmt(kpis.total)} tone="text-maroon" />
              {BANDS.map((b) => (
                <Kpi
                  key={b}
                  label={t(KPI_KEY[b])}
                  value={fmt(kpis[b])}
                  tone={BAND_CLASS[b].text}
                  note={kpis.total ? t("kpiShare", { pct: fmt(Math.round((kpis[b] / kpis.total) * 100)) }) : undefined}
                  dot={BAND_CLASS[b].dot}
                />
              ))}
              <Kpi label={t("kpiAverage")} value={fmt(kpis.avg)} tone="text-ink" note={t("kpiAverageNote")} className="col-span-2 lg:col-span-1" />
            </>
          )}
        </div>

        {/* Band distribution */}
        <div className="bg-white rounded-xl border border-maroon/10 shadow-sm p-4 mb-8">
          <div className="text-xs font-medium uppercase tracking-wider text-ink/55 mb-2">{t("distributionTitle")}</div>
          {loading ? (
            <div className="h-4 rounded-full bg-parchment animate-pulse" />
          ) : (
            <>
              <div
                className="flex h-4 rounded-full overflow-hidden bg-parchment"
                role="img"
                aria-label={BANDS.map((b) => `${t(BAND_KEY[b])}: ${fmt(kpis[b])}`).join(", ")}
              >
                {BANDS.map((b) =>
                  kpis[b] ? (
                    <div
                      key={b}
                      className={`${BAND_CLASS[b].bar} h-full transition-all`}
                      style={{ width: `${(kpis[b] / Math.max(1, kpis.total)) * 100}%` }}
                      title={`${t(BAND_KEY[b])}: ${fmt(kpis[b])}`}
                    />
                  ) : null,
                )}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-ink/70">
                {BANDS.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${BAND_CLASS[b].dot}`} aria-hidden />
                    {t(BAND_KEY[b])} · {fmt(kpis[b])}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters + list */}
          <div className="lg:col-span-2 space-y-4 min-w-0">
            <div className="bg-white rounded-xl border border-maroon/10 shadow-sm p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="sm:col-span-3 block">
                  <span className="sr-only">{t("searchLabel")}</span>
                  <span className="relative block">
                    <Search className="w-4 h-4 text-ink/40 absolute top-1/2 -translate-y-1/2 start-3" aria-hidden />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t("searchPlaceholder")}
                      className={`${inputCls} ps-9`}
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-ink/60 mb-1 block">{t("filterState")}</span>
                  <select value={state} onChange={(e) => setState(e.target.value)} className={inputCls}>
                    <option value="all">{t("allStates")}</option>
                    {stateOptions.map((s) => (
                      <option key={s} value={s}>
                        {stateName(s, lang)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-ink/60 mb-1 block">{t("sortLabel")}</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={inputCls}>
                    {SORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {t(s.key)}
                      </option>
                    ))}
                  </select>
                </label>
                <fieldset>
                  <legend className="text-xs font-medium text-ink/60 mb-1">{t("filterBand")}</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {BANDS.map((b) => {
                      const on = bands.has(b);
                      return (
                        <button
                          key={b}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleBand(b)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ${
                            on ? `${BAND_CLASS[b].pill} ring-1 ring-current` : "bg-white border-maroon/15 text-ink/70 hover:border-maroon/35"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${BAND_CLASS[b].dot}`} aria-hidden />
                          {t(BAND_KEY[b])}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-ink/60 border-t border-maroon/5 pt-2">
                <span className="inline-flex items-center gap-1.5" aria-live="polite">
                  <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden />
                  {loading ? t("loading") : t("resultsCount", { count: fmt(filtered.length), total: fmt(inTab.length) })}
                </span>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 font-medium text-terracotta hover:text-maroon">
                    <X className="w-3.5 h-3.5" aria-hidden /> {t("clearFilters")}
                  </button>
                )}
              </div>
            </div>

            <Reveal className="bg-white rounded-xl shadow-sm border border-maroon/10 overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 border-b border-maroon/10 bg-parchment/30 text-xs font-medium uppercase tracking-wider text-ink/60">
                <div className="col-span-5">{t("colTradition")}</div>
                <div className="col-span-5">{t("colScore")}</div>
                <div className="col-span-2 text-end">{t("colStatus")}</div>
              </div>

              {loading ? (
                <div className="divide-y divide-maroon/5" aria-busy="true" aria-label={t("loading")}>
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/2 bg-parchment rounded" />
                        <div className="h-3 w-1/3 bg-parchment/70 rounded" />
                      </div>
                      <div className="h-3 w-1/3 bg-parchment rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-ink/60 text-sm">
                  {t("noResults")}
                  {hasFilters && (
                    <button type="button" onClick={clearFilters} className="block mx-auto mt-3 text-terracotta font-medium hover:text-maroon">
                      {t("clearFilters")}
                    </button>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-maroon/5">
                  {filtered.map((e) => (
                    <Row key={e.id} e={e} onOpen={setOpenId} t={t} lang={lang} fmt={fmt} />
                  ))}
                </ul>
              )}
            </Reveal>
          </div>

          {/* State summary */}
          <aside className="min-w-0">
            {loading ? (
              <div className="h-80 rounded-xl bg-white/70 border border-maroon/10 animate-pulse" />
            ) : (
              <div className="lg:sticky lg:top-24">
                <StateSummary entries={inTab} selected={state} onSelect={setState} t={t} lang={lang} locale={locale} />
              </div>
            )}
          </aside>
        </div>
      </div>

      {open && <DetailsDrawer entry={open} onClose={closeDrawer} t={t} lang={lang} locale={locale} dir={dir} />}
    </div>
  );
}

function Kpi({ label, value, tone, note, dot, className = "" }: { label: string; value: string; tone: string; note?: string; dot?: string; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-maroon/10 shadow-sm p-4 ${className}`}>
      <div className="text-xs font-medium text-ink/60 flex items-center gap-1.5">
        {dot && <span className={`w-2 h-2 rounded-full ${dot}`} aria-hidden />}
        {label}
      </div>
      <div className={`font-serif text-3xl mt-1 tabular-nums ${tone}`}>{value}</div>
      {note && <div className="text-[11px] text-ink/50 mt-0.5">{note}</div>}
    </div>
  );
}

function Row({ e, onOpen, t, lang, fmt }: { e: VulnEntry; onOpen: (id: string) => void; t: T; lang: SiteLang; fmt: (n: number) => string }) {
  const name = heritageName(e.link, lang);
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(e.id)}
        aria-haspopup="dialog"
        aria-label={`${name}, ${t(BAND_KEY[e.band])} ${fmt(e.score)}. ${t("viewDetails")}`}
        className="group w-full text-start grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 items-start sm:items-center hover:bg-parchment/30 focus:outline-none focus-visible:bg-parchment/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-terracotta transition-colors"
      >
        <div className="sm:col-span-5 min-w-0">
          <div className="font-serif text-lg text-ink leading-snug truncate group-hover:text-maroon">{name}</div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-xs text-ink/60 me-1">{stateName(e.link.state, lang) || t("noLocation")}</span>
            <KindBadge kind={e.kind} t={t} />
            <SourceBadge source={e.source} t={t} />
          </div>
        </div>
        <div className="sm:col-span-5 flex items-center gap-3">
          <div className="w-full bg-parchment rounded-full h-2.5 overflow-hidden border border-maroon/10">
            <div className={`h-full rounded-full ${BAND_CLASS[e.band].bar}`} style={{ width: `${e.score}%` }} />
          </div>
          <div className="font-mono text-sm font-medium w-8 text-end tabular-nums">{fmt(e.score)}</div>
        </div>
        <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
          <BandPill band={e.band} t={t} />
          <ChevronRight className="w-4 h-4 text-ink/30 group-hover:text-maroon rtl:-scale-x-100 shrink-0" aria-hidden />
        </div>
      </button>
    </li>
  );
}
