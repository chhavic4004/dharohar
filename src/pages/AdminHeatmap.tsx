import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Bell, Download, FileText, LayoutDashboard, Map, Printer, ShieldCheck, TrendingDown, TrendingUp, UserCircle2, Users } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { showToast } from "../lib/toast";
import AlertsTab from "../features/admin/AlertsTab";
import { Sparkline, CHART_COLORS } from "../features/admin/charts";
import { downloadCsv } from "../features/admin/csv";
import {
  ALERT_STATUS_KEY,
  buildKpis,
  buildRegions,
  CONTRIBUTORS,
  contributions,
  contributorById,
  DEMO_ALERTS,
  DEMO_SUBMISSIONS,
  DEMO_TEAMS,
  PERSONA_KEY,
  RANGES,
  rangeOf,
  seeded,
  SEVERITY_KEY,
  STATUS_KEY,
  TYPE_KEY,
  type AdminAlert,
  type AlertStatus,
  type RangeId,
  type SubStatus,
  type Submission,
  type Team,
} from "../features/admin/data";
import DispatchModal, { type DispatchRequest } from "../features/admin/DispatchModal";
import OverviewTab from "../features/admin/OverviewTab";
import RegionsTab, { REGION_COLUMNS, sortRegions, type RegionSort } from "../features/admin/RegionsTab";
import SubmissionsTab, { type SubFilter } from "../features/admin/SubmissionsTab";
import UsersTab from "../features/admin/UsersTab";
import { useAdminHeritage } from "../features/admin/useAdminHeritage";
import { useAdminText } from "../features/admin/useAdminText";
import type { AdminKey } from "../i18n/pages/adminHeatmap";

type TabId = "overview" | "regions" | "submissions" | "alerts" | "users";

const TABS: { id: TabId; label: AdminKey; icon: typeof Map }[] = [
  { id: "overview", label: "tabOverview", icon: LayoutDashboard },
  { id: "regions", label: "tabRegions", icon: Map },
  { id: "submissions", label: "tabSubmissions", icon: FileText },
  { id: "alerts", label: "tabAlerts", icon: Bell },
  { id: "users", label: "tabUsers", icon: Users },
];

/** Print only the report: hide the site chrome, switch to black on white. */
const PRINT_CSS = `
@media print {
  @page { margin: 14mm; }
  body * { visibility: hidden !important; }
  #admin-report, #admin-report * { visibility: visible !important; }
  #admin-report { position: absolute; inset: 0 auto auto 0; width: 100%; padding: 0 !important; }
  #admin-report, #admin-report *:not([data-keep]) { color: #111 !important; background: transparent !important; box-shadow: none !important; }
  #admin-report * { border-color: #ccc !important; }
  #admin-report [data-keep] { -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #fff !important; }
  #admin-report section, #admin-report li { break-inside: avoid; }
}`;

export default function AdminHeatmap() {
  const { t, dir, locale, num, pct, place, ago, heritageById } = useAdminText();
  const { items, source } = useAdminHeritage();

  const [range, setRange] = useState<RangeId>("30d");
  const [tab, setTab] = useState<TabId>("overview");
  const [subs, setSubs] = useState<Submission[]>(DEMO_SUBMISSIONS);
  const [subFilter, setSubFilter] = useState<SubFilter>("all");
  const [alerts, setAlerts] = useState<AdminAlert[]>(DEMO_ALERTS);
  const [teams, setTeams] = useState<Team[]>(DEMO_TEAMS);
  const [regionSort, setRegionSort] = useState<RegionSort>({ key: "avgHvs", dir: "desc" });
  const [dispatchReq, setDispatchReq] = useState<DispatchRequest | null>(null);
  const [updatedAt] = useState(() => new Date());
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ overview: null, regions: null, submissions: null, alerts: null, users: null });

  const deployments = useMemo(() => {
    const d: Record<string, number> = {};
    for (const tm of teams) if (tm.status === "deployed" && tm.deployedTo) d[tm.deployedTo] = (d[tm.deployedTo] ?? 0) + 1;
    return d;
  }, [teams]);

  const kpis = useMemo(() => buildKpis(range, items), [range, items]);
  const regions = useMemo(() => buildRegions(items, range, deployments), [items, range, deployments]);
  const sortedRegions = useMemo(() => sortRegions(regions, regionSort, place, locale), [regions, regionSort, place, locale]);
  const pending = subs.filter((s) => s.status === "pending").length;
  const openAlerts = alerts.filter((a) => a.status === "open").length;

  // Keep the backlog alert in step with the real queue length
  const liveAlerts = useMemo(() => alerts.map((a) => (a.label === "backlogLabel" ? { ...a, vars: { n: pending } } : a)), [alerts, pending]);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = PRINT_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  // ─── Actions ────────────────────────────────────────────────────────────────

  const moderate = (id: string, status: SubStatus) => {
    const s = subs.find((x) => x.id === id);
    setSubs((xs) => xs.map((x) => (x.id === id ? { ...x, status } : x)));
    if (s) showToast(t(status === "approved" ? "toastApproved" : status === "rejected" ? "toastRejected" : "toastChanges", { title: t(s.title) }));
  };

  const setAlertStatus = (id: string, status: AlertStatus) => {
    setAlerts((xs) => xs.map((a) => (a.id === id ? { ...a, status } : a)));
    showToast(t(status === "acknowledged" ? "toastAck" : status === "resolved" ? "toastResolved" : "toastReopened", { id }));
  };

  const confirmDispatch = useCallback(
    (teamId: string, state: string) => {
      const tm = teams.find((x) => x.id === teamId);
      const eta = 2 + Math.floor(seeded(`${teamId}-${state}`)() * 5);
      setTeams((xs) => xs.map((x) => (x.id === teamId ? { ...x, status: "deployed", deployedTo: state } : x)));
      if (tm) showToast(t("dispatchSuccess", { team: t(tm.name), state: place(state), days: num(eta) }));
      return eta;
    },
    [teams, t, place, num],
  );
  const closeDispatch = useCallback(() => setDispatchReq(null), []);

  const alertMessage = (a: AdminAlert) =>
    `${t(a.label)} ${t(a.text, { name: heritageById(a.heritageId), ...Object.fromEntries(Object.entries(a.vars).map(([k, v]) => [k, num(v)])) })}`;

  const exportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const file = `dharohar-${tab}-${range}-${stamp}.csv`;
    if (tab === "overview") {
      downloadCsv(
        file,
        [t("csvMetric"), t("csvCurrent"), t("csvPrevious"), t("csvChange")],
        kpis.map((k) => [t(k.label), k.value, k.prev, k.prev ? pct(((k.value - k.prev) / k.prev) * 100, true) : "-"]),
      );
    } else if (tab === "regions") {
      downloadCsv(file, REGION_COLUMNS.map((c) => t(c.label)), sortedRegions.map((r) => [place(r.state), r.tracked, r.avgHvs, r.critical, r.submissions, r.teams]));
    } else if (tab === "submissions") {
      const shown = subFilter === "all" ? subs : subs.filter((s) => s.status === subFilter);
      downloadCsv(
        file,
        [t("colId"), t("colType"), t("colTitle"), t("colTradition"), t("colContributor"), t("colState"), t("colDate"), t("colStatus")],
        shown.map((s) => {
          const c = contributorById.get(s.contributor);
          return [s.id, t(TYPE_KEY[s.type]), t(s.title), heritageById(s.heritageId), c ? t(c.name) : "", place(s.state), s.date, t(STATUS_KEY[s.status])];
        }),
      );
    } else if (tab === "alerts") {
      downloadCsv(
        file,
        [t("colId"), t("colSeverity"), t("colStatus"), t("colMessage"), t("colTime")],
        liveAlerts.map((a) => [a.id, t(SEVERITY_KEY[a.severity]), t(ALERT_STATUS_KEY[a.status]), alertMessage(a), ago(a.hoursAgo)]),
      );
    } else {
      downloadCsv(
        file,
        [t("colName"), t("colPersona"), t("colState"), t("colContribs"), t("colVerifiedRate")],
        CONTRIBUTORS.map((c) => [t(c.name), t(PERSONA_KEY[c.persona]), place(c.state), contributions(c, range), pct(c.verifiedRate)]),
      );
    }
    showToast(t("csvDone"));
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const rtl = dir === "rtl";
    let next = -1;
    if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) next = (i + 1) % TABS.length;
    else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  const tabBadge = (id: TabId) => (id === "submissions" ? pending : id === "alerts" ? openAlerts : 0);

  return (
    <div id="admin-report" className="flex-1 bg-[#1a1516] text-parchment py-8" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5 mb-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-turmeric text-sm font-medium tracking-wide uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" /> {t("badge")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-maroon/40 border border-maroon text-parchment/90">
                <UserCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> {t("roleBadge")}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                  source === "live" ? "border-heritage/50 text-[#8fc3a0]" : source === "demo" ? "border-turmeric/40 text-turmeric" : "border-white/15 text-parchment/60"
                }`}
              >
                <span data-keep className={`w-1.5 h-1.5 rounded-full ${source === "live" ? "bg-heritage" : source === "demo" ? "bg-turmeric" : "bg-parchment/40 animate-pulse"}`} aria-hidden="true" />
                {t(source === "live" ? "sourceLive" : source === "demo" ? "sourceDemo" : "sourceLoading")}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl mb-1">{t("title")}</h1>
            <p className="text-parchment/60 text-sm">{t("subtitle")}</p>
            <p className="text-parchment/40 text-xs mt-2">
              {t("lastUpdated", { time: updatedAt.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }) })}
              <span className="hidden print:inline"> · {t("printPeriod", { period: t(rangeOf(range).label) })}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center shrink-0 print:hidden">
            <div role="group" aria-label={t("rangeLabel")} className="inline-flex rounded-lg bg-white/5 border border-white/10 p-1 self-start">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={range === r.id}
                  onClick={() => setRange(r.id)}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm transition-colors focus-visible:outline-2 focus-visible:outline-turmeric ${
                    range === r.id ? "bg-parchment text-ink font-medium" : "text-parchment/70 hover:text-parchment"
                  }`}
                >
                  {t(r.label)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded text-sm hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-turmeric">
                <Download className="w-4 h-4" aria-hidden="true" /> {t("exportCsv")}
              </button>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 bg-turmeric text-ink px-4 py-2 rounded text-sm font-medium hover:bg-parchment transition-colors focus-visible:outline-2 focus-visible:outline-parchment">
                <Printer className="w-4 h-4" aria-hidden="true" /> {t("printReport")}
              </button>
            </div>
          </div>
        </Reveal>

        {/* KPI row */}
        <Reveal delay={60} className="mb-6">
          <h2 className="sr-only">{t("kpiHeading")}</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {kpis.map((k) => {
              const delta = k.prev ? ((k.value - k.prev) / k.prev) * 100 : 0;
              const good = Math.round(delta) === 0 ? null : delta > 0 === k.upIsGood;
              const color = good === null ? "text-parchment/50" : good ? "text-[#8fc3a0]" : "text-[#e08a6f]";
              return (
                <li key={k.id} className="bg-[#241b1d] border border-parchment/10 rounded-xl p-4 flex flex-col gap-2 min-w-0">
                  <span className="text-xs text-parchment/60 leading-tight">{t(k.label)}</span>
                  <div className="flex items-end justify-between gap-2">
                    <span className={`font-serif text-2xl tabular-nums ${k.id === "critical" ? "text-alert" : ""}`}>{num(k.value)}</span>
                    <Sparkline values={k.series} color={k.id === "critical" ? CHART_COLORS.alert : CHART_COLORS.turmeric} width={64} height={24} />
                  </div>
                  <span className={`text-[11px] flex items-center gap-1 ${color}`}>
                    {good !== null && (delta > 0 ? <TrendingUp className="w-3 h-3" aria-hidden="true" /> : <TrendingDown className="w-3 h-3" aria-hidden="true" />)}
                    {t("deltaVsPrev", { pct: pct(delta, true) })}
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={120}>
          <div role="tablist" aria-label={t("tabsLabel")} className="flex gap-1 overflow-x-auto border-b border-parchment/10 mb-6 print:hidden">
            {TABS.map((tb, i) => {
              const Icon = tb.icon;
              const active = tab === tb.id;
              const badge = tabBadge(tb.id);
              return (
                <button
                  key={tb.id}
                  ref={(el) => {
                    tabRefs.current[tb.id] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${tb.id}`}
                  aria-selected={active}
                  aria-controls={`panel-${tb.id}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setTab(tb.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-turmeric -mb-px border-b-2 ${
                    active ? "border-turmeric text-parchment font-medium" : "border-transparent text-parchment/60 hover:text-parchment"
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {t(tb.label)}
                  {badge > 0 && (
                    <span className={`text-[10px] min-w-5 px-1.5 py-0.5 rounded-full tabular-nums ${tb.id === "alerts" ? "bg-alert text-white" : "bg-turmeric text-ink"}`}>
                      <span className="sr-only">(</span>
                      {num(badge)}
                      <span className="sr-only">)</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <h2 className="hidden print:block font-serif text-2xl mb-4">{t(TABS.find((x) => x.id === tab)!.label)}</h2>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="outline-none">
            {tab === "overview" && <OverviewTab items={items} range={range} onDirectTeam={(state) => setDispatchReq({ state })} />}
            {tab === "regions" && <RegionsTab rows={sortedRegions} sort={regionSort} onSort={setRegionSort} />}
            {tab === "submissions" && <SubmissionsTab subs={subs} filter={subFilter} onFilter={setSubFilter} onAction={moderate} />}
            {tab === "alerts" && <AlertsTab alerts={liveAlerts} onStatus={setAlertStatus} />}
            {tab === "users" && <UsersTab range={range} teams={teams} onDispatch={(teamId) => setDispatchReq({ teamId })} />}
          </div>
        </Reveal>

        <p className="text-[11px] text-parchment/35 mt-8">{t("footerNote")}</p>
      </div>

      {dispatchReq && <DispatchModal request={dispatchReq} regions={regions} teams={teams} onClose={closeDispatch} onConfirm={confirmDispatch} />}
    </div>
  );
}
