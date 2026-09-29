import { useEffect, useRef, useState } from "react";
import { Check, FileText, Image, Mic, PencilLine, X } from "lucide-react";
import { contributorById, PERSONA_KEY, SIZE_KEY, STATUS_KEY, TYPE_KEY, type SubStatus, type Submission, type SubType } from "./data";
import { useAdminText } from "./useAdminText";

export type SubFilter = SubStatus | "all";

const TYPE_ICON: Record<SubType, typeof FileText> = { story: FileText, recording: Mic, photo: Image };
export const STATUS_STYLE: Record<SubStatus, string> = {
  pending: "bg-turmeric/15 text-turmeric border-turmeric/30",
  approved: "bg-heritage/20 text-[#8fc3a0] border-heritage/40",
  rejected: "bg-alert/15 text-[#e08a6f] border-alert/40",
  changes: "bg-terracotta/15 text-terracotta border-terracotta/40",
};

export default function SubmissionsTab({
  subs,
  filter,
  onFilter,
  onAction,
}: {
  subs: Submission[];
  filter: SubFilter;
  onFilter: (f: SubFilter) => void;
  onAction: (id: string, status: SubStatus) => void;
}) {
  const { t, num, date, place, heritageById } = useAdminText();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const shown = filter === "all" ? subs : subs.filter((s) => s.status === filter);
  const selected = subs.find((s) => s.id === selectedId) ?? null;
  const count = (f: SubFilter) => (f === "all" ? subs.length : subs.filter((s) => s.status === f).length);

  useEffect(() => {
    if (selected && window.matchMedia("(max-width: 1023px)").matches) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (selected) panelRef.current?.focus({ preventScroll: true });
  }, [selectedId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <section className="lg:col-span-3 bg-[#241b1d] border border-parchment/10 rounded-xl p-5 sm:p-6" aria-labelledby="subs-h">
        <h2 id="subs-h" className="font-serif text-xl mb-1">{t("subsTitle")}</h2>
        <p className="text-parchment/55 text-sm mb-4">{t("subsDesc")}</p>

        <div role="group" aria-label={t("filterLabel")} className="flex flex-wrap gap-2 mb-4 print:hidden">
          {(["all", "pending", "changes", "approved", "rejected"] as SubFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => onFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors focus-visible:outline-2 focus-visible:outline-turmeric ${
                filter === f ? "bg-turmeric text-ink border-turmeric font-medium" : "bg-white/5 border-white/10 text-parchment/75 hover:bg-white/10"
              }`}
            >
              {f === "all" ? t("filterAll") : t(STATUS_KEY[f])} <span className="tabular-nums opacity-70">{num(count(f))}</span>
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="text-parchment/55 text-sm py-8 text-center">{t("emptyQueue")}</p>
        ) : (
          <ul className="divide-y divide-parchment/5">
            {shown.map((s) => {
              const Icon = TYPE_ICON[s.type];
              const c = contributorById.get(s.contributor);
              const active = s.id === selectedId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    aria-current={active ? "true" : undefined}
                    className={`w-full text-start flex items-start gap-3 py-3 px-2 -mx-2 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-turmeric ${active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}
                  >
                    <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 grid place-items-center shrink-0">
                      <Icon className="w-4 h-4 text-turmeric" aria-hidden="true" />
                      <span className="sr-only">{t(TYPE_KEY[s.type])}</span>
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium truncate">{t(s.title)}</span>
                      <span className="block text-xs text-parchment/55 mt-0.5 truncate">
                        {c ? t(c.name) : ""} · {place(s.state)} · {date(s.date)}
                      </span>
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLE[s.status]}`}>{t(STATUS_KEY[s.status])}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <aside
        ref={panelRef}
        tabIndex={-1}
        aria-labelledby="detail-h"
        className="lg:col-span-2 bg-[#241b1d] border border-parchment/10 rounded-xl p-5 sm:p-6 lg:sticky lg:top-24 self-start outline-none"
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 id="detail-h" className="font-serif text-xl">{t("detailTitle")}</h2>
          {selected && (
            <button type="button" onClick={() => setSelectedId(null)} className="p-1.5 rounded hover:bg-white/10 print:hidden" aria-label={t("close")}>
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {!selected ? (
          <p className="text-parchment/55 text-sm">{t("selectPrompt")}</p>
        ) : (
          detail(selected)
        )}
      </aside>
    </div>
  );

  function detail(sub: Submission) {
    const c = contributorById.get(sub.contributor);
    const Icon = TYPE_ICON[sub.type];
    const rows: [string, string][] = [
      [t("colId"), sub.id],
      [t("colType"), t(TYPE_KEY[sub.type])],
      [t("colTradition"), heritageById(sub.heritageId)],
      [t("colContributor"), c ? `${t(c.name)} (${t(PERSONA_KEY[c.persona])})` : ""],
      [t("colState"), place(sub.state)],
      [t("colDate"), date(sub.date, { dateStyle: "long" })],
      [t("colSize"), t(SIZE_KEY[sub.type], { n: num(sub.size) })],
    ];
    return (
      <div>
        <div className="flex items-start gap-3 mb-4">
          <Icon className="w-5 h-5 text-turmeric mt-1 shrink-0" aria-hidden="true" />
          <div>
            <h3 className="font-serif text-lg leading-snug">{t(sub.title)}</h3>
            <span className={`inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[sub.status]}`}>{t(STATUS_KEY[sub.status])}</span>
          </div>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm mb-4">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-parchment/50">{k}</dt>
              <dd className="text-parchment/90 break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="bg-black/20 border border-white/5 rounded-lg p-3 text-sm text-parchment/75 mb-5">
          <div className="text-xs text-parchment/45 mb-1">{t("reviewerNote")}</div>
          {t(sub.note)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2 print:hidden">
          <button type="button" disabled={sub.status === "approved"} onClick={() => onAction(sub.id, "approved")} className="flex items-center justify-center gap-1.5 bg-heritage text-white px-3 py-2 rounded text-sm font-medium hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-turmeric">
            <Check className="w-4 h-4" aria-hidden="true" /> {t("approve")}
          </button>
          <button type="button" disabled={sub.status === "changes"} onClick={() => onAction(sub.id, "changes")} className="flex items-center justify-center gap-1.5 bg-white/5 border border-terracotta/50 text-terracotta px-3 py-2 rounded text-sm font-medium hover:bg-terracotta/15 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-turmeric">
            <PencilLine className="w-4 h-4" aria-hidden="true" /> {t("requestChanges")}
          </button>
          <button type="button" disabled={sub.status === "rejected"} onClick={() => onAction(sub.id, "rejected")} className="flex items-center justify-center gap-1.5 bg-alert/20 border border-alert/50 text-[#e08a6f] px-3 py-2 rounded text-sm font-medium hover:bg-alert hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-turmeric">
            <X className="w-4 h-4" aria-hidden="true" /> {t("reject")}
          </button>
        </div>
      </div>
    );
  }
}
