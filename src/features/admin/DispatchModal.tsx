import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, Send, X } from "lucide-react";
import { BAND_KEY, bandOf, type RegionRow, type Team } from "./data";
import { useAdminText } from "./useAdminText";

export interface DispatchRequest {
  state?: string;
  teamId?: string;
}

/** Modal to direct a field documentation team to a region. Mount it only while open. */
export default function DispatchModal({
  request,
  regions,
  teams,
  onClose,
  onConfirm,
}: {
  request: DispatchRequest;
  regions: RegionRow[];
  teams: Team[];
  onClose: () => void;
  /** returns the ETA in days */
  onConfirm: (teamId: string, state: string) => number;
}) {
  const { t, dir, num, place } = useAdminText();
  const titleId = useId();
  const byRisk = [...regions].sort((a, b) => b.avgHvs - a.avgHvs);
  const available = teams.filter((tm) => tm.status === "available");
  const [state, setState] = useState(request.state && regions.some((r) => r.state === request.state) ? request.state : (byRisk[0]?.state ?? ""));
  const [teamId, setTeamId] = useState(request.teamId ?? available[0]?.id ?? "");
  const [done, setDone] = useState<{ team: string; state: string; eta: number } | null>(null);
  const firstRef = useRef<HTMLSelectElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const team = teams.find((tm) => tm.id === teamId);
  const canConfirm = !!state && !!team && team.status === "available";

  const confirm = () => {
    if (!canConfirm) return;
    const eta = onConfirm(teamId, state);
    setDone({ team: t(team!.name), state: place(state), eta });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:hidden" onMouseDown={(e) => e.target === e.currentTarget && onClose()} dir={dir}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-md bg-[#241b1d] text-parchment border border-parchment/15 rounded-xl shadow-2xl p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 id={titleId} className="font-serif text-xl">{t("modalTitle")}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-white/10" aria-label={t("close")}>
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {done ? (
          <div role="status" className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-heritage mx-auto mb-3" aria-hidden="true" />
            <p className="text-parchment/90 mb-6">{t("dispatchSuccess", { team: done.team, state: done.state, days: num(done.eta) })}</p>
            <button ref={doneRef} type="button" onClick={onClose} className="bg-turmeric text-ink px-5 py-2 rounded text-sm font-medium hover:bg-parchment">
              {t("done")}
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirm();
            }}
          >
            <p className="text-sm text-parchment/60 mb-5">{t("modalDesc")}</p>
            <label className="block text-sm mb-1.5" htmlFor={`${titleId}-r`}>{t("pickRegion")}</label>
            <select
              ref={firstRef}
              id={`${titleId}-r`}
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-black/30 border border-white/15 rounded px-3 py-2 text-sm mb-4 focus-visible:outline-2 focus-visible:outline-turmeric"
            >
              {byRisk.map((r) => (
                <option key={r.state} value={r.state} className="bg-ink">
                  {place(r.state)} · {t("hvsValue", { score: num(r.avgHvs) })} ({t(BAND_KEY[bandOf(r.avgHvs)])})
                </option>
              ))}
            </select>

            <fieldset className="mb-6">
              <legend className="text-sm mb-1.5">{t("pickTeam")}</legend>
              <div className="space-y-2">
                {teams.map((tm) => {
                  const ok = tm.status === "available";
                  return (
                    <label key={tm.id} className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${teamId === tm.id ? "border-turmeric bg-turmeric/10" : "border-white/10 bg-white/[0.03]"} ${ok ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
                      <input type="radio" name="team" value={tm.id} disabled={!ok} checked={teamId === tm.id} onChange={() => setTeamId(tm.id)} className="accent-[var(--color-turmeric)]" />
                      <span className="flex-1">
                        <span className="block font-medium">{t(tm.name)}</span>
                        <span className="block text-xs text-parchment/55">
                          {place(tm.base)} · {t("teamMembers", { n: num(tm.members) })}
                          {!ok && ` · ${t(tm.status === "deployed" ? "teamDeployed" : "teamReturning")}`}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {available.length === 0 && <p className="text-xs text-alert mt-2">{t("noTeamAvailable")}</p>}
            </fieldset>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm bg-white/5 border border-white/10 hover:bg-white/10">
                {t("cancel")}
              </button>
              <button type="submit" disabled={!canConfirm} className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium bg-alert text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" aria-hidden="true" /> {t("confirmDispatch")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
