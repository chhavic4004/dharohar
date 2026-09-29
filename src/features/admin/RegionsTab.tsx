import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { AdminKey } from "../../i18n/pages/adminHeatmap";
import { BAND_KEY, bandOf, heatColor, type RegionRow } from "./data";
import { useAdminText } from "./useAdminText";

export type RegionSortKey = keyof RegionRow;
export interface RegionSort {
  key: RegionSortKey;
  dir: "asc" | "desc";
}

export const REGION_COLUMNS: { key: RegionSortKey; label: AdminKey; numeric: boolean }[] = [
  { key: "state", label: "colState", numeric: false },
  { key: "tracked", label: "colTracked", numeric: true },
  { key: "avgHvs", label: "colAvgHvs", numeric: true },
  { key: "critical", label: "colCritical", numeric: true },
  { key: "submissions", label: "colSubmissions", numeric: true },
  { key: "teams", label: "colTeams", numeric: true },
];

export function sortRegions(rows: RegionRow[], sort: RegionSort, label: (s: string) => string, locale: string): RegionRow[] {
  const m = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (sort.key === "state") return label(a.state).localeCompare(label(b.state), locale) * m;
    return ((a[sort.key] as number) - (b[sort.key] as number)) * m || label(a.state).localeCompare(label(b.state), locale);
  });
}

export default function RegionsTab({ rows, sort, onSort }: { rows: RegionRow[]; sort: RegionSort; onSort: (s: RegionSort) => void }) {
  const { t, num, place } = useAdminText();
  const totals = rows.reduce((s, r) => ({ tracked: s.tracked + r.tracked, critical: s.critical + r.critical, submissions: s.submissions + r.submissions, teams: s.teams + r.teams }), { tracked: 0, critical: 0, submissions: 0, teams: 0 });

  const click = (key: RegionSortKey) =>
    onSort(sort.key === key ? { key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "state" ? "asc" : "desc" });

  return (
    <section className="bg-[#241b1d] border border-parchment/10 rounded-xl p-5 sm:p-6" aria-labelledby="regions-h">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 id="regions-h" className="font-serif text-xl">{t("regionsTitle")}</h2>
          <p className="text-parchment/55 text-sm mt-1">{t("regionsDesc")}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-parchment/60" aria-hidden="true">
          <span>{t("heatLow")}</span>
          <span data-keep className="w-28 h-2 rounded-full" style={{ background: `linear-gradient(to right, ${heatColor(0)}, ${heatColor(50)}, ${heatColor(100)})` }} />
          <span>{t("heatHigh")}</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-parchment/60 text-sm">{t("noData")}</p>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="sr-only">{t("regionsTitle")}</caption>
            <thead>
              <tr className="border-b border-parchment/10 text-parchment/60">
                {REGION_COLUMNS.map((c) => {
                  const active = sort.key === c.key;
                  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
                  return (
                    <th key={c.key} scope="col" aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={`py-2 px-3 font-medium ${c.numeric ? "text-end" : "text-start"}`}>
                      <button
                        type="button"
                        onClick={() => click(c.key)}
                        className={`inline-flex items-center gap-1 hover:text-parchment focus-visible:outline-2 focus-visible:outline-turmeric rounded ${active ? "text-parchment" : ""}`}
                        title={t("sortBy", { col: t(c.label) })}
                      >
                        {t(c.label)}
                        <Icon className="w-3 h-3 print:hidden" aria-hidden="true" />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.state} className="border-b border-parchment/5 hover:bg-white/[0.03]">
                  <th scope="row" className="py-2.5 px-3 text-start font-medium">{place(r.state)}</th>
                  <td className="py-2.5 px-3 text-end tabular-nums">{num(r.tracked)}</td>
                  <td className="py-2 px-3 text-end">
                    <span
                      data-keep
                      className="inline-flex items-center justify-end gap-1.5 min-w-[5.5rem] rounded px-2 py-1 tabular-nums text-white font-medium"
                      style={{ background: heatColor(r.avgHvs, 0.85) }}
                      title={t(BAND_KEY[bandOf(r.avgHvs)])}
                    >
                      {num(r.avgHvs)}
                      <span className="text-[10px] font-normal opacity-85">{t(BAND_KEY[bandOf(r.avgHvs)])}</span>
                    </span>
                  </td>
                  <td className={`py-2.5 px-3 text-end tabular-nums ${r.critical ? "text-alert font-semibold" : "text-parchment/50"}`}>{num(r.critical)}</td>
                  <td className="py-2.5 px-3 text-end tabular-nums">{num(r.submissions)}</td>
                  <td className="py-2.5 px-3 text-end tabular-nums">{num(r.teams)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="text-parchment/70">
                <th scope="row" className="py-2.5 px-3 text-start font-medium">{t("total")}</th>
                <td className="py-2.5 px-3 text-end tabular-nums">{num(totals.tracked)}</td>
                <td className="py-2.5 px-3" />
                <td className="py-2.5 px-3 text-end tabular-nums">{num(totals.critical)}</td>
                <td className="py-2.5 px-3 text-end tabular-nums">{num(totals.submissions)}</td>
                <td className="py-2.5 px-3 text-end tabular-nums">{num(totals.teams)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      <p className="text-[11px] text-parchment/40 mt-3">{t("regionsNote")}</p>
    </section>
  );
}
