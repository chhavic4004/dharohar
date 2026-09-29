import { useState } from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Eye, Info, RotateCcw } from "lucide-react";
import { ALERT_STATUS_KEY, SEVERITY_KEY, type AdminAlert, type AlertStatus, type Severity } from "./data";
import { useAdminText } from "./useAdminText";

const SEV: Record<Severity, { icon: typeof Info; text: string; border: string; chip: string }> = {
  critical: { icon: AlertOctagon, text: "text-alert", border: "border-s-alert", chip: "bg-alert/15 text-[#e08a6f] border-alert/40" },
  warning: { icon: AlertTriangle, text: "text-turmeric", border: "border-s-turmeric", chip: "bg-turmeric/15 text-turmeric border-turmeric/30" },
  info: { icon: Info, text: "text-[#8fc3a0]", border: "border-s-heritage", chip: "bg-heritage/20 text-[#8fc3a0] border-heritage/40" },
};

type AlertFilter = "active" | "all" | Severity;

export default function AlertsTab({ alerts, onStatus }: { alerts: AdminAlert[]; onStatus: (id: string, status: AlertStatus) => void }) {
  const { t, num, ago, heritageById } = useAdminText();
  const [filter, setFilter] = useState<AlertFilter>("active");
  const shown = alerts.filter((a) => (filter === "all" ? true : filter === "active" ? a.status !== "resolved" : a.severity === filter));
  const openBy = (s: Severity) => alerts.filter((a) => a.severity === s && a.status !== "resolved").length;

  return (
    <section className="bg-[#241b1d] border border-parchment/10 rounded-xl p-5 sm:p-6" aria-labelledby="alerts-h">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h2 id="alerts-h" className="font-serif text-xl">{t("alertsTitle")}</h2>
          <p className="text-parchment/55 text-sm mt-1">{t("alertsDesc")}</p>
        </div>
        <dl className="flex gap-4 text-sm">
          {(["critical", "warning", "info"] as Severity[]).map((s) => (
            <div key={s} className="text-center">
              <dt className={`text-xs ${SEV[s].text}`}>{t(SEVERITY_KEY[s])}</dt>
              <dd className="font-serif text-2xl tabular-nums">{num(openBy(s))}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div role="group" aria-label={t("filterLabel")} className="flex flex-wrap gap-2 mb-4 print:hidden">
        {(["active", "all", "critical", "warning", "info"] as AlertFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors focus-visible:outline-2 focus-visible:outline-turmeric ${
              filter === f ? "bg-turmeric text-ink border-turmeric font-medium" : "bg-white/5 border-white/10 text-parchment/75 hover:bg-white/10"
            }`}
          >
            {f === "active" ? t("filterActive") : f === "all" ? t("filterAll") : t(SEVERITY_KEY[f])}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-parchment/55 text-sm py-8 text-center">{t("noAlerts")}</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((a) => {
            const s = SEV[a.severity];
            const Icon = s.icon;
            return (
              <li key={a.id} className={`bg-white/[0.03] border border-white/5 border-s-4 ${s.border} rounded-lg p-4 ${a.status === "resolved" ? "opacity-60" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.text}`} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${s.chip}`}>{t(SEVERITY_KEY[a.severity])}</span>
                      <span className="text-[11px] text-parchment/45">{a.id} · {ago(a.hoursAgo)}</span>
                      <span className="text-[11px] text-parchment/60">· {t(ALERT_STATUS_KEY[a.status])}</span>
                    </div>
                    <p className="text-sm text-parchment/80">
                      <span className={`font-bold ${s.text}`}>{t(a.label)}</span>{" "}
                      {t(a.text, { name: heritageById(a.heritageId), ...Object.fromEntries(Object.entries(a.vars).map(([k, v]) => [k, num(v)])) })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 print:hidden">
                    {a.status === "open" && (
                      <button type="button" onClick={() => onStatus(a.id, "acknowledged")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-white/5 border border-white/10 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-turmeric">
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" /> {t("acknowledge")}
                      </button>
                    )}
                    {a.status !== "resolved" ? (
                      <button type="button" onClick={() => onStatus(a.id, "resolved")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-heritage/80 text-white hover:bg-heritage focus-visible:outline-2 focus-visible:outline-turmeric">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> {t("resolve")}
                      </button>
                    ) : (
                      <button type="button" onClick={() => onStatus(a.id, "open")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-white/5 border border-white/10 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-turmeric">
                        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> {t("reopen")}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
